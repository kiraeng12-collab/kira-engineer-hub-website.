import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse, safeText, parseRequestBody } from "@/lib/api-utils";
import { getStripeClient } from "@/lib/stripe/client";
import { pricingConfig, type PlanId } from "@/lib/config/pricing";
import { getCheckoutReadiness } from "@/lib/config/checkout-readiness";
import { getPrismaClient } from "@/lib/db/prisma";

export const runtime = "nodejs";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function POST(request: Request): Promise<Response> {
  if (!getCheckoutReadiness().ready) {
    return jsonResponse(503, {
      message: "Online checkout is being prepared. Please request membership access through Telegram or email.",
    });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return jsonResponse(401, { message: "Please sign in before starting checkout." });
  }

  const stripe = getStripeClient();
  const prisma = getPrismaClient();
  if (!stripe || !prisma) {
    return jsonResponse(503, { message: "Checkout is not fully configured yet." });
  }

  try {
    const { fields } = await parseRequestBody(request);
    const plan = safeText(fields.plan, 20) as PlanId;
    if (!pricingConfig.plans[plan]) {
      return jsonResponse(400, { message: "Please choose a valid membership plan." });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return jsonResponse(401, { message: "Please sign in before starting checkout." });

    // Signing happens before payment. Without a consent record belonging to
    // this member there is nothing to charge against, so refuse rather than
    // create a subscription we cannot evidence consent for.
    const consentRecordId = safeText(fields.consentRecordId, 40);
    const consentRecord = consentRecordId
      ? await prisma.consentRecord.findUnique({ where: { id: consentRecordId } })
      : null;
    if (
      !consentRecord ||
      consentRecord.userId !== user.id ||
      consentRecord.product !== "vip_membership"
    ) {
      return jsonResponse(400, {
        message: "Please review and confirm the membership documents before continuing.",
      });
    }

    // Server-side truth only - never trust a client-supplied tier.
    const tier = user.membershipTier === "founding" || user.membershipTier === "early_bird" ? user.membershipTier : null;
    // Founding Members get their own permanently-discounted Price (no coupon
    // needed); Early Bird members get the standard Price with the shared
    // coupon applied; everyone else gets the standard Price as-is.
    const earlyBirdApplies = tier === "early_bird" && Boolean(process.env.STRIPE_EARLY_BIRD_COUPON_ID);

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const selected = pricingConfig.plans[plan];
    const priceEnvName = tier === "founding" ? selected.stripePriceIdEnvFounding : selected.stripePriceIdEnv;
    const priceId = requireEnv(priceEnvName);
    const successUrl =
      process.env.STRIPE_SUCCESS_URL || "https://www.kiraengineerhub.com/checkout/success";
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL || "https://www.kiraengineerhub.com/checkout/cancelled";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: earlyBirdApplies ? [{ coupon: process.env.STRIPE_EARLY_BIRD_COUPON_ID }] : undefined,
      metadata: {
        brand: "Kira Engineer Hub",
        product: selected.name,
        plan,
        userId: user.id,
        tier: tier || "",
        // Only the id travels to Stripe; the audit detail stays in our database.
        consentRecordId: consentRecord.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan,
          tier: tier || "",
          consentRecordId: consentRecord.id,
        },
      },
    });

    return jsonResponse(200, { url: checkoutSession.url });
  } catch {
    return jsonResponse(500, {
      message: "Checkout could not be started safely. Please contact KE@kiraengineerhub.com.",
    });
  }
}
