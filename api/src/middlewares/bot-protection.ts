import { AppContext } from '../types'

/**
 * Bot protection middleware
 * Rejects requests with CF bot score lower than 30
 */
export const botProtection = async (
  c: AppContext,
  next: () => Promise<void>,
) => {
  const botScore = c.req.header('cf-bot-score')
  if (botScore && Number(botScore) < 30) {
    return c.json(
      {
        success: false,
        errors: [{ code: 6001, message: 'Bot traffic is not allowed.' }],
      },
      403,
    )
  }
  await next()
}
