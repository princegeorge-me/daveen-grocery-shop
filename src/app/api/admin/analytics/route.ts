import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { authRateLimit, cacheGet, cacheSet } from '@/lib/redis'
import { apiSuccess, apiError } from '@/types'
import { subDays, startOfDay, format } from 'date-fns'

async function requireAdmin(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, role: true },
  })
  if (!dbUser || !['ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)) return null
  return dbUser
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await authRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests'), { status: 429 })

  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json(apiError('Unauthorized'), { status: 401 })

  const cacheKey = 'admin:analytics:dashboard'
  const cached = await cacheGet(cacheKey)
  if (cached) return NextResponse.json(apiSuccess(cached))

  const now = new Date()
  const today = startOfDay(now)
  const last30 = subDays(today, 30)
  const last7 = subDays(today, 7)

  // KPIs
  const [
    totalRevenue,
    revenueToday,
    revenueThisWeek,
    totalOrders,
    ordersToday,
    totalCustomers,
    newCustomersThisWeek,
    avgOrderValue,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['CONFIRMED', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['CONFIRMED', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
        createdAt: { gte: today },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['CONFIRMED', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
        createdAt: { gte: last7 },
      },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: last7 } } }),
    prisma.order.aggregate({
      _avg: { total: true },
      where: { status: { in: ['CONFIRMED', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'] } },
    }),
  ])

  // Revenue chart — last 30 days
  const revenueByDay = await prisma.$queryRaw<{ date: string; revenue: number; orders: number }[]>`
    SELECT
      DATE_TRUNC('day', "createdAt")::date::text AS date,
      COALESCE(SUM(total), 0)::int AS revenue,
      COUNT(*)::int AS orders
    FROM orders
    WHERE "createdAt" >= ${last30}
      AND status IN ('CONFIRMED','PROCESSING','READY','OUT_FOR_DELIVERY','DELIVERED')
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date ASC
  `

  // Top products
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true, totalPrice: true },
    orderBy: { _sum: { totalPrice: 'desc' } },
    take: 5,
  })
  const topProductIds = topProducts.map((p) => p.productId)
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, slug: true, images: true },
  })
  const topProductsEnriched = topProducts.map((p) => ({
    ...p,
    product: topProductDetails.find((d) => d.id === p.productId),
  }))

  // Low stock alerts
  const lowStock = await prisma.inventory.findMany({
    where: {
      product: { deletedAt: null, isActive: true },
      quantity: { lte: prisma.inventory.fields.lowStockThreshold },
    },
    include: {
      product: { select: { id: true, name: true, sku: true, slug: true } },
    },
    take: 10,
    orderBy: { quantity: 'asc' },
  })

  // Order status breakdown
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
    where: { createdAt: { gte: last30 } },
  })

  const data = {
    kpis: {
      totalRevenue: totalRevenue._sum.total ?? 0,
      revenueToday: revenueToday._sum.total ?? 0,
      revenueThisWeek: revenueThisWeek._sum.total ?? 0,
      totalOrders,
      ordersToday,
      totalCustomers,
      newCustomersThisWeek,
      avgOrderValue: Math.round(avgOrderValue._avg.total ?? 0),
    },
    revenueChart: revenueByDay,
    topProducts: topProductsEnriched,
    lowStockAlerts: lowStock,
    ordersByStatus,
  }

  await cacheSet(cacheKey, data, 120) // cache 2 minutes

  return NextResponse.json(apiSuccess(data))
}
