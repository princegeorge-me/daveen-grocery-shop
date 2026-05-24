import type { Metadata } from 'next'
import Link from 'next/link'
import { SignUpForm } from '@/components/auth/SignUpForm'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Daveen African Food & Grocery for fast local delivery of authentic African groceries in Chicago.',
}

interface Props {
  searchParams: Promise<{ redirect?: string }>
}

export default async function SignUpPage({ searchParams }: Props) {
  const { redirect } = await searchParams

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 font-playfair">Create your account</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Earn 100 welcome points on your first order
          </p>
        </div>

        <SignUpForm redirectTo={redirect} />

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href={redirect ? `/sign-in?redirect=${encodeURIComponent(redirect)}` : '/sign-in'}
            className="text-brand-forest font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-gray-400">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="underline">Terms</Link> and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
