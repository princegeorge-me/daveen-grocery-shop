import { NextResponse }  from 'next/server'
import { DELIVERY_ZONES } from '@/config/delivery-zones'
import { apiSuccess }    from '@/types'

export async function GET() {
  return NextResponse.json(apiSuccess(DELIVERY_ZONES), {
    headers: { 'Cache-Control': 'public, s-maxage=3600' },
  })
}
