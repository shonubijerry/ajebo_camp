import { Context } from 'hono'
import { AppContext } from '../..'
import { Env } from '../../env'

interface PaystackChargeEvent {
  event: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: any
    customer: {
      id: number
      first_name: string
      last_name: string
      email: string
      customer_code: string
      phone: string | null
    }
  }
}

/**
 * Verify Paystack webhook signature using Web Crypto API
 */
async function verifyPaystackSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  )
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload),
  )
  
  const hashArray = Array.from(new Uint8Array(signatureBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hash === signature
}

/**
 * Paystack webhook endpoint for charge.success events
 * Saves payment details to the payment table
 */
export async function paystackWebhook(c: AppContext) {
  try {
    const signature = c.req.header('x-paystack-signature')
    const paystackSecret = c.env.PAYSTACK_SECRET_KEY

    if (!signature || !paystackSecret) {
      return c.json(
        { success: false, error: 'Missing signature or secret' },
        401,
      )
    }

    // Get raw body for signature verification
    const rawBody = await c.req.text()

    // Verify signature
    const isValid = await verifyPaystackSignature(rawBody, signature, paystackSecret)
    if (!isValid) {
      return c.json({ success: false, error: 'Invalid signature' }, 401)
    }

    // Parse the event
    const event: PaystackChargeEvent = JSON.parse(rawBody)

    // Only process charge.success events
    if (event.event !== 'charge.success') {
      return c.json({ success: true, message: 'Event ignored' }, 200)
    }

    const { reference, amount, customer } = event.data

    // Find campite by payment reference
    const campite = await c.env.PRISMA.campite.findFirst({
      where: { payment_ref: reference },
    })

    if (!campite) {
      console.error(`Campite not found for payment reference: ${reference}`)
      return c.json(
        { success: false, error: 'Campite not found' },
        404,
      )
    }

    // Check if payment already exists
    const existingPayment = await c.env.PRISMA.payment.findFirst({
      where: { reference },
    })

    if (existingPayment) {
      return c.json(
        { success: true, message: 'Payment already recorded' },
        200,
      )
    }

    // Create payment record
    await c.env.PRISMA.payment.create({
      data: {
        reference,
        amount: Math.floor(amount / 100), // Convert from kobo to naira
        user_id: campite.user_id,
        camp_id: campite.camp_id,
      },
    })

    return c.json(
      { success: true, message: 'Payment recorded successfully' },
      200,
    )
  } catch (error: any) {
    console.error('Paystack webhook error:', error)
    return c.json(
      { success: false, error: error.message || 'Internal server error' },
      500,
    )
  }
}
