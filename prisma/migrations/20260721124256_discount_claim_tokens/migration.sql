-- AlterTable
ALTER TABLE "User" ADD COLUMN     "discountClaimTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "discountClaimTokenHash" TEXT,
ADD COLUMN     "discountClaimedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_discountClaimTokenHash_key" ON "User"("discountClaimTokenHash");
