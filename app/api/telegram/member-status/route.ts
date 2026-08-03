import crypto from "node:crypto";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { getStripeClient } from "@/lib/stripe/client";
import { isEntitlementActive } from "@/lib/entitlements/service";
import { getTelegramConfig, isVipGroupMember } from "@/lib/telegram/client";
import { siteConfig } from "@/lib/config/site";

export const runtime = "nodejs";

/**
 * Bot-facing member self-service. Given a Telegram id (bot-authed), returns the
 * member's VIP status (plan, tier, renewal), whether they're live in the VIP
 * group, and a personalised Stripe billing-portal link (upgrade / change card /
 * cancel) when they have a Stripe customer. The bot renders the panel.
 */

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const TIER_LABEL: Record<string, string> = {
  founding: "Founding Member",
  early_bird: "Early Bird",
  standard: "Standard",
};
const PLAN_LABEL: Record<string, string> = { monthly: "Monthly", quarterly: "Quarterly" };

export async function POST(request: Request): Promise<Response> {
  const sharedSecret = process.env.TELEGRAM_BOT_VERIFY_SECRET;
  const prisma = getPrismaClient();
  if (!sharedSecret || !prisma) return jsonResponse(503, { ok: false, reason: "not_configured" });
  if (!secretsMatch(request.headers.get("x-kira-bot-secret"), sharedSecret)) {
    return jsonResponse(401, { ok: false, reason: "unauthorized" });
  }

  const body = (await request.json().catch(() => null)) as { telegramUserId?: unknown } | null;
  const telegramUserId =
    typeof body?.telegramUserId === "string" || typeof body?.telegramUserId === "number"
      ? String(body.telegramUserId).trim()
      : "";
  if (!telegramUserId) return jsonResponse(400, { ok: false, reason: "missing_fields" });

  const config = getTelegramConfig();
  const inVipGroup = config
    ? await isVipGroupMember(config, telegramUserId).catch(() => false)
    : false;

  const user = await prisma.user.findUnique({
    where: { telegramUserId },
    select: { id: true, name: true, stripeCustomerId: true, membershipTier: true },
  });

  // No linked website account: they may still be a live group member (legacy /
  // manually added). Report what we can.
  if (!user) {
    return jsonResponse(200, { ok: true, found: false, active: inVipGroup, inVipGroup });
  }

  const [membership, entitlement] = await Promise.all([
    prisma.membership.findUnique({ where: { userId: user.id } }),
    prisma.entitlement.findUnique({
      where: { userId_product: { userId: user.id, product: "vip_membership" } },
    }),
  ]);

  const active = entitlement ? isEntitlementActive(entitlement) : membership?.status === "active";
  const plan = membership?.plan ?? null;
  const tier = membership?.tier ?? user.membershipTier ?? null;
  const renewalDate = (membership?.currentPeriodEnd ?? entitlement?.currentPeriodEnd) ?? null;
  const cancelAtPeriodEnd = membership?.cancelAtPeriodEnd ?? false;
  const source = entitlement?.source ?? null;
  const autoRenew = source === "stripe" && !cancelAtPeriodEnd;

  // Personalised Stripe billing portal — only for a resolvable Stripe customer.
  let billingUrl: string | null = null;
  const stripe = getStripeClient();
  if (stripe && user.stripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(user.stripeCustomerId);
      if (!("deleted" in existing) || !existing.deleted) {
        const portal = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: `${siteConfig.websiteUrl}/account/billing`,
        });
        billingUrl = portal.url;
      }
    } catch (e) {
      console.error("member-status: portal session failed", e instanceof Error ? e.message : e);
    }
  }

  return jsonResponse(200, {
    ok: true,
    found: true,
    name: user.name,
    active,
    inVipGroup,
    plan,
    planLabel: plan ? PLAN_LABEL[plan] ?? plan : null,
    tier,
    tierLabel: tier ? TIER_LABEL[tier] ?? tier : null,
    renewalDate: renewalDate ? renewalDate.toISOString().slice(0, 10) : null,
    autoRenew,
    cancelAtPeriodEnd,
    source,
    billingUrl,
    hasStripe: Boolean(user.stripeCustomerId),
  });
}
