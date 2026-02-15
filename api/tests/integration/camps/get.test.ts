import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { mockPrisma } from '../../utils/mockPrisma'

describe('GET /api/v1/camps/:id', () => {
  beforeEach(() => {
    mockPrisma.camp.findFirst.mockResolvedValue(fixtures.camp)
  })

  it('returns a camp', async () => {
    const response = await SELF.fetch('http://local.test/api/v1/camps/camp-1')
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })
})
