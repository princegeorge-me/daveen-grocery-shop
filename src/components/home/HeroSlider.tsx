'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    id:            1,
    image:         '/images/banner.png',
    position:      'object-right',
    badge:         "Chicago's Premier African Grocery",
    headline:      'Authentic African Flavors,',
    highlight:     'Delivered to Your Door',
    sub:           "Shop genuine African & Caribbean groceries — staples, fresh produce, spices, frozen foods, and more. Serving Chicago's South Side.",
    cta:           { label: 'Shop Now', href: '/products' },
    cta2:          { label: 'Browse Categories', href: '/products' },
    gradient:      'linear-gradient(to right, #1A6B3C 38%, rgba(26,107,60,0.93) 52%, rgba(26,107,60,0.55) 68%, rgba(26,107,60,0.1) 85%, transparent 100%)',
    accentColor:   'text-amber-300',
  },
  {
    id:            2,
    image:         '/images/fresh_produce/hero-cabbage.jpg',
    position:      'object-center',
    badge:         '🌿 Fresh Arrivals This Week',
    headline:      'Farm-Fresh Produce,',
    highlight:     'Straight to Your Kitchen',
    sub:           'Ghana yams, unripe plantains, garden eggs and more — handpicked fresh and delivered same-day across Chicago.',
    cta:           { label: 'Shop Fresh Produce', href: '/products?category=fresh-produce' },
    cta2:          { label: 'All Categories', href: '/products' },
    gradient:      'linear-gradient(to right, #0f3d24 35%, rgba(15,61,36,0.92) 50%, rgba(15,61,36,0.55) 68%, transparent 100%)',
    accentColor:   'text-green-300',
  },
  {
    id:            3,
    image:         '/images/meat_seafoods/hero-beef.jpg',
    position:      'object-center',
    badge:         '🔥 Best Sellers',
    headline:      'Premium Meats & Seafood,',
    highlight:     'Unbeatable Freshness',
    sub:           'Goat meat, beef, catfish, crayfish and more. Quality cuts sourced fresh — the way your recipes demand.',
    cta:           { label: 'Shop Meat & Seafood', href: '/products?category=meat-seafood' },
    cta2:          { label: 'View All Deals', href: '/products?featured=true' },
    gradient:      'linear-gradient(to right, #3d1a0a 35%, rgba(61,26,10,0.92) 50%, rgba(61,26,10,0.55) 68%, transparent 100%)',
    accentColor:   'text-orange-300',
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 5500)
    return () => clearInterval(id)
  }, [next, paused])

  const slide = SLIDES[current]

  return (
    <section
      className="relative overflow-hidden min-h-[320px] md:min-h-[380px] lg:min-h-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex h-full">
        {/* ── Hero Section (75%) ── */}
        <div className="w-full lg:w-3/4 relative">
          {/* ── Slide backgrounds (cross-fade) ── */}
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === current ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image
                src={s.image}
                alt={s.headline}
                fill
                sizes="(max-width: 1024px) 100vw, 75vw"
                className={`object-cover ${s.position}`}
                priority={i === 0}
              />
              <div className="absolute inset-0" style={{ background: s.gradient }} />
              {/* Bottom vignette for mobile */}
              <div className="absolute inset-0 md:hidden" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
            </div>
          ))}

          {/* ── Content ── */}
          <div className="container-shop relative z-10 h-full py-8 md:py-12 lg:py-16 flex flex-col justify-center">
        <div className="max-w-xl lg:max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider mb-5 shadow-lg">
            {slide.badge}
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight mb-5 drop-shadow-lg">
            {slide.headline}{' '}
            <span className={slide.accentColor}>{slide.highlight}</span>
          </h1>

          {/* Sub */}
          <p className="text-white/85 text-base md:text-lg mb-8 leading-relaxed max-w-lg drop-shadow">
            {slide.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={slide.cta.href}
              className="inline-flex items-center gap-2 bg-white text-brand-forest font-bold px-7 py-3 rounded-full hover:bg-amber-400 hover:text-white transition-all shadow-xl text-sm"
            >
              {slide.cta.label} <ArrowRight size={16} />
            </Link>
            <Link
              href={slide.cta2.href}
              className="inline-flex items-center gap-2 bg-white/15 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/25 transition-all border border-white/30 backdrop-blur-sm text-sm"
            >
              {slide.cta2.label}
            </Link>
          </div>
        </div>
          </div>
        </div>

        {/* ── Promotional Products Section (25%) ── */}
        <div className="hidden lg:flex w-1/4 bg-gradient-to-b from-gray-900/20 to-gray-900/40 flex-col items-center justify-center gap-4 p-6 overflow-hidden">
          <h3 className="text-white font-bold text-sm text-center">Hot Deals</h3>
          <div className="space-y-3 w-full">
            {[
              { name: 'Fresh Yam', price: '$12.99', emoji: '🥔' },
              { name: 'Plantains', price: '$8.99', emoji: '🍌' },
              { name: 'Catfish', price: '$18.99', emoji: '🐟' },
            ].map((product, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white text-center hover:bg-white/20 transition-all cursor-pointer animate-slide-down"
                style={{ animationDelay: `${idx * 0.2}s` }}
              >
                <div className="text-2xl mb-1">{product.emoji}</div>
                <p className="text-xs font-semibold">{product.name}</p>
                <p className="text-xs text-amber-300">{product.price}</p>
              </div>
            ))}
          </div>
          <Link
            href="/products"
            className="text-white text-xs font-semibold hover:underline mt-2"
          >
            View All Deals →
          </Link>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={prev}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition backdrop-blur-sm border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition backdrop-blur-sm border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-7 h-2.5 bg-amber-400' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute top-5 right-5 z-20 text-white/60 text-xs font-medium tabular-nums hidden md:block">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>
    </section>
  )
}
