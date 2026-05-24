import { NextRequest, NextResponse } from 'next/server'
import prisma                         from '@/lib/prisma'
import { apiSuccess, apiError }       from '@/types'
import { publicRateLimit }            from '@/lib/redis'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ip = req.ip ?? 'anon'
  const { success } = await publicRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests', 'RATE_LIMIT'), { status: 429 })

  const product = await prisma.product.findFirst({
    where:   { OR: [{ id }, { slug: id }], isActive: true, deletedAt: null },
    include: { category: true, variants: true, inventory: true },
  })
  if (!product) return NextResponse.json(apiError('Product not found', 'NOT_FOUND'), { status: 404 })

  return NextResponse.json(apiSuccess(product), {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
  })
}
