import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { AppBindings } from '../types'

export const createOpenApiApp = () => {
  return fromHono(new Hono<AppBindings>(), {
    docs_url: '/api/v1/internal-doc',
    schema: {
      info: {
        title: 'Ajebo Camp Management System',
        version: '2.0.0',
        description:
          'This is the documentation for Ajebo Camp Management System.',
      },
    },
  })
}

export const registerSecuritySchemes = (
  app: ReturnType<typeof createOpenApiApp>,
) => {
  app.registry.registerComponent('securitySchemes', 'bearer', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  })
}
