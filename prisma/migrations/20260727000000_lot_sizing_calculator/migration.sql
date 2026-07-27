-- KIRA Lot Sizing Calculator (Stage 4/6): VIP saved account profiles and
-- persisted calculations for VIP history + future Project 242 events.
-- Adds two new tables only; no existing table is altered (the new relations on
-- User are virtual back-relations and create no columns).

-- CreateTable
CREATE TABLE "TradingAccountProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "accountCurrency" TEXT NOT NULL,
    "leverage" INTEGER NOT NULL,
    "brokerName" TEXT,
    "accountType" TEXT,
    "defaultEquity" DOUBLE PRECISION,
    "defaultRiskMode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradingAccountProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotSizeCalculation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "calculationVersion" TEXT NOT NULL,
    "riskMode" TEXT NOT NULL,
    "riskModeVersion" TEXT NOT NULL,
    "instrumentSymbol" TEXT NOT NULL,
    "instrumentSpecVersion" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "accountCurrency" TEXT NOT NULL,
    "equity" DOUBLE PRECISION NOT NULL,
    "recommendedPosition" DOUBLE PRECISION,
    "normalRiskAmount" DOUBLE PRECISION,
    "requiredMargin" DOUBLE PRECISION,
    "inputs" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LotSizeCalculation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TradingAccountProfile_userId_idx" ON "TradingAccountProfile"("userId");

-- CreateIndex
CREATE INDEX "LotSizeCalculation_userId_createdAt_idx" ON "LotSizeCalculation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LotSizeCalculation_status_idx" ON "LotSizeCalculation"("status");

-- CreateIndex
CREATE INDEX "LotSizeCalculation_riskMode_idx" ON "LotSizeCalculation"("riskMode");

-- AddForeignKey
ALTER TABLE "TradingAccountProfile" ADD CONSTRAINT "TradingAccountProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotSizeCalculation" ADD CONSTRAINT "LotSizeCalculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
