/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { z } from 'zod'
import { OpenAPIRoute } from 'chanfana'
import { Prisma } from '@ajebo_camp/database'
import {
  CampDetailedAnalytics,
  CampDetailedAnalyticsSchema,
} from '../schemas/stats'
import { AuthenticatedUser } from '../middlewares/auth'
import { AppContext } from '../types'

// Time periods for filtering
const TIME_PERIODS = ['today', 'week', 'month', 'year', 'all'] as const

const analyticsQuerySchema = z.object({
  period: z.enum(TIME_PERIODS).optional().default('all'),
  camp_id: z.string().optional(),
  district_id: z.string().optional(),
})

/**
 * Get date range based on period
 */
function getDateRange(period: string): Date | null {
  const now = new Date()
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'week':
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      return weekAgo
    case 'month':
      const monthAgo = new Date(now)
      monthAgo.setMonth(now.getMonth() - 1)
      return monthAgo
    case 'year':
      const yearAgo = new Date(now)
      yearAgo.setFullYear(now.getFullYear() - 1)
      return yearAgo
    default:
      return null
  }
}

/** Get seconds until end of today */
function getSecondsUntilEndOfToday(): number {
  const now = new Date()
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  )
  return Math.floor((endOfToday.getTime() - now.getTime()) / 1000)
}

/**
 * Simple dashboard analytics endpoint
 * Returns only: overview stats and last 5 recent activities
 */
export class GetDashboardAnalyticsEndpoint extends OpenAPIRoute {
  schema = {
    tags: ['Analytics'],
    summary: 'Get simple dashboard stats',
    request: {
      query: z.object({
        camp_id: z.string().optional(),
      }),
    },
    security: [{ bearer: [] }],
    responses: {
      '200': {
        description: 'Dashboard analytics',
        content: {
          'application/json': {
            schema: z.object({
              data: z.object({
                total_campites: z.number(),
                by_gender: z.array(
                  z.object({
                    gender: z.string(),
                    _count: z.object({ id: z.number() }),
                  }),
                ),
                by_age_group: z.array(
                  z.object({
                    age_group: z.string(),
                    _count: z.object({ id: z.number() }),
                  }),
                ),
              }),
            }),
          },
        },
      },
    },
  }

  async handle(c: AppContext & { user: AuthenticatedUser }) {
    const cache = caches.default
    const cacheKey = new Request(`${c.req.url}?user_id=${c.user?.sub}`, {
      method: 'GET',
    })
    const cachedResponse = await cache.match(cacheKey)
    if (cachedResponse) {
      return cachedResponse.json()
    }
    let where: Prisma.CampiteWhereInput = {}

    if (c.user?.role === 'user') {
      where = { ...(where || {}), user_id: c.user.sub }
    }

    const [totalCampites, genderStats, ageGroupStats] = await Promise.all([
      c.env.PRISMA.campite.count({ where }),
      c.env.PRISMA.campite.groupBy({
        by: ['gender'],
        where: where,
        _count: { id: true },
      }),
      c.env.PRISMA.campite.groupBy({
        by: ['age_group'],
        where: where,
        _count: { id: true },
      }),
    ])

    const data = {
      total_campites: totalCampites,
      by_gender: genderStats,
      by_age_group: ageGroupStats,
    }

    await cache.put(
      cacheKey,
      new Response(JSON.stringify({ data }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${getSecondsUntilEndOfToday()}`,
        },
      }),
    )

    return { data }
  }
}

/**
 * Detailed analytics endpoint for analytics page (respects camp_id filter)
 */
export class GetDetailedAnalyticsEndpoint extends OpenAPIRoute {
  schema = {
    tags: ['Analytics'],
    summary: 'Get detailed analytics with breakdown',
    request: {
      query: analyticsQuerySchema,
    },
    security: [{ bearer: [] }],
    responses: {
      '200': {
        description: 'Detailed analytics',
        content: {
          'application/json': {
            schema: z.object({
              data: CampDetailedAnalyticsSchema,
            }),
          },
        },
      },
    },
  }
  meta = {
    permission: 'analytics:view' as const,
  }

  async handle(c: AppContext): Promise<{ data: CampDetailedAnalytics }> {
    const cache = caches.default
    const cacheKey = new Request(c.req.url, { method: 'GET' })
    const cachedResponse = await cache.match(cacheKey)
    if (cachedResponse) {
      return cachedResponse.json()
    }

    const payload = (await this.getValidatedData()) as {
      query: typeof analyticsQuerySchema._type
    }

    const { period, camp_id, district_id } = payload.query

    const dateFrom = getDateRange(period)

    const whereClause: Prisma.CampiteWhereInput = {
      deleted_at: null,
      ...(dateFrom && { created_at: { gte: dateFrom } }),
      ...(camp_id && { camp_id }),
      ...(district_id && { district_id }),
    }

    const [
      totalCampites,
      totalDistricts,
      genderStats,
      ageGroupStats,
      typeStats,
      districtStats,
      recentCampites,
      revenueStats,
    ] = await Promise.all([
      c.env.PRISMA.campite.count({ where: whereClause }),
      c.env.PRISMA.district.count({ where: { deleted_at: null } }),
      c.env.PRISMA.campite.groupBy({
        by: ['gender'],
        where: whereClause,
        _count: { id: true },
      }),
      c.env.PRISMA.campite.groupBy({
        by: ['age_group'],
        where: whereClause,
        _count: { id: true },
      }),
      c.env.PRISMA.campite.groupBy({
        by: ['type'],
        where: whereClause,
        _count: { id: true },
        _sum: { amount: true },
      }),
      c.env.PRISMA.campite.groupBy({
        by: ['district_id'],
        where: whereClause,
        _count: { id: true },
      }),
      c.env.PRISMA.campite.findMany({
        where: whereClause,
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          created_at: true,
          camp: { select: { title: true } },
        },
      }),
      c.env.PRISMA.campite.aggregate({
        where: whereClause,
        _sum: { amount: true },
      }),
    ])

    const [districts] = await Promise.all([
      c.env.PRISMA.district.findMany({
        where: {
          id: {
            in: districtStats
              .map((s) => s.district_id)
              .filter(Boolean) as string[],
          },
        },
        select: { id: true, name: true },
      }),
    ])

    const districtMap = new Map(districts.map((d) => [d.id, d.name]))

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyData = await c.env.PRISMA.campite.groupBy({
      by: ['created_at'],
      where: {
        ...whereClause,
        created_at: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
      _sum: { amount: true },
    })

    const dailyMap = new Map<string, { count: number; revenue: number }>()
    dailyData.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || { count: 0, revenue: 0 }
      dailyMap.set(date, {
        count: existing.count + item._count.id,
        revenue: existing.revenue + (item._sum.amount || 0),
      })
    })

    const responseData: CampDetailedAnalytics = {
      overview: {
        total_campites: totalCampites,
        total_revenue: revenueStats._sum.amount || 0,
        total_districts: totalDistricts,
        pending_payments: 0,
      },
      campites: {
        by_gender: genderStats.map((s) => ({
          gender: s.gender,
          count: s._count.id,
        })),
        by_age_group: ageGroupStats.map((s) => ({
          age_group: s.age_group,
          count: s._count.id,
        })),
        by_type: typeStats.map((s) => ({
          type: s.type,
          count: s._count.id,
          revenue: s._sum.amount || 0,
        })),
        by_district: districtStats
          .filter((s) => s.district_id)
          .map((s) => ({
            district_id: s.district_id!,
            district_name: districtMap.get(s.district_id!) || 'Unknown',
            count: s._count.id,
          })),
      },
      timeline: {
        daily: Array.from(dailyMap.entries())
          .map(([date, data]) => ({
            date,
            count: data.count,
            revenue: data.revenue,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        monthly: [],
      },
      revenue: {
        total: revenueStats._sum.amount || 0,
      },
      recent_activity: {
        recent_registrations: recentCampites.map((c) => ({
          id: c.id,
          firstname: c.firstname,
          lastname: c.lastname,
          camp_title: c.camp?.title || 'Unknown',
          created_at: c.created_at.toISOString(),
        })),
      },
    }

    const response = { data: responseData }

    await cache.put(
      cacheKey,
      new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${getSecondsUntilEndOfToday()}`,
        },
      }),
    )
    return response
  }
}
