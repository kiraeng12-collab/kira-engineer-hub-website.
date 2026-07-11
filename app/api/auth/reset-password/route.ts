import bcrypt from "bcryptjs";
import { jsonResponse, safeText, parseRequestBody } from "@/lib/api-utils";
import { isValidPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import { hashToken, isExpired } from "@/lib/auth/tokens";
import { getPrismaClient } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return jsonResponse(503, { message: "Password reset is not configured yet. Please try again later." });
  }

  try {
    const { fields } = await parseRequestBody(request);
    const rawToken = safeText(fields.token, 500);
    const password = String(fields.password || "");

    if (!rawToken) return jsonResponse(400, { message: "Missing reset token." });
    if (!isValidPassword(password)) {
      return jsonResponse(400, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
    });

    if (!record || record.usedAt) {
      return jsonResponse(400, { message: "This reset link is invalid or has already been used." });
    }
    if (isExpired(record.expiresAt)) {
      return jsonResponse(400, { message: "This reset link has expired. Please request a new one." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);

    return jsonResponse(200, { reset: true });
  } catch {
    return jsonResponse(400, { message: "The request could not be processed safely." });
  }
}
