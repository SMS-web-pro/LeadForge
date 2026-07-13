# Site Quality Elevation — Design Spec

**Date:** 2026-07-13
**Branch:** `feature/site-quality-elevation` (branched from `feature/soft-evolution-redesign` — local `main` still sits at the BASE revert `528ff3d8`, so the elevation builds directly on the Soft Evolution redesign; it will carry those commits when merged)
**Author:** opencode (with user direction)
**Status:** Approved (design)

## 1. Goal

Elevate every AI-generated website produced by LeadForge so it reads as **premium, editorial-minimal yet conversion-focused, and genuinely sector-differentiated** — with **no empty or broken sections** — while preserving the honesty guarantees established by the "Rapport de corrections" work (no fabricated reviews, ratings, or prices).

This improves the shared template (`src/lib/ultimateTemplate.ts`) and its content helpers so all future generations benefit.

## 2. Non-goals / Constraints

- Keep the single-string-literal output architecture of `ultimateTemplate.ts` (no component re-architecture). External generation API (`generateUltimateSite`, `generateUltimateSiteAsync`) unchanged.
- Preserve all accessibility invariants: contrast ≥ 4.5:1, visible focus, `prefers-reduced-motion`, responsive at 375/768/1024/1440.
- Preserve Rapport honesty: never invent reviews, star ratings, review counts, or prices. Trust elements use **only** real `lead` data; missing data degrades to non-numeric trust badges.
- No new external runtime dependencies. Custom cursor Vibe stays subtle/guarded (already implemented).
- The 8 pre-existing failures in `basic.test.ts`/`validation.test.ts` are out of scope.

## 3. Visual System — "Elevated Soft Evolution"

Direction (user-selected hybrid): editorial-minimal feel + conversion focus.

- **Type scale:** introduce a modular display scale. Larger hero `h1` (clamp ~2.4–4rem), tighter letter-spacing (-0.02em), clear step hierarchy for `h2/h3`. Body line-height 1.6–1.7.
- **Rhythm & whitespace:** increase section vertical padding; consistent container max-width; more breathing room around CTAs.
- **Surfaces:** finer 1px hairline borders (`--border`), optional glassy sticky navbar (backdrop-blur, subtle border), refined shadow tokens. Accent remains per-sector via `--accent`/`--accent-rgb`.
- **Conversion focus:** prominent, repeated primary CTA (navbar + hero + sticky/inline + contact). A compact **trust strip** near the hero/contact (badges: "Devis gratuit", "Réponse rapide", "Garantie", etc.). Gallery rendered as an asymmetric, larger grid when images exist.
- **Motion:** keep existing reduced-motion hardening; subtle reveal only.

All implemented as additions/refinements to the existing `:root` tokens and component CSS — no removal of the Soft Evolution base.

## 4. Sector Personality Layer

**4.1 Sector copy packs.** Replace the single generic `ADV_DESC`/why-us usage with per-sector override data so mapped sectors show tailored "Pourquoi nous choisir", service phrasing, and FAQ. For **unmapped sectors that fall through to `default`**, derive tailored copy from sector keywords (e.g. detect "dentiste"→dental, "avocat"→legal, "coach"→fitness) instead of the identical 4 generic advantages. Guarantee: no two distinct sectors render the *same* why-us list.

**4.2 Fix mapping drift.** `Dentiste` currently maps to the generic `medical` template (services like "Médecine Générale"). Add a dedicated `dentiste` sector entry (or a dental subset) with appropriate services ("Soins dentaires", "Blanchiment", "Orthodontie", "Urgence dentaire", "Implantologie", "Esthétique du sourire").

**4.3 Optional bespoke blocks (composed conditionally).** When the sector family matches, inject one extra section:
- Restaurant → "Carte & Horaires" card (specialties + hours).
- Coach/Sport → "Programmes" (personalised, collectif, préparation).
- Medical/Para → "Soins" care grid.
- Artisan (élec/plomb/reno) → "Certifications & Garanties" credentials block.
- Others → none (keep adaptive layout). These blocks are built from existing/real data only; no fabricated content.

**4.4 Hero image relevance.** Keep Unsplash fallback when Pexels returns none; ensure hero always has a valid image (already the case). No change to image sourcing pipeline in this spec (separate follow-up if needed).

## 5. Content Quality

- **Service descriptions:** expand from one-liners to 2–3 sentence, persuasive-but-factual copy per service (benefit-led + concrete). Driven by sector copy packs + service name.
- **Hero:** remove the near-duplicate subtitle (currently the same phrase appears twice). One clear, persuasive hero subtitle per site.
- **About / "Notre Approche":** enrich with sector-relevant differentiators; avoid generic filler.
- **FAQ:** sector-tailored questions/answers (reuse/extend existing FAQ generator with sector packs).
- **Tone:** confident marketing headlines + concrete factual body; benefit-led, urgency-aware CTAs (user-selected: persuasive + hard-sell blend).

## 6. No Empty Sections (Rapport-honest)

**6.1 Testimonials → Trust block.** Replace the "Avis en attente" empty state with a **trust signals block**:
- If `lead.googleRating` & `lead.googleReviews` exist → render star rating (real) + "Basé sur N avis Google" + optional single highlight quote only if a real quote is supplied.
- If rating data missing → render **trust badges** ("Devis gratuit", "Intervention rapide", "Garantie satisfaction", "Équipe certifiée") — non-numeric, never fabricated counts.
- The section heading "Ce que disent nos clients" is replaced by "Ils nous font confiance" / "Preuve de confiance" when no real reviews, to avoid implying absent testimonials.

**6.2 Gallery.** If no gallery images: (a) fall back to available real images (hero/about/service) to fill the grid, or (b) if no images at all, replace the gallery section with a compact **proof/trust strip** so the page never shows an empty-looking section. Never render an empty `gal-grid`.

**6.3 Guardrail.** A post-build check confirms every rendered `<section>` contains non-trivial content; empty sections are suppressed or substituted.

## 7. Engineering & Verification

- **Internal decomposition:** split the monolithic builder into section helpers (`buildHero`, `buildServices`, `buildWhyUs`, `buildTrust`, `buildGallery`, `buildContact`, `buildBespokeBlock`) returning HTML strings. Composed in `generateUltimateSite`. External API unchanged.
- **New branch:** `feature/site-quality-elevation` from `main`.
- **Tests:**
  - Extend `src/lib/__tests__/template-design.test.ts` (T7) invariants:
    1. No `undefined`/`NaN`.
    2. No duplicate hero subtitle.
    3. Trust block present (rating OR badges), no "Avis en attente".
    4. No empty `<section>` (every section has content).
    5. Mapped sectors show sector-tailored `why-us` (not the generic 4-list).
    6. `prefers-reduced-motion` CSS present.
    7. Accent-driven tokens present (`--accent-rgb`, `--secondary-rgb`).
    8. Hero image is a valid `https://` URL.
  - `tsc --noEmit` clean.
  - Regenerate 10-sector sample set (electricien, plombier, coiffeur, restaurant, dentiste, avocat, nettoyage, jardin, coach, garage) and confirm improvements + no regressions.
- **Workflow:** implement via per-section subagents (consistent with prior SDD process), each reviewed; final broad code review before merge.

## 8. Task Breakdown (high level)

1. Branch + scaffold section helpers inside `ultimateTemplate.ts`.
2. Visual elevation: tokens, type scale, whitespace, glassy nav, trust strip, gallery grid.
3. Sector personality: per-sector copy packs + keyword-derived fallback + Dentiste fix.
4. Bespoke blocks for restaurant/coach/medical/artisan.
5. Content expansion: service descriptions (2–3 sent), dedupe hero subtitle, enrich About/Approche/FAQ.
6. Trust block (real rating or badges) + gallery fallback/proof strip.
7. Extend T7 test invariants; regenerate samples; `tsc`; fix.
8. Final broad review + merge prep.

## 9. Risks

- Scope is large; mitigated by internal decomposition + T7 guardrails + per-section review.
- Sector packs must stay honest (no fabrication) — enforced by data-only sourcing.
- Keeping a11y across more sections — enforced by T7 + manual check on samples.
