import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'

describe('GET /api/v1/campites/export', () => {
  it('returns CSV export', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      `http://local.test/api/v1/campites/export?camp_id=${fixtures.campiteCreate.camp_id}`,
      { headers: { Authorization: auth } },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/csv')
  })
})
