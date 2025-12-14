import { OpenAPIRoute, OpenAPIRouteSchema, contentJson } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../..'
import { Env } from '../../env'

export const deleteRequestSchema = z.object({ id: z.string(), soft: z.boolean().optional().default(false) })

export abstract class DeleteEndpoint<T, U> extends OpenAPIRoute {
  abstract collection: keyof Env['PRISMA']
  abstract responseSchema: z.ZodTypeAny

  getSchema(): OpenAPIRouteSchema {
    return {
      tags: [String(this.collection)],
      summary: `Delete ${String(this.collection)}`,
      request: { body: contentJson(deleteRequestSchema) },
      responses: {
        '200': { description: 'Delete success', ...contentJson(this.responseSchema) },
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
    const body = await this.getValidatedData()
    const { id, soft } = body.body as { id: string; soft?: boolean }

    // @ts-ignore dynamic model access
    if (soft) {
      try {
        const now = new Date().toISOString()
        const updated = await c.env.PRISMA[this.collection].update({ where: { id }, data: { deleted_at: now } })
        return { success: true, data: updated }
      } catch (err) {
        // If soft update fails (no deleted_at field) fall through to hard delete
      }
    }

    // Hard delete
    // @ts-ignore dynamic model access
    await c.env.PRISMA[this.collection].delete({ where: { id } })

    return { success: true }
  }
}
