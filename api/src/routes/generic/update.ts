import { contentJson } from 'chanfana'
import { OpenAPIEndpoint } from './create'
import { GenericError } from './query'

export abstract class UpdateEndpoint extends OpenAPIEndpoint {
  getSchema() {
    return {
      tags: this.meta.tag ? [this.meta.tag] : [String(this.meta.collection)],
      summary:
        this.meta.summary ?? `Update ${this.meta.collection?.toLowerCase()}`,
      description:
        this.meta.description ??
        `Endpoint to update ${this.meta.collection?.toLowerCase()}`,
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
}
