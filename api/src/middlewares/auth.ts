import { verify } from 'hono/jwt'
import { AppContext } from '../types'
import { getPermissionsForRole } from '../lib/permissions'

export const authMiddleware = async (
  c: AppContext,
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

    const payload = (await verify(token, c.env.JWT_SECRET)) as NonNullable<
      AppContext['user']
    >
    const permissions = getPermissionsForRole(payload.role)

    c.user = {
      ...payload,
      permissions,
    }
    await next()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return c.json(
      { success: false, errors: [{ code: 4011, message: 'Invalid token' }] },
      401,
    )
  }
}
