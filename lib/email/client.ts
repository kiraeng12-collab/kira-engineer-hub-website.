import { Resend } from "resend";

let client: Resend | null = null;

/**
 * Lazily-created Resend client. Returns null when RESEND_API_KEY isn't
 * configured yet, so callers can degrade gracefully instead of crashing
 * (mirrors how Stripe/webhook env vars are handled elsewhere in this repo).
 */
export function getResendClient(): Resend | null {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  client = new Resend(apiKey);
  return client;
}
