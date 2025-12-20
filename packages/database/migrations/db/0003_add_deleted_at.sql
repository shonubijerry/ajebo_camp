-- AlterTable
ALTER TABLE "Camp" ADD COLUMN "deleted_at" DATETIME;

-- AlterTable
ALTER TABLE "Camp_Allocation" ADD COLUMN "deleted_at" DATETIME;

-- AlterTable
ALTER TABLE "Campite" ADD COLUMN "deleted_at" DATETIME;

-- AlterTable
ALTER TABLE "District" ADD COLUMN "deleted_at" DATETIME;

-- AlterTable
ALTER TABLE "Entity" ADD COLUMN "deleted_at" DATETIME;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "deleted_at" DATETIME;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "deleted_at" DATETIME;
