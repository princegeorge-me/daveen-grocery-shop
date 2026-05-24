import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/utils/currency'
import { formatDateTime } from '@/utils/date'

export const metadata: Metadata = { title: 'Orders' }
export const revalidate = 30

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

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      payment: { select: { status: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm">{orders.length} most recent orders</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 font-semibold text-gray-600">Order</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Customer</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Type</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Total</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Date</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3 font-mono font-medium text-gray-900">{order.orderNumber}</td>
                <td className="px-5 py-3">
                  {order.user ? (
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.user.firstName} {order.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{order.user.email}</p>
                    </div>
                  ) : <span className="text-gray-400">Guest</span>}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    order.type === 'DELIVERY' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {order.type}
                  </span>
                </td>
                <td className="px-5 py-3 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{formatDateTime(new Date(order.createdAt))}</td>
                <td className="px-5 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-brand-forest hover:underline text-xs">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
