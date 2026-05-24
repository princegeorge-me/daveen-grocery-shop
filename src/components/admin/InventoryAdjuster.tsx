'use client'

import { useState, useTransition } from 'react'
import { Plus, Minus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  inventoryId: string
  productId: string
  variantId?: string
  currentQty: number
}

export function InventoryAdjuster({ inventoryId, productId, variantId, currentQty }: Props) {
  const router = useRouter()
  const [delta, setDelta] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (delta === 0) return
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/inventory', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, variantId, adjustment: delta }),
        })
        const data = await res.json()
        if (data.success) {
          setSaved(true)
          setDelta(0)
          setTimeout(() => { setSaved(false); router.refresh() }, 1500)
        }
      } catch {
        // silently fail
      }
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setDelta((d) => d - 1)}
        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
      >
        <Minus className="w-3 h-3 text-gray-600" />
      </button>
      <span className={`w-8 text-center text-xs font-bold ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-gray-500'}`}>
        {delta > 0 ? `+${delta}` : delta === 0 ? '0' : delta}
      </span>
      <button
        onClick={() => setDelta((d) => d + 1)}
        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
      >
        <Plus className="w-3 h-3 text-gray-600" />
      </button>
      {delta !== 0 && (
        <button
          onClick={handleSave}
          disabled={isPending}
          className="ml-1 px-2 py-1 bg-brand-forest text-white rounded text-xs font-medium hover:bg-brand-forest/90 disabled:opacity-50 transition flex items-center gap-1"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? '✓' : 'Save'}
        </button>
      )}
    </div>
  )
}
