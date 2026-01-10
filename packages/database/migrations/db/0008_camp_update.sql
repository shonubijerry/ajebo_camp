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
    "premium_fees" JSONB NOT NULL DEFAULT [],
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "highlights" JSONB NOT NULL DEFAULT "{}",
    "registration_deadline" DATETIME,
    "user_id" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "Camp_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Camp" ("banner", "contact_email", "contact_phone", "created_at", "deleted_at", "end_date", "entity_id", "fee", "highlights", "id", "premium_fees", "registration_deadline", "start_date", "theme", "title", "updated_at", "verse", "year") SELECT "banner", "contact_email", "contact_phone", "created_at", "deleted_at", "end_date", "entity_id", "fee", coalesce("highlights", "{}") AS "highlights", "id", "premium_fees", "registration_deadline", "start_date", "theme", "title", "updated_at", "verse", "year" FROM "Camp";
DROP TABLE "Camp";
ALTER TABLE "new_Camp" RENAME TO "Camp";
CREATE INDEX "Camp_entity_id_idx" ON "Camp"("entity_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
