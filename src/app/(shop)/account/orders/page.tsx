import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Orders | Daveen' }

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-orange-100 text-orange-700',
  READY: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default async function AccountOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!dbUser) redirect('/sign-in')

  const orders = await prisma.order.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { select: { quantity: true, productSnapshot: true } },
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 font-playfair">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-4xl mb-4">📦</p>
          <p className="text-gray-600 font-medium">No orders yet</p>
          <Link href="/products" className="mt-4 inline-block text-sm text-brand-forest hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono font-bold text-gray-900">{order.orderNumber}</p>
                <p className="text-sm text-gray-500 mt-0.5">{formatDate(new Date(order.createdAt))}</p>
                <p className="text-xs text-gray-400 mt-1">{order.items.length} item(s)</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand-forest">{formatPrice(order.total)}</p>
                <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
