import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/utils/date'
import { formatPrice } from '@/utils/currency'
import { Users } from 'lucide-react'

export const metadata: Metadata = { title: 'Customers' }
export const revalidate = 60

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      _count: { select: { orders: true, reviews: true } },
      orders: {
        where: { status: { in: ['CONFIRMED','PROCESSING','READY','OUT_FOR_DELIVERY','DELIVERED'] } },
        select: { total: true },
      },
    },
  })

  const totalRevenue = (user: typeof users[0]) =>
    user.orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm">{users.length} most recent</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
          <Users className="w-4 h-4" />
          <span className="font-semibold text-gray-900">{users.length}</span> customers shown
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 font-semibold text-gray-600">Customer</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Phone</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Orders</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Lifetime Value</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Loyalty Pts</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Joined</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-forest/10 rounded-full flex items-center justify-center text-brand-forest font-bold text-xs flex-shrink-0">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600 text-xs">{user.phone ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className="font-semibold text-gray-900">{user._count.orders}</span>
                  {user._count.reviews > 0 && (
                    <span className="ml-2 text-xs text-gray-400">· {user._count.reviews} reviews</span>
                  )}
                </td>
                <td className="px-5 py-3 font-semibold text-brand-forest">
                  {formatPrice(totalRevenue(user))}
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {user.loyaltyPoints.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {formatDate(new Date(user.createdAt))}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
