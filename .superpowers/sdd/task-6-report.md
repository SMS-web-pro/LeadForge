### Task 6 Report: Why (dark) checklist enrichment

**Status:** DONE (green)

**Commits:**
- `9f87c6d0` — feat(template): add key-reasons checklist to Why section

**Test command:**
`npx vitest run src/lib/__tests__/template-design.test.ts`

**Test output summary:**
- Before implementation: 1 failed (why section lists key reasons) / 18 passed.
- After implementation: 19 passed (new test `why section lists key reasons` passes).
- `npx tsc --noEmit` clean (no errors).

The new test added to `src/lib/__tests__/template-design.test.ts` asserts the generated HTML contains `why-list` and a `why-list-item` class. Implementation inserts a `<ul class="why-list">` with `pack.whyUs.slice(0,3)` rendered as `<li class="why-list-item">` items inside `.why-text` after the existing `<p>`.

**Concerns:**
- The brief's line references (~1583-1597) were stale; the actual `#why` block is now at lines ~1654-1668. Implementation targeted the correct current location.
- CSS for `.why-list` / `.why-list-item` is intentionally deferred to Task 7 (classes use exact names so styling can be added later).
- Pre-existing unrelated test failures (`basic.test.ts`, `validation.test.ts`) remain out of scope and untouched.
- `pack.whyUs` items typed as `any` per brief; relies on `.title`/`.desc` fields which exist in SectorCopy.
