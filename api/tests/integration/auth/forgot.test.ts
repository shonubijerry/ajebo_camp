import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { mockPrisma } from '../../utils/mockPrisma'

describe('POST /api/v1/forgot', () => {
  beforeEach(() => {
    mockPrisma.user.findFirst.mockResolvedValue(fixtures.user)
  })

  it('sends a reset token', async () => {
    const response = await SELF.fetch('http://local.test/api/v1/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fixtures.user.email }),
    })

    expect(response.status).toBe(204)
  })
})
