# Kira Engineer Hub — Project Report

This report summarizes the rebuild of kiraengineerhub.com: a migration from a
static HTML site to a full Next.js application with membership billing,
Telegram onboarding, and a content publishing system. It's meant as the
closing reference for what was built, what still needs real credentials, and
what to check before this goes live in production.

## What this is

Kira Engineer Hub is a trading-education and financial-technology brand. The
site now covers: public marketing/education pages, a member account area,
Stripe-backed VIP membership billing, automated Telegram community
onboarding, an Early Bird loyalty-pricing review workflow, and an MDX-based
content system for ongoing articles.

## Current repository state

- Framework: Next.js 15 (App Router), TypeScript, deployed to Vercel.
- **3 commits** on `main`, on top of the original static-site history:
  1. The full platform migration (foundation, redesign, forms, auth, Stripe,
     Telegram, Early Bird, hardening).
  2. Expanded unit test coverage (rate limiting, login, Stripe webhooks).
  3. The MDX content publishing system.
- **Nothing has been pushed to GitHub or deployed to Vercel yet.** All work
  is local. `git push` and a Vercel deploy are the two remaining actions to
  make any of this live.
- 75 unit tests, lint, and typecheck all pass; the production build
  (`npm run build`) succeeds cleanly.

## What's built, by phase

| Phase | What it covers | Docs |
|---|---|---|
| 1-3 | Framework migration off static HTML; central `lib/config` for site/pricing/legal values; premium visual redesign preserving brand colors, logos, and eagle crest artwork | - |
| 4 | Forms -> Postgres (Prisma/Neon), rate-limited, with Resend confirmation + admin-notification emails | `docs/backend-phase-1.md` |
| 5 | Auth.js (NextAuth v4) credentials login, email verification, password reset, protected `/account` dashboard | `docs/backend-phase-5.md` |
| 6 | Stripe VIP membership billing: authenticated checkout, Customer Portal, idempotent webhook as the sole source of truth for membership status | `docs/backend-phase-6.md` |
| 7 | Telegram onboarding: token-based `/start` deep link, single-use group invite, automatic removal on membership lapse | `docs/backend-phase-7.md` |
| 8 | Early Bird eligibility review: dedicated data model, **no public admin route** (by design), reviewed via a local CLI script | `docs/backend-phase-8.md`, `docs/early-bird-admin-workflow.md` |
| 9 | MDX content system for Insights / Weekly Analysis / Updates - articles are files in `content/`, no database or admin UI | `docs/backend-phase-9.md` |
| 10 | Site-wide SEO, accessibility, performance, and security hardening pass | `docs/backend-phase-10.md` |
| 11 | Expanded automated test coverage; this report | - |

## Before this can go live: required credentials

None of the following are configured yet in this environment - `.env` only
has local development placeholders. Every one of these needs a **real** value
in Vercel's Environment Variables before the corresponding feature works in
production. Until then, each feature degrades safely (a clear "not
configured yet" response) rather than crashing.

| Variable | What it's for | Where to get it |
|---|---|---|
| `DATABASE_URL` | Postgres connection (forms, auth, membership, Telegram, Early Bird, rate limiting) | Vercel Postgres or Neon dashboard |
| `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `ADMIN_NOTIFICATION_EMAIL` | Transactional email | Resend dashboard |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Session signing / canonical URL | `openssl rand -base64 32`; your production URL |
| `STRIPE_SECRET_KEY`, `STRIPE_PRICE_KIRA_VIP_MONTHLY`, `STRIPE_PRICE_KIRA_VIP_QUARTERLY`, `STRIPE_EARLY_BIRD_COUPON_ID`, `STRIPE_WEBHOOK_SECRET` | Membership billing | Stripe Dashboard - see `docs/backend-phase-6.md` for exact setup steps |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_GROUP_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET` | Community onboarding | @BotFather - see `docs/backend-phase-7.md` for exact setup steps |
| `FORM_WEBHOOK_URL` / `ADMIN_WEBHOOK_URL` | Legacy fallback if `DATABASE_URL` isn't set yet | Your automation tool of choice (optional once the database is live) |

`CHECKOUT_ENABLED` stays `false` until you're ready - see the pre-launch
checklist below.

## Pre-launch checklist

Before setting `CHECKOUT_ENABLED=true` in production:

- [ ] All credentials above are set in Vercel with real, live values.
- [ ] Legal entity details in `lib/config/legal.ts` are filled in (they're
      placeholders today - `scripts/validate-legal-config.js` will fail the
      build if launch-blocking fields are still empty).
- [ ] Stripe products/prices created and tested in Stripe test mode; webhook
      endpoint registered and receiving events.
- [ ] Telegram bot created, added as group admin, webhook registered.
- [ ] At least one person has walked through: register -> verify email ->
      log in -> subscribe -> receive Telegram invite -> cancel -> get removed
      from the group, end to end, in a staging environment.
- [ ] `git push` this repo, then deploy to Vercel (neither has happened yet).

## Known limitations (carried over from each phase's own doc)

- No admin dashboard anywhere in this app. Early Bird review is a local CLI
  script (`scripts/early-bird-review.js`) by design, per the "do not create a
  public admin route" requirement. There's no equivalent for manually
  overriding membership status - that's out of scope for now.
- No self-service email change, Telegram unlink, or "resend verification
  email" flow - all go through support for now.
- No content-authoring UI - articles are MDX files committed to git.
- Rate limiting, Stripe webhook idempotency, and Telegram access sync have
  never been exercised against a real database or real Stripe/Telegram
  traffic in this environment - only via mocked unit tests and graceful
  "not configured" fallbacks confirmed live in the browser.
- Per-page Open Graph images/URLs are not individually customized (every
  page shares the site default) - noted as a deliberate scope cut in
  `docs/backend-phase-10.md`, not an oversight.

## Recommended next steps

1. Push this repo to GitHub (`kiraeng12-collab/kira-engineer-hub-website`).
2. Provision the credentials table above in a staging Vercel project first.
3. Walk through the pre-launch checklist in staging.
4. Only then promote to production and flip `CHECKOUT_ENABLED=true`.
