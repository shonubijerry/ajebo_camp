import { OpenAPIRoute, OpenAPIRouteSchema } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../types'

/**
 * Endpoint to serve R2 media files in local development
 * In production, files are served directly from R2 public URL
 */
export class GetMediaEndpoint extends OpenAPIRoute {
  schema: OpenAPIRouteSchema = {
    tags: ['Media'],
    summary: 'Get media file',
    description: 'Serves media files from R2 bucket (local dev only)',
    security: [],
    request: {
      params: z.object({
        key: z.string().openapi({ example: 'camps/file.jpg' }),
      }),
    },
    responses: {
      '200': {
        description: 'Media file',
        content: {
          'image/*': {
            schema: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
      '404': {
        description: 'File not found',
      },
    },
  }

  async handle(c: AppContext) {
    const { params } = await this.getValidatedData()

    const object = await c.env.MEDIA_BUCKET.get(decodeURIComponent(params.key))

    if (!object) {
      return c.json({ error: 'File not found' }, 404)
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('cache-control', 'public, max-age=31536000, immutable')

    return new Response(object.body, { headers })
  }
}
