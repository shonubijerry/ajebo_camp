import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'

describe('POST /api/v1/campites', () => {
  it('creates a campite', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch('http://local.test/api/v1/campites', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fixtures.campiteCreate),
    })
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })
})
