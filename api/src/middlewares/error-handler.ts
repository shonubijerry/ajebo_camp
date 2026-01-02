import { ApiException } from 'chanfana'
import { Context } from 'hono'
import { AppContext } from '../types'

/**
 * Global error handler
 * Handles ApiExceptions from Chanfana and generic errors
 */
export const errorHandler = (err: Error, c: AppContext) => {
  if (err instanceof ApiException) {
    console.log(err)
    // If it's a Chanfana ApiException, let Chanfana handle the response
    return c.json({
      success: false,
      errors: err.buildResponse(),
    })
  }

  console.error('Global error caught:', err) // Log the error if it's not known

  // For other errors, return a generic 500 response
  return c.json(
    {
      success: false,
      errors: [{ code: 7000, message: 'Internal Server Error' }],
    },
    500,
  )
}
