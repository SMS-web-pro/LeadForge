### Task 2 Report: Universal "Comment ça marche" section (`#process`)

**Status:** DONE

**Commits:**
- `b91bd1fb59a52166dc6540fadcdd402d5ac236c8` — feat(template): add universal Comment ça marche section (skips bespoke-process sectors)

**Test command + output summary:**
- `npx vitest run src/lib/__tests__/template-design.test.ts` → 15 passed (1 new test added and passing).
- `npx tsc --noEmit` → clean (no errors).
- TDD: new test failed first (no `id="process"`), then passed after implementation.

**Concerns:**
- The brief stated `t()` is "available" in the builder scope, but `t` is only locally defined inside `buildBespoke`. Added a local `const t = (fr, en) => (lang === 'en' ? en : fr);` inside `buildProcess` to keep `tsc` clean and behavior correct. Code otherwise matches the brief verbatim.
- Implementation only touches the two specified files. Overall validated by the language/score: 15 passed, tsc clean.
