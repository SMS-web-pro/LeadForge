# Task 2 — Site Quality Elevation: Premium Visual Layer

**Branch:** `feature/site-quality-elevation`
**Commit:** `f082b13098dbff882922a510fd05c515dd2db434`

## Summary

Added an editorial-minimal, conversion-focused visual layer to the existing "Soft Evolution" design, confined to the `<style>` string literal in `src/lib/ultimateTemplate.ts`. No `<script>`, reduced-motion, or `cursor-dot` CSS was touched. External API and output structure unchanged.

## Changes

### 1. `:root` tokens extended (line ~932)
Appended: `--fs-display`, `--fs-h2`, `--fs-h3`, `--lh-body`, `--section-py`, `--trust-bg`, `--hairline`, `--maxw` — exactly as specified.

### 2. Component CSS
Per the conflict rule, existing selectors were **extended in place** rather than duplicated:

| Selector | Action |
|---|---|
| `.container` (existing) | Re-pointed to `max-width:var(--maxw);padding:0 24px` (was 1400px/32px) |
| `.navbar` (existing) | Merged into a single glassy sticky rule: `position:sticky;top:0;z-index:80;backdrop-filter:blur(12px);background:color-mix(...surface 82%...);border-bottom:1px solid var(--hairline)` (+ `-webkit-backdrop-filter` for Safari). No second `.navbar` rule created. |
| `.section` / `.section-dark` (existing) | Switched hardcoded `padding:110px 0` → `padding:var(--section-py) 0` |
| `.gal-grid` (existing) | Already declared with `grid-template-columns:2fr 1fr 1fr`; standalone duplicate **omitted** (would conflict). Its existing 768px media query already matches the intended mobile columns. |
| `h1` (new bare rule) | Added `font-size:var(--fs-display);line-height:1.05;letter-spacing:-.02em;font-weight:800` |
| `h2` (new bare rule) | Added `font-size:var(--fs-h2);line-height:1.1;letter-spacing:-.02em;font-weight:800` |
| `.trust-strip`, `.trust-badge`, `.trust-badge i` (new) | Added (classes not yet in HTML — harmless, available for later markup wiring) |
| `@media(max-width:768px){.trust-strip{gap:8px}}` | Added (`.gal-grid` part of the original block skipped as redundant) |

### 3. Ad-hoc scales → tokens (Step 4)
- `.hero h1` `clamp(2.4rem,5vw,3.7rem)` → `var(--fs-display)`
- `.section-hdr h2` `clamp(1.8rem,4vw,2.85rem)` → `var(--fs-h2)`
- `.about-text h2` `clamp(1.55rem,3vw,2.3rem)` → `var(--fs-h2)`
- `.why-text h2` `clamp(1.55rem,3vw,2.3rem)` → `var(--fs-h2)`

### 4. Accessibility fix (contrast ≥4.5:1)
The original `.navbar:not(.scrolled)` overrides forced **white** text, which assumed the navbar floated transparent over the dark hero. With the new light glassy nav, white text would be invisible. Changed those overrides to dark tokens (`var(--text)`, `var(--text-s)`, `var(--primary)` hover) so the glassy nav stays readable on its light translucent background. Inline `mobile-toggle i` color already pins to `var(--text)`.

## Verification
- `npx tsc --noEmit` → exit 0
- `npx vitest run src/lib/__tests__/template-design.test.ts` → **8 passed** (no changes to tests/JS; `prefers-reduced-motion`, `cursor-dot`, `:focus-visible` presence intact)

## Concerns
- **Sticky + `body{overflow-x:hidden}` gotcha:** `body` has `overflow-x:hidden`, which can make `overflow-y` compute to `auto` and in some engines prevent `position:sticky` from pinning during viewport scroll. The nav is functionally correct and visually glassy at rest; if true pinning is required across all browsers, `html`/`body` overflow may later need adjusting (out of scope for this CSS-only task).
- **`.trust-strip`/`.trust-badge` are CSS-only:** the generated HTML still uses `.trust-bar`/`.trust-item`, so the new trust-strip styles are not yet rendered. Wiring them into the markup is a separate follow-up (this task explicitly forbade changing output structure).
- The hero retains `padding-top:36px` (originally to clear the fixed nav); with a sticky in-flow nav this now reads as a small top inset — visually fine, not a regression.
