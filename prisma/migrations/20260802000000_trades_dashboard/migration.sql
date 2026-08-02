-- KIRA VIP Live Dashboard: trades parsed from VIP-channel signal posts.

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "channelChatId" TEXT NOT NULL,
    "channelMessageId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "size" TEXT,
    "entryMin" DOUBLE PRECISION,
    "entryMax" DOUBLE PRECISION,
    "stopLoss" DOUBLE PRECISION,
    "originalStopLoss" DOUBLE PRECISION,
    "movedToBE" BOOLEAN NOT NULL DEFAULT false,
    "takeProfits" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "tpHitCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'running',
    "outcome" TEXT,
    "rawText" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_channelChatId_channelMessageId_key" ON "Trade"("channelChatId", "channelMessageId");

-- CreateIndex
CREATE INDEX "Trade_status_openedAt_idx" ON "Trade"("status", "openedAt");

-- CreateIndex
CREATE INDEX "Trade_symbol_idx" ON "Trade"("symbol");
