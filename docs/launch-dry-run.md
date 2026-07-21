# KIRA VIP Launch — Dry Run & Go-Live Runbook

Target: **1 August 2026**. Do the dry run in **Stripe test mode** first. A live-mode
test creates a real charge, a real subscription and a refund to process.

> **Never paste a secret key into chat, a commit, or a support ticket.**
> Every secret below is set directly in Vercel / the bot panel.

---

## 0. Safety switches (check these FIRST)

Your Stripe account is live, so these two are what stand between you and real charges:

| Variable | Value until 1 Aug | Where |
|---|---|---|
| `CHECKOUT_ENABLED` | `false` (or unset) | Vercel |
| `PAYMENT_AUTOMATION_ENABLED` | `false` (or unset) | Vercel |

Both must be exactly the string `true` to activate. Anything else = off (fail-safe).

---

## 1. Environment variables

### Website (Vercel)

| Variable | Test run | Go-live (1 Aug) |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | test endpoint `whsec_...` | **live endpoint** `whsec_...` (different!) |
| `STRIPE_PRICE_KIRA_VIP_MONTHLY` | test price id | live price id |
| `STRIPE_PRICE_KIRA_VIP_QUARTERLY` | test price id | live price id |
| `STRIPE_PRICE_KIRA_VIP_MONTHLY_FOUNDING` | test price id | live price id |
| `STRIPE_PRICE_KIRA_VIP_QUARTERLY_FOUNDING` | test price id | live price id |
| `STRIPE_EARLY_BIRD_COUPON_ID` | test coupon (20% off) | live coupon |
| `STRIPE_SUCCESS_URL` | `https://<domain>/checkout/success` | same |
| `STRIPE_CANCEL_URL` | `https://<domain>/checkout/cancelled` | same |
| `TELEGRAM_BOT_TOKEN` | your bot token | same |
| `TELEGRAM_BOT_USERNAME` | bot username, no `@` | same |
| `TELEGRAM_GROUP_CHAT_ID` | **VIP** group id | same |
| `TELEGRAM_CHANNEL_CHAT_ID` | **VIP** channel id | same |
| `TELEGRAM_BOT_VERIFY_SECRET` | long random string | same |
| `CHECKOUT_ENABLED` | `true` (for the test) | `true` |
| `PAYMENT_AUTOMATION_ENABLED` | `true` (for the test) | `true` |

⚠️ **Test and live price IDs are different objects.** Recreating them in live mode is
mandatory — test IDs simply will not resolve against a live key.

### Bot (Pterodactyl panel `.env`)

| Variable | Value |
|---|---|
| `KIRA_VERIFY_SECRET` | **exactly the same** as `TELEGRAM_BOT_VERIFY_SECRET` |
| `KIRA_VERIFY_URL` | `https://<domain>/api/telegram/verify` |

The bot derives `/verify-discount` and `/record-join` from that URL automatically.

---

## 2. Stripe test-mode setup

1. Stripe Dashboard → toggle **Test mode** (top right).
2. **Products** → create *KIRA VIP Membership* with recurring prices:
   - Monthly **USD 70**, Quarterly **USD 189** (every 3 months)
   - Founding Monthly **USD 50**, Founding Quarterly **USD 150**
3. **Coupons** → create **20% off**, forever → copy id into `STRIPE_EARLY_BIRD_COUPON_ID`.
4. **Developers → Webhooks → Add endpoint**
   - URL: `https://<domain>/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`,
     `invoice.paid`, `invoice.payment_failed`, `charge.refunded`,
     `charge.dispute.created`, `charge.dispute.closed`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`.

---

## 3. Deploy

- **Website:** merge/deploy branch `feat/payments-automation`.
- **Bot:** upload to `handlers/` → `accessKey.js`, `joinRecorder.js`, `discountClaim.js`,
  and `index.js` at the root → **Restart**.
- Console should show `Bot username resolved: <yourbot>` with no `MODULE_NOT_FOUND`.

---

## 4. The dry run

Use a **second Telegram account** and a **second email** where possible, so you're
testing a real member's path rather than the owner's.

### 4.1 Loyalty discount (do this before buying)
1. Sign in → `/account/membership`
2. Click **Claim community pricing** → **Open Telegram to verify**
3. Bot should reply **"🎉 Community pricing unlocked"** with your tier and join date
4. Reload the account page → prices now show **USD 50** (founding) or **USD 56** (early bird)

✅ Pass: tier applied automatically, price changed.
❌ *"couldn't find a dated record"* → that Telegram account isn't in the 535-member
registry; use the Early Bird evidence route instead.

### 4.2 Signing
1. Choose a plan → the signing screen appears
2. Confirm: plan, price, renewal wording, four separate checkboxes, document links
3. Try to submit with a box unticked → **must refuse**
4. Fill legal name + country, tick all four → **Confirm and continue to payment**

✅ Pass: cannot proceed without every consent.

### 4.3 Payment
1. Stripe Checkout opens with the **discounted** amount
2. Card `4242 4242 4242 4242`, any future expiry, any CVC, any postcode
3. Pay → redirected to `/checkout/success`

### 4.4 Access key → Telegram
1. `/account/membership` now shows **Active**
2. Click **Link Telegram** → open the access link
3. Bot replies **"✅ Membership verified"** + a **Join KIRA VIP** button
4. Tap it → you're in the VIP group

✅ Pass: single-use link, expires in 15 minutes.

### 4.5 Revocation (do not skip)
1. Stripe → Customers → the test customer → **Cancel subscription immediately**
2. Within a few seconds the bot should **remove that account from the VIP group**
3. `/account/membership` shows cancelled

✅ Pass: access is removed automatically. This is the test people forget.

### 4.6 Evidence check
In Stripe → Developers → Webhooks, every event should be **200**. Any 4xx/5xx means
the signing secret or URL is wrong.

---

## 5. Go-live (1 August)

1. Recreate products/prices/coupon in **live mode**; update all price env vars.
2. Add a **live** webhook endpoint; update `STRIPE_WEBHOOK_SECRET`.
3. Swap `STRIPE_SECRET_KEY` to `sk_live_...`.
4. Set `CHECKOUT_ENABLED=true` and `PAYMENT_AUTOMATION_ENABLED=true`.
5. Redeploy.
6. Buy one real membership yourself, confirm access, then refund it — the only true
   end-to-end proof.

---

## 6. If something goes wrong

- **Turn it off:** set `CHECKOUT_ENABLED=false` and redeploy. Checkout refuses
  immediately; existing members are unaffected.
- **Database:** every migration so far is additive (no drops). Neon branch restore is
  available if ever needed.
- **Bot:** re-upload the previous `index.js` and restart.

---

## Quick reference — what protects you

| Guarantee | Enforced by |
|---|---|
| No payment without a recorded signature | `create-checkout-session` rejects a missing consent id |
| No VIP access without payment **and** signed agreements | `/api/telegram/link` consent gate |
| Access removed on cancel/refund/dispute | Stripe webhook → entitlement → Telegram removal |
| Discount can't be faked | Tier resolved server-side; bot verifies live group membership |
| One Telegram account = one discount | `LegacyMember.claimedByUserId` |
| Copy trading / Academy can't be sold yet | Agreements marked `pending_counsel` (hard block) |
