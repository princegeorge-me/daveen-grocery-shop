export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear()
  return `DAV-${year}-${String(sequence).padStart(4, '0')}`
}

export function generateReferralCode(firstName: string): string {
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${firstName.substring(0, 4).toUpperCase()}${suffix}`
}
