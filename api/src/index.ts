import { PrismaClient } from '@ajebo_camp/database'
import { ApiException, fromHono } from 'chanfana'
import { Context, Hono } from 'hono'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { Env } from './env'
import { WorkerEntrypoint } from 'cloudflare:workers'
import {
  CreateUserEndpoint,
  ListUsersEndpoint,
  GetUserEndpoint,
  UpdateUserEndpoint,
  DeleteUserEndpoint,
} from './routes/users'
import { CreateCampEndpoint } from './routes/camps'
import { CreateCampAllocationEndpoint } from './routes/camp_allocations'
import { CreateCampiteEndpoint } from './routes/campites'
import { CreatePaymentEndpoint } from './routes/payments'
import { CreateEntityEndpoint } from './routes/entities'
import { CreateDistrictEndpoint } from './routes/districts'

export type AppBindings = { Bindings: Env }
export type AppContext = Context<AppBindings>

// Setup OpenAPI registry
const app = fromHono(new Hono<AppBindings>(), {
  docs_url: '/',
  schema: {
    info: {
      title: 'Ajebo Camp Management System',
      version: '2.0.0',
      description:
        'This is the documentation for Ajebo Camp Management System.',
    },
  },
})

// Bot middleware and reject if score is lower than 30
app.use('*', async (c, next) => {
  const botScore = c.req.header('cf-bot-score')
  if (botScore && Number(botScore) < 30) {
    return c.json(
      {
        success: false,
        errors: [{ code: 6001, message: 'Bot traffic is not allowed.' }],
      },
      403,
    )
  }
  await next()
})

app.onError((err, c) => {
  if (err instanceof ApiException) {
    // If it's a Chanfana ApiException, let Chanfana handle the response
    return c.json(
      { success: false, errors: err.buildResponse() },
      err.status as ContentfulStatusCode,
    )
  }

  console.error('Global error handler caught:', err) // Log the error if it's not known

  // For other errors, return a generic 500 response
  return c.json(
    {
      success: false,
      errors: [{ code: 7000, message: 'Internal Server Error' }],
    },
    500,
  )
})

app.use('*', async (c, next) => {
  c.env.PRISMA = c.env.DATABASE.prisma() as PrismaClient
  await next()
})

// Register endpoints
app.post('/users', CreateUserEndpoint)
app.get('/users/list', ListUsersEndpoint)
// app.post('/users/get', GetUserEndpoint)
app.patch('/users/:id', UpdateUserEndpoint)
app.delete('/users/:id', DeleteUserEndpoint)

// Create endpoints for other collections
// app.post('/camps', CreateCampEndpoint)
// app.post('/camp_allocations', CreateCampAllocationEndpoint)
// app.post('/campites', CreateCampiteEndpoint)
// app.post('/payments', CreatePaymentEndpoint)
// app.post('/entities', CreateEntityEndpoint)
// app.post('/districts', CreateDistrictEndpoint)

export default app
