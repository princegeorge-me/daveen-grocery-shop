import { NextRequest, NextResponse } from 'next/server'
import { createClient }               from '@/lib/supabase/server'
import prisma                         from '@/lib/prisma'
import { apiSuccess, apiError }       from '@/types'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(apiError('Unauthorized', 'UNAUTHORIZED'), { status: 401 })

  const profile = await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { id: true } })
  if (!profile)  return NextResponse.json(apiError('User not found', 'NOT_FOUND'), { status: 404 })

  const orders = await prisma.order.findMany({
    where:   { userId: profile.id },
    orderBy: { createdAt: 'desc' },
    take:    20,
    include: {
      items:   { include: { product: { select: { name: true, slug: true, images: true } } } },
      payment: { select: { status: true, paymentMethod: true } },
    },
  })

  return NextResponse.json(apiSuccess(orders))
}
