import prisma from '@/lib/prisma'
import { cacheGet, cacheSet } from '@/lib/redis'
import type { ProductQueryInput } from '@/validations/product.schema'
import type { ProductCard, ProductWithRelations } from '@/types'

export const ProductService = {
  async list(query: ProductQueryInput) {
    const cacheKey = `products:list:${JSON.stringify(query)}`
    const cached   = await cacheGet<{ items: ProductCard[]; nextCursor: string | null }>(cacheKey)
    if (cached) return cached

    const where: Parameters<typeof prisma.product.findMany>[0]['where'] = {
      isActive:  true,
      deletedAt: null,
      ...(query.category && { category: { slug: query.category } }),
      ...(query.featured  && { isFeatured: true }),
      ...(query.inStock   && { inventory: { quantity: { gt: 0 } } }),
      ...(query.tags      && { tags: { hasSome: query.tags.split(',') } }),
      ...(query.search    && {
        OR: [
          { name:             { contains: query.search, mode: 'insensitive' } },
          { shortDescription: { contains: query.search, mode: 'insensitive' } },
          { tags:             { has: query.search.toLowerCase() } },
        ],
      }),
    }

    const orderBy = {
      newest:    { createdAt:  'desc' as const },
      price_asc: { price:      'asc'  as const },
      price_desc:{ price:      'desc' as const },
      popular:   { salesCount: 'desc' as const },
      featured:  { isFeatured: 'desc' as const },
    }[query.sort]

    const items = await prisma.product.findMany({
      where,
      orderBy,
      take:    query.limit + 1,
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
      include: { category: true, inventory: true },
    })

    const hasMore    = items.length > query.limit
    const results    = hasMore ? items.slice(0, query.limit) : items
    const nextCursor = hasMore ? (results[results.length - 1]?.id ?? null) : null

    const result = { items: results as ProductCard[], nextCursor }
    await cacheSet(cacheKey, result, 60)
    return result
  },

  async getBySlug(slug: string): Promise<ProductWithRelations | null> {
    const cacheKey = `product:${slug}`
    const cached   = await cacheGet<ProductWithRelations>(cacheKey)
    if (cached) return cached

    const product = await prisma.product.findFirst({
      where:   { slug, isActive: true, deletedAt: null },
      include: {
        category: true,
        variants:  { where: { isActive: true }, orderBy: { position: 'asc' } },
        inventory: true,
        reviews:   { where: { isApproved: true }, take: 10, orderBy: { createdAt: 'desc' },
                     include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      },
    })
    if (product) await cacheSet(cacheKey, product, 120)
    return product as ProductWithRelations | null
  },

  async getFeatured(limit = 8): Promise<ProductCard[]> {
    const cacheKey = `products:featured:${limit}`
    const cached   = await cacheGet<ProductCard[]>(cacheKey)
    if (cached) return cached

    const products = await prisma.product.findMany({
      where:   { isActive: true, isFeatured: true, deletedAt: null },
      take:    limit,
      orderBy: { salesCount: 'desc' },
      include: { category: true, inventory: true },
    })
    await cacheSet(cacheKey, products, 300)
    return products as ProductCard[]
  },

  async search(query: string, limit = 24): Promise<ProductCard[]> {
    const products = await prisma.product.findMany({
      where: {
        isActive:  true,
        deletedAt: null,
        OR: [
          { name:             { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } },
          { description:      { contains: query, mode: 'insensitive' } },
          { tags:             { has: query.toLowerCase() } },
        ],
      },
      take:    limit,
      orderBy: { salesCount: 'desc' },
      include: { category: true, inventory: true },
    })
    return products as ProductCard[]
  },

  async getRelated(productId: string, categoryId: string, limit = 4): Promise<ProductCard[]> {
    const products = await prisma.product.findMany({
      where: { categoryId, isActive: true, deletedAt: null, id: { not: productId } },
      take:  limit,
      orderBy: { salesCount: 'desc' },
      include: { category: true, inventory: true },
    })
    return products as ProductCard[]
  },
}
