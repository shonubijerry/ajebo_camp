import { SELF } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { mockPrisma } from '../../utils/mockPrisma'

describe('POST /api/v1/webhooks/paystack', () => {
  beforeEach(() => {
    mockPrisma.campite.findFirst.mockResolvedValue({
      ...fixtures.campite,
      payment_ref: fixtures.payment.reference,
    })
    mockPrisma.payment.findFirst.mockResolvedValue(null)
    mockPrisma.payment.create.mockResolvedValue(fixtures.payment)
  })

  it('records payment for charge.success', async () => {
    const payload = JSON.stringify({
      event: 'charge.success',
      data: {
        id: 1,
        domain: 'test',
        status: 'success',
        reference: fixtures.payment.reference,
        amount: 1500000,
        message: null,
        gateway_response: 'Approved',
        paid_at: '2025-01-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        channel: 'card',
        currency: 'NGN',
        ip_address: '127.0.0.1',
        metadata: {},
        customer: {
          id: 1,
          first_name: 'Ada',
          last_name: 'Okafor',
          email: fixtures.user.email,
          customer_code: 'CUST_123',
          phone: fixtures.user.phone,
        },
      },
    })

    const response = await SELF.fetch(
      'http://local.test/api/v1/webhooks/paystack',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paystack-signature':
            'baea57d41245cce40bcbf3e0d19922cfdb0ca8c55a6cdb3816fea669d0f528913b2ef319fc5f8757af09b8bf0c8f468bd49e0b8b63c3b9b361d4be749d5fa3fc',
        },
        body: payload,
      },
    )
    const body = await response.json<{ success: boolean }>()

    console.log('body', body)

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })
})
