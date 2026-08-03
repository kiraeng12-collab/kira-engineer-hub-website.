import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { pricingConfig, type PlanId, type MembershipTier } from "@/lib/config/pricing";
import { getCheckoutReadiness } from "@/lib/config/checkout-readiness";
import {
  isCryptoCheckoutEnabled,
  getCryptoAmount,
  CRYPTO_ACCESS_DAYS,
  CRYPTO_PAY_CURRENCY,
  CRYPTO_PRICE_CURRENCY,
} from "@/lib/config/crypto";
import { getNowPaymentsConfig, createInvoice } from "@/lib/crypto/nowpayments";
import { bestTier } from "@/lib/config/legacy-tiers";

export const runtime = "nodejs";

/**
 * Bot-facing crypto checkout (NOWPayments). Lets a member pay by USDT straight
 * from Telegram. NOWPayments collects no email and has no Terms checkbox, so:
 *   - consent is captured one-tap in the bot (the member taps a plan button on
 *     a message that states acceptance of the Terms) and stamped as
 *     termsAcceptedAt here, and
 *   - the account is keyed by Telegram id with a synthetic email (a real one is
 *     added later when they claim the account on the website).
 * The existing crypto webhook grants access; the webhook then DMs the invite.
 */

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function asTier(value: string | null | undefined): MembershipTier | null {
  return value === "founding" || value === "early_bird" ? value : null;
}

function siteBase(): string {
  return (
    process.env.SITE_URL ||
    (process.env.STRIPE_SUCCESS_URL || "").replace(/\/checkout\/success.*$/, "") ||
    "https://www.kiraengineerhub.com"
  );
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.PAYMENT_AUTOMATION_ENABLED !== "true") {
    return jsonResponse(503, { ok: false, reason: "automation_disabled" });
  }
  const readiness = getCheckoutReadiness();
  if (!isCryptoCheckoutEnabled() || readiness.missingLegalFields.length > 0 || !readiness.launched) {
    return jsonResponse(503, { ok: false, reason: "crypto_not_ready" });
  }

  const sharedSecret = process.env.TELEGRAM_BOT_VERIFY_SECRET;
  const prisma = getPrismaClient();
  const npConfig = getNowPaymentsConfig();
  if (!sharedSecret || !prisma || !npConfig) {
    return jsonResponse(503, { ok: false, reason: "not_configured" });
  }
  if (!secretsMatch(request.headers.get("x-kira-bot-secret"), sharedSecret)) {
    return jsonResponse(401, { ok: false, reason: "unauthorized" });
  }

  const body = (await request.json().catch(() => null)) as
    | { telegramUserId?: unknown; plan?: unknown; telegramUsername?: unknown }
    | null;

  const telegramUserId =
    typeof body?.telegramUserId === "string" || typeof body?.telegramUserId === "number"
      ? String(body.telegramUserId).trim()
      : "";
  const plan = (typeof body?.plan === "string" ? body.plan.trim() : "") as PlanId;
  const telegramUsername =
    typeof body?.telegramUsername === "string" ? body.telegramUsername.slice(0, 64) : null;

  if (!telegramUserId || !pricingConfig.plans[plan]) {
    return jsonResponse(400, { ok: false, reason: "missing_fields" });
  }

  try {
    // Server-side truth: loyalty tier from the registry by Telegram id.
    const legacy = await prisma.legacyMember.findUnique({ where: { telegramUserId } });
    const tier = asTier(legacy?.tier);

    // Find-or-create the (passwordless) account keyed by this Telegram id.
    let user = await prisma.user.findUnique({ where: { telegramUserId } });
    if (!user) {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 12);
      user = await prisma.user.create({
        data: {
          email: `tg-${telegramUserId}@tg.kiraengineerhub.com`,
          passwordHash,
          telegramUserId,
          telegramUsername,
          telegramLinkedAt: new Date(),
          telegramRemovedAt: null,
          membershipTier: tier ?? undefined,
          termsAcceptedAt: new Date(),
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          termsAcceptedAt: user.termsAcceptedAt ?? new Date(),
          telegramUsername: user.telegramUsername ?? telegramUsername,
          telegramRemovedAt: null,
          membershipTier: tier ? bestTier(asTier(user.membershipTier), tier) : (user.membershipTier ?? undefined),
        },
      });
    }

    const testOverride = Number(process.env.CRYPTO_TEST_AMOUNT);
    const amount = testOverride > 0 ? testOverride : getCryptoAmount(plan, tier);
    const accessDays = CRYPTO_ACCESS_DAYS[plan];
    const orderId = `cpay_${crypto.randomBytes(12).toString("hex")}`;

    await prisma.cryptoPayment.create({
      data: {
        userId: user.id,
        orderId,
        product: "vip_membership",
        plan,
        tier: tier ?? null,
        amount,
        currency: CRYPTO_PRICE_CURRENCY,
        payCurrency: CRYPTO_PAY_CURRENCY,
        status: "pending",
        consentRecordId: null, // consent captured in-bot; termsAcceptedAt stamped on the user
        accessDays,
      },
    });

    const base = siteBase();
    const invoice = await createInvoice(npConfig, {
      priceAmount: amount,
      priceCurrency: CRYPTO_PRICE_CURRENCY,
      payCurrency: CRYPTO_PAY_CURRENCY,
      orderId,
      orderDescription: `KIRA VIP Membership (${plan}) - ${accessDays} days`,
      ipnCallbackUrl: `${base}/api/crypto/webhook`,
      successUrl: `${base}/checkout/success?src=telegram&crypto=1`,
      cancelUrl: `${base}/checkout/cancelled?src=telegram`,
    });

    await prisma.cryptoPayment.update({
      where: { orderId },
      data: { providerInvoiceId: invoice.invoiceId },
    });

    return jsonResponse(200, { ok: true, url: invoice.invoiceUrl, amount, tier: tier || null });
  } catch (error) {
    console.error("telegram/create-crypto-invoice failed", error);
    return jsonResponse(500, { ok: false, reason: "crypto_error" });
  }
}
