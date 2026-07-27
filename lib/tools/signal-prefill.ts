/**
 * Signed, short-lived signal-prefill tokens.
 *
 * When a KIRA signal offers a "Calculate My Lot Size" button, the signal's
 * details (symbol, direction, entry range, stop-loss) travel to the Mini App
 * inside a SIGNED token, never as plain, tamperable URL parameters. The server
 * mints the token; the calculator verifies it before pre-filling anything.
 *
 * This keeps two guarantees:
 *   - integrity: a member cannot edit the entry/stop in the link to fabricate
 *     a different signal, and
 *   - freshness: the token expires, so a stale or replayed link is rejected and
 *     the calculator can warn that the signal may have changed.
 */

import crypto from "node:crypto";

export interface SignalPrefillPayload {
  signalId: string;
  instrument: string;
  direction: "BUY" | "SELL";
  entryType: "SINGLE" | "RANGE";
  entryMinimum: number;
  entryMaximum: number;
  stopLoss: number;
  /** Unix seconds; token is invalid at/after this time. */
  exp: number;
}

export type VerifyResult =
  | { ok: true; payload: SignalPrefillPayload }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" };

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(body: string, secret: string): string {
  return b64url(crypto.createHmac("sha256", secret).update(body).digest());
}

/** Mints a token. `ttlSeconds` sets the expiry if the payload has no `exp`. */
export function buildSignalToken(
  payload: Omit<SignalPrefillPayload, "exp"> & { exp?: number },
  secret: string,
  ttlSeconds = 3600,
  now: number = Date.now()
): string {
  const exp = payload.exp ?? Math.floor(now / 1000) + ttlSeconds;
  const full: SignalPrefillPayload = { ...payload, exp };
  const body = b64url(Buffer.from(JSON.stringify(full)));
  return `${body}.${sign(body, secret)}`;
}

/**
 * Convenience for the Telegram bot: builds the full Mini App deep link a
 * "Calculate My Lot Size" button should point to, with the signed signal token
 * as the `s` query parameter. Use this URL as an inline-keyboard `web_app` (or
 * `url`) button under a signal.
 */
export function buildSignalCalculatorUrl(
  payload: Omit<SignalPrefillPayload, "exp"> & { exp?: number },
  secret: string,
  baseUrl = "https://www.kiraengineerhub.com/tools/lot-sizing-calculator/telegram",
  ttlSeconds = 3600
): string {
  const token = buildSignalToken(payload, secret, ttlSeconds);
  const sep = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${sep}s=${encodeURIComponent(token)}`;
}

export function verifySignalToken(
  token: string,
  secret: string,
  now: number = Date.now()
): VerifyResult {
  if (!token || !secret) return { ok: false, reason: "malformed" };
  const dot = token.indexOf(".");
  if (dot <= 0) return { ok: false, reason: "malformed" };

  const body = token.slice(0, dot);
  const providedSig = token.slice(dot + 1);
  const expectedSig = sign(body, secret);

  const a = fromB64url(providedSig);
  const b = fromB64url(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  let payload: SignalPrefillPayload;
  try {
    payload = JSON.parse(fromB64url(body).toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (!payload.exp || Math.floor(now / 1000) >= payload.exp) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload };
}
