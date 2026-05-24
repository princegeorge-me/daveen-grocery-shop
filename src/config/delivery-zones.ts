export interface DeliveryZoneConfig {
  id: string
  name: string
  zipCodes: string[]
  minOrderAmount: number   // cents
  deliveryFee: number      // cents
  freeDeliveryThreshold: number | null  // cents
  estimatedMinutesMin: number
  estimatedMinutesMax: number
}

export const DELIVERY_ZONES: DeliveryZoneConfig[] = [
  {
    id: 'zone-woodlawn',
    name: 'Woodlawn / Hyde Park',
    zipCodes: ['60637', '60615', '60619', '60649'],
    minOrderAmount: 2000,
    deliveryFee: 399,
    freeDeliveryThreshold: 5000,
    estimatedMinutesMin: 45,
    estimatedMinutesMax: 75,
  },
  {
    id: 'zone-south-side',
    name: 'South Side Extended',
    zipCodes: ['60620', '60621', '60628', '60636', '60652', '60653'],
    minOrderAmount: 2500,
    deliveryFee: 599,
    freeDeliveryThreshold: 7500,
    estimatedMinutesMin: 60,
    estimatedMinutesMax: 90,
  },
  {
    id: 'zone-greater-chicago',
    name: 'Greater Chicago',
    zipCodes: ['60601','60602','60603','60604','60605','60606','60607','60608','60609','60610','60611','60612','60613','60614','60616','60617','60618','60622','60623','60624','60625','60626','60629','60630','60631','60632','60633','60634','60638','60639','60640','60641','60642','60643','60644','60645','60646','60647','60648','60651'],
    minOrderAmount: 3500,
    deliveryFee: 899,
    freeDeliveryThreshold: 10000,
    estimatedMinutesMin: 90,
    estimatedMinutesMax: 120,
  },
]

export function getZoneByZip(zip: string): DeliveryZoneConfig | null {
  return DELIVERY_ZONES.find(z => z.zipCodes.includes(zip)) ?? null
}
