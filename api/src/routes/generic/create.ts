import { OpenAPIRoute, OpenAPIRouteSchema, contentJson } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../..'
import { Env } from '../../env'
import { AwaitedReturnType } from './types'

/**
 * Generic CreateEndpoint for streamlined resource creation.
 *
 * @template TRequestSchema Zod schema for request body
 * @template TCreateInput   Type passed to Prisma (usually z.input<TRequestSchema>)
 * @template TDbResult      Type returned from Prisma
 * @template TResponse      Type returned to the client
 */
export abstract class CreateEndpoint<
  TCreateInput = z.AnyZodObject,
> extends OpenAPIRoute {
  /** Zod schema for request body validation */
  abstract requestBodySchema: typeof this.schema.request

  /** Zod schema for success response */
  abstract responseSchema: z.AnyZodObject

  /** Prisma collection name (e.g. 'user', 'campaign') */
  abstract collection: keyof Env['PRISMA']

  /**
   * Optional hook to mutate or replace input before persistence
   */
  async preAction(data: TCreateInput) {
    return data
  }

  /**
   * Prisma create action
   */
  async action(
    c: AppContext,
    data: AwaitedReturnType<typeof this.preAction>,
  ): Promise<unknown> {
    throw new Error('action implemented for ' + this.constructor.name)
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
      tags: [String(this.collection)],
      summary: `Create a new ${String(this.collection)}`,
      description: `Creates a new ${String(this.collection)} in the system.`,
      request: this.requestBodySchema,
      responses: {
        '200': {
          description: `${String(this.collection)} created successfully`,
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
      },
    }
  }

  async handle(c: AppContext) {
    const validated = await this.getValidatedData()
    const input = await this.preAction(validated.body)
    const dbResult = await this.action(c, input)

    return c.json(
      {
        success: true,
        data: await this.afterAction(dbResult),
      },
      201,
    )
  }
}
