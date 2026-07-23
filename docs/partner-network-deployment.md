# KIRA Partner Network — deployment & tracking checklist

The public Partner Network page (`/partner-program`) and the application flow are
fully live without any affiliate platform: applications post to the existing
`/api/forms` endpoint (`form_type=partner`, reference prefix `AFF`) with its
server-side validation, sanitisation, rate limiting, honeypot, DB persistence,
and email notification.

No affiliate tracking platform is configured yet. The page therefore shows **no
partner login, no dashboard, and no earnings data** — only real program terms.
Nothing fake is rendered.

## Enabling Rewardful (recommended, Stripe-native)

Rewardful is the preferred provider because checkout already runs on Stripe.

1. Create the Rewardful account and connect it to the **live** Stripe account
   (Kira Engineer Hub, `acct_1TsoNREF2ij4T2mw`). Rewardful attributes referrals
   via Stripe subscriptions — no checkout code change is required beyond passing
   the referral id (step 4).
2. Add the public API key in Vercel (all environments):

   | Variable | Scope | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_REWARDFUL_API_KEY` | Production/Preview | **Public** key only. When set, the page loads `https://r.wdfl.co/rw.js`. |

   Do **not** put any Rewardful private/secret key or Stripe secret in client
   code or `NEXT_PUBLIC_*` variables.
3. Redeploy. The Rewardful script tag is rendered conditionally in
   `app/partner-program/page.tsx` and stays absent until the key exists.
4. At checkout, pass the Rewardful referral id to Stripe so conversions are
   attributed. In `app/api/stripe/create-checkout-session/route.ts`, read the
   client value `window.Rewardful?.referral` (posted from the membership page)
   and set it as `client_reference_id` on the Checkout Session. This is the only
   checkout change required and is isolated to attribution.
5. Once a partner portal exists, add a "Partner Login" link to the page (a
   `NEXT_PUBLIC_REWARDFUL_PORTAL_URL` gate is the intended hook). It is
   intentionally omitted until then.

## What is intentionally NOT built

- No client-side commission ledger, cookies-only tracking, or unsecured store.
- No fabricated partner counts, earnings, testimonials, or dashboard values.
- No approval-time promise (none is stated on the page).

## Legal

- Partner Terms live at `/legal/affiliate-terms` (titled "KIRA Partner Terms"),
  linked from the page, the application consent, the Legal Center, and the
  footer. Governing law is inherited from `lib/config/legal.ts`.
- These terms have **not** been reviewed by a lawyer; flag for counsel before or
  shortly after launch.
