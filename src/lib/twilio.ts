import twilio from 'twilio'

// Lazy client — prevents module-load crash when env vars are missing at build time
let _client: ReturnType<typeof twilio> | null = null
function getClient() {
  if (!_client) {
    const sid   = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    if (!sid || !token) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set')
    }
    _client = twilio(sid, token)
  }
  return _client
}

export const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER ?? ''

export async function sendSMS(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  if (!sid) {
    console.warn('[Twilio] SMS skipped — TWILIO_ACCOUNT_SID not configured')
    return
  }
  if (!to.startsWith('+')) {
    to = '+1' + to.replace(/\D/g, '')
  }
  try {
    await getClient().messages.create({ from: TWILIO_FROM, to, body })
  } catch (err) {
    console.error('[Twilio] SMS send failed:', err)
    // Non-fatal — don't throw; order flow must not break on SMS failure
  }
}
