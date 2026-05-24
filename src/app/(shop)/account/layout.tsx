import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import { prisma }        from '@/lib/prisma'
import { signOut }       from '@/actions/auth.actions'
import Link              from 'next/link'
import Image             from 'next/image'
import { formatPrice }   from '@/utils/currency'
import { User, MapPin, Heart, Star, Package, LogOut, Sparkles, Tag } from 'lucide-react'

const NAV_LINKS = [
  { href: '/account',           label: 'Profile',        icon: User,    exact: true },
  { href: '/account/orders',    label: 'Orders',         icon: Package },
  { href: '/account/addresses', label: 'Addresses',      icon: MapPin },
  { href: '/account/wishlist',  label: 'Wishlist',       icon: Heart },
  { href: '/account/loyalty',   label: 'Loyalty Points', icon: Star },
]

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in?redirect=/account')

  const [dbUser, promoProducts] = await Promise.all([
    prisma.user.findUnique({
      where:  { supabaseId: user.id },
      select: { firstName: true, lastName: true, email: true, loyaltyPoints: true },
    }),
    prisma.product.findMany({
      where:   { isActive: true, deletedAt: null },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take:    3,
      select:  { id: true, name: true, slug: true, price: true, compareAtPrice: true, images: true },
    }),
  ])

  if (!dbUser) redirect('/sign-in')

  return (
    <div className="container-shop py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── Sidebar ── */}
        <aside className="lg:col-span-1 space-y-4">

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-12 h-12 bg-brand-forest rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
              {dbUser.firstName[0]}{dbUser.lastName[0]}
            </div>
            <p className="font-semibold text-gray-900">{dbUser.firstName} {dbUser.lastName}</p>
            <p className="text-sm text-gray-500 truncate">{dbUser.email}</p>
            <div className="mt-3 flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
              <Star className="w-4 h-4" />
              <span className="font-semibold">{dbUser.loyaltyPoints.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Nav + sign out */}
          <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-0.5">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-forest transition"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            <div className="border-t border-gray-100 mt-1 pt-1">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </form>
            </div>
          </nav>

          {/* ── Promo: New Arrivals ── */}
          {promoProducts.length > 0 && (
            <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: 'linear-gradient(145deg, #0f3d24 0%, #1a6b3c 50%, #2d9158 100%)' }}>

              {/* Decorative top banner */}
              <div className="relative px-4 pt-5 pb-4">
                {/* Glow blobs */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-300/20 rounded-full blur-xl pointer-events-none" />

                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  Hot Picks
                </div>

                <p className="text-white font-extrabold text-base leading-tight">
                  Don&apos;t Miss<br />
                  <span className="text-amber-300">These Deals 🔥</span>
                </p>
                <p className="text-white/60 text-xs mt-1">Fresh picks just for you</p>
              </div>

              {/* Product cards */}
              <div className="px-3 pb-3 space-y-2">
                {promoProducts.map((p, idx) => {
                  const images     = Array.isArray(p.images) ? p.images as any[] : []
                  const imgUrl     = images[0]?.url ?? null
                  const hasDiscount = p.compareAtPrice && p.compareAtPrice > p.price
                  const isFirst    = idx === 0

                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className={`flex items-center gap-3 rounded-xl p-2.5 transition-all group
                        ${isFirst
                          ? 'bg-white/20 hover:bg-white/30 ring-1 ring-white/30'
                          : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      {/* Image */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center text-xl">🛒</div>
                        )}
                        {isFirst && (
                          <span className="absolute top-1 left-1 bg-amber-400 text-amber-950 text-[9px] font-black px-1 py-0.5 rounded uppercase leading-none">
                            New
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold leading-snug truncate group-hover:text-amber-200 transition-colors">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-amber-300 text-sm font-extrabold">{formatPrice(p.price)}</span>
                          {hasDiscount && (
                            <span className="text-white/40 text-xs line-through">{formatPrice(p.compareAtPrice!)}</span>
                          )}
                        </div>
                        {hasDiscount && (
                          <span className="inline-block text-[10px] bg-red-500/80 text-white font-bold px-1.5 py-0.5 rounded mt-0.5">
                            SALE
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* CTA */}
              <div className="px-3 pb-4">
                <Link
                  href="/products"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs transition-all
                    bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-lg shadow-amber-900/30 hover:shadow-amber-400/30"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Shop All Deals
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* ── Content ── */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  )
}
