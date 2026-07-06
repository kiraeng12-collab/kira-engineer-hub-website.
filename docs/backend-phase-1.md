# Kira Engineer Hub Backend Phase 1

This phase adds the first real backend foundation while keeping public checkout disabled until the business is ready.

## What is included

- `/api/forms` receives website forms and forwards them to an operations webhook.
- `/api/checkout` creates Stripe subscription checkout sessions when `CHECKOUT_ENABLED=true`.
- `/api/stripe-webhook` receives Stripe payment and subscription events with signature verification.
- `.env.example` lists the required Vercel environment variables.

## Current safety position

Checkout is disabled by default:

```txt
CHECKOUT_ENABLED=false
```

This means visitors cannot start payment from the website until you intentionally activate it.

## Recommended operations setup

Use one private destination for operational alerts. This can be a secure automation webhook that sends submissions to email, Google Sheets, Notion, Airtable, CRM, or a private admin inbox.

Set at least one of:

```txt
FORM_WEBHOOK_URL=
ADMIN_WEBHOOK_URL=
```

`FORM_WEBHOOK_URL` is for normal form submissions.

`ADMIN_WEBHOOK_URL` is a fallback for forms and the destination for Stripe payment events.

## Stripe setup

Create Stripe products and recurring prices:

- KIRA VIP Monthly: USD 70 monthly
- KIRA VIP Quarterly: USD 189 every 3 months
- Early Bird coupon: 20% off, duration forever, only for manually approved eligible members

Then add these Vercel environment variables:

```txt
STRIPE_SECRET_KEY=
STRIPE_PRICE_KIRA_VIP_MONTHLY=
STRIPE_PRICE_KIRA_VIP_QUARTERLY=
STRIPE_EARLY_BIRD_COUPON_ID=
STRIPE_SUCCESS_URL=https://www.kiraengineerhub.com/membership?checkout=success
STRIPE_CANCEL_URL=https://www.kiraengineerhub.com/membership?checkout=cancelled
```

Do not enable checkout until Stripe products, refund handling, support handling, and membership delivery are tested.

## Stripe webhook setup

In Stripe Dashboard, create a webhook endpoint:

```txt
https://www.kiraengineerhub.com/api/stripe-webhook
```

Select these events:

- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the webhook signing secret into Vercel:

```txt
STRIPE_WEBHOOK_SECRET=
```

## Before turning checkout on

Confirm these items first:

- Legal entity details are complete.
- Refund and cancellation policy is final.
- Membership delivery process is defined.
- Telegram access approval process is defined.
- Admin notification destination is working.
- Stripe webhook test events are received.
- Test checkout succeeds in Stripe test mode.

Only then set:

```txt
CHECKOUT_ENABLED=true
```

## What Phase 2 should add

- Admin dashboard for requests and members.
- Member database.
- Approved Early Bird verification workflow.
- Automatic Telegram invite flow.
- Subscription status tracking.
- Email confirmations.
- Secure support ticket history.
