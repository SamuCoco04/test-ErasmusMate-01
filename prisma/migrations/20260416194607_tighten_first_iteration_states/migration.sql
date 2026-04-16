-- AlterTable
ALTER TABLE "ExceptionRequest" ADD COLUMN "appliedAt" DATETIME;
ALTER TABLE "ExceptionRequest" ADD COLUMN "appliedEffectSummary" TEXT;
ALTER TABLE "ExceptionRequest" ADD COLUMN "decidedAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SocialConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requesterProfileId" TEXT NOT NULL,
    "recipientProfileId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'pending',
    "messagingPermission" TEXT NOT NULL DEFAULT 'not_permitted',
    "blockedByProfileId" TEXT,
    "blockedReason" TEXT,
    "respondedAt" DATETIME,
    "closedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialConnection_requesterProfileId_fkey" FOREIGN KEY ("requesterProfileId") REFERENCES "SocialProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SocialConnection_recipientProfileId_fkey" FOREIGN KEY ("recipientProfileId") REFERENCES "SocialProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SocialConnection" ("createdAt", "id", "recipientProfileId", "requesterProfileId", "state", "updatedAt") SELECT "createdAt", "id", "recipientProfileId", "requesterProfileId", "state", "updatedAt" FROM "SocialConnection";
DROP TABLE "SocialConnection";
ALTER TABLE "new_SocialConnection" RENAME TO "SocialConnection";
CREATE TABLE "new_SocialContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'published_visible',
    "placeLabel" TEXT,
    "placeCity" TEXT,
    "placeCountry" TEXT,
    "placeLatitude" DECIMAL,
    "placeLongitude" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialContent_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SocialContent" ("authorId", "body", "category", "createdAt", "id", "state", "title", "type", "updatedAt") SELECT "authorId", "body", "category", "createdAt", "id", "state", "title", "type", "updatedAt" FROM "SocialContent";
DROP TABLE "SocialContent";
ALTER TABLE "new_SocialContent" RENAME TO "SocialContent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
