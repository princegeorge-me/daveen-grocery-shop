import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/utils/currency'
import type { Metadata } from 'next'
import { Heart } from 'lucide-react'

export const metadata: Metadata = { title: 'Wishlist | Daveen' }

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in?redirect=/account/wishlist')

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!dbUser) redirect('/sign-in')

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: dbUser.id },
    include: {
      product: {
        select: {
          id: true, name: true, slug: true, price: true, compareAtPrice: true,
          images: true, isActive: true, deletedAt: true,
          inventory: { select: { quantity: true } },
        },
      },
    },
    orderBy: { addedAt: 'desc' },
  })

  const activeItems = wishlistItems.filter(
    (i) => i.product.isActive && !i.product.deletedAt
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 font-playfair">
        Wishlist ({activeItems.length})
      </h1>

      {activeItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-600">Your wishlist is empty</p>
          <Link href="/products" className="mt-3 inline-block text-sm text-brand-forest hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeItems.map(({ id, product }) => {
            const images = Array.isArray(product.images) ? product.images as any[] : []
            const imageUrl = images[0]?.url ?? null
            const totalStock = product.inventory?.quantity ?? 0

            return (
              <Link
                key={id}
                href={`/products/${product.slug}`}
                className="flex gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={product.name} width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🛒</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-brand-forest font-bold mt-1">{formatPrice(product.price)}</p>
                  {totalStock === 0 ? (
                    <span className="text-xs text-red-500 mt-1 block">Out of stock</span>
                  ) : totalStock <= 10 ? (
                    <span className="text-xs text-amber-500 mt-1 block">Only {totalStock} left</span>
                  ) : (
                    <span className="text-xs text-green-600 mt-1 block">In stock</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
