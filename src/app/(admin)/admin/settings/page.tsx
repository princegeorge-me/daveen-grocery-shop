import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = { title: 'Settings' }

export default async function AdminSettingsPage() {
  const [productCount, orderCount, customerCount, couponCount] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.coupon.count({ where: { isActive: true } }),
  ])

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Store configuration and system info</p>
      </div>

      {/* Store Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-lg">Store Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Store Name', value: siteConfig.name },
            { label: 'Phone', value: siteConfig.phone },
            { label: 'Address', value: '6421 S King Dr Suite B, Chicago, IL 60637' },
            { label: 'Hours (Mon–Sat)', value: '9:00 AM – 8:00 PM' },
            { label: 'Hours (Sun)', value: '10:00 AM – 6:00 PM' },
            { label: 'Same-Day Cutoff', value: '2:00 PM' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="font-medium text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Database Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 text-lg mb-4">Database Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Products', value: productCount },
            { label: 'Orders', value: orderCount },
            { label: 'Customers', value: customerCount },
            { label: 'Active Coupons', value: couponCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-brand-forest">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Loyalty Config */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-900 text-lg">Loyalty Program</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Points per $1 spent', value: `${siteConfig.loyaltyPointsPerDollar} pts` },
            { label: 'Redemption rate', value: '100 pts = $1' },
            { label: 'Welcome bonus', value: '100 pts' },
            { label: 'Referral bonus', value: '500 pts' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="font-medium text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Zones */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 text-lg mb-4">Delivery Zones</h2>
        <div className="space-y-3 text-sm">
          {[
            { zone: 'Zone 1 — Woodlawn / Hyde Park', zips: '60637, 60615, 60619, 60649', fee: '$3.99', free: '$50+', eta: '45–75 min' },
            { zone: 'Zone 2 — South Side Extended', zips: '60620, 60621, 60628, 60636…', fee: '$5.99', free: '$75+', eta: '60–90 min' },
            { zone: 'Zone 3 — Greater Chicago', zips: '40 ZIP codes', fee: '$8.99', free: '$100+', eta: '90–120 min' },
          ].map(({ zone, zips, fee, free, eta }) => (
            <div key={zone} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{zone}</p>
                <p className="text-gray-500 text-xs mt-0.5">{zips}</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-medium">{fee} · Free {free}</p>
                <p className="text-gray-400">{eta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
