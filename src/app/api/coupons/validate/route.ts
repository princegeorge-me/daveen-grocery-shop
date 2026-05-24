import { NextRequest, NextResponse } from 'next/server'
import { createClient }               from '@/lib/supabase/server'
import { CouponService }              from '@/services/coupon.service'
import { CouponValidateSchema }       from '@/validations/checkout.schema'
import { apiSuccess, apiError }       from '@/types'
import prisma                         from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body   = await req.json().catch(() => ({}))
  const parsed = CouponValidateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(apiError(parsed.error.errors[0]?.message ?? 'Invalid input'), { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let userId: string | undefined
  if (user) {
    const profile = await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { id: true } })
    userId = profile?.id
  }

  const result = await CouponService.validate(parsed.data.code, parsed.data.subtotal, userId)
  if (!result.valid) {
    return NextResponse.json(apiError(result.error), { status: 400 })
  }

  return NextResponse.json(apiSuccess(result))
}
