'use client'

import { useState } from 'react'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/stores/cart.store'
import { getProductForCart } from '@/actions/cart.actions'

interface Props {
  productId: string
  inStock:   boolean
}

type State = 'idle' | 'loading' | 'added'

export default function AddToCartButton({ productId, inStock }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [state, setState] = useState<State>('idle')

  async function handleClick() {
    if (!inStock || state !== 'idle') return
    setState('loading')

    const result = await getProductForCart(productId)
    if ('error' in result) {
      toast.error(result.error)
      setState('idle')
      return
    }

    addItem({ ...result, quantity: 1 })
    setState('added')
    toast.success(`${result.name} added to cart!`)
    setTimeout(() => setState('idle'), 1500)
  }

  return (
    <button
      onClick={handleClick}
      disabled={!inStock || state === 'loading'}
      className={`w-full py-4 rounded-full font-semibold text-base flex items-center justify-center gap-2 transition-colors ${
        !inStock
          ? 'bg-muted text-muted-foreground cursor-not-allowed'
          : state === 'added'
          ? 'bg-brand-forest text-white'
          : 'bg-brand-forest text-white hover:bg-brand-forest-dark'
      }`}
    >
      {state === 'loading' && <Loader2 size={18} className="animate-spin" />}
      {state === 'added'   && <Check size={18} />}
      {state === 'idle'    && <ShoppingCart size={18} />}
      {!inStock ? 'Out of Stock' : state === 'loading' ? 'Adding…' : state === 'added' ? 'Added!' : 'Add to Cart'}
    </button>
  )
}
