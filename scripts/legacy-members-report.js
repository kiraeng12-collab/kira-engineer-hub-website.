// Local-only report on the LegacyMember loyalty registry.
//   node scripts/legacy-members-report.js
require('dotenv/config');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('../lib/generated/prisma');

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
    const total = await prisma.legacyMember.count();
    const founding = await prisma.legacyMember.count({ where: { tier: 'founding' } });
    const earlyBird = await prisma.legacyMember.count({ where: { tier: 'early_bird' } });
    const standard = await prisma.legacyMember.count({ where: { tier: null } });
    const claimed = await prisma.legacyMember.count({ where: { NOT: { claimedByUserId: null } } });

    const earliest = await prisma.legacyMember.findFirst({ orderBy: { joinedAt: 'asc' } });
    const latest = await prisma.legacyMember.findFirst({ orderBy: { joinedAt: 'desc' } });

    console.log('KIRA loyalty registry');
    console.log('  total members : ' + total);
    console.log('  founding      : ' + founding);
    console.log('  early_bird    : ' + earlyBird);
    console.log('  standard      : ' + standard);
    console.log('  claimed       : ' + claimed);
    if (earliest) console.log('  earliest join : ' + earliest.joinedAt.toISOString().slice(0, 10));
    if (latest) console.log('  latest join   : ' + latest.joinedAt.toISOString().slice(0, 10));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
