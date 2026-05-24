import type { Prisma } from '@prisma/client'

// ── Product types ──────────────────────────────────────────────────────────
export type ProductImage = {
  url:      string
  alt:      string
  position: number
}

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true
    variants:  true
    inventory: true
    reviews:   { where: { isApproved: true }; take: 5 }
  }
}>

export type ProductCard = Prisma.ProductGetPayload<{
  include: { category: true; inventory: true }
}>

// ── Cart types ─────────────────────────────────────────────────────────────
export type CartItem = {
  productId:  string
  variantId:  string | null
  quantity:   number
  name:       string
  slug:       string
  image:      string
  price:      number          // cents
  variantName?: string
}

export type Cart = {
  items:       CartItem[]
  subtotal:    number
  itemCount:   number
}

// ── Order types ────────────────────────────────────────────────────────────
export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items:          { include: { product: true } }
    deliveryAddress: true
    payment:        true
    coupon:         true
  }
}>

// ── Delivery types ─────────────────────────────────────────────────────────
export type DeliveryValidation = {
  valid:         boolean
  zone:          { id: string; name: string } | null
  deliveryFee:   number
  freeThreshold: number | null
  etaMin:        number
  etaMax:        number
  error?:        string
}

// ── Checkout types ─────────────────────────────────────────────────────────
export type CheckoutFormData = {
  orderType:           'DELIVERY' | 'PICKUP'
  deliveryAddressId?:  string
  newAddress?:         {
    street1:  string
    street2?: string
    city:     string
    state:    string
    zip:      string
  }
  specialInstructions?: string
  scheduledAt?:         string
  couponCode?:          string
}

// ── API response types ─────────────────────────────────────────────────────
export type ApiSuccess<T> = { data: T; error: null }
export type ApiError      = { data: null; error: string; code?: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

export function apiSuccess<T>(data: T): ApiSuccess<T> {
  return { data, error: null }
}
export function apiError(error: string, code?: string): ApiError {
  return { data: null, error, code }
}

// ── Admin types ────────────────────────────────────────────────────────────
export type DashboardKPIs = {
  revenueToday:        number
  revenueThisWeek:     number
  ordersToday:         number
  ordersThisWeek:      number
  newCustomersToday:   number
  pendingOrders:       number
  lowStockProducts:    number
  avgOrderValue:       number
}

export type RevenueChartData = {
  date:    string
  revenue: number
  orders:  number
}
