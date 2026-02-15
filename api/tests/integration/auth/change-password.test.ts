import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { mockPrisma } from '../../utils/mockPrisma'

describe('POST /api/v1/forgot/change-password/:code', () => {
  beforeEach(() => {
    mockPrisma.user.findFirst.mockResolvedValue(fixtures.user)
  })

  it('changes password with a valid token', async () => {
    const response = await SELF.fetch(
      'http://local.test/api/v1/forgot/change-password/test-code',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'securePassword123' }),
      },
    )
    const body = await response.json<{ success: boolean }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })
})
