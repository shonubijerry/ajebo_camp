import { vi } from 'vitest'
import { fixtures } from './fixtures'

const applyModelDefaults = (
  model: ModelMock,
  data: Record<string, unknown>,
) => {
  model.create.mockResolvedValue(data)
  model.findMany.mockResolvedValue([data])
  model.count.mockResolvedValue(1)
  model.findFirst.mockResolvedValue(data)
  model.update.mockResolvedValue(data)
  model.delete.mockResolvedValue(data)
  model.findUnique.mockResolvedValue(data)
  model.aggregate.mockResolvedValue({ _sum: { amount: data.amount ?? 0 } })
  model.groupBy.mockResolvedValue([])
  model.updateMany.mockResolvedValue({ count: 1 })
}

type ModelMock = {
  create: ReturnType<typeof vi.fn>
  findMany: ReturnType<typeof vi.fn>
  count: ReturnType<typeof vi.fn>
  findFirst: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  findUnique: ReturnType<typeof vi.fn>
  aggregate: ReturnType<typeof vi.fn>
  groupBy: ReturnType<typeof vi.fn>
  updateMany: ReturnType<typeof vi.fn>
}

const createModelMock = (data: Record<string, unknown>): ModelMock => {
  const model: ModelMock = {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
    updateMany: vi.fn(),
  }

  applyModelDefaults(model, data)
  return model
}

const modelFixtures = {
  user: fixtures.user,
  camp: fixtures.camp,
  campite: fixtures.campite,
  camp_Allocation: fixtures.campAllocation,
  district: fixtures.district,
  entity: fixtures.entity,
  payment: fixtures.payment,
}

export const createMockPrismaClient = () => ({
  user: createModelMock(modelFixtures.user),
  camp: createModelMock(modelFixtures.camp),
  campite: createModelMock(modelFixtures.campite),
  camp_Allocation: createModelMock(modelFixtures.camp_Allocation),
  district: createModelMock(modelFixtures.district),
  entity: createModelMock(modelFixtures.entity),
  payment: createModelMock(modelFixtures.payment),
})

export type MockPrismaClient = ReturnType<typeof createMockPrismaClient>

export const mockPrisma = createMockPrismaClient()

export const resetMockPrisma = () => {
  const entries = Object.entries(modelFixtures) as Array<
    [keyof typeof modelFixtures, Record<string, unknown>]
  >

  entries.forEach(([modelName, data]) => {
    const model = mockPrisma[modelName]
    Object.values(model).forEach((fn) => {
      if (typeof fn === 'function' && 'mockReset' in fn) {
        ;(fn as { mockReset: () => void }).mockReset()
      }
    })

    applyModelDefaults(model, data)
  })
}
