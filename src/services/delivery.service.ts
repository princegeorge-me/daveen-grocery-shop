import { getZoneByZip } from '@/config/delivery-zones'
import type { DeliveryValidation } from '@/types'

export const DeliveryService = {
  validateZip(zip: string): DeliveryValidation {
    const zone = getZoneByZip(zip.trim())

    if (!zone) {
      return {
        valid:         false,
        zone:          null,
        deliveryFee:   0,
        freeThreshold: null,
        etaMin:        0,
        etaMax:        0,
        error: 'Sorry, we don\'t deliver to this ZIP code yet. We cover select Chicago ZIP codes.',
      }
    }

    return {
      valid:         true,
      zone:          { id: zone.id, name: zone.name },
      deliveryFee:   zone.deliveryFee,
      freeThreshold: zone.freeDeliveryThreshold,
      etaMin:        zone.estimatedMinutesMin,
      etaMax:        zone.estimatedMinutesMax,
    }
  },

  calculateDeliveryFee(zip: string, subtotal: number): number {
    const zone = getZoneByZip(zip.trim())
    if (!zone) return 0

    // Free delivery if order exceeds threshold
    if (zone.freeDeliveryThreshold && subtotal >= zone.freeDeliveryThreshold) return 0

    return zone.deliveryFee
  },

  getEtaString(zip: string): string {
    const zone = getZoneByZip(zip.trim())
    if (!zone) return 'Unavailable'
    return `${zone.estimatedMinutesMin}–${zone.estimatedMinutesMax} min`
  },
}
