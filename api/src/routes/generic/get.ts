import { OpenAPIRoute, OpenAPIRouteSchema, contentJson } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../..'
import { Env } from '../../env'
import { AwaitedReturnType } from './types'

/**
 * Generic UpdateEndpoint for streamlined resource updates.
 *
 * @template TRequestSchema Zod schema for request body
 * @template TUpdateInput   Type passed to Prisma (usually z.input<TRequestSchema>)
 */
export abstract class GetEndpoint<T> extends OpenAPIRoute {
  /** Zod schema for success response */
  abstract requestSchema: typeof this.schema.request
  abstract responseSchema: z.AnyZodObject

  /** Prisma collection name (e.g. 'user', 'campaign') */
  abstract collection: keyof Env['PRISMA']

  /**
   * Optional hook to mutate or replace input before persistence
   */
  async preAction(data: {
    query?: any
    params?: { id: string } & Record<string, string>
    headers: any
  }) {
    return { id: data.params?.id }
  }

  /**
   * Prisma update action
   */
  async action(c: AppContext, where: T): Promise<unknown> {
    throw new Error('action not implemented for ' + this.constructor.name)
  }

  /**
   * Optional hook to transform database result before responding
   */
  async afterAction(data: AwaitedReturnType<typeof this.action>) {
    return data
  }

  /**
   * OpenAPI schema (resolved lazily)
   */
  getSchema(): OpenAPIRouteSchema {
    return {
      ...this.getSchema(),
      tags: [String(this.collection)],
      summary: `Update ${String(this.collection)}`,
      description: `Updates an existing ${String(this.collection)} in the system.`,
      request: this.requestSchema,
      responses: {
        '200': {
          description: `${String(this.collection)} updated successfully`,
          ...contentJson(this.responseSchema),
        },
        '400': {
          description: 'Validation error',
          ...contentJson(
            z.object({
              success: z.literal(false),
              errors: z.array(
                z.object({
                  code: z.string(),
                  message: z.string(),
                }),
              ),
            }),
          ),
        },
        '404': {
          description: 'Resource not found',
          ...contentJson(
            z.object({
              success: z.literal(false),
              error: z.string(),
            }),
          ),
        },
      },
    }
  }

  async handle(c: AppContext) {
    const validated = await this.getValidatedData()
    const input = await this.preAction(validated)

    const dbResult = await this.action(c, input as any)

    return c.json(
      {
        success: true,
        data: await this.afterAction(dbResult),
      },
      200,
    )
  }
}
