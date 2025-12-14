import { OpenAPIRoute, OpenAPIRouteSchema, contentJson } from 'chanfana'
import { z } from '@hono/zod-openapi'
import { AnyZodObject } from 'zod'

import { AppContext } from '../..'
import { Env } from '../../env'

export type Prisma = Env['PRISMA']

export type PrismaWhere<T> = Prisma.Args<T, 'findMany'>['where']
export type PrismaOrderBy<T> = Prisma.Args<T, 'findMany'>['orderBy']

const operatorSchema: z.ZodTypeAny = z.lazy(() =>
  z.object({
    equals: z.string().optional(),
    in: z.array(z.any()).optional(),
    notIn: z.array(z.any()).optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    mode: z.enum(['default', 'insensitive']).optional(),
    // not: z.union([z.any(), z.lazy(() => operatorSchema)]).optional(),
    some: z.any().optional(),
    none: z.any().optional(),
    every: z.any().optional(),
  }),
)

export const listRequestQuerySchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  per_page: z.number().int().min(1).max(100).optional().default(20),
  skip: z.number().int().min(0).optional(),
  take: z.number().int().min(1).optional(),
  orderBy: z.array(z.record(z.any())).optional(),
  filter: z
    .record(z.union([z.any(), operatorSchema]))
    .optional()
    .default({}),
})

interface ValidatedData {
  body: {
    filter?: Record<string, unknown>
    page: number
    per_page: number
    skip?: number
    take?: number
    orderBy?: Array<Record<string, unknown>>
  }
}

/**
 * Generic list endpoint supporting pagination and Prisma-like filters.
 * Subclasses must provide `collection` and `responseSchema`.
 */
export abstract class ListEndpoint extends OpenAPIRoute {
  abstract requestBodySchema: AnyZodObject
  abstract responseSchema: AnyZodObject
  abstract collection: Env['PRISMA']['user']

  getSchema(): OpenAPIRouteSchema {
    return {
      tags: [String(this.collection)],
      summary: `List ${String(this.collection)}`,
      description: `List ${String(this.collection)} with pagination and filters`,
      request: {
        query: this.requestBodySchema,
      },
      responses: {
        '200': {
          description: 'List response',
          ...contentJson(
            z.object({
              success: z.boolean(),
              data: z.array(this.responseSchema),
              meta: z.object({
                total: z.number().int(),
                page: z.number().int(),
                per_page: z.number().int(),
              }),
            }),
          ),
        },
      },
      ...super.getSchema(),
    }
  }

  /**
   * Convert incoming filter (a user-supplied JSON object) into a Prisma `where` object.
   * We accept a Prisma-like shape and pass it through after minimal validation.
   */
  protected buildWhere(
    filter: Record<string, unknown>,
  ): Record<string, unknown> {
    // For now assume the incoming shape is already Prisma-compatible.
    return filter
  }

  async handle(c: AppContext): Promise<{
    success: boolean
    data: unknown[]
    meta: { total: number; page: number; per_page: number }
  }> {
    const body = (await this.getValidatedData()) as ValidatedData
    const { filter, page, per_page, skip, take, orderBy } = body.body

    const prismaWhere = this.buildWhere(filter || {})

    const effectiveSkip =
      typeof skip === 'number' ? skip : (page - 1) * per_page
    const effectiveTake = typeof take === 'number' ? take : per_page

    // @ts-expect-error dynamic model access
    const [data, total] = await Promise.all([
      // @ts-expect-error dynamic model access
      c.env.PRISMA[this.collection].findMany({
        where: prismaWhere,
        skip: effectiveSkip,
        take: effectiveTake,
        orderBy,
      }),
      // @ts-expect-error dynamic model access
      c.env.PRISMA[this.collection].count({ where: prismaWhere }),
    ])

    return {
      success: true,
      data,
      meta: { total, page: page ?? 1, per_page: effectiveTake },
    }
  }
}
