import { describe, it, expect } from 'vitest'
import { formatPrice, formatPriceRaw, discountPercent, calculateTax, applyDiscount } from '@/utils/currency'

describe('formatPrice', () => {
  it('formats cents as USD', () => {
    expect(formatPrice(1999)).toBe('$19.99')
    expect(formatPrice(0)).toBe('$0.00')
    expect(formatPrice(100000)).toBe('$1,000.00')
  })
})

describe('discountPercent', () => {
  it('calculates correct discount percentage', () => {
    expect(discountPercent(800, 1000)).toBe(20)
    expect(discountPercent(1000, 1000)).toBe(0)
  })

  it('returns 0 when no compareAtPrice', () => {
    expect(discountPercent(800, undefined)).toBe(0)
  })
})

describe('calculateTax', () => {
  it('applies IL tax rate of 10.25%', () => {
    expect(calculateTax(10000)).toBe(1025)
    expect(calculateTax(0)).toBe(0)
  })
})

describe('applyDiscount', () => {
  it('applies PERCENTAGE coupon', () => {
    const coupon = { type: 'PERCENTAGE' as const, value: 1000 } // 10% = 1000 bps
    const result = applyDiscount(10000, coupon)
    expect(result.discount).toBe(1000)
    expect(result.total).toBe(9000)
  })

  it('applies FIXED coupon', () => {
    const coupon = { type: 'FIXED' as const, value: 500 }
    const result = applyDiscount(10000, coupon)
    expect(result.discount).toBe(500)
    expect(result.total).toBe(9500)
  })

  it('does not make total negative', () => {
    const coupon = { type: 'FIXED' as const, value: 20000 }
    const result = applyDiscount(10000, coupon)
    expect(result.total).toBe(0)
  })
})
