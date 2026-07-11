import { jsonResponse, safeText, parseRequestBody } from "@/lib/api-utils";
import { isValidEmail } from "@/lib/auth/validation";
import { generateRawToken, hashToken, PASSWORD_RESET_TTL_MS } from "@/lib/auth/tokens";
import { getPrismaClient } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email/send";
import { siteConfig } from "@/lib/config/site";

export const runtime = "nodejs";

// Always returns the same success message regardless of whether the email
// is registered, so this endpoint can't be used to discover account emails.
const GENERIC_RESPONSE = {
  message: "If an account exists for that email address, a password reset link has been sent.",
};

export async function POST(request: Request): Promise<Response> {
  const prisma = getPrismaClient();
  if (!prisma) return jsonResponse(200, GENERIC_RESPONSE);

  try {
    const { fields } = await parseRequestBody(request);
    const email = safeText(fields.email, 320).toLowerCase();
    if (!isValidEmail(email)) return jsonResponse(200, GENERIC_RESPONSE);

    const ipHint = safeText(request.headers.get("x-forwarded-for"), 80);
    const emailLimit = await checkRateLimit(prisma, {
      bucket: `forgot-password:email:${email}`,
      windowMinutes: 60,
      max: 5,
    });
    if (emailLimit.limited) return jsonResponse(429, { message: emailLimit.reason });
    if (ipHint) {
      const ipLimit = await checkRateLimit(prisma, {
        bucket: `forgot-password:ip:${ipHint}`,
        windowMinutes: 60,
        max: 15,
      });
      if (ipLimit.limited) return jsonResponse(429, { message: ipLimit.reason });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const rawToken = generateRawToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
        },
      });
      const resetUrl = `${siteConfig.websiteUrl}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail({ to: email, resetUrl });
    }

    return jsonResponse(200, GENERIC_RESPONSE);
  } catch {
    return jsonResponse(200, GENERIC_RESPONSE);
  }
}
