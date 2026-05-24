import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/utils/currency'
import { Plus, Edit, Package } from 'lucide-react'

export const metadata: Metadata = { title: 'Products' }
export const revalidate = 60

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true } },
      inventory: { select: { quantity: true } },
    },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-forest text-white rounded-xl text-sm font-medium hover:bg-brand-forest/90 transition"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 font-semibold text-gray-600">Product</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Category</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Price</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Stock</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-5 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const images = Array.isArray(product.images) ? product.images as any[] : []
              const imageUrl = images[0]?.url ?? null
              const stock = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0)

              return (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{product.category?.name ?? '—'}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-medium ${stock === 0 ? 'text-red-600' : stock <= 10 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex items-center gap-1 text-brand-forest hover:underline text-xs"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Link>
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
