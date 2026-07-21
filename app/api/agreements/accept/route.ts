import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse, parseRequestBody, safeText } from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { getAgreement, isAgreementKey } from "@/lib/config/agreements";
import { recordAcceptance } from "@/lib/agreements/service";

export const runtime = "nodejs";

/** Client IP as seen through Vercel's proxy chain. */
function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

/**
 * Records that the signed-in member accepted a specific agreement version.
 * The version is taken from the server-side registry — never from the client —
 * so a member cannot claim to have accepted a version that was never live.
 */
export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return jsonResponse(401, { message: "Please sign in first." });
  }

  const prisma = getPrismaClient();
  if (!prisma) return jsonResponse(503, { message: "Service is not configured yet." });

  const { fields } = await parseRequestBody(request);
  const key = safeText(fields.agreement, 64);

  if (!isAgreementKey(key)) {
    return jsonResponse(400, { message: "Unknown agreement." });
  }

  const agreement = getAgreement(key);
  if (agreement.status !== "published") {
    // Nothing may be accepted before the document actually exists.
    return jsonResponse(409, {
      message: "This agreement is not available for acceptance yet.",
    });
  }

  await recordAcceptance(prisma, {
    userId: session.user.id,
    agreement: agreement.key,
    version: agreement.version,
    method: "web",
    ipAddress: clientIp(request),
    userAgent: request.headers.get("user-agent"),
  });

  return jsonResponse(200, {
    accepted: agreement.key,
    version: agreement.version,
  });
}
