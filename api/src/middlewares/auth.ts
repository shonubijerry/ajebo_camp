import { verify } from 'hono/jwt'
import { z } from 'zod'
import { AppContext } from '../types'
import { userResponse } from '../schemas'
import { getPermissionsForRole, Role } from '../lib/permissions'

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

export const authMiddleware = async (
  c: AppContext & {
    user?: AuthenticatedUser
  },
  next: () => Promise<unknown>,
) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : undefined
  if (!token) {
    return c.json(
      { success: false, errors: [{ code: 4010, message: 'Unauthorized' }] },
      401,
    )
  }

  try {
    if (!c.env.JWT_SECRET) {
      return c.json(
        {
          success: false,
          errors: [{ code: 5001, message: 'JWT secret not configured' }],
        },
        500,
      )
    }
    // verify token — consumer may need to adjust depending on `hono/jwt` version
    const payload = (await verify(
      token,
      c.env.JWT_SECRET,
    )) as BaseAuthenticatedUser
    const permissions = getPermissionsForRole(payload.role as Role)

    c.user = {
      ...payload,
      permissions,
    }
    await next()
  } catch (err) {
    return c.json(
      { success: false, errors: [{ code: 4011, message: 'Invalid token' }] },
      401,
    )
  }
}
