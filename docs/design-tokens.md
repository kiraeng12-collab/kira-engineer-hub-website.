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

All motion must respect `prefers-reduced-motion` — the site has no
animation that isn't purely decorative today, so there's nothing to gate yet,
but any new motion added in later design phases must check this media query.

## Z-index scale

| Token | Value | Use |
|---|---|---|
| `--z-header` | `100` | Sticky site header |
| `--z-drawer` | `150` | Reserved for a future standalone Drawer component |
| `--z-skip-link` | `1000` | Skip-to-content link (must sit above the header) |
| `--z-modal` | `2000` | Reserved for a future Modal component |
| `--z-cookie-banner` | `9999` | Cookie consent banner (must sit above everything) |

## Logo usage (Section 21)

Two official marks exist, at different tiers — both are used exactly as
provided, never redrawn, recoloured, or redrawn in CSS/SVG:

1. **Geometric "K + candlestick" mark** (`#ke-market-mark` in
   `components/layout/IconSprite.tsx`) — the Kira Engineer Hub company mark.
   Used via `components/BrandLogo.tsx` (`context="header"` or `"footer"`).
2. **Crowned eagle crest** — the Kira Trading Community / KIRA VIP Channel
   identity, sourced from the original channel-photo PNGs. Used via
   `components/ProductLogo.tsx` (`product="community"` or `"vip"`), which
   renders the pre-optimized 128×128 WebP thumbnails
   (`public/kira-*-channel-thumb.webp`, ~5KB each) rather than the 2.1MB
   originals. The original PNGs remain untouched as masters — regenerate the
   thumbnails from them with `sharp` if the source art ever changes; never
   hand-edit the `-thumb.webp` files directly.

Do not introduce the eagle crest into the site-wide header/nav/footer or the
homepage hero — per owner confirmation, it stays scoped to Community/VIP
product contexts, while the geometric mark remains the whole-site identity.
