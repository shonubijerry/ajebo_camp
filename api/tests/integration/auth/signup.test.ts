import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { mockPrisma } from '../../utils/mockPrisma'

describe('POST /api/v1/auth/signup', () => {
  beforeEach(() => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue(fixtures.user)
  })

  it('creates a user and returns a token', async () => {
    const response = await SELF.fetch('http://local.test/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fixtures.userCreate),
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
