import { contentJson, OpenAPIRouteSchema } from 'chanfana'
import { GenericError } from './query'
import { OpenAPIEndpoint } from './create'
import { z } from 'zod'

export abstract class DeleteEndpoint extends OpenAPIEndpoint {
  getSchema(): OpenAPIRouteSchema {
    return {
      request: this.meta.requestSchema?.omit({ body: true }).extend({
        params: z.object({
          id: z.string(),
        }),
      }).shape,
      tags: this.meta.tag ? [this.meta.tag] : [String(this.meta.collection)],
      summary:
        this.meta.summary ?? `Delete ${this.meta.collection?.toLowerCase()}`,
      description:
        this.meta.description ??
        `Endpoint to delete ${this.meta.collection?.toLowerCase()}`,
      security: this.meta.security ?? [{ bearer: [] }],
      responses: {
        '204': {
          description: `Operation successfully`,
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

  async whereInput() {
    return (await this.preAction()) as { params?: { id: string } }
  }
}
