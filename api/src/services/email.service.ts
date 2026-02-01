import { Attachment, Resend } from 'resend'
import { Env } from '../env'
import { ApiException } from 'chanfana'

/**
 * Send html email
 * @param c
 * @param data
 * @returns
 */
export const sendMail = async (
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

export const sendHtmlMail = async (
  env: Env,
  to: string,
  subject: string,
  html: string,
  attachments?: Attachment[],
) => {
  const resend = new Resend(env.RESEND_API_KEY)

  return resend.emails
    .send({
      to,
      from: 'reg@equaex.com',
      subject,
      html,
      attachments,
    })
    .then((resp) => {
      if (resp.error) {
        throw new ApiException(JSON.stringify(resp.error))
      }
    })
}
