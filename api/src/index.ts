import { PrismaClient } from '@ajebo_camp/database'
import { ApiException, fromHono, MultiException } from 'chanfana'
import { Context, Hono } from 'hono'
import { Env } from './env'
import {
  CreateUserEndpoint,
  ListUsersEndpoint,
  GetUserEndpoint,
  UpdateUserEndpoint,
  DeleteUserEndpoint,
} from './routes/users'
import LoginEndpoint from './routes/auth/login'
import {
  CreateCampEndpoint,
  DeleteCampEndpoint,
  GetCampEndpoint,
  ListCampsEndpoint,
  UpdateCampEndpoint,
} from './routes/camps'
import {
  CreateCampAllocationEndpoint,
  DeleteCampAllocationEndpoint,
  GetCampAllocationEndpoint,
  ListCampAllocationsEndpoint,
  UpdateCampAllocationEndpoint,
} from './routes/camp_allocations'
import {
  CreateCampiteEndpoint,
  DeleteCampiteEndpoint,
  GetCampiteEndpoint,
  ListCampitesEndpoint,
  UpdateCampiteEndpoint,
} from './routes/campites'
import { GetPaymentEndpoint, ListPaymentsEndpoint } from './routes/payments'
import {
  CreateEntityEndpoint,
  DeleteEntityEndpoint,
  GetEntityEndpoint,
  ListEntitiesEndpoint,
  UpdateEntityEndpoint,
} from './routes/entities'
import {
  CreateDistrictEndpoint,
  DeleteDistrictEndpoint,
  GetDistrictEndpoint,
  ListDistrictsEndpoint,
  UpdateDistrictEndpoint,
} from './routes/districts'
import { authMiddleware } from './middlewares/auth'
import { ForgotPassword } from './routes/auth/forgot_pass/forgot_password'
import { ChangePasswordPublic } from './routes/auth/forgot_pass/change_password'
import SignupEndpoint from './routes/auth/signup'

export type AppBindings = { Bindings: Env }
export type AppContext = Context<AppBindings>

// Setup OpenAPI registry
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

// Bot middleware and reject if score is lower than 30
baseApp.use('*', async (c, next) => {
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

baseApp.onError((err, c) => {
  if (err instanceof ApiException) {
    console.log(err)
    // If it's a Chanfana ApiException, let Chanfana handle the response
    return c.json(
      {
        success: false,
        errors: err.buildResponse(),
      }
    )
  }

  console.error('Global error caught:', err) // Log the error if it's not known

  // For other errors, return a generic 500 response
  return c.json(
    {
      success: false,
      errors: [{ code: 7000, message: 'Internal Server Error' }],
    },
    500,
  )
})

baseApp.use(async (c, next) => {
  c.env.PRISMA = c.env.DATABASE.prisma() as PrismaClient
  await next()
})

baseApp.registry.registerComponent('securitySchemes', 'bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
})

const app = fromHono(new Hono<AppBindings>())

// Public routes
app.post('/auth/login', LoginEndpoint)
app.post('/auth/signup', SignupEndpoint)


app.post('/forgot', ForgotPassword)
app.post('/forgot/change-password/:code', ChangePasswordPublic)

// Authenticate all subsequent requests using JWT in Authorization header
app.use(authMiddleware)

app.post('/users', CreateUserEndpoint)
app.get('/users/list', ListUsersEndpoint)
app.get('/users/:id', GetUserEndpoint)
app.patch('/users/:id', UpdateUserEndpoint)
app.delete('/users/:id', DeleteUserEndpoint)

// // Districts
app.post('/districts', CreateDistrictEndpoint)
app.get('/districts/list', ListDistrictsEndpoint)
app.get('/districts/:id', GetDistrictEndpoint)
app.patch('/districts/:id', UpdateDistrictEndpoint)
app.delete('/districts/:id', DeleteDistrictEndpoint)

// Entities
app.post('/entities', CreateEntityEndpoint)
app.get('/entities/list', ListEntitiesEndpoint)
app.get('/entities/:id', GetEntityEndpoint)
app.patch('/entities/:id', UpdateEntityEndpoint)
app.delete('/entities/:id', DeleteEntityEndpoint)

// Payments
app.get('/payments/list', ListPaymentsEndpoint)
app.get('/payments/:id', GetPaymentEndpoint)

// Campites
app.post('/campites', CreateCampiteEndpoint)
app.get('/campites/list', ListCampitesEndpoint)
app.get('/campites/:id', GetCampiteEndpoint)
app.patch('/campites/:id', UpdateCampiteEndpoint)
app.delete('/campites/:id', DeleteCampiteEndpoint)

// Camp Allocations
app.post('/camp-allocations', CreateCampAllocationEndpoint)
app.get('/camp-allocations/list', ListCampAllocationsEndpoint)
app.get('/camp-allocations/:id', GetCampAllocationEndpoint)
app.patch('/camp-allocations/:id', UpdateCampAllocationEndpoint)
app.delete('/camp-allocations/:id', DeleteCampAllocationEndpoint)

// Camps
app.post('/camps', CreateCampEndpoint)
app.get('/camps/list', ListCampsEndpoint)
app.get('/camps/:id', GetCampEndpoint)
app.patch('/camps/:id', UpdateCampEndpoint)
app.delete('/camps/:id', DeleteCampEndpoint)

baseApp.route('/api/v1', app)

export default baseApp
