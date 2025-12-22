import { z } from 'zod'

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Invalid ISO date' })

// User
export const userCreate = z.object({
  firstname: z.string().min(1).max(100),
  lastname: z.string().min(1).max(100),
  email: z.string().trim().email().min(1).transform((v) => v.toLowerCase()),
  phone: z.string().optional().nullable(),
  role: z.enum(['user', 'staff', 'admin']).optional().default('user'),
})

export const userResponse = userCreate.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// Entity
export const entityCreate = z.object({
  name: z.string().min(1),
})
export const entityResponse = entityCreate.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// District
export const districtCreate = z.object({
  name: z.string().min(1),
})
export const districtResponse = districtCreate.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// Camp
export const campCreate = z.object({
  title: z.string().min(1),
  theme: z.string().optional().nullable(),
  verse: z.string().optional().nullable(),
  entity_id: z.string(),
  banner: z.string().optional().nullable(),
  year: z.number().int(),
  fee: z.number().int(),
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
  camp_id: z.string(),
  name: z.string().min(1),
  items: z.array(z.string()).optional().default([]),
  allocation_type: z.enum(['random', 'definite']).optional().default('random'),
})
export const campAllocationResponse = campAllocationCreate.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// Campite
export const campiteCreate = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(1),
  age_group: z.string().min(1),
  gender: z.string().min(1),
  camp_id: z.string(),
  user_id: z.string(),
  payment_ref: z.string().optional().nullable(),
  type: z.enum(['regular', 'premium']).optional().default('regular'),
  amount: z.number().int().optional().nullable(),
  allocated_items: z.string().optional().default(''),
  checkin_at: isoDate.optional().nullable(),
})
export const campiteResponse = campiteCreate.extend({
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
})

// Payment
export const paymentCreate = z.object({
  reference: z.string().min(1),
  amount: z.number().int(),
  user_id: z.string(),
  camp_id: z.string(),
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
