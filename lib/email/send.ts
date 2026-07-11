import { getResendClient } from "./client";
import {
  renderFormConfirmationEmail,
  renderAdminNotificationEmail,
  renderEmailVerificationEmail,
  renderPasswordResetEmail,
} from "./templates";

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "Kira Engineer Hub <KE@kiraengineerhub.com>";

export type EmailResult = { sent: boolean; skipped?: boolean; error?: string };

export async function sendFormConfirmationEmail({
  to,
  formType,
  reference,
}: {
  to: string;
  formType: string;
  reference: string;
}): Promise<EmailResult> {
  const resend = getResendClient();
  if (!resend) return { sent: false, skipped: true };

  const { subject, html } = renderFormConfirmationEmail({ formType, reference });

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
}

export async function sendAdminNotificationEmail({
  formType,
  reference,
  email,
  fields,
}: {
  formType: string;
  reference: string;
  email: string;
  fields: Record<string, string>;
}): Promise<EmailResult> {
  const resend = getResendClient();
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!resend || !adminEmail) return { sent: false, skipped: true };

  const { subject, html } = renderAdminNotificationEmail({ formType, reference, email, fields });

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to: adminEmail, subject, html });
    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
}

export async function sendEmailVerificationEmail({
  to,
  verifyUrl,
}: {
  to: string;
  verifyUrl: string;
}): Promise<EmailResult> {
  const resend = getResendClient();
  if (!resend) return { sent: false, skipped: true };

  const { subject, html } = renderEmailVerificationEmail({ verifyUrl });

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}): Promise<EmailResult> {
  const resend = getResendClient();
  if (!resend) return { sent: false, skipped: true };

  const { subject, html } = renderPasswordResetEmail({ resetUrl });

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
}
