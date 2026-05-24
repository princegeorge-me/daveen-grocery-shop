import type { Metadata }   from 'next'
import Link                  from 'next/link'
import Image                 from 'next/image'
import { Suspense }          from 'react'
import { ArrowRight, Truck, Clock, Shield, Star, Zap, Gift, ChevronRight } from 'lucide-react'
import { ProductService }    from '@/services/product.service'
import { prisma }            from '@/lib/prisma'
import ProductGrid           from '@/components/product/ProductGrid'
import { SkeletonGrid }      from '@/components/shared/SkeletonCard'
import { siteConfig }        from '@/config/site'
import HeroSlider            from '@/components/home/HeroSlider'
import PromoTicker           from '@/components/home/PromoTicker'
import { formatPrice }       from '@/utils/currency'

export const metadata: Metadata = {
  title:       `${siteConfig.name} — African & Caribbean Grocery Delivery Chicago`,
  description: siteConfig.description,
}

export const revalidate = 300

/* ─── Image map ─────────────────────────────────────────────────────────── */
const CATEGORY_IMAGES: Record<string, string> = {
  'african-staples':   '/images/staples/Neat_fufu.jpg',
  'frozen-foods':      '/images/frozen_foods/salmon.jpg',
  'meat-seafood':      '/images/meat_seafoods/goatmeat.jpg',
  'spices-seasonings': '/images/spices_seasoning/pepper.jpg',
  'drinks-snacks':     '/images/drinks_snacks/Malta-Guinness.png',
  'fresh-produce':     '/images/fresh_produce/Ghana_yam.jpg',
  'beauty-care':       '/images/beauty_care/Epiderm_Cream.jpg',
}

/* ─── Server components ─────────────────────────────────────────────────── */
async function FeaturedProducts() {
  const products = await ProductService.getFeatured(8)
  return <ProductGrid products={products} />
}

async function NewArrivals() {
  const products = await ProductService.getFeatured(4)
  return <ProductGrid products={products} />
}

async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    where:   { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: { where: { isActive: true, deletedAt: null } } } } },
  })

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className="group relative flex-none w-36 h-44 sm:w-40 sm:h-48 lg:w-auto lg:h-auto lg:aspect-[3/4] overflow-hidden rounded-2xl snap-start shadow-md hover:shadow-xl transition-all duration-300"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CATEGORY_IMAGES[cat.slug] ?? '/images/staples/Neat_fufu.jpg'}
            alt={cat.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/85 transition-colors duration-300" />
          <div className="absolute inset-0 bg-brand-forest/0 group-hover:bg-brand-forest/20 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-sm leading-tight drop-shadow">{cat.name}</p>
            <p className="text-white/70 text-xs mt-0.5">{cat._count.products} items</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

/* ─── Static data ───────────────────────────────────────────────────────── */
const TRUST_BADGES = [
  { icon: Truck,  title: 'Same-Day Delivery',   desc: 'Order by 2 PM for same-day delivery to select Chicago ZIP codes' },
  { icon: Star,   title: 'Authentic Quality',    desc: '100% genuine African & Caribbean products, no substitutes' },
  { icon: Clock,  title: 'Fresh Every Week',     desc: 'Produce and perishables restocked fresh every week' },
  { icon: Shield, title: 'Secure Checkout',      desc: 'Payments protected by 256-bit SSL encryption via Stripe' },
]

const TESTIMONIALS = [
  {
    name:    'Adaeze O.',
    origin:  'Chicago, IL',
    rating:  5,
    text:    'I\'ve been searching for a reliable African grocery store in Chicago for years. Daveen has everything I need — from fresh yam to my favorite Maggi cubes. Delivery is always on time!',
    avatar:  'AO',
  },
  {
    name:    'Kwame B.',
    origin:  'Oak Park, IL',
    rating:  5,
    text:    'The goat meat and catfish are incredibly fresh. Reminds me of home. The app is easy to use and their customer service is excellent. Highly recommend to any African in Chicago.',
    avatar:  'KB',
  },
  {
    name:    'Fatima D.',
    origin:  'Evanston, IL',
    rating:  5,
    text:    'Finally found a place that stocks proper Nigerian seasonings and spices. The quality is top-notch and prices are very fair. My whole family shops here now!',
    avatar:  'FD',
  },
]

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default async function HomePage() {
  return (
    <>
      {/* ① Announcement ticker */}
      <PromoTicker />

      {/* ② Hero slideshow */}
      <HeroSlider />

      {/* ③ Trust badge strip */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-shop py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest/10 flex items-center justify-center shrink-0">
                  <Icon size={19} className="text-brand-forest" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ④ Shop by Category */}
      <section className="container-shop py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-sm text-gray-500 mt-0.5">Everything you need, all in one place</p>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-brand-forest text-sm font-semibold hover:underline">
            All products <ChevronRight size={16} />
          </Link>
        </div>
        <Suspense fallback={
          <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-7 lg:overflow-visible">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-none w-36 h-44 lg:w-auto lg:aspect-[3/4] shimmer-bg rounded-2xl" />
            ))}
          </div>
        }>
          <CategoryGrid />
        </Suspense>
      </section>

      {/* ⑤ Dual promo banner */}
      <section className="container-shop pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Card A — Free delivery */}
          <div className="relative overflow-hidden rounded-3xl min-h-[200px] flex items-end" style={{ background: 'linear-gradient(135deg, #0f3d24 0%, #1a6b3c 60%, #2d9158 100%)' }}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-16 w-32 h-32 bg-white/5 rounded-full translate-y-1/3 pointer-events-none" />
            {/* Image inset */}
            <div className="absolute right-0 bottom-0 w-44 h-full opacity-80">
              <Image
                src="/images/fresh_produce/unriped_plantain.jpg"
                alt="Fresh plantain"
                fill
                className="object-cover object-center"
                style={{ maskImage: 'linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
              />
            </div>
            <div className="relative z-10 p-7">
              <span className="inline-block bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
                Limited Offer
              </span>
              <h3 className="text-white font-bold text-xl leading-snug mb-1">
                Free Delivery<br />on Orders Over <span className="text-amber-300">$75</span>
              </h3>
              <p className="text-white/70 text-xs mb-4">Valid for all Chicago delivery zones</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 bg-white text-brand-forest text-xs font-bold px-4 py-2 rounded-full hover:bg-amber-400 hover:text-white transition-all shadow-lg"
              >
                Shop Now <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Card B — New arrivals */}
          <div className="relative overflow-hidden rounded-3xl min-h-[200px] flex items-end" style={{ backgroundImage: 'url(/images/drinks_snacks/drinks-banner.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-16 w-32 h-32 bg-white/5 rounded-full translate-y-1/3 pointer-events-none" />
            <div className="relative z-10 p-7">
              <span className="inline-flex items-center gap-1 bg-white text-orange-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
                <Zap size={10} className="fill-orange-600" /> Hot Picks
              </span>
              <h3 className="text-white font-bold text-xl leading-snug mb-1">
                Drinks & Snacks<br /><span className="text-orange-200">You'll Love</span>
              </h3>
              <p className="text-white/70 text-xs mb-4">Malta, Milo, 7Up & all your favourites</p>
              <Link
                href="/products?category=drinks-snacks"
                className="inline-flex items-center gap-1.5 bg-white text-orange-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-orange-400 hover:text-white transition-all shadow-lg"
              >
                Explore <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ⑥ This Week's Hot Picks */}
      <section className="bg-gray-50 py-14">
        <div className="container-shop">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-2">
                <Zap size={12} className="fill-amber-600" /> Featured
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">This Week&apos;s Hot Picks</h2>
            </div>
            <Link href="/products?featured=true" className="flex items-center gap-1 text-brand-forest text-sm font-semibold hover:underline shrink-0">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <Suspense fallback={<SkeletonGrid count={8} />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* ⑦ Triple mini-promo strip */}
      <section className="container-shop py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              bg:    'bg-green-50 border-green-200',
              icon:  '🥩',
              title: 'Meats & Seafood',
              desc:  'Goat, beef, catfish & more — always fresh',
              href:  '/products?category=meat-seafood',
              cta:   'Shop now',
              textColor: 'text-green-800',
            },
            {
              bg:    'bg-amber-50 border-amber-200',
              icon:  '🌶️',
              title: 'Spices & Seasonings',
              desc:  'Suya spice, crayfish, curry blends & more',
              href:  '/products?category=spices-seasonings',
              cta:   'Shop now',
              textColor: 'text-amber-800',
            },
            {
              bg:    'bg-blue-50 border-blue-200',
              icon:  '❄️',
              title: 'Frozen Foods',
              desc:  'Flash-frozen salmon, fish & more',
              href:  '/products?category=frozen-foods',
              cta:   'Shop now',
              textColor: 'text-blue-800',
            },
          ].map(({ bg, icon, title, desc, href, cta, textColor }) => (
            <Link
              key={title}
              href={href}
              className={`group flex items-center gap-4 p-5 rounded-2xl border ${bg} hover:shadow-md transition-all`}
            >
              <span className="text-4xl">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${textColor}`}>{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-2 ${textColor} group-hover:underline`}>
                  {cta} <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ⑧ Loyalty CTA banner */}
      <section className="container-shop pb-14">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f3d24 0%, #1a6b3c 50%, #2d9158 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute top-8 right-1/3 w-24 h-24 bg-amber-400/10 rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                <Gift className="w-8 h-8 text-amber-950" />
              </div>
              <div>
                <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">Loyalty Program</p>
                <h3 className="text-white font-bold text-2xl leading-tight">
                  Earn Points, Get Rewarded 🎉
                </h3>
                <p className="text-white/70 text-sm mt-1 max-w-md">
                  Every order earns you loyalty points. Refer a friend and earn 500 bonus points.
                  Redeem for discounts on future orders.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 bg-amber-400 text-amber-950 font-bold px-7 py-3 rounded-full hover:bg-amber-300 transition shadow-xl text-sm whitespace-nowrap"
              >
                Join Free <ArrowRight size={15} />
              </Link>
              <Link
                href="/account/loyalty"
                className="inline-flex items-center justify-center gap-2 bg-white/15 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/25 transition border border-white/30 text-sm whitespace-nowrap"
              >
                View My Points
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ⑨ New arrivals */}
      <section className="bg-white py-4 pb-14">
        <div className="container-shop">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-2">
                🌿 New Arrivals
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">Just Landed</h2>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-brand-forest text-sm font-semibold hover:underline shrink-0">
              See all <ArrowRight size={15} />
            </Link>
          </div>
          <Suspense fallback={<SkeletonGrid count={4} />}>
            <NewArrivals />
          </Suspense>
        </div>
      </section>

      {/* ⑩ Testimonials */}
      <section className="bg-brand-forest-pale py-16">
        <div className="container-shop">
          <div className="text-center mb-10">
            <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
              Customer Love
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, origin, rating, text, avatar }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-brand-forest flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{origin}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑪ How it works */}
      <section className="bg-white py-16">
        <div className="container-shop text-center">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
            How It Works
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 text-gray-900">Order in Minutes. Delivered Fresh.</h2>
          <p className="text-gray-500 text-sm mb-10">Simple. Fast. Reliable.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { step: '01', emoji: '🛒', title: 'Browse & Add',       desc: 'Shop our full selection of authentic African groceries and add items to your cart.' },
              { step: '02', emoji: '💳', title: 'Checkout Securely', desc: 'Enter your delivery address and pay securely via Stripe — it takes under 2 minutes.' },
              { step: '03', emoji: '🚚', title: 'Delivered Fresh',   desc: 'We pick, pack, and deliver your order fresh to your door — same-day if ordered by 2 PM.' },
            ].map(({ step, emoji, title, desc }) => (
              <div key={step} className="relative bg-gray-50 rounded-2xl p-7 text-center border border-gray-100">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-forest text-white text-xs font-black px-3 py-0.5 rounded-full">
                  Step {step}
                </div>
                <div className="text-4xl mb-4 mt-2">{emoji}</div>
                <h3 className="font-bold text-base text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑫ Final CTA strip */}
      <section className="bg-brand-forest py-10">
        <div className="container-shop flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="text-white font-bold text-xl">Ready to taste home again?</h3>
            <p className="text-white/70 text-sm mt-0.5">Authentic African & Caribbean groceries, delivered to your door.</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-bold px-7 py-3 rounded-full hover:bg-amber-300 transition shadow-xl whitespace-nowrap text-sm"
          >
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
