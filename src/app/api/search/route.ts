import { NextRequest, NextResponse } from 'next/server'
import { z }                          from 'zod'
import { ProductService }             from '@/services/product.service'
import { publicRateLimit }            from '@/lib/redis'
import { apiSuccess, apiError }       from '@/types'

const SearchSchema = z.object({
  q:     z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(48).default(24),
})

export async function GET(req: NextRequest) {
  const ip = req.ip ?? 'anon'
  const { success } = await publicRateLimit.limit(ip)
  if (!success) return NextResponse.json(apiError('Too many requests', 'RATE_LIMIT'), { status: 429 })

  const parsed = SearchSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) {
    return NextResponse.json(apiError('Search query required'), { status: 400 })
  }

  const products = await ProductService.search(parsed.data.q, parsed.data.limit)
  return NextResponse.json(apiSuccess({ products, query: parsed.data.q }))
}
