# Task 1 — Design-token layer in `:root` + base layer

**Source:** docs/superpowers/plans/2026-07-12-soft-evolution-redesign.md (Task 1)

## Files
- Modify: `src/lib/ultimateTemplate.ts:837` (the `:root{...}` block — a single line)
- Modify: `src/lib/ultimateTemplate.ts:838-842` (base reset / body / headings)

## Interfaces
- Consumes: existing tokens `--primary`, `--primary-rgb`, `--secondary`, `--accent`, `--accent-dark`, `--bg`, `--surface`, `--text`, `--text-s`, `--text-t`, `--border`, `--border-l`, `--dark`, `--dark-rgb` (already defined in the current `:root`).
- Produces: new tokens `--r-sm`, `--r`, `--r-lg`, `--r-xl`, `--sh-1`, `--sh-2`, `--sh-glow`, `--accent-soft`, `--ease`, `--dur` used by all later tasks.

## Steps

### Step 1: Expand the `:root` block
Replace the ENTIRE single `:root{...}` line (currently line 837) with this exact content (the `${...}` are template-literal interpolations already present in the file — keep them verbatim; only append the new tokens at the end before the closing `}`):

```
:root{--primary:${primaryColor};--primary-rgb:${primaryRgb};--secondary:${secondaryColor};--accent:${accentColor};--accent-dark:${accentOnDark};--bg:#f7f8fb;--surface:#fff;--text:#161a2b;--text-s:#51566e;--text-t:#868aa3;--border:#e6e8f0;--border-l:#f1f2f7;--dark:#16203c;--dark-rgb:22,32,60;--deco-rotation:${decoRotation}deg;--deco-scale:${decoScale};--accent-opacity:${accentOpacity};--section-shape:${sectionShape};--r-sm:10px;--r:16px;--r-lg:24px;--r-xl:32px;--sh-1:0 1px 2px rgba(16,24,40,.04),0 6px 20px rgba(16,24,40,.06);--sh-2:0 8px 24px rgba(16,24,40,.10),0 18px 48px rgba(16,24,40,.10);--sh-glow:0 14px 44px rgba(var(--primary-rgb),.28);--accent-soft:color-mix(in srgb,var(--accent) 9%,#fff);--ease:cubic-bezier(.22,1,.36,1);--dur:220ms}
```

(Note: `--bg` was `#fafaf9`, change it to `#f7f8fb`; `--text` was `#1a1a2e` → `#161a2b`; `--text-s` was `#555770` → `#51566e`; `--text-t` was `#8b8da3` → `#868aa3`; `--border` was `#e8e8ef` → `#e6e8f0`; `--border-l` was `#f2f2f7` → `#f1f2f7`; `--dark` was `#1a2744` → `#16203c`; `--dark-rgb` was `26,39,68` → `22,32,60`. The rest stays identical.)

### Step 2: Add base layer rules
After the `h1,h2,h3,h4,h5{...}` line (currently line 842), append these three declarations (they are additional top-level CSS rules, NOT inside the `h1...` rule):

```css
a,button,[role="button"]{cursor:pointer}
:focus-visible{outline:2px solid var(--primary);outline-offset:3px;border-radius:4px}
::selection{background:color-mix(in srgb,var(--accent) 22%,#fff);color:var(--text)}
```

(The existing `img{max-width:100%;height:auto;display:block}` line already exists right after — do not duplicate it.)

### Step 3: Typecheck
Run: `npx tsc --noEmit`
Expected: no errors (CSS lives inside a JS template string, so this just confirms the surrounding TypeScript still compiles).

### Step 4: Commit
```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): add Soft Evolution design tokens + base a11y layer"
```

## Global Constraints (binding for every task)
- Single `<h1>` per generated page (keep hero only).
- All interactive elements: `cursor:pointer`, visible `:focus-visible` ring, hover transition 150–300ms.
- No emoji icons — lucide (`data-lucide`) only.
- Light-mode text/CTA contrast ≥ 4.5:1; no neon; no AI purple-pink gradients.
- Responsive at 375 / 768 / 1024 / 1440.
- Custom cursor + scroll reveals: auto-disabled when `prefers-reduced-motion: reduce` OR `pointer: coarse` (touch) OR viewport < 768px.
- Zero new external dependencies; keep `sectorConfig`-driven dynamic copy (no hardcoded sector strings).
- `tsc` must pass; regenerate both test sites after changes.
