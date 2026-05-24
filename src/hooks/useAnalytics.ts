'use client'

import { usePostHog } from 'posthog-js/react'
import { useCallback } from 'react'

type EventProperties = Record<string, string | number | boolean | null | undefined>

export function useAnalytics() {
  const posthog = usePostHog()

  const track = useCallback(
    (event: string, properties?: EventProperties) => {
      posthog?.capture(event, properties)
    },
    [posthog]
  )

  const identify = useCallback(
    (userId: string, properties?: EventProperties) => {
      posthog?.identify(userId, properties)
    },
    [posthog]
  )

  const reset = useCallback(() => {
    posthog?.reset()
  }, [posthog])

  return { track, identify, reset }
}

// Pre-defined event helpers
export const ANALYTICS_EVENTS = {
  // Product
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
  PRODUCT_REMOVED_FROM_CART: 'product_removed_from_cart',
  PRODUCT_WISHLISTED: 'product_wishlisted',

  // Cart
  CART_OPENED: 'cart_opened',
  CART_CHECKOUT_STARTED: 'cart_checkout_started',

  // Checkout
  CHECKOUT_DELIVERY_COMPLETED: 'checkout_delivery_completed',
  CHECKOUT_PAYMENT_STARTED: 'checkout_payment_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  CHECKOUT_FAILED: 'checkout_failed',

  // Search
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_RESULT_CLICKED: 'search_result_clicked',

  // User
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  COUPON_APPLIED: 'coupon_applied',
} as const
