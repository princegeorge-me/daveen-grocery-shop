import Link  from 'next/link'
import { siteConfig } from '@/config/site'
import { MapPin, Phone, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0F4526] text-white mt-16">
      <div className="container-shop py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-brand-forest font-bold text-lg">D</span>
              </div>
              <span className="font-display font-bold text-xl">Daveen</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Authentic African & Caribbean groceries delivered to your door in Chicago.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4 text-brand-gold">Shop</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {['African Staples','Frozen Foods','Meat & Seafood','Spices & Seasonings','Drinks & Snacks','Fresh Produce'].map(cat => (
                <li key={cat}>
                  <Link href={`/categories/${cat.toLowerCase().replace(/[^a-z]+/g,'-')}`}
                    className="hover:text-white transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold mb-4 text-brand-gold">Help</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {[['FAQ','/faq'],['Delivery Info','/delivery'],['Track Order','/orders'],['Returns','/returns'],['Contact Us','/contact']].map(([label,href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-brand-gold">Visit Us</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex gap-2">
                <MapPin size={16} className="shrink-0 text-brand-gold mt-0.5" />
                <span>{siteConfig.address.full}</span>
              </li>
              <li className="flex gap-2">
                <Phone size={16} className="shrink-0 text-brand-gold" />
                <a href={`tel:${siteConfig.phone}`} className="hover:text-white">{siteConfig.phone}</a>
              </li>
              <li className="flex gap-2">
                <Clock size={16} className="shrink-0 text-brand-gold mt-0.5" />
                <div>
                  <p>Mon–Fri: {siteConfig.hours.weekday}</p>
                  <p>Sat: {siteConfig.hours.saturday}</p>
                  <p>Sun: {siteConfig.hours.sunday}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Daveen African Food & Grocery. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
