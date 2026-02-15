import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('GET /api/v1/camp-allocations/:id', () => {
  beforeEach(() => {
    mockPrisma.camp_Allocation.findFirst.mockResolvedValue(
      fixtures.campAllocation,
    )
  })

  it('returns a camp allocation', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/camp-allocations/alloc-1',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })
})
