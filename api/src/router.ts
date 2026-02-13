import { fromHono } from 'chanfana'
import { Hono } from 'hono'

// Configuration
import { corsConfig } from './config/cors'

// Middleware
import { authMiddleware } from './middlewares/auth'
import { botProtection } from './middlewares/bot-protection'
import { errorHandler } from './middlewares/error-handler'
import { prismaMiddleware } from './lib/prisma'

// Route registrations
import publicRoutes from './routes/index.public'
import webhookRoutes from './routes/index.webhooks'
import protectedRoutes from './routes/index.protected'
import { AppBindings } from './types'

// Initialize base OpenAPI app for docs and global middleware
const baseApp = fromHono(new Hono<AppBindings>(), {
  docs_url: '/api/v1/internal-doc',
  schema: {
    info: {
      title: 'Ajebo Camp Management System',
      version: '2.0.0',
      description:
        'This is the documentation for Ajebo Camp Management System.',
    },
  },
})

// Apply global middleware
baseApp.use(corsConfig)
baseApp.use(botProtection)
baseApp.use(prismaMiddleware)

// Register error handler
baseApp.onError(errorHandler)

// Register security schemes for OpenAPI
baseApp.registry.registerComponent('securitySchemes', 'bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
})

// Initialize API app for versioned routes
const app = fromHono(new Hono<AppBindings>())

// Register public routes (no authentication)
app.route('/', publicRoutes)

// Register webhook routes (no authentication)
app.route('/webhooks', webhookRoutes)

// Apply authentication middleware for protected routes
app.use(authMiddleware)

// Register protected routes (require authentication)
app.route('/', protectedRoutes)

baseApp.route('/api/v1', app) // Mount the main app on the base app
baseApp.get('/', (c) => c.json({ status: 'ok' })) // Health check endpoint

// Export the main app
export default baseApp
