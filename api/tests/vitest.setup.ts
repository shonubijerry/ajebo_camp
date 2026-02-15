import type { AppContext } from '../src/types'
import { beforeEach, afterEach, vi } from 'vitest'
import { mockPrisma, resetMockPrisma } from './utils/mockPrisma'

vi.mock('../src/lib/prisma', () => ({
  __esModule: true,
  prismaMiddleware: async (c: AppContext, next: () => Promise<void>) => {
    c.env.PRISMA = mockPrisma as unknown as AppContext['env']['PRISMA']
    await next()
  },
}))

vi.mock('../src/services/email.service', () => ({
  __esModule: true,
  sendMail: vi.fn().mockResolvedValue(undefined),
  sendHtmlMail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../src/lib/generators', () => ({
  __esModule: true,
  generateRandomString: vi.fn().mockReturnValue('ABC123'),
  generateRegistrationNumber: vi.fn().mockResolvedValue('REG-2025-001'),
  generateQrCode: vi.fn().mockReturnValue('qr-bytes'),
}))

vi.mock('../src/lib/encrypt', () => ({
  __esModule: true,
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}))

beforeEach(() => {
  resetMockPrisma()
})

afterEach(() => {
  vi.clearAllMocks()
})
