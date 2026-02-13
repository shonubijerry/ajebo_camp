import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { AppBindings } from '../types'
import { paystackWebhook } from './webhooks/paystack'

/**
 * Register webhook routes (no authentication required)
 */
const app = fromHono(new Hono<AppBindings>())

app.post('/paystack', paystackWebhook)

export default app
