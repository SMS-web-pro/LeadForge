# R1 — Implementation Report

## Task
Add two exported functions (`cleanText`, `getStats` with `StatItem` interface) to `src/lib/template/helpers.ts` exactly as specified in the brief, without modifying existing exports.

## Changes
- File: `src/lib/template/helpers.ts`
- Added `cleanText(text: string): string` (after `capitalizeCity`) — strips `[année]`, `[name]`-style bracket tokens, `{{var}}` tokens, dangling "Fondé en ," and collapses whitespace.
- Added `export interface StatItem { num: string; label: string; }`.
- Added `getStats(...): StatItem[]` (after `cleanText`) — builds stats from real rating/reviews/years data when flags are true, otherwise pads with the listed honest commitments; capped at 4 items.
- No existing exports were modified. 52 insertions, 0 deletions.

## Typecheck (tsc)
- Command: `npx tsc --noEmit` from repo root.
- Result: **0 errors** (no output).

## Commit
- Hash: `0760d2e43c49027907d773854f3e9c01158f9499`
- Message: `feat(helpers): add cleanText + getStats honest-stat helpers`
- Branch: `feature/soft-evolution-redesign`

## Concerns
- Minor: the `sector` parameter of `getStats` is declared but unused. This matches the brief's exact spec, so it was kept as-is (no invention of behavior). A future caller (R3/R4) is expected to use it; unused param does not fail tsc under current tsconfig.
- The bracket-token regex `\w[\w\-éèêàçùôîïëüæœ'’]*` will also strip legitimate bracketed text such as `[email protected]` or `[1]` if ever present in AI copy; acceptable per brief intent (remove tokens), but worth noting for content containing real bracketed data.
- No tests were added as the brief did not request a test harness; verification was via tsc only.
