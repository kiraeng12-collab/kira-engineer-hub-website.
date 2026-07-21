import type { PrismaClient } from "@/lib/generated/prisma";
import {
  entitlementsForProducts,
  isProductId,
  type EntitlementKey,
  type ProductId,
} from "@/lib/config/products";

/**
 * Entitlements are the access-control source of truth. Stripe writes them via
 * the webhook; manual crypto/admin grants write them too. Everything that asks
 * "may this member enter?" reads them through here.
 */

// past_due is deliberately treated as still-active: Stripe's Smart Retries give
// a grace window, and kicking someone over one declined card is poor UX. This
// mirrors lib/telegram/membership-sync.ts.
const ACCESS_GRANTING_STATUSES = new Set(["active", "past_due"]);

export type EntitlementRecord = {
  product: string;
  status: string;
  currentPeriodEnd: Date | null;
};

/** Pure predicate — is this entitlement row currently granting access? */
export function isEntitlementActive(
  entitlement: EntitlementRecord,
  now: Date = new Date()
): boolean {
  if (!ACCESS_GRANTING_STATUSES.has(entitlement.status)) return false;
  // A null period end means it never lapses (one-off purchases like Academy).
  if (entitlement.currentPeriodEnd && entitlement.currentPeriodEnd.getTime() <= now.getTime()) {
    return false;
  }
  return true;
}

/** Product IDs the member currently holds. */
export async function getActiveProducts(
  prisma: PrismaClient,
  userId: string,
  now: Date = new Date()
): Promise<ProductId[]> {
  const rows = await prisma.entitlement.findMany({ where: { userId } });
  return rows
    .filter((row) => isEntitlementActive(row, now))
    .map((row) => row.product)
    .filter(isProductId);
}

/** Access keys (vip_telegram, academy_web, copy_trading) the member currently has. */
export async function getActiveEntitlementKeys(
  prisma: PrismaClient,
  userId: string,
  now: Date = new Date()
): Promise<EntitlementKey[]> {
  return entitlementsForProducts(await getActiveProducts(prisma, userId, now));
}

export async function hasEntitlement(
  prisma: PrismaClient,
  userId: string,
  key: EntitlementKey,
  now: Date = new Date()
): Promise<boolean> {
  return (await getActiveEntitlementKeys(prisma, userId, now)).includes(key);
}

export type GrantInput = {
  userId: string;
  product: ProductId;
  status?: string;
  source?: "stripe" | "crypto_manual" | "admin_grant";
  stripeSubscriptionId?: string | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  note?: string | null;
  /** Stripe event `created` (seconds) — used to ignore out-of-order webhooks. */
  eventCreatedAt?: number | null;
};

/**
 * Creates or updates an entitlement. Out-of-order Stripe deliveries are
 * ignored: an event older than the last one applied is a no-op.
 */
export async function grantEntitlement(prisma: PrismaClient, input: GrantInput): Promise<void> {
  const eventAt = input.eventCreatedAt ? new Date(input.eventCreatedAt * 1000) : null;

  const existing = await prisma.entitlement.findUnique({
    where: { userId_product: { userId: input.userId, product: input.product } },
  });

  if (existing?.lastEventCreatedAt && eventAt && existing.lastEventCreatedAt > eventAt) {
    return; // stale event
  }

  const data = {
    status: input.status ?? "active",
    source: input.source ?? "stripe",
    stripeSubscriptionId: input.stripeSubscriptionId ?? existing?.stripeSubscriptionId ?? null,
    currentPeriodEnd: input.currentPeriodEnd ?? existing?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? existing?.cancelAtPeriodEnd ?? false,
    note: input.note ?? existing?.note ?? null,
    lastEventCreatedAt: eventAt ?? existing?.lastEventCreatedAt ?? null,
  };

  await prisma.entitlement.upsert({
    where: { userId_product: { userId: input.userId, product: input.product } },
    create: { userId: input.userId, product: input.product, ...data },
    update: data,
  });
}

/** Marks an entitlement as no longer granting access (cancelled/refunded/etc). */
export async function setEntitlementStatus(
  prisma: PrismaClient,
  userId: string,
  product: ProductId,
  status: string,
  eventCreatedAt?: number | null
): Promise<void> {
  await grantEntitlement(prisma, { userId, product, status, eventCreatedAt });
}
