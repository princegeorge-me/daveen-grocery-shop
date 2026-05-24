import { NextRequest, NextResponse } from 'next/server'
import { createClient }               from '@/lib/supabase/server'
import prisma                         from '@/lib/prisma'
import { apiSuccess, apiError }       from '@/types'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id }   = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 })

  const profile = await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { id: true, role: true } })
  if (!profile)  return NextResponse.json(apiError('User not found'), { status: 404 })

  const order = await prisma.order.findFirst({
    where: {
      id,
      // Non-admins can only see their own orders
      ...(profile.role === 'CUSTOMER' && { userId: profile.id }),
    },
    include: {
      items:           { include: { product: true } },
      deliveryAddress: true,
      payment:         true,
      coupon:          true,
    },
  })

  if (!order) return NextResponse.json(apiError('Order not found', 'NOT_FOUND'), { status: 404 })
  return NextResponse.json(apiSuccess(order))
}
