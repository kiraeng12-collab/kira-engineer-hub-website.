import { siteConfig } from "@/lib/config/site";

const BRAND_COLORS = {
  bg: "#0B1118",
  surface: "#151C24",
  ink: "#EDF1F4",
  muted: "#98A2AE",
  cyan: "#2BB6A8",
  border: "#29323D",
};

/**
 * Branded HTML shell every transactional email is wrapped in: logo, subject
 * as heading, reference number, body content, support contact, legal
 * footer, and an optional risk warning. Inline styles only - email clients
 * don't reliably support external/embedded stylesheets.
 */
export function renderBrandedEmail({
  title,
  bodyHtml,
  reference,
  showRiskWarning = false,
}: {
  title: string;
  bodyHtml: string;
  reference?: string;
  showRiskWarning?: boolean;
}): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:${BRAND_COLORS.bg};font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_COLORS.bg};padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:${BRAND_COLORS.surface};border:1px solid ${BRAND_COLORS.border};border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid ${BRAND_COLORS.border};">
                <img src="${siteConfig.websiteUrl}/ke-hub-logo.png" alt="Kira Engineer Hub" height="32" style="display:block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:${BRAND_COLORS.ink};">
                <h1 style="margin:0 0 16px;font-size:1.3rem;color:${BRAND_COLORS.ink};">${title}</h1>
                ${
                  reference
                    ? `<p style="margin:0 0 20px;font-size:.85rem;color:${BRAND_COLORS.muted};">Reference: <strong style="color:${BRAND_COLORS.cyan};">${reference}</strong></p>`
                    : ""
                }
                <div style="font-size:.95rem;line-height:1.6;color:${BRAND_COLORS.ink};">${bodyHtml}</div>
                ${
                  showRiskWarning
                    ? `<p style="margin-top:24px;padding:16px;border:1px solid ${BRAND_COLORS.border};border-radius:6px;font-size:.82rem;color:${BRAND_COLORS.muted};">
                        <strong style="color:${BRAND_COLORS.ink};">Risk warning:</strong> Trading financial markets involves substantial risk and may result in partial or total loss of capital. This message is educational and general information only and is not personalized financial, investment, legal or tax advice.
                      </p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid ${BRAND_COLORS.border};font-size:.78rem;color:${BRAND_COLORS.muted};">
                <p style="margin:0 0 8px;">Need help? Contact <a href="mailto:${siteConfig.contact.support}" style="color:${BRAND_COLORS.cyan};">${siteConfig.contact.support}</a></p>
                <p style="margin:0;">
                  <a href="${siteConfig.websiteUrl}/legal/terms" style="color:${BRAND_COLORS.muted};">Terms</a> &middot;
                  <a href="${siteConfig.websiteUrl}/legal/privacy" style="color:${BRAND_COLORS.muted};">Privacy</a> &middot;
                  &copy; ${new Date().getFullYear()} ${siteConfig.companyName}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function emailButton(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;padding:12px 20px;background:${BRAND_COLORS.cyan};color:#07100F;font-weight:700;text-decoration:none;border-radius:6px;">${label}</a></p>`;
}

export function renderEmailVerificationEmail({ verifyUrl }: { verifyUrl: string }): { subject: string; html: string } {
  return {
    subject: "Verify your email — Kira Engineer Hub",
    html: renderBrandedEmail({
      title: "Verify your email address",
      bodyHtml: `
        <p>Thanks for creating a Kira Engineer Hub account. Confirm your email address to activate it.</p>
        ${emailButton(verifyUrl, "Verify Email Address")}
        <p style="color:${BRAND_COLORS.muted};font-size:.82rem;">This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
      `,
    }),
  };
}

export function renderPasswordResetEmail({ resetUrl }: { resetUrl: string }): { subject: string; html: string } {
  return {
    subject: "Reset your password — Kira Engineer Hub",
    html: renderBrandedEmail({
      title: "Reset your password",
      bodyHtml: `
        <p>We received a request to reset the password for your Kira Engineer Hub account.</p>
        ${emailButton(resetUrl, "Reset Password")}
        <p style="color:${BRAND_COLORS.muted};font-size:.82rem;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email - your password will not be changed.</p>
      `,
    }),
  };
}

const FORM_TYPE_LABELS: Record<string, string> = {
  contact: "Contact enquiry",
  support: "Membership support request",
  early_bird: "Early Bird eligibility request",
  partner: "Partner Program application",
  complaint: "Complaint",
  privacy_request: "Privacy request",
  project_242_interest: "Project 242 waitlist",
  academy_interest: "KIRA Academy interest",
  shop_interest: "KIRA Shop interest",
  career_interest: "Career interest",
  security_report: "Security report",
};

export function formTypeLabel(formType: string): string {
  return FORM_TYPE_LABELS[formType] || "Request";
}

export function renderFormConfirmationEmail({
  formType,
  reference,
}: {
  formType: string;
  reference: string;
}): { subject: string; html: string } {
  const label = formTypeLabel(formType);
  return {
    subject: `We received your ${label.toLowerCase()} — ${reference}`,
    html: renderBrandedEmail({
      title: `${label} received`,
      reference,
      showRiskWarning: formType === "early_bird" || formType === "support",
      bodyHtml: `
        <p>Thank you for contacting Kira Engineer Hub. Your ${label.toLowerCase()} has been received and is being reviewed.</p>
        <p>Keep this reference number for any follow-up: <strong>${reference}</strong></p>
        <p>We aim to respond as soon as practical. If your request is urgent, you can also reach us on Telegram.</p>
      `,
    }),
  };
}

export function renderAdminNotificationEmail({
  formType,
  reference,
  email,
  fields,
}: {
  formType: string;
  reference: string;
  email: string;
  fields: Record<string, string>;
}): { subject: string; html: string } {
  const label = formTypeLabel(formType);
  const rows = Object.entries(fields)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#98A2AE;vertical-align:top;">${key}</td><td style="padding:6px 0;">${value}</td></tr>`
    )
    .join("");

  return {
    subject: `New ${label.toLowerCase()} — ${reference}`,
    html: renderBrandedEmail({
      title: `New ${label.toLowerCase()}`,
      reference,
      bodyHtml: `
        <p>Submitted by: <strong>${email}</strong></p>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:.88rem;">${rows}</table>
      `,
    }),
  };
}
