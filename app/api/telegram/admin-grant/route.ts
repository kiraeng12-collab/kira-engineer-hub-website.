import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { grantEntitlement } from "@/lib/entitlements/service";

export const runtime = "nodejs";

/**
 * Bot-facing admin grant. Lets the owner reflect a member's existing (pre-v2)
 * running subscription by Telegram id: creates or updates a passwordless
 * account keyed by that Telegram id and grants an admin_grant vip_membership
 * entitlement until a fixed date. The member is already in the VIP group, so no
 * invite is sent; this just records the period so /status shows it, the expiry
 * digest nudges before it lapses, and the sweep removes them when it ends.
 *
 * Never overwrites a live card subscription. Idempotent — re-granting updates
 * the end date.
 */

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Accepts YYYY-MM-DD; access lasts through the END of that day (UTC).
function parseUntil(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T23:59:59.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(request: Request): Promise<Response> {
  const sharedSecret = process.env.TELEGRAM_BOT_VERIFY_SECRET;
  const prisma = getPrismaClient();
  if (!sharedSecret || !prisma) return jsonResponse(503, { ok: false, reason: "not_configured" });
  if (!secretsMatch(request.headers.get("x-kira-bot-secret"), sharedSecret)) {
    return jsonResponse(401, { ok: false, reason: "unauthorized" });
  }

  const body = (await request.json().catch(() => null)) as {
    telegramUserId?: unknown;
    until?: unknown;
    name?: unknown;
    username?: unknown;
    plan?: unknown;
  } | null;

  const telegramUserId =
    typeof body?.telegramUserId === "string" || typeof body?.telegramUserId === "number"
      ? String(body.telegramUserId).trim()
      : "";
  const until = parseUntil(body?.until);
  const name = typeof body?.name === "string" ? body.name.slice(0, 120) : null;
  const username = typeof body?.username === "string" ? body.username.slice(0, 64) : null;
  const plan = body?.plan === "monthly" ? "monthly" : "quarterly";

  if (!telegramUserId || !until) {
    return jsonResponse(400, { ok: false, reason: "missing_or_bad_fields" });
  }
  if (until.getTime() < Date.now()) {
    return jsonResponse(400, { ok: false, reason: "date_in_past" });
  }

  try {
    // Find-or-create the account keyed by Telegram id.
    let user = await prisma.user.findUnique({ where: { telegramUserId } });
    if (!user) {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 12);
      user = await prisma.user.create({
        data: {
          email: `tg-${telegramUserId}@tg.kiraengineerhub.com`,
          name,
          passwordHash,
          telegramUserId,
          telegramUsername: username,
          telegramLinkedAt: new Date(),
          termsAcceptedAt: new Date(),
        },
      });
    } else if (name && !user.name) {
      await prisma.user.update({ where: { id: user.id }, data: { name } });
    }

    // Never disturb a live card subscription.
    const existing = await prisma.membership.findUnique({ where: { userId: user.id } });
    const hasLiveCardSub =
      existing?.stripeSubscriptionId &&
      !existing.stripeSubscriptionId.startsWith("migrated:") &&
      existing.status === "active";
    if (hasLiveCardSub) {
      return jsonResponse(409, { ok: false, reason: "has_live_card_subscription" });
    }

    const note = `Pre-v2 running subscription reflected by admin on ${new Date().toISOString().slice(0, 10)}`;

    await prisma.membership.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        stripeSubscriptionId: `migrated:${user.id}`,
        plan,
        status: "active",
        currentPeriodEnd: until,
        cancelAtPeriodEnd: false,
        tier: null,
      },
      update: { status: "active", currentPeriodEnd: until, plan },
    });

    await grantEntitlement(prisma, {
      userId: user.id,
      product: "vip_membership",
      status: "active",
      source: "admin_grant",
      currentPeriodEnd: until,
      note,
    });

    return jsonResponse(200, {
      ok: true,
      name: user.name ?? name,
      until: until.toISOString().slice(0, 10),
    });
  } catch (error) {
    console.error("telegram/admin-grant failed", error);
    return jsonResponse(500, { ok: false, reason: "server_error" });
  }
}
