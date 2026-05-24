'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2, Tag, X } from 'lucide-react'
import { formatPrice } from '@/utils/currency'

// Load Stripe.js lazily — publishable key is safe on the client
const getStripeJs = () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutSummary {
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  couponDiscount: number
  couponId?: string
}

interface Props {
  clientSecret: string
  summary: CheckoutSummary
  onSuccess: (orderId: string) => void
}

function PaymentForm({ summary, onSuccess }: Omit<Props, 'clientSecret'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponMessage(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.toUpperCase(), subtotal: summary.subtotal }),
      })
      const data = await res.json()
      if (data.success && data.data.valid) {
        setCouponMessage({ type: 'success', text: `${data.data.description} applied!` })
      } else {
        setCouponMessage({ type: 'error', text: data.data?.error ?? 'Invalid coupon code' })
      }
    } catch {
      setCouponMessage({ type: 'error', text: 'Could not validate coupon' })
    } finally {
      setCouponLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? 'Payment failed')
      setProcessing(false)
      return
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed')
      setProcessing(false)
    } else if (paymentIntent?.status === 'succeeded') {
      // Get order ID from metadata
      const orderId = paymentIntent.metadata?.orderId ?? ''
      onSuccess(orderId)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Coupon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Coupon code</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
              placeholder="WELCOME10"
              maxLength={20}
            />
          </div>
          <button
            type="button"
            onClick={applyCoupon}
            disabled={couponLoading || !couponCode.trim()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition"
          >
            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
          </button>
        </div>
        {couponMessage && (
          <p className={`mt-1 text-xs ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {couponMessage.text}
          </p>
        )}
      </div>

      {/* Order breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(summary.subtotal)}</span>
        </div>
        {summary.couponDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(summary.couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          <span>{summary.deliveryFee === 0 ? 'FREE' : formatPrice(summary.deliveryFee)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>{formatPrice(summary.tax)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span className="text-brand-forest">{formatPrice(summary.total)}</span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment details</label>
        <div className="border border-gray-200 rounded-xl p-4">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 bg-brand-forest text-white rounded-xl font-semibold hover:bg-brand-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {processing && <Loader2 className="w-4 h-4 animate-spin" />}
        {processing ? 'Processing payment…' : `Pay ${formatPrice(summary.total)}`}
      </button>

      <p className="text-center text-xs text-gray-400">
        🔒 Secured by Stripe · Your card details are never stored on our servers
      </p>
    </form>
  )
}

export function PaymentStep({ clientSecret, summary, onSuccess }: Props) {
  const [stripePromise] = useState(() => getStripeJs())

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1A6B3C',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentForm summary={summary} onSuccess={onSuccess} />
    </Elements>
  )
}
