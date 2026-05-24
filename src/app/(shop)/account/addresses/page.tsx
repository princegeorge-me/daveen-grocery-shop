import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { MapPin, Star } from 'lucide-react'

export const metadata: Metadata = { title: 'My Addresses | Daveen' }

export default async function AddressesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in?redirect=/account/addresses')

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!dbUser) redirect('/sign-in')

  const addresses = await prisma.address.findMany({
    where: { userId: dbUser.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 font-playfair">My Addresses</h1>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-600">No saved addresses</p>
          <p className="text-sm text-gray-400 mt-1">
            Addresses are saved automatically when you place a delivery order.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${addr.isDefault ? 'border-brand-forest' : 'border-gray-100'}`}>
              {addr.isDefault && (
                <div className="flex items-center gap-1.5 text-xs text-brand-forest font-semibold mb-2">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Default
                </div>
              )}
              {addr.label && (
                <p className="font-semibold text-gray-900 text-sm mb-1">{addr.label}</p>
              )}
              <p className="text-sm text-gray-700">{addr.street1}</p>
              {addr.street2 && <p className="text-sm text-gray-700">{addr.street2}</p>}
              <p className="text-sm text-gray-700">{addr.city}, {addr.state} {addr.zip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
