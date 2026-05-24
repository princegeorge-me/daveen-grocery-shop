import prisma from '@/lib/prisma'
import { applyDiscount } from '@/utils/currency'

export type CouponResult =
  | { valid: true;  discount: number; couponId: string; description: string }
  | { valid: false; error: string }

export const CouponService = {
  async validate(code: string, subtotal: number, userId?: string): Promise<CouponResult> {
    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase().trim(), isActive: true },
    })

    if (!coupon) return { valid: false, error: 'Coupon code not found' }

    const now = new Date()
    if (coupon.startsAt && now < coupon.startsAt)
      return { valid: false, error: 'This coupon is not yet active' }
    if (coupon.expiresAt && now > coupon.expiresAt)
      return { valid: false, error: 'This coupon has expired' }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
      return { valid: false, error: 'This coupon has reached its usage limit' }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount)
      return { valid: false, error: `Minimum order of $${(coupon.minOrderAmount / 100).toFixed(2)} required` }

    if (userId && coupon.usesPerCustomer > 0) {
      const userUsage = await prisma.order.count({
        where: { userId, couponId: coupon.id, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      })
      if (userUsage >= coupon.usesPerCustomer)
        return { valid: false, error: 'You have already used this coupon' }
    }

    const discount = applyDiscount(subtotal, { type: coupon.type, value: coupon.value })
    const description = coupon.description ?? coupon.code

    return { valid: true, discount, couponId: coupon.id, description }
  },
}
