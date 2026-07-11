# Kira Engineer Hub Backend Phase 4: Forms and Email Infrastructure

This phase adds real persistence and confirmation emails for every standardized
form. Forms still work today without either piece configured - they fall back
to the original webhook-only behavior from Phase 1 until you finish setup.

## What changed

- `/api/forms` now stores every submission in a Postgres database (via
  Prisma), rate-limits repeat submissions, and sends a branded confirmation
  email to the submitter plus an internal notification email.
- Reference numbers now follow the standardized format:
  `KE-<PREFIX>-<YEAR>-<6-character code>` (for example `KE-CON-2026-4F8A1C`).
- Prefixes: `CON` contact, `MEM` membership support, `EB` Early Bird, `AFF`
  Partner Program, `COMP` complaint, `PRIV` privacy request, `242` Project 242
  waitlist, `CAR` career interest, `SEC` security report, plus `ACA`/`SHP` for
  Academy/Shop interest.
- New forms: a security vulnerability report form on `/security`, and a
  "Careers" topic option on `/contact`.

## Database setup (Vercel Postgres / Neon)

1. Create a Postgres database (Vercel Project -> Storage -> Postgres, or a
   Neon project directly - both work since we connect via the Neon
   serverless driver).
2. Copy the pooled connection string into `DATABASE_URL` in Vercel Project
   Settings -> Environment Variables.
3. Run the schema against that database once:
   ```
   npx prisma migrate deploy
   ```
   (or `npx prisma db push` for a quick first-time setup without a migration
   history).
4. Redeploy. Forms will automatically start writing to the database - no
   further code changes needed.

## Email setup (Resend)

1. Create a Resend account and verify the `kiraengineerhub.com` sending
   domain (SPF/DKIM records at your DNS provider).
2. Add `RESEND_API_KEY` in Vercel Project Settings.
3. Set `EMAIL_FROM_ADDRESS` (defaults to `Kira Engineer Hub <KE@kiraengineerhub.com>`
   if unset - only change this if you want a different sending address).
4. Set `ADMIN_NOTIFICATION_EMAIL` to the inbox that should receive a copy of
   every form submission.
5. Redeploy. Confirmation and admin-notification emails will start sending
   automatically.

## Rate limiting

Once `DATABASE_URL` is set, submissions are limited to 5 per email address
and 10 per originating network per rolling 60-minute window, checked against
recent rows in the `FormSubmission` table. This is in addition to the
existing honeypot spam field.

## What Phase 4 does not include

- Early Bird still lands as a generic `FormSubmission` row today. The full
  review workflow (statuses, evidence requests, approval/rejection emails,
  Stripe customer linking) is Phase 8.
- No CAPTCHA. The honeypot field plus DB-backed rate limiting are the spam
  defenses for now; add a CAPTCHA later if spam becomes a real problem.
- Verification/password-reset, subscription/payment, and Telegram emails are
  not built yet - those templates land alongside auth (Phase 5), Stripe
  (Phase 6), and Telegram onboarding (Phase 7), reusing the same branded
  email shell added in this phase.
