import { PrismaClient, prismaCampExtension } from '@ajebo_camp/database'
import { PrismaD1 } from '@prisma/adapter-d1'
import { AppContext } from '../types'

/**
 * Prisma client extension with camp-specific functionality
 */
export const prismaExtension = (client: PrismaClient) => {
  return client.$extends(prismaCampExtension)
}

/**
 * Middleware to initialize Prisma client for each request
 */
export const prismaMiddleware = async (
  c: AppContext,
  next: () => Promise<void>,
) => {
  const adapter = new PrismaD1(c.env.DB)

  c.env.PRISMA = prismaExtension(
    new PrismaClient({
      adapter,
      log: ['info', 'warn', 'error'],
    }),
  )

  await next()
}
