import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { Tag, CheckCircle, XCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Coupons' }

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <p className="text-sm text-gray-500">{coupons.length} total</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 font-semibold text-gray-600">Code</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Type</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Value</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Min Order</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Uses</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Expires</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    coupon.type === 'PERCENTAGE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {coupon.type}
                  </span>
                </td>
                <td className="px-5 py-3 font-semibold">
                  {coupon.type === 'PERCENTAGE'
                    ? `${(coupon.value / 100).toFixed(0)}%`
                    : coupon.type === 'FIXED_SHIPPING'
                    ? 'Free Shipping'
                    : formatPrice(coupon.value)}
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : '—'}
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {coupon.usedCount}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {coupon.endsAt ? formatDate(new Date(coupon.endsAt)) : 'Never'}
                </td>
                <td className="px-5 py-3">
                  {coupon.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
