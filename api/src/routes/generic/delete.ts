import { contentJson, OpenAPIRoute, OpenAPIRouteSchema } from 'chanfana'
import { GenericError } from './query'
import { z } from 'zod'
import { OpenAPIEndpoint, Prisma } from '@ajebo_camp/database'
import { AppContext } from '../..'
import { AwaitedReturnType } from './types'
import { successRes } from '../../lib/response'

export abstract class DeleteEndpoint extends OpenAPIEndpoint {
  /**
   * OpenAPI schema (resolved lazily)
   */
  async preAction() {
    const input = await this.getValidatedData()

    return {
      where: { id: input.params.id },
      ...(input.query.soft && {
        data: { deleted_at: new Date().toISOString() },
      }),
    }
  }

  async action(
    c: AppContext,
    data: AwaitedReturnType<typeof this.preAction>,
  ): Promise<Response | unknown> {
    throw new Error('action implemented for ' + this.constructor.name)
  }

  getSchema(): OpenAPIRouteSchema {
    return {
      request: this.meta.requestSchema.shape,
      tags: this.meta.tag ? [this.meta.tag] : [String(this.meta.collection)],
      summary:
        this.meta.summary ?? `Delete ${this.meta.collection?.toLowerCase()}`,
      description:
        this.meta.description ??
        `Endpoint to delete ${this.meta.collection?.toLowerCase()}`,
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
}
