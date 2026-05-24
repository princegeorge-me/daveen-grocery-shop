import { Resend } from 'resend'

// Lazy singleton — instantiated on first use so missing env var doesn't
// crash the module during Next.js static build / page-data collection.
let _resend: Resend | null = null
export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    _resend = new Resend(key)
  }
  return _resend
}

// Keep the named export for any legacy callers — resolved lazily too.
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return (getResend() as any)[prop]
  },
})

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'orders@daveengrocery.com'
export const FROM_NAME  = process.env.RESEND_FROM_NAME  ?? 'Daveen African Food & Grocery'
export const FROM       = `${FROM_NAME} <${FROM_EMAIL}>`
