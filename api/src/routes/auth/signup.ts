import { z } from 'zod'
import { OpenAPIEndpoint } from '../generic/create'
import { AppContext } from '../..'
import { sign } from 'hono/jwt'
import { requestBodies, userResponse } from '../../schemas'
import { errorRes, successRes } from '../../lib/response'
import { hash } from '../../lib/encrypt'
import { getPermissionsForRole, Role } from '../../lib/permissions'

export class SignupEndpoint extends OpenAPIEndpoint {
  meta = {
    tag: 'Auth',
    summary: 'Sign up',
    description: 'Sign up to gain authentication with the system',
    security: [],
    responseSchema: userResponse.extend({
      token: z.string(),
      permissions: z.array(z.string()),
    }),
    requestSchema: z.object({
      body: requestBodies.user.extend({
        password: z.string().optional(),
      }),
    }),
  }

  async action(c: AppContext, data: typeof this.meta.requestSchema._type) {
    const { role, ...rest } = data.body

    const exists = await c.env.PRISMA.user.findUnique({
      where: { email: rest.email },
    })

    if (exists) {
      return errorRes(c, 'User with email already exists', 409)
    }

    if (rest.password) {
      rest.password = await hash(c.env.SALT_ROUND, rest.password)
    }

    const user = await c.env.PRISMA.user.create({ data: rest })

    const permissions = getPermissionsForRole(user.role as Role)
    const payload = { sub: user.id, email: user.email, role: user.role }

    const token = await sign(payload, c.env.JWT_SECRET)

    return {
      ...user,
      password: undefined,
      token,
      permissions,
    }
  }
}

export default SignupEndpoint
