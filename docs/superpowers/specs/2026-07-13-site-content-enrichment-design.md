# Site Quality — Content Enrichment & Visual Upgrade (Design Spec)

**Date:** 2026-07-13
**Branch base:** `main` (post `feature/site-quality-elevation` merge, commit `e00efc47` + bespoke follow-up `1fddcffd`)
**Owner sign-off:** User validated scope "Complet" + reviews approach "Réel + CTA avis" on 2026-07-13.

## 1. Objective

The generated LeadForge sites read as "too basic / too empty": sections lack copy density,
client reviews are never shown, there is excessive whitespace, and the visual design feels
generic. This spec enriches content, adds two new sections, fixes the broken reviews/anchor
gap, and upgrades + densifies the visual layer — while keeping the established
**Rapport-honesty** rule: **never fabricate** reviews, ratings, counts, prices, or stats.

The approach approved by the user is **Approach A**: overhaul the content + section layer
inside `src/lib/ultimateTemplate.ts` (builder functions + assembly + CSS), driven by real
data with honest fallbacks, and regenerate sample sites **with sample data** to preview the
populated result.

## 2. Hard Constraints (Rapport-honesty)

- Never invent reviews, ratings, review counts, client counts, prices, or statistics.
- `googleRating` / `googleReviews` and `testimonials` (from `googleReviewsData`) are shown
  **only when real values are present** (`typeof rating === 'number'` / array non-empty).
- When no real review data exists, the reviews section shows a **"Leave a Google review" CTA**
  (link to the business GMB / `content.reviewUrl` if provided, else `#contact`) — not fake reviews.
- Sample/preview data injected into `test-site-gen.mts` is **only for preview** and does not
  change product behavior (the production template still gates on real data).
- No prices anywhere in content (standing rule).

## 3. Data Model (inputs already available on `UltimateContent` / `lead`)

Reused as-is (no schema change needed):
- `googleRating?: number`, `googleReviews?: number` — real, gated.
- `googleReviewsData?` / `testimonials: Array<{ author; text; rating; date? }>` — real reviews.
- `establishedYear?: number`, `hours?`, `address`, `city`, `website`, `phone`, `email`.
- `services`, `serviceImages`, `galleryImages`, `realPhotos`, `allImages`.
- New optional (with safe fallback): `reviewUrl?: string` (GMB review link), `serviceAreas?: string[]`.
  If `serviceAreas` is absent, the zones section is omitted (no fabrication of city names).

## 4. New Sections

### 4.1 Testimonials / Reviews (`#testimonials`) — replaces current `#confiance` block
Builder `buildTestimonials(content, lang)` with three honest branches:

1. **Real testimonials present** (`testimonials.length > 0`):
   responsive grid of cards — avatar/initials, star rating (`rating` per review), `text`,
   `author`, optional `date`. Header: "Avis clients" / "Client reviews". A "Voir sur Google"
   link when `googleRating` real.
2. **Real rating but no testimonial text** (`googleRating` real, no testimonials):
   a trust card showing the real `rating`/5 + `googleReviews` count + "Lire les avis sur Google"
   link (uses `reviewUrl`).
3. **No review data at all**: a clean CTA banner — heading "Votre avis compte" / "Your opinion
   matters", short line, and a primary button "Laissez un avis Google" → `reviewUrl || '#contact'`.
   Plus the existing trust-badge strip (real/derived guarantees, never numeric ratings).

Fix: the nav "Avis" link currently targets `#testimonials` (which did not exist). This section
carries `id="testimonials"`, closing the broken anchor.

### 4.2 "Comment ça marche" (`#process`) — universal 3-step section
Builder `buildProcess(content, lang, pack)` rendering 3 steps
(Consultation → Réalisation → Suivi) with icons + short sector-tailored copy from `pack`.
- Rendered **only** for sectors WITHOUT a bespoke process block:
  `restaurant`, `medical`, `artisan`, `electricien`, `plombier` (and `default`).
- Skipped for `coiffeur`, `avocat`, `nettoyage`, `jardin`, `garage`, `coach` (they already have
  a bespoke process/steps block) to avoid duplication.

## 5. Enrichment of Existing Sections

- **Hero** (`buildHero`): add a row of 3–4 USP chips under the CTA (e.g. "Devis gratuit",
  "Réponse < 24h", sector guarantee) sourced from `getGuarantees(content.sector, lang)` subset.
  Keep real rating badge when present.
- **Services** (`buildServices`): each card gets its sector icon + the richer `desc` from
  `getServiceDescriptions`; mark 1–2 cards "Populaire" / "Popular" via a tag. Ensure 6-up grid
  on desktop, 2-up tablet, 1-up mobile (already mostly true — verify gaps).
- **About** (`#about`): add a second paragraph (short company story from `aboutText` expansion
  or `footerDesc` when richer) and a 3-up mini-stats row using **real** values
  (`establishedYear`, real rating, or sector-derived non-numeric facts — never invented numbers).
- **Why** (`#why`, dark): add a 3-item checklist of `pack.whyUs` highlights beside the image.
- **Stats band**: keep as-is (already real-data driven via `getStats`).
- **WhyUs** (`buildWhyUs`): keep; verify copy density is adequate (it already uses `pack.whyUs`).
- **FAQ** (`#faq`): add a one-line intro; keep `<details>` accordion.
- **Contact** (`#contact`): add an embedded map (`https://maps.google.com/maps?q=...`) when
  `address` present, and an hours list when `hours` present.

## 6. Visual Upgrade & Densification (CSS)

All in the `<style>` string literal of `ultimateTemplate.ts` (keep existing tokens):
- Reduce section vertical padding from ~`100px` to ~`64px` (clamp for mobile), tighten
  `.container` max gaps and card grids (`gap` 28px→20px).
- Hero: stronger gradient/radial mesh overlay, larger display `h1` (clamp up to ~3.4rem),
  accent color block behind badge/CTA.
- Add subtle background texture to `.section-alt` and `.section-dark` (existing classes) — keep
  performant (CSS gradients only, no extra image requests).
- Increase imagery usage: ensure hero, about, why, and gallery all show real images; add
  `loading="lazy"` (already present).
- Editorial typography: bump `.section-label` tracking, `.h2` weight, and add an accent
  underline mark under section headings.
- Keep accessibility: contrast, focus states, reduced-motion (`prefers-reduced-motion`) honored.

## 7. Sample Data for Preview (`test-site-gen.mts`)

Inject (for preview only) per-sector sample data so generated HTML demonstrates populated state:
- `googleRating` (e.g. 4.7), `googleReviews` (e.g. 128) — sample, not fabricated in product.
- `testimonials`: 3 sample reviews (author, text, rating, date) per sector.
- `reviewUrl`: a placeholder GMB-style URL.
- `serviceAreas`: 3–4 nearby areas derived from the city (clearly sample).
- `hours`: a sample weekly schedule.
- `establishedYear`: a sample year.

No change to the production `generateUltimateSite` gating logic — sample data simply exercises
the real-data branches.

## 8. Files Touched

- `src/lib/ultimateTemplate.ts` — new `buildTestimonials`, `buildProcess`; enrich
  `buildHero`/`buildServices`/`buildAbout`(inline)/`buildWhy`(inline)/`buildContact`;
  CSS densification + visual upgrade; fix `#testimonials` anchor; wire new sections into assembly.
- `src/lib/template/helpers.ts` — ensure `getGuarantees`/`getStats`/`getServiceDescriptions`
  support the enrichment (no fabricated values).
- `test-site-gen.mts` — inject sample data (preview only).
- `src/lib/__tests__/template-design.test.ts` — extend invariants:
  - testimonials section present (`#testimonials`); when sample data present, contains review
    card text; when no data (a dedicated test case), shows CTA, NOT fabricated stars/count.
  - no `undefined`/`NaN`/`Avis en attente`; `hasTrustBadge` holds.
  - process section present for non-bespoke sectors, absent for bespoke-process sectors.
  - no invented numeric stats (reuse existing honesty checks).

## 9. Verification

- `npx tsc --noEmit` clean.
- `npx vitest run src/lib/__tests__/template-design.test.ts` — 12 existing + new invariants pass.
- `npx tsx test-site-gen.mts` — all 10 sectors green; manual grep confirms `#testimonials`,
  `#process` (where expected), USP chips, denser layout (no giant empty sections).
- Honesty re-check: grep generated HTML for forbidden patterns (`Avis en attente`, fabricated
  `5/5`/`42 avis` when no data) — none.

## 10. Out of Scope (YAGNI)

- No new backend / storage changes.
- No price tables.
- No multilingual beyond existing `fr`/`en` single-lang output.
- No CMS / editable content admin.
