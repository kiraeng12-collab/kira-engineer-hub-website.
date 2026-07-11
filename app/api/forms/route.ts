import {
  jsonResponse,
  safeText,
  isEmail,
  createReference,
  parseRequestBody,
  forwardOperationalEvent,
} from "@/lib/api-utils";
import { getPrismaClient } from "@/lib/db/prisma";
import { checkFormRateLimit } from "@/lib/rate-limit";
import { sendFormConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email/send";
import { pricingConfig } from "@/lib/config/pricing";
import type { PrismaClient } from "@/lib/generated/prisma";

export const runtime = "nodejs";

const allowedTypes = new Set([
  "contact",
  "support",
  "academy_interest",
  "project_242_interest",
  "shop_interest",
  "partner",
  "early_bird",
  "privacy_request",
  "complaint",
  "career_interest",
  "security_report",
]);

// Matches Section 26's reference formats exactly for the 8 named forms;
// the remaining categories (academy/shop interest) get sensible non-
// conflicting prefixes of their own.
const prefixes: Record<string, string> = {
  contact: "CON",
  support: "MEM",
  early_bird: "EB",
  partner: "AFF",
  complaint: "COMP",
  privacy_request: "PRIV",
  project_242_interest: "242",
  career_interest: "CAR",
  security_report: "SEC",
  academy_interest: "ACA",
  shop_interest: "SHP",
};

// Early Bird gets a dedicated, richer review record on top of the generic
// FormSubmission row - see docs/backend-phase-8.md. Best-effort: a failure
// here must never block the underlying form submission from succeeding.
async function createEarlyBirdRequest(
  prisma: PrismaClient,
  reference: string,
  email: string,
  fields: Record<string, string>
): Promise<void> {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  const notes = [
    fields.estimated_join_date ? `Estimated join date: ${fields.estimated_join_date}` : null,
    fields.details || null,
  ]
    .filter(Boolean)
    .join("\n\n");

  await prisma.earlyBirdRequest.create({
    data: {
      reference,
      email,
      userId: existingUser?.id,
      telegramUsername: fields.telegram_username || null,
      stripeCustomerId: existingUser?.stripeCustomerId || null,
      eligibilityCutoff: new Date(pricingConfig.earlyBirdCutoffDate),
      discountPercentage: pricingConfig.earlyBirdDiscountPercentage,
      eligibilitySource: "self_reported_pending_review",
      notes: notes || null,
    },
  });
}

function cleanFields(fields: Record<string, string>): Record<string, string> {
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (key === "website") continue;
    cleaned[safeText(key, 80)] = safeText(value, 4000);
  }
  return cleaned;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { fields } = await parseRequestBody(request);
    if (fields.website) return jsonResponse(200, { reference: "KE-SPAM-FILTERED" });

    const requestedType = safeText(fields.form_type || "contact", 40);
    let formType = allowedTypes.has(requestedType) ? requestedType : "contact";
    // The shared /contact form always posts form_type=contact; a "Careers"
    // topic selection gets its own reference prefix without needing a
    // dedicated page or client-side script.
    if (formType === "contact" && safeText(fields.topic, 40) === "Careers") {
      formType = "career_interest";
    }
    const email = safeText(fields.email || fields.reply, 320);
    const message = safeText(fields.message || fields.details || fields.audience_description, 4000);

    if (!isEmail(email)) return jsonResponse(400, { message: "Please enter a valid email address." });
    if (!message || message.length < 8) {
      return jsonResponse(400, { message: "Please add a clear message before sending." });
    }

    const cleanedFields = cleanFields(fields);
    const ipHint = safeText(request.headers.get("x-forwarded-for"), 80);
    const userAgent = safeText(request.headers.get("user-agent"), 300);
    const reference = createReference(prefixes[formType] || "REQ");

    const prisma = getPrismaClient();

    if (prisma) {
      const rateLimit = await checkFormRateLimit(prisma, { email, ipHint });
      if (rateLimit.limited) {
        return jsonResponse(429, { message: rateLimit.reason });
      }

      await prisma.formSubmission.create({
        data: {
          reference,
          formType,
          email,
          fields: cleanedFields,
          ipHint: ipHint || null,
          userAgent: userAgent || null,
          consentGiven: true,
        },
      });

      if (formType === "early_bird") {
        await createEarlyBirdRequest(prisma, reference, email, cleanedFields).catch(() => {});
      }

      const [confirmation, adminNotice] = await Promise.all([
        sendFormConfirmationEmail({ to: email, formType, reference }),
        sendAdminNotificationEmail({ formType, reference, email, fields: cleanedFields }),
      ]);

      // Best-effort legacy webhook forward alongside the DB write - never
      // blocks the response since the database is now the source of truth.
      if (process.env.FORM_WEBHOOK_URL || process.env.ADMIN_WEBHOOK_URL) {
        forwardOperationalEvent({
          event: "form.submitted",
          reference,
          formType,
          submittedAt: new Date().toISOString(),
          fields: cleanedFields,
          source: { userAgent, ipHint },
        }).catch(() => {});
      }

      return jsonResponse(200, {
        reference,
        emailSent: confirmation.sent,
        adminNotified: adminNotice.sent,
      });
    }

    // Database not configured yet: fall back to the original webhook-only
    // behavior so forms keep working while the owner finishes setup.
    const payload = {
      event: "form.submitted",
      reference,
      formType,
      submittedAt: new Date().toISOString(),
      to: "KE@kiraengineerhub.com",
      fields: cleanedFields,
      source: { userAgent, ipHint },
    };

    if (!process.env.FORM_WEBHOOK_URL && !process.env.ADMIN_WEBHOOK_URL) {
      return jsonResponse(503, {
        message: "Form delivery is not configured yet. Please contact KE@kiraengineerhub.com directly.",
      });
    }

    let delivered = false;

    if (process.env.FORM_WEBHOOK_URL) {
      const response = await fetch(process.env.FORM_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      delivered = response.ok;
    }

    if (!delivered) {
      const fallback = await forwardOperationalEvent(payload);
      delivered = Boolean(fallback.delivered);
    }

    if (!delivered) {
      return jsonResponse(502, { message: "Form delivery failed. Please contact KE@kiraengineerhub.com directly." });
    }

    return jsonResponse(200, { reference });
  } catch {
    return jsonResponse(400, { message: "The request could not be processed safely." });
  }
}
