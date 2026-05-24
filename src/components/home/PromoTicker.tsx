'use client'

const ITEMS = [
  '🚚 Free delivery on orders over $75',
  '🔥 Same-day delivery — order by 2 PM',
  '⭐ 100% authentic African & Caribbean products',
  '🎁 Earn loyalty points on every purchase',
  '🌿 Fresh produce restocked every week',
  '📦 Contactless delivery available',
  '💚 Serving Chicago\'s South Side & beyond',
]

export default function PromoTicker() {
  // Double the array so the loop is seamless
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="bg-brand-forest border-b border-white/10 py-2 overflow-hidden relative">
      <div className="flex animate-marquee gap-0 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center text-white text-xs font-medium flex-shrink-0">
            {item}
            <span className="mx-8 text-white/30 select-none">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
