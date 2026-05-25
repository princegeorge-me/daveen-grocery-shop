'use client'

import { useState, useTransition } from 'react'
import { Loader2, ChevronDown } from 'lucide-react'

const ALL_STATUSES = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'READY',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED',
]

interface Props {
  orderId: string
  currentStatus: string
}

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleUpdate = () => {
    if (status === currentStatus) return
    setError(null)
    setSaved(false)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        const data = await res.json()
        if (data.error) {
          setError(data.error ?? 'Update failed')
        } else {
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        }
      } catch {
        setError('Network error')
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-forest"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      <button
        onClick={handleUpdate}
        disabled={isPending || status === currentStatus}
        className="px-4 py-2 bg-brand-forest text-white rounded-lg text-sm font-medium hover:bg-brand-forest/90 disabled:opacity-50 transition flex items-center gap-1.5"
      >
        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {saved ? '✓ Saved' : 'Update'}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
