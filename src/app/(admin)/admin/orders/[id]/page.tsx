import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/utils/currency'
import { formatDateTime } from '@/utils/date'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id }, select: { orderNumber: true } })
  return { title: order ? `Order ${order.orderNumber}` : 'Order Not Found' }
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-orange-100 text-orange-700',
  READY: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { name: true, slug: true, images: true } },
          variant: { select: { name: true } },
        },
      },
      deliveryAddress: true,
      payment: true,
      coupon: { select: { code: true, type: true, value: true } },
    },
  })

  if (!order) notFound()

  const badge = STATUS_BADGE[order.status]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">{formatDateTime(new Date(order.createdAt))}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {badge && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge}`}>
              {order.status}
            </span>
          )}
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: items + payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-900">
              Items ({order.items.length})
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => {
                const images = Array.isArray(item.product.images) ? item.product.images as any[] : []
                const imageUrl = images[0]?.url ?? null
                const snapshot = item.productSnapshot as any

                return (
                  <div key={item.id} className="flex gap-3 p-4">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={item.product.name} width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.product.name}</p>
                      {item.variant && <p className="text-xs text-gray-500">{item.variant.name}</p>}
                      <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment */}
          {order.payment && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Payment</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">{order.payment.status}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Intent</p>
                  <p className="font-mono text-xs text-gray-700 truncate">{order.payment.stripePaymentIntentId}</p>
                </div>
                {order.payment.stripeChargeId && (
                  <div>
                    <p className="text-gray-500">Charge ID</p>
                    <p className="font-mono text-xs text-gray-700 truncate">{order.payment.stripeChargeId}</p>
                  </div>
                )}
                {order.payment.refundedAmount > 0 && (
                  <div>
                    <p className="text-gray-500">Refunded</p>
                    <p className="font-medium text-red-600">{formatPrice(order.payment.refundedAmount)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column: customer, address, totals */}
        <div className="space-y-6">
          {/* Customer */}
          {order.user && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-900">{order.user.firstName} {order.user.lastName}</p>
                <p className="text-gray-600">{order.user.email}</p>
                {order.user.phone && <p className="text-gray-600">{order.user.phone}</p>}
              </div>
              <Link
                href={`/admin/users?search=${order.user.email}`}
                className="mt-3 text-xs text-brand-forest hover:underline"
              >
                View customer →
              </Link>
            </div>
          )}

          {/* Delivery */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">
              {order.type === 'DELIVERY' ? 'Delivery Address' : 'Pickup Order'}
            </h2>
            {order.type === 'DELIVERY' && order.deliveryAddress ? (
              <div className="text-sm text-gray-700 space-y-0.5">
                <p>{order.deliveryAddress.street1}</p>
                {order.deliveryAddress.street2 && <p>{order.deliveryAddress.street2}</p>}
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">6421 S King Dr Suite B<br />Chicago, IL 60637</p>
            )}
          </div>

          {/* Totals */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Order Total</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.coupon && `(${order.coupon.code})`}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-brand-forest">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
