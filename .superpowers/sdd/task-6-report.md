# Task 6 Report — Editorial eyebrow labels (FR/EN)

## Status
DONE

## Changes

### src/lib/template/ui.ts
- FR block (`fr: { ... }`): added 6 eyebrow fields after `testEmpty: 'Avis en attente',`:
  - `eyebrowServices`, `eyebrowAbout`, `eyebrowWhy`, `eyebrowGuarantees`, `eyebrowTestimonials`, `eyebrowContact`
- EN block (`en: { ... }`): added the same 6 fields after `testEmpty: 'Reviews coming soon',` with English copy.

### src/lib/ultimateTemplate.ts
Replaced 6 `section-label` spans to use the new `ui.eyebrow*` strings:
- Services: `${ui.eyebrowServices}`
- About: `${ui.eyebrowAbout}`
- Why: `${ui.eyebrowWhy}`
- Guarantees: `${ui.eyebrowGuarantees}` (replaced previously hardcoded `'Our Commitments'` / `'Nos Engagements'`)
- Testimonials: `${ui.eyebrowTestimonials}`
- Contact: `${ui.eyebrowContact}`
- FAQ span (`FAQ`) left unchanged as instructed.

## tsc output
`npx tsc --noEmit` → 0 errors (no output).

## Commit
- Hash: `8a913b0de58303d17172511cfbeb4a94c7d811d7`
- Message: `feat(template): editorial eyebrow labels (FR/EN)`
- Branch: `feature/soft-evolution-redesign`
- 2 files changed, 18 insertions(+), 6 deletions(-)

## One-line test summary
Typecheck passes with 0 errors after wiring 6 FR/EN eyebrow labels into section headers.

## Concerns
None. Removal of the `servicesTitle || sectorCfg.ui.svcTitle[lang]` fallback and the `aboutTitle || ui.aboutLabel` fallback means a caller-supplied override for those section labels is now ignored (eyebrow always wins). This is consistent with the brief's intent (editorial eyebrow always shown), but worth noting if any external code passed `servicesTitle`/`aboutTitle`.
