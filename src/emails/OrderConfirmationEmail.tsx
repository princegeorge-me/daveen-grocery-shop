import {
  Html, Head, Body, Container, Section, Row, Column,
  Heading, Text, Hr, Link, Preview, Img
} from '@react-email/components'
import { formatPrice } from '@/utils/currency'

interface OrderItem {
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

interface Props {
  orderNumber: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  discount: number
  total: number
  orderType: 'DELIVERY' | 'PICKUP'
  etaString: string
  deliveryAddress?: {
    street1: string
    street2?: string | null
    city: string
    state: string
    zip: string
  } | null
  trackingUrl: string
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  deliveryFee,
  tax,
  discount,
  total,
  orderType,
  etaString,
  deliveryAddress,
  trackingUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your order {orderNumber} is confirmed — estimated {etaString}</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 560, margin: '40px auto', backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#1A6B3C', padding: '24px 32px' }}>
            <Heading style={{ color: '#ffffff', fontSize: 22, margin: 0, fontWeight: 'bold' }}>
              🌿 Daveen African Food &amp; Grocery
            </Heading>
          </Section>

          {/* Body */}
          <Section style={{ padding: '32px' }}>
            <Heading as="h2" style={{ fontSize: 20, color: '#111827', marginTop: 0 }}>
              Order Confirmed! ✅
            </Heading>
            <Text style={{ color: '#374151', fontSize: 15, lineHeight: '1.6' }}>
              Hi {customerName}, your order has been received and is being prepared.
            </Text>

            {/* Order meta */}
            <Section style={{ backgroundColor: '#f0fdf4', borderRadius: 8, padding: '16px', marginBottom: 24 }}>
              <Row>
                <Column>
                  <Text style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Order Number</Text>
                  <Text style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 'bold', color: '#111827', fontFamily: 'monospace' }}>
                    {orderNumber}
                  </Text>
                </Column>
                <Column>
                  <Text style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                    {orderType === 'DELIVERY' ? 'Estimated Delivery' : 'Pickup ETA'}
                  </Text>
                  <Text style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 'bold', color: '#1A6B3C' }}>
                    {etaString}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Delivery address */}
            {orderType === 'DELIVERY' && deliveryAddress && (
              <Section style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Delivering to:</Text>
                <Text style={{ fontSize: 14, color: '#374151', margin: 0 }}>
                  {deliveryAddress.street1}
                  {deliveryAddress.street2 ? `, ${deliveryAddress.street2}` : ''}<br />
                  {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zip}
                </Text>
              </Section>
            )}

            {orderType === 'PICKUP' && (
              <Section style={{ marginBottom: 24, backgroundColor: '#fffbeb', borderRadius: 8, padding: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#92400e', margin: '0 0 4px' }}>Pickup Location</Text>
                <Text style={{ fontSize: 14, color: '#92400e', margin: 0 }}>
                  6421 S King Dr Suite B, Chicago, IL 60637<br />
                  Mon–Sat 9am–8pm · Sun 10am–6pm
                </Text>
              </Section>
            )}

            {/* Items */}
            <Heading as="h3" style={{ fontSize: 15, color: '#111827', marginBottom: 8 }}>Your Items</Heading>
            <Hr style={{ borderColor: '#e5e7eb', marginBottom: 12 }} />
            {items.map((item, i) => (
              <Row key={i} style={{ marginBottom: 8 }}>
                <Column style={{ flex: 1 }}>
                  <Text style={{ margin: 0, fontSize: 14, color: '#374151' }}>
                    {item.name} × {item.quantity}
                  </Text>
                </Column>
                <Column style={{ textAlign: 'right' as const }}>
                  <Text style={{ margin: 0, fontSize: 14, fontWeight: 'bold', color: '#111827' }}>
                    {formatPrice(item.lineTotal)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={{ borderColor: '#e5e7eb', margin: '16px 0' }} />

            {/* Totals */}
            {[
              { label: 'Subtotal', value: formatPrice(subtotal) },
              ...(discount > 0 ? [{ label: 'Discount', value: `-${formatPrice(discount)}` }] : []),
              { label: 'Delivery', value: deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee) },
              { label: 'Tax (IL 10.25%)', value: formatPrice(tax) },
            ].map(({ label, value }) => (
              <Row key={label} style={{ marginBottom: 4 }}>
                <Column><Text style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{label}</Text></Column>
                <Column style={{ textAlign: 'right' as const }}><Text style={{ margin: 0, fontSize: 13, color: '#374151' }}>{value}</Text></Column>
              </Row>
            ))}

            <Row style={{ marginTop: 8 }}>
              <Column><Text style={{ margin: 0, fontSize: 16, fontWeight: 'bold', color: '#111827' }}>Total</Text></Column>
              <Column style={{ textAlign: 'right' as const }}>
                <Text style={{ margin: 0, fontSize: 16, fontWeight: 'bold', color: '#1A6B3C' }}>{formatPrice(total)}</Text>
              </Column>
            </Row>

            {/* CTA */}
            <Section style={{ textAlign: 'center' as const, marginTop: 32 }}>
              <Link
                href={trackingUrl}
                style={{
                  backgroundColor: '#1A6B3C', color: '#ffffff', padding: '12px 28px',
                  borderRadius: 8, fontSize: 14, fontWeight: 'bold', textDecoration: 'none', display: 'inline-block'
                }}
              >
                Track Your Order →
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: '#f9fafb', padding: '20px 32px', borderTop: '1px solid #e5e7eb' }}>
            <Text style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' as const, margin: 0 }}>
              Daveen African Food &amp; Grocery · 6421 S King Dr Suite B, Chicago, IL 60637<br />
              Questions? Call us at <Link href="tel:+13125550100" style={{ color: '#1A6B3C' }}>+1 (312) 555-0100</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderConfirmationEmail
