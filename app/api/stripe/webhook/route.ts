import type Stripe from "stripe";
import { jsonResponse, forwardOperationalEvent } from "@/lib/api-utils";
import { getStripeClient } from "@/lib/stripe/client";
import { getPrismaClient } from "@/lib/db/prisma";
import {
  customerIdOf,
  upsertMembershipFromSubscription,
  setMembershipStatusByCustomer,
} from "@/lib/stripe/membership-sync";
import { markConsentEffective } from "@/lib/agreements/service";
import type { PrismaClient } from "@/lib/generated/prisma";

export const runtime = "nodejs";

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed",
]);

async function handleEvent(prisma: PrismaClient, stripe: Stripe, event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertMembershipFromSubscription(prisma, subscription, event.created);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = customerIdOf(subscription.customer);
      await setMembershipStatusByCustomer(prisma, customerId, "cancelled", event.created);
      break;
    }
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      if (checkoutSession.mode === "subscription" && checkoutSession.subscription) {
        const subscriptionId =
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : checkoutSession.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertMembershipFromSubscription(prisma, subscription, event.created);
      }
      // The agreement becomes effective at payment, not at signing. Stamping it
      // here gives an exact, evidenced moment the contract took effect.
      await markConsentEffective(
        prisma,
        checkoutSession.metadata?.consentRecordId,
        checkoutSession.id,
        event.created
      ).catch(() => {});
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = subscriptionRef
        ? typeof subscriptionRef === "string"
          ? subscriptionRef
          : subscriptionRef.id
        : null;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertMembershipFromSubscription(prisma, subscription, event.created);
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = customerIdOf(invoice.customer);
      await setMembershipStatusByCustomer(prisma, customerId, "past_due", event.created);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const customerId = customerIdOf(charge.customer);
      await setMembershipStatusByCustomer(prisma, customerId, "refunded", event.created);
      break;
    }
    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      const charge = await stripe.charges.retrieve(
        typeof dispute.charge === "string" ? dispute.charge : dispute.charge.id
      );
      await setMembershipStatusByCustomer(prisma, customerIdOf(charge.customer), "disputed", event.created);
      break;
    }
    case "charge.dispute.closed": {
      const dispute = event.data.object as Stripe.Dispute;
      const charge = await stripe.charges.retrieve(
        typeof dispute.charge === "string" ? dispute.charge : dispute.charge.id
      );
      // Only revert to active when the dispute was decided in our favor -
      // a loss leaves the membership marked "disputed" for manual review.
      if (dispute.status === "won") {
        await setMembershipStatusByCustomer(prisma, customerIdOf(charge.customer), "active", event.created);
      }
      break;
    }
    default:
      break;
  }
}

export async function POST(request: Request): Promise<Response> {
  const stripe = getStripeClient();
  const prisma = getPrismaClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !prisma || !webhookSecret) {
    return jsonResponse(503, { message: "Stripe webhook is not configured." });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  const tolerance = Number(process.env.STRIPE_WEBHOOK_TOLERANCE_SECONDS || 300);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature || "", webhookSecret, tolerance);
  } catch {
    return jsonResponse(400, { message: "Invalid Stripe signature." });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return jsonResponse(200, { received: true });
  }

  // Idempotency: a retried delivery of an event we've already recorded is a no-op.
  const alreadyProcessed = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
  if (alreadyProcessed) {
    return jsonResponse(200, { received: true, duplicate: true });
  }

  try {
    await handleEvent(prisma, stripe, event);
    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch (error) {
    await forwardOperationalEvent({
      event: "stripe.webhook.error",
      stripeEventId: event.id,
      stripeEventType: event.type,
      error: error instanceof Error ? error.message : "Unknown error",
    }).catch(() => {});
    return jsonResponse(500, { message: "Webhook processing failed." });
  }

  return jsonResponse(200, { received: true });
}
