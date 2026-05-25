import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

// One-time admin setup endpoint — delete this file after use
export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const ADMIN_EMAIL    = 'admin@daveen.com'
    const ADMIN_PASSWORD = 'Daveen@Admin2025!'
    const ADMIN_FIRST    = 'Daveen'
    const ADMIN_LAST     = 'Admin'

    // Delete any existing auth users with this email (clean slate)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const duplicates = existingUsers?.users?.filter(u => u.email === ADMIN_EMAIL) ?? []
    for (const u of duplicates) {
      await supabaseAdmin.auth.admin.deleteUser(u.id)
    }

    // Create a fresh Supabase auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email:          ADMIN_EMAIL,
      password:       ADMIN_PASSWORD,
      email_confirm:  true,        // skip email confirmation
      user_metadata:  { firstName: ADMIN_FIRST, lastName: ADMIN_LAST, role: 'ADMIN' },
    })

    if (createError || !newUser.user) {
      return NextResponse.json({ success: false, error: createError?.message }, { status: 500 })
    }

    // Delete any stale DB record for this email, then create a clean one
    await prisma.user.deleteMany({ where: { email: ADMIN_EMAIL } })
    await prisma.user.create({
      data: {
        supabaseId:   newUser.user.id,
        email:        ADMIN_EMAIL,
        firstName:    ADMIN_FIRST,
        lastName:     ADMIN_LAST,
        role:         'ADMIN',
        referralCode: 'DAVEADMIN',
      },
    })

    return NextResponse.json({
      success:  true,
      message:  'Admin account created. Use these credentials to sign in, then DELETE this file.',
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      next:     'Go to /sign-in and log in, then go to /admin',
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
