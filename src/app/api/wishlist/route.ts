import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/lib/redis'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/types'

const ToggleSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
})

async function getDbUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return prisma.user.findUnique({ where: { supabaseId: user.id }, select: { id: true } })
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await authRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests'), { status: 429 })

  const dbUser = await getDbUser()
  if (!dbUser) return NextResponse.json(apiError('Unauthorized'), { status: 401 })

  const items = await prisma.wishlistItem.findMany({
    where: { userId: dbUser.id },
    include: {
      product: {
        select: {
          id: true, name: true, slug: true, price: true, compareAtPrice: true,
          images: true, isActive: true, deletedAt: true,
          inventory: { select: { quantity: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(apiSuccess(items))
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await authRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests'), { status: 429 })

  const dbUser = await getDbUser()
  if (!dbUser) return NextResponse.json(apiError('Unauthorized'), { status: 401 })

  const body = await req.json()
  const parsed = ToggleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json(apiError('Invalid body'), { status: 400 })

  const { productId, variantId } = parsed.data

  // Toggle: if exists remove, else add
  const existing = await prisma.wishlistItem.findFirst({
    where: { userId: dbUser.id, productId, variantId: variantId ?? null },
  })

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } })
    return NextResponse.json(apiSuccess({ added: false }))
  } else {
    await prisma.wishlistItem.create({
      data: { userId: dbUser.id, productId, variantId },
    })
    return NextResponse.json(apiSuccess({ added: true }))
  }
}
