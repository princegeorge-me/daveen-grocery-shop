import { NextRequest, NextResponse } from 'next/server'
import { ProductService }            from '@/services/product.service'
import { ProductQuerySchema }        from '@/validations/product.schema'
import { publicRateLimit }           from '@/lib/redis'
import { apiSuccess, apiError }      from '@/types'

export async function GET(req: NextRequest) {
  const id = req.ip ?? req.headers.get('x-forwarded-for') ?? 'anon'
  const { success } = await publicRateLimit.limit(id)
  if (!success) return NextResponse.json(apiError('Too many requests', 'RATE_LIMIT'), { status: 429 })

  const parsed = ProductQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) {
    return NextResponse.json(apiError(parsed.error.errors[0]?.message ?? 'Invalid query'), { status: 400 })
  }

  const result = await ProductService.list(parsed.data)
  return NextResponse.json(apiSuccess(result), {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
