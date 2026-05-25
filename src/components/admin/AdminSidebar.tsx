'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Tag,
  Settings, LogOut, Leaf, Boxes, Menu, X
} from 'lucide-react'
import { signOut } from '@/actions/auth.actions'

const NAV_ITEMS = [
  { href: '/admin',           label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products',  label: 'Products',  icon: Package },
  { href: '/admin/orders',    label: 'Orders',    icon: ShoppingCart },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/users',     label: 'Customers', icon: Users },
  { href: '/admin/coupons',   label: 'Coupons',   icon: Tag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings',  label: 'Settings',  icon: Settings },
]

interface Props {
  user: { firstName: string; lastName: string; email: string; role: string }
}

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">Daveen</p>
            <p className="text-xs text-white/60 leading-none mt-0.5">Admin Panel</p>
          </div>
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1 rounded hover:bg-white/10 text-white/70"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-white/60 truncate">{user.email}</p>
          <span className="mt-1 inline-block text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {user.role}
          </span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-brand-forest flex items-center px-4 gap-3 shadow-md">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-white" />
          <span className="font-bold text-white text-sm">Daveen Admin</span>
        </div>
      </div>

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar: slide-in on mobile, fixed on desktop ── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-brand-forest text-white flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
