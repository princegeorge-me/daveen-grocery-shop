import {
  Html, Head, Body, Container, Section, Heading, Text, Link, Preview
} from '@react-email/components'

const STATUS_MESSAGES: Record<string, { headline: string; body: string; emoji: string }> = {
  PROCESSING: {
    emoji: '👨‍🍳',
    headline: 'We're preparing your order',
    body: 'Our team is carefully picking and packing your items.',
  },
  READY: {
    emoji: '✅',
    headline: 'Your order is ready!',
    body: 'Your order is packed and ready for pickup or dispatch.',
  },
  OUT_FOR_DELIVERY: {
    emoji: '🚗',
    headline: 'Your order is on the way!',
    body: 'A delivery driver is heading to your address right now.',
  },
  DELIVERED: {
    emoji: '🎉',
    headline: 'Order delivered!',
    body: 'Your order has been delivered. We hope you enjoy your groceries!',
  },
}

interface Props {
  orderNumber: string
  customerName: string
  status: string
  trackingUrl: string
}

export function OrderStatusEmail({ orderNumber, customerName, status, trackingUrl }: Props) {
  const msg = STATUS_MESSAGES[status] ?? {
    emoji: '📦', headline: 'Order update', body: `Your order status has been updated to ${status}.`
  }

  return (
    <Html>
      <Head />
      <Preview>{msg.emoji} {msg.headline} — Order {orderNumber}</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 480, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <Section style={{ backgroundColor: '#1A6B3C', padding: '24px 32px' }}>
            <Heading style={{ color: '#ffffff', fontSize: 20, margin: 0 }}>
              🌿 Daveen African Food &amp; Grocery
            </Heading>
          </Section>

          <Section style={{ padding: '32px', textAlign: 'center' as const }}>
            <Text style={{ fontSize: 48, margin: '0 0 16px' }}>{msg.emoji}</Text>
            <Heading as="h2" style={{ fontSize: 22, color: '#111827', marginTop: 0 }}>
              {msg.headline}
            </Heading>
            <Text style={{ color: '#374151', fontSize: 15, lineHeight: '1.6' }}>
              Hi {customerName}, {msg.body}
            </Text>
            <Text style={{ fontSize: 13, color: '#6b7280' }}>
              Order: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#111827' }}>{orderNumber}</span>
            </Text>

            <Link
              href={trackingUrl}
              style={{
                backgroundColor: '#1A6B3C', color: '#ffffff', padding: '12px 28px',
                borderRadius: 8, fontSize: 14, fontWeight: 'bold', textDecoration: 'none',
                display: 'inline-block', marginTop: 16
              }}
            >
              View Order Status
            </Link>
          </Section>

          <Section style={{ backgroundColor: '#f9fafb', padding: '16px 32px', borderTop: '1px solid #e5e7eb' }}>
            <Text style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' as const, margin: 0 }}>
              Daveen African Food &amp; Grocery · 6421 S King Dr Suite B, Chicago, IL 60637
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderStatusEmail
