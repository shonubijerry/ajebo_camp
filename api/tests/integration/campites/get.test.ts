import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('GET /api/v1/campites/:id', () => {
  beforeEach(() => {
    mockPrisma.campite.findFirst.mockResolvedValue(fixtures.campite)
  })

  it('returns a campite', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/campites/campite-1',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })

  it('scopes campite lookup for regular users', async () => {
    const auth = await getAuthHeader({ role: 'user', sub: 'user-1' })
    const response = await SELF.fetch(
      'http://local.test/api/v1/campites/campite-1',
      { headers: { Authorization: auth } },
    )

    expect(response.status).toBe(200)
    expect(mockPrisma.campite.findFirst).toHaveBeenCalledWith({
      where: { id: 'campite-1', user_id: 'user-1' },
    })
  })

  it('returns 404 when campite is missing', async () => {
    mockPrisma.campite.findFirst.mockResolvedValueOnce(null)

    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/campites/missing',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{ success: boolean }>()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
  })
})
