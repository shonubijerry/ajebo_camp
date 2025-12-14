import dbService, { PrismaClient } from '@ajebo_camp/database'

export type Env = {
  ENVIRONMENT: 'staging' | 'production' | 'development'
  SENTRY_RELEASE: string
  DATABASE: Service<dbService>
  PRISMA: PrismaClient
}
