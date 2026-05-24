import { NextRequest, NextResponse } from 'next/server'
import { z }                          from 'zod'
import { checkoutRateLimit }          from '@/lib/redis'
import { createCheckout }             from '@/actions/checkout.actions'
import { CheckoutSchema }             from '@/validations/checkout.schema'
import { apiSuccess, apiError }       from '@/types'

const BodySchema = z.object({
  checkout:  CheckoutSchema,
  cartItems: z.array(z.object({
    productId:  z.string(),
    variantId:  z.string().nullable(),
    quantity:   z.number().int().positive(),
    name:       z.string(),
    slug:       z.string(),
    image:      z.string(),
    price:      z.number().int(),
    variantName:z.string().optional(),
  })),
})

export async function POST(req: NextRequest) {
  const ip = req.ip ?? 'anon'
  const { success } = await checkoutRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests', 'RATE_LIMIT'), { status: 429 })

  const body   = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(apiError(parsed.error.errors[0]?.message ?? 'Invalid input'), { status: 400 })
  }

  const result = await createCheckout(parsed.data.checkout, parsed.data.cartItems)
  if ('error' in result) {
    return NextResponse.json(apiError(result.error), { status: 400 })
  }

  return NextResponse.json(apiSuccess(result))
}
