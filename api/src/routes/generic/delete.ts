import { OpenAPIRoute, OpenAPIRouteSchema } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../..'
import { Env } from '../../env'
import { AwaitedReturnType } from './types'

export abstract class DeleteEndpoint extends OpenAPIRoute {
  abstract collection: keyof Env['PRISMA']

  /**
   * Optional hook to mutate or replace input before persistence
   */
  async preAction(data: {
    query?: any
    params?: { id: string } & Record<string, string>
    headers: any
  }) {
    const res = {
      where: { id: data.params?.id },
      data: data.query.soft
        ? { deleted_at: new Date().toISOString() }
        : undefined,
    }

    return res
  }

  /**
   * Prisma update action
   */
  async action(
    c: AppContext,
    dbQuery: AwaitedReturnType<typeof this.preAction>,
  ): Promise<unknown> {
    throw new Error('action not implemented for ' + this.constructor.name)
  }

  /**
   * Optional hook to transform database result before responding
   */
  async afterAction(data: AwaitedReturnType<typeof this.action>) {
    return data
  }

  getSchema(): OpenAPIRouteSchema {
    return {
      tags: [String(this.collection)],
      summary: `Delete ${String(this.collection)}`,
      request: {
        params: z.object({
          id: z.string(),
        }),
        query: z.object({
          soft: z.boolean().optional().default(false),
        }),
      },
      responses: {
        '200': {
          description: 'Delete success',
        },
        '400': { description: 'Bad request' },
      },
    }
  }

  /**
   * Soft delete strategy: attempt to update a `deleted_at` timestamp if present.
   * If the model does not have that field, the update will fail — in that case the
   * implementation falls back to hard delete.
   */
  async handle(c: AppContext) {
    const validated = await this.getValidatedData()
    const input = await this.preAction(validated)

    await this.action(c, input)

    return c.json({
      success: true,
    })
  }
}
