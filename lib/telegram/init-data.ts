/**
 * Telegram Mini App `initData` verification.
 *
 * The Mini App front-end hands us the raw `initData` string. It is UNTRUSTED —
 * anyone can craft one — so we verify its HMAC signature server-side against
 * the bot token before believing any field in it (especially the user id). A
 * Telegram user id must NEVER be trusted from the front-end without this check.
 *
 * Algorithm (Telegram WebApp spec):
 *   secret     = HMAC_SHA256(key="WebAppData", message=botToken)
 *   checkString = "\n"-joined "key=value" pairs, sorted, excluding `hash`
 *   valid      = HMAC_SHA256(key=secret, message=checkString) === hash
 */

import crypto from "node:crypto";

export interface TelegramInitUser {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isPremium?: boolean;
}

export type InitDataResult =
  | { ok: true; user: TelegramInitUser; authDate: number; raw: URLSearchParams }
  | { ok: false; reason: "malformed" | "missing_hash" | "bad_signature" | "expired" | "no_user" };

/** Default freshness window: an initData older than this is rejected. */
const DEFAULT_MAX_AGE_SECONDS = 24 * 60 * 60;

export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  opts: { maxAgeSeconds?: number; now?: number } = {}
): InitDataResult {
  if (!initData || !botToken) return { ok: false, reason: "malformed" };

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return { ok: false, reason: "malformed" };
  }

  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "missing_hash" };

  // Build the data-check-string: every field except `hash`, sorted by key.
  const pairs: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key === "hash") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const checkString = pairs.join("\n");

  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computed = crypto.createHmac("sha256", secret).update(checkString).digest("hex");

  // Timing-safe comparison; guard against unequal lengths which throw.
  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  // Freshness.
  const authDate = Number(params.get("auth_date") || 0);
  const nowSec = Math.floor((opts.now ?? Date.now()) / 1000);
  const maxAge = opts.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS;
  if (!authDate || nowSec - authDate > maxAge) {
    return { ok: false, reason: "expired" };
  }

  // Parse the user object.
  const userRaw = params.get("user");
  if (!userRaw) return { ok: false, reason: "no_user" };
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(userRaw);
  } catch {
    return { ok: false, reason: "no_user" };
  }
  if (parsed.id === undefined || parsed.id === null) return { ok: false, reason: "no_user" };

  const user: TelegramInitUser = {
    id: String(parsed.id),
    username: typeof parsed.username === "string" ? parsed.username : undefined,
    firstName: typeof parsed.first_name === "string" ? parsed.first_name : undefined,
    lastName: typeof parsed.last_name === "string" ? parsed.last_name : undefined,
    languageCode: typeof parsed.language_code === "string" ? parsed.language_code : undefined,
    isPremium: parsed.is_premium === true,
  };

  return { ok: true, user, authDate, raw: params };
}
