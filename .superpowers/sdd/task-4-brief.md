# Task 4 — Reduced-motion hardening + reveal stagger

**Source:** docs/superpowers/plans/2026-07-12-soft-evolution-redesign.md (Task 4)

## Files
- Modify: `src/lib/ultimateTemplate.ts` — REPLACE the existing `.reveal` rules (currently two lines: `.reveal{opacity:0;transform:translateY(35px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)}` followed by `.reveal.active{opacity:1;transform:translateY(0)}`).

## Interfaces
- Consumes (Task 1): `--ease`, `--dur`. Existing `.reveal` / `.reveal.active` and `.reveal-d1/2/3` classes (the HTML already uses `reveal reveal-d${(i % 3) + 1}`).
- Produces: motion-safe reveals; ALL animations disabled under reduced-motion.

## Steps

### Step1: Replace the `.reveal` rules
Find these two lines and REPLACE them with the block below:
OLD:
```css
.reveal{opacity:0;transform:translateY(35px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)}
.reveal.active{opacity:1;transform:translateY(0)}
```
NEW (replace with exactly this):
```css
.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
.reveal.active{opacity:1;transform:translateY(0)}
.reveal-d1{transition-delay:.06s}.reveal-d2{transition-delay:.14s}.reveal-d3{transition-delay:.22s}
@media(prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
  .reveal{opacity:1!important;transform:none!important}
  .hero-mesh{opacity:.8!important}
}
```

### Step2: Typecheck
Run: `npx tsc --noEmit` (repo root). Expected: 0 errors.

### Step3: Commit
```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): reduced-motion hardening + reveal stagger"
```

## Global Constraints (binding)
- Single `<h1>` per page — no h1 change here.
- All interactive elements: `cursor:pointer`, visible `:focus-visible` ring, hover transition 150–300ms.
- No emoji icons — lucide only.
- Light-mode contrast ≥4.5:1; no neon; no AI purple-pink gradients.
- Responsive 375/768/1024/1440.
- Custom cursor + reveals auto-disabled under `prefers-reduced-motion: reduce` OR `pointer: coarse` OR <768px.
- Zero new external dependencies.
- `tsc` must pass.
