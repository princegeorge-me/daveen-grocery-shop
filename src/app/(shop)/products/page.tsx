import type { Metadata }    from 'next'
import { Suspense }          from 'react'
import { ProductService }    from '@/services/product.service'
import { prisma }            from '@/lib/prisma'
import ProductGrid           from '@/components/product/ProductGrid'
import { SkeletonGrid }      from '@/components/shared/SkeletonCard'
import { ProductQuerySchema } from '@/validations/product.schema'

export const metadata: Metadata = {
  title: 'All Products — African & Caribbean Groceries',
}

export const revalidate = 60

async function ProductResults({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const query = ProductQuerySchema.parse({
    category: searchParams.category,
    search:   searchParams.search,
    sort:     searchParams.sort ?? 'newest',
    featured: searchParams.featured,
  })

  const { items } = await ProductService.list(query)
  return <ProductGrid products={items} emptyText="No products found. Try different filters." />
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams

  const categories = await prisma.category.findMany({
    where:   { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    select:  { id: true, name: true, slug: true },
  })

  const active = typeof params.category === 'string' ? params.category : undefined

  return (
    <div className="container-shop py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">
          {active ? categories.find(c => c.slug === active)?.name ?? 'Products' : 'All Products'}
        </h1>
        <select
          defaultValue={typeof params.sort === 'string' ? params.sort : 'newest'}
          className="text-sm border border-border rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-brand-forest outline-none"
          // Client-side sort navigation handled by component
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-8">
        <a href="/products"
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!active ? 'bg-brand-forest text-white border-brand-forest' : 'border-border text-muted-foreground hover:border-brand-forest hover:text-brand-forest'}`}>
          All
        </a>
        {categories.map(cat => (
          <a key={cat.id} href={`/products?category=${cat.slug}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${active === cat.slug ? 'bg-brand-forest text-white border-brand-forest' : 'border-border text-muted-foreground hover:border-brand-forest hover:text-brand-forest'}`}>
            {cat.name}
          </a>
        ))}
      </div>

      {/* Grid */}
      <Suspense fallback={<SkeletonGrid count={12} />}>
        <ProductResults searchParams={params} />
      </Suspense>
    </div>
  )
}
