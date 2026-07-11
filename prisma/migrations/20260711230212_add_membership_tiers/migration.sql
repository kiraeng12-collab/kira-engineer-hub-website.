/*
  Warnings:

  - You are about to drop the column `earlyBirdApplied` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `earlyBirdEligible` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EarlyBirdRequest" ADD COLUMN     "tier" TEXT;

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "earlyBirdApplied",
ADD COLUMN     "tier" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "earlyBirdEligible",
ADD COLUMN     "membershipTier" TEXT;
