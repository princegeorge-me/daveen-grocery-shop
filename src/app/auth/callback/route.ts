import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code     = searchParams.get('code')
  const next     = searchParams.get('next')     ?? '/'
  const redirect = searchParams.get('redirect') ?? next

  if (code) {
    // Build the redirect response FIRST so we can attach cookies to it
    const redirectResponse = NextResponse.redirect(`${origin}${redirect}`)

    // Create a Supabase client whose setAll writes directly onto that response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              redirectResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // The response now carries the auth cookies — the browser will store them
      return redirectResponse
    }
  }

  // Exchange failed or no code — back to sign-in
  return NextResponse.redirect(`${origin}/sign-in?error=unauthorized`)
}
