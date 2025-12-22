import { z } from 'zod'
import { OpenAPIEndpoint } from '../../generic/create'
import { AppContext } from '../../..'
import { errorRes } from '../../../lib/response'
import { generateRandomString } from '../../../lib/generators'
import { sendMail } from '../../../services/email.service'

const requestPayload = z.object({
  email: z.string().email().trim().toLowerCase(),
})

export class ForgotPassword extends OpenAPIEndpoint {
  meta = {
    tag: 'Auth - Forgot Password',
    summary: 'Forgot Password',
    collection: undefined,
    requestSchema: z.object({
      body: requestPayload,
    }),
    responseSchema: z.object({}),
  }

  async action(c: AppContext, { body }: typeof this.meta.requestSchema._type) {
    const user = await c.env.PRISMA.user.findFirst({
      where: {
        email: body.email,
        deleted_at: null,
      },
    })

    if (!user) {
      return errorRes(c, 'User not found', 404)
    }

    const forgotToken = generateRandomString(6, true)

    await c.env.PRISMA.user.update({
      where: { id: user.id },
      data: {
        meta: {
          forgot_token: forgotToken,
        },
      },
    })

    await sendMail(c.env, {
      to: [user.email],
      subject: 'Ajebo Camp Password Reset Token',
      template: {
        id: 'password-reset',
        variables: {
          firstname: user.firstname,
          forgot_token: forgotToken,
        },
      },
    })

    return c.newResponse(null, 204)
  }
}
