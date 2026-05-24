import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/utils/currency'
import Image from 'next/image'
import Link from 'next/link'
import { Package, AlertTriangle } from 'lucide-react'
import { InventoryAdjuster } from '@/components/admin/InventoryAdjuster'

export const metadata: Metadata = { title: 'Inventory' }
export const revalidate = 60

export default async function AdminInventoryPage() {
  const inventory = await prisma.inventory.findMany({
    where: { product: { deletedAt: null, isActive: true } },
    include: {
      product: {
        select: { id: true, name: true, sku: true, slug: true, images: true, price: true,
          category: { select: { name: true } } },
      },
      variant: { select: { id: true, name: true, sku: true } },
    },
    orderBy: { quantity: 'asc' },
  })

  const lowStockCount = inventory.filter((i) => i.quantity <= i.lowStockThreshold).length
  const outOfStockCount = inventory.filter((i) => i.quantity === 0).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <div className="flex gap-4 mt-2 text-sm">
          {outOfStockCount > 0 && (
            <span className="text-red-600 font-medium">{outOfStockCount} out of stock</span>
          )}
          {lowStockCount > 0 && (
            <span className="text-amber-600 font-medium">{lowStockCount} low stock</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 font-semibold text-gray-600">Product</th>
              <th className="px-5 py-3 font-semibold text-gray-600">SKU</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Category</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Price</th>
              <th className="px-5 py-3 font-semibold text-gray-600">On Hand</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Reserved</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Available</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventory.map((inv) => {
              const images = Array.isArray(inv.product.images) ? inv.product.images as any[] : []
              const imageUrl = images[0]?.url ?? null
              const available = inv.quantity - inv.reservedQuantity
              const isLow = inv.quantity <= inv.lowStockThreshold
              const isOut = inv.quantity === 0

              return (
                <tr key={inv.id} className={`hover:bg-gray-50 transition ${isOut ? 'bg-red-50' : isLow ? 'bg-amber-50' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={inv.product.name} width={36} height={36} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/products/${inv.product.id}`} className="font-medium text-gray-900 hover:text-brand-forest truncate block max-w-[180px]">
                          {inv.product.name}
                        </Link>
                        {inv.variant && <p className="text-xs text-gray-400">{inv.variant.name}</p>}
                        {(isOut || isLow) && (
                          <span className="flex items-center gap-1 text-xs mt-0.5 text-amber-600">
                            <AlertTriangle className="w-3 h-3" />
                            {isOut ? 'Out of stock' : 'Low stock'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-600">{inv.product.sku}</td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{inv.product.category?.name ?? '—'}</td>
                  <td className="px-5 py-3 font-medium">{formatPrice(inv.product.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                      {inv.quantity}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{inv.reservedQuantity}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{available}</td>
                  <td className="px-5 py-3">
                    <InventoryAdjuster
                      inventoryId={inv.id}
                      productId={inv.product.id}
                      variantId={inv.variant?.id}
                      currentQty={inv.quantity}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
