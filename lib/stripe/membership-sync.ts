import type Stripe from "stripe";
import { mapSubscriptionStatus } from "@/lib/stripe/status";
import { syncTelegramAccessForUser } from "@/lib/telegram/membership-sync";
import type { PrismaClient } from "@/lib/generated/prisma";

// Extracted from app/api/stripe/webhook/route.ts so this business logic -
// the out-of-order-event guard in particular - can be unit tested with a
// mocked Prisma client, independent of Stripe's webhook signature handling.

export function customerIdOf(
  value: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export async function upsertMembershipFromSubscription(
  prisma: PrismaClient,
  subscription: Stripe.Subscription,
  eventCreated: number
): Promise<void> {
  const customerId = customerIdOf(subscription.customer);
  if (!customerId) return;

  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  if (!user) return; // Unknown customer - nothing in our DB to link this to.

  const eventCreatedAt = new Date(eventCreated * 1000);
  const existing = await prisma.membership.findUnique({ where: { userId: user.id } });

  // Out-of-order guard: never let an older event overwrite a newer state.
  if (existing?.lastEventCreatedAt && existing.lastEventCreatedAt > eventCreatedAt) return;

  const plan = subscription.metadata?.plan || existing?.plan || "monthly";
  const earlyBirdApplied =
    subscription.metadata?.earlyBirdApplied === "true" || existing?.earlyBirdApplied || false;
  const status = mapSubscriptionStatus(subscription.status);
  const periodEndSeconds = subscription.items.data[0]?.current_period_end;
  const currentPeriodEnd = periodEndSeconds ? new Date(periodEndSeconds * 1000) : null;

  await prisma.membership.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      plan,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      earlyBirdApplied,
      lastEventCreatedAt: eventCreatedAt,
    },
    update: {
      stripeSubscriptionId: subscription.id,
      plan,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      earlyBirdApplied,
      lastEventCreatedAt: eventCreatedAt,
    },
  });

  // Telegram removal failures shouldn't fail the whole webhook and trigger a
  // Stripe retry - log it and move on; it can be resolved manually.
  await syncTelegramAccessForUser(prisma, user.id, status).catch(() => {});
}

export async function setMembershipStatusByCustomer(
  prisma: PrismaClient,
  customerId: string | null,
  status: string,
  eventCreated: number
): Promise<void> {
  if (!customerId) return;
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  if (!user) return;

  const eventCreatedAt = new Date(eventCreated * 1000);
  const existing = await prisma.membership.findUnique({ where: { userId: user.id } });
  if (!existing) return; // No subscription on record yet - nothing to mark.
  if (existing.lastEventCreatedAt && existing.lastEventCreatedAt > eventCreatedAt) return;

  await prisma.membership.update({
    where: { userId: user.id },
    data: { status, lastEventCreatedAt: eventCreatedAt },
  });

  await syncTelegramAccessForUser(prisma, user.id, status).catch(() => {});
}
