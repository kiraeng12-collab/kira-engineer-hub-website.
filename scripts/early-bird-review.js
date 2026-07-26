// Local-only Early Bird review tool. There is deliberately no public/web
// admin route for this (see docs/early-bird-admin-workflow.md: "Do not
// create a public admin route") - an operator runs this against the same
// DATABASE_URL the app uses, from a trusted machine.
//
// Usage:
//   node scripts/early-bird-review.js list [status]
//   node scripts/early-bird-review.js approve <reference> <verifiedBy> --tier=founding|early_bird
//   node scripts/early-bird-review.js reject  <reference> <verifiedBy> [reason]
//   node scripts/early-bird-review.js mark    <reference> <status> [verifiedBy] [note]
//
// Tiers:
//   founding    - joined Kira Trading Community 2024 or earlier. Permanent flat
//                 discounted price ($50/mo, $150/qtr).
//   early_bird  - joined 2025 through 1 Aug 2026. Permanent flat Early Bird
//                 price ($56/mo, $160/qtr).

require('dotenv/config');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('../lib/generated/prisma');

const VALID_STATUSES = [
  'submitted',
  'under_review',
  'evidence_required',
  'approved',
  'rejected',
  'code_issued',
  'redeemed',
  'suspended',
];

const VALID_TIERS = ['founding', 'early_bird'];

const GRANTS_ELIGIBILITY = new Set(['approved', 'code_issued', 'redeemed']);
const REVOKES_ELIGIBILITY = new Set(['rejected', 'suspended']);

// Upgrade-only tier resolution, mirroring lib/config/legacy-tiers.bestTier:
// founding beats early_bird beats none. Never downgrades a member.
function tierRank(t) {
  return t === 'founding' ? 2 : t === 'early_bird' ? 1 : 0;
}
function bestTier(current, incoming) {
  return tierRank(current) >= tierRank(incoming) ? current || null : incoming || null;
}

function getPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Configure it before running this script.');
    process.exit(1);
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

// Pulls --tier=X out of an argv slice and returns { tier, rest } with that
// flag removed, so positional argument parsing elsewhere is unaffected.
function extractTierFlag(args) {
  let tier = null;
  const rest = [];
  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      tier = arg.slice('--tier='.length);
    } else {
      rest.push(arg);
    }
  }
  return { tier, rest };
}

async function listRequests(prisma, status) {
  if (status && !VALID_STATUSES.includes(status)) {
    console.error(`Unknown status "${status}". Valid: ${VALID_STATUSES.join(', ')}`);
    process.exit(1);
  }
  const requests = await prisma.earlyBirdRequest.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'asc' },
  });
  if (!requests.length) {
    console.log(status ? `No requests with status "${status}".` : 'No Early Bird requests found.');
    return;
  }
  for (const r of requests) {
    console.log(
      `${r.reference}  ${r.status.padEnd(18)}  tier:${(r.tier || '-').padEnd(11)}  ${r.email}  @${r.telegramUsername || '-'}  ${r.createdAt.toISOString()}`
    );
  }
}

async function applyDecision(prisma, reference, status, verifiedBy, tier, note) {
  const request = await prisma.earlyBirdRequest.findUnique({ where: { reference } });
  if (!request) {
    console.error(`No Early Bird request found with reference ${reference}.`);
    process.exit(1);
  }

  const grants = GRANTS_ELIGIBILITY.has(status);
  const revokes = REVOKES_ELIGIBILITY.has(status);
  const resolvedTier = tier || request.tier;
  const notes = note
    ? [request.notes, `[${status} by ${verifiedBy || 'unknown'}] ${note}`].filter(Boolean).join('\n\n')
    : request.notes;

  await prisma.earlyBirdRequest.update({
    where: { reference },
    data: {
      status,
      eligible: grants,
      tier: grants ? resolvedTier : request.tier,
      verifiedAt: new Date(),
      verifiedBy: verifiedBy || request.verifiedBy,
      notes,
    },
  });

  let user = request.userId
    ? await prisma.user.findUnique({ where: { id: request.userId }, select: { id: true, membershipTier: true, discountClaimedAt: true } })
    : null;
  if (!user) {
    user = await prisma.user.findUnique({ where: { email: request.email }, select: { id: true, membershipTier: true, discountClaimedAt: true } });
  }

  if (user && (grants || revokes)) {
    let newTier;
    if (grants) {
      // Upgrade-only: approving Early Bird must never downgrade a member who
      // already holds the deeper Founding tier (e.g. from the registry claim).
      newTier = bestTier(user.membershipTier, resolvedTier);
    } else {
      // Revoke: only clear the tier if it came from THIS Early Bird path. A
      // registry claim (discountClaimedAt set) is a separate, valid grant and
      // must not be wiped by an Early Bird rejection.
      newTier = user.discountClaimedAt ? user.membershipTier : null;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        membershipTier: newTier,
        earlyBirdVerifiedAt: grants ? new Date() : null,
      },
    });
    console.log(`Updated ${reference} to "${status}" and set User.membershipTier=${newTier ?? 'null'} (was ${user.membershipTier ?? 'none'}).`);
  } else if (!user && grants) {
    console.log(
      `Updated ${reference} to "${status}" (tier: ${resolvedTier}). No account exists yet for ${request.email} - the tier will apply automatically once they register with this email.`
    );
  } else {
    console.log(`Updated ${reference} to "${status}".`);
  }
}

async function main() {
  const [, , command, ...rawArgs] = process.argv;
  const { tier, rest: args } = extractTierFlag(rawArgs);
  const prisma = getPrisma();

  try {
    if (command === 'list') {
      await listRequests(prisma, args[0]);
      return;
    }

    if (command === 'approve') {
      const [reference, verifiedBy, ...noteParts] = args;
      if (!reference || !verifiedBy || !VALID_TIERS.includes(tier)) {
        console.error(
          `Usage: node scripts/early-bird-review.js approve <reference> <verifiedBy> --tier=${VALID_TIERS.join('|')}`
        );
        process.exit(1);
      }
      await applyDecision(prisma, reference, 'approved', verifiedBy, tier, noteParts.join(' '));
      return;
    }

    if (command === 'reject') {
      const [reference, verifiedBy, ...noteParts] = args;
      if (!reference || !verifiedBy) {
        console.error('Usage: node scripts/early-bird-review.js reject <reference> <verifiedBy> [reason]');
        process.exit(1);
      }
      await applyDecision(prisma, reference, 'rejected', verifiedBy, null, noteParts.join(' '));
      return;
    }

    if (command === 'mark') {
      const [reference, status, verifiedBy, ...noteParts] = args;
      if (!reference || !VALID_STATUSES.includes(status)) {
        console.error(`Usage: node scripts/early-bird-review.js mark <reference> <${VALID_STATUSES.join('|')}> [verifiedBy] [note]`);
        process.exit(1);
      }
      await applyDecision(prisma, reference, status, verifiedBy || null, tier, noteParts.join(' '));
      return;
    }

    console.log(
      [
        'Usage:',
        '  node scripts/early-bird-review.js list [status]',
        '  node scripts/early-bird-review.js approve <reference> <verifiedBy> --tier=founding|early_bird',
        '  node scripts/early-bird-review.js reject  <reference> <verifiedBy> [reason]',
        '  node scripts/early-bird-review.js mark    <reference> <status> [verifiedBy] [note]',
      ].join('\n')
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
