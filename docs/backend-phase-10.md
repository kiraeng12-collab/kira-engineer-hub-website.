# Kira Engineer Hub Phase 10: SEO, Accessibility, Performance, Security Hardening

This phase is a hardening pass across the whole site rather than a new
feature. It followed a full audit (SEO metadata, accessibility, performance,
security) and fixed every concrete gap the audit found, in priority order.

## Security

- **Rate limiting on unauthenticated auth endpoints.** `lib/rate-limit.ts`
  gained a general-purpose `checkRateLimit()` (backed by a new
  `RateLimitEvent` table, keyed by an arbitrary bucket string) alongside the
  existing form-specific `checkFormRateLimit()`. It's now wired into:
  - `/api/auth/register` - 5 attempts per email / 15 per IP per hour.
  - `/api/auth/forgot-password` - 5 per email / 15 per IP per hour (still
    returns the same generic non-enumerating message on success; a 429 is a
    different, orthogonal signal - "too many attempts," not "this account
    exists").
  - NextAuth `authorize()` in `lib/auth/config.ts` (login) - 8 attempts per
    email / 20 per IP per 15 minutes, throwing `TOO_MANY_ATTEMPTS` (handled
    in `components/auth/LoginForm.tsx` the same way `EMAIL_NOT_VERIFIED`
    already was).

  The Stripe and Telegram webhooks were deliberately left unrated - their
  signature/shared-secret verification is the correct control there, and
  rate-limiting Stripe's own retry delivery would be counterproductive.
  Session-gated POST routes (checkout session creation, customer portal,
  Telegram link generation, profile update) are lower risk since they
  require an authenticated account already; left as a future improvement if
  abuse is observed.

- **CSP tightened.** `vercel.json`'s `style-src`/`font-src` no longer
  allowlist `fonts.googleapis.com`/`fonts.gstatic.com` - `app/layout.tsx`
  uses `next/font/google` (Sora), which self-hosts the font files at build
  time and never calls out to Google at runtime, so that CSP surface was
  dead weight.
- **`X-Powered-By` header removed** via `poweredByHeader: false` in
  `next.config.ts`.
- **Reviewed, not changed:** `/api/auth/register` returns a `409` when an
  email is already registered. This is standard signup UX (how else would
  someone know to sign in instead?), not a meaningful enumeration risk in
  the same sense as login/password-reset - so it was left as-is rather than
  "fixed" into a generic response, which would just confuse legitimate users
  trying to register a second time.

## SEO

- **`components/ArabicPlaceholder.tsx` had a real bug**: it wrapped its
  (English) placeholder notice in `lang="ar" dir="rtl"`, backwards from what
  the content actually is - a screen reader would apply Arabic pronunciation
  rules to English text. Fixed by removing the incorrect lang/dir override;
  the root `<html lang="en">` now correctly covers this English placeholder
  content. Once real Arabic translations replace the placeholder, that
  content should carry its own correct `lang="ar"`/`dir="rtl"`.
- **All 14 `app/ar/*/page.tsx` pages** were missing a `description` in their
  `metadata` export - added one to each, describing that the Arabic
  translation is pending review and linking (in text) to the English
  equivalent.
- **All 10 `app/account/*/page.tsx` pages** were missing their own `title`
  (they all fell back to the generic root title) - each now has a
  page-specific title (e.g. "Billing", "Telegram", "Early Bird"). `robots:
  noindex` was already correctly set at `app/account/layout.tsx` and is
  inherited by all of them.
- **`public/sitemap.xml` (static file) replaced with `app/sitemap.ts`**
  (Next.js's dynamic sitemap API). The old file had drifted: 11 entries
  pointed at legacy paths that now 301-redirect elsewhere (`/terms`,
  `/affiliate-program`, etc. - per `next.config.ts`'s `redirects()`), and
  two real indexable routes (`/partner-program`, `/privacy-request`) were
  missing entirely. The new sitemap lists only canonical, indexable URLs.
- **Not changed (scoped out):** per-page `openGraph.url` and per-page
  `og:image`. Every page currently shares the homepage's OG image and only
  the homepage sets an explicit `og:url`; the rest fall back to sensible
  defaults from the root layout. Fixing this properly means a real
  metadata-builder refactor across ~80 page files (or per-page social share
  images), which is disproportionate to do as a mechanical edit right now -
  worth a dedicated pass later if social-share presentation becomes a
  priority.

## Accessibility

- **Two button styles failed WCAG AA contrast** in `app/globals.css`:
  `.button:hover` (teal background + near-white text, ~3.06:1) and
  `.button.cyan` (lighter teal background + near-white text, ~2.2:1), both
  under the 4.5:1 minimum for normal-size text. Fixed by switching the text
  color on both to `var(--surface)` (the same dark navy already used as the
  text color on the default `.button` state's light background) - now
  ~5.16:1 and ~6.83:1 respectively, both passing AA. The teal background
  colors themselves are unchanged.
- Everything else the audit checked (focus-visible states, mobile nav focus
  trap/restore, alt text, icon aria-labels, body text contrast) was already
  correct - no changes needed.

## Performance

- **`components/layout/CurrentYear.tsx`** was a `"use client"` component
  using `useState`/`useEffect` (plus `suppressHydrationWarning`) purely to
  render the current year in the footer copyright line. Converted to a
  plain function computing `new Date().getFullYear()` directly - no
  interactivity was ever needed, so no client-side JS or hydration mismatch
  handling is needed either.
- `next/image`/`next/font` usage, and the rest of the client/server
  component split, were already in good shape - no other changes needed.

## Known limitation

Rate limiting is DB-backed (`RateLimitEvent`), consistent with the rest of
this app's serverless-safe design - it cannot be verified against real
traffic without a live `DATABASE_URL`. The code has been verified via
lint/typecheck/build and by confirming (in the browser) that the
now-longer authorize()/register/forgot-password code paths still degrade
gracefully when the database isn't configured.
