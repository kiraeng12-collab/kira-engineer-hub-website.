import type { PrismaClient } from "@/lib/generated/prisma";
import {
  requiredAgreementsForProducts,
  type AgreementDefinition,
  type AgreementKey,
} from "@/lib/config/agreements";
import type { ProductId } from "@/lib/config/products";

/**
 * Consent enforcement. Access to a product is only granted once every
 * agreement it requires has been accepted *at its current version*.
 */

export type AcceptanceRow = { agreement: string; version: string };

export type ConsentGate =
  | { ok: true }
  | { ok: false; reason: "agreements_pending_counsel"; blocking: AgreementDefinition[] }
  | { ok: false; reason: "agreements_not_accepted"; missing: AgreementDefinition[] };

/**
 * Pure evaluation, so it can be unit-tested without a database.
 *
 * A required agreement that is still `pending_counsel` is a hard block: it
 * means we are not ready to sell that product, and silently skipping it would
 * be worse than refusing.
 */
export function evaluateConsent(
  required: AgreementDefinition[],
  accepted: AcceptanceRow[]
): ConsentGate {
  const pending = required.filter((a) => a.status === "pending_counsel");
  if (pending.length > 0) {
    return { ok: false, reason: "agreements_pending_counsel", blocking: pending };
  }

  const acceptedCurrent = new Set(accepted.map((row) => `${row.agreement}@${row.version}`));
  const missing = required.filter((a) => !acceptedCurrent.has(`${a.key}@${a.version}`));

  if (missing.length > 0) {
    return { ok: false, reason: "agreements_not_accepted", missing };
  }
  return { ok: true };
}

/**
 * Document acceptances this member has on record.
 *
 * Consents not tied to a document (recurring_billing, e_records) have a null
 * agreement and are deliberately excluded — they are separate evidence, not
 * part of the "has the required documents been accepted" gate.
 */
export async function getAcceptances(
  prisma: PrismaClient,
  userId: string
): Promise<AcceptanceRow[]> {
  const rows = await prisma.agreementAcceptance.findMany({
    where: { userId, agreement: { not: null } },
    select: { agreement: true, version: true },
  });
  return rows.flatMap((row) =>
    row.agreement ? [{ agreement: row.agreement, version: row.version }] : []
  );
}

/** Consent gate for the products a member holds. */
export async function checkConsentForProducts(
  prisma: PrismaClient,
  userId: string,
  products: ProductId[]
): Promise<ConsentGate> {
  const required = requiredAgreementsForProducts(products);
  if (required.length === 0) return { ok: true };
  return evaluateConsent(required, await getAcceptances(prisma, userId));
}

/**
 * Stamps the moment a signed agreement actually took effect — payment
 * settlement, not signing. Idempotent: Stripe retries and duplicate events
 * must not move an already-recorded effective date.
 */
export async function markConsentEffective(
  prisma: PrismaClient,
  consentRecordId: string | null | undefined,
  stripeCheckoutId: string | null,
  eventCreated: number
): Promise<void> {
  if (!consentRecordId) return;
  const record = await prisma.consentRecord.findUnique({ where: { id: consentRecordId } });
  if (!record || record.effectiveAt) return;

  await prisma.consentRecord.update({
    where: { id: consentRecordId },
    data: {
      effectiveAt: new Date(eventCreated * 1000),
      stripeCheckoutId: stripeCheckoutId ?? record.stripeCheckoutId,
    },
  });
}

export type RecordAcceptanceInput = {
  userId: string;
  agreement: AgreementKey;
  version: string;
  method?: "web" | "checkout" | "bot" | "admin";
  ipAddress?: string | null;
  userAgent?: string | null;
};

/**
 * Appends an acceptance. Deliberately an insert, never an upsert — the history
 * of every version a member accepted is the evidence trail.
 */
export async function recordAcceptance(
  prisma: PrismaClient,
  input: RecordAcceptanceInput
): Promise<void> {
  await prisma.agreementAcceptance.create({
    data: {
      userId: input.userId,
      agreement: input.agreement,
      version: input.version,
      method: input.method ?? "web",
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent?.slice(0, 512) ?? null,
    },
  });
}
