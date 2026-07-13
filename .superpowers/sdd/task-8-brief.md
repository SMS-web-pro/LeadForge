# Task 8 — Regenerate test sites + full verification

**Context:** All redesign (Tasks 1–5) + Rapport content fixes (R1–R4) + eyebrows (Task 6) + acceptance test (Task 7) are done and reviewed. This task regenerates the two sample sites, runs the full typecheck + test suite, and spot-checks the generated HTML for the key design invariants.

**Files**
- Run: `test-site-gen.mts` (regenerates `test-electricien-paris.html`, `test-plombier-lyon.html`).
- Possible commit: the regenerated HTML files if they changed.

## Steps

### Step1: Typecheck
Run: `npx tsc --noEmit` (repo root). Expected: 0 errors.

### Step2: Run the full test suite
Run: `npx vitest run` (repo root). Expected: ALL tests pass (including `template-design.test.ts` 8/8 and existing `validation.test.ts`).

### Step3: Regenerate both test sites
Run: `npx tsx test-site-gen.mts` (or `node --import tsx test-site-gen.mts`) from repo root.
Expected: both HTML files written; console logs show `hasReveal:true`, `noUndefined:true`, `noNaN:true`, and hero image `src` starting with `https://`.

### Step4: Spot-check generated HTML for invariants
Run (PowerShell):
```powershell
Select-String -Path test-electricien-paris.html -Pattern 'prefers-reduced-motion|cursor-dot|:focus-visible|class="reveal|hero-mesh|form-check|getStats' | Select-Object -First 12
```
Expected: matches for each pattern (note `getStats` appears in the JS template source only if referenced — instead confirm `Avis en attente` OR real testimonials, and confirm `cta-banner` is ABSENT). Also run:
```powershell
Select-String -Path test-electricien-paris.html -Pattern 'cta-banner|getSectorFallbackReviews|Marie'
```
Expected: NO matches.

### Step5: Commit regenerated files (only if changed)
If the HTML files changed, commit them:
```bash
git add test-electricien-paris.html test-plombier-lyon.html
git commit -m "chore: regenerate test sites with Soft Evolution design + Rapport fixes"
```
If they did not change, skip the commit.

## Global Constraints (binding)
- `tsc` must pass; full vitest suite must pass.
- Generated HTML must have no `undefined`/`NaN`, no `cta-banner`, no fake-review names, single `<h1>`, reduced-motion + guarded cursor present.
- Zero new external dependencies.
