import { describe, it, expect } from 'vitest'
import { deliveryService } from '@/services/delivery.service'

describe('deliveryService.validateZip', () => {
  it('validates a Zone 1 ZIP code', () => {
    const result = deliveryService.validateZip('60637')
    expect(result.isDeliverable).toBe(true)
    expect(result.zone?.name).toContain('Woodlawn')
  })

  it('returns not deliverable for unknown ZIP', () => {
    const result = deliveryService.validateZip('99999')
    expect(result.isDeliverable).toBe(false)
  })

  it('handles 5-digit ZIP with spaces', () => {
    const result = deliveryService.validateZip(' 60615 ')
    expect(result.isDeliverable).toBe(true)
  })
})

describe('deliveryService.calculateDeliveryFee', () => {
  it('applies free delivery when subtotal meets threshold', () => {
    const zone = deliveryService.validateZip('60637').zone!
    const fee = deliveryService.calculateDeliveryFee(zone, 5001) // above $50 threshold
    expect(fee).toBe(0)
  })

  it('charges delivery fee below threshold', () => {
    const zone = deliveryService.validateZip('60637').zone!
    const fee = deliveryService.calculateDeliveryFee(zone, 2000)
    expect(fee).toBe(zone.deliveryFee)
  })
})
