// Local-only importer: seeds the LegacyMember loyalty registry from a Telegram
// Desktop chat export, so existing community members automatically get their
// permanent pricing tier.
//
// Telegram's Bot API exposes neither a join date nor a member list, so a chat
// export is the only reliable source of historical join dates.
//
// How to produce the export:
//   Telegram Desktop -> open Kira Trading Community -> menu (...) ->
//   "Export chat history" -> uncheck all media (not needed) ->
//   Format: JSON -> Export. You get a result.json.
//
// Usage:
//   node scripts/import-legacy-members.js preview <path-to-result.json>
//   node scripts/import-legacy-members.js import  <path-to-result.json>
//
// "preview" parses and shows a tier breakdown WITHOUT touching the database.
// Always run preview first.

require('dotenv/config');
const fs = require('node:fs');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('../lib/generated/prisma');

// Mirrors lib/config/legacy-tiers.ts. Kept in plain JS here because this
// script runs outside the Next.js/TS build.
const FOUNDING_WINDOW_END = new Date('2025-01-01T00:00:00Z');
const EARLY_BIRD_CUTOFF = new Date('2026-08-01T00:00:00+04:00');

function tierForJoinDate(joinedAt) {
  const time = joinedAt.getTime();
  if (Number.isNaN(time)) return null;
  if (time < FOUNDING_WINDOW_END.getTime()) return 'founding';
  if (time < EARLY_BIRD_CUTOFF.getTime()) return 'early_bird';
  return null;
}

function getPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Configure it before running this script.');
    process.exit(1);
  }
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}

// Telegram writes user ids as "user123456789" in exports.
function normalizeUserId(raw) {
  if (raw === undefined || raw === null) return null;
  const text = String(raw);
  const match = text.match(/(\d{5,})/);
  return match ? match[1] : null;
}

/**
 * Extracts the EARLIEST evidence that each Telegram user was in the group.
 *
 * Telegram does not reliably log a join event for every member (joining a
 * public group by search, supergroup upgrades, and hidden history all lose
 * them). So three signals are collected and the earliest wins:
 *
 *   1. join service messages  - "join_group_by_link" / "invite_members"
 *   2. first message sent     - proves membership at that date
 *   3. first reaction given   - same, from `reactions[].recent[]`
 *
 * Signals 2 and 3 are a LOWER BOUND: someone may have joined earlier and
 * lurked. That is conservative rather than generous, and such members can
 * still appeal through the evidence review flow.
 */
function parseJoins(exportJson) {
  const messages = Array.isArray(exportJson.messages) ? exportJson.messages : [];
  const earliest = new Map(); // telegramUserId -> { joinedAt, name, evidence }
  const counts = {
    join_group_by_link: 0,
    invite_members: 0,
    from_message: 0,
    from_reaction: 0,
    skipped: 0,
  };

  // Join events are stronger evidence than activity, so they win ties.
  const RANK = { join_event: 2, activity: 1 };

  const remember = (userId, name, when, evidence) => {
    if (!userId || !when || Number.isNaN(when.getTime())) return;
    const existing = earliest.get(userId);
    if (
      !existing ||
      when < existing.joinedAt ||
      (when.getTime() === existing.joinedAt.getTime() &&
        RANK[evidence] > RANK[existing.evidence])
    ) {
      earliest.set(userId, {
        joinedAt: when,
        name: name || existing?.name || null,
        evidence: existing && when > existing.joinedAt ? existing.evidence : evidence,
      });
    }
  };

  const dateOf = (item) =>
    item.date_unixtime ? new Date(Number(item.date_unixtime) * 1000) : new Date(item.date);

  for (const message of messages) {
    const when = dateOf(message);

    if (message.type === 'service') {
      if (message.action === 'join_group_by_link') {
        counts.join_group_by_link += 1;
        remember(normalizeUserId(message.actor_id), message.actor, when, 'join_event');
      } else if (message.action === 'invite_members') {
        counts.invite_members += 1;
        const members = Array.isArray(message.members) ? message.members : [];
        const ids = Array.isArray(message.member_ids) ? message.member_ids : [];
        if (ids.length) {
          ids.forEach((id, index) =>
            remember(normalizeUserId(id), members[index], when, 'join_event')
          );
        } else {
          counts.skipped += members.length;
        }
      }
      continue;
    }

    // 2. Any message they sent proves they were in the group that day.
    const authorId = normalizeUserId(message.from_id);
    if (authorId) {
      counts.from_message += 1;
      remember(authorId, message.from, when, 'activity');
    }

    // 3. Reactions carry their own reactor ids and timestamps.
    const reactions = Array.isArray(message.reactions) ? message.reactions : [];
    for (const reaction of reactions) {
      const recent = Array.isArray(reaction.recent) ? reaction.recent : [];
      for (const entry of recent) {
        const reactorId = normalizeUserId(entry.from_id);
        if (!reactorId) continue;
        counts.from_reaction += 1;
        remember(reactorId, entry.from, entry.date ? dateOf(entry) : when, 'activity');
      }
    }
  }

  return { earliest, counts };
}

function summarise(earliest) {
  const rows = [...earliest.entries()].map(([telegramUserId, value]) => ({
    telegramUserId,
    displayName: value.name,
    joinedAt: value.joinedAt,
    evidence: value.evidence,
    tier: tierForJoinDate(value.joinedAt),
  }));
  const byTier = { founding: 0, early_bird: 0, standard: 0 };
  const byEvidence = { join_event: 0, activity: 0 };
  for (const row of rows) {
    if (row.tier === 'founding') byTier.founding += 1;
    else if (row.tier === 'early_bird') byTier.early_bird += 1;
    else byTier.standard += 1;
    byEvidence[row.evidence] = (byEvidence[row.evidence] || 0) + 1;
  }
  return { rows, byTier, byEvidence };
}

function loadExport(path) {
  if (!path) {
    console.error('Provide the path to your Telegram export result.json');
    process.exit(1);
  }
  if (!fs.existsSync(path)) {
    console.error(`File not found: ${path}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

/**
 * Telegram produces two different shapes:
 *   - single-chat export ("Export chat history")  -> { name, messages: [...] }
 *   - full account export ("Export Telegram data") -> { chats: { list: [ {name, messages}, ... ] } }
 * Both are supported so it doesn't matter which route was used.
 */
function extractChats(exportJson) {
  if (Array.isArray(exportJson?.messages)) {
    return [
      {
        name: exportJson.name || 'exported chat',
        id: exportJson.id,
        type: exportJson.type,
        messages: exportJson.messages,
      },
    ];
  }
  const list = exportJson?.chats?.list;
  if (Array.isArray(list)) {
    return list.filter((chat) => Array.isArray(chat.messages));
  }
  return [];
}

/** Picks the chat to analyse, or prints the options when it's ambiguous. */
function selectChat(chats, filter) {
  if (chats.length === 0) {
    console.error('No chats with messages were found in this export file.');
    process.exit(1);
  }
  if (filter) {
    const needle = filter.toLowerCase();
    const matches = chats.filter(
      (chat) =>
        String(chat.id) === filter ||
        String(chat.name || '').toLowerCase().includes(needle)
    );
    if (matches.length === 0) {
      console.error(`No chat matched "${filter}".`);
      process.exit(1);
    }
    if (matches.length > 1) {
      console.error(`"${filter}" matched ${matches.length} chats - be more specific.`);
      matches.forEach((c) => console.error(`  - ${c.name} (id ${c.id}, ${c.messages.length} messages)`));
      process.exit(1);
    }
    return matches[0];
  }
  if (chats.length === 1) return chats[0];

  console.log(`This export contains ${chats.length} chats. Choose one with --chat=<name or id>:\n`);
  chats
    .slice()
    .sort((a, b) => b.messages.length - a.messages.length)
    .slice(0, 25)
    .forEach((chat) => {
      console.log(`  ${String(chat.messages.length).padStart(7)} messages  ${chat.name || '(unnamed)'}  [id ${chat.id}]`);
    });
  console.log('\nExample:');
  console.log('  node scripts/import-legacy-members.js preview <file> --chat="Kira Trading Community"');
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const filePath = args[1];
  const chatFilter = (args.find((a) => a.startsWith('--chat=')) || '').replace('--chat=', '');

  if (!['preview', 'import'].includes(command)) {
    console.log('Usage:');
    console.log('  node scripts/import-legacy-members.js preview <result.json> [--chat="name or id"]');
    console.log('  node scripts/import-legacy-members.js import  <result.json> [--chat="name or id"]');
    process.exit(1);
  }

  const chats = extractChats(loadExport(filePath));
  const data = selectChat(chats, chatFilter);
  const { earliest, counts } = parseJoins(data);
  const { rows, byTier, byEvidence } = summarise(earliest);

  console.log(`Chat: ${data.name || 'unknown'}${data.id ? ` (id ${data.id})` : ''}`);
  console.log(`Messages in chat: ${data.messages.length}`);
  console.log('Signals found in export:');
  console.log(`  join events   : ${counts.join_group_by_link + counts.invite_members}`);
  console.log(`  messages      : ${counts.from_message}`);
  console.log(`  reactions     : ${counts.from_reaction}`);
  if (counts.skipped) {
    console.log(`  (${counts.skipped} added-member entries had no user id and were skipped)`);
  }
  console.log(`\nUnique members dated: ${rows.length}`);
  console.log('  dated by a real join event : ' + (byEvidence.join_event || 0));
  console.log('  dated by first activity    : ' + (byEvidence.activity || 0) + '  (lower bound - may have joined earlier)');
  console.log('\nTier breakdown:');
  console.log(`  founding   (2024 or earlier) : ${byTier.founding}`);
  console.log(`  early_bird (2025 - Aug 2026) : ${byTier.early_bird}`);
  console.log(`  standard   (after cutoff)    : ${byTier.standard}`);

  const sample = rows.slice(0, 5);
  if (sample.length) {
    console.log('\nSample:');
    for (const row of sample) {
      console.log(`  ${row.telegramUserId} ${row.displayName || ''} -> ${row.joinedAt.toISOString().slice(0, 10)} (${row.tier || 'standard'}, via ${row.evidence})`);
    }
  }

  if (command === 'preview') {
    console.log('\nPreview only - nothing was written. Re-run with "import" to save.');
    return;
  }

  const prisma = getPrisma();
  let created = 0;
  let updated = 0;
  try {
    for (const row of rows) {
      const existing = await prisma.legacyMember.findUnique({
        where: { telegramUserId: row.telegramUserId },
      });
      // Never let a re-import push someone's join date later (which could
      // silently downgrade their tier).
      if (existing) {
        if (existing.joinedAt <= row.joinedAt) continue;
        await prisma.legacyMember.update({
          where: { telegramUserId: row.telegramUserId },
          data: {
            joinedAt: row.joinedAt,
            tier: row.tier,
            displayName: row.displayName,
            notes: `dated by ${row.evidence}`,
          },
        });
        updated += 1;
      } else {
        await prisma.legacyMember.create({
          data: {
            telegramUserId: row.telegramUserId,
            displayName: row.displayName,
            joinedAt: row.joinedAt,
            tier: row.tier,
            source: 'chat_export',
            notes: `dated by ${row.evidence}`,
          },
        });
        created += 1;
      }
    }
    console.log(`\nImport complete. Created ${created}, updated ${updated}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
