import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ADMIN_PATHS   = ['/admin']
const PROTECTED_PATHS = ['/account', '/orders', '/checkout']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Refresh Supabase session
  const { supabaseResponse, user } = await updateSession(request)

  // Guard admin routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/sign-in'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    // Role check via custom claim in JWT metadata
    const role = (user.user_metadata?.role as string) ?? 'CUSTOMER'
    if (!['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Guard customer protected routes — redirect to sign-in, preserving destination
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/sign-in'
      url.searchParams.set('redirect', pathname)
      url.searchParams.delete('error')   // don't carry stale error params
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|og|api/webhooks).*)'],
}
