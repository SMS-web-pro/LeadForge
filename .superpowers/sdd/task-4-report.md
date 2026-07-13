# Task 4 Report — Services "Popular" tag + richer copy

## Status
GREEN — implemented, tests pass, `tsc --noEmit` clean, committed.

## Commits
- `a37d9712` — feat(template): add Popular tag + ensure richer service copy

## Test summary
Added `it('marks the first service as popular and uses richer descriptions')` which asserts the rendered HTML contains `svc-tag` (first service card tag, fallback "Populaire") and `svc-card-body`; full file: 17 passed / 17.

Command: `npx vitest run src/lib/__tests__/template-design.test.ts`
Output: `Test Files 1 passed (1)`, `Tests 17 passed (17)`.
`npx tsc --noEmit`: clean (no errors).

## Concerns
- `ui.svcPopular` does not exist on the `ui` union type (defined in `src/lib/template/ui.ts`, which is out of scope to modify per task constraints). To keep `tsc` clean without touching `ui.ts`, the reference is cast via `(ui as any).svcPopular`. At runtime it is undefined, so the inline fallback `lang === 'fr' ? 'Populaire' : 'Popular'` is used. If `svcPopular` is later added to the `ui` interface (e.g., by a future task), the cast can be removed.
- `.svc-tag` CSS styles are deferred to Task 7 (per brief). The `position:relative` already exists on `.svc-card` (line 1330), so the tag will position correctly once styled.
- Only `src/lib/ultimateTemplate.ts` and `src/lib/__tests__/template-design.test.ts` were modified. Pre-existing unrelated test failures (`src/__tests__/basic.test.ts`, `src/lib/__tests__/validation.test.ts`) remain untouched and out of scope.
- No `git push` performed.
