-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "age_group" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "camp_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
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
INSERT INTO "new_Campite" ("age_group", "allocated_items", "amount", "camp_id", "checkin_at", "created_at", "deleted_at", "email", "firstname", "gender", "id", "lastname", "payment_ref", "phone", "type", "updated_at", "user_id") SELECT "age_group", "allocated_items", "amount", "camp_id", "checkin_at", "created_at", "deleted_at", "email", "firstname", "gender", "id", "lastname", "payment_ref", "phone", "type", "updated_at", "user_id" FROM "Campite";
DROP TABLE "Campite";
ALTER TABLE "new_Campite" RENAME TO "Campite";
CREATE INDEX "Campite_camp_id_idx" ON "Campite"("camp_id");
CREATE INDEX "Campite_user_id_idx" ON "Campite"("user_id");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME
);
INSERT INTO "new_User" ("created_at", "deleted_at", "email", "firstname", "id", "lastname", "password", "phone", "role", "updated_at") SELECT "created_at", "deleted_at", "email", "firstname", "id", "lastname", "password", "phone", "role", "updated_at" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
