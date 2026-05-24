import Header      from '@/components/layout/Header'
import Footer      from '@/components/layout/Footer'
import CartDrawer  from '@/components/layout/CartDrawer'
import { SearchModal } from '@/components/shared/SearchModal'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <SearchModal />
      <CartDrawer />
      <main id="main-content" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
    </>
  )
}
