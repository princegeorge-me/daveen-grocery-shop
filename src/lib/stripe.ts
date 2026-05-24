import Stripe from 'stripe'

// Lazy singleton — prevents crash at build time when STRIPE_SECRET_KEY is not set
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    _stripe = new Stripe(key, { apiVersion: '2024-10-28.acacia', typescript: true })
  }
  return _stripe
}

// Proxy keeps all existing `stripe.xxx` call sites working without changes
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop]
  },
})
