import { OpenAPIRoute, OpenAPIRouteSchema, contentJson } from 'chanfana'
import { z } from '@hono/zod-openapi'
import { AppContext } from '../..'
import { Env } from '../../env'
import { GenericError, parseQuerySort, queryStringToPrismaWhere } from './query'
import { OpenAPIEndpoint } from './create'
import { Prisma } from '@ajebo_camp/database'
import { AwaitedReturnType } from './types'

/* ---------------------------------------------
 * List request query schema
 * --------------------------------------------- */

export const listRequestQuerySchema = z.object({
  page: z
    .number()
    .int()
    .default(1)
    .describe(
      'The page number to retrieve. If set to 0, all records are returned.',
    ),
  per_page: z
    .number()
    .int()
    .max(100)
    .default(20)
    .describe('Number of records per page.'),
  orderBy: z.string().optional().openapi({
    example: '[firstname]=desc&[created_at]=desc',
    description: 'Filter criteria in Prisma-like format',
  }),
  filter: z.string().optional().openapi({
    example: '[firstname][contains]=string',
    description: 'Filter criteria in Prisma-like format',
  }),
})

export const responseMetaSchema = z.object({
  page: z.number().int().min(1),
  per_page: z.number().int().min(1),
  total: z.number().int().min(0),
  total_pages: z.number().int().min(0),
})

export const responseListSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    meta: responseMetaSchema,
  })

/* ---------------------------------------------
 * Generic list endpoint
 * --------------------------------------------- */

/**
 * Generic ListEndpoint for streamlined resource listing.
 *
 * @template TQuerySchema    Zod schema for query parameters
 * @template TWhereInput     Prisma where input type
 * @template TOrderByInput   Prisma orderBy input type
 */
export abstract class ListEndpoint<
  TWhereInput,
  TOrderByInput,
> extends OpenAPIEndpoint {
  /** Zod schema for query parameters */
  abstract meta: {
    requestSchema: typeof listRequestQuerySchema
    responseSchema: z.AnyZodObject
    tag?: string
    summary?: string
    description?: string
    collection?: Prisma.ModelName
    security?: Array<{ bearer: [] }>
  }

  /** Default page size */
  protected pageSize = 25

  /** Maximum page size */
  protected maxPageSize = 100

  /**
   * Optional hook to mutate or replace input before persistence
   */
  async preAction() {
    const validated = await this.getValidatedData()
    const { query } = validated

    const where = queryStringToPrismaWhere<TWhereInput>(query.filter)
    const per_page = Math.min(
      Number(query.per_page ?? this.pageSize),
      this.maxPageSize,
    )

    if (query.page === 0) {
      return {
        page: 0,
        where,
        orderBy: parseQuerySort<TOrderByInput>(query.orderBy),
      }
    }

    const page = Math.max(1, Number(query.page ?? 1))

    const skip = (page - 1) * per_page

    return {
      page,
      take: per_page,
      skip,
      where,
      orderBy: parseQuerySort<TOrderByInput>(query.orderBy),
    }
  }

  async action(
    c: AppContext,
    data: AwaitedReturnType<typeof this.preAction>,
  ): Promise<Response | { data: unknown; total?: number }> {
    throw new Error('action implemented for ' + this.constructor.name)
  }

  getSchema() {
    return {
      tags: this.meta.tag ? [this.meta.tag] : [String(this.meta.collection)],
      summary:
        this.meta.summary ?? `List ${this.meta.collection?.toLowerCase()}`,
      description:
        this.meta.description ??
        `Endpoint to list ${this.meta.collection?.toLowerCase()}`,
      security: this.meta.security ?? [{ bearer: [] }],
      request: {
        query: listRequestQuerySchema,
      },
      responses: {
        '200': {
          description: `Operation successfully`,
          ...contentJson(responseListSchema(this.meta.responseSchema)),
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
    const params = await this.preAction()

    const result = await this.action(c, params)

    if (result instanceof Response) {
      return result
    }

    return c.json(
      {
        success: true,
        data: result.data,
        ...(params.page && {
          meta: {
            page: params.page,
            per_page: params.take,
            total: result.total,
            total_pages: Math.ceil(
              (result.total ?? 0) / (params.take ?? this.pageSize),
            ),
          },
        }),
      },
      200,
    )
  }
}
