import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('GET /api/v1/analytics/detailed', () => {
  beforeEach(() => {
    mockPrisma.campite.count.mockResolvedValue(1)
    mockPrisma.district.count.mockResolvedValue(1)
    mockPrisma.campite.groupBy
      .mockResolvedValueOnce([{ gender: 'male', _count: { id: 1 } }])
      .mockResolvedValueOnce([{ age_group: '21-30', _count: { id: 1 } }])
      .mockResolvedValueOnce([
        { type: 'regular', _count: { id: 1 }, _sum: { amount: 5000 } },
      ])
      .mockResolvedValueOnce([{ district_id: 'district-1', _count: { id: 1 } }])
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
    const body = await response.json<{
      data: { timeline: { daily: Array<{ date: string }> } }
    }>()

    expect(response.status).toBe(200)
    expect(body.data).toBeDefined()
    expect(body.data.timeline.daily.length).toBeGreaterThan(0)
    expect(body.data.timeline.daily[0].date).toBe('2025-01-01')
  })

  it.each(['today', 'week', 'month', 'year'])(
    'supports %s period',
    async (period) => {
      const auth = await getAuthHeader()
      const response = await SELF.fetch(
        `http://local.test/api/v1/analytics/detailed?period=${period}`,
        { headers: { Authorization: auth } },
      )

      expect(response.status).toBe(200)
    },
  )

  it('returns cached detailed analytics when available', async () => {
    const auth = await getAuthHeader()
    const cachedBody = {
      data: {
        overview: {
          total_campites: 0,
          total_revenue: 0,
          total_districts: 0,
          pending_payments: 0,
        },
        campites: {
          by_gender: [],
          by_age_group: [],
          by_type: [],
          by_district: [],
        },
        timeline: { daily: [], monthly: [] },
        revenue: { total: 0 },
        recent_activity: { recent_registrations: [] },
      },
    }
    const cacheMatch = vi.spyOn(caches.default, 'match').mockResolvedValueOnce({
      json: () => Promise.resolve(cachedBody),
    } as Response)

    const response = await SELF.fetch(
      'http://local.test/api/v1/analytics/detailed?cache=1',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{
      data: { overview: { total_campites: number } }
    }>()

    expect(response.status).toBe(200)
    expect(body.data.overview.total_campites).toBe(0)

    cacheMatch.mockRestore()
  })
})
