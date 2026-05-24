import { z } from 'zod'

const AddressSchema = z.object({
  street1:  z.string().min(5, 'Street address required'),
  street2:  z.string().optional(),
  city:     z.string().min(2).default('Chicago'),
  state:    z.string().length(2).default('IL'),
  zip:      z.string().regex(/^\d{5}$/, 'Enter a valid 5-digit ZIP code'),
})

export const CheckoutSchema = z.object({
  orderType:           z.enum(['DELIVERY', 'PICKUP']),
  deliveryAddressId:   z.string().cuid().optional(),
  newAddress:          AddressSchema.optional(),
  specialInstructions: z.string().max(500).optional(),
  scheduledAt:         z.string().datetime({ offset: true }).optional(),
  couponCode:          z.string().max(50).optional(),
}).refine(
  (d) => d.orderType === 'PICKUP' || d.deliveryAddressId || d.newAddress,
  { message: 'Delivery requires an address', path: ['deliveryAddressId'] }
)

export const CouponValidateSchema = z.object({
  code:      z.string().min(1).max(50),
  subtotal:  z.number().int().positive(),
})

export type CheckoutInput       = z.infer<typeof CheckoutSchema>
export type CouponValidateInput = z.infer<typeof CouponValidateSchema>
