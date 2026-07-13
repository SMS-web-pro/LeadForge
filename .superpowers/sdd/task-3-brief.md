# Task 3 — Elevate cards with soft shadows, radii, accent tints

**Source:** docs/superpowers/plans/2026-07-12-soft-evolution-redesign.md (Task 3)

## Files
- Modify: `src/lib/ultimateTemplate.ts` — INSERT one consolidated CSS block (do NOT rewrite existing card rules; only add the new elevation rules).

## Interfaces
- Consumes (defined in Task 1): `--r`, `--r-lg`, `--sh-1`, `--sh-2`, `--accent-soft`, `--ease`, `--dur`.
- Produces: consistent soft-card look across services / guarantees / testimonials / contact / about.

## Steps

### Step1: Insert the card-elevation block
In `src/lib/ultimateTemplate.ts`, locate this EXACT existing line:
```css
.svc-link:hover{gap:10px}
```
Immediately AFTER it, insert the following block (before the next `@media(max-width:768px){.svc-grid{grid-template-columns:1fr}...}` line):

```css
/* Soft Evolution card elevation */
.svc-card{border-radius:var(--r-lg);box-shadow:var(--sh-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.svc-card:hover{border-color:color-mix(in srgb,var(--primary) 40%,var(--border));box-shadow:var(--sh-2);transform:translateY(-6px)}
.svc-card-img{transition:transform .6s var(--ease);border-bottom:1px solid var(--border-l)}
.guar-card{border-radius:var(--r-lg);box-shadow:var(--sh-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease)}
.guar-card:hover{transform:translateY(-4px);box-shadow:var(--sh-2)}
.guar-icon{background:var(--accent-soft)}
.test-card{border-radius:var(--r-lg);box-shadow:var(--sh-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease)}
.test-card:hover{box-shadow:var(--sh-2);transform:translateY(-4px)}
.contact-form{border-radius:var(--r-lg);box-shadow:var(--sh-1)}
.about-img{border-radius:var(--r-lg);box-shadow:var(--sh-2)}
.why-stat{border-radius:var(--r);transition:transform var(--dur) var(--ease),background var(--dur) var(--ease)}
.why-stat:hover{transform:translateY(-3px)}
.proc-num{border-radius:50%;transition:all var(--dur) var(--ease)}
.proc-step:hover .proc-num{box-shadow:var(--sh-glow)}
```
IMPORTANT: Do not modify the existing `.svc-card`, `.guar-card`, `.test-card`, `.contact-form`, `.about-img`, `.why-stat`, `.proc-num` rules elsewhere — this block ADDS the elevation on top of them. If any of those selectors already set `border-radius`/`box-shadow`/`transition`, the later-declared rule here wins (CSS cascade), which is intended.

### Step2: Typecheck
Run: `npx tsc --noEmit` (repo root). Expected: 0 errors.

### Step3: Commit
```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): soft shadow/radius elevation on cards"
```

## Global Constraints (binding)
- Single `<h1>` per page (hero only) — no h1 change here.
- All interactive elements: `cursor:pointer`, visible `:focus-visible` ring, hover transition 150–300ms (new card hover transitions use `--dur`=220ms ✓).
- No emoji icons — lucide only.
- Light-mode contrast ≥4.5:1; no neon; no AI purple-pink gradients.
- Responsive 375/768/1024/1440.
- Custom cursor + reveals auto-disabled under reduced-motion / coarse pointer / <768px (later tasks).
- Zero new external dependencies.
- `tsc` must pass.
