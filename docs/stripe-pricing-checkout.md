# Stripe pricing and checkout requirements

## Stripe products and prices

Create recurring Stripe Prices rather than ad hoc checkout amounts.

- Kira VIP Monthly: USD 70, 7000 cents, recurring interval `month`, `interval_count` 1.
- Kira VIP Three-Month: USD 189, 18900 cents, recurring interval `month`, `interval_count` 3.

Environment variables:

- STRIPE_PRICE_KIRA_VIP_MONTHLY
- STRIPE_PRICE_KIRA_VIP_QUARTERLY
- STRIPE_EARLY_BIRD_COUPON_ID
- STRIPE_WEBHOOK_SECRET

## Early Bird coupon

- 20 percent off.
- Duration forever.
- Applies only to qualifying Kira VIP subscription products.
- Not combinable unless an administrator explicitly allows it.
- Promotion codes must be unique per verified member, difficult to guess, max redemption 1, and non-transferable.

## Checkout display

Before payment, show:

- selected plan
- standard price
- Early Bird discount only when verified
- discount amount
- final amount
- billing interval and renewal terms
- next billing explanation
- tax statement
- cancellation method
- refund summary
- Membership Terms, Refund Policy, Risk Disclosure and Privacy Policy links
- required unchecked terms checkbox
- optional unchecked marketing checkbox

## Access activation

Do not activate VIP access from a frontend success URL (`/checkout/success` only shows a pending-confirmation message). Activate access only after verified Stripe webhook events such as:

- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.paid
- invoice.payment_failed
- charge.refunded
- charge.dispute.created
- charge.dispute.closed

Webhook processing must be idempotent (tracked via the `StripeEvent` table, keyed on the Stripe event id) and must not let an out-of-order event overwrite a newer membership state. Early Bird eligibility can survive cancellation, but VIP access ends when the subscription is cancelled, unpaid, expired or failed.
