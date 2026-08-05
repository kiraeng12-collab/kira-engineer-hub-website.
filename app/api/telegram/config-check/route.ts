import crypto from "node:crypto";
import { jsonResponse } from "@/lib/api-utils";
import { getTelegramConfig, membershipChatIds } from "@/lib/telegram/client";
import { getStripeClient } from "@/lib/stripe/client";
import { pricingConfig } from "@/lib/config/pricing";

export const runtime = "nodejs";

/** Audits the six Stripe price envs (present + valid + amount) — the usual cause
 * of a "checkout error" is one of these missing or holding a wrong/test id. */
async function auditPrices() {
  const stripe = getStripeClient();
  const rows: Array<[string, string]> = [
    ["monthly / standard", pricingConfig.plans.monthly.stripePriceIdEnv],
    ["monthly / founding", pricingConfig.plans.monthly.stripePriceIdEnvFounding],
    ["monthly / early_bird", pricingConfig.plans.monthly.stripePriceIdEnvEarlyBird],
    ["quarterly / standard", pricingConfig.plans.quarterly.stripePriceIdEnv],
    ["quarterly / founding", pricingConfig.plans.quarterly.stripePriceIdEnvFounding],
    ["quarterly / early_bird", pricingConfig.plans.quarterly.stripePriceIdEnvEarlyBird],
  ];
  const out = [];
  for (const [label, env] of rows) {
    const value = process.env[env]?.trim();
    const present = Boolean(value);
    let valid: boolean | null = null;
    let amount: number | null = null;
    let live: boolean | null = null;
    if (present && stripe) {
      try {
        const p = await stripe.prices.retrieve(value as string);
        valid = p.active !== false;
        amount = typeof p.unit_amount === "number" ? p.unit_amount / 100 : null;
        live = p.livemode ?? null;
      } catch {
        valid = false; // set but Stripe can't retrieve it (wrong id / different account / test id on live key)
      }
    }
    out.push({ label, env, present, valid, amount, live });
  }
  return out;
}

/**
 * Read-only report of what the DEPLOYED environment actually holds.
 *
 * The launch checker otherwise validates the local .env, which says nothing
 * about production — a variable can be missing, scoped to the wrong
 * environment, or added after the last build, and the only symptom is a
 * feature quietly doing nothing. Protected by the bot shared secret; returns
 * chat ids and switch states, never tokens or keys.
 */

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  const sharedSecret = process.env.TELEGRAM_BOT_VERIFY_SECRET;
  if (!sharedSecret) return jsonResponse(503, { ok: false, reason: "not_configured" });
  if (!secretsMatch(request.headers.get("x-kira-bot-secret"), sharedSecret)) {
    return jsonResponse(401, { ok: false, reason: "unauthorized" });
  }

  const config = getTelegramConfig();
  return jsonResponse(200, {
    ok: true,
    telegramConfigured: Boolean(config),
    botUsername: config?.botUsername ?? null,
    groupChatId: config?.groupChatId ?? null,
    channelChatId: config?.channelChatId ?? null,
    membershipChatCount: config ? membershipChatIds(config).length : 0,
    checkoutEnabled: process.env.CHECKOUT_ENABLED === "true",
    paymentAutomationEnabled: process.env.PAYMENT_AUTOMATION_ENABLED === "true",
    prices: await auditPrices(),
  });
}
