import type { AppContext } from '../src/types'
import { beforeEach, vi } from 'vitest'
import { mockPrisma, resetMockPrisma } from './utils/mockPrisma'

vi.mock('../src/lib/prisma', () => ({
  __esModule: true,
  prismaMiddleware: async (c: AppContext, next: () => Promise<void>) => {
    c.env = c.env ?? {}
    c.env.PRISMA = mockPrisma as unknown as AppContext['env']['PRISMA']
    await next()
  },
}))

beforeEach(() => {
  resetMockPrisma()
})
