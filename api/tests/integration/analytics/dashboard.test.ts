import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('GET /api/v1/analytics/dashboard', () => {
  beforeEach(() => {
    mockPrisma.campite.count.mockResolvedValue(1)
    mockPrisma.campite.groupBy.mockResolvedValue([
      { gender: 'male', _count: { id: 1 } },
    ])
  })

  it('returns dashboard analytics', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/analytics/dashboard',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{
      data: { total_campites: number; by_gender: unknown[]; by_age_group: unknown[] }
    }>()

    expect(response.status).toBe(200)
    expect(body.data).toBeDefined()
    expect(body.data.total_campites).toBe(1)
  })
})
