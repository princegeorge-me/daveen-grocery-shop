'use server'

import { revalidatePath } from 'next/cache'
import { redirect }       from 'next/navigation'
import { createClient }   from '@/lib/supabase/server'
import prisma             from '@/lib/prisma'
import { generateReferralCode } from '@/utils/slug'
import { SignUpSchema, SignInSchema } from '@/validations/auth.schema'
import type { SignUpInput, SignInInput } from '@/validations/auth.schema'

export async function signUp(input: SignUpInput) {
  const validated = SignUpSchema.safeParse(input)
  if (!validated.success) {
    return { error: validated.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { email, password, firstName, lastName, phone } = validated.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { firstName, lastName, role: 'CUSTOMER' },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) return { error: error.message }

  // Create user profile in public.users
  if (data.user) {
    const referralCode = generateReferralCode(firstName)
    await prisma.user.create({
      data: {
        supabaseId:  data.user.id,
        email,
        firstName,
        lastName,
        phone:       phone || null,
        referralCode,
      },
    })
  }

  return { success: true, message: 'Check your email to confirm your account.' }
}

export async function signIn(input: SignInInput) {
  const validated = SignInSchema.safeParse(input)
  if (!validated.success) {
    return { success: false as const, error: validated.error.errors[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(validated.data)
  if (error) return { success: false as const, error: 'Invalid email or password' }

  revalidatePath('/', 'layout')
  return { success: true as const }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/sign-in')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: { id: true, email: true, firstName: true, lastName: true,
              role: true, loyaltyPoints: true, referralCode: true, avatarUrl: true },
  })
}
