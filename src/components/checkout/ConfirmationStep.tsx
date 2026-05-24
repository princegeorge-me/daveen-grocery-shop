'use client'

import Link from 'next/link'
import { CheckCircle, Package, Clock, MapPin } from 'lucide-react'
import { formatPrice } from '@/utils/currency'

interface Props {
  orderId: string
  orderNumber: string
  total: number
  etaString: string
  orderType: 'DELIVERY' | 'PICKUP'
}

export function ConfirmationStep({ orderId, orderNumber, total, etaString, orderType }: Props) {
  return (
    <div className="text-center py-6 space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-playfair">Order confirmed!</h2>
        <p className="text-gray-500 mt-1 text-sm">
          We sent a confirmation email with your receipt.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Package className="w-5 h-5 text-brand-forest flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-700">Order number</p>
            <p className="font-mono font-bold text-gray-900">{orderNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-5 h-5 text-brand-forest flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-700">Estimated {orderType === 'DELIVERY' ? 'delivery' : 'pickup'}</p>
            <p className="font-bold text-gray-900">{etaString}</p>
          </div>
        </div>
        {orderType === 'PICKUP' && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-5 h-5 text-brand-forest flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-700">Pickup location</p>
              <p className="font-bold text-gray-900">6421 S King Dr Suite B, Chicago, IL 60637</p>
            </div>
          </div>
        )}
        <div className="border-t pt-3 flex justify-between font-bold">
          <span>Total charged</span>
          <span className="text-brand-forest">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/orders/${orderId}`}
          className="px-6 py-2.5 bg-brand-forest text-white rounded-xl font-medium hover:bg-brand-forest/90 transition text-sm"
        >
          Track Order
        </Link>
        <Link
          href="/products"
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
