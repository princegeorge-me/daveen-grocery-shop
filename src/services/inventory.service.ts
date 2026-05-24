import prisma from '@/lib/prisma'
import type { CartItem } from '@/types'

export const inventoryService = {
  async reserve(items: CartItem[]): Promise<{ success: boolean; failedItem?: string }> {
    for (const item of items) {
      const inv = item.variantId
        ? await prisma.inventory.findFirst({ where: { variantId: item.variantId } })
        : await prisma.inventory.findFirst({ where: { productId: item.productId } })

      if (!inv) continue   // no inventory tracked = infinite stock

      const available = inv.quantity - inv.reservedQuantity
      if (available < item.quantity) {
        const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { name: true } })
        return { success: false, failedItem: product?.name ?? item.productId }
      }
    }

    // All checks passed — reserve atomically
    await prisma.$transaction(
      items.map((item) => {
        const where = item.variantId
          ? { variantId: item.variantId }
          : { productId: item.productId }
        return prisma.inventory.updateMany({
          where,
          data: { reservedQuantity: { increment: item.quantity } },
        })
      })
    )

    return { success: true }
  },

  async deductOnPayment(items: CartItem[]): Promise<void> {
    await prisma.$transaction(
      items.flatMap((item) => {
        const where = item.variantId
          ? { variantId: item.variantId }
          : { productId: item.productId }
        return [
          prisma.inventory.updateMany({
            where,
            data: {
              quantity:         { decrement: item.quantity },
              reservedQuantity: { decrement: item.quantity },
            },
          }),
          prisma.product.updateMany({
            where: { id: item.productId },
            data:  { salesCount: { increment: item.quantity } },
          }),
        ]
      })
    )
  },

  async releaseReservation(items: CartItem[]): Promise<void> {
    await prisma.$transaction(
      items.map((item) => {
        const where = item.variantId
          ? { variantId: item.variantId }
          : { productId: item.productId }
        return prisma.inventory.updateMany({
          where,
          data: { reservedQuantity: { decrement: item.quantity } },
        })
      })
    )
  },
}
