-- AlterTable
ALTER TABLE "Campite" ADD COLUMN "district_id" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_District" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "zones" JSONB NOT NULL DEFAULT "[]",
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME
);
INSERT INTO "new_District" ("created_at", "deleted_at", "id", "name", "updated_at") SELECT "created_at", "deleted_at", "id", "name", "updated_at" FROM "District";
DROP TABLE "District";
ALTER TABLE "new_District" RENAME TO "District";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
