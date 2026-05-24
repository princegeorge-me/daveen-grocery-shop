import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Page Not Found | Daveen' }

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-gray-100">404</p>
      <h1 className="text-2xl font-bold text-gray-900 font-playfair mt-4 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 bg-brand-forest text-white rounded-xl font-medium hover:bg-brand-forest/90 transition text-sm"
        >
          Go Home
        </Link>
        <Link
          href="/products"
          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition text-sm"
        >
          Browse Products
        </Link>
      </div>
    </div>
  )
}
