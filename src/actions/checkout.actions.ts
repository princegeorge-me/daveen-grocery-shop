'use server'

import prisma               from '@/lib/prisma'
import { stripe }           from '@/lib/stripe'
import { getCurrentUser }   from '@/actions/auth.actions'
import { CouponService }    from '@/services/coupon.service'
import { DeliveryService }  from '@/services/delivery.service'
import { calculateTax }     from '@/utils/currency'
import type { AddressInput } from '@/validations/auth.schema'

interface CheckoutItem {
  productId: string
  variantId: string | null | undefined
  quantity:  number
}

interface CreateCheckoutInput {
  items:            CheckoutItem[]
  orderType:        'DELIVERY' | 'PICKUP'
  deliveryAddress?: AddressInput
  couponCode?:      string
}

type CheckoutSuccess = {
  success:       true
  data: {
    clientSecret:   string
    orderId:        string
    orderNumber:    string
    subtotal:       number
    tax:            number
    deliveryFee:    number
    total:          number
    couponDiscount: number
  }
}

type CheckoutError = { success: false; error: string }

export async function createCheckout(
  input: CreateCheckoutInput
): Promise<CheckoutSuccess | CheckoutError> {
  const { items, orderType, deliveryAddress, couponCode } = input

  // 1. Auth
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Please sign in to continue' }
  if (!items || items.length === 0) return { success: false, error: 'Your cart is empty' }

  // 2. Validate & price from DB (never trust client prices)
  const productIds = items.map((i) => i.productId)
  const dbProducts = await prisma.product.findMany({
    where:  { id: { in: productIds }, isActive: true, deletedAt: null },
    select: { id: true, price: true, name: true, images: true, slug: true },
  })
  const priceMap = Object.fromEntries(dbProducts.map((p) => [p.id, p.price]))

  const subtotal = items.reduce((sum, item) => {
    const price = priceMap[item.productId]
    if (!price) return sum
    return sum + price * item.quantity
  }, 0)

  if (subtotal === 0) return { success: false, error: 'Could not calculate order total' }

  // 3. Coupon
  let discount = 0
  let couponId: string | undefined
  if (couponCode) {
    try {
      const couponResult = await CouponService.validate(couponCode, subtotal, user.id)
      if (couponResult.valid) {
        discount = couponResult.discount
        couponId = couponResult.couponId
      }
    } catch { /* ignore coupon errors */ }
  }

  // 4. Delivery fee
  let deliveryFee = 0
  let deliveryAddressId: string | undefined

  if (orderType === 'DELIVERY') {
    if (deliveryAddress) {
      const newAddr = await prisma.address.create({
        data: {
          userId:    user.id,
          street1:   deliveryAddress.street1,
          street2:   deliveryAddress.street2 ?? null,
          city:      deliveryAddress.city,
          state:     deliveryAddress.state,
          zip:       deliveryAddress.zip,
          label:     deliveryAddress.label ?? 'Home',
          isDefault: deliveryAddress.isDefault ?? false,
        },
      })
      deliveryAddressId = newAddr.id
      deliveryFee = DeliveryService.calculateDeliveryFee(
        deliveryAddress.zip,
        subtotal - discount
      )
    }
  }

  // 5. Tax (Illinois 10.25%)
  const tax   = calculateTax(subtotal - discount + deliveryFee)
  const total = subtotal - discount + deliveryFee + tax

  // 6. Order number
  const count = await prisma.order.count()
  const year  = new Date().getFullYear()
  const orderNumber = `DAV-${year}-${String(count + 1).padStart(4, '0')}`

  // 7. Stripe PaymentIntent
  let paymentIntent: Awaited<ReturnType<typeof stripe.paymentIntents.create>>
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.max(total, 50),   // Stripe minimum 50 cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { userId: user.id, orderNumber },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe error'
    return { success: false, error: `Payment setup failed: ${msg}` }
  }

  // 8. Create Order
  try {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId:               user.id,
        type:                 orderType,
        status:               'PENDING',
        subtotal,
        tax,
        deliveryFee,
        discount,
        total,
        couponId:             couponId ?? null,
        deliveryAddressId:    deliveryAddressId ?? null,
        stripePaymentIntentId: paymentIntent.id,
        items: {
          create: items.map((item) => {
            const dbProduct = dbProducts.find((p) => p.id === item.productId)
            const images = Array.isArray(dbProduct?.images)
              ? dbProduct!.images as { url: string }[]
              : []
            return {
              productId:  item.productId,
              variantId:  item.variantId ?? null,
              quantity:   item.quantity,
              unitPrice:  priceMap[item.productId] ?? 0,
              totalPrice: (priceMap[item.productId] ?? 0) * item.quantity,
              productSnapshot: {
                name:  dbProduct?.name ?? '',
                slug:  dbProduct?.slug ?? '',
                image: images[0]?.url ?? '',
              },
            }
          }),
        },
        payment: {
          create: {
            userId:               user.id,
            amount:               total,
            currency:             'usd',
            status:               'PENDING',
            stripePaymentIntentId: paymentIntent.id,
          },
        },
      },
    })

    return {
      success: true,
      data: {
        clientSecret:   paymentIntent.client_secret!,
        orderId:        order.id,
        orderNumber:    order.orderNumber,
        subtotal,
        tax,
        deliveryFee,
        total,
        couponDiscount: discount,
      },
    }
  } catch (e) {
    // Cancel the payment intent if order creation fails
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {})
    const msg = e instanceof Error ? e.message : 'Database error'
    return { success: false, error: `Order creation failed: ${msg}` }
  }
}
