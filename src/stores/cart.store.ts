import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/types'

const compute = (items: CartItem[]) => ({
  itemCount: items.reduce((s, i) => s + i.quantity, 0),
  subtotal:  items.reduce((s, i) => s + i.price * i.quantity, 0),
})

interface CartStore {
  items:      CartItem[]
  isOpen:     boolean
  itemCount:  number
  subtotal:   number
  addItem:    (item: CartItem) => void
  removeItem: (productId: string, variantId?: string | null) => void
  updateQty:  (productId: string, variantId: string | null, qty: number) => void
  clearCart:  () => void
  openCart:   () => void
  closeCart:  () => void
  toggleCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:     [],
      isOpen:    false,
      itemCount: 0,
      subtotal:  0,

      addItem(newItem) {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
          )
          const newItems = existing
            ? state.items.map((i) =>
                i.productId === newItem.productId && i.variantId === newItem.variantId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              )
            : [...state.items, newItem]
          return { items: newItems, isOpen: true, ...compute(newItems) }
        })
      },

      removeItem(productId, variantId = null) {
        set((state) => {
          const newItems = state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          )
          return { items: newItems, ...compute(newItems) }
        })
      },

      updateQty(productId, variantId, qty) {
        if (qty <= 0) { get().removeItem(productId, variantId); return }
        set((state) => {
          const newItems = state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: qty }
              : i
          )
          return { items: newItems, ...compute(newItems) }
        })
      },

      clearCart:  () => set({ items: [], itemCount: 0, subtotal: 0 }),
      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name:    'daveen-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { itemCount, subtotal } = compute(state.items)
          state.itemCount = itemCount
          state.subtotal  = subtotal
        }
      },
    }
  )
)
