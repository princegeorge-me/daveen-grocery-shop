import type { Metadata } from 'next'
import Link from 'next/link'
import { SignInForm } from '@/components/auth/SignInForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Daveen account to manage orders, track deliveries, and more.',
}

interface Props {
  searchParams: Promise<{ redirect?: string; error?: string }>
}

export default async function SignInPage({ searchParams }: Props) {
  const { redirect, error } = await searchParams

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 font-playfair">Welcome back</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your account</p>
        </div>

        {error === 'unauthorized' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            You must be signed in to access that page.
          </div>
        )}

        <SignInForm redirectTo={redirect} />

        <div className="mt-6 text-center space-y-3">
          <Link
            href="/forgot-password"
            className="text-sm text-brand-forest hover:underline"
          >
            Forgot your password?
          </Link>
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-brand-forest font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
