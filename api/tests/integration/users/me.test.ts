import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('GET /api/v1/users/me', () => {
  beforeEach(() => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...fixtures.user,
      id: 'test-user-id',
      role: 'admin',
    })
  })

  it('returns current user', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch('http://local.test/api/v1/users/me', {
      headers: { Authorization: auth },
    })
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })
})
