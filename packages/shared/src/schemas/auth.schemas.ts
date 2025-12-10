import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string(),
})

export const userRegistrationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().optional(),
  email: z.string().email().trim().toLowerCase(),
  referralCode: z.string().optional(),
})

export const ChangePasswordPublicSchema = z.object({
  id: z.string().cuid2(),
  password: z.string(),
})

export const ChangePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
})
