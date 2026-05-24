import { vi } from 'vitest'

// Mock Next.js server-only modules
vi.mock('server-only', () => ({}))

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Mock Redis
vi.mock('@/lib/redis', () => ({
  publicRateLimit: { limit: vi.fn().mockResolvedValue({ success: true }) },
  authRateLimit: { limit: vi.fn().mockResolvedValue({ success: true }) },
  checkoutRateLimit: { limit: vi.fn().mockResolvedValue({ success: true }) },
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
  cacheDel: vi.fn().mockResolvedValue(undefined),
}))
