import type { Metadata } from 'next'
import { Suspense } from 'next'
import { KPICard } from '@/components/admin/KPICard'
import { formatPrice } from '@/utils/currency'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay } from 'date-fns'
import { ShoppingCart, Users, DollarSign, TrendingUp, Package, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard' }
export const revalidate = 120 // ISR 2 minutes

async function getDashboardData() {
  const today = startOfDay(new Date())
  const last7 = subDays(today, 7)
  const last30 = subDays(today, 30)

  const [
    totalRevenue,
    revenueToday,
    totalOrders,
    ordersToday,
    totalCustomers,
    pendingOrders,
    recentOrders,
    lowStockItems,
    revenueByDay,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['CONFIRMED', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['CONFIRMED', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
        createdAt: { gte: today },
      },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        payment: { select: { status: true } },
      },
    }),
    prisma.inventory.findMany({
      where: {
        quantity: { lte: 10 },
        product: { deletedAt: null, isActive: true },
      },
      include: { product: { select: { name: true, sku: true, slug: true } } },
      take: 5,
      orderBy: { quantity: 'asc' },
    }),
    prisma.$queryRaw<{ date: string; revenue: number }[]>`
      SELECT DATE_TRUNC('day', "created_at")::date::text AS date,
             COALESCE(SUM(total), 0)::int AS revenue
      FROM orders
      WHERE "created_at" >= ${last30}
        AND status IN ('CONFIRMED','PROCESSING','READY','OUT_FOR_DELIVERY','DELIVERED')
      GROUP BY DATE_TRUNC('day', "created_at")
      ORDER BY date ASC
    `,
  ])

  return {
    totalRevenue: totalRevenue._sum.total ?? 0,
    revenueToday: revenueToday._sum.total ?? 0,
    totalOrders,
    ordersToday,
    totalCustomers,
    pendingOrders,
    recentOrders,
    lowStockItems,
    revenueByDay,
  }
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-orange-100 text-orange-700',
  READY: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back — here is what is happening today.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatPrice(data.totalRevenue)}
          subtitle={`${formatPrice(data.revenueToday)} today`}
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100"
        />
        <KPICard
          title="Total Orders"
          value={data.totalOrders.toLocaleString()}
          subtitle={`${data.ordersToday} today · ${data.pendingOrders} pending`}
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <KPICard
          title="Customers"
          value={data.totalCustomers.toLocaleString()}
          icon={<Users className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-100"
        />
        <KPICard
          title="Avg Order Value"
          value={data.totalOrders > 0 ? formatPrice(Math.round(data.totalRevenue / data.totalOrders)) : '$0'}
          icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-100"
        />
      </div>

      {/* Revenue Sparkline + Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-brand-forest hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {data.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock
            </h2>
            <Link href="/admin/inventory" className="text-sm text-brand-forest hover:underline">Manage</Link>
          </div>
          {data.lowStockItems.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              All items are well stocked
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.lowStockItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/products/${item.productId}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.product.sku}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    item.quantity === 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.quantity} left
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
