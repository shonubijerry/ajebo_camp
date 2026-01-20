import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { AppBindings } from '../types'
import LoginEndpoint from './auth/login'
import SignupEndpoint from './auth/signup'
import { ForgotPassword } from './auth/forgot_pass/forgot_password'
import { ChangePasswordPublic } from './auth/forgot_pass/change_password'
import { ListDistrictsEndpoint } from './districts'
import { ListCampsEndpoint, GetCampEndpoint } from './camps'
import { GetMediaEndpoint } from './media'

/**
 * Register public routes that don't require authentication
 */
export const registerPublicRoutes = (
  app: ReturnType<typeof fromHono<Hono<AppBindings>>>,
) => {
  // Auth routes
  app.post('/auth/login', LoginEndpoint)
  app.post('/auth/signup', SignupEndpoint)
  app.post('/forgot', ForgotPassword)
  app.post('/forgot/change-password/:code', ChangePasswordPublic)

  // Public data access routes
  app.get('/districts/list', ListDistrictsEndpoint)
  app.get('/camps/list', ListCampsEndpoint)
  app.get('/camps/:id', GetCampEndpoint)

  // Media serving (local dev)
  app.get('/media/:key', GetMediaEndpoint)
}
