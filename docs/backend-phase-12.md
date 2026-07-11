# Kira Engineer Hub Phase 12: Founding Member / Early Bird / Standard Pricing

This phase replaces the single Early Bird discount (a flat 20% off) with a
two-tier loyalty pricing model, on top of standard pricing. The tier is
decided by an operator during Early Bird review (Phase 8), never chosen by
the member or trusted from client input.

## The three tiers

| Tier | Who qualifies | Monthly | Quarterly | How it's applied |
|---|---|---|---|---|
| **Founding Member** | Joined Kira Trading Community in 2024 or 2025 | USD 50 | USD 150 | A dedicated Stripe Price, used directly - no coupon |
| **Early Bird** | Joined 2025 through 1 Aug 2026 | USD 56 (20% off) | USD 151.20 (20% off) | Standard Stripe Price + the shared `STRIPE_EARLY_BIRD_COUPON_ID` coupon |
| **Standard** | Joined after 1 Aug 2026, or not otherwise eligible | USD 70 | USD 189 | Standard Stripe Price, no discount |

Founding Member pricing doesn't reduce to a clean percentage of standard
($50/$70 is ~28.6% off; $150/$189 is ~20.6% off) - reusing the percentage
coupon mechanism from the Early Bird tier wouldn't work here without two
different coupons per plan. Instead, Founding Members check out against
their own dedicated Stripe Prices (`STRIPE_PRICE_KIRA_VIP_MONTHLY_FOUNDING`,
`STRIPE_PRICE_KIRA_VIP_QUARTERLY_FOUNDING`), the same way standard members
check out against the standard Prices. No coupon involved for this tier.

## What changed under the hood

- `User.earlyBirdEligible` (`Boolean`) became `User.membershipTier`
  (`String?`): `null` (standard), `"founding"`, or `"early_bird"`.
- `Membership.earlyBirdApplied` (`Boolean`) became `Membership.tier`
  (`String?`), recorded from the subscription's Stripe metadata at checkout
  time - a durable record of which tier a given subscription was actually
  billed under, independent of the member's *current* `membershipTier` (which
  could change later).
- `EarlyBirdRequest.tier` (`String?`) records which tier a request was
  approved for.
- `lib/config/pricing.ts` gained `getFoundingPrice()`,
  `getFoundingPriceDisplay()`, and two tier-aware helpers -
  `getPriceForTier(plan, tier)` and `getStripePriceEnvForTier(plan, tier)` -
  so nothing outside this module needs its own tier branching logic.
- `/api/stripe/create-checkout-session` resolves the Stripe Price ID via
  `getStripePriceEnvForTier` based on `user.membershipTier`, and only
  attaches the Early Bird coupon when the tier is specifically `"early_bird"`.
- `scripts/early-bird-review.js`'s `approve` command now requires
  `--tier=founding` or `--tier=early_bird` - there's no sensible default,
  since this is exactly the judgment call the operator is making.

## Required environment variables (new)

```txt
STRIPE_PRICE_KIRA_VIP_MONTHLY_FOUNDING=
STRIPE_PRICE_KIRA_VIP_QUARTERLY_FOUNDING=
```

Create these the same way as the standard Prices (see
`docs/backend-phase-6.md`): two recurring Stripe Prices, USD 50/month and
USD 150/3-months, under whatever Product naming you prefer.

## Migration note

This phase renamed two database columns
(`earlyBirdEligible`→`membershipTier`, `earlyBirdApplied`→`tier`). It was
applied via `prisma migrate dev` directly against the live database while it
still had zero real user rows - safe in this case, but a rename like this
against a database with real data would need a proper backfill migration
(add the new column, copy/derive values from the old one, then drop it) to
avoid losing information for existing members.

## What this phase does not include

- No automated way to determine a member's join-date cohort - the operator
  decides `--tier=` based on whatever community records they can verify,
  same manual process as the rest of Phase 8's Early Bird review.
- No self-service tier change - if a member's tier was assigned incorrectly,
  it's corrected by re-running the CLI, not by the member.
- No proration or plan-switch handling between tiers - a member's tier is
  fixed at the time they're approved and used at their next checkout.

## Known limitation

Like Phase 8, the full loop (approve at a tier -> checkout uses the right
Stripe Price -> webhook records the tier on the Membership) has been
verified via unit tests and Stripe test-mode API calls (creating the actual
Founding Member Prices), but not a live end-to-end checkout in this
environment, since `CHECKOUT_ENABLED` stays `false` until the pre-launch
checklist in `PROJECT_REPORT.md` is complete.
