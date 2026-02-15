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

  it('rejects signup when user already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(fixtures.user)

    const response = await SELF.fetch('http://local.test/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fixtures.userCreate),
    })
    const body = await response.json<{ success: boolean }>()

    expect(response.status).toBe(409)
    expect(body.success).toBe(false)
  })

  it('rejects signup for non-user roles', async () => {
    const response = await SELF.fetch('http://local.test/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fixtures.userCreate, role: 'admin' }),
    })
    const body = await response.json<{ success: boolean }>()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
  })
})
