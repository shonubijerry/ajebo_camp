import { Context } from 'hono'
import { Env } from '../env'
import { userResponse } from '@ajebo_camp/database'
import { getPermissionsForRole } from '../lib/permissions'
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const auth = userResponse
  .pick({
    email: true,
    role: true,
  })
  .extend({
    sub: z.string(),
  })

type BaseAuthenticatedUser = typeof auth._type

export type AuthenticatedUser = BaseAuthenticatedUser & {
  permissions: ReturnType<typeof getPermissionsForRole>
}

export type AppBindings = {
  Bindings: Env
}

export type AppContext = Context<AppBindings> & {
  user?: AuthenticatedUser
}
