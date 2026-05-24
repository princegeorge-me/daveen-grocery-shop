import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Order Confirmed | Daveen' }

// Stripe redirects here after 3D Secure with ?payment_intent=pi_xxx&redirect_status=succeeded
interface Props {
  searchParams: Promise<{
    payment_intent?: string
    redirect_status?: string
  }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { payment_intent, redirect_status } = await searchParams

  // If payment failed, redirect back to checkout
  if (redirect_status && redirect_status !== 'succeeded') {
    redirect('/checkout?error=payment_failed')
  }

  return (
    <div className="container-shop py-20 max-w-md text-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 font-playfair mb-3">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 text-sm mb-2">
          Thank you for your order. We sent a confirmation email with your receipt.
        </p>
        {payment_intent && (
          <p className="text-xs text-gray-400 font-mono mb-8">
            Ref: {payment_intent.slice(0, 20)}…
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/account/orders"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-forest text-white rounded-xl font-medium hover:bg-brand-forest/90 transition text-sm"
          >
            View My Orders <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
