import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER!

export async function sendSMS(to: string, body: string): Promise<void> {
  if (!to.startsWith('+')) {
    to = '+1' + to.replace(/\D/g, '')
  }
  try {
    await client.messages.create({ from: TWILIO_FROM, to, body })
  } catch (err) {
    console.error('[Twilio] SMS send failed:', err)
    // Non-fatal — don't throw; order flow must not break on SMS failure
  }
}
