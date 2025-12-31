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
    requestSchema: z.AnyZodObject | null
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
  async preAction(): Promise<
    typeof this.meta.requestSchema extends z.AnyZodObject
      ? (typeof this.meta.requestSchema)['_type']
      : unknown
  > {
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
      request: this.meta.requestSchema
        ? {
            ...this.meta.requestSchema.shape,
            body: contentJson(this.meta.requestSchema.shape.body),
          }
        : undefined,
      responses: {
        '200': {
          description: `Operation successfully`,
          ...contentJson(
            z.object({
              success: z.literal(true),
              data: this.meta.responseSchema,
            }),
          ),
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

    return successRes(c, result)
  }

  handleValidationError(errors: z.ZodIssue[]) {
    return Response.json(
      {
        success: false,
        errors: errors.map((error) => {
          const path = error.path.slice(1).join('.')

          switch (error.code) {
            case 'invalid_type':
              return `${path}: Expected ${error.expected}, but received ${error.received}`

            case 'too_small':
              if (error.type === 'string') {
                return `${path}: Must be at least ${error.minimum} characters`
              }
              if (error.type === 'number') {
                return `${path}: Must be at least ${error.minimum}`
              }
              if (error.type === 'array') {
                return `${path}: Must have at least ${error.minimum} items`
              }
              return `${path}: Value is too small`

            case 'too_big':
              if (error.type === 'string') {
                return `${path}: Must be at most ${error.maximum} characters`
              }
              if (error.type === 'number') {
                return `${path}: Must be at most ${error.maximum}`
              }
              if (error.type === 'array') {
                return `${path}: Must have at most ${error.maximum} items`
              }
              return `${path}: Value is too large`

            case 'invalid_string':
              if (error.validation === 'email') {
                return `${path}: Invalid email address`
              }
              if (error.validation === 'url') {
                return `${path}: Invalid URL`
              }
              return `${path}: Invalid format`

            case 'invalid_enum_value':
              return `${path}: Must be one of: ${error.options.join(', ')}`

            default:
              return error.message || `${path}: Validation failed`
          }
        }),
      },
      { status: 400 },
    )
  }
}
