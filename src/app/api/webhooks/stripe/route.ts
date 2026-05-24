import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { notificationService } from '@/services/notification.service'
import { inventoryService } from '@/services/inventory.service'
import { cacheDel } from '@/lib/redis'
import { OrderStatus, PaymentStatus } from '@prisma/client'

// Stripe requires the raw body for signature verification
export const runtime = 'nodejs'

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: {
      items: true,
      user: true,
    },
  })

  if (!order) {
    console.error(`No order found for paymentIntent ${paymentIntent.id}`)
    return
  }

  // Idempotency guard — already processed
  if (order.status !== 'PENDING') return

  // 1. Update order status
  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.CONFIRMED },
  })

  // 2. Update payment record
  await prisma.payment.update({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: PaymentStatus.SUCCEEDED,
      stripeChargeId: paymentIntent.latest_charge as string | null,
    },
  })

  // 3. Deduct inventory (convert reservations to actual sales)
  try {
    await inventoryService.deductOnPayment(
      order.items.map((i) => ({ productId: i.productId, variantId: i.variantId ?? undefined, quantity: i.quantity })) as any
    )
  } catch (err) {
    // Log but don't fail — inventory can be reconciled manually
    console.error('Inventory deduction failed:', err)
  }

  // 4. Award loyalty points (1 point per dollar)
  const pointsEarned = Math.floor(order.total / 100) * 10 // 10 points per dollar
  if (pointsEarned > 0 && order.userId) {
    const user = await prisma.user.findUnique({ where: { id: order.userId } })
    if (user) {
      const newBalance = user.loyaltyPoints + pointsEarned
      await prisma.$transaction([
        prisma.user.update({
          where: { id: order.userId },
          data: { loyaltyPoints: newBalance },
        }),
        prisma.loyaltyTransaction.create({
          data: {
            userId: order.userId,
            type: 'EARN',
            points: pointsEarned,
            balanceAfter: newBalance,
            description: `Order ${order.orderNumber}`,
            orderId: order.id,
          },
        }),
      ])
    }
  }

  // 5. Increment coupon usage
  if (order.couponId) {
    await prisma.coupon.update({
      where: { id: order.couponId },
      data: { usedCount: { increment: 1 } },
    })
  }

  // 6. Send notifications
  const updatedOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: {
        include: { product: true },
      },
      user: true,
      deliveryAddress: true,
    },
  })
  if (updatedOrder?.user) {
    await notificationService.orderConfirmed(updatedOrder as any, updatedOrder.user)
  }

  // 7. Invalidate caches
  await cacheDel(`order:${order.id}`)
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { items: true },
  })

  if (!order) return
  if (order.status === 'CANCELLED') return

  // Update order + payment status
  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED },
    }),
    prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: PaymentStatus.FAILED },
    }),
  ])

  // Release inventory reservations
  try {
    await inventoryService.releaseReservation(
      order.items.map((i) => ({ productId: i.productId, variantId: i.variantId ?? undefined, quantity: i.quantity })) as any
    )
  } catch (err) {
    console.error('Inventory release failed:', err)
  }

  await cacheDel(`order:${order.id}`)
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string | null
  if (!paymentIntentId) return

  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (!payment) return

  const refundedAmount = charge.amount_refunded // total refunded in cents

  await prisma.payment.update({
    where: { stripePaymentIntentId: paymentIntentId },
    data: {
      refundedAmount,
      status: refundedAmount >= charge.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
    },
  })

  // Update order status
  await prisma.order.update({
    where: { id: payment.orderId },
    data: {
      status: refundedAmount >= charge.amount ? OrderStatus.REFUNDED : OrderStatus.CONFIRMED,
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  console.log(`Stripe webhook received: ${event.type} [${event.id}]`)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`Error processing webhook ${event.type}:`, err)
    // Return 500 so Stripe retries
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
