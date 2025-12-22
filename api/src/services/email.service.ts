import { Resend } from 'resend'
import { Env } from '../env'
import { ApiException } from 'chanfana'

/**
 * Send html email
 * @param c
 * @param data
 * @returns
 */
export const sendMail = (
  env: Env,
  data: {
    to: string | string[]
    subject: string
    template: {
      id: string
      variables?: Record<string, string | number>
    }
  },
) => {
  const resend = new Resend(env.RESEND_API_KEY)

  return resend.emails
    .send({
      to: data.to,
      subject: data.subject,
      template: data.template,
    })
    .then((resp) => {
      if (resp.error) {
        throw new ApiException(JSON.stringify(resp.error))
      }
    })
}
