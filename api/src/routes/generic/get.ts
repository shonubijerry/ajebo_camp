import { OpenAPIRoute, OpenAPIRouteSchema, contentJson } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../..'
import { Env } from '../../env'

export const getRequestSchema = z.object({ id: z.string() })

export abstract class GetEndpoint<T, U> extends OpenAPIRoute {
  abstract responseSchema: z.ZodTypeAny
  abstract collection: keyof Env['PRISMA']

  getSchema(): OpenAPIRouteSchema {
    return {
      tags: [String(this.collection)],
      summary: `Get ${String(this.collection)} by id`,
      request: { body: contentJson(getRequestSchema) },
      responses: {
        '200': { description: 'Get success', ...contentJson(this.responseSchema) },
        '404': { description: 'Not found' },
      },
    }
  }

  async handle(c: AppContext) {
    const body = await this.getValidatedData()
    const { id } = body.body as { id: string }

    // @ts-ignore
    const found = await c.env.PRISMA[this.collection].findUnique({ where: { id } })

    if (!found) {
      return { success: false, error: 'Not found' }
    }

    return { success: true, data: found }
  }
}
