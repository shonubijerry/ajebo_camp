import { OpenAPIRoute, OpenAPIRouteSchema, contentJson } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../..'
import { Env } from '../../env'

export const updateRequestSchema = z.object({ id: z.string(), data: z.record(z.any()) })

export abstract class UpdateEndpoint<T, U> extends OpenAPIRoute {
  abstract requestBodySchema: z.ZodTypeAny
  abstract responseSchema: z.ZodTypeAny
  abstract collection: keyof Env['PRISMA']

  getSchema(): OpenAPIRouteSchema {
    return {
      tags: [String(this.collection)],
      summary: `Update ${String(this.collection)}`,
      request: { body: contentJson(this.requestBodySchema) },
      responses: {
        '200': { description: 'Update success', ...contentJson(this.responseSchema) },
        '400': { description: 'Validation error' },
      },
    }
  }

  protected async transformData(data: any) {
    return data
  }

  async handle(c: AppContext) {
    const body = await this.getValidatedData()
    const { id, data } = body.body as { id: string; data: Record<string, unknown> }

    const toSave = await this.transformData(data)

    // @ts-ignore dynamic model access
    const updated = await c.env.PRISMA[this.collection].update({ where: { id }, data: toSave })

    return { success: true, data: updated }
  }
}
