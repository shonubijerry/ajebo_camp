import { vi } from 'vitest'

const createModelMock = () => ({
  create: vi.fn().mockResolvedValue({}),
  findMany: vi.fn().mockResolvedValue([]),
  count: vi.fn().mockResolvedValue(0),
  findFirst: vi.fn().mockResolvedValue(null),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue({}),
  findUnique: vi.fn().mockResolvedValue(null),
  aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 0 } }),
  groupBy: vi.fn().mockResolvedValue([]),
  updateMany: vi.fn().mockResolvedValue({}),
})

export const createMockPrismaClient = () => ({
  user: createModelMock(),
  camp: createModelMock(),
  campite: createModelMock(),
  camp_Allocation: createModelMock(),
  district: createModelMock(),
  entity: createModelMock(),
  payment: createModelMock(),
})

export type MockPrismaClient = ReturnType<typeof createMockPrismaClient>

export const mockPrisma = createMockPrismaClient()

export const resetMockPrisma = () => {
  Object.values(mockPrisma).forEach((model) => {
    Object.values(model).forEach((fn) => {
      if (typeof fn === 'function' && 'mockReset' in fn) {
        ;(fn as { mockReset: () => void }).mockReset()
      }
    })
  })
}
