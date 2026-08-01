---
name: GRABBER POS Studio
description: Operate-mode POS and back-office — mint accent on deep green-charcoal
colors:
  surface-0: "oklch(15% 0.014 165)"
  surface-1: "oklch(19% 0.016 165)"
  surface-2: "oklch(23% 0.018 165)"
  surface-3: "oklch(28% 0.02 165)"
  line: "oklch(34% 0.022 165)"
  text-strong: "oklch(97% 0.006 95)"
  text-body: "oklch(84% 0.012 95)"
  text-dim: "oklch(64% 0.014 165)"
  accent: "oklch(78% 0.15 155)"
  accent-strong: "oklch(68% 0.16 155)"
  accent-ink: "oklch(18% 0.04 155)"
  warn: "oklch(80% 0.14 85)"
  danger: "oklch(66% 0.2 25)"
  info: "oklch(72% 0.11 230)"
  glow-cool: "oklch(45% 0.08 230 / 0.12)"
  print-bg: "#ffffff"
typography:
  body:
    fontFamily: "DM Sans, ui-sans-serif, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.011em"
  heading:
    fontFamily: "DM Sans, ui-sans-serif, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  panel:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.lg}"
---

# Design System — GRABBER POS Studio

## 1. Purpose

Operate-mode UI for cashiers and managers. Familiar POS density, calm dark surfaces for shop lighting, mint accent only for primary actions and live state. Authenticated screens prioritize task speed; `/welcome` and `/login` may carry more brand presence.

## 2. Color

- **Surfaces:** `surface-0` page → `surface-1` panels → `surface-2` inputs → `surface-3` chips. Borders use `line`.
- **Text:** `text-strong` titles, `text-body` content, `text-dim` meta. Never gray-on-gray that fails 4.5:1.
- **Accent:** mint for primary CTA, selected nav, in-stock/positive totals. Do not wash inactive tiles in accent.
- **Semantics:** `warn` upgrade/licence, `danger` errors/destructive, `info` neutral metrics.
- Ambient radial glow on `surface-0` is allowed once globally; do not stack glow inside every card.

## 3. Typography

- Single family **DM Sans** for UI; **JetBrains Mono** for money, barcodes, IDs.
- Scale ~1.15: 12 / 14 / 16 / 20 / 24 / 30. Headings semibold, tracking ≤ −0.02em.
- Uppercase labels only for tiny section tags (tracking ~0.12–0.14em); never as page eyebrows above an h1.

## 4. Layout

- Page max width **72rem** (`max-w-6xl`) for back office; POS uses full viewport under the 3.5rem top bar.
- Module screens: header row → search/filters → content. Gap 16–24px between groups.
- POS: catalog flex-1 + bill panel fixed ~24rem; stack on narrow viewports.
- Touch targets ≥ 36px height on primary actions.

## 5. Components

- **Primary button:** accent fill, accent-ink text, 12px radius, hover → accent-strong, disabled 60% opacity.
- **Ghost / secondary:** line border, dim text, hover border-accent.
- **Inputs:** surface-2 fill, line border, focus border-accent; labels above fields.
- **Tiles (launcher):** letter mark in accent tint, not emoji as structure; dashed border when locked/soon.
- **Tables:** surface-1 panel, divider rows, hover surface-2; actions right-aligned ghost buttons.
- **Empty states:** dashed panel + one sentence + primary action (Add / Open terminal).
- **Loading:** skeleton bars preferred over centered spinner text for lists/grids.
- **Modals:** dim backdrop, spring 360/30; prefer dialogs only for create/edit forms.

## 6. Motion

- 150–250ms ease-out for hover/focus reveals.
- Page transitions and staggered grids allowed; respect `prefers-reduced-motion`.
- No endless entrance choreography on Operate screens.

## 7. Do / Don't

**Do**
- Use semantic tokens from `globals.css` / `@theme`.
- Keep cashier path scannable: search, categories, product card, bill total.
- Match ModuleHeader + TopBar patterns on every module.

**Don't**
- Purple-indigo marketing gradients inside the authenticated app.
- Emoji as the only visual system for tiles.
- Cards nested in cards; zero-offset neon glow shadows.
- `outline: none` without a focus-visible replacement.
