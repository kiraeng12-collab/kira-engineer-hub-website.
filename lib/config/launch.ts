/**
 * The public launch moment. Checkout (card + crypto) and the membership CTA
 * stay gated until this instant, then open themselves — no manual flip.
 *
 * Default: 1 August 2026, 7:10 PM Jordan time (UTC+3). Override with the
 * LAUNCH_AT env var (any value `new Date()` can parse, ISO 8601 preferred) if
 * the moment ever moves — no code change needed.
 */
export const DEFAULT_LAUNCH_AT = "2026-08-01T19:10:00+03:00";
export const LAUNCH_DISPLAY = "1 August 2026, 7:10 PM (Jordan time)";

type EnvLike = Record<string, string | undefined>;

export function getLaunchAt(env: EnvLike = process.env): Date {
  const raw = (env.LAUNCH_AT || "").trim();
  const parsed = raw ? new Date(raw) : new Date(DEFAULT_LAUNCH_AT);
  return Number.isNaN(parsed.getTime()) ? new Date(DEFAULT_LAUNCH_AT) : parsed;
}

/** Has the public launch moment passed? */
export function hasLaunched(now: Date = new Date(), env: EnvLike = process.env): boolean {
  return now.getTime() >= getLaunchAt(env).getTime();
}
