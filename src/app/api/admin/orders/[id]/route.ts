import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { authRateLimit, cacheDel } from '@/lib/redis'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/types'
import { OrderStatus } from '@prisma/client'
import { notificationService } from '@/services/notification.service'

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

const UpdateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await authRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests'), { status: 429 })

  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json(apiError('Unauthorized'), { status: 401 })

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      items: {
        include: { product: { select: { name: true, slug: true, images: true } } },
      },
      deliveryAddress: true,
      payment: true,
      coupon: { select: { code: true, type: true, value: true } },
    },
  })

  if (!order) return NextResponse.json(apiError('Order not found'), { status: 404 })

  return NextResponse.json(apiSuccess(order))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await authRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests'), { status: 429 })

  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json(apiError('Unauthorized'), { status: 401 })

  const body = await req.json()
  const parsed = UpdateOrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json(apiError('Invalid status'), { status: 400 })

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true },
  })

  if (!order) return NextResponse.json(apiError('Order not found'), { status: 404 })

  const updated = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
  })

  // Send SMS notification and invalidate cache only when order is out for delivery
  if (parsed.data.status === OrderStatus.OUT_FOR_DELIVERY && order.user) {
    await notificationService.orderStatusUpdate(updated as any, order.user as any)
    await cacheDel(`order:${id}`)
  }

  return NextResponse.json(apiSuccess(updated))
}
