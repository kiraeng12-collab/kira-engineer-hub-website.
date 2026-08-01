import crypto from "node:crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse, safeText, parseRequestBody } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { pricingConfig, type PlanId } from "@/lib/config/pricing";
import { getCheckoutReadiness } from "@/lib/config/checkout-readiness";
import {
  isCryptoCheckoutEnabled,
  getCryptoAmount,
  CRYPTO_ACCESS_DAYS,
  CRYPTO_PAY_CURRENCY,
  CRYPTO_PRICE_CURRENCY,
} from "@/lib/config/crypto";
import { getNowPaymentsConfig, createInvoice } from "@/lib/crypto/nowpayments";

export const runtime = "nodejs";

function siteBase(): string {
  return (
    process.env.SITE_URL ||
    (process.env.STRIPE_SUCCESS_URL || "").replace(/\/checkout\/success.*$/, "") ||
    "https://www.kiraengineerhub.com"
  );
}

export async function POST(request: Request): Promise<Response> {
  // Crypto has its own switch, but still requires the legal fields to be
  // complete (shared readiness) and the public launch gate to have opened
  // before any purchase can be started.
  const readiness = getCheckoutReadiness();
  if (!isCryptoCheckoutEnabled() || readiness.missingLegalFields.length > 0 || !readiness.launched) {
    return jsonResponse(503, { message: "Crypto payment is being prepared. Please try again later." });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return jsonResponse(401, { message: "Please sign in before starting payment." });
  }

  const prisma = getPrismaClient();
  const npConfig = getNowPaymentsConfig();
  if (!prisma || !npConfig) {
    return jsonResponse(503, { message: "Crypto payment is not fully configured yet." });
  }

  try {
    const { fields } = await parseRequestBody(request);
    const plan = safeText(fields.plan, 20) as PlanId;
    if (!pricingConfig.plans[plan]) {
      return jsonResponse(400, { message: "Please choose a valid membership plan." });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return jsonResponse(401, { message: "Please sign in before starting payment." });

    // Signing happens before payment - a crypto purchase needs a consent record
    // belonging to this member for vip_membership, exactly like card checkout.
    const consentRecordId = safeText(fields.consentRecordId, 40);
    const consentRecord = consentRecordId
      ? await prisma.consentRecord.findUnique({ where: { id: consentRecordId } })
      : null;
    if (!consentRecord || consentRecord.userId !== user.id || consentRecord.product !== "vip_membership") {
      return jsonResponse(400, {
        message: "Please review and confirm the membership documents before continuing.",
      });
    }

    // Server-side truth only - never trust a client-supplied tier.
    const tier = user.membershipTier === "founding" || user.membershipTier === "early_bird" ? user.membershipTier : null;
    // Temporary launch-test override: when CRYPTO_TEST_AMOUNT is a positive
    // number, charge that (e.g. a few USDT) instead of the real price so a live
    // end-to-end test costs almost nothing. REMOVE this env var after testing.
    const testOverride = Number(process.env.CRYPTO_TEST_AMOUNT);
    const amount = testOverride > 0 ? testOverride : getCryptoAmount(plan, tier);
    const accessDays = CRYPTO_ACCESS_DAYS[plan];
    const orderId = `cpay_${crypto.randomBytes(12).toString("hex")}`;

    // Record the pending payment first, so the webhook always has a row to
    // match against even if the response below is lost.
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
        consentRecordId: consentRecord.id,
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
      successUrl: `${base}/checkout/success?crypto=1`,
      cancelUrl: `${base}/checkout/cancelled`,
    });

    await prisma.cryptoPayment.update({
      where: { orderId },
      data: { providerInvoiceId: invoice.invoiceId },
    });

    return jsonResponse(200, { url: invoice.invoiceUrl });
  } catch (error) {
    console.error("create-crypto-invoice failed", error);
    return jsonResponse(500, {
      message: "Crypto payment could not be started safely. Please contact support@ke-hub.com.",
    });
  }
}
