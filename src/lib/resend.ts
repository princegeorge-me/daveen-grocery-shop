import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'orders@daveengrocery.com'
export const FROM_NAME  = process.env.RESEND_FROM_NAME  ?? 'Daveen African Food & Grocery'
export const FROM       = `${FROM_NAME} <${FROM_EMAIL}>`
