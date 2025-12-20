import { OpenAPIRoute, OpenAPIRouteSchema, contentJson } from 'chanfana'
import { z } from '@hono/zod-openapi'
import { AppContext } from '../..'
import { Env } from '../../env'
import { queryStringToPrismaWhere } from './query'

/* ---------------------------------------------
 * List request query schema
 * --------------------------------------------- */

export const listRequestQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(100).default(20),
  orderBy: z.array(z.record(z.enum(['asc', 'desc']))).optional(),
  filter: z.string().optional().openapi({
    example: '[firstname][contains]=string',
    description: 'Filter criteria in Prisma-like format',
  }),
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
  TWhereInput = any,
  TOrderByInput = any,
> extends OpenAPIRoute {
  /** Zod schema for query parameters */
  querySchema = listRequestQuerySchema

  /** Zod schema for individual item response */
  abstract responseSchema: z.ZodTypeAny

  /** Prisma collection name (e.g. 'user', 'campaign') */
  abstract collection: keyof Env['PRISMA']

  /** Default page size */
  protected pageSize = 25

  /** Maximum page size */
  protected maxPageSize = 100

  /**
   * Optional hook to mutate or replace where input before query
   */
  async preAction(params: {
    where: TWhereInput
    skip: number
    take: number
    orderBy?: TOrderByInput
  }) {
    return params
  }

  /**
   * Prisma list action - queries the database
   */
  async action(
    c: AppContext,
    params: Awaited<ReturnType<typeof this.preAction>>,
  ): Promise<{ data: unknown[]; total: number }> {
    throw new Error('action not implemented for ' + this.constructor.name)
  }

  /**
   * Optional hook to transform database results before responding
   */
  async afterAction(data: Awaited<ReturnType<typeof this.action>>['data']) {
    return data
  }

  /**
   * OpenAPI schema (resolved lazily)
   */
  getSchema(): OpenAPIRouteSchema {
    return {
      tags: [String(this.collection)],
      summary: `List ${String(this.collection)}`,
      description: `List ${String(this.collection)} with pagination and filters`,
      request: {
        query: this.querySchema,
      },
      responses: {
        '200': {
          description: 'List response',
          ...contentJson(
            z.object({
              success: z.literal(true),
              data: z.array(this.responseSchema),
              meta: z.object({
                total: z.number().int(),
                page: z.number().int(),
                per_page: z.number().int(),
                total_pages: z.number().int(),
              }),
            }),
          ),
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
    const { query } = validated

    const page = Math.max(1, Number(query.page ?? 1))
    const per_page = Math.min(
      Number(query.per_page ?? this.pageSize),
      this.maxPageSize,
    )

    const skip = (page - 1) * per_page
    const take = per_page

    const where = queryStringToPrismaWhere<TWhereInput>(query.filter)
    const params = await this.preAction({
      where,
      skip,
      take,
      orderBy: query.orderBy as TOrderByInput,
    })

    const { data, total } = await this.action(c, params)

    const transformedData = await this.afterAction(data)

    return c.json(
      {
        success: true,
        data: transformedData,
        meta: {
          page,
          per_page,
          total,
          total_pages: Math.ceil(total / per_page),
        },
      },
      200,
    )
  }
}
