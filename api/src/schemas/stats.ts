import { z } from 'zod'

export const dashboardStatsSchema = z.object({
  overview: z.object({
    total_camps: z.number(),
    total_users: z.number(),
    total_districts: z.number(),
    total_entities: z.number(),
  }),

  recent_activity: z.array(
    z.object({
      id: z.string(),
      firstname: z.string(),
      lastname: z.string(),
      camp_title: z.string(),
      created_at: z.string(),
    }),
  ),
})

export const CampDetailedAnalyticsSchema = z.object({
  overview: z.object({
    total_campites: z.number(),
    total_revenue: z.number(),
    total_districts: z.number(),
    pending_payments: z.number(),
  }),

  campites: z.object({
    by_gender: z.array(
      z.object({
        gender: z.string(),
        count: z.number(),
      }),
    ),
    by_age_group: z.array(
      z.object({
        age_group: z.string(),
        count: z.number(),
      }),
    ),
    by_type: z.array(
      z.object({
        type: z.string(),
        count: z.number(),
        revenue: z.number(),
      }),
    ),
    by_district: z.array(
      z.object({
        district_id: z.string(),
        district_name: z.string(),
        count: z.number(),
      }),
    ),
  }),

  timeline: z.object({
    daily: z.array(
      z.object({
        date: z.string(), // or z.string().date() if using Zod 3.24+
        count: z.number(),
        revenue: z.number(),
      }),
    ),
    // Monthly is an empty array in your snippet,
    // but usually shares the same structure as daily
    monthly: z.array(
      z.object({
        month: z.string(),
        count: z.number(),
        revenue: z.number(),
      }),
    ),
  }),

  revenue: z.object({
    total: z.number(),
  }),

  recent_activity: z.object({
    recent_registrations: z.array(
      z.object({
        id: z.string(),
        firstname: z.string(),
        lastname: z.string(),
        camp_title: z.string(),
        created_at: z.string().datetime(), // Matches .toISOString()
      }),
    ),
  }),
})

// Extract the type for use in your frontend or services
export type CampDetailedAnalytics = z.infer<typeof CampDetailedAnalyticsSchema>

// To extract the TypeScript types from the schemas:
export type DashboardStats = z.infer<typeof dashboardStatsSchema>
