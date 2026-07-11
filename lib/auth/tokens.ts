import crypto from "node:crypto";

export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour, shorter since more sensitive

/** Raw, URL-safe token - this is the only copy ever sent to the user (by email). */
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/** One-way hash stored in the database - the raw token can never be recovered from this. */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function isExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() < Date.now();
}
