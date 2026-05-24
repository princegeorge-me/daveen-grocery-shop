import { redirect }      from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/actions/auth.actions'
import CheckoutClient     from '@/components/checkout/CheckoutClient'

export const metadata: Metadata = { title: 'Checkout — Daveen' }

export default async function CheckoutPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in?redirect=/checkout')
  }

  return <CheckoutClient />
}
