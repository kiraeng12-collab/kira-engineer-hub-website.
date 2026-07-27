# KIRA Lot Sizing Calculator

Risk-first position-size calculator for the website and the Telegram Mini App.
"Powered by Project 242 Risk Technology" (branding only — no Project 242
behaviour is built). Core principle: **risk sizes the position; leverage only
checks margin.** It always rounds down and can return **No Safe Position
Available** rather than force a number.

## Where things live

| Layer | Path |
| --- | --- |
| Pure engine (framework-free, decimal.js) | `lib/lot-sizing-engine/` — `calculateKiraLotSize(input)` |
| Risk modes + engine tunables (admin config) | `lib/config/risk-modes.ts` |
| Instrument specs (17 priority instruments) | `lib/config/instruments.ts` |
| Calculate + metadata API | `app/api/tools/lot-size/route.ts` |
| VIP profiles / history API | `app/api/tools/lot-size/{profiles,history}/` |
| Request parsing / access resolution | `lib/tools/lot-size-request.ts`, `lib/tools/resolve-caller.ts`, `lib/tools/vip-guard.ts` |
| VIP persistence + Project 242 event seam | `lib/tools/lot-size-store.ts`, `lib/tools/project242-events.ts` |
| Telegram initData verify / signal tokens | `lib/telegram/init-data.ts`, `lib/tools/signal-prefill.ts` |
| Website page | `app/tools/lot-sizing-calculator/` |
| Telegram Mini App page | `app/tools/lot-sizing-calculator/telegram/` |
| UI components | `components/tools/` |

## Access model

- **Free** — no account needed: one calculation, all instruments and risk modes,
  full stress-tested result and No-Trade handling. Not persisted.
- **VIP** — `vip_telegram` entitlement (the app's existing source of truth):
  saved account profiles, calculation history, multiple entries, signal prefill.

VIP status is always resolved server-side from the entitlement, via a website
session **or** a verified Telegram `initData` header — never from the request
body.

## Launch plan: Telegram first, website later

The calculator launches inside Telegram only. The website page
(`/tools/lot-sizing-calculator`) is built and works but is `noindex` and not
linked from any nav/footer — it is reachable only by direct URL until the public
website launch.

Two Telegram entry points, both pointing at the Mini App page
`/tools/lot-sizing-calculator/telegram`:

### 1. Bot menu button (opens the blank calculator)
After the site is deployed, register the bot's menu button:
```bash
node scripts/set-lotsize-menu-button.js          # set it
node scripts/set-lotsize-menu-button.js --show   # inspect current button
node scripts/set-lotsize-menu-button.js --reset  # restore default menu
```
Uses `TELEGRAM_BOT_TOKEN`; URL override via `LOTSIZE_MINIAPP_URL`. Telegram needs
a public HTTPS URL, so run this against production, not localhost.

### 2. "Calculate My Lot Size" signal button (prefilled)
In the bot's signal-posting code, build the button URL with the helper:
```ts
import { buildSignalCalculatorUrl } from "@/lib/tools/signal-prefill";

const url = buildSignalCalculatorUrl(
  { signalId: "KIRA-XAUUSD-2026-001", instrument: "XAUUSD", direction: "BUY",
    entryType: "RANGE", entryMinimum: 4050, entryMaximum: 4055, stopLoss: 4038 },
  process.env.LOTSIZE_SIGNAL_SECRET,
);
// inline keyboard button, in a private chat:
// { text: "📊 Calculate My Lot Size", web_app: { url } }
```
The page verifies the signed token, uses the **worst-case** entry in a range,
and warns to confirm the live price. Expired/tampered links are ignored with a
notice.

## Deploy steps (owner actions)

1. **Apply the migration** to Neon (drafted, not run per your instruction):
   ```bash
   npx prisma migrate deploy
   ```
   It applies `prisma/migrations/20260727000000_lot_sizing_calculator/` — two new
   tables (`TradingAccountProfile`, `LotSizeCalculation`). Until it runs, the
   calculator works fully in stateless mode; VIP save/history degrade gracefully
   (return empty) instead of erroring.

2. **Set `LOTSIZE_SIGNAL_SECRET`** (see `env.example`) — same value the bot signs
   signal buttons with. Only needed for prefilled signal links.

3. `TELEGRAM_BOT_TOKEN` is already configured; the Mini App reuses it to verify
   `initData`, and `set-lotsize-menu-button.js` uses it to register the button.

## Admin configuration

No public admin route (per repo policy). Edit `lib/config/risk-modes.ts` and
`lib/config/instruments.ts`, bump the `*_VERSION` constant, and every stored
calculation records which version it used.

## Tests

`npm test` — the engine has per-instrument normal/caution/no-trade coverage plus
validation, currency, margin, rounding, multi-entry, initData, and signal-token
tests.
```
npx vitest run lib/lot-sizing-engine lib/tools lib/telegram/init-data.test.ts
```
