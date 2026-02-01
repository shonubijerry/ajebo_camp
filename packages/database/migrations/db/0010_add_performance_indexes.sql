-- Migration: Add performance indexes for commonly queried fields
-- Date: 2026-01-31
-- Description: Creates indexes based on actual query patterns in the application

-- User table indexes
-- Queries: findUnique by email (login, signup, forgot password)
-- Already has: @@index([email]) and @@index([role]) from Prisma
CREATE INDEX IF NOT EXISTS "User_forgot_token_idx" ON "User"("forgot_token") WHERE "forgot_token" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "User_deleted_at_idx" ON "User"("deleted_at");

-- Camp table indexes  
-- Queries: findUnique by id, findMany with filters, groupBy for analytics
-- Already has: @@index([entity_id]) from Prisma
CREATE INDEX IF NOT EXISTS "Camp_year_idx" ON "Camp"("year");
CREATE INDEX IF NOT EXISTS "Camp_start_date_idx" ON "Camp"("start_date");
CREATE INDEX IF NOT EXISTS "Camp_end_date_idx" ON "Camp"("end_date");
CREATE INDEX IF NOT EXISTS "Camp_deleted_at_idx" ON "Camp"("deleted_at");
CREATE INDEX IF NOT EXISTS "Camp_entity_deleted_idx" ON "Camp"("entity_id", "deleted_at");

-- Campite table indexes
-- Queries: findMany by camp_id, user_id, district_id, payment_ref
-- Queries: groupBy gender, age_group, type for analytics
-- Queries: orderBy created_at for recent registrations
-- Already has: @@index([camp_id]), @@index([user_id]) from Prisma
CREATE INDEX IF NOT EXISTS "Campite_district_id_idx" ON "Campite"("district_id") WHERE "district_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "Campite_payment_ref_idx" ON "Campite"("payment_ref") WHERE "payment_ref" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "Campite_registration_no_idx" ON "Campite"("registration_no");
CREATE INDEX IF NOT EXISTS "Campite_created_at_idx" ON "Campite"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "Campite_deleted_at_idx" ON "Campite"("deleted_at");
CREATE INDEX IF NOT EXISTS "Campite_gender_idx" ON "Campite"("gender");
CREATE INDEX IF NOT EXISTS "Campite_age_group_idx" ON "Campite"("age_group");
CREATE INDEX IF NOT EXISTS "Campite_type_idx" ON "Campite"("type");
CREATE INDEX IF NOT EXISTS "Campite_camp_created_idx" ON "Campite"("camp_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "Campite_camp_deleted_idx" ON "Campite"("camp_id", "deleted_at");
CREATE INDEX IF NOT EXISTS "Campite_user_deleted_idx" ON "Campite"("user_id", "deleted_at");

-- Camp_Allocation table indexes
-- Queries: findMany by camp_id
-- Already has: @@index([camp_id]) from Prisma
CREATE INDEX IF NOT EXISTS "Camp_Allocation_deleted_at_idx" ON "Camp_Allocation"("deleted_at");
CREATE INDEX IF NOT EXISTS "Camp_Allocation_camp_deleted_idx" ON "Camp_Allocation"("camp_id", "deleted_at");

-- Payment table indexes
-- Queries: findFirst by reference (webhook), findMany by user_id, camp_id
-- Already unique: reference
CREATE INDEX IF NOT EXISTS "Payment_user_id_idx" ON "Payment"("user_id");
CREATE INDEX IF NOT EXISTS "Payment_camp_id_idx" ON "Payment"("camp_id");
CREATE INDEX IF NOT EXISTS "Payment_created_at_idx" ON "Payment"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "Payment_deleted_at_idx" ON "Payment"("deleted_at");
CREATE INDEX IF NOT EXISTS "Payment_user_deleted_idx" ON "Payment"("user_id", "deleted_at");
CREATE INDEX IF NOT EXISTS "Payment_camp_deleted_idx" ON "Payment"("camp_id", "deleted_at");

-- District table indexes
CREATE INDEX IF NOT EXISTS "District_name_idx" ON "District"("name");
CREATE INDEX IF NOT EXISTS "District_deleted_at_idx" ON "District"("deleted_at");

-- Entity table indexes
CREATE INDEX IF NOT EXISTS "Entity_name_idx" ON "Entity"("name");
CREATE INDEX IF NOT EXISTS "Entity_deleted_at_idx" ON "Entity"("deleted_at");

-- Composite indexes for common analytics queries
-- Analytics: count campites by camp and date range
CREATE INDEX IF NOT EXISTS "Campite_analytics_idx" ON "Campite"("camp_id", "created_at", "deleted_at");

-- Analytics: revenue calculations with filters
CREATE INDEX IF NOT EXISTS "Campite_revenue_idx" ON "Campite"("type", "amount", "deleted_at") WHERE "amount" IS NOT NULL;

-- User campites lookup (for user dashboard)
CREATE INDEX IF NOT EXISTS "Campite_user_camp_idx" ON "Campite"("user_id", "camp_id", "deleted_at");
