import type { Metadata } from 'next'
import Link from 'next/link'
import { Leaf } from 'lucide-react'

export const metadata: Metadata = {
  title: { template: '%s | Daveen African Food & Grocery', default: 'Account | Daveen' },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-brand-forest font-bold text-xl">
          <div className="w-8 h-8 bg-brand-forest rounded-full flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          Daveen
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} Daveen African Food &amp; Grocery.{' '}
          <Link href="/privacy" className="underline hover:text-brand-forest">Privacy</Link>
          {' · '}
          <Link href="/terms" className="underline hover:text-brand-forest">Terms</Link>
        </p>
      </footer>
    </div>
  )
}
