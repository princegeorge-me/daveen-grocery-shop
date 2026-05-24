'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { cacheDel }       from '@/lib/redis'
import { getCurrentUser } from '@/actions/auth.actions'
import { CreateProductSchema, UpdateProductSchema } from '@/validations/product.schema'
import type { CreateProductInput, UpdateProductInput } from '@/validations/product.schema'
import { slugify } from '@/utils/slug'

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function createProduct(input: CreateProductInput) {
  await requireAdmin()

  const validated = CreateProductSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.errors[0]?.message }

  const { quantity, lowStockThreshold, ...productData } = validated.data
  const slug = productData.slug || slugify(productData.name)

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug,
      inventory: { create: { quantity, lowStockThreshold } },
    },
  })

  await cacheDel('products:featured:8')
  revalidatePath('/products')
  revalidatePath('/admin/products')

  return { product }
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await requireAdmin()

  const validated = UpdateProductSchema.safeParse(input)
  if (!validated.success) return { error: validated.error.errors[0]?.message }

  const { quantity, lowStockThreshold, ...productData } = validated.data

  const product = await prisma.product.update({
    where: { id },
    data:  productData,
  })

  if (quantity !== undefined || lowStockThreshold !== undefined) {
    await prisma.inventory.updateMany({
      where: { productId: id },
      data:  {
        ...(quantity           !== undefined && { quantity }),
        ...(lowStockThreshold  !== undefined && { lowStockThreshold }),
      },
    })
  }

  await cacheDel(`product:${product.slug}`)
  revalidatePath(`/products/${product.slug}`)
  revalidatePath('/admin/products')

  return { product }
}

export async function deleteProduct(id: string) {
  await requireAdmin()

  const product = await prisma.product.update({
    where: { id },
    data:  { deletedAt: new Date(), isActive: false },
  })

  await cacheDel(`product:${product.slug}`)
  revalidatePath('/admin/products')

  return { success: true }
}
