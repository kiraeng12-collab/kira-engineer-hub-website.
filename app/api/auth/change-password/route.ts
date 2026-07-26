import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import { jsonResponse, parseRequestBody } from "@/lib/api-utils";
import { isValidPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import { getPrismaClient } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * In-account password change for a signed-in member. Requires the current
 * password (so a hijacked open session can't silently change it), validates the
 * new one, and is rate limited. Mirrors the reset-password hashing (bcrypt, 12
 * rounds).
 */
export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return jsonResponse(401, { message: "Please sign in first." });

  const prisma = getPrismaClient();
  if (!prisma) return jsonResponse(503, { message: "Password change is not available right now." });

  try {
    const { fields } = await parseRequestBody(request);
    const currentPassword = String(fields.currentPassword || "");
    const newPassword = String(fields.newPassword || "");

    if (!isValidPassword(newPassword)) {
      return jsonResponse(400, { message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }

    const limit = await checkRateLimit(prisma, {
      bucket: `changepw:${session.user.id}`,
      windowMinutes: 15,
      max: 8,
    });
    if (limit.limited) {
      return jsonResponse(429, { message: "Too many attempts. Please try again in a few minutes." });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return jsonResponse(401, { message: "Please sign in first." });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return jsonResponse(400, { message: "Your current password is incorrect." });
    if (currentPassword === newPassword) {
      return jsonResponse(400, { message: "Choose a new password different from your current one." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return jsonResponse(200, { changed: true });
  } catch {
    return jsonResponse(400, { message: "The request could not be processed safely." });
  }
}
