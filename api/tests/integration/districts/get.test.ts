import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('GET /api/v1/districts/:id', () => {
  beforeEach(() => {
    mockPrisma.district.findFirst.mockResolvedValue(fixtures.district)
  })

  it('returns a district', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/districts/district-1',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })

  it('returns 404 when district is missing', async () => {
    mockPrisma.district.findFirst.mockResolvedValueOnce(null)

    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/districts/missing',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{ success: boolean }>()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
  })
})
