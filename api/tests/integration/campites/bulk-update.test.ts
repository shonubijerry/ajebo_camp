import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'

describe('PATCH /api/v1/campites/bulk-update', () => {
  it('updates campites in bulk', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/campites/bulk-update',
      {
        method: 'PATCH',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fixtures.campiteBulkUpdate),
      },
    )
    const body = await response.json<{
      success: boolean
      data: { success: boolean; count: number }
    }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.count).toBeGreaterThan(0)
  })
})
