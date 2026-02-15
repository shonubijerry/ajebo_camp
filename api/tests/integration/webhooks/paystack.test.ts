import { SELF, env } from 'cloudflare:test'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { mockPrisma } from '../../utils/mockPrisma'

async function generatePaystackSignature(payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(env.PAYSTACK_SECRET_KEY)
  const messageData = encoder.encode(payload)

  // 1. Import the secret as a CryptoKey
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  )

  // 2. Sign the payload
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData)

  // 3. Convert the ArrayBuffer to a Hex string
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// let signature =
//   'baea57d41245cce40bcbf3e0d19922cfdb0ca8c55a6cdb3816fea669d0f528913b2ef319fc5f8757af09b8bf0c8f468bd49e0b8b63c3b9b361d4be749d5fa3fc'

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
          'x-paystack-signature': await generatePaystackSignature(payload),
        },
        body: payload,
      },
    )
    const body = await response.json<{ success: boolean }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 401 when signature is missing', async () => {
    const payload = JSON.stringify({ event: 'charge.success', data: {} })

    const response = await SELF.fetch(
      'http://local.test/api/v1/webhooks/paystack',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      },
    )

    expect(response.status).toBe(401)
  })

  it('returns 401 when signature is invalid', async () => {
    const payload = JSON.stringify({ event: 'charge.success', data: {} })

    const response = await SELF.fetch(
      'http://local.test/api/v1/webhooks/paystack',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paystack-signature': 'invalid',
        },
        body: payload,
      },
    )

    expect(response.status).toBe(401)
  })

  it('ignores non charge.success events', async () => {
    const payload = JSON.stringify({ event: 'invoice.update', data: {} })
    const signature = await generatePaystackSignature(payload)

    const response = await SELF.fetch(
      'http://local.test/api/v1/webhooks/paystack',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paystack-signature': signature,
        },
        body: payload,
      },
    )

    expect(response.status).toBe(200)
  })

  it('returns 404 when campite is not found', async () => {
    mockPrisma.campite.findFirst.mockResolvedValueOnce(null)

    const payload = JSON.stringify({
      event: 'charge.success',
      data: { reference: 'missing', amount: 10000 },
    })

    const response = await SELF.fetch(
      'http://local.test/api/v1/webhooks/paystack',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paystack-signature': await generatePaystackSignature(payload),
        },
        body: payload,
      },
    )

    expect(response.status).toBe(404)
  })

  it('returns 200 when payment already exists', async () => {
    mockPrisma.payment.findFirst.mockResolvedValueOnce(fixtures.payment)

    const payload = JSON.stringify({
      event: 'charge.success',
      data: { reference: fixtures.payment.reference, amount: 15000 },
    })

    const response = await SELF.fetch(
      'http://local.test/api/v1/webhooks/paystack',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paystack-signature': await generatePaystackSignature(payload),
        },
        body: payload,
      },
    )

    expect(response.status).toBe(200)
  })

  it('returns 500 when payment creation fails', async () => {
    vi.spyOn(console, 'log').mockImplementationOnce(() => undefined)
    mockPrisma.payment.create.mockRejectedValueOnce(new Error('boom'))

    const payload = JSON.stringify({
      event: 'charge.success',
      data: { reference: fixtures.payment.reference, amount: 15000 },
    })

    const response = await SELF.fetch(
      'http://local.test/api/v1/webhooks/paystack',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paystack-signature': await generatePaystackSignature(payload),
        },
        body: payload,
      },
    )

    expect(response.status).toBe(500)
  })
})
