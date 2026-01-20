import { z } from 'zod'
import { OpenAPIEndpoint } from '../../generic/create'
import { hash } from '../../../lib/encrypt'
import { sign } from 'hono/jwt'
import { AppContext } from '../../../types'
import { userResponse } from '../../../schemas'

const ChangePasswordPublicSchema = z.object({
  password: z.string().min(8),
})

export class ChangePasswordPublic extends OpenAPIEndpoint {
  meta = {
    tag: 'Auth - Forgot Password',
    summary: 'Change password for user who has a forgot token',
    collection: undefined,
    requestSchema: z.object({
      params: z.object({
        code: z.string(),
      }),
      body: ChangePasswordPublicSchema,
    }),
    responseSchema: userResponse.extend({
      token: z.string(),
      permissions: z.array(z.string()),
    }),
  }

  async action(
    c: AppContext,
    { params, body }: typeof this.meta.requestSchema._type,
  ) {
    const user = await c.env.PRISMA.user.findFirst({
      where: {
        meta: {
          equals: {
            forgot_token: params.code,
          },
        },
      },
    })

    if (!user) {
      return c.json(
        {
          success: false,
          errors: [{ code: 'NOT_FOUND', message: 'User not found' }],
        },
        404,
      )
    }

    const newPass = await hash(c.env.SALT_ROUND, body.password)
    const payload = { sub: user.id, email: user.email, role: user.role }

    const token = await sign(payload, c.env.JWT_SECRET)

    await c.env.PRISMA.user.update({
      where: { id: user.id },
      data: {
        password: newPass,
        meta: {
          forgot_token: null,
        },
      },
    })

    return c.json(
      {
        success: true,
        data: {
          ...user,
          token,
          meta: {
            ...user.meta,
            forgot_token: undefined,
          },
          password: undefined,
        } satisfies Record<string, unknown>,
      },
      200,
    )
  }
}
