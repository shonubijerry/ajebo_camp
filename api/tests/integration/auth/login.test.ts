import { SELF, env } from 'cloudflare:test'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { mockPrisma } from '../../utils/mockPrisma'
import { compare } from '../../../src/lib/encrypt'

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

  it('rejects invalid credentials when user is missing', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null)

    const response = await SELF.fetch('http://local.test/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'missing@example.com',
        password: 'wrong-password',
      }),
    })
    const body = await response.json<{ success: boolean }>()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it('rejects login when password is not set', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      ...fixtures.user,
      password: null,
    })

    const response = await SELF.fetch('http://local.test/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fixtures.user.email,
        password: fixtures.userCreate.password,
      }),
    })
    const body = await response.json<{ success: boolean }>()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it('rejects login for wrong password', async () => {
    vi.mocked(compare).mockResolvedValueOnce(false)

    const response = await SELF.fetch('http://local.test/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fixtures.user.email,
        password: 'wrong-password',
      }),
    })
    const body = await response.json<{ success: boolean }>()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it('fails when salt round is missing', async () => {
    const originalSalt = env.SALT_ROUND
    env.SALT_ROUND = undefined as unknown as string

    const response = await SELF.fetch('http://local.test/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fixtures.user.email,
        password: fixtures.userCreate.password,
      }),
    })

    expect(response.status).toBe(200)

    env.SALT_ROUND = originalSalt
  })
})
