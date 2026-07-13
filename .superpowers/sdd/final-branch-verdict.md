# Final Whole-Branch Review — Site Content Enrichment & Visual Upgrade

**Branch:** c00f24b8 → e86a978b
**Overall verdict:** READY TO MERGE (post-review fix applied)
**Honesty:** PASS (samples clean; latent HARD-rule violation fixed)

## Spec coverage
✅ (minor gaps noted)
- §4.1 Testimonials (`buildTestimonials`, 3 branches, `id="testimonials"`) — implemented; fixes broken `#testimonials` anchor.
- §4.2 `buildProcess` (`#process`) with `hasBespokeProcess` skip list — implemented; matches spec skip set.
- §5 Hero USP chips, Services "Popular" tag + richer copy, About 2nd paragraph + mini-stats, Why checklist — implemented. (FAQ intro + Contact map/hours were already present in base — correctly deemed out of scope.)
- §6 CSS densification (`--section-py:clamp(52px,6vw,88px)`, tightened `.svc-grid`/`guar-grid`, new component CSS) — implemented.
- §7 Sample data in `test-site-gen.mts` — injected, clearly marked `SAMPLE_*`, preview-only, does not alter gating.
- §8/§9 Tests (21/21) + sample regen (10/10 clean) per package evidence.

## Honesty
PASS on generated output: all 10 `test-*.html` are case-sensitively free of `undefined`/`NaN`/`Avis en attente`. New branches gate on real data; no-data branch shows CTA + real trust badges only. No prices. About mini-stats use `establishedYear`, real `rating`, and real `services.length` (accurate counts, not invented).

## Top findings

### Critical
None.

### Important
1. **`reviewCount` unguarded in `buildTestimonials` → emits "undefined avis".** `ultimateTemplate.ts:860` and `:869` use `${reviewCount}` (i.e. `content.googleReviews`) inside the `hasRating` branch, but `hasRating` only checks `rating` (`typeof rating === 'number' && rating > 0`), not the count. A valid input with a real `googleRating` but no `googleReviews` (e.g. manually-entered rating) produces `… · undefined avis` (branch 1) or `Basé sur undefined avis vérifiés Google` (branch 2) — violating the HARD "no `undefined` in generated HTML" rule. No test covers "rating present, count absent". Fix: gate each `${reviewCount}` render on `typeof reviewCount === 'number'` (e.g. `${hasRating ? \`${gLink} — ${rating}/5${typeof reviewCount === 'number' ? ' · ' + reviewCount + ' ' + (…) : ''}\` : ''}` and same in `meta`).

### Minor
2. **`(ui as any).svcPopular`** (`ultimateTemplate.ts:782`) — acceptable stopgap (plan-acknowledged); add `svcPopular` to the UI type for correctness.
3. **Branch-2 link wording** (`ultimateTemplate.ts:875,869`) uses `gLink` = "Voir sur Google" where spec §4.1.2 specifies "Lire les avis sur Google". Cosmetic only; no honesty impact.

## Post-review fixes (commit 127b6260 → 4060eacb)
- **Important #1 fixed:** `buildTestimonials` now gates `${reviewCount}` on `typeof reviewCount === 'number'` (added `hasCount`). Branch-2 `meta` falls back to `Note {rating}/5 sur Google` / `Rated {rating}/5 on Google` when count is absent. Added regression test "renders rating branch without leaking undefined when review count is absent" → suite now 22/22 pass.
- **Minor #3 fixed:** `gLink` aligned to spec §4.1.2 → "Lire les avis sur Google" / "Read our Google reviews" (used in all three testimonial branches).
- **Minor #2 (svcPopular type):** left as documented `(ui as any)` stopgap (plan-acknowledged); non-blocking.
- Samples regenerated (10/10 clean, no `undefined`/`NaN`/`Avis en attente`); tsc clean; vitest 22/22.

## Notes (non-blocking, out of scope)
- Pre-existing fallbacks `about-badge` → `sectorCfg.aboutBadge.value` and `why-img-badge` → `24/7`/`Disponible` (lines 1649, 1685) exist in base `c00f24b8`, unchanged by this branch — not regressions; flagged only for awareness.
- 12 original design invariants, single `<h1>`, `:focus-visible` (lines 1187, 1557) and `prefers-reduced-motion` (lines 1481, 1486) all preserved.
