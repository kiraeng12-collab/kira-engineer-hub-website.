# Kira Engineer Hub Design Tokens

Source of truth: `app/globals.css` (`:root`). Every colour, radius, shadow,
z-index, and motion value used anywhere in the app should reference one of
these custom properties — nothing should hardcode a hex value, a z-index
number, or a duration directly in a component. If you need a new value,
add a token here first.

## Colour

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B1118` | Page background (obsidian) |
| `--bg-soft` | `#080d13` | Slightly darker background variant |
| `--surface` | `#151C24` | Card/panel surfaces |
| `--surface-2` | `#101820` | Secondary elevated surface |
| `--ink` | `#EDF1F4` | Primary text |
| `--stone` | `#c7ccd2` | Secondary light text |
| `--muted` | `#98A2AE` | Muted/supporting text |
| `--border` | `#29323D` | Borders, dividers |
| `--cyan` | `#2BB6A8` | Primary brand accent |
| `--cyan-dark` | `#169A8E` | Primary accent, darker |
| `--aqua` | `#6FE0D2` | Bright accent / highlights |
| `--success` | `#3DBA83` | Success state |
| `--warning` | `#6FE0D2` | Warning state |
| `--danger` | `#DF6471` | Error state |
| `--gold` | `#C9A24A` | Restrained secondary accent (see below) |
| `--gold-soft` | `rgba(201,162,74,.14)` | Gold background tint |
| `--viz-green` / `--viz-red` | `#4f8d65` / `#a84f4a` | Muted tones for the hero's decorative chart illustration only — deliberately desaturated so they're never confused with real `--success`/`--danger` states |

**Gold usage rule:** gold is sampled from the existing, approved Kira Trading
Community / KIRA VIP Channel eagle crest artwork — it is not a new brand
colour. Use it narrowly (Early Bird badge, a premium framing detail near the
crest images) and never as a primary UI colour or a replacement for teal.

## Typography

- Display/body face: **Sora** (400–800), loaded via `next/font/google` in
  `app/layout.tsx` — self-hosted, no runtime request to Google.
- Utility face for data/status/reference labels: `--font-mono` (system
  monospace stack — no new webfont, narrow use only, per Section 6 of the
  brief).

## Layout

| Token | Value |
|---|---|
| `--container` | `1200px` max content width |
| `--header-height` | `124px` — used by the mobile nav panel's `inset` |
| `--radius` | `8px` |
| `--radius-sm` | `6px` |
| `--shadow` | `0 24px 60px rgba(0,0,0,.36)` |

Doc-style pages (`.doc-page`, in `app/doc-page.css`) use a narrower `min(980px, calc(100% - 40px))` reading width — intentionally different from `--container` since they're long-form text, not full sections.

## Motion

| Token | Value |
|---|---|
| `--ease` | `180ms ease` |
| `--duration-fast` | `120ms` |
| `--duration-base` | `220ms` |
| `--focus` | `0 0 0 3px rgba(43,182,168,.34)` — visible keyboard focus ring |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` — scroll-reveal easing |
| `--duration-slow` | `420ms` — scroll-reveal transition duration |
| `--stagger-step` | `60ms` — per-item delay multiplier for staggered reveals |

All motion respects `prefers-reduced-motion: reduce`: the global override
zeroes both `transition-duration` and `transition-delay` (not just duration -
a staggered reveal with only duration zeroed would still show a visible
delay before snapping in). The only looping animations on the site are the
`RevealOnScroll`-driven scroll reveals (KIRA method steps, company timeline -
one-time, not repeating) and the Project 242 mark's ambient pulse glow,
which only runs under `prefers-reduced-motion: no-preference`.

**No 3D library is used anywhere in the app** (confirmed via `package.json`
audit and an explicit owner decision) - all "depth" and motion in the
redesign (KIRA Decision Engine, the interactive ecosystem map, the method
scroll-story, the Project 242 glow) is CSS/SVG only. This means there is no
3D-specific fallback path to build or maintain; the non-3D "fallback" is the
only implementation.

**Touch targets:** standalone interactive controls (tabs, toggle buttons)
target a 44x44px minimum hit area. Inline text links (footer navigation,
in-paragraph links) are exempt per WCAG 2.5.8's inline-text-target
exception and are intentionally left at normal line-height.

## Z-index scale

| Token | Value | Use |
|---|---|---|
| `--z-header` | `100` | Sticky site header |
| `--z-drawer` | `150` | Reserved for a future standalone Drawer component |
| `--z-skip-link` | `1000` | Skip-to-content link (must sit above the header) |
| `--z-modal` | `2000` | Reserved for a future Modal component |
| `--z-cookie-banner` | `9999` | Cookie consent banner (must sit above everything) |

## Logo usage (Section 21, updated for the visual redesign)

Official marks are used exactly as provided by the owner, never redrawn,
recoloured, or cropped:

1. **Kira Engineer Hub wordmark** (`public/kira-engineer-hub-wordmark.png`,
   transparent PNG) — the real official company lockup (icon + "KIRA
   ENGINEER HUB" + "TRADING EDUCATION TECH"), provided by the owner. Used via
   `components/BrandLogo.tsx` (`context="header"` or `"footer"`, sized via
   CSS only - same source file both places). This replaced an earlier
   placeholder: a hand-drawn "K + candlestick" SVG (`#ke-market-mark` in
   `components/layout/IconSprite.tsx`) built during Phase 2 of the original
   backend/content work because no official file existed yet at the time.
   That SVG symbol definition is left in `IconSprite.tsx` unused for now
   rather than deleted, in case it's needed again.
2. **Crowned eagle crest** — the Kira Trading Community / KIRA VIP Channel
   identity, sourced from the original channel-photo PNGs. Used via
   `components/ProductLogo.tsx` (`product="community"` or `"vip"`), which
   renders the pre-optimized 128×128 WebP thumbnails
   (`public/kira-*-channel-thumb.webp`, ~5KB each) rather than the 2.1MB
   originals. The original PNGs remain untouched as masters — regenerate the
   thumbnails from them with `sharp` if the source art ever changes; never
   hand-edit the `-thumb.webp` files directly.
3. **KIRA Academy crest** (`product="academy"`) — shield/graduation-cap mark
   with laurel wreath, provided by the owner
   (`public/kira-academy.png` master, `-thumb.webp` rendered version). Wired
   into `/ecosystem` and the homepage "Choose Your KIRA Path" section.
4. **Project 242 mark** (`product="project242"`) — an intentionally abstract
   orbit/diamond icon (`public/project-242-mark.png` master). Reveals no
   methodology or internal detail, so it's safe to display even under the
   "no hints yet" restriction on Project 242 content. Wired into
   `/ecosystem` and "Choose Your KIRA Path".
5. **KIRA Community Bot, KIRA VIP Group, KIRA Trading Channel** — provided
   by the owner (`public/kira-bot.png`, `public/kira-vip-group.png`,
   `public/kira-trading-channel.png` masters, all with `-thumb.webp`
   renders; `ProductLogo` names `"bot"`, `"vipGroup"`, `"tradingChannel"`).
   Wired into the homepage's interactive ecosystem map
   (`components/home/EcosystemMap.tsx`, replacing the old static
   `#ecosystem` card grid) as expandable Telegram sub-touchpoints beneath
   Kira Trading Community (Trading Channel) and KIRA VIP Membership (VIP
   Group, Bot) - this reflects the real product structure already live at
   `/account/telegram`, not illustrative data.

Do not introduce the eagle crest into the site-wide header/nav/footer or the
homepage hero — per owner confirmation, it stays scoped to Community/VIP
product contexts, while the wordmark remains the whole-site identity.

**Still missing (no file provided yet):** KIRA Partner Program.
