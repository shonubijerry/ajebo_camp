import { z } from 'zod'
import { OpenAPIEndpoint } from '../generic/create'
import { ApiException } from 'chanfana'
import { AppContext } from '../..'
import { sign } from 'hono/jwt'
import { compare } from '../../lib/encrypt'
import { schemas, userResponse } from '../../schemas'
import { errorRes } from '../../lib/response'

export class LoginEndpoint extends OpenAPIEndpoint {
  meta = {
    tag: 'Auth',
    summary: 'Login',
    description: 'Login with email and password',
    security: [],
    responseSchema: userResponse.extend({
      token: z.string(),
    }),
    requestSchema: z.object({
      body: z.object({
        email: schemas.user.shape.email,
        password: z.string(),
      }),
    }),
  }

  async action(c: AppContext, data: typeof this.meta.requestSchema._type) {
    const { email, password } = data.body

    const user = await c.env.PRISMA.user.findUnique({
      where: { email, deleted_at: null },
    })

    if (!user) {
      return errorRes(c, 'Invalid Credentials', 401)
    }

    if (!c.env.SALT_ROUND) {
      throw new ApiException('JWT secret not configured')
    }

    if (!user.password) {
      return errorRes(
        c,
        'A password reset token has been sent to your email',
        401,
      )
    }

    if (!(await compare(c.env.SALT_ROUND, password, user.password))) {
      return errorRes(c, 'Invalid Credentials', 401)
    }

    const payload = { sub: user.id, email: user.email, role: user.role }

    const token = await sign(payload, c.env.JWT_SECRET)

    return c.json({
      ...user,
      password: undefined,
      token,
    })
  }
}

export default LoginEndpoint
