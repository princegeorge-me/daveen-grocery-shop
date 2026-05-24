import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/utils/date'
import type { Metadata } from 'next'
import { Star, TrendingUp, Gift } from 'lucide-react'

export const metadata: Metadata = { title: 'Loyalty Points | Daveen' }

const TIERS = [
  { name: 'Bronze', min: 0, max: 999, color: 'text-amber-700', bg: 'bg-amber-100' },
  { name: 'Silver', min: 1000, max: 4999, color: 'text-gray-600', bg: 'bg-gray-100' },
  { name: 'Gold', min: 5000, max: 9999, color: 'text-amber-500', bg: 'bg-amber-50' },
  { name: 'Platinum', min: 10000, max: Infinity, color: 'text-purple-600', bg: 'bg-purple-100' },
]

export default async function LoyaltyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in?redirect=/account/loyalty')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, loyaltyPoints: true, firstName: true },
  })
  if (!dbUser) redirect('/sign-in')

  const transactions = await prisma.loyaltyTransaction.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { order: { select: { orderNumber: true } } },
  })

  const points = dbUser.loyaltyPoints
  const currentTier = TIERS.findLast((t) => points >= t.min) ?? TIERS[0]!
  const nextTier = TIERS.find((t) => t.min > points)
  const progressToNext = nextTier
    ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 font-playfair">Loyalty Points</h1>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-brand-forest to-brand-forest/80 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm">Your balance</p>
            <p className="text-4xl font-bold mt-1">{points.toLocaleString()}</p>
            <p className="text-white/70 text-sm mt-0.5">points</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentTier.bg} ${currentTier.color}`}>
            {currentTier.name}
          </span>
        </div>

        {nextTier && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>{currentTier.name}</span>
              <span>{nextTier.name} at {nextTier.min.toLocaleString()} pts</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-gold rounded-full transition-all"
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
            <p className="text-xs text-white/60 mt-1">
              {(nextTier.min - points).toLocaleString()} more points to {nextTier.name}
            </p>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, title: 'Earn', desc: '10 points per $1 spent on every order' },
          { icon: Gift, title: 'Redeem', desc: '100 points = $1 off your next order' },
          { icon: Star, title: 'Tier Up', desc: 'Unlock exclusive perks at Silver, Gold & Platinum' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon className="w-5 h-5 text-brand-forest" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{title}</p>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-900">
          Point History
        </div>

        {transactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            No transactions yet. Place your first order to earn points!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{txn.description}</p>
                  {txn.order && (
                    <p className="text-xs text-gray-400 font-mono">{txn.order.orderNumber}</p>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(new Date(txn.createdAt))}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${txn.type === 'EARN' ? 'text-green-600' : 'text-red-500'}`}>
                    {txn.type === 'EARN' ? '+' : '-'}{txn.points.toLocaleString()} pts
                  </p>
                  <p className="text-xs text-gray-400">
                    Balance: {txn.balanceAfter.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
