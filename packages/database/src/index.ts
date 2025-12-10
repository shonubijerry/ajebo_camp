import { PrismaD1 } from '@prisma/adapter-d1'
import { WorkerEntrypoint } from 'cloudflare:workers'
import { PrismaClient } from './generated/prisma'

export interface Env {
  DB: D1Database
}

export default class extends WorkerEntrypoint<Env> {
  private prismaInstance: PrismaClient | null = null

  fetch() {
    return new Response('ok')
  }

  prisma() {
    if (!this.prismaInstance) {
      const adapter = new PrismaD1(this.env.DB)

      this.prismaInstance = new PrismaClient({
        adapter,
        log: ['info', 'warn', 'error'],
      })
    }

    return this.prismaInstance
  }
}

export * from './db_schema'
export * from './generated/prisma'
export * from './raw_query'
