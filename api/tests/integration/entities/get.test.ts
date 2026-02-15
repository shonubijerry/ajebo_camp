import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('GET /api/v1/entities/:id', () => {
  beforeEach(() => {
    mockPrisma.entity.findFirst.mockResolvedValue(fixtures.entity)
  })

  it('returns an entity', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/entities/entity-1',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })
})
