import dbService from '@ajebo_camp/database'
import { prismaExtension } from './lib/prisma'

export type Env = {
  ENVIRONMENT: 'production' | 'development'
  DB: D1Database
  SENTRY_RELEASE: string
  DATABASE: Service<dbService>
  PRISMA: ReturnType<typeof prismaExtension>
  JWT_SECRET: string
  SALT_ROUND: string
  RESEND_API_KEY: string
  PAYSTACK_SECRET_KEY: string
  MEDIA_BUCKET: R2Bucket
  R2_PUBLIC_BASE_URL: string
}
