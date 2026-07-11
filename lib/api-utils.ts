import crypto from "node:crypto";

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export function safeText(value: unknown, maxLength = 2000): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function isEmail(value: unknown): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
}

const REFERENCE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** KE-PREFIX-YYYY-XXXXXX, matching the format specified for all standardized forms. */
export function createReference(prefix: string): string {
  const year = new Date().getFullYear();
  const bytes = crypto.randomBytes(6);
  let random = "";
  for (const byte of bytes) {
    random += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  }
  return `KE-${prefix}-${year}-${random}`;
}

const MAX_BODY_BYTES = 100_000;

export async function parseRequestBody(
  request: Request,
  maxBytes: number = MAX_BODY_BYTES
): Promise<{ raw: string; fields: Record<string, string> }> {
  const raw = await request.text();
  if (raw.length > maxBytes) throw new Error("Payload too large");

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return { raw, fields: raw ? JSON.parse(raw) : {} };
  }
  const params = new URLSearchParams(raw);
  return { raw, fields: Object.fromEntries(params.entries()) };
}

export async function forwardOperationalEvent(
  payload: unknown
): Promise<{ delivered: boolean; status?: number; skipped?: boolean }> {
  const url = process.env.ADMIN_WEBHOOK_URL;
  if (!url) return { delivered: false, skipped: true };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { delivered: response.ok, status: response.status };
}
