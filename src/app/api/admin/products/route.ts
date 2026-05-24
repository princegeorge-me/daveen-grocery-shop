import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/lib/redis'
import { ProductQuerySchema } from '@/validations/product.schema'
import { apiSuccess, apiError } from '@/types'

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

  const { searchParams } = new URL(req.url)
  const query = ProductQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!query.success) return NextResponse.json(apiError('Invalid query'), { status: 400 })

  const { limit = 20, cursor, search, category, inStock, featured } = query.data

  const where: any = { deletedAt: null }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (category) where.category = { slug: category }
  if (featured !== undefined) where.isFeatured = featured
  if (inStock) {
    where.inventory = { some: { quantity: { gt: 0 } } }
  }

  const products = await prisma.product.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      inventory: { select: { quantity: true, reservedQuantity: true, lowStockThreshold: true } },
      _count: { select: { reviews: true, orderItems: true } },
    },
  })

  const hasMore = products.length > limit
  const items = hasMore ? products.slice(0, limit) : products
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  const total = await prisma.product.count({ where })

  return NextResponse.json(apiSuccess({ items, nextCursor, total }))
}
