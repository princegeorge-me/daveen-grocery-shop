'use client'

import Link           from 'next/link'
import { ShoppingCart, Menu, Search, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/stores/cart.store'
import { useUIStore }   from '@/stores/ui.store'

const navLinks = [
  { label: 'Home',           href: '/' },
  { label: 'Shop',           href: '/products' },
  { label: 'About Us',       href: '/about' },
  { label: 'Order Tracking', href: '/account/orders' },
  { label: 'Contact Us',     href: '/contact' },
]

export default function Header() {
  const { itemCount, toggleCart } = useCartStore()
  const { toggleSearch }          = useUIStore()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container-shop">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-brand-forest rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-display font-bold text-brand-forest text-lg hidden sm:block">
              Daveen
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-foreground hover:text-brand-forest transition-colors pb-2 border-b-2 border-transparent hover:border-brand-forest"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={toggleSearch}
              className="p-2 hover:opacity-70 transition-opacity"
              aria-label="Search"
            >
              <Search size={20} className="text-foreground" />
            </button>

            <Link href="/account" className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity" aria-label="Account">
              <User size={20} className="text-foreground" />
              <span className="text-xs font-semibold text-foreground hidden sm:block">Account</span>
            </Link>

            <Link href="/account/wishlist" className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity" aria-label="Wishlist">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-foreground hidden sm:block">Wishlist</span>
            </Link>

            <button
              onClick={toggleCart}
              className="relative flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity"
              aria-label={`Cart — ${itemCount} items`}
            >
              <ShoppingCart size={20} className="text-foreground" />
              <span className="text-xs font-semibold text-foreground hidden sm:block">Your Cart</span>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </button>

            <button
              className="md:hidden p-2 hover:opacity-70 transition-opacity"
              aria-label="Menu"
            >
              <Menu size={20} className="text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
