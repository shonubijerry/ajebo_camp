import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { AppBindings } from '../types'
import { paystackWebhook } from './webhooks/paystack'

/**
 * Register webhook routes (no authentication required)
 */
export const registerWebhookRoutes = (
  app: ReturnType<typeof fromHono<Hono<AppBindings>>>,
) => {
  app.post('/webhooks/paystack', paystackWebhook)
}
