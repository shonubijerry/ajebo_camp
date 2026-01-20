import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { AppBindings } from '../types'
import {
  CreateUserEndpoint,
  GetCurrentUserEndpoint,
  ListUsersEndpoint,
  GetUserEndpoint,
  UpdateUserEndpoint,
  DeleteUserEndpoint,
} from './users'
import {
  CreateCampEndpoint,
  DeleteCampEndpoint,
  UpdateCampEndpoint,
} from './camps'
import {
  CreateCampAllocationEndpoint,
  DeleteCampAllocationEndpoint,
  GetCampAllocationEndpoint,
  ListCampAllocationsEndpoint,
  UpdateCampAllocationEndpoint,
} from './camp_allocations'
import {
  CreateCampiteEndpoint,
  BulkCreateCampitesEndpoint,
  ExportCampitesEndpoint,
  DeleteCampiteEndpoint,
  GetCampiteEndpoint,
  ListCampitesEndpoint,
  UpdateCampiteEndpoint,
} from './campites'
import { GetPaymentEndpoint, ListPaymentsEndpoint } from './payments'
import {
  CreateEntityEndpoint,
  DeleteEntityEndpoint,
  GetEntityEndpoint,
  ListEntitiesEndpoint,
  UpdateEntityEndpoint,
} from './entities'
import {
  CreateDistrictEndpoint,
  DeleteDistrictEndpoint,
  GetDistrictEndpoint,
  UpdateDistrictEndpoint,
} from './districts'
import {
  GetDashboardAnalyticsEndpoint,
  GetDetailedAnalyticsEndpoint,
} from './analytics'

/**
 * Register protected routes that require authentication
 * These routes are protected by the authMiddleware
 */
export const registerProtectedRoutes = (
  app: ReturnType<typeof fromHono<Hono<AppBindings>>>,
) => {
  // User routes
  app.post('/users', CreateUserEndpoint)
  app.get('/users/me', GetCurrentUserEndpoint)
  app.get('/users/list', ListUsersEndpoint)
  app.get('/users/:id', GetUserEndpoint)
  app.patch('/users/:id', UpdateUserEndpoint)
  app.delete('/users/:id', DeleteUserEndpoint)

  // District routes
  app.post('/districts', CreateDistrictEndpoint)
  app.get('/districts/:id', GetDistrictEndpoint)
  app.patch('/districts/:id', UpdateDistrictEndpoint)
  app.delete('/districts/:id', DeleteDistrictEndpoint)

  // Entity routes
  app.post('/entities', CreateEntityEndpoint)
  app.get('/entities/list', ListEntitiesEndpoint)
  app.get('/entities/:id', GetEntityEndpoint)
  app.patch('/entities/:id', UpdateEntityEndpoint)
  app.delete('/entities/:id', DeleteEntityEndpoint)

  // Payment routes
  app.get('/payments/list', ListPaymentsEndpoint)
  app.get('/payments/:id', GetPaymentEndpoint)

  // Campite routes
  app.post('/campites', CreateCampiteEndpoint)
  app.post('/campites/bulk', BulkCreateCampitesEndpoint)
  app.get('/campites/export', ExportCampitesEndpoint)
  app.get('/campites/list', ListCampitesEndpoint)
  app.get('/campites/:id', GetCampiteEndpoint)
  app.patch('/campites/:id', UpdateCampiteEndpoint)
  app.delete('/campites/:id', DeleteCampiteEndpoint)

  // Camp Allocation routes
  app.post('/camp-allocations', CreateCampAllocationEndpoint)
  app.get('/camp-allocations/list', ListCampAllocationsEndpoint)
  app.get('/camp-allocations/:id', GetCampAllocationEndpoint)
  app.patch('/camp-allocations/:id', UpdateCampAllocationEndpoint)
  app.delete('/camp-allocations/:id', DeleteCampAllocationEndpoint)

  // Camp routes
  app.post('/camps', CreateCampEndpoint)
  app.patch('/camps/:id', UpdateCampEndpoint)
  app.delete('/camps/:id', DeleteCampEndpoint)

  // Analytics routes
  app.get('/analytics/dashboard', GetDashboardAnalyticsEndpoint)
  app.get('/analytics/detailed', GetDetailedAnalyticsEndpoint)
}
