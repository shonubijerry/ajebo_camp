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

  it('returns 500 when token lacks a subject', async () => {
    const auth = await getAuthHeader({ sub: '' })
    const response = await SELF.fetch('http://local.test/api/v1/users/me', {
      headers: { Authorization: auth },
    })

    expect(response.status).toBe(500)
  })

  it('returns 500 when user cannot be found', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null)

    const auth = await getAuthHeader()
    const response = await SELF.fetch('http://local.test/api/v1/users/me', {
      headers: { Authorization: auth },
    })

    expect(response.status).toBe(500)
  })
})
