import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse } from "@/lib/api-utils";
import { getStripeClient } from "@/lib/stripe/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { siteConfig } from "@/lib/config/site";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return jsonResponse(401, { message: "Please sign in first." });

  const stripe = getStripeClient();
  const prisma = getPrismaClient();
  if (!stripe || !prisma) {
    return jsonResponse(503, { message: "Billing management is not configured yet." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.stripeCustomerId) {
      return jsonResponse(400, { message: "No billing account found yet. Start a membership first." });
    }

    // A stored customer id belongs to one Stripe account. If the account
    // changed (or the id is a leftover from earlier testing) it is invisible to
    // the current key and the portal call throws. Treat an unresolvable
    // customer as stale: clear it so it stops erroring, and ask them to
    // subscribe rather than showing a generic failure.
    try {
      const existing = await stripe.customers.retrieve(user.stripeCustomerId);
      if (existing.deleted) {
        await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: null } });
        return jsonResponse(400, {
          message: "No active billing account found. Please start or renew your membership first.",
        });
      }
    } catch {
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: null } });
      return jsonResponse(400, {
        message: "No active billing account found. Please start or renew your membership first.",
      });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${siteConfig.websiteUrl}/account/billing`,
    });

    return jsonResponse(200, { url: portalSession.url });
  } catch (error) {
    // The empty catch used to swallow this, making it undiagnosable. The most
    // common cause is the Customer Portal not being activated in the Stripe
    // Dashboard (Settings -> Billing -> Customer portal -> Save).
    console.error("create-customer-portal failed", error);
    const notConfigured = error instanceof Error && /configuration/i.test(error.message);
    return jsonResponse(500, {
      message: notConfigured
        ? "Billing management isn't switched on yet. Please try again shortly."
        : "Could not open billing management. Please try again.",
    });
  }
}
