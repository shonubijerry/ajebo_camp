import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('GET /api/v1/analytics/detailed', () => {
  beforeEach(() => {
    mockPrisma.campite.count.mockResolvedValue(1)
    mockPrisma.district.count.mockResolvedValue(1)
    mockPrisma.campite.groupBy
      .mockResolvedValueOnce([
        { gender: 'male', _count: { id: 1 } },
      ])
      .mockResolvedValueOnce([
        { age_group: '21-30', _count: { id: 1 } },
      ])
      .mockResolvedValueOnce([
        { type: 'regular', _count: { id: 1 }, _sum: { amount: 5000 } },
      ])
      .mockResolvedValueOnce([
        { district_id: 'district-1', _count: { id: 1 } },
      ])
      .mockResolvedValueOnce([
        {
          created_at: new Date('2025-01-01T00:00:00Z'),
          _count: { id: 1 },
          _sum: { amount: 5000 },
        },
      ])
    mockPrisma.campite.findMany.mockResolvedValue([
      {
        id: 'campite-1',
        firstname: 'John',
        lastname: 'Doe',
        created_at: new Date('2025-01-01T00:00:00Z'),
        camp: { title: 'Summer Camp 2025' },
      },
    ])
    mockPrisma.campite.aggregate.mockResolvedValue({ _sum: { amount: 5000 } })
    mockPrisma.district.findMany.mockResolvedValue([
      { id: 'district-1', name: 'Yaba' },
    ])
  })

  it('returns detailed analytics', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/analytics/detailed',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{ data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.data).toBeDefined()
  })
})
