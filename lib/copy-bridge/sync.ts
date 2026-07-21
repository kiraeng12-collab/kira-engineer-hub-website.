import type { PrismaClient } from "@/lib/generated/prisma";
import { hasEntitlement } from "@/lib/entitlements/service";

/**
 * Mirrors a member's copy-trading access to the KIRA Copy Bridge — the server
 * the member's MT5 copier connects to. When the member's `copy_trading`
 * entitlement is active we activate them on the bridge (their access key works);
 * when it lapses we deactivate them (the copier stops on the next poll).
 *
 * Access is derived from the entitlement (the access-control source of truth),
 * never from a raw Stripe event — so this stays correct for crypto/manual grants
 * too, and mirrors how lib/telegram/membership-sync.ts works.
 *
 * Env-gated: set COPY_BRIDGE_URL and COPY_BRIDGE_OWNER_KEY to enable. No-op
 * otherwise, so this is safe to ship before the bridge is hosted. Failures never
 * break the Stripe webhook (callers use `.catch`).
 */
export async function syncCopyBridgeForUser(prisma: PrismaClient, userId: string): Promise<void> {
  const bridgeUrl = process.env.COPY_BRIDGE_URL;
  const ownerKey = process.env.COPY_BRIDGE_OWNER_KEY;
  if (!bridgeUrl || !ownerKey) return; // integration disabled

  const active = await hasEntitlement(prisma, userId, "copy_trading");
  const row = await prisma.entitlement.findUnique({
    where: { userId_product: { userId, product: "copy_trading" } },
  });
  const endsAt = row?.currentPeriodEnd ? new Date(row.currentPeriodEnd).toISOString() : undefined;

  // memberId is the KIRA user id — this is the "Member ID" the member enters in
  // their copier. brokerAccountId is supplied by the member at copier setup; the
  // bridge routes trades once it is present.
  const payload: Record<string, unknown> = {
    memberId: userId,
    status: active ? "ACTIVE" : "CANCELED",
  };
  if (endsAt) payload.endsAt = endsAt;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(new URL("/v1/admin/subscription-sync", bridgeUrl).toString(), {
      method: "POST",
      headers: { "content-type": "application/json", "x-kira-owner-key": ownerKey },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
