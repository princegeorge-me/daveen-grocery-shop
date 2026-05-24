'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/utils/date'
import { formatPrice } from '@/utils/currency'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2, Clock, Package, Truck, Home, XCircle, RotateCcw
} from 'lucide-react'

const STATUS_STEPS = [
  { status: 'PENDING', label: 'Order Placed', icon: Package, color: 'text-blue-500' },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2, color: 'text-green-500' },
  { status: 'PROCESSING', label: 'Preparing', icon: Package, color: 'text-amber-500' },
  { status: 'READY', label: 'Ready', icon: Clock, color: 'text-purple-500' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, color: 'text-blue-600' },
  { status: 'DELIVERED', label: 'Delivered', icon: Home, color: 'text-green-600' },
]

const PICKUP_STEPS = [
  { status: 'PENDING', label: 'Order Placed', icon: Package, color: 'text-blue-500' },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2, color: 'text-green-500' },
  { status: 'PROCESSING', label: 'Preparing', icon: Package, color: 'text-amber-500' },
  { status: 'READY', label: 'Ready for Pickup', icon: Clock, color: 'text-purple-500' },
  { status: 'DELIVERED', label: 'Picked Up', icon: Home, color: 'text-green-600' },
]

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Processing', className: 'bg-orange-100 text-orange-700' },
  READY: { label: 'Ready', className: 'bg-purple-100 text-purple-700' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', className: 'bg-indigo-100 text-indigo-700' },
  DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'Refunded', className: 'bg-gray-100 text-gray-700' },
}

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  lineTotal: number
  product: { name: string; slug: string; images: any }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  type: 'DELIVERY' | 'PICKUP'
  subtotal: number
  deliveryFee: number
  tax: number
  discount: number
  total: number
  createdAt: string
  items: OrderItem[]
  deliveryAddress?: {
    street1: string; street2?: string; city: string; state: string; zip: string
  } | null
  payment?: { status: string } | null
}

export function OrderTracker({ order: initialOrder, userId }: { order: Order; userId: string }) {
  const [order, setOrder] = useState(initialOrder)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`order:${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...payload.new }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [order.id])

  const steps = order.type === 'PICKUP' ? PICKUP_STEPS : STATUS_STEPS
  const currentStepIndex = steps.findIndex((s) => s.status === order.status)
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'
  const badge = STATUS_BADGE[order.status]

  const getImageUrl = (images: any): string | null => {
    if (!images) return null
    const arr = Array.isArray(images) ? images : []
    return arr[0]?.url ?? null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-playfair">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Placed {formatDate(new Date(order.createdAt))}
          </p>
        </div>
        {badge && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-brand-forest transition-all duration-700"
              style={{
                width: currentStepIndex < 0
                  ? '0%'
                  : `${(currentStepIndex / (steps.length - 1)) * 100}%`,
              }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((s, i) => {
                const isDone = i <= currentStepIndex
                const isCurrent = i === currentStepIndex
                const Icon = s.icon
                return (
                  <div key={s.status} className="flex flex-col items-center gap-2" style={{ minWidth: 60 }}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isDone
                        ? 'bg-brand-forest border-brand-forest'
                        : 'bg-white border-gray-200'
                    } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                      <Icon className={`w-5 h-5 ${isDone ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <p className={`text-xs text-center leading-tight ${
                      isDone ? 'text-brand-forest font-medium' : 'text-gray-400'
                    }`}>
                      {s.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700">
          {order.status === 'REFUNDED' ? (
            <RotateCcw className="w-5 h-5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <div>
            <p className="font-semibold">
              {order.status === 'REFUNDED' ? 'Order Refunded' : 'Order Cancelled'}
            </p>
            <p className="text-sm text-red-500">
              {order.status === 'REFUNDED'
                ? 'Your refund will appear within 5–10 business days.'
                : 'This order was cancelled. If you were charged, a refund will be processed.'}
            </p>
          </div>
        </div>
      )}

      {/* Delivery address */}
      {order.type === 'DELIVERY' && order.deliveryAddress && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Delivering to</p>
          <p className="text-sm text-gray-600">
            {order.deliveryAddress.street1}
            {order.deliveryAddress.street2 && `, ${order.deliveryAddress.street2}`}
            <br />
            {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}
          </p>
        </div>
      )}

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900">Items ({order.items.length})</p>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => {
            const imageUrl = getImageUrl(item.product.images)
            return (
              <div key={item.id} className="flex gap-3 p-4">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={item.product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">🛒</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-brand-forest transition truncate block"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {formatPrice(item.lineTotal)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>{formatPrice(order.tax)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span className="text-brand-forest">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  )
}
