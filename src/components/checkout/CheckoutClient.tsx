'use client'

import { useState }           from 'react'
import { useCartStore }        from '@/stores/cart.store'
import { createCheckout }      from '@/actions/checkout.actions'
import { DeliveryStep }        from '@/components/checkout/DeliveryStep'
import { PaymentStep }         from '@/components/checkout/PaymentStep'
import { ConfirmationStep }    from '@/components/checkout/ConfirmationStep'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'
import type { AddressInput }   from '@/validations/auth.schema'

type AddressData = AddressInput

interface DeliveryData {
  type:        'DELIVERY' | 'PICKUP'
  address?:    AddressData
  deliveryFee: number
  etaString:   string
}

interface CheckoutState {
  clientSecret:   string
  orderId:        string
  orderNumber:    string
  subtotal:       number
  deliveryFee:    number
  tax:            number
  total:          number
  couponDiscount: number
  etaString:      string
  orderType:      'DELIVERY' | 'PICKUP'
}

type Step = 'delivery' | 'payment' | 'confirmation'

const STEPS: { id: Step; label: string }[] = [
  { id: 'delivery',     label: 'Delivery' },
  { id: 'payment',      label: 'Payment'  },
  { id: 'confirmation', label: 'Confirm'  },
]

export default function CheckoutClient() {
  const { items, subtotal, clearCart } = useCartStore()
  const [step, setStep]                = useState<Step>('delivery')
  const [checkoutState, setCheckoutState] = useState<CheckoutState | null>(null)
  const [isCreating, setIsCreating]    = useState(false)
  const [createError, setCreateError]  = useState<string | null>(null)

  const handleDeliveryComplete = async (data: DeliveryData) => {
    setIsCreating(true)
    setCreateError(null)

    try {
      const result = await createCheckout({
        items:           items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity:  i.quantity,
        })),
        orderType:       data.type,
        deliveryAddress: data.address,
        couponCode:      undefined,
      })

      if (!result.success) {
        setCreateError(result.error ?? 'Failed to create checkout')
        return
      }

      setCheckoutState({
        clientSecret:   result.data.clientSecret,
        orderId:        result.data.orderId,
        orderNumber:    result.data.orderNumber,
        subtotal:       result.data.subtotal,
        deliveryFee:    data.deliveryFee,
        tax:            result.data.tax,
        total:          result.data.total,
        couponDiscount: result.data.couponDiscount ?? 0,
        etaString:      data.etaString,
        orderType:      data.type,
      })

      setStep('payment')
    } catch {
      setCreateError('Something went wrong. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handlePaymentSuccess = (_orderId: string) => {
    clearCart()
    setStep('confirmation')
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === step)

  return (
    <div className="container-shop py-10 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 font-playfair mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const isDone    = i < currentStepIndex
          const isCurrent = i === currentStepIndex
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-sm font-medium ${
                isCurrent ? 'text-brand-forest' : isDone ? 'text-green-600' : 'text-gray-400'
              }`}>
                {isDone ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className={`w-5 h-5 ${isCurrent ? 'text-brand-forest' : 'text-gray-300'}`} />
                )}
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px w-8 ${i < currentStepIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {createError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {createError}
          </div>
        )}

        {isCreating && (
          <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-brand-forest" />
            <span>Preparing your order…</span>
          </div>
        )}

        {!isCreating && step === 'delivery' && (
          <DeliveryStep onComplete={handleDeliveryComplete} />
        )}

        {!isCreating && step === 'payment' && checkoutState && (
          <PaymentStep
            clientSecret={checkoutState.clientSecret}
            summary={{
              subtotal:       checkoutState.subtotal,
              deliveryFee:    checkoutState.deliveryFee,
              tax:            checkoutState.tax,
              total:          checkoutState.total,
              couponDiscount: checkoutState.couponDiscount,
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {step === 'confirmation' && checkoutState && (
          <ConfirmationStep
            orderId={checkoutState.orderId}
            orderNumber={checkoutState.orderNumber}
            total={checkoutState.total}
            etaString={checkoutState.etaString}
            orderType={checkoutState.orderType}
          />
        )}
      </div>
    </div>
  )
}
