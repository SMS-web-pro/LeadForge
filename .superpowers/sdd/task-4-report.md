# Task 4 Report — Reduced-motion hardening + reveal stagger

## Status
DONE

## Changes
File modified: `src/lib/ultimateTemplate.ts` (lines ~1115-1118).

Replaced the existing `.reveal` / `.reveal.active` rules (and the adjacent, now-superseded `.reveal-d1/2/3` delays and reduced-motion media query) with the exact NEW block from the brief:

- `.reveal` now uses `var(--ease)` and a smaller `translateY(28px)`.
- Added `.reveal-d1/2/3` stagger delays (`.06s` / `.14s` / `.22s`).
- Replaced the reduced-motion media query with a stricter one that disables `animation`/`transition`/`scroll-behavior` globally (`*`), forces `.reveal{opacity:1;transform:none}`, and sets `.hero-mesh{opacity:.8}`.

Note: The file already contained separate `.reveal-d1/2/3` and a reduced-motion `@media` block adjacent to the two `.reveal` lines. To avoid duplication and apply the brief's NEW block exactly, the entire reveal-related block (the two `.reveal` lines plus the existing `.reveal-d` line and the existing reduced-motion media query) was replaced by the new block. No unrelated rules were touched.

## tsc output
```
npx tsc --noEmit
```
0 errors (no output).

## Commit
- Hash: `5b76bafb7342b828591f04670c01b6ad9de5f5b4`
- Message: `feat(template): reduced-motion hardening + reveal stagger`
- Branch: `feature/soft-evolution-redesign`
- `1 file changed, 7 insertions(+), 3 deletions(-)`

## Test summary
`npx tsc --noEmit` passes with 0 errors; no functional test harness exists for the template string (pure CSS-in-TS template literal).

## Concerns
- The brief says "REPLACE the two existing `.reveal` lines" but the NEW block also redefines `.reveal-d1/2/3` and the reduced-motion media query that already existed as separate lines. Applied the literal NEW block to prevent duplicated/conflicting CSS, replacing the redundant adjacent lines rather than leaving duplicates. Flagging in case strict line-level interpretation was intended.
- The new global reduced-motion rule `* {transition:none!important}` also disables transitions on `.float-urgent` hover (already covered by constraint that reveals/custom cursor auto-disable under reduced-motion) — acceptable per brief intent.
