import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { mockPrisma } from '../../utils/mockPrisma'

describe('POST /api/v1/auth/login', () => {
  beforeEach(() => {
    mockPrisma.user.findUnique.mockResolvedValue(fixtures.user)
  })

  it('returns a token for valid credentials', async () => {
    const response = await SELF.fetch('http://local.test/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fixtures.user.email,
        password: fixtures.userCreate.password,
      }),
    })
    const body = await response.json<{
      success: boolean
      data: { token: string }
    }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.token).toEqual(expect.any(String))
  })
})
