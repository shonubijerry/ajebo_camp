import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { getAuthHeader } from '../../utils/auth'

describe('PATCH /api/v1/districts/:id', () => {
  it('updates a district', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/districts/district-1',
      {
        method: 'PATCH',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Updated District' }),
      },
    )
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })
})
