import { act } from "react";
import { z } from "zod";

export const DefaultSchema = z.object({
  created_at: z.coerce.date(), // Use z.coerce.date() to handle both Date objects and date strings
  updated_at: z.coerce.date(),
});

export const CampAllocationTypeSchema = z.enum(["random", "definite"]);

export const UserRoleSchema = z.enum(["user", "staff", "admin"]);

export const CampiteTypeSchema = z.enum(["regular", "premium"]);

export const DistrictSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  zones: z.string().array().default([]),
  ...DefaultSchema.shape,
});

export const EntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  ...DefaultSchema.shape,
});

export const CampSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  theme: z.string().nullable(),
  verse: z.string().nullable(),
  entity_id: z.string().uuid(),
  banner: z.string().nullable(),
  year: z.number().int(),
  fee: z.number().int(),
  premium_fees: z.array(z.number().int()).default([]),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  highlights: z.object({
    location: z.string().optional(),
    description: z.string().optional(),
    ministers: z.object({
      name: z.string(),
      designation: z.string(),
    }).array().default([]),
    activities: z.array(z.string()).default([]),
  }).default({}),
  registration_deadline: z.coerce.date().nullable(),
  contact_email: z.string().nullable(),
  contact_phone: z.string().nullable(),
  ...DefaultSchema.shape,
});

export const CampAllocationSchema = z.object({
  id: z.string().uuid(),
  camp_id: z.string().uuid(),
  name: z.string(),
  items: z.array(z.string()), // For the Prisma Json type with string[] content
  allocation_type: CampAllocationTypeSchema.default("random"),
  ...DefaultSchema.shape,
});

export const CampiteSchema = z.object({
  id: z.number().int(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email().nullable(),
  phone: z.string(),
  age_group: z.string(),
  gender: z.string(),
  camp_id: z.string().uuid(),
  user_id: z.string().uuid(),
  payment_ref: z.string().nullable(),
  type: CampiteTypeSchema.default("regular"),
  amount: z.number().int().nullable(), // premium only
  allocated_items: z.string(), // comma separated list
  checkin_at: z.coerce.date().nullable(),
  ...DefaultSchema.shape,
});

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  reference: z.string(),
  amount: z.number().int(),
  user_id: z.string().uuid(),
  camp_id: z.string().uuid(),
  ...DefaultSchema.shape,
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  role: UserRoleSchema.default("user"),
  meta: z
    .object({
      forgot_token: z.string(),
    })
    .partial(),
  ...DefaultSchema.shape,
});
