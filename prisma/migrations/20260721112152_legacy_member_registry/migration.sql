-- CreateTable
CREATE TABLE "LegacyMember" (
    "id" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "displayName" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "tier" TEXT,
    "source" TEXT NOT NULL DEFAULT 'chat_export',
    "claimedByUserId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegacyMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegacyMember_telegramUserId_key" ON "LegacyMember"("telegramUserId");

-- CreateIndex
CREATE INDEX "LegacyMember_telegramUsername_idx" ON "LegacyMember"("telegramUsername");

-- CreateIndex
CREATE INDEX "LegacyMember_tier_idx" ON "LegacyMember"("tier");

-- CreateIndex
CREATE INDEX "LegacyMember_claimedByUserId_idx" ON "LegacyMember"("claimedByUserId");
