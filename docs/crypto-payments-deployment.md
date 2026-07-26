# KIRA crypto payments — deployment (USDT / TRC20 via NOWPayments)

Second payment method alongside Stripe. Crypto is a **one-time payment for a
fixed access window** (30 days monthly, 90 days quarterly) — no auto-renew.
NOWPayments is used **non-custodial**, so every payment settles straight to the
owner's Trust Wallet; this codebase never holds keys or funds.

## How it works
1. On `/account/membership`, the member signs the crypto consent set (agreement,
   fixed-term acknowledgement, risk, e-records — no recurring-billing act).
2. `POST /api/crypto/create-invoice` records a pending `CryptoPayment` and creates
   a hosted NOWPayments invoice (USDT · TRC20) for the tier price.
3. Member pays; NOWPayments confirms on-chain and calls
   `POST /api/crypto/webhook` (HMAC-SHA512 signed).
4. The webhook verifies the signature, flips the payment to paid **once**
   (idempotent), and grants a fixed-window `vip_membership` entitlement
   (`source: "crypto"`, `currentPeriodEnd = now + 30/90 days`).
5. A daily Vercel Cron (`/api/crypto/sweep`) expires lapsed crypto entitlements
   and removes those members from the VIP Telegram chats.

## Owner setup (do before 1 Aug — has lead time)
1. Create a **NOWPayments** account; complete verification.
2. Set the **payout wallet** to your **Trust Wallet USDT (TRC20)** address.
3. Set the **IPN callback URL** to
   `https://www.kiraengineerhub.com/api/crypto/webhook`.
4. Generate the **API key** and **IPN secret**.

## Vercel environment variables
| Variable | Value |
|---|---|
| `CRYPTO_CHECKOUT_ENABLED` | `true` to turn crypto on (leave unset until ready) |
| `NOWPAYMENTS_API_KEY` | from NOWPayments (secret — never in chat/code) |
| `NOWPAYMENTS_IPN_SECRET` | from NOWPayments (secret) |
| `CRON_SECRET` | a long random string; Vercel Cron uses it to authorize the sweep |

## Database
Apply the additive migration once: `npx prisma migrate deploy` creates the
`CryptoPayment` table (no other tables change). The `Entitlement.source` column
now also accepts `crypto` — no schema change, it's a free-text field.

## Test (test mode)
NOWPayments has a sandbox. With the keys set and `CRYPTO_CHECKOUT_ENABLED=true`,
sign → "Pay with crypto" → pay the sandbox invoice → confirm the webhook grants
the entitlement and the member can link Telegram. Then confirm the sweep expires
a back-dated crypto entitlement and removes Telegram access.

## Not built / follow-ups
- Pre-expiry reminder emails (the sweep only revokes on lapse today).
- Multi-chain / non-stablecoin support (TRC20 USDT only for now).
- These terms are **not lawyer-reviewed**; crypto acceptance has AML/tax
  implications for a US LLC — flag to accountant/counsel.
