-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "effectiveAt" TIMESTAMP(3),
    "stripeCheckoutId" TEXT,
    "certificateIssuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentRecordId" TEXT,
    "consentType" TEXT NOT NULL DEFAULT 'agreement',
    "agreement" TEXT,
    "version" TEXT NOT NULL,
    "documentHash" TEXT,
    "method" TEXT NOT NULL DEFAULT 'web',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgreementAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'stripe',
    "stripeSubscriptionId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "lastEventCreatedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_product_idx" ON "ConsentRecord"("userId", "product");

-- CreateIndex
CREATE INDEX "ConsentRecord_stripeCheckoutId_idx" ON "ConsentRecord"("stripeCheckoutId");

-- CreateIndex
CREATE INDEX "AgreementAcceptance_userId_agreement_idx" ON "AgreementAcceptance"("userId", "agreement");

-- CreateIndex
CREATE INDEX "AgreementAcceptance_agreement_version_idx" ON "AgreementAcceptance"("agreement", "version");

-- CreateIndex
CREATE INDEX "AgreementAcceptance_consentRecordId_idx" ON "AgreementAcceptance"("consentRecordId");

-- CreateIndex
CREATE INDEX "Entitlement_status_idx" ON "Entitlement"("status");

-- CreateIndex
CREATE INDEX "Entitlement_product_status_idx" ON "Entitlement"("product", "status");

-- CreateIndex
CREATE INDEX "Entitlement_stripeSubscriptionId_idx" ON "Entitlement"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_userId_product_key" ON "Entitlement"("userId", "product");

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementAcceptance" ADD CONSTRAINT "AgreementAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementAcceptance" ADD CONSTRAINT "AgreementAcceptance_consentRecordId_fkey" FOREIGN KEY ("consentRecordId") REFERENCES "ConsentRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

