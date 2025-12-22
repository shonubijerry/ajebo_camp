import dbService, { PrismaClient } from '@ajebo_camp/database'

export type Env = {
  ENVIRONMENT: 'staging' | 'production' | 'development'
  SENTRY_RELEASE: string
  DATABASE: Service<dbService>
  PRISMA: PrismaClient
  JWT_SECRET: string
  SALT_ROUND: string
  RESEND_API_KEY: string
}
