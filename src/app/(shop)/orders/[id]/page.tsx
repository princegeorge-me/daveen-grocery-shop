import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { OrderTracker } from '@/components/orders/OrderTracker'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `Order #${id.slice(0, 8).toUpperCase()} | Daveen` }
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/sign-in?redirect=/orders/${id}`)

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!dbUser) redirect('/sign-in')

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { name: true, slug: true, images: true } } },
      },
      deliveryAddress: true,
      payment: { select: { status: true, stripeChargeId: true } },
    },
  })

  if (!order) notFound()

  // Customers can only view their own orders
  if (dbUser.role === 'CUSTOMER' && order.userId !== dbUser.id) notFound()

  return (
    <div className="container-shop py-10 max-w-3xl">
      <OrderTracker order={order as any} userId={dbUser.id} />
    </div>
  )
}
