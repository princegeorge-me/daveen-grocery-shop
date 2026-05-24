import ProductCard    from './ProductCard'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import type { ProductCard as ProductCardType } from '@/types'

interface Props {
  products:  ProductCardType[]
  loading?:  boolean
  emptyText?: string
}

export default function ProductGrid({ products, loading, emptyText }: Props) {
  if (loading) return <SkeletonGrid count={8} />

  if (!products.length) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🥬</p>
        <p className="text-lg font-semibold text-foreground mb-1">No products found</p>
        <p className="text-muted-foreground">{emptyText ?? 'Try adjusting your search or filters.'}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
