import { SELF } from 'cloudflare:test'
import { describe, expect, it, vi } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'
import { mockPrisma } from '../../utils/mockPrisma'

describe('POST /api/v1/campites/bulk', () => {
  it('creates campites in bulk', async () => {
    mockPrisma.camp_Allocation.findMany.mockResolvedValueOnce([
      { ...fixtures.campAllocation, items: null },
    ])

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

  it('rejects bulk create when campites array is empty', async () => {
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
          campites: [],
        }),
      },
    )

    expect(response.status).toBe(500)
  })

  it('rejects bulk create when user is missing', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null)

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

    expect(response.status).toBe(500)
  })

  it('rejects bulk create when camp is missing', async () => {
    mockPrisma.camp.findUnique.mockResolvedValueOnce(null)

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

    expect(response.status).toBe(500)
  })

  it('returns 500 when a campite fails to create', async () => {
    vi.spyOn(console, 'log').mockImplementationOnce(() => undefined)
    mockPrisma.campite.create.mockRejectedValueOnce(new Error('boom'))

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

    expect(response.status).toBe(500)
  })
})
