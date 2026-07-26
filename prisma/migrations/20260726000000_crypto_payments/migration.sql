-- CreateTable
CREATE TABLE "CryptoPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "providerInvoiceId" TEXT,
    "providerPaymentId" TEXT,
    "product" TEXT NOT NULL DEFAULT 'vip_membership',
    "plan" TEXT NOT NULL,
    "tier" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "payCurrency" TEXT NOT NULL DEFAULT 'usdttrc20',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "consentRecordId" TEXT,
    "accessDays" INTEGER NOT NULL,
    "periodEnd" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CryptoPayment_orderId_key" ON "CryptoPayment"("orderId");

-- CreateIndex
CREATE INDEX "CryptoPayment_userId_idx" ON "CryptoPayment"("userId");

-- CreateIndex
CREATE INDEX "CryptoPayment_status_idx" ON "CryptoPayment"("status");

-- CreateIndex
CREATE INDEX "CryptoPayment_providerPaymentId_idx" ON "CryptoPayment"("providerPaymentId");

-- AddForeignKey
ALTER TABLE "CryptoPayment" ADD CONSTRAINT "CryptoPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
