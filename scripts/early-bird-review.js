// Local-only Early Bird review tool. There is deliberately no public/web
// admin route for this (see docs/early-bird-admin-workflow.md: "Do not
// create a public admin route") - an operator runs this against the same
// DATABASE_URL the app uses, from a trusted machine.
//
// Usage:
//   node scripts/early-bird-review.js list [status]
//   node scripts/early-bird-review.js approve <reference> <verifiedBy>
//   node scripts/early-bird-review.js reject  <reference> <verifiedBy> [reason]
//   node scripts/early-bird-review.js mark    <reference> <status> [verifiedBy] [note]

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

const GRANTS_ELIGIBILITY = new Set(['approved', 'code_issued', 'redeemed']);
const REVOKES_ELIGIBILITY = new Set(['rejected', 'suspended']);

function getPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Configure it before running this script.');
    process.exit(1);
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
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
      `${r.reference}  ${r.status.padEnd(18)}  ${r.email}  @${r.telegramUsername || '-'}  ${r.createdAt.toISOString()}`
    );
  }
}

async function applyDecision(prisma, reference, status, verifiedBy, note) {
  const request = await prisma.earlyBirdRequest.findUnique({ where: { reference } });
  if (!request) {
    console.error(`No Early Bird request found with reference ${reference}.`);
    process.exit(1);
  }

  const grants = GRANTS_ELIGIBILITY.has(status);
  const revokes = REVOKES_ELIGIBILITY.has(status);
  const notes = note
    ? [request.notes, `[${status} by ${verifiedBy || 'unknown'}] ${note}`].filter(Boolean).join('\n\n')
    : request.notes;

  await prisma.earlyBirdRequest.update({
    where: { reference },
    data: {
      status,
      eligible: grants,
      verifiedAt: new Date(),
      verifiedBy: verifiedBy || request.verifiedBy,
      notes,
    },
  });

  let userId = request.userId;
  if (!userId) {
    const matchedUser = await prisma.user.findUnique({ where: { email: request.email }, select: { id: true } });
    userId = matchedUser?.id || null;
  }

  if (userId && (grants || revokes)) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        earlyBirdEligible: grants,
        earlyBirdVerifiedAt: grants ? new Date() : null,
      },
    });
    console.log(`Updated ${reference} to "${status}" and set User.earlyBirdEligible=${grants}.`);
  } else if (!userId && grants) {
    console.log(
      `Updated ${reference} to "${status}". No account exists yet for ${request.email} - eligibility will apply automatically once they register with this email.`
    );
  } else {
    console.log(`Updated ${reference} to "${status}".`);
  }
}

async function main() {
  const [, , command, ...args] = process.argv;
  const prisma = getPrisma();

  try {
    if (command === 'list') {
      await listRequests(prisma, args[0]);
      return;
    }

    if (command === 'approve' || command === 'reject') {
      const [reference, verifiedBy, ...rest] = args;
      if (!reference || !verifiedBy) {
        console.error(`Usage: node scripts/early-bird-review.js ${command} <reference> <verifiedBy> [reason]`);
        process.exit(1);
      }
      await applyDecision(prisma, reference, command === 'approve' ? 'approved' : 'rejected', verifiedBy, rest.join(' '));
      return;
    }

    if (command === 'mark') {
      const [reference, status, verifiedBy, ...rest] = args;
      if (!reference || !VALID_STATUSES.includes(status)) {
        console.error(`Usage: node scripts/early-bird-review.js mark <reference> <${VALID_STATUSES.join('|')}> [verifiedBy] [note]`);
        process.exit(1);
      }
      await applyDecision(prisma, reference, status, verifiedBy || null, rest.join(' '));
      return;
    }

    console.log(
      [
        'Usage:',
        '  node scripts/early-bird-review.js list [status]',
        '  node scripts/early-bird-review.js approve <reference> <verifiedBy>',
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
