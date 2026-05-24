import { describe, it, expect } from 'vitest'
import { slugify, generateOrderNumber, generateReferralCode } from '@/utils/slug'

describe('slugify', () => {
  it('converts to lowercase with hyphens', () => {
    expect(slugify('Egusi Seeds (Melon)')).toBe('egusi-seeds-melon')
  })

  it('removes special characters', () => {
    expect(slugify('Palm Oil 5L — Premium!')).toBe('palm-oil-5l-premium')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('  Crayfish  ')).toBe('crayfish')
  })
})

describe('generateOrderNumber', () => {
  it('produces DAV-YYYY-NNNN format', () => {
    const num = generateOrderNumber(1)
    expect(num).toMatch(/^DAV-\d{4}-0001$/)
  })

  it('zero-pads sequence', () => {
    const num = generateOrderNumber(42)
    expect(num).toContain('0042')
  })
})

describe('generateReferralCode', () => {
  it('generates code starting with first name uppercase', () => {
    const code = generateReferralCode('Prince')
    expect(code.startsWith('PRINCE')).toBe(true)
    expect(code.length).toBeGreaterThan(6)
  })
})
