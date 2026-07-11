# Kira Engineer Hub Backend Phase 8: Early Bird Verification Workflow

This phase adds a real review workflow behind the Early Bird lifetime
discount: a structured `EarlyBirdRequest` record per submission, and a
deliberately non-web way for an operator to approve or reject requests. It
degrades the same way as earlier phases - without `DATABASE_URL` configured,
the `/early-bird` form still works exactly as it did in Phase 4 (webhook
fallback), it just doesn't get the richer workflow record described below.

## Why a dedicated model instead of the generic form table

Phase 4's `/api/forms` already stores every `early_bird` submission as a
`FormSubmission` row (reference prefix `EB`, confirmation + admin
notification emails, rate limiting) - that pipeline is unchanged and still
runs first. This phase adds a second, linked `EarlyBirdRequest` row on top of
it, because eligibility review needs fields `FormSubmission` was never meant
to hold: a real status lifecycle, `verifiedAt`/`verifiedBy`, an eligibility
cutoff and source, and a link to the member's `User` account once one
exists. `docs/early-bird-admin-workflow.md` (the original requirements
document for this feature) lists this exact field set and status enum:

```txt
submitted -> under_review -> evidence_required -> approved | rejected
approved -> code_issued -> redeemed
(any) -> suspended
```

In this implementation, `approved`, `code_issued`, and `redeemed` all grant
eligibility (`User.membershipTier` set to the approved tier); `rejected` and
`suspended` revoke it (`User.membershipTier` set back to `null`).
`submitted`, `under_review`, and `evidence_required` are neutral holding
states. See `docs/backend-phase-12.md` for the two-tier pricing model
(Founding Member vs Early Bird) added on top of this workflow.

## Why no per-member Stripe promotion codes

The requirements doc describes an alternative implementation strategy using
unique per-member Stripe Promotion Codes (`KIRA-EB-{RANDOM}`, max redemption
1). Phase 6 instead already applies the Early Bird discount server-side: the
authenticated checkout endpoint (`/api/stripe/create-checkout-session`)
reads `user.earlyBirdEligible` directly from the database and attaches the
shared `STRIPE_EARLY_BIRD_COUPON_ID` coupon itself - the client never
supplies a code, and there is nothing for a member to share or leak. This is
strictly harder to bypass than a redeemable code, so Phase 8 keeps that
mechanism rather than adding a second, redundant one. The `code_issued` /
`redeemed` statuses remain available in the model for an operator who wants
to track things that way, but nothing in the app currently drives them
automatically.

## Why there's no web admin page

`docs/early-bird-admin-workflow.md` is explicit: **do not create a public
admin route.** Any page reachable at `kiraengineerhub.com/...` is public
surface area, even behind a login - so review happens entirely outside the
web app, via a script an operator runs locally against the same
`DATABASE_URL` the app uses:

```txt
node scripts/early-bird-review.js list [status]
node scripts/early-bird-review.js approve <reference> <verifiedBy> --tier=founding|early_bird
node scripts/early-bird-review.js reject  <reference> <verifiedBy> [reason]
node scripts/early-bird-review.js mark    <reference> <status> [verifiedBy] [note]
```

`approve` requires a `--tier=` flag (see `docs/backend-phase-12.md`) and
updates the linked `User.membershipTier` immediately (if a matching account
exists yet - see below). `reject`/`mark` also update it (clearing the tier
on `rejected`/`suspended`). `mark` covers the remaining statuses
(`under_review`, `evidence_required`, `code_issued`, `redeemed`, `suspended`)
for cases that need more than a binary decision.

## Submission before registration

A visitor can submit an Early Bird request from the public `/early-bird`
page before they ever create an account. If an operator approves that
request while `userId` is still null, `/api/auth/register` checks for a
matching approved, unlinked `EarlyBirdRequest` by email at signup time and
links it automatically, carrying the eligibility flag onto the new `User`
record. No manual re-linking step is needed.

## Member-facing status

`/account/early-bird` shows the member's most recent `EarlyBirdRequest`
(matched by account ID, falling back to email) through
`lib/early-bird/status.ts`'s `describeEarlyBirdStatus()` - a plain-language
summary (`Under review`, `Additional evidence requested`, `Verified`, `Not
approved`, `Suspended`) rather than the raw internal status string.

## What this phase does not include

- No automated evidence verification (Telegram join-date lookups, payment
  record cross-referencing) - review is manual, using whatever the operator
  can reasonably confirm, per the requirements doc.
- No email notification to the member when their status changes - they see
  the update on `/account/early-bird` next time they check, and can also be
  told directly since the operator is doing this by hand. A "status changed"
  email is a reasonable fast-follow if manual review volume grows.
- No rate limit specific to repeated Early Bird submissions from the same
  verified member beyond the existing per-email/IP form rate limiter
  (`lib/rate-limit.ts`) - "prevent one member from claiming multiple codes"
  is enforced by the operator only approving one request per member, not by
  the intake form itself.

## Known limitation

Like earlier phases, the full loop (submit -> operator runs the CLI against
a real database -> member sees the updated status -> discount applies at
checkout) cannot be exercised end-to-end in this environment without a real
`DATABASE_URL`. The code has been verified via lint/typecheck/build, the
pure `describeEarlyBirdStatus` mapping is unit tested, and the CLI's
database access mirrors the same Prisma/Neon adapter pattern already in
production use elsewhere in this repo (`lib/db/prisma.ts`).
