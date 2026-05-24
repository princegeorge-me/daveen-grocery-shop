import { cn }             from '@/lib/utils'
import { formatPrice }    from '@/utils/currency'
import { discountPercent } from '@/utils/currency'

interface PriceDisplayProps {
  price:          number
  compareAtPrice?: number | null
  size?:          'sm' | 'md' | 'lg' | 'xl'
  className?:     string
}

const sizeMap = {
  sm: { price: 'text-base', compare: 'text-xs', badge: 'text-xs' },
  md: { price: 'text-xl',   compare: 'text-sm', badge: 'text-xs' },
  lg: { price: 'text-2xl',  compare: 'text-sm', badge: 'text-sm' },
  xl: { price: 'text-3xl',  compare: 'text-base',badge: 'text-sm' },
}

export default function PriceDisplay({ price, compareAtPrice, size = 'md', className }: PriceDisplayProps) {
  const sizes    = sizeMap[size]
  const discount = compareAtPrice ? discountPercent(price, compareAtPrice) : 0

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className={cn('price font-bold text-foreground', sizes.price)}>
        {formatPrice(price)}
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <>
          <span className={cn('price text-muted-foreground line-through', sizes.compare)}>
            {formatPrice(compareAtPrice)}
          </span>
          <span className={cn('font-bold text-brand-gold', sizes.badge)}>
            {discount}% OFF
          </span>
        </>
      )}
    </div>
  )
}
