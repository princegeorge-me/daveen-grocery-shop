export async function register() {
  // Validate environment variables on server startup
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { env } = await import('./env')
    console.log(`✅ Environment validated — ${env.NODE_ENV} mode`)
  }
}
