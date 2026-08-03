import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type Stripe from "stripe";
import type { PrismaClient } from "@/lib/generated/prisma";
import { customerIdOf, upsertMembershipFromSubscription } from "@/lib/stripe/membership-sync";
import { bestTier } from "@/lib/config/legacy-tiers";
import type { MembershipTier } from "@/lib/config/pricing";
import {
  getTelegramConfig,
  createSingleUseInviteLink,
  sendTelegramMessage,
} from "@/lib/telegram/client";

/**
 * Telegram-first purchases.
 *
 * A member can pay on Stripe's (or NOWPayments') hosted page straight from the
 * bot — no website account, no login. When the payment webhook fires we:
 *   1. find-or-create their website account from the email they paid with
 *      (a real account, but passwordless — they claim it later via password
 *      reset; nothing about it is exposed to them now),
 *   2. link their Telegram id + Stripe customer so all the existing renewal /
 *      cancel / expiry machinery just works,
 *   3. grant the membership via the normal path, and
 *   4. DM them their single-use VIP invite links directly (the site holds the
 *      bot token, so it can message them without the bot polling).
 *
 * "Migrate to the website later" therefore needs no batch job: the account
 * already exists and is fully wired; the member simply sets a password whenever
 * they want to use the site.
 */

const INVITE_TTL_SECONDS = 30 * 60;

function asTier(value: string | null | undefined): MembershipTier | null {
  return value === "founding" || value === "early_bird" ? value : null;
}

/** Deliver the VIP invite links to a member's Telegram DM. Best-effort. */
export async function deliverVipInviteDM(telegramUserId: string, name: string | null): Promise<void> {
  const config = getTelegramConfig();
  if (!config) return;

  let groupLink: string | null = null;
  let channelLink: string | null = null;
  try {
    groupLink = await createSingleUseInviteLink(config.botToken, config.groupChatId, INVITE_TTL_SECONDS);
  } catch (e) {
    console.error("provision: group invite failed", e instanceof Error ? e.message : e);
  }
  if (config.channelChatId) {
    try {
      channelLink = await createSingleUseInviteLink(config.botToken, config.channelChatId, INVITE_TTL_SECONDS);
    } catch (e) {
      console.error("provision: channel invite failed", e instanceof Error ? e.message : e);
    }
  }

  const hi = name ? `Welcome, ${name}!` : "Welcome!";
  const lines = [`✅ Payment confirmed — you're a KIRA VIP! ${hi}`, "", "Tap to join (each link is single-use and expires in 30 minutes):"];
  if (groupLink) lines.push(`👥 VIP Group: ${groupLink}`);
  if (channelLink) lines.push(`📢 VIP Channel: ${channelLink}`);
  if (!groupLink && !channelLink) {
    lines.push("We hit a snag creating your invite links — message @maya_hay and we'll add you right away.");
  }
  lines.push("", "Your membership renews automatically. Type /manage anytime to update or cancel.");

  try {
    await sendTelegramMessage(config.botToken, telegramUserId, lines.join("\n"));
  } catch (e) {
    console.error("provision: invite DM failed", e instanceof Error ? e.message : e);
  }
}

/**
 * Provision a Telegram-first Stripe purchase from a checkout.session.completed
 * event. Returns true if this was a Telegram-originated session we handled,
 * false if it's an ordinary website checkout (so the caller keeps its own path).
 */
export async function provisionTelegramStripePurchase(
  prisma: PrismaClient,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  eventCreated: number
): Promise<boolean> {
  const telegramUserId = String(
    session.client_reference_id || session.metadata?.telegram_user_id || ""
  ).trim();
  // No Telegram id -> ordinary website checkout; let the normal handler run.
  if (!telegramUserId) return false;

  const email = (session.customer_details?.email || "").trim().toLowerCase();
  const customerId = customerIdOf(session.customer);
  if (!email || !customerId) {
    console.error("provision: telegram session missing email/customer", { telegramUserId });
    return true; // it WAS a telegram session; just unprovisionable — don't double-handle
  }

  const tier = asTier(session.metadata?.tier);
  const name = session.customer_details?.name || null;
  const termsAccepted =
    session.consent?.terms_of_service === "accepted" ? new Date() : undefined;

  // A Telegram account may only back one website account.
  const tgOwner = await prisma.user.findUnique({ where: { telegramUserId } });

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Passwordless shell account: a real, unusable hash they can only unlock via
    // password reset (which requires their email) — never a login they can guess.
    const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 12);
    user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        membershipTier: tier ?? undefined,
        termsAcceptedAt: termsAccepted,
      },
    });
  }

  const canLinkTelegram = !tgOwner || tgOwner.id === user.id;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCustomerId: customerId,
      membershipTier: tier ? bestTier(asTier(user.membershipTier), tier) : (user.membershipTier ?? undefined),
      ...(termsAccepted && !user.termsAcceptedAt ? { termsAcceptedAt: termsAccepted } : {}),
      ...(canLinkTelegram
        ? { telegramUserId, telegramUsername: user.telegramUsername ?? null, telegramLinkedAt: new Date(), telegramRemovedAt: null }
        : {}),
    },
  });

  // Grant the membership + entitlement through the normal subscription path.
  if (session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await upsertMembershipFromSubscription(prisma, subscription, eventCreated);
  }

  // Deliver access straight to their Telegram DM.
  await deliverVipInviteDM(telegramUserId, user.name ?? name);
  return true;
}
