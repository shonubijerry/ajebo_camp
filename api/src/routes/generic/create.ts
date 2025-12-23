import { OpenAPIRoute, OpenAPIRouteSchema, contentJson } from 'chanfana'
import { z } from 'zod'
import { GenericError } from './query'
import { AppContext } from '../..'
import { Prisma } from '@ajebo_camp/database'
import { AwaitedReturnType } from './types'
import { successRes } from '../../lib/response'

/**
 * Generic CreateEndpoint for streamlined resource creation.
 *
 * @template TRequestSchema Zod schema for request body
 * @template TCreateInput   Type passed to Prisma (usually z.input<TRequestSchema>)
 * @template TDbResult      Type returned from Prisma
 * @template TResponse      Type returned to the client
 */
export abstract class OpenAPIEndpoint extends OpenAPIRoute {
  abstract meta: {
    requestSchema: z.AnyZodObject
    responseSchema: z.AnyZodObject
    tag?: string
    summary?: string
    description?: string
    collection?: Prisma.ModelName
    security?: Array<{ bearer: [] }>
  }

  /**
   * Optional hook to mutate or replace input before persistence
   */
  async preAction(): Promise<typeof this.meta.requestSchema._type> {
    return this.getValidatedData()
  }

  async action(
    c: AppContext,
    data: AwaitedReturnType<typeof this.preAction>,
  ): Promise<Response | unknown> {
    throw new Error('action implemented for ' + this.constructor.name)
  }

  /**
   * OpenAPI schema (resolved lazily)
   */
  getSchema(): OpenAPIRouteSchema {
    return {
      tags: this.meta.tag ? [this.meta.tag] : [String(this.meta.collection)],
      summary:
        this.meta.summary ?? `Create ${this.meta.collection?.toLowerCase()}`,
      description:
        this.meta.description ??
        `Endpoint to create ${this.meta.collection?.toLowerCase()}`,
      security: this.meta.security ?? [{ bearer: [] }],
      request: {
        ...this.meta.requestSchema.shape,
        body: contentJson(this.meta.requestSchema.shape.body),
      },
      responses: {
        '200': {
          description: `Operation successfully`,
          ...contentJson(this.meta.responseSchema),
        },
        '400': {
          description: 'Validation error',
          ...contentJson(GenericError),
        },
        '401': {
          description: 'Validation error',
          ...contentJson(GenericError),
        },
        '500': {
          description: 'Server error',
          ...contentJson(GenericError),
        },
      },
    }
  }

  async handle(c: AppContext) {
    const data = await this.preAction()

    const result = await this.action(c, data)

    if (result instanceof Response) {
      return result
    }

    return successRes(c, data)
  }
}
