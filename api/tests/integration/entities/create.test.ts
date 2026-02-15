import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('POST /api/v1/entities', () => {
  beforeEach(() => {
    mockPrisma.entity.create.mockResolvedValue(fixtures.entity)
  })

  it('creates an entity', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch('http://local.test/api/v1/entities', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fixtures.entityCreate),
    })
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })
})
