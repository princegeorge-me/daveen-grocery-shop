import { NextRequest, NextResponse } from 'next/server'
import { z }                          from 'zod'
import { DeliveryService }            from '@/services/delivery.service'
import { apiSuccess, apiError }       from '@/types'

const Schema = z.object({
  zip:      z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
  subtotal: z.coerce.number().int().min(0).optional().default(0),
})

export async function POST(req: NextRequest) {
  const body   = await req.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(apiError(parsed.error.errors[0]?.message ?? 'Invalid input'), { status: 400 })
  }

  const { zip, subtotal } = parsed.data
  const validation = DeliveryService.validateZip(zip)

  if (!validation.valid) {
    return NextResponse.json(apiSuccess({
      isDeliverable: false,
      deliveryFee:   0,
      etaString:     '',
      error:         validation.error,
    }))
  }

  // Calculate actual fee based on subtotal
  const deliveryFee = subtotal > 0
    ? DeliveryService.calculateDeliveryFee(zip, subtotal)
    : validation.deliveryFee   // return zone's base fee when subtotal unknown

  const etaString = `${validation.etaMin}–${validation.etaMax} min`

  return NextResponse.json(apiSuccess({
    isDeliverable: true,
    deliveryFee,
    etaString,
    zone:          validation.zone,
    freeThreshold: validation.freeThreshold,
  }))
}
