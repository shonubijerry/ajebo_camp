import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('POST /api/v1/users', () => {
  beforeEach(() => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue(fixtures.user)
  })

  it('creates a user', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch('http://local.test/api/v1/users', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fixtures.userCreate),
    })
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })

  it('returns existing user when email is already taken', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(fixtures.user)

    const auth = await getAuthHeader()
    const response = await SELF.fetch('http://local.test/api/v1/users', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fixtures.userCreate),
    })
    const body = await response.json<{
      success: boolean
      data: { id: string }
    }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe(fixtures.user.id)
  })

  it('returns validation errors for invalid fields', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch('http://local.test/api/v1/users', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstname: '',
        lastname: 'L'.repeat(101),
        email: 'not-an-email',
        phone: 12345,
        role: 'super',
      }),
    })
    const body = await response.json<{ success: boolean; errors: string[] }>()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.errors).toEqual(
      expect.arrayContaining([
        'firstname: Must be at least 1 characters',
        'lastname: Must be at most 100 characters',
        'email: Invalid email address',
        'phone: Expected string, but received number',
        'role: Must be one of: user, staff, admin',
      ]),
    )
  })
})
