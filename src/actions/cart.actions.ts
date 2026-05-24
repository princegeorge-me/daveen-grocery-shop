'use server'

import prisma from '@/lib/prisma'

export async function getProductForCart(productId: string, variantId?: string) {
  const product = await prisma.product.findUnique({
    where:   { id: productId, isActive: true, deletedAt: null },
    include: {
      inventory: true,
      variants:  variantId ? { where: { id: variantId } } : false,
    },
  })

  if (!product) return { error: 'Product not found' }

  const inventory = variantId
    ? await prisma.inventory.findFirst({ where: { variantId } })
    : product.inventory

  const available = inventory
    ? inventory.quantity - inventory.reservedQuantity
    : 999

  if (available <= 0) return { error: 'Product is out of stock' }

  const images = Array.isArray(product.images)
    ? product.images as { url: string; alt: string; position: number }[]
    : []

  return {
    productId:   product.id,
    variantId:   variantId ?? null,
    name:        product.name,
    slug:        product.slug,
    image:       images[0]?.url ?? '',
    price:       product.price,
    maxQuantity: Math.min(available, 10),
  }
}
