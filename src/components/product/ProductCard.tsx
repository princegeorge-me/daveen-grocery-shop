'use client'

import Link           from 'next/link'
import { useState }   from 'react'
import { motion }     from 'framer-motion'
import { Heart, ShoppingCart, Check, Loader2 } from 'lucide-react'
import { toast }      from 'sonner'
import { cn }         from '@/lib/utils'
import PriceDisplay   from '@/components/shared/PriceDisplay'
import { useCartStore } from '@/stores/cart.store'
import { getProductForCart } from '@/actions/cart.actions'
import type { ProductCard as ProductCardType } from '@/types'

interface Props {
  product:   ProductCardType
  className?: string
}

type ButtonState = 'idle' | 'loading' | 'added'

export default function ProductCard({ product, className }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [btnState, setBtnState] = useState<ButtonState>('idle')

  const images = Array.isArray(product.images)
    ? product.images as { url: string; alt: string }[]
    : []
  const image    = images[0]?.url ?? '/placeholder.jpg'
  const inStock  = product.inventory
    ? product.inventory.quantity - product.inventory.reservedQuantity > 0
    : true
  const isLow    = product.inventory
    ? product.inventory.quantity - product.inventory.reservedQuantity <= product.inventory.lowStockThreshold
    : false

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!inStock || btnState !== 'idle') return

    setBtnState('loading')
    const result = await getProductForCart(product.id)
    if ('error' in result) {
      toast.error(result.error)
      setBtnState('idle')
      return
    }

    addItem({ ...result, quantity: 1 })
    setBtnState('added')
    toast.success(`${product.name} added to cart`)
    setTimeout(() => setBtnState('idle'), 1500)
  }

  return (
    <motion.article
      className={cn('group bg-white rounded-2xl border border-border overflow-hidden cursor-pointer', className)}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/products/${product.slug}`}>
        {/* Image */}
        <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', overflow: 'hidden', background: '#f3f4f6' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={images[0]?.alt ?? product.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            className="group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%23f3f4f6%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%239ca3af%22 font-size=%2216%22%3ENo image%3C/text%3E%3C/svg%3E' }}
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isFeatured && (
              <span className="bg-brand-forest text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="bg-brand-gold text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                Sale
              </span>
            )}
            {!inStock && (
              <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
            {inStock && isLow && (
              <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                Low Stock
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.category.name}
          </p>
          <h3 className="font-semibold text-foreground text-base line-clamp-2 mb-2 leading-snug">
            {product.name}
          </h3>
          <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="md" className="mb-3" />
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-4 pb-4">
        <motion.button
          onClick={handleAddToCart}
          disabled={!inStock || btnState === 'loading'}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-colors',
            btnState === 'added'
              ? 'bg-brand-forest text-white'
              : !inStock
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-brand-forest-light text-brand-forest hover:bg-brand-forest hover:text-white'
          )}
          whileTap={inStock ? { scale: 0.97 } : {}}
        >
          {btnState === 'loading' && <Loader2 size={16} className="animate-spin" />}
          {btnState === 'added'   && <Check size={16} />}
          {btnState === 'idle'    && <ShoppingCart size={16} />}
          <span>
            {btnState === 'loading' ? 'Adding…' : btnState === 'added' ? 'Added!' : !inStock ? 'Out of Stock' : 'Add to Cart'}
          </span>
        </motion.button>
      </div>
    </motion.article>
  )
}
