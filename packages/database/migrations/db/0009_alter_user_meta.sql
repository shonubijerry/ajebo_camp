-- AlterTable
ALTER TABLE "User" ADD COLUMN "forgot_token" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Camp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "theme" TEXT,
    "verse" TEXT,
    "entity_id" TEXT NOT NULL,
    "banner" TEXT,
    "year" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "premium_fees" JSONB NOT NULL DEFAULT '[]',
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "highlights" JSONB NOT NULL DEFAULT '{}',
    "registration_deadline" DATETIME,
    "user_id" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "Camp_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Camp" ("banner", "contact_email", "contact_phone", "created_at", "deleted_at", "end_date", "entity_id", "fee", "highlights", "id", "premium_fees", "registration_deadline", "start_date", "theme", "title", "updated_at", "user_id", "verse", "year") SELECT "banner", "contact_email", "contact_phone", "created_at", "deleted_at", "end_date", "entity_id", "fee", "highlights", "id", "premium_fees", "registration_deadline", "start_date", "theme", "title", "updated_at", "user_id", "verse", "year" FROM "Camp";
DROP TABLE "Camp";
ALTER TABLE "new_Camp" RENAME TO "Camp";
CREATE INDEX "Camp_entity_id_idx" ON "Camp"("entity_id");
CREATE TABLE "new_Campite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registration_no" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "age_group" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "camp_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "district_id" TEXT,
    "payment_ref" TEXT,
    "type" TEXT NOT NULL DEFAULT 'regular',
    "amount" INTEGER,
    "allocated_items" TEXT NOT NULL,
    "checkin_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "Campite_camp_id_fkey" FOREIGN KEY ("camp_id") REFERENCES "Camp" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Campite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Campite" ("age_group", "allocated_items", "amount", "camp_id", "checkin_at", "created_at", "deleted_at", "district_id", "email", "firstname", "gender", "id", "lastname", "payment_ref", "phone", "type", "updated_at", "user_id") SELECT "age_group", "allocated_items", "amount", "camp_id", "checkin_at", "created_at", "deleted_at", "district_id", "email", "firstname", "gender", "id", "lastname", "payment_ref", "phone", "type", "updated_at", "user_id" FROM "Campite";
DROP TABLE "Campite";
ALTER TABLE "new_Campite" RENAME TO "Campite";
CREATE UNIQUE INDEX "Campite_registration_no_key" ON "Campite"("registration_no");
CREATE INDEX "Campite_camp_id_idx" ON "Campite"("camp_id");
CREATE INDEX "Campite_user_id_idx" ON "Campite"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
