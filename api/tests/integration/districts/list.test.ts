import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('GET /api/v1/districts/list', () => {
  it('returns list of districts', async () => {
    const response = await SELF.fetch(
      'http://local.test/api/v1/districts/list',
    )
    const body = await response.json<{ success: boolean; data: unknown[] }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })
})
