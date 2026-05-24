import { NextResponse }     from 'next/server'
import prisma               from '@/lib/prisma'
import { apiSuccess }       from '@/types'
import { cacheGet, cacheSet } from '@/lib/redis'

export async function GET() {
  const cacheKey = 'categories:all'
  const cached   = await cacheGet(cacheKey)
  if (cached) {
    return NextResponse.json(apiSuccess(cached), {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' },
    })
  }

  const categories = await prisma.category.findMany({
    where:   { isActive: true },
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      _count:   { select: { products: { where: { isActive: true, deletedAt: null } } } },
    },
  })

  const rootCategories = categories.filter(c => !c.parentId)
  await cacheSet(cacheKey, rootCategories, 600)

  return NextResponse.json(apiSuccess(rootCategories), {
    headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' },
  })
}
