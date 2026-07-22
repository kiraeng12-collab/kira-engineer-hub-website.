import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Lazily-created Stripe client. Returns null when STRIPE_SECRET_KEY isn't
 * configured yet, so callers can degrade gracefully (mirrors how
 * Prisma/Resend env vars are handled elsewhere in this repo).
 */
export function getStripeClient(): Stripe | null {
  if (client) return client;
  // Trimmed: these are pasted into a dashboard by hand, and a single stray
  // space makes Stripe reject every request with an auth error - which on
  // launch day looks like "checkout is completely broken".
  const apiKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!apiKey) return null;
  client = new Stripe(apiKey);
  return client;
}
