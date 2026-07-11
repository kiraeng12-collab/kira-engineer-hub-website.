# Kira Engineer Hub Backend Phase 5: Authentication and Account Dashboard

This phase adds member accounts: registration, email verification, login,
password reset, and a protected `/account` dashboard. Everything degrades
the same way as Phase 4 - without `DATABASE_URL` configured, auth routes
return a clear "not configured yet" message instead of crashing.

## What's included

- **Registration** (`/register`): email + password, hashed with bcrypt
  (12 rounds), requires accepting Terms of Use and Risk Disclosure
  (timestamp recorded on the user record).
- **Email verification** (`/verify-email?token=...`): required before login.
  Tokens are stored as SHA-256 hashes, expire after 24 hours, single-use.
- **Login** (`/login`): Auth.js (NextAuth v4) Credentials provider, JWT
  session strategy (no separate session table needed).
- **Password reset** (`/forgot-password`, `/reset-password`): reset tokens
  expire after 1 hour, single-use, hashed the same way as verification
  tokens. The forgot-password endpoint always returns the same response
  whether or not the email is registered, so it can't be used to enumerate
  accounts.
- **Account dashboard** (`/account/*`): protected by `middleware.ts` -
  unauthenticated requests redirect to `/login`. Sub-pages for profile,
  membership, billing, invoices, Telegram, Early Bird, preferences, legal
  acceptances, and support all exist now; the ones that depend on features
  from later phases (Stripe, Telegram, Early Bird review) correctly show
  "not yet active" rather than fake data, and will start showing real data
  once those phases wire in without needing new pages.

## Required environment variables

```txt
NEXTAUTH_SECRET=   # generate with: openssl rand -base64 32
NEXTAUTH_URL=https://www.kiraengineerhub.com
```

`DATABASE_URL` and `RESEND_API_KEY` (from Phase 4) are also required for
registration/login/reset to actually work - without them, the relevant API
routes respond with a 503 "not configured yet" message instead of failing
unsafely.

## What this phase does not include

- No OAuth/social login (Credentials only, per your choice).
- No Account/Session Prisma tables - only needed if a second provider
  (OAuth) is added later, since JWT sessions don't require a database
  session table.
- No "resend verification email" or "change email address" self-service
  flow yet - both are reasonable fast-follows; for now a stuck verification
  link means contacting support (the account/profile page says so).
- No admin-side user management - that's Section 37 (Administration) in the
  original brief, not built yet.
- No CAPTCHA or IP-based rate limiting on registration/login specifically
  (the existing form-submission rate limiter in `lib/rate-limit.ts` doesn't
  apply here). Worth adding before launch if bot signups become a problem.

## Known limitation

Like Phase 4, live end-to-end registration/login/reset cannot be tested in
this environment without a real `DATABASE_URL` and `RESEND_API_KEY` - the
code has been verified via lint/typecheck/build and by exercising the
graceful-fallback (not-configured) paths live, but not an actual database
round-trip. Test this in staging before relying on it in production.
