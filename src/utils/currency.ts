export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function formatPriceRaw(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function discountPercent(price: number, compareAt: number): number {
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export function calculateTax(subtotal: number, rate = 0.1025): number {
  return Math.round(subtotal * rate)
}

export function applyDiscount(subtotal: number, coupon: {
  type:  'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'
  value: number
}): number {
  if (coupon.type === 'PERCENTAGE') {
    return Math.round(subtotal * (coupon.value / 10000))  // value in basis points
  }
  if (coupon.type === 'FIXED') {
    return Math.min(coupon.value, subtotal)
  }
  return 0
}
