import { contentJson } from 'chanfana'
import { OpenAPIEndpoint } from './create'
import { GenericError } from './query'
import { z } from 'zod'

export abstract class GetEndpoint extends OpenAPIEndpoint {
  /**
   * OpenAPI schema (resolved lazily)
   */
  getSchema() {
    return {
      tags: this.meta.tag ? [this.meta.tag] : [String(this.meta.collection)],
      summary:
        this.meta.summary ?? `Get ${this.meta.collection?.toLowerCase()}`,
      description:
        this.meta.description ??
        `Endpoint to get ${this.meta.collection?.toLowerCase()}`,
      security: this.meta.security ?? [{ bearer: [] }],
      request: this.meta.requestSchema?.omit({ body: true }).shape,
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
}
