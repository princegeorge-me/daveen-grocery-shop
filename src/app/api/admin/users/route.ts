import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/lib/redis'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/types'
import { UserRole } from '@prisma/client'

async function requireSuperAdmin(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, role: true },
  })
  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') return null
  return dbUser
}

const UserQuerySchema = z.object({
  search: z.string().max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
})

const UpdateUserSchema = z.object({
  userId: z.string().cuid(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await authRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests'), { status: 429 })

  // Admin or SUPER_ADMIN can list users
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(apiError('Unauthorized'), { status: 401 })
  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { role: true } })
  if (!dbUser || !['ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)) {
    return NextResponse.json(apiError('Unauthorized'), { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const query = UserQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!query.success) return NextResponse.json(apiError('Invalid query'), { status: 400 })

  const { limit, cursor, search, role } = query.data

  const where: any = {}
  if (role) where.role = role
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, firstName: true, lastName: true, email: true, phone: true,
      role: true, isActive: true, loyaltyPoints: true, createdAt: true,
      _count: { select: { orders: true, reviews: true } },
    },
  })

  const hasMore = users.length > limit
  const items = hasMore ? users.slice(0, limit) : users
  const nextCursor = hasMore ? items[items.length - 1]?.id : null
  const total = await prisma.user.count({ where })

  return NextResponse.json(apiSuccess({ items, nextCursor, total }))
}

export async function PATCH(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await authRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests'), { status: 429 })

  const admin = await requireSuperAdmin(req)
  if (!admin) return NextResponse.json(apiError('Forbidden — SUPER_ADMIN only'), { status: 403 })

  const body = await req.json()
  const parsed = UpdateUserSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json(apiError('Invalid body'), { status: 400 })

  const { userId, role, isActive } = parsed.data
  const data: any = {}
  if (role !== undefined) data.role = role
  if (isActive !== undefined) data.isActive = isActive

  const updated = await prisma.user.update({ where: { id: userId }, data })

  return NextResponse.json(apiSuccess(updated))
}
