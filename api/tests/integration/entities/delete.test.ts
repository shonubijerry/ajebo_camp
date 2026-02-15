import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { getAuthHeader } from '../../utils/auth'

describe('DELETE /api/v1/entities/:id', () => {
  it('deletes an entity', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/entities/entity-1',
      {
        method: 'DELETE',
        headers: { Authorization: auth },
      },
    )
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })
})
