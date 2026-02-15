import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { getAuthHeader } from '../../utils/auth'

describe('GET /api/v1/campites/offline', () => {
  it('returns offline campites data', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/campites/offline',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })

  it('filters offline campites by camp', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/campites/offline?camp_id=camp-1',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('rejects offline access for regular users', async () => {
    const auth = await getAuthHeader({ role: 'user', sub: 'user-1' })
    const response = await SELF.fetch(
      'http://local.test/api/v1/campites/offline',
      { headers: { Authorization: auth } },
    )

    expect(response.status).toBe(500)
  })
})
