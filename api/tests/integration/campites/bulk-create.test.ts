import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'

describe('POST /api/v1/campites/bulk', () => {
  it('creates campites in bulk', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      'http://local.test/api/v1/campites/bulk',
      {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: fixtures.campiteCreate.user_id,
          camp_id: fixtures.campiteCreate.camp_id,
          district_id: fixtures.campiteCreate.district_id,
          payment_ref: fixtures.campiteCreate.payment_ref,
          campites: fixtures.bulkCampites,
        }),
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
