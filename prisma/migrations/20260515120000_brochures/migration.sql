-- CreateTable
CREATE TABLE "Brochure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deceasedName" TEXT NOT NULL,
    "dateOfBirth" TEXT,
    "dateOfDeath" TEXT,
    "bio" TEXT NOT NULL DEFAULT '',
    "sections" JSONB NOT NULL DEFAULT '[]',
    "privacy" TEXT NOT NULL DEFAULT 'public',
    "accessCode" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Brochure_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Brochure_creatorId_updatedAt_idx" ON "Brochure"("creatorId", "updatedAt");
