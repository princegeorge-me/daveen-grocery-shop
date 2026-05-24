import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/utils/currency'
import { subDays, startOfDay, format } from 'date-fns'
import { KPICard } from '@/components/admin/KPICard'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, Star } from 'lucide-react'

export const metadata: Metadata = { title: 'Analytics' }
export const revalidate = 300

async function getAnalyticsData() {
  const today = startOfDay(new Date())
  const last7  = subDays(today, 7)
  const last30 = subDays(today, 30)
  const prev30 = subDays(today, 60)

  const [
    revenue30, revenuePrev30,
    orders30, ordersPrev30,
    customers30, customersPrev30,
    avgOrder30,
    revenueByDay,
    ordersByStatus,
    topProducts,
    ordersByType,
    couponUsage,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['CONFIRMED','PROCESSING','READY','OUT_FOR_DELIVERY','DELIVERED'] }, createdAt: { gte: last30 } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['CONFIRMED','PROCESSING','READY','OUT_FOR_DELIVERY','DELIVERED'] }, createdAt: { gte: prev30, lt: last30 } },
    }),
    prisma.order.count({ where: { createdAt: { gte: last30 } } }),
    prisma.order.count({ where: { createdAt: { gte: prev30, lt: last30 } } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: last30 } } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: prev30, lt: last30 } } }),
    prisma.order.aggregate({
      _avg: { total: true },
      where: { status: { in: ['CONFIRMED','PROCESSING','READY','OUT_FOR_DELIVERY','DELIVERED'] }, createdAt: { gte: last30 } },
    }),
    prisma.$queryRaw<{ date: string; revenue: number; orders: number }[]>`
      SELECT DATE_TRUNC('day', "created_at")::date::text AS date,
             COALESCE(SUM(total), 0)::int AS revenue,
             COUNT(*)::int AS orders
      FROM orders
      WHERE "created_at" >= ${last30}
        AND status IN ('CONFIRMED','PROCESSING','READY','OUT_FOR_DELIVERY','DELIVERED')
      GROUP BY DATE_TRUNC('day', "created_at")
      ORDER BY date ASC
    `,
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 8,
    }),
    prisma.order.groupBy({ by: ['type'], _count: true, where: { createdAt: { gte: last30 } } }),
    prisma.coupon.findMany({
      orderBy: { usedCount: 'desc' },
      take: 5,
      select: { code: true, usedCount: true, type: true, value: true },
    }),
  ])

  const topProductIds = topProducts.map((p) => p.productId)
  const productDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, sku: true, salesCount: true },
  })

  const pctChange = (current: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((current - prev) / prev) * 100 * 10) / 10

  return {
    kpis: {
      revenue: { value: revenue30._sum.total ?? 0, trend: pctChange(revenue30._sum.total ?? 0, revenuePrev30._sum.total ?? 0) },
      orders: { value: orders30, trend: pctChange(orders30, ordersPrev30) },
      customers: { value: customers30, trend: pctChange(customers30, customersPrev30) },
      avgOrder: { value: Math.round(avgOrder30._avg.total ?? 0), trend: 0 },
    },
    revenueByDay,
    ordersByStatus,
    topProducts: topProducts.map((p) => ({ ...p, product: productDetails.find((d) => d.id === p.productId) })),
    ordersByType,
    couponUsage,
  }
}

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData()

  const deliveryCount = data.ordersByType.find((t) => t.type === 'DELIVERY')?._count ?? 0
  const pickupCount   = data.ordersByType.find((t) => t.type === 'PICKUP')?._count ?? 0
  const totalByType   = deliveryCount + pickupCount || 1

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Last 30 days vs. prior 30 days</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Revenue (30d)"
          value={formatPrice(data.kpis.revenue.value)}
          trend={data.kpis.revenue.trend}
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100"
        />
        <KPICard
          title="Orders (30d)"
          value={data.kpis.orders.value.toLocaleString()}
          trend={data.kpis.orders.trend}
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <KPICard
          title="New Customers (30d)"
          value={data.kpis.customers.value.toLocaleString()}
          trend={data.kpis.customers.trend}
          icon={<Users className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-100"
        />
        <KPICard
          title="Avg Order Value"
          value={formatPrice(data.kpis.avgOrder.value)}
          icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-100"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Revenue & Orders (30 days)</h2>
        <RevenueChart data={data.revenueByDay} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Products by Revenue</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {data.topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-3 px-5 py-3">
                <span className="w-6 text-center text-xs font-bold text-gray-400">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.product?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{p._sum.quantity} units sold</p>
                </div>
                <p className="text-sm font-bold text-brand-forest">{formatPrice(p._sum.totalPrice ?? 0)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Side stats */}
        <div className="space-y-4">
          {/* Order type split */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Order Type (30d)</h2>
            <div className="space-y-3">
              {[
                { label: 'Delivery', count: deliveryCount, color: 'bg-blue-500' },
                { label: 'Pickup',   count: pickupCount,   color: 'bg-green-500' },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium">{count} ({Math.round((count / totalByType) * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${(count / totalByType) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Orders by Status</h2>
            <div className="space-y-2">
              {data.ordersByStatus.map((s) => (
                <div key={s.status} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{s.status.replace(/_/g, ' ').toLowerCase()}</span>
                  <span className="font-semibold text-gray-900">{s._count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top coupons */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Top Coupons</h2>
            <div className="space-y-2">
              {data.couponUsage.map((c) => (
                <div key={c.code} className="flex justify-between text-sm">
                  <span className="font-mono font-bold text-gray-700">{c.code}</span>
                  <span className="text-gray-500">{c.usedCount} uses</span>
                </div>
              ))}
              {data.couponUsage.length === 0 && (
                <p className="text-sm text-gray-400">No coupons used yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
