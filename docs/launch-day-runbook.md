# KIRA Engineer Hub — Launch-Day Runbook
**Go-live: 1 August 2026, 7:10 PM Jordan time (UTC+3).**
One ordered checklist. Everything the website + bot need, in sequence.

---

## A. Deploy the website (do this first — carries all fixes)
The branch `feat/lot-sizing-calculator` contains every website change, verified
(tsc clean, 240 tests, production build passes):
- Launch gate — checkout opens itself at 1 Aug 7:10 PM (members see "launching
  Aug 1" until then; nobody can be charged early).
- Founding quarterly **$140**.
- Owner expiry alerts (instant DM on a lapse) + daily "expiring in 3 days" digest.
- **Form / checkout fix** — forms + checkout no longer dump raw JSON after a
  client-side navigation (Early Bird eligibility, contact, support, checkout…).
- env.example completed (previously-missing critical vars documented).

**Deploy:** push / merge the branch to the production branch → Vercel builds it.

**Set these Vercel Production env vars:**
- `TELEGRAM_OWNER_CHAT_ID=7333760455` (turns on your expiry alerts)
- `LAUNCH_AT` → leave **UNSET** (code default = 1 Aug 7:10 PM Jordan)
- Confirm already set: `CHECKOUT_ENABLED=true`, `PAYMENT_AUTOMATION_ENABLED=true`,
  `TELEGRAM_BOT_VERIFY_SECRET` (must equal the bot's `KIRA_VERIFY_SECRET`),
  `DATABASE_URL`, `NEXTAUTH_SECRET`, Telegram + Resend vars.

---

## B. Jul 31 — Stripe LIVE (dashboard; owner only)
1. Put the **live** secret key in `STRIPE_SECRET_KEY` (Vercel).
2. Run `node scripts/stripe-setup.js` against the live account → creates the 6
   live Prices (incl. **$140** founding quarterly). Put each price id in its env
   var (`STRIPE_PRICE_KIRA_VIP_*`). ⚠️ If a $150 founding price already exists,
   create a fresh **$140** one and point `STRIPE_PRICE_KIRA_VIP_QUARTERLY_FOUNDING`
   at it (Stripe prices are immutable).
3. Add the live webhook endpoint `https://www.kiraengineerhub.com/api/stripe/webhook`
   → put its signing secret in `STRIPE_WEBHOOK_SECRET`.
4. **Verify:** `node scripts/check-launch-setup.js` → every line green.

---

## C. Before Aug 1 — Crypto (NOWPayments; dashboard; owner only)
1. `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` (Vercel).
2. IPN callback in NOWPayments → `https://www.kiraengineerhub.com/api/crypto/webhook`.
3. Enable **USDT-TRC20**; whitelist the Trust Wallet payout address.
4. `CRYPTO_CHECKOUT_ENABLED=true`. (The launch gate still keeps it closed until
   1 Aug 7:10 PM.)

---

## D. Bot / Telegram (owner)
1. Replace `assets/brand/vip-channel.png` with the real KIRA VIP Channel logo →
   re-upload to Pterodactyl (zip → unarchive → restart).
2. Bot must be **admin with Change info + Pin + Manage topics** in the VIP group
   and Community group; and admin (Change info) on both channels.
3. **BotFather:** `/setname` → "KIRA AI Manager"; `/setuserpic` → the emblem.
4. Delete the redundant **"VIP CHANNEL RULES"** topic (long-press → Delete).
5. Confirm the bot has `KIRA_VERIFY_SECRET` (== website `TELEGRAM_BOT_VERIFY_SECRET`).
6. (Optional) re-upload the bot for the tiny `/launch` regex tidy — `/launch`
   already works without it.

---

## E. 1 Aug, 7:10 PM Jordan — GO LIVE
1. The bot **DMs you the launch button** automatically. Tap **🚀 Reveal**.
   → Icons, descriptions, topic renames, announcements, and the v.2 cards all
   flip at once. Report ✅/❌ comes back to you.
2. The **website checkout opens itself** the same instant (launch gate).
3. **Smoke test:** buy one plan with a real card → confirm the access key → open
   the bot → confirm it adds you to the VIP group + channel → refund the test
   purchase in Stripe.

---

## F. Post-launch (first days)
1. Send the **re-subscribe message** to migrated members (July batch first) —
   `docs/marketing/continue-membership-message.md` + `send-list.csv`.
2. Cancel the **62 duplicate** DAFFAR subs (and the rest at period end).
3. Wipe any test-era rows: `node scripts/reset-test-payment-data.js`.
4. Watch for the **owner expiry alerts** to start flowing as renewals occur.

---

### Rollback notes
- Website: redeploy the previous Vercel build.
- Checkout: set `CHECKOUT_ENABLED=false` (closes it immediately on next request).
- Bot branding: re-set chat photos by hand if needed (Reveal is not auto-reversible).
