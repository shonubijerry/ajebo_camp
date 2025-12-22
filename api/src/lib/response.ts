import { ContentfulStatusCode } from 'hono/utils/http-status'
import { AppContext } from '..'
import { unknown } from 'zod/v4'

export const errorRes = (
  c: AppContext,
  message: string | Array<string>,
  status: ContentfulStatusCode = 400,
) =>
  c.json(
    {
      success: false,
      errors: Array.isArray(message) ? message : [message],
    },
    status,
  )

export const successRes = (
  c: AppContext,
  data: unknown,
  status: ContentfulStatusCode = 200,
) =>
  c.json(
    {
      success: true,
      data: unknown,
    },
    status,
  )
