import { resend, FROM_EMAIL, FROM_NAME } from '@/lib/resend'
import { sendSMS } from '@/lib/twilio'
import { siteConfig } from '@/config/site'
import { OrderConfirmationEmail } from '@/emails/OrderConfirmationEmail'
import { OrderStatusEmail } from '@/emails/OrderStatusEmail'
import { render } from '@react-email/render'

interface OrderUser {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
}

interface OrderForNotification {
  id: string
  orderNumber: string
  status: string
  type: 'DELIVERY' | 'PICKUP'
  subtotal: number
  deliveryFee: number
  tax: number
  discount: number
  total: number
  items: Array<{
    quantity: number
    unitPrice: number
    lineTotal: number
    product: { name: string }
  }>
  deliveryAddress?: {
    street1: string
    street2?: string | null
    city: string
    state: string
    zip: string
  } | null
}

const STATUS_SMS: Record<string, string> = {
  PROCESSING: '👨‍🍳 Your Daveen order {orderNumber} is being prepared. ETA soon!',
  READY: '✅ Your Daveen order {orderNumber} is ready for {action}!',
  OUT_FOR_DELIVERY: '🚗 Your Daveen order {orderNumber} is on the way! Estimated arrival soon.',
  DELIVERED: '🎉 Your Daveen order {orderNumber} has been delivered. Enjoy!',
}

function getEtaString(order: OrderForNotification): string {
  if (order.type === 'PICKUP') return 'Ready in ~30 min'
  return '45–90 min'
}

export const notificationService = {
  async orderConfirmed(order: OrderForNotification, user: OrderUser) {
    const trackingUrl = `${siteConfig.url}/orders/${order.id}`

    // Email
    try {
      const html = await render(
        OrderConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName: user.firstName,
          items: order.items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            lineTotal: i.lineTotal,
          })),
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          tax: order.tax,
          discount: order.discount,
          total: order.total,
          orderType: order.type,
          etaString: getEtaString(order),
          deliveryAddress: order.deliveryAddress,
          trackingUrl,
        })
      )

      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: user.email,
        subject: `Order Confirmed: ${order.orderNumber} — Daveen`,
        html,
      })
    } catch (err) {
      console.error('Order confirmation email failed:', err)
    }

    // SMS
    if (user.phone) {
      const smsBody = `Hi ${user.firstName}! Your Daveen order ${order.orderNumber} is confirmed. Track: ${trackingUrl}`
      await sendSMS(user.phone, smsBody)
    }
  },

  async orderStatusUpdate(order: OrderForNotification, user: OrderUser) {
    const trackingUrl = `${siteConfig.url}/orders/${order.id}`
    const template = STATUS_SMS[order.status]

    // Email for key statuses
    if (['PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      try {
        const html = await render(
          OrderStatusEmail({
            orderNumber: order.orderNumber,
            customerName: user.firstName,
            status: order.status,
            trackingUrl,
          })
        )

        await resend.emails.send({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: user.email,
          subject: `Order Update: ${order.orderNumber} — Daveen`,
          html,
        })
      } catch (err) {
        console.error('Status update email failed:', err)
      }
    }

    // SMS
    if (user.phone && template) {
      const action = order.type === 'PICKUP' ? 'pickup' : 'delivery'
      const body = template
        .replace('{orderNumber}', order.orderNumber)
        .replace('{action}', action)
      await sendSMS(user.phone, body)
    }
  },
}
