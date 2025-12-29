import { z } from '@hono/zod-openapi'

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Invalid ISO date' })
  .openapi({ example: '2025-01-01T00:00:00Z', format: 'date-time' })

// User
export const userCreate = z.object({
  firstname: z
    .string()
    .min(1)
    .max(100)
    .openapi({ example: 'Ada' }),
  lastname: z
    .string()
    .min(1)
    .max(100)
    .openapi({ example: 'Okafor' }),
  email: z
    .string()
    .trim()
    .email()
    .min(1)
    .transform((v) => v.toLowerCase())
    .openapi({ example: 'ada.okafor@example.com' }),
  phone: z.string().optional().nullable().openapi({ example: '+2348012345678' }),
  role: z
    .enum(['user', 'staff', 'admin'])
    .optional()
    .default('user')
    .openapi({ example: 'user' }),
})

export const userResponse = userCreate.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// Entity
export const entityCreate = z.object({
  name: z.string().min(1).openapi({ example: 'Lagos Mainland' }),
})
export const entityResponse = entityCreate.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// District
export const districtCreate = z.object({
  name: z.string().min(1).openapi({ example: 'Yaba' }),
  zones: z.array(z.string()).optional().default([]).openapi({ example: ['Zone A', 'Zone B'] }),
})
export const districtResponse = districtCreate.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// Camp
export const campCreate = z.object({
  title: z.string().min(1).openapi({ example: 'Summer Camp 2025' }),
  theme: z.string().optional().nullable().openapi({ example: 'Faith and Fire' }),
  verse: z.string().optional().nullable().openapi({ example: 'Jeremiah 29:11' }),
  entity_id: z.string().openapi({ example: 'entity_123' }),
  banner: z.string().optional().nullable().openapi({ example: 'https://example.com/banner.jpg' }),
  year: z.number().int().openapi({ example: 2025 }),
  fee: z.number().int().openapi({ example: 15000 }),
  premium_fees: z
    .array(z.number().int())
    .default([])
    .openapi({ example: [20000, 30000] }),
  start_date: isoDate,
  end_date: isoDate,
})
export const campResponse = campCreate.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// Camp Allocation
export const campAllocationCreate = z.object({
  camp_id: z.string().openapi({ example: 'camp_123' }),
  name: z.string().min(1).openapi({ example: 'Prayer Boot' }),
  items: z
    .array(z.string())
    .optional()
    .default([])
    .openapi({ example: ['Boot 1', 'Boot 2', 'Boot 3'] }),
  allocation_type: z
    .enum(['random', 'definite'])
    .optional()
    .default('random')
    .openapi({ example: 'random' }),
})
export const campAllocationResponse = campAllocationCreate.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// Campite
export const campiteCreate = z
  .object({
    firstname: z.string().min(1).openapi({ example: 'John' }),
    lastname: z.string().min(1).openapi({ example: 'Doe' }),
    email: z
      .string()
      .email()
      .optional()
      .nullable()
      .openapi({ example: 'john.doe@example.com' }),
    phone: z.string().min(1).openapi({ example: '+2348012345678' }),
    age_group: z.string().min(1).openapi({ example: '21-30' }),
    gender: z.string().min(1).openapi({ example: 'male' }),
    camp_id: z.string().openapi({ example: 'camp_123' }),
    user_id: z.string().openapi({ example: 'user_456' }),
    district_id: z.string().optional().openapi({ example: 'district_789' }),
    payment_ref: z
      .string()
      .optional()
      .nullable()
      .openapi({ example: 'pay_ref_001' }),
    type: z
      .enum(['regular', 'premium'])
      .optional()
      .default('regular')
      .openapi({ example: 'regular' }),
    amount: z.number().int().optional().nullable().openapi({ example: 5000 }),
    allocated_items: z.string().optional().default('').openapi({ example: 'Boot 1' }),
    checkin_at: isoDate.optional().nullable(),
  })
  .superRefine((data, ctx) => {
  if (data.type === 'premium' && (data.amount === null || data.amount === undefined)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Amount is required for premium campites',
      path: ['amount'],
    })
  }
  })

export const campiteResponse = campiteCreate._def.schema.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// Payment
export const paymentCreate = z.object({
  reference: z.string().min(1).openapi({ example: 'pay_123' }),
  amount: z.number().int().openapi({ example: 15000 }),
  user_id: z.string().openapi({ example: 'user_456' }),
  camp_id: z.string().openapi({ example: 'camp_123' }),
})
export const paymentResponse = paymentCreate.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// Exports grouped for convenience
export const schemas = {
  user: userCreate,
  entity: entityCreate,
  district: districtCreate,
  camp: campCreate,
  camp_Allocation: campAllocationCreate,
  campite: campiteCreate,
  payment: paymentCreate,
}

export const requestBodies = {
  user: userCreate,
  entity: entityCreate,
  district: districtCreate,
  camp: campCreate,
  camp_Allocation: campAllocationCreate,
  campite: campiteCreate,
  payment: paymentCreate,
}

export const responseBodies = {
  user: userResponse,
  entity: entityResponse,
  district: districtResponse,
  camp: campResponse,
  camp_Allocation: campAllocationResponse,
  campite: campiteResponse,
  payment: paymentResponse,
}

export type RequestBodies = typeof requestBodies
export type ResponseBodies = typeof responseBodies
