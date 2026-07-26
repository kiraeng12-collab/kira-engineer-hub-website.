import crypto from "node:crypto";

/**
 * Minimal NOWPayments adapter.
 *
 * Only two things are needed server-side: create a hosted invoice, and verify
 * the signature on the IPN (webhook) callback. Secrets are read from the
 * environment and never logged. NOWPayments is used in non-custodial mode, so
 * funds settle to the payout wallet configured in the NOWPayments dashboard
 * (the owner's Trust Wallet) - this code never touches keys or funds.
 */

const API_BASE = "https://api.nowpayments.io/v1";

export type NowPaymentsConfig = {
  apiKey: string;
  ipnSecret: string;
};

export function getNowPaymentsConfig(env: NodeJS.ProcessEnv = process.env): NowPaymentsConfig | null {
  const apiKey = env.NOWPAYMENTS_API_KEY?.trim();
  const ipnSecret = env.NOWPAYMENTS_IPN_SECRET?.trim();
  if (!apiKey || !ipnSecret) return null;
  return { apiKey, ipnSecret };
}

export type CreateInvoiceInput = {
  priceAmount: number;
  priceCurrency: string; // "usd"
  payCurrency: string; // "usdttrc20"
  orderId: string;
  orderDescription: string;
  ipnCallbackUrl: string;
  successUrl: string;
  cancelUrl: string;
};

export type CreateInvoiceResult = {
  invoiceId: string;
  invoiceUrl: string;
};

/** Creates a hosted NOWPayments invoice and returns its id + checkout URL. */
export async function createInvoice(
  config: NowPaymentsConfig,
  input: CreateInvoiceInput
): Promise<CreateInvoiceResult> {
  const response = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: { "x-api-key": config.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      price_amount: input.priceAmount,
      price_currency: input.priceCurrency,
      pay_currency: input.payCurrency,
      order_id: input.orderId,
      order_description: input.orderDescription,
      ipn_callback_url: input.ipnCallbackUrl,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`NOWPayments invoice failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await response.json()) as { id?: string | number; invoice_url?: string };
  if (!data.invoice_url || data.id == null) {
    throw new Error("NOWPayments invoice response missing id or invoice_url");
  }
  return { invoiceId: String(data.id), invoiceUrl: data.invoice_url };
}

/**
 * Recursively sort object keys - NOWPayments computes the IPN HMAC over the
 * JSON body with keys sorted alphabetically, so we must reproduce that exactly.
 */
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

/**
 * Verifies the `x-nowpayments-sig` header: HMAC-SHA512 of the key-sorted JSON
 * body, keyed with the IPN secret. Returns the parsed payload only when the
 * signature is valid, so callers cannot accidentally trust unverified data.
 */
export function verifyIpn(
  rawBody: string,
  signatureHeader: string | null,
  ipnSecret: string
): Record<string, unknown> | null {
  if (!signatureHeader) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return null;
  }
  const sortedString = JSON.stringify(sortKeys(parsed));
  const expected = crypto.createHmac("sha512", ipnSecret).update(sortedString).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  return parsed as Record<string, unknown>;
}

/** Payment statuses NOWPayments reports as fully settled. */
export const NOWPAYMENTS_PAID_STATUSES = new Set(["confirmed", "finished"]);
export const NOWPAYMENTS_FAILED_STATUSES = new Set(["failed", "refunded", "expired"]);
