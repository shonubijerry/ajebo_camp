import { fromHono } from 'chanfana'
import { Hono } from 'hono'

// Configuration
import { createOpenApiApp, registerSecuritySchemes } from './config/openapi'
import { corsConfig } from './config/cors'

// Types
import { AppBindings } from './types'

// Middleware
import { authMiddleware } from './middlewares/auth'
import { botProtection } from './middlewares/bot-protection'
import { errorHandler } from './middlewares/error-handler'
import { prismaMiddleware } from './lib/prisma'

// Route registrations
import { registerPublicRoutes } from './routes/index.public'
import { registerWebhookRoutes } from './routes/index.webhooks'
import { registerProtectedRoutes } from './routes/index.protected'

// Initialize OpenAPI app
const baseApp = createOpenApiApp()

// Apply global middleware
baseApp.use(corsConfig)
baseApp.use(botProtection)
baseApp.use(prismaMiddleware)

// Register error handler
baseApp.onError(errorHandler)

// Register security schemes for OpenAPI
registerSecuritySchemes(baseApp)

// Create API routes app
const app = fromHono(new Hono<AppBindings>())

// Register public routes (no authentication)
registerPublicRoutes(app)

// Register webhook routes (no authentication)
registerWebhookRoutes(app)

// Apply authentication middleware for protected routes
app.use(authMiddleware)

// Register protected routes (require authentication)
registerProtectedRoutes(app)

// Mount API routes under /api/v1
baseApp.route('/api/v1', app)

// Export the main app
export default baseApp
