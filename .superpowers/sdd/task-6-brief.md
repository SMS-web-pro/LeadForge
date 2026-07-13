# Task 6 — Editorial eyebrow labels (FR/EN)

**Context:** Soft Evolution redesign polish. Adds short editorial "eyebrow" labels above each main section heading (replacing the longer section-label text) for an AWARDS-minimal editorial feel. Dynamic per language via `ui.ts` (no hardcoded sector copy).

**Files**
- Modify: `src/lib/template/ui.ts` — add 6 FR + 6 EN eyebrow fields.
- Modify: `src/lib/ultimateTemplate.ts` — swap 6 `section-label` spans to use the new `ui.eyebrow*` strings.

## Steps

### Step1: ui.ts — FR block
In the `fr: { ... }` block, after the existing `testEmpty: 'Avis en attente',` line (and before the block's closing `},`), add:
```ts
    eyebrowServices: 'Nos prestations',
    eyebrowAbout: 'À propos',
    eyebrowWhy: 'Pourquoi nous',
    eyebrowGuarantees: 'Nos engagements',
    eyebrowTestimonials: 'Ils nous font confiance',
    eyebrowContact: 'Contact',
```

### Step2: ui.ts — EN block
In the `en: { ... }` block, after the existing `testEmpty: 'Reviews coming soon',` line, add:
```ts
    eyebrowServices: 'Our services',
    eyebrowAbout: 'About',
    eyebrowWhy: 'Why us',
    eyebrowGuarantees: 'Our guarantees',
    eyebrowTestimonials: 'What clients say',
    eyebrowContact: 'Get in touch',
```

### Step3: Wire eyebrows into section headers (ultimateTemplate.ts)
Replace each `section-label` span exactly as follows:
- Services (currently `<span class="section-label">${servicesTitle || sectorCfg.ui.svcTitle[lang]}</span>`):
  → `<span class="section-label">${ui.eyebrowServices}</span>`
- About (currently `<span class="section-label">${aboutTitle || ui.aboutLabel}</span>`):
  → `<span class="section-label">${ui.eyebrowAbout}</span>`
- Why (currently `<span class="section-label">${ui.whyLabel}</span>`):
  → `<span class="section-label">${ui.eyebrowWhy}</span>`
- Guarantees/pourquoi (currently `<span class="section-label">${lang === 'en' ? 'Our Commitments' : 'Nos Engagements'}</span>`):
  → `<span class="section-label">${ui.eyebrowGuarantees}</span>`
- Testimonials (currently `<span class="section-label">${ui.testLabel}</span>`):
  → `<span class="section-label">${ui.eyebrowTestimonials}</span>`
- Contact (currently `<span class="section-label">${ui.contactLabel}</span>`):
  → `<span class="section-label">${ui.eyebrowContact}</span>`
(Leave the FAQ `section-label` (`FAQ`) unchanged.)

### Step4: Typecheck
Run: `npx tsc --noEmit` (repo root). Expected: 0 errors.

### Step5: Commit
```bash
git add src/lib/template/ui.ts src/lib/ultimateTemplate.ts
git commit -m "feat(template): editorial eyebrow labels (FR/EN)"
```

## Global Constraints (binding)
- Single `<h1>` per page (hero only) — no h1 change.
- All interactive elements `cursor:pointer`, `:focus-visible`, hover ≤300ms.
- No emoji icons — lucide only.
- Light-mode contrast ≥4.5:1; no neon; no AI purple-pink gradients.
- Responsive 375/768/1024/1440.
- Reduced-motion + coarse-pointer + <768px still disable cursor/reveals.
- Zero new external dependencies; `tsc` must pass.
- Dynamic per language — use `ui.eyebrow*` (already `UI[lang]`); do NOT add `[lang]` indexing.
