# Task 1 Report — Decompose builder into section helpers (output-identical)

## Status
DONE

## Commit
`3bb6046c` (branch `feature/site-quality-elevation`)

## What changed
`src/lib/ultimateTemplate.ts` only (190 insertions, 162 deletions — net +28 lines for the new helpers).

The HTML is assembled inside `buildUltimateHTML` (which `generateUltimateSite` delegates to), not directly inside `generateUltimateSite`. I added the following internal (nested) helper functions inside `buildUltimateHTML`, where they close over all existing local variables (`content`, `template`, `lang`, `ui`, `sectorCfg`, `proxiedImg`, `imgErr`, `getImg`, `getGuarantees`, `ADV_DESC`, etc.), so each returns an exact copy of its section's markup:

- `buildHero(content, template, lang): string`
- `buildServices(content, lang, serviceDescs): string` (serviceDescs unused — signature-only, as instructed)
- `buildWhyUs(content, whyItems): string` — renders the "Why Choose Us" (`#pourquoi`) section; calls `buildGallery` for the gallery grid
- `buildGallery(content): string` — the `realPhotos` gallery grid, previously inlined inside `#pourquoi`
- `buildTrust(content, lang): string` — the testimonials (`#testimonials`) section
- `buildContact(content, lang): string`
- `buildBespoke(content, template, lang): string` — returns `''` (placeholder, as instructed)

The inline section blocks in the return template were replaced with `${buildHero(...)}`, `${buildServices(...)}`, `${buildWhyUs(...)}`, `${buildTrust(...)}`, `${buildContact(...)}`, and `${buildBespoke(...)}` (wired right after `<main>` so its empty string affects nothing). Navbar, footer, the JSON-LD `<script>`, and the `:root` token block remain inline.

## Tests
- `npx tsc --noEmit` → exit 0 (clean).
- `npx vitest run src/lib/__tests__/template-design.test.ts` → **8 passed / 8** (T7 design test).
- Additional byte-for-byte verification: generated HTML compared against the original `HEAD` version for 4 scenarios (FR with reviews+photos, FR no reviews, EN, no-reviews) — **ALL_IDENTICAL** (exact string match, 66k–69k chars each). Verified before committing; temp files removed afterward.

## Notes / Concerns
- The plan's description assumed sections were built inline inside `generateUltimateSite`, but the real code assembles them inside `buildUltimateHTML`. I refactored there to match the actual architecture. Mapping of the requested helpers to real DOM sections: "why us" → the `#pourquoi` ("Pourquoi nous choisir") section, and the gallery grid was extracted from inside it into `buildGallery`.
- `lang` parameters are typed `'fr' | 'en'` (matching `UltimateContent.lang`) rather than `string`, to preserve the type narrowing the original closure relied on and keep `tsc` clean.
- The `.superpowers/sdd/progress-elevation.md` untracked file present in the working tree was **not** committed (only `src/lib/ultimateTemplate.ts` was staged).
- A transient PowerShell `Set-Content` call rewrote line endings to CRLF; this was corrected back to LF via node before verification/commit, so the diff contains only intended logical changes.
