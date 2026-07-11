import bcrypt from "bcryptjs";
import { jsonResponse, safeText, parseRequestBody } from "@/lib/api-utils";
import { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import { generateRawToken, hashToken, EMAIL_VERIFICATION_TTL_MS } from "@/lib/auth/tokens";
import { getPrismaClient } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmailVerificationEmail } from "@/lib/email/send";
import { siteConfig } from "@/lib/config/site";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const prisma = getPrismaClient();
  if (!prisma) {
    return jsonResponse(503, { message: "Account creation is not configured yet. Please try again later." });
  }

  try {
    const { fields } = await parseRequestBody(request);
    const email = safeText(fields.email, 320).toLowerCase();
    const password = String(fields.password || "");
    const name = safeText(fields.name, 200);
    const termsAccepted = fields.terms_accepted === "true";

    if (!isValidEmail(email)) return jsonResponse(400, { message: "Please enter a valid email address." });
    if (!isValidPassword(password)) {
      return jsonResponse(400, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }
    if (!termsAccepted) {
      return jsonResponse(400, { message: "You must accept the Terms of Use and Risk Disclosure to continue." });
    }

    const ipHint = safeText(request.headers.get("x-forwarded-for"), 80);
    const emailLimit = await checkRateLimit(prisma, { bucket: `register:email:${email}`, windowMinutes: 60, max: 5 });
    if (emailLimit.limited) return jsonResponse(429, { message: emailLimit.reason });
    if (ipHint) {
      const ipLimit = await checkRateLimit(prisma, { bucket: `register:ip:${ipHint}`, windowMinutes: 60, max: 15 });
      if (ipLimit.limited) return jsonResponse(429, { message: ipLimit.reason });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonResponse(409, { message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        termsAcceptedAt: new Date(),
      },
    });

    // Covers the case where someone submitted an Early Bird request (and was
    // approved) before creating an account: link it now instead of losing
    // the eligibility because no User row existed yet at approval time.
    const approvedEarlyBird = await prisma.earlyBirdRequest.findFirst({
      where: { email, status: "approved", eligible: true, userId: null },
      orderBy: { verifiedAt: "desc" },
    });
    if (approvedEarlyBird) {
      await prisma.earlyBirdRequest.update({ where: { id: approvedEarlyBird.id }, data: { userId: user.id } });
      await prisma.user.update({
        where: { id: user.id },
        data: {
          membershipTier: approvedEarlyBird.tier,
          earlyBirdVerifiedAt: approvedEarlyBird.verifiedAt || new Date(),
        },
      });
    }

    const rawToken = generateRawToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      },
    });

    const verifyUrl = `${siteConfig.websiteUrl}/verify-email?token=${rawToken}`;
    const emailResult = await sendEmailVerificationEmail({ to: email, verifyUrl });

    return jsonResponse(200, { registered: true, emailSent: emailResult.sent });
  } catch {
    return jsonResponse(400, { message: "The request could not be processed safely." });
  }
}
