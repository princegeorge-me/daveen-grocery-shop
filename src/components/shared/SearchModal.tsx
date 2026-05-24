'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { formatPrice } from '@/utils/currency'
import { useUIStore } from '@/stores/ui.store'

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  images: any[]
  category?: { name: string } | null
}

export function SearchModal() {
  const { searchOpen, closeSearch } = useUIStore()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80)
    } else {
      setQuery('')
      setResults([])
    }
  }, [searchOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeSearch])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`)
          const data = await res.json()
          if (data.success) setResults(data.data ?? [])
        } catch {
          setResults([])
        }
      })
    }, 280)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleResultClick = (slug: string) => {
    closeSearch()
    router.push(`/products/${slug}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    closeSearch()
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                {isPending ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin flex-shrink-0" />
                ) : (
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for egusi, palm oil, crayfish…"
                  className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  className="text-gray-400 hover:text-gray-600 transition"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {results.length > 0 && (
                  <>
                    <div className="divide-y divide-gray-50">
                      {results.map((product) => {
                        const images = Array.isArray(product.images) ? product.images as any[] : []
                        const imageUrl = images[0]?.url ?? null
                        return (
                          <button
                            key={product.id}
                            onClick={() => handleResultClick(product.slug)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {imageUrl ? (
                                <Image src={imageUrl} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">🛒</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                              {product.category && (
                                <p className="text-xs text-gray-400">{product.category.name}</p>
                              )}
                            </div>
                            <p className="text-sm font-bold text-brand-forest whitespace-nowrap">
                              {formatPrice(product.price)}
                            </p>
                          </button>
                        )
                      })}
                    </div>

                    {/* See all results */}
                    <button
                      onClick={handleSearchSubmit as any}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm text-brand-forest font-medium hover:bg-green-50 transition border-t border-gray-100"
                    >
                      See all results for &ldquo;{query}&rdquo;
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {query.length >= 2 && results.length === 0 && !isPending && (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    No products found for &ldquo;{query}&rdquo;
                  </div>
                )}

                {/* Quick links when empty */}
                {query.length < 2 && (
                  <div className="px-4 py-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Popular Searches</p>
                    <div className="flex flex-wrap gap-2">
                      {['Egusi', 'Palm Oil', 'Crayfish', 'Cassava', 'Iru', 'Jollof Rice'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
