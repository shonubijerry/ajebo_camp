import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { getAuthHeader } from '../../utils/auth'

describe('GET /api/v1/campites/list', () => {
  it('returns list of campites', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/campites/list',
      { headers: { Authorization: auth } },
    )
    const body = await response.json<{ success: boolean; data: unknown[] }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })
})
