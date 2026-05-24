import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Account | Daveen' }

export default async function AccountProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      firstName: true, lastName: true, email: true, phone: true,
      loyaltyPoints: true, referralCode: true, createdAt: true,
      _count: { select: { orders: true, reviews: true } },
    },
  })
  if (!dbUser) redirect('/sign-in')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 font-playfair">My Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">First Name</p>
            <p className="font-medium text-gray-900">{dbUser.firstName}</p>
          </div>
          <div>
            <p className="text-gray-500">Last Name</p>
            <p className="font-medium text-gray-900">{dbUser.lastName}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{dbUser.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-900">{dbUser.phone ?? 'Not set'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: dbUser._count.orders },
          { label: 'Reviews', value: dbUser._count.reviews },
          { label: 'Loyalty Points', value: dbUser.loyaltyPoints.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-bold text-brand-forest">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {dbUser.referralCode && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <p className="font-semibold text-green-800 mb-1">Your Referral Code</p>
          <p className="text-sm text-green-700 mb-3">Share this code and earn 500 points for every friend who orders!</p>
          <div className="inline-flex items-center gap-2 bg-white border border-green-300 rounded-xl px-4 py-2">
            <span className="font-mono font-bold text-green-800 text-lg">{dbUser.referralCode}</span>
          </div>
        </div>
      )}
    </div>
  )
}
