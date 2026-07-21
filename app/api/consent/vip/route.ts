import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { getVipConsentItems, missingConsentTypes } from "@/lib/config/vip-consent";

export const runtime = "nodejs";

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Records the VIP membership signing, then returns a consent record id.
 *
 * Per the launch guide this happens on a KIRA-controlled screen BEFORE the
 * Stripe Checkout Session is created; only the returned id travels in Stripe
 * metadata, while the full audit record stays here.
 */
export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return jsonResponse(401, { message: "Please sign in first." });

  const prisma = getPrismaClient();
  if (!prisma) return jsonResponse(503, { message: "Service is not configured yet." });

  const body = (await request.json().catch(() => null)) as {
    legalName?: unknown;
    country?: unknown;
    telegramUsername?: unknown;
    consents?: unknown;
  } | null;

  const legalName = clean(body?.legalName, 120);
  const country = clean(body?.country, 56);
  const telegramUsername = clean(body?.telegramUsername, 64) || null;
  const consents = Array.isArray(body?.consents)
    ? body.consents.filter((c): c is string => typeof c === "string")
    : [];

  if (legalName.length < 2) {
    return jsonResponse(400, { message: "Please type your full legal name." });
  }
  if (country.length < 2) {
    return jsonResponse(400, { message: "Please select your country of residence." });
  }

  // Every consent is mandatory — partial signing is not a signing.
  const missing = missingConsentTypes(consents);
  if (missing.length > 0) {
    return jsonResponse(400, {
      message: "Please confirm every statement before continuing.",
      missing,
    });
  }

  const items = getVipConsentItems();
  const ipAddress = clientIp(request);
  const userAgent = request.headers.get("user-agent")?.slice(0, 512) ?? null;

  // One signing event, with one immutable row per ticked consent.
  const record = await prisma.consentRecord.create({
    data: {
      userId: session.user.id,
      product: "vip_membership",
      legalName,
      country,
      telegramUsername,
      ipAddress,
      userAgent,
      items: {
        create: items.map((item) => ({
          userId: session.user.id,
          consentType: item.type,
          agreement: item.agreement,
          version: item.version,
          method: "checkout",
          ipAddress,
          userAgent,
        })),
      },
    },
    select: { id: true },
  });

  return jsonResponse(200, {
    consentRecordId: record.id,
    signedItems: items.length,
  });
}
