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

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${siteConfig.websiteUrl}/account/billing`,
    });

    return jsonResponse(200, { url: portalSession.url });
  } catch {
    return jsonResponse(500, { message: "Could not open billing management. Please try again." });
  }
}
