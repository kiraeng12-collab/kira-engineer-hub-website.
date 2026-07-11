# Kira Engineer Hub Backend Phase 6: Stripe Membership Billing

This phase wires real Stripe subscription billing to signed-in member
accounts: authenticated checkout, a Stripe-hosted Customer Portal, and a
webhook that is the single source of truth for membership status. It
degrades the same way as Phases 4-5 - without `STRIPE_SECRET_KEY` /
`DATABASE_URL` configured, the Stripe routes return a clear "not configured
yet" response instead of crashing.

## What's included

- **Authenticated checkout** (`/api/stripe/create-checkout-session`):
  requires a signed-in session. Validates the requested plan against
  `lib/config/pricing.ts`, creates or reuses the member's
  `stripeCustomerId`, and applies the Early Bird discount only when
  `user.earlyBirdEligible` is true in the database - never from client
  input. Redirects to Stripe Checkout.
- **Customer Portal** (`/api/stripe/create-customer-portal`): requires a
  signed-in session with an existing `stripeCustomerId`. Redirects to a
  Stripe-hosted portal session for invoices, payment method updates, and
  self-service cancellation.
- **Membership status** (`/api/membership/status`): requires a signed-in
  session, returns the member's current `Membership` record (plan, status,
  current period end, cancel-at-period-end, Early Bird applied).
- **Webhook** (`/api/stripe/webhook`): verifies the Stripe signature, then
  handles `checkout.session.completed`, `customer.subscription.created`,
  `customer.subscription.updated`, `customer.subscription.deleted`,
  `invoice.paid`, `invoice.payment_failed`, `charge.refunded`,
  `charge.dispute.created`, and `charge.dispute.closed`. Idempotent via a
  `StripeEvent` table keyed on the Stripe event id, and guarded against
  out-of-order delivery via `Membership.lastEventCreatedAt` (an older event
  can never overwrite a newer state).
- **Checkout result pages**: `/checkout/success` and `/checkout/cancelled`
  (both `noindex`). The success page deliberately does not claim membership
  is active - it tells the member their payment is confirmed and access
  activates once the webhook processes, per the "never activate access from
  a frontend URL" rule. `/membership-inactive` is shown when a
  member without an active subscription reaches a VIP-gated area.
- **Account billing UI**: `components/account/SubscribeButtons.tsx` and
  `ManageBillingButton.tsx` call the endpoints above directly from
  `/account/membership` and `/account/billing`, which now read real
  `Membership` / `stripeCustomerId` data via Prisma instead of static
  placeholders.

## Required environment variables

```txt
STRIPE_SECRET_KEY=
STRIPE_PRICE_KIRA_VIP_MONTHLY=
STRIPE_PRICE_KIRA_VIP_QUARTERLY=
STRIPE_EARLY_BIRD_COUPON_ID=
STRIPE_SUCCESS_URL=https://www.kiraengineerhub.com/checkout/success
STRIPE_CANCEL_URL=https://www.kiraengineerhub.com/checkout/cancelled
STRIPE_WEBHOOK_SECRET=
STRIPE_WEBHOOK_TOLERANCE_SECONDS=300
```

`DATABASE_URL` (Phase 4) and `NEXTAUTH_SECRET`/`NEXTAUTH_URL` (Phase 5) are
also required, since every Stripe route requires an authenticated session
and a database to read/write `User` and `Membership` records.

## Stripe Dashboard setup

1. Create two recurring Prices under one Product (or two Products):
   - KIRA VIP Monthly: USD 70, billed monthly.
   - KIRA VIP Quarterly: USD 189, billed every 3 months.
2. Create the Early Bird coupon: 20% off, duration forever. Do not set it as
   an automatic/default coupon - it is applied programmatically only when
   `user.earlyBirdEligible` is true.
3. Enable the Customer Portal (Settings > Billing > Customer portal) and
   configure which self-service actions members may take (cancel, update
   payment method, view invoices).
4. Create a webhook endpoint pointing at:

   ```txt
   https://www.kiraengineerhub.com/api/stripe/webhook
   ```

   Select the events listed above (`checkout.session.completed` through
   `charge.dispute.closed`). Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.

## What this phase does not include

- No proration/upgrade-downgrade flow between Monthly and Quarterly plans
  yet - a member wanting to switch plans currently cancels and re-subscribes
  (Customer Portal can be configured to allow plan switching directly if
  preferred; not wired into the app UI yet).
- No admin-side manual override of membership status - that is Section 37
  (Administration) in the original brief, not built yet.
- No dunning/retry-email customization beyond Stripe's own Smart Retries -
  `invoice.payment_failed` marks the membership `past_due` but does not send
  a separate Kira-branded email yet.
- Early Bird *eligibility* is still set manually (Phase 8 will build the
  verification workflow); this phase only consumes that flag correctly and
  safely at checkout time.

## Known limitation

Like Phases 4-5, live end-to-end billing (real Checkout Session, real
webhook delivery, real Customer Portal session) cannot be tested in this
environment without real Stripe API keys and a real `DATABASE_URL` - the
code has been verified via lint/typecheck/build, unit tests on the pure
status-mapping and pricing logic, and by exercising the graceful-fallback
(not-configured) paths live in the browser. Test the full flow with Stripe
test-mode keys in staging before enabling `CHECKOUT_ENABLED=true` in
production.
