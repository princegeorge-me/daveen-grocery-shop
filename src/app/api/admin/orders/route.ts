import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/lib/redis'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/types'
import { OrderStatus } from '@prisma/client'

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

const OrderQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  type: z.enum(['DELIVERY', 'PICKUP']).optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await authRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests'), { status: 429 })

  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json(apiError('Unauthorized'), { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = OrderQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!query.success) return NextResponse.json(apiError('Invalid query'), { status: 400 })

  const { limit, cursor, status, type, search, from, to } = query.data

  const where: any = {}
  if (status) where.status = status
  if (type) where.type = type
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  const orders = await prisma.order.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      items: { select: { id: true, quantity: true, unitPrice: true, productSnapshot: true } },
      payment: { select: { status: true, stripeChargeId: true } },
      deliveryAddress: true,
    },
  })

  const hasMore = orders.length > limit
  const items = hasMore ? orders.slice(0, limit) : orders
  const nextCursor = hasMore ? items[items.length - 1]?.id : null
  const total = await prisma.order.count({ where })

  return NextResponse.json(apiSuccess({ items, nextCursor, total }))
}
