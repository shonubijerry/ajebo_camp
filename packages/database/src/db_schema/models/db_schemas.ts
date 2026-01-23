import { z } from "@hono/zod-openapi";

const isoDate = z
  .string()
  .datetime()
  .openapi({ example: "2025-01-01T00:00:00Z", format: "date-time" });

const basedSchemas = {
  id: z.string(),
  created_at: isoDate,
  updated_at: isoDate,
};

// User
export const userCreate = z.object({
  firstname: z.string().min(1).max(100).openapi({ example: "Ada" }),
  lastname: z.string().min(1).max(100).openapi({ example: "Okafor" }),
  email: z
    .string()
    .trim()
    .email()
    .min(1)
    .transform((v) => v.toLowerCase())
    .openapi({ example: "ada.okafor@example.com" }),
  phone: z.string().nullish().openapi({ example: "+2348012345678" }),
  role: z
    .enum(["user", "staff", "admin"])
    .optional()
    .default("user")
    .openapi({ example: "user" }),
});

export const userResponse = userCreate.extend(basedSchemas);

// Entity
export const entityCreate = z.object({
  name: z.string().min(1).openapi({ example: "Lagos Mainland" }),
});
export const entityResponse = entityCreate.extend(basedSchemas);

// District
export const districtCreate = z.object({
  name: z.string().min(1).openapi({ example: "Yaba" }),
  zones: z
    .array(z.string())
    .optional()
    .default([])
    .openapi({ example: ["Zone A", "Zone B"] }),
});
export const districtResponse = districtCreate.extend(basedSchemas);

// Camp
export const campCreate = z.object({
  title: z.string().min(1).openapi({ example: "Summer Camp 2025" }),
  theme: z.string().nullish().openapi({ example: "Faith and Fire" }),
  verse: z.string().nullish().openapi({ example: "Jeremiah 29:11" }),
  entity_id: z.string().openapi({ example: "entity_123" }),
  banner: z
    .union([z.instanceof(File), z.string(), z.null()])
    .optional()
    .openapi({
      type: "string",
      format: "binary",
      description: "Banner image file",
    }),
  year: z.number().int().openapi({ example: 2025 }),
  fee: z.number().int().openapi({ example: 15000 }),
  premium_fees: z
    .array(z.number().int())
    .optional()
    .default([])
    .openapi({ example: [20000, 30000] }),
  start_date: isoDate,
  end_date: isoDate,
  highlights: z
    .object({
      location: z
        .string()
        .optional()
        .openapi({ example: "Foursquare Camp Ground, Ajebo" }),
      description: z.string().optional().openapi({
        example: "Join us for worship, teachings, and fun activities",
      }),
      ministers: z
        .object({
          name: z.string().openapi({ example: "Pastor John Doe" }),
          designation: z.string().openapi({ example: "Senior Pastor" }),
        })
        .array()
        .optional()
        .default([])
        .openapi({
          example: [
            { name: "Pastor John Doe", designation: "Senior Pastor" },
            { name: "Evangelist Jane Smith", designation: "Guest Speaker" },
          ],
        }),
      activities: z
        .array(z.string())
        .optional()
        .default([])
        .openapi({
          example: ["Worship Sessions", "Workshops", "Outdoor Games"],
        }),
    })
    .optional(),
  registration_deadline: isoDate.nullish(),
  contact_email: z
    .string()
    .email()
    .nullish()
    .openapi({ example: "camp@foursquare.org" }),
  contact_phone: z.string().nullish().openapi({ example: "+2348012345678" }),
});
export const campResponse = campCreate.extend(basedSchemas).extend({
  is_active: z.boolean(),
  is_coming_soon: z.boolean(),
});

// Camp Allocation
export const campAllocationCreate = z.object({
  camp_id: z.string().openapi({ example: "camp_123" }),
  name: z.string().min(1).openapi({ example: "Prayer Boot" }),
  items: z
    .array(z.string())
    .optional()
    .default([])
    .openapi({ example: ["Boot 1", "Boot 2", "Boot 3"] }),
  allocation_type: z
    .enum(["random", "definite"])
    .optional()
    .default("random")
    .openapi({ example: "random" }),
});
export const campAllocationResponse = campAllocationCreate.extend(basedSchemas);

// Campite
export const campiteCreate = z
  .object({
    firstname: z.string().min(1).openapi({ example: "John" }),
    lastname: z.string().min(1).openapi({ example: "Doe" }),
    email: z
      .string()
      .email()
      .nullish()
      .openapi({ example: "john.doe@example.com" }),
    phone: z.string().min(1).openapi({ example: "+2348012345678" }),
    age_group: z.string().min(1).openapi({ example: "21-30" }),
    gender: z.string().min(1).openapi({ example: "male" }),
    camp_id: z.string().openapi({ example: "camp_123" }),
    user_id: z.string().openapi({ example: "user_456" }),
    district_id: z.string().optional().openapi({ example: "district_789" }),
    payment_ref: z.string().nullish().openapi({ example: "pay_ref_001" }),
    type: z
      .enum(["regular", "premium"])
      .optional()
      .default("regular")
      .openapi({ example: "regular" }),
    amount: z.number().int().openapi({ example: 5000 }),
    allocated_items: z
      .string()
      .optional()
      .default("")
      .openapi({ example: "Boot 1" }),
    checkin_at: isoDate.nullish(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === "premium" &&
      (data.amount === null || data.amount === undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount is required for premium campites",
        path: ["amount"],
      });
    }
  });

export const campiteResponse = campiteCreate._def.schema.extend(basedSchemas);

// Payment
export const paymentCreate = z.object({
  reference: z.string().min(1).openapi({ example: "pay_123" }),
  amount: z.number().int().openapi({ example: 15000 }),
  user_id: z.string().openapi({ example: "user_456" }),
  camp_id: z.string().openapi({ example: "camp_123" }),
});
export const paymentResponse = paymentCreate.extend(basedSchemas);

// Exports grouped for convenience
export const schemas = {
  user: userCreate,
  entity: entityCreate,
  district: districtCreate,
  camp: campCreate,
  camp_Allocation: campAllocationCreate,
  campite: campiteCreate,
  payment: paymentCreate,
};

export const requestBodies = {
  user: userCreate,
  entity: entityCreate,
  district: districtCreate,
  camp: campCreate,
  camp_Allocation: campAllocationCreate,
  campite: campiteCreate,
  payment: paymentCreate,
};

export const responseBodies = {
  user: userResponse,
  entity: entityResponse,
  district: districtResponse,
  camp: campResponse,
  camp_Allocation: campAllocationResponse,
  campite: campiteResponse,
  payment: paymentResponse,
};

export type RequestBodies = typeof requestBodies;
export type ResponseBodies = typeof responseBodies;
