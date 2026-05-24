import { z } from 'zod'

export const SignUpSchema = z.object({
  email:     z.string().email('Enter a valid email address'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name required').max(50),
  lastName:  z.string().min(1, 'Last name required').max(50),
  phone:     z.string().regex(/^\+?[1-9]\d{1,14}$/).optional().or(z.literal('')),
})

export const SignInSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password required'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const AddressSchema = z.object({
  label:   z.string().max(50).default('Home'),
  street1: z.string().min(5).max(200),
  street2: z.string().max(200).optional(),
  city:    z.string().min(2).max(100).default('Chicago'),
  state:   z.string().length(2).default('IL'),
  zip:     z.string().regex(/^\d{5}$/, 'Enter a valid ZIP code'),
  isDefault: z.boolean().default(false),
})

export type SignUpInput          = z.infer<typeof SignUpSchema>
export type SignInInput          = z.infer<typeof SignInSchema>
export type ForgotPasswordInput  = z.infer<typeof ForgotPasswordSchema>
export type AddressInput         = z.infer<typeof AddressSchema>
