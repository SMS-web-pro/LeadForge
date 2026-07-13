# Task 8 — Verification Report

Date: 2026-07-13
Repo: LeadForge_pro (head c7ab5a6a)

## Step 1 — Typecheck (`npx tsc --noEmit`)
Result: **0 errors** (clean). No output emitted. ✅

## Step 2 — Test suite (`npx vitest run`)

NOTE: The repo had no vitest config. Raw `npx vitest run` failed to even collect
the jest-style unit tests (`describe is not defined`) and errored on the
Playwright e2e specs in `tests/e2e/*.spec.ts`. I added a minimal, dependency-free
`vitest.config.ts` (globals:true, environment:node, exclude tests/e2e) so the
unit suite can be collected correctly. This file is **NOT committed** (Step 5
only commits the HTML files).

With that config, results:
- `src/lib/__tests__/template-design.test.ts`: **8/8 passed** ✅
- `src/lib/__tests__/validation.test.ts`: 24 passed / **7 failed**
- `src/__tests__/basic.test.ts`: 1 passed / **1 failed**
- Total: 33 passed / 8 failed across 3 files.

The 8 failures are in **pre-existing jest-style security tests** that are
unrelated to the redesign (Tasks 1–7). They are internally inconsistent and
cannot all be satisfied by any single implementation — e.g. `sanitizeInput`
is asserted to (a) keep `<img ...>` internals (`testimg src=...`) yet (b) fully
strip `<div>`/`</div>` (→ `testcontent`) and (c) fully strip `<script>` blocks
(→ `alert(...)`), which is mutually contradictory. Other failures:
`validateEmail('test..test@example.com')` returns true (test expects false),
`validateApiKey('a'.repeat(250))` returns true (test expects false),
`sanitizeSerperKey('invalid123')` returns the key (test expects null),
`escapeHtml(123)` returns '' (test expects '123'). These are upstream test/impl
mismatches, out of scope for a regenerate+verify task.

## Step 3 — Regenerate test sites (`npx tsx test-site-gen.mts`)
Both files written: `test-electricien-paris.html` (72232 bytes),
`test-plombier-lyon.html` (72069 bytes).
- `noUndefined: true` ✅
- `noNaN: true` ✅
- Hero image `src` starts with `https://` ✅ (wsrv.nl proxy of unsplash)
- `hasReveal: false` in the generator's literal check (see Step 4 nuance).

## Step 4 — Spot-check `test-electricien-paris.html`

PRESENCE patterns (`prefers-reduced-motion|cursor-dot|:focus-visible|class="reveal|hero-mesh|form-check|getStats`):
- `:focus-visible` ✅ (lines 34, 397)
- `hero-mesh` ✅ (lines 64, 321)
- `form-check` ✅ (lines 262-264)
- `cursor-dot` ✅ (lines 310-313, guarded by `prefers-reduced-motion`/`pointer:coarse` media query)
- `prefers-reduced-motion` ✅ (lines 313, 318)
- `class="reveal` ⚠️ literal string **NOT found**, BUT the reveal mechanism IS
  present: `<div class="section-hdr reveal">` (line 499) and `.reveal`/`.reveal.active`
  CSS (lines 315-320). The generator check `html.includes('class="reveal')` is a
  false negative because `reveal` is emitted as a *secondary* class
  (`class="section-hdr reveal"`), not the first class. Substantively present.

ABSENCE patterns (`cta-banner|getSectorFallbackReviews|Marie`):
- `getSectorFallbackReviews` ✅ absent
- `Marie` ✅ absent
- `cta-banner` ⚠️ **PRESENT** as dead CSS only (`.cta-banner{...}` rules at
  lines 241-248 and 326-328). No element with `class="cta-banner"` is rendered
  (the CTA banner section was dropped). The leftover CSS still trips the literal
  string check. Substantively the banner is gone; only orphaned CSS remains.

## Step 5 — Commit
The two HTML files changed (192 lines each). Committed with the exact prescribed
message (see commit hash below). `vitest.config.ts` left uncommitted.

## Concerns
1. **vitest full suite does not pass**: 8 failures in pre-existing, internally
   inconsistent `validation.test.ts`/`basic.test.ts` security tests, unrelated
   to Tasks 1–7. Out of scope to fix here; flagged for upstream resolution.
2. **`cta-banner` string present**: only orphaned CSS remains (no rendered
   element). To fully satisfy "no cta-banner", the dead `.cta-banner` CSS should
   be removed from `src/lib/ultimateTemplate.ts`.
3. **`class="reveal` literal check false negative**: reveal is implemented but as
   a secondary class, so the brief's literal `class="reveal` pattern does not
   match. Either the check or the markup should be aligned.
4. Added uncommitted `vitest.config.ts` to make the unit suite collectable under
   vitest (no new dependencies).
