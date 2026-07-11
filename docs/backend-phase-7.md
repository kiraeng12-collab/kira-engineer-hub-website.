# Kira Engineer Hub Backend Phase 7: Telegram Membership Onboarding

This phase automates access to the private KIRA VIP Telegram group: a member
with an active subscription links their Telegram account from
`/account/telegram`, receives a single-use group invite link, and is
automatically removed from the group if their membership later lapses. It
degrades the same way as Phases 4-6 - without the Telegram env vars
configured, linking shows a clear "not configured yet" response instead of
crashing, and membership access stays exactly as it was before this phase
(coordinated manually).

## How linking works

1. A member with an active `Membership` clicks **Connect Telegram** on
   `/account/telegram`. `/api/telegram/link` generates a random token,
   stores only its SHA-256 hash on `User.telegramInviteTokenHash` (same
   hash-only pattern as email verification and password reset tokens), and
   returns a `https://t.me/<bot_username>?start=<token>` deep link.
2. The member opens that link in Telegram and presses **Start**, which sends
   a `/start <token>` message to the bot. Telegram delivers that message to
   `/api/telegram/webhook`.
3. The webhook hashes the token, looks up the matching user, and - if the
   token hasn't expired (30 minutes) - records the member's numeric Telegram
   user ID and username on `User`, then calls `createChatInviteLink` for a
   single-use, 15-minute invite link to the private group and sends it back
   to the member as a Telegram message.
4. The member joins the group with that link.

Recording the Telegram user ID at step 3 (before they've joined the group)
is what makes automatic removal possible later - Telegram's Bot API can ban
a user from a chat by ID even if they haven't joined yet, but it needs an ID
either way.

## How automatic removal works

`lib/telegram/membership-sync.ts` exports a pure predicate,
`shouldRevokeTelegramAccess(status)`, true for `cancelled`, `expired`,
`suspended`, `refunded`, and `disputed`. It is deliberately false for
`past_due` - Stripe's Smart Retries give a grace window before a failed
payment becomes a real lapse, and kicking someone over one declined card
charge would be poor UX.

`app/api/stripe/webhook/route.ts` calls `syncTelegramAccessForUser` every
time a membership's status changes. If the new status should revoke access
and the member has a linked (not already removed) Telegram account, the bot
bans then immediately unbans them from the group - a kick, not a permanent
ban, so they can rejoin with a fresh invite link if they resubscribe later.
Telegram API failures here are caught and swallowed rather than failing the
whole Stripe webhook (which would trigger Stripe retries for an unrelated
service being down); they're worth checking manually if `ADMIN_WEBHOOK_URL`
alerts don't show a successful removal.

## Required environment variables

```txt
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
TELEGRAM_GROUP_CHAT_ID=
TELEGRAM_WEBHOOK_SECRET=
```

`DATABASE_URL` (Phase 4) is also required, since linking reads and writes
`User`/`Membership` records.

## Telegram setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram, run `/newbot`,
   and follow the prompts. Save the token it gives you as
   `TELEGRAM_BOT_TOKEN` and the bot's `@username` (without the `@`) as
   `TELEGRAM_BOT_USERNAME`.
2. Create the private VIP Telegram group (or use the existing one) and add
   the bot as an **administrator** with at least the "Invite Users via Link"
   and "Ban Users" permissions - both are required for invite-link creation
   and automatic removal.
3. Get the group's chat ID: temporarily add
   [@getidsbot](https://t.me/getidsbot) (or any similar ID-lookup bot) to the
   group, or check the URL Telegram Web shows when you open the group. Set
   it as `TELEGRAM_GROUP_CHAT_ID` (a negative number for supergroups, e.g.
   `-1001234567890`), then remove the lookup bot if you added one.
4. Generate a strong random value for `TELEGRAM_WEBHOOK_SECRET` (e.g.
   `openssl rand -hex 32`).
5. Register the webhook by calling Telegram's `setWebhook` API once (from
   your machine, not from the app - this is a one-time registration call):

   ```txt
   https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook
     ?url=https://www.kiraengineerhub.com/api/telegram/webhook
     &secret_token=<TELEGRAM_WEBHOOK_SECRET>
     &allowed_updates=["message"]
   ```

   The webhook route checks the `X-Telegram-Bot-Api-Secret-Token` header
   against `TELEGRAM_WEBHOOK_SECRET` on every request - this is Telegram's
   standard webhook authentication mechanism (there is no per-request HMAC
   signature like Stripe's).

## What this phase does not include

- No confirmation that a member actually joined the group after receiving
  their invite link (would require handling `chat_member` updates, which
  aren't currently in `allowed_updates`) - the member record only tracks
  that they were *invited*, not that they joined.
- No self-service "unlink" or "relink to a different Telegram account" flow
  - both go through support for now, same as the "no self-service email
  change" gap noted in Phase 5.
- No automatic restoration of Telegram access when a disputed charge is
  later resolved in the member's favor (`charge.dispute.closed` with
  `status: "won"` reactivates the `Membership`, but does not re-invite a
  previously removed member) - they can generate a fresh invite link from
  `/account/telegram` once their membership shows active again.
- No admin-side manual override (force-link, force-remove) - that's Section
  37 (Administration) in the original brief, not built yet.

## Known limitation

Like Phases 4-6, live end-to-end Telegram linking and removal cannot be
tested in this environment without a real bot token and group - the code
has been verified via lint/typecheck/build and by exercising the
graceful-fallback (not-configured) paths live, and the pure
`shouldRevokeTelegramAccess` status logic is unit tested. Test the full
link → join → cancel → auto-remove flow with a real bot and a disposable
test group in staging before relying on it in production.
