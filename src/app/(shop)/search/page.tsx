import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ProductService } from '@/services/product.service'
import ProductGrid from '@/components/product/ProductGrid'
import { SkeletonGrid } from '@/components/shared/SkeletonCard'
import { Search } from 'lucide-react'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `"${q}" — Search | Daveen` : 'Search | Daveen',
  }
}

async function SearchResults({ query }: { query: string }) {
  if (!query.trim()) return null

  const results = await ProductService.search(query, 24)

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">
        {results.length === 0
          ? `No results for "${query}"`
          : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
      </p>
      {results.length > 0 ? (
        <ProductGrid products={results as any} />
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-gray-600 font-medium">No products found</p>
          <p className="text-gray-400 text-sm mt-1">
            Try a different search term or browse our{' '}
            <a href="/products" className="text-brand-forest hover:underline">full catalog</a>.
          </p>
        </div>
      )}
    </div>
  )
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams

  return (
    <div className="container-shop py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-playfair flex items-center gap-3">
          <Search className="w-7 h-7 text-brand-forest" />
          Search
        </h1>
        {q && (
          <p className="text-gray-500 mt-1">
            Showing results for <span className="font-semibold text-gray-900">"{q}"</span>
          </p>
        )}
      </div>

      <Suspense fallback={<SkeletonGrid count={8} />}>
        <SearchResults query={q} />
      </Suspense>
    </div>
  )
}
