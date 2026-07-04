# Early Bird administration workflow

This static upload package does not include a secure authenticated admin dashboard or database. Do not create a public admin route.

## Required backend model

- earlyBirdId
- userId
- email
- telegramUserId
- stripeCustomerId
- eligible
- eligibilityCutoff
- eligibilitySource
- verifiedAt
- verifiedBy
- discountPercentage
- status
- notes
- createdAt
- updatedAt

## Statuses

- submitted
- under_review
- evidence_required
- approved
- rejected
- code_issued
- redeemed
- suspended

## Security rules

- Do not approve eligibility from frontend form data alone.
- Use stable identifiers such as verified email, Telegram user ID, website user ID, or Stripe customer ID.
- Generate one unique, hard-to-guess code per eligible member.
- Do not expose full code lists to frontend JavaScript.
- Do not log full codes, Stripe IDs, Telegram IDs, or evidence URLs in public logs.
- Store evidence privately.
- Rate-limit submissions.
- Validate file types and sizes.
- Prevent one member from claiming multiple codes.
- Record audit logs for every eligibility change.

## Stripe setup required

- Kira VIP Monthly recurring Price: USD 70, interval month, interval_count 1.
- Kira VIP Three-Month recurring Price: USD 189, interval month, interval_count 3.
- Early Bird coupon: 20 percent off, duration forever, limited to qualifying Kira VIP products.
- Unique promotion codes: format KIRA-EB-{RANDOM_SECURE_VALUE}, max redemption 1, non-transferable, connected to one Early Bird record.

## Access rule

Early Bird eligibility survives cancellation. VIP access does not. Access must be activated only by verified Stripe subscription/payment webhooks.
