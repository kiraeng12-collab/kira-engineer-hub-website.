// Wipes payment artifacts created during the Stripe TEST-mode dry run so the
// live launch starts from zero. Run this once, on go-live day, AFTER switching
// Vercel to the live keys.
//
//   node scripts/reset-test-payment-data.js           # dry run - shows what it WOULD delete
//   node scripts/reset-test-payment-data.js --apply   # actually deletes
//
// KEEPS: the 535 LegacyMember loyalty rows (real, from the chat export) and all
// User accounts. CLEARS: entitlements, memberships, consent records + their
// acceptances, and each user's Stripe/Telegram payment fields.
require('dotenv/config');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('../lib/generated/prisma');

const APPLY = process.argv.includes('--apply');

function getPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}

async function main() {
  const prisma = getPrisma();
  try {
    const [acceptances, consents, entitlements, memberships, legacy, linkedUsers] = await Promise.all([
      prisma.agreementAcceptance.count(),
      prisma.consentRecord.count(),
      prisma.entitlement.count(),
      prisma.membership.count(),
      prisma.legacyMember.count(),
      prisma.user.count({
        where: {
          OR: [
            { stripeCustomerId: { not: null } },
            { telegramUserId: { not: null } },
            { membershipTier: { not: null } },
            { telegramInviteTokenHash: { not: null } },
            { discountClaimTokenHash: { not: null } },
          ],
        },
      }),
    ]);

    console.log('Test-era data to CLEAR:');
    console.log(`  agreement acceptances : ${acceptances}`);
    console.log(`  consent records       : ${consents}`);
    console.log(`  entitlements          : ${entitlements}`);
    console.log(`  memberships           : ${memberships}`);
    console.log(`  users w/ payment fields to reset : ${linkedUsers}`);
    console.log('Will KEEP:');
    console.log(`  legacy loyalty members : ${legacy}`);
    console.log('  all user accounts');

    if (!APPLY) {
      console.log('\nDRY RUN - nothing deleted. Re-run with --apply to execute.');
      return;
    }

    // Order matters: acceptances reference consent records.
    await prisma.agreementAcceptance.deleteMany({});
    await prisma.consentRecord.deleteMany({});
    await prisma.entitlement.deleteMany({});
    await prisma.membership.deleteMany({});
    await prisma.user.updateMany({
      data: {
        stripeCustomerId: null,
        membershipTier: null,
        telegramInviteTokenHash: null,
        telegramInviteTokenExpiresAt: null,
        telegramRemovedAt: null,
        discountClaimTokenHash: null,
        discountClaimTokenExpiresAt: null,
        discountClaimedAt: null,
      },
    });
    // Clear any loyalty claims so the registry is unclaimed again.
    await prisma.legacyMember.updateMany({ data: { claimedByUserId: null, claimedAt: null } });

    console.log('\n✅ Test-era payment data cleared. Loyalty registry preserved.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
