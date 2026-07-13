### Task 3 Report: Hero USP chips

**Status:** GREEN — implemented and committed.

**Commits:**
- `fc392bb0` feat(template): add hero USP chips

**Test summary:**
Added `hero shows USP chips from guarantees` to `template-design.test.ts`; verifies `hero-chips` container and at least one `hero-chip` class appear in generated HTML. Full file: 16 tests passed. Test command: `npx vitest run src/lib/__tests__/template-design.test.ts` → `16 passed (16)`.

`npx tsc --noEmit` → clean (exit 0).

**Concerns:**
- The `.hero-chips` / `.hero-chip` CSS classes have no styles yet (supplied in Task 7). Markup uses exact class names per brief; current output renders unstyled spans, which is expected.
- `getGuarantees(...).slice(0,3)` used `any` typing per brief verbatim; relies on Task 7 for visual styling.
- Pre-existing unrelated failures (`basic.test.ts`, `validation.test.ts`) remain untouched/out of scope.
