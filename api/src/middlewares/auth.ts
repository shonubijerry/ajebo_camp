import { verify } from 'hono/jwt'
import { AppContext } from '..'

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
    // verify token — consumer may need to adjust depending on `hono/jwt` version
    const payload = await verify(token, c.env.JWT_SECRET)
    ;(c as any).user = payload
    await next()
  } catch (err) {
    return c.json(
      { success: false, errors: [{ code: 4011, message: 'Invalid token' }] },
      401,
    )
  }
}
