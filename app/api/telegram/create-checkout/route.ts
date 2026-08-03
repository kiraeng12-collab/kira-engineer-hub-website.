import crypto from "node:crypto";
import { jsonResponse } from "@/lib/api-utils";
import { getStripeClient } from "@/lib/stripe/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { pricingConfig, getStripePriceEnvForTier, type PlanId, type MembershipTier } from "@/lib/config/pricing";
import { getCheckoutReadiness } from "@/lib/config/checkout-readiness";

export const runtime = "nodejs";

/**
 * Bot-facing checkout. Lets a member pay on Stripe's hosted page straight from
 * Telegram — no website account, no login. We tag the session with their
 * Telegram id (client_reference_id) and their tier; the webhook provisions the
 * account and delivers access. Terms acceptance is collected on Stripe's page
 * (requires a Terms-of-Service URL configured in Stripe Checkout settings).
 */

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function asTier(value: string | null | undefined): MembershipTier | null {
  return value === "founding" || value === "early_bird" ? value : null;
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.PAYMENT_AUTOMATION_ENABLED !== "true") {
    return jsonResponse(503, { ok: false, reason: "automation_disabled" });
  }
  if (!getCheckoutReadiness().open) {
    return jsonResponse(503, { ok: false, reason: "checkout_not_open" });
  }

  const sharedSecret = process.env.TELEGRAM_BOT_VERIFY_SECRET;
  const stripe = getStripeClient();
  const prisma = getPrismaClient();
  if (!sharedSecret || !stripe || !prisma) {
    return jsonResponse(503, { ok: false, reason: "not_configured" });
  }
  if (!secretsMatch(request.headers.get("x-kira-bot-secret"), sharedSecret)) {
    return jsonResponse(401, { ok: false, reason: "unauthorized" });
  }

  const body = (await request.json().catch(() => null)) as
    | { telegramUserId?: unknown; plan?: unknown }
    | null;

  const telegramUserId =
    typeof body?.telegramUserId === "string" || typeof body?.telegramUserId === "number"
      ? String(body.telegramUserId).trim()
      : "";
  const plan = (typeof body?.plan === "string" ? body.plan.trim() : "") as PlanId;

  if (!telegramUserId || !pricingConfig.plans[plan]) {
    return jsonResponse(400, { ok: false, reason: "missing_fields" });
  }

  try {
    // Server-side truth: derive the loyalty tier from the registry by Telegram
    // id, never trust a client-supplied tier. This fixes the price they pay.
    const legacy = await prisma.legacyMember.findUnique({ where: { telegramUserId } });
    const effectiveTier = asTier(legacy?.tier);

    const priceId = requireEnv(getStripePriceEnvForTier(plan, effectiveTier));
    const selected = pricingConfig.plans[plan];

    const successBase = process.env.STRIPE_SUCCESS_URL || "https://www.kiraengineerhub.com/checkout/success";
    const cancelUrl = process.env.STRIPE_CANCEL_URL || "https://www.kiraengineerhub.com/checkout/cancelled";

    const metadata = {
      brand: "Kira Engineer Hub",
      product: selected.name,
      plan,
      tier: effectiveTier || "",
      telegram_user_id: telegramUserId,
      source: "telegram",
    };
    const baseParams = {
      mode: "subscription" as const,
      // Stripe creates the customer and collects the email on its page.
      client_reference_id: telegramUserId,
      success_url: `${successBase}?src=telegram&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl}?src=telegram`,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      subscription_data: { metadata },
    };

    let checkoutSession;
    try {
      // Records Terms acceptance on Stripe's page. Requires a Terms-of-Service
      // URL in Stripe > Settings > Checkout and Payment Links.
      checkoutSession = await stripe.checkout.sessions.create({
        ...baseParams,
        consent_collection: { terms_of_service: "required" },
      });
    } catch (consentErr) {
      // If the ToS URL isn't configured yet, don't block payment — fall back to
      // checkout without the checkbox. The checkbox switches on automatically
      // once the URL is set in Stripe.
      console.error(
        "telegram/create-checkout: consent_collection rejected, retrying without it",
        consentErr instanceof Error ? consentErr.message : consentErr
      );
      checkoutSession = await stripe.checkout.sessions.create(baseParams);
    }

    return jsonResponse(200, { ok: true, url: checkoutSession.url, tier: effectiveTier || null });
  } catch (error) {
    console.error("telegram/create-checkout failed", error);
    return jsonResponse(500, { ok: false, reason: "stripe_error" });
  }
}
