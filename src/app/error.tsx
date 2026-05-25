'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error('App erro:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl mb-4">⚠️</p>
      <h1 className="text-2xl font-bold text-gray-900 font-playfair mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-8 max-w-sm text-sm">
        An unexpected error occurred. Our team has been notified.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-brand-forest text-white rounded-xl font-medium hover:bg-brand-forest/90 transition text-sm"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition text-sm"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
