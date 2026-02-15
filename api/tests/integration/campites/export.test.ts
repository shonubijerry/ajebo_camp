import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('GET /api/v1/campites/export', () => {
  beforeEach(() => {
    mockPrisma.district.findMany.mockResolvedValue([
      { id: fixtures.district.id, name: fixtures.district.name },
    ])
    mockPrisma.campite.findMany.mockResolvedValue([
      {
        ...fixtures.campite,
        amount: { value: 15000 },
      },
    ])
  })

  it('returns CSV export', async () => {
    const auth = await getAuthHeader()
    const response = await SELF.fetch(
      `http://local.test/api/v1/campites/export?camp_id=${fixtures.campiteCreate.camp_id}`,
      { headers: { Authorization: auth } },
    )
    const csv = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('text/csv')
    expect(csv).toContain('{"value":15000}')
  })
})
