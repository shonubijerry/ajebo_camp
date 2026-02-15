import { SELF, env } from 'cloudflare:test'
import { sign } from 'hono/jwt'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockPrisma } from '../utils/mockPrisma'

describe('Analytics API Integration Tests', () => {
  beforeEach(() => {
    mockPrisma.campite.count.mockResolvedValue(0)
    mockPrisma.campite.groupBy.mockResolvedValue([])
  })

  describe('GET /analytics/dashboard', () => {
    it('should return dashboard analytics summary', async () => {
      const token = await sign(
        { sub: 'test-user-id', email: 'test@example.com', role: 'admin' },
        env.JWT_SECRET,
      )

      const response = await SELF.fetch(
        'http://local.test/api/v1/analytics/dashboard',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const body = await response.json<{
        data: {
          total_campites: number
          by_gender: Array<{ gender: string; _count: { id: number } }>
          by_age_group: Array<{ age_group: string; _count: { id: number } }>
        }
      }>()

      expect(response.status).toBe(200)
      expect(body.data.total_campites).toEqual(expect.any(Number))
      expect(Array.isArray(body.data.by_gender)).toBe(true)
      expect(Array.isArray(body.data.by_age_group)).toBe(true)
    })
  })
})
