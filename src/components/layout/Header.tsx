'use client'

import Link           from 'next/link'
import { ShoppingCart, Menu, Search, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/stores/cart.store'
import { useUIStore }   from '@/stores/ui.store'

const navLinks = [
  { label: 'Shop',       href: '/products' },
  { label: 'Categories', href: '/products' },
  { label: 'Deals',      href: '/products?featured=true' },
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
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-brand-forest transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSearch}
              className="p-2 rounded-full hover:bg-brand-forest-pale transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-foreground" />
            </button>

            <Link href="/account" className="p-2 rounded-full hover:bg-brand-forest-pale transition-colors" aria-label="Account">
              <User size={20} className="text-foreground" />
            </Link>

            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full hover:bg-brand-forest-pale transition-colors"
              aria-label={`Cart — ${itemCount} items`}
            >
              <ShoppingCart size={20} className="text-foreground" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-forest text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </button>

            <button
              className="md:hidden p-2 rounded-full hover:bg-brand-forest-pale transition-colors"
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
