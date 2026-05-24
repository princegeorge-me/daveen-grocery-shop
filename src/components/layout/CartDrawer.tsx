'use client'

import Link         from 'next/link'
import Image        from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore }  from '@/stores/cart.store'
import { formatPrice }   from '@/utils/currency'
import { siteConfig }    from '@/config/site'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, itemCount } = useCartStore()

  const FREE_THRESHOLD = 5000 // $50 in cents
  const amountToFree   = Math.max(0, FREE_THRESHOLD - subtotal)
  const freeProgress   = Math.min(100, (subtotal / FREE_THRESHOLD) * 100)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-forest" />
                Your Cart
                {itemCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-brand-forest-light text-brand-forest text-xs font-bold rounded-full">
                    {itemCount}
                  </span>
                )}
              </h2>
              <button onClick={closeCart} className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {/* Free delivery bar */}
            {amountToFree > 0 && (
              <div className="px-6 py-3 bg-brand-forest-pale">
                <p className="text-sm text-brand-forest font-medium mb-2">
                  Add {formatPrice(amountToFree)} more for free delivery! 🚚
                </p>
                <div className="h-1.5 bg-brand-forest-light rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeProgress}%` }}
                    className="h-full bg-brand-forest rounded-full"
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
            {amountToFree === 0 && (
              <div className="px-6 py-2 bg-brand-forest text-white text-sm font-medium text-center">
                🎉 You qualify for free delivery!
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <ShoppingBag size={48} className="text-muted-foreground mb-4" />
                    <p className="font-semibold text-lg mb-1">Your cart is empty</p>
                    <p className="text-muted-foreground text-sm mb-6">Start shopping to add items</p>
                    <button onClick={closeCart}>
                      <Link href="/products" className="bg-brand-forest text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-forest-dark transition-colors">
                        Browse Products
                      </Link>
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.variantId}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="flex gap-3"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-snug line-clamp-1">{item.name}</p>
                        {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                        <p className="price text-sm font-semibold text-brand-forest mt-1">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                            className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="price text-sm font-semibold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                            className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                          <span className="price text-sm font-semibold ml-auto">{formatPrice(item.price * item.quantity)}</span>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors ml-1"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="price font-bold text-lg">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Tax and delivery calculated at checkout</p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-brand-forest text-white text-center py-3.5 rounded-full font-semibold hover:bg-brand-forest-dark transition-colors"
                >
                  Proceed to Checkout — {formatPrice(subtotal)}
                </Link>
                <button
                  onClick={closeCart}
                  className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
