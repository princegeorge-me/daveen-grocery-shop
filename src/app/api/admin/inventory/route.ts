import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/lib/redis'
import { z } from 'zod'
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

const AdjustSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  adjustment: z.number().int(), // positive = add stock, negative = remove
  reason: z.string().max(255).optional(),
})

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await authRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests'), { status: 429 })

  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json(apiError('Unauthorized'), { status: 401 })

  const { searchParams } = new URL(req.url)
  const lowOnly = searchParams.get('lowStock') === 'true'

  const inventory = await prisma.inventory.findMany({
    where: lowOnly
      ? {
          product: { deletedAt: null, isActive: true },
          quantity: { lte: 10 }, // simplified threshold
        }
      : { product: { deletedAt: null } },
    include: {
      product: {
        select: { id: true, name: true, sku: true, slug: true, images: true, category: { select: { name: true } } },
      },
      variant: { select: { id: true, name: true, sku: true } },
    },
    orderBy: { quantity: 'asc' },
  })

  return NextResponse.json(apiSuccess(inventory))
}

export async function PATCH(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await authRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests'), { status: 429 })

  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json(apiError('Unauthorized'), { status: 401 })

  const body = await req.json()
  const parsed = AdjustSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json(apiError('Invalid body'), { status: 400 })

  const { productId, variantId, adjustment } = parsed.data

  const inv = await prisma.inventory.findFirst({
    where: variantId ? { variantId } : { productId, variantId: null },
  })

  if (!inv) return NextResponse.json(apiError('Inventory record not found'), { status: 404 })

  const newQuantity = inv.quantity + adjustment
  if (newQuantity < 0) return NextResponse.json(apiError('Cannot reduce below 0'), { status: 400 })

  const updated = await prisma.inventory.update({
    where: { id: inv.id },
    data: { quantity: newQuantity },
  })

  return NextResponse.json(apiSuccess(updated))
}
