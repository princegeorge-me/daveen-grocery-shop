'use client'

import { useCartStore } from '@/stores/cart.store'
import Link from 'next/link'

import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/utils/currency'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, itemCount } = useCartStore()

  if (itemCount === 0) {
    return (
      <div className="container-shop py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some items to get started</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-forest text-white rounded-xl font-medium hover:bg-brand-forest/90 transition"
        >
          Browse Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const deliveryFee = subtotal >= 5000 ? 0 : 399
  const tax = Math.round(subtotal * 0.1025)
  const total = subtotal + deliveryFee + tax

  return (
    <div className="container-shop py-10">
      <h1 className="text-3xl font-bold text-gray-900 font-playfair mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={`${item.productId}-${item.variantId ?? 'default'}`}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                {/* Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🛒</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                  {item.variantName && (
                    <p className="text-xs text-gray-500">{item.variantName}</p>
                  )}
                  <p className="text-brand-forest font-bold mt-1">{formatPrice(item.price)}</p>
                </div>

                {/* Qty + Remove */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-gray-400 hover:text-red-500 transition"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                    <button
                      onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery fee</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (IL 10.25%)</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-brand-forest">{formatPrice(total)}</span>
              </div>
            </div>

            {subtotal < 5000 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
                Add {formatPrice(5000 - subtotal)} more for free delivery!
              </div>
            )}

            <Link
              href="/checkout"
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-brand-forest text-white rounded-xl font-semibold hover:bg-brand-forest/90 transition"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="mt-2 text-center text-xs text-gray-400">
              You&apos;ll need to{' '}
              <Link href="/sign-in?redirect=/checkout" className="text-brand-forest underline">
                sign in
              </Link>{' '}
              or{' '}
              <Link href="/sign-up?redirect=/checkout" className="text-brand-forest underline">
                create an account
              </Link>{' '}
              to complete your order
            </p>

            <Link
              href="/products"
              className="mt-3 w-full flex items-center justify-center py-2.5 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
