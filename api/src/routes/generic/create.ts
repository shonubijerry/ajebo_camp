import { OpenAPIRoute, OpenAPIRouteSchema, contentJson } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../..'
import { Env } from '../../env'

/**
 * Generic CreateEndpoint for streamlined resource creation.
 * Extends OpenAPIRoute to accept payload, validate with Zod, and save to Prisma database.
 *
 * @template T The Zod schema type for request payload validation
 * @template P The Prisma model type (e.g., 'user', 'campaign')
 */
export abstract class CreateEndpoint<T, U> extends OpenAPIRoute {
  /**
   * Define the Zod schema for request body validation.
   * Must be implemented by subclasses.
   */
  abstract requestBodySchema: z.ZodTypeAny

  /**
   * Define the Zod schema for success response body.
   * Must be implemented by subclasses.
   */
  abstract responseSchema: z.ZodTypeAny

  /**
   * Define the Prisma model name to save data to.
   * Examples: 'user', 'campaign', 'family'
   */
  abstract collection: keyof Env['PRISMA']

  /**
   * Schema is initialized in constructor after subclass properties are assigned.
   */

  /**
   * Get the OpenAPI schema (lazy-loaded after subclass initialization).
   */
  getSchema(): OpenAPIRouteSchema {
    return {
      tags: [String(this.collection)],
      summary: `Create a new ${String(this.collection)}`,
      description: `Creates a new ${String(this.collection)} in the system with provided details.`,
      request: {
        body: contentJson(this.requestBodySchema),
      },
      responses: {
        '200': {
          description: `${String(this.collection)} created successfully`,
          ...contentJson(this.responseSchema),
        },
        '400': {
          description: 'Validation error',
          ...contentJson({
            success: true,
            errors: z
              .object({
                code: z.string(),
                message: z.string(),
              })
              .array(),
          }),
        },
      },
    }
  }

  /**
   * Optional: Transform validated data before saving to database.
   * Useful for normalizing, enriching, or setting defaults.
   */
  protected transformData(data: T) {
    return data
  }

  /**
   * Optional: Custom response formatting.
   * Override to shape the response before returning to client.
   */
  protected formatResponse(savedData: unknown): unknown {
    return savedData
  }

  async handle(c: AppContext) {
    const data = await this.getValidatedData()

    const dataToSave = this.transformData(data.body)

    // @ts-ignore - dynamic model access
    const savedData = await c.env.PRISMA[this.collection].create({
      data: dataToSave,
    })

    return {
      success: true,
      data: this.formatResponse(savedData),
    }
  }
}
