'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddressSchema } from '@/validations/auth.schema'
import { Loader2, MapPin, Store } from 'lucide-react'
import type { z } from 'zod'

type AddressData = z.infer<typeof AddressSchema>

interface Props {
  onComplete: (data: { type: 'DELIVERY' | 'PICKUP'; address?: AddressData; deliveryFee: number; etaString: string }) => void
}

export function DeliveryStep({ onComplete }: Props) {
  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY')
  const [zipValidating, setZipValidating] = useState(false)
  const [zipError, setZipError] = useState<string | null>(null)
  const [deliveryInfo, setDeliveryInfo] = useState<{ fee: number; eta: string } | null>(null)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<AddressData>({
    resolver: zodResolver(AddressSchema),
  })

  const zip = watch('zip')

  const validateZip = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) return
    setZipValidating(true)
    setZipError(null)
    try {
      const res = await fetch('/api/delivery/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip: zipCode, subtotal: 0 }),
      })
      const data = await res.json()
      if (!data.error && data.data?.isDeliverable) {
        setDeliveryInfo({ fee: data.data.deliveryFee, eta: data.data.etaString })
      } else {
        setZipError("Sorry, we don't deliver to this ZIP code yet.")
        setDeliveryInfo(null)
      }
    } catch {
      setZipError('Could not validate ZIP code. Please try again.')
    } finally {
      setZipValidating(false)
    }
  }

  const onSubmit = (data: AddressData) => {
    if (orderType === 'DELIVERY' && !deliveryInfo) return
    onComplete({
      type: orderType,
      address: orderType === 'DELIVERY' ? data : undefined,
      deliveryFee: orderType === 'DELIVERY' ? (deliveryInfo?.fee ?? 399) : 0,
      etaString: orderType === 'DELIVERY' ? (deliveryInfo?.eta ?? '45-75 min') : 'Ready in ~30 min',
    })
  }

  return (
    <div className="space-y-6">
      {/* Order type selector */}
      <div className="grid grid-cols-2 gap-3">
        {(['DELIVERY', 'PICKUP'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setOrderType(type)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
              orderType === type
                ? 'border-brand-forest bg-green-50 text-brand-forest'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {type === 'DELIVERY' ? <MapPin className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            <span className="font-medium text-sm">{type === 'DELIVERY' ? 'Home Delivery' : 'Store Pickup'}</span>
            <span className="text-xs opacity-70">
              {type === 'DELIVERY' ? '45–120 min' : '~30 min · Free'}
            </span>
          </button>
        ))}
      </div>

      {orderType === 'PICKUP' ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          <p className="font-semibold mb-1">Pickup Address</p>
          <p>6421 S King Dr Suite B, Chicago, IL 60637</p>
          <p className="mt-1 text-xs text-green-600">Mon–Sat 9am–8pm · Sun 10am–6pm</p>
        </div>
      ) : (
        <form id="delivery-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street address</label>
              <input
                {...register('street1')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                placeholder="123 Main St"
              />
              {errors.street1 && <p className="mt-1 text-xs text-red-600">{errors.street1.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apt / Suite <span className="text-gray-400">(optional)</span></label>
              <input
                {...register('street2')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                placeholder="Apt 2B"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  {...register('city')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  defaultValue="Chicago"
                />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  {...register('state')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  defaultValue="IL"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP code</label>
              <div className="flex gap-2">
                <input
                  {...register('zip')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  placeholder="60637"
                  maxLength={5}
                  onBlur={(e) => validateZip(e.target.value)}
                />
                {zipValidating && <Loader2 className="w-5 h-5 animate-spin text-gray-400 self-center" />}
              </div>
              {zipError && <p className="mt-1 text-xs text-red-600">{zipError}</p>}
              {deliveryInfo && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ Delivery available · ETA {deliveryInfo.eta}
                </p>
              )}
              {errors.zip && <p className="mt-1 text-xs text-red-600">{errors.zip.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery instructions <span className="text-gray-400">(optional)</span></label>
              <textarea
                {...register('label')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest resize-none"
                rows={2}
                placeholder="Leave at door, call upon arrival, etc."
              />
            </div>
          </div>
        </form>
      )}

      <button
        type={orderType === 'PICKUP' ? 'button' : 'submit'}
        form={orderType === 'DELIVERY' ? 'delivery-form' : undefined}
        onClick={orderType === 'PICKUP' ? () => onComplete({ type: 'PICKUP', deliveryFee: 0, etaString: 'Ready in ~30 min' }) : undefined}
        disabled={orderType === 'DELIVERY' && (!deliveryInfo || isSubmitting)}
        className="w-full py-3 bg-brand-forest text-white rounded-xl font-semibold hover:bg-brand-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Continue to Payment
      </button>
    </div>
  )
}
