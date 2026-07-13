# Site Content Enrichment & Visual Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make generated LeadForge sites feel rich, full, and premium — adding a real testimonials/reviews section (honest "Réel + CTA" behavior), a universal "Comment ça marche" section, denser/more persuasive copy per section, and a densified + upgraded visual layer — without ever fabricating reviews, ratings, counts, prices, or stats.

**Architecture:** All changes live in `src/lib/ultimateTemplate.ts` (nested builder functions + assembly + the `<style>` string literal), with helper support from `src/lib/template/helpers.ts`, sample-data injection in `test-site-gen.mts`, and extended invariants in `src/lib/__tests__/template-design.test.ts`. New sections are driven by the **same real-data gating** already used (`googleRating`/`googleReviews`/`testimonials` only shown when real). Sample data in the generator only exercises those branches for preview.

**Tech Stack:** TypeScript, React-free string-template HTML generator, Vitest (unit/invariant tests), `tsx` (sample regen script), Lucide icons via `data-lucide`.

## Global Constraints

- **Rapport-honesty (HARD):** never fabricate reviews, ratings, review counts, client counts, prices, or statistics. `googleRating`/`googleReviews`/`testimonials` render ONLY when real values exist. No-data state shows a "Leave a Google review" CTA — not fake reviews.
- No prices anywhere in content.
- All `<script>`/`CSS` are STRING LITERALS inside `ultimateTemplate.ts`.
- Single `lang` (`'fr'`/`'en'`); i18n via the `t(fr, en)` helper or `ui[lang]`.
- `npx tsc --noEmit` must stay clean; `npx vitest run src/lib/__tests__/template-design.test.ts` must pass; `npx tsx test-site-gen.mts` must report all 10 sectors green.
- Pre-existing unrelated test failures (`src/__tests__/basic.test.ts`, `src/lib/__tests__/validation.test.ts`) are OUT OF SCOPE — do not touch.
- `eslint` is broken in this environment (missing global `acorn`/`espree`); rely on `tsc` + `vitest`.

---

### Task 1: Testimonials / Reviews section (`#testimonials`)

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` — replace `buildTrust` (lines ~828-854) with `buildTestimonials`; change assembly call at line ~1605.
- Test: `src/lib/__tests__/template-design.test.ts`

**Interfaces:**
- Consumes: `content.testimonials` (`Array<{author:string;text:string;rating:number;date?:string}>`), `content.googleRating`, `content.googleReviews`, `content.reviewUrl`, `getTrustBadges(lang)`, `ui`, `t()`.
- Produces: `buildTestimonials(content, lang)` returning a `<section id="testimonials">` string.

- [ ] **Step 1: Write the failing test**

Add to `template-design.test.ts` (inside `describe`):

```ts
it('renders a #testimonials section with real reviews when provided', () => {
  const html = generateUltimateSite({ ...lead, googleReviewsData: [
    { author: 'Jean D.', text: 'Travail impeccable, je recommande.', rating: 5, date: '2025-03-12' },
    { author: 'Marie L.', text: 'Ponctuel et pro.', rating: 5 },
  ] } as any, undefined);
  expect(html).toContain('id="testimonials"');
  expect(html).toContain('Travail impeccable');
});

it('shows a review CTA (never fabricated stars) when no review data', () => {
  const html = generateUltimateSite({ ...lead, googleRating: 0, googleReviews: 0, googleReviewsData: [] } as any, undefined);
  expect(html).toContain('id="testimonials"');
  expect(html).toContain('Laissez un avis');
  expect(html).not.toMatch(/Basé sur \d+ avis|Based on \d+ reviews/);
  expect(html).not.toMatch(/★★★★★|☆☆☆☆☆/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (`#testimonials` not present; CTA text absent).

- [ ] **Step 3: Write minimal implementation**

Replace `buildTrust` with:

```ts
  function buildTestimonials(content: UltimateContent, lang: 'fr' | 'en'): string {
    const reviews = (content.testimonials || []).filter((t: any) => t && t.text);
    const rating = content.googleRating;
    const reviewCount = content.googleReviews;
    const hasRating = typeof rating === 'number' && rating > 0;
    const reviewUrl = content.reviewUrl || (content.website ? content.website : '#contact');
    const title = lang === 'fr' ? 'Avis clients' : 'Client reviews';
    const gLink = lang === 'fr' ? 'Voir sur Google' : 'View on Google';
    const ctaHeading = lang === 'fr' ? 'Votre avis compte' : 'Your opinion matters';
    const ctaText = lang === 'fr' ? 'Laissez un avis Google' : 'Leave a Google review';
    const ctaSub = lang === 'fr' ? 'Aidez d’autres clients à faire le bon choix.' : 'Help others choose with confidence.';
    // Branch 1: real testimonial text available
    if (reviews.length > 0) {
      const cards = reviews.map((r: any) => {
        const full = Math.max(0, Math.min(5, Math.round(r.rating || 5)));
        const stars = '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
        return `<div class="tcard reveal">
            <div class="tcard-stars">${stars}</div>
            <p class="tcard-text">${r.text}</p>
            <div class="tcard-foot"><span class="tcard-author">${r.author}</span>${r.date ? `<span class="tcard-date">${r.date}</span>` : ''}</div>
        </div>`;
      }).join('');
      return `    <section class="section section-alt" id="testimonials">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowTestimonials || (lang === 'fr' ? 'Témoignages' : 'Testimonials')}</span>
                <h2>${title}</h2>
                ${hasRating ? `<p>${gLink} — ${rating}/5 · ${reviewCount} ${(lang === 'fr' ? 'avis' : 'reviews')}</p>` : ''}
            </div>
            <div class="tcard-grid reveal">${cards}</div>
        </div>
    </section>`;
    }
    // Branch 2: real rating but no testimonial text
    if (hasRating) {
      const stars = '★★★★★'.slice(0, Math.round(rating)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(rating));
      const meta = lang === 'fr' ? `Basé sur ${reviewCount} avis vérifiés Google` : `Based on ${reviewCount} verified Google reviews`;
      return `    <section class="section section-alt" id="testimonials">
        <div class="container">
            <div class="trust-card reveal">
                <div class="trust-score">${stars} <strong>${rating}/5</strong></div>
                <p class="trust-meta">${meta}</p>
                <a href="${reviewUrl}" target="_blank" rel="noopener" class="btn-pri" style="margin-top:18px">${gLink} <i data-lucide="external-link" width="16"></i></a>
            </div>
        </div>
    </section>`;
    }
    // Branch 3: no review data at all -> honest CTA, no fabrication
    const badges = getTrustBadges(lang);
    return `    <section class="section section-alt" id="testimonials">
        <div class="container">
            <div class="trust-card reveal" style="text-align:center">
                <h2>${ctaHeading}</h2>
                <p class="trust-meta">${ctaSub}</p>
                <a href="${reviewUrl}" target="_blank" rel="noopener" class="btn-pri" style="margin-top:18px">${ctaText} <i data-lucide="star" width="16"></i></a>
                <div class="trust-strip">${badges.slice(0, 4).map((b: string) => `<span class="trust-badge"><i data-lucide="check-circle"></i> ${b}</span>`).join('')}</div>
            </div>
        </div>
    </section>`;
  }
```

Then in the assembly, change the call:

```ts
${buildTestimonials(content, lang)}
```

(Replace the existing `${buildTrust(content, lang)}` at the `buildTrust` call site.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS (both new tests + existing 12).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "feat(template): add honest testimonials/reviews section (#testimonials)"
```

---

### Task 2: Universal "Comment ça marche" section (`#process`)

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` — add `buildProcess`; wire into assembly with skip logic.
- Test: `src/lib/__tests__/template-design.test.ts`

**Interfaces:**
- Consumes: `content.sector`, `pack`, `t()`, `ui`.
- Produces: `buildProcess(content, lang)`; assembly variable `hasBespokeProcess`.

- [ ] **Step 1: Write the failing test**

```ts
it('shows #process for non-bespoke sectors and hides it for bespoke-process sectors', () => {
  const electricien = generateUltimateSite(lead as any, undefined);
  expect(electricien).toContain('id="process"');
  const coiffeur = generateUltimateSite({ ...lead, sector: 'Coiffeur' } as any, undefined);
  expect(coiffeur).not.toContain('id="process"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (no `id="process"`).

- [ ] **Step 3: Write minimal implementation**

Add the builder (near `buildTestimonials`):

```ts
  function buildProcess(content: UltimateContent, lang: 'fr' | 'en'): string {
    const steps = [
      { icon: 'message-circle', label: t('Consultation', 'Consultation'), desc: t(`Un échange pour comprendre vos besoins en ${content.sector}.`, `A conversation to understand your ${content.sector} needs.`) },
      { icon: 'settings', label: t('Réalisation', 'Delivery'), desc: t('Une intervention soignée, dans les règles de l’art.', 'Careful work, done right.') },
      { icon: 'refresh-cw', label: t('Suivi', 'Follow-up'), desc: t('Un accompagnement après l’intervention, sans surprise.', 'Support after the job, with no surprises.') },
    ];
    return `    <section class="section" id="process">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowServices}</span>
                <h2>${t('Comment ça marche', 'How it works')}</h2>
                <p>${t('Un process clair, de la première demande à la finition.', 'A clear process, from first contact to the finished result.')}</p>
            </div>
            <div class="bespoke-progs reveal">${steps.map(s => `
                <div class="bespoke-prog reveal">
                    <div class="bespoke-prog-icon"><i data-lucide="${s.icon}" width="22"></i></div>
                    <h3>${s.label}</h3>
                    <p>${s.desc}</p>
                </div>`).join('')}</div>
        </div>
    </section>`;
  }
```

In the assembly (after `const bespokeSection = buildBespoke(...)` and before/after it), compute:

```ts
const hasBespokeProcess = ['coiffeur', 'avocat', 'nettoyage', 'jardin', 'garage', 'coach'].includes(pack.bespoke || '');
```

Insert into the assembly right after `${bespokeSection}`:

```ts
${!hasBespokeProcess ? buildProcess(content, lang) : ''}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "feat(template): add universal Comment ça marche section (skips bespoke-process sectors)"
```

---

### Task 3: Hero USP chips

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` — `buildHero` (after `.hero-actions`).

**Interfaces:**
- Consumes: `getGuarantees(content.sector, lang)`, `t`, `ui`.
- Produces: extra `.hero-chips` markup in hero.

- [ ] **Step 1: Write the failing test**

```ts
it('hero shows USP chips from guarantees', () => {
  const html = build();
  expect(html).toContain('hero-chips');
  expect(html).toMatch(/class="[^"]*hero-chip[^"]*"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (`hero-chips` absent).

- [ ] **Step 3: Write minimal implementation**

In `buildHero`, after the `.hero-actions` block (the `</div>` closing `.hero-actions` at line ~739), insert before the rating `<div>`:

```ts
                <div class="hero-chips">
                    ${getGuarantees(content.sector, lang).slice(0, 3).map((g: any) => `<span class="hero-chip"><i data-lucide="${g.icon}" width="14"></i> ${g.title}</span>`).join('')}
                </div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "feat(template): add hero USP chips"
```

---

### Task 4: Services "Popular" tag + richer copy

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` — `buildServices` card map.

**Interfaces:**
- Consumes: `serviceDescs`, existing cards.
- Produces: `.svc-tag` on first card.

- [ ] **Step 1: Write the failing test**

```ts
it('marks the first service as popular and uses richer descriptions', () => {
  const html = build();
  expect(html).toContain('svc-tag');
  expect(html).toContain('svc-card-body');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (`svc-tag` absent).

- [ ] **Step 3: Write minimal implementation**

In `buildServices`, change the card template to add a tag on `i === 0`:

```ts
                return `
                <div class="svc-card reveal reveal-d${(i % 3) + 1}">
                    ${i === 0 ? `<div class="svc-tag">${ui.svcPopular || (lang === 'fr' ? 'Populaire' : 'Popular')}</div>` : ''}
                    <img src="${proxiedImg(serviceImages[i] || heroImage)}" class="svc-card-img" alt="${s.name} à ${city}" loading="lazy">
                    <div class="svc-card-body">
                        <div class="svc-icon"><i data-lucide="${iconName}" width="22" height="22"></i></div>
                        <h3>${s.name}</h3>
                        <p>${serviceDescs[i]?.desc || s.description}</p>
                        <a href="#contact" class="svc-link">${ui.svcLink} <i data-lucide="arrow-right" width="14"></i></a>
                    </div>
                </div>`;
```

(If `ui.svcPopular` is undefined, the fallback inline copy is used.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "feat(template): add Popular tag + ensure richer service copy"
```

---

### Task 5: About enrichment (2nd paragraph + honest mini-stats)

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` — `#about` block (lines ~1559-1581).

**Interfaces:**
- Consumes: `aboutText`, `footerDesc`, `establishedYear`, `hasRealRating`, `rating`, `getStats`.
- Produces: second `.about-text` paragraph + `.about-mini` real-stats row.

- [ ] **Step 1: Write the failing test**

```ts
it('about section has a second paragraph and honest mini-stats', () => {
  const html = build();
  expect(html).toContain('about-mini');
  expect(html).not.toContain('undefined');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (`about-mini` absent).

- [ ] **Step 3: Write minimal implementation**

Inside `#about`, after `<p>${aboutText}</p>` add a second paragraph and a mini-stats row (real values only):

```ts
                    <p>${aboutText}</p>
                    <p class="about-sub">${footerDesc || (lang === 'en' ? `From first contact to follow-up, ${companyName} puts your satisfaction first.` : `Du premier contact au suivi, ${companyName} place votre satisfaction au centre.`)}</p>
                    <div class="about-mini">
                        ${establishedYear ? `<div class="about-mini-item"><strong>${(new Date().getFullYear() - establishedYear)}+</strong><span>${lang === 'en' ? 'Years' : 'Ans'}</span></div>` : ''}
                        ${hasRealRating && rating ? `<div class="about-mini-item"><strong>${rating}/5</strong><span>${lang === 'en' ? 'Google Rating' : 'Note Google'}</span></div>` : ''}
                        <div class="about-mini-item"><strong>${(services || []).length}+</strong><span>${lang === 'en' ? 'Services' : 'Prestations'}</span></div>
                    </div>
```

(Note: `(services||[]).length` is a real count of listed services — not fabricated.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "feat(template): enrich About with 2nd paragraph + honest mini-stats"
```

---

### Task 6: Why (dark) checklist enrichment

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` — `#why` block (lines ~1583-1597).

**Interfaces:**
- Consumes: `pack.whyUs`.
- Produces: `.why-list` checklist beside why-image.

- [ ] **Step 1: Write the failing test**

```ts
it('why section lists key reasons', () => {
  const html = build();
  expect(html).toContain('why-list');
  expect(html).toMatch(/class="[^"]*why-list-item[^"]*"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (`why-list` absent).

- [ ] **Step 3: Write minimal implementation**

In `#why`, after the `.why-text` `<p>` (line ~1589), add:

```ts
                    <ul class="why-list">
                        ${pack.whyUs.slice(0, 3).map((w: any) => `<li class="why-list-item"><i data-lucide="check" width="16"></i> <span><strong>${w.title}</strong> — ${w.desc}</span></li>`).join('')}
                    </ul>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "feat(template): add key-reasons checklist to Why section"
```

---

### Task 7: CSS densification + visual upgrade

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` — the `<style>` literal (`:root` token at ~1117, `.section` ~1227, `.hero-mesh` ~1188, `.hero-inner` ~1195, `.section-hdr`/headings, `.svc-grid` ~1267 gaps).

**Interfaces:**
- Consumes: existing CSS classes; new classes used above (`.hero-chips`,`.hero-chip`,`.svc-tag`,`.about-mini`,`.why-list`,`.tcard*`,`.tcard-grid`).
- Produces: smaller `--section-py`, tighter gaps, stronger hero mesh, editorial heading marks, new component CSS.

- [ ] **Step 1: Write the failing test**

```ts
it('densifies section padding via --section-py token', () => {
  const html = build();
  const m = html.match(/--section-py:([^;]+);/);
  expect(m).toBeTruthy();
  // max clamp value should be reduced (was 120px) -> assert "<= 96px"
  const maxv = parseInt((m as RegExpMatchArray)[1].match(/(\d+)px\s*\)/) as any, 10);
  expect(maxv).toBeLessThanOrEqual(96);
});
it('defines CSS for new enriched components', () => {
  const html = build();
  ['hero-chips', 'svc-tag', 'about-mini', 'why-list', 'tcard-grid'].forEach(c => expect(html).toContain(c));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (`--section-py` max still 120; some classes lack CSS).

- [ ] **Step 3: Write minimal implementation**

a) Change the `:root` token (line 1117): `--section-py:clamp(64px,9vw,120px)` → `--section-py:clamp(52px,6vw,88px)`.

b) Strengthen hero mesh (line ~1188) — keep the existing multi-stop gradient but raise opacity/contrast; ensure `.hero-mesh{opacity:.9}` (a line at ~1426 already forces `.hero-mesh{opacity:.8!important}` — leave it). No change required if acceptable; otherwise bump the gradient alpha. Keep as-is if risky.

c) Add component CSS (append near the end of the `<style>` block, before `</style>`):

```css
.hero-chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.hero-chip{display:inline-flex;align-items:center;gap:6px;font-size:.82rem;color:rgba(255,255,255,.86);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);padding:7px 14px;border-radius:999px;backdrop-filter:blur(6px)}
.svc-tag{position:absolute;top:14px;left:14px;background:var(--accent);color:#fff;font-size:.7rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:5px 12px;border-radius:999px;z-index:2}
.svc-card{position:relative}
.about-sub{margin-top:14px;color:var(--text-s)}
.about-mini{display:flex;flex-wrap:wrap;gap:26px;margin-top:24px}
.about-mini-item{display:flex;flex-direction:column}.about-mini-item strong{font-size:1.6rem;color:var(--primary)}.about-mini-item span{font-size:.8rem;color:var(--text-t);text-transform:uppercase;letter-spacing:.06em}
.why-list{list-style:none;margin:20px 0 0;padding:0;display:flex;flex-direction:column;gap:12px}
.why-list-item{display:flex;gap:10px;align-items:flex-start;font-size:.96rem}.why-list-item i{color:var(--accent);margin-top:3px;flex:0 0 auto}
.tcard-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.tcard{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:24px;box-shadow:var(--sh-1)}
.tcard-stars{color:var(--accent);letter-spacing:2px;margin-bottom:10px}
.tcard-text{font-size:.96rem;line-height:1.6;color:var(--text)}
.tcard-foot{display:flex;justify-content:space-between;margin-top:14px;font-size:.82rem;color:var(--text-t)}
.tcard-author{font-weight:600;color:var(--text)}
@media(max-width:768px){.tcard-grid{grid-template-columns:1fr}}
.section-hdr h2{position:relative;display:inline-block}
.section-hdr h2::after{content:"";position:absolute;left:0;bottom:-10px;width:54px;height:3px;border-radius:3px;background:linear-gradient(90deg,var(--accent),var(--secondary))}
```

d) Tighten `.svc-grid` gap (line 1267): `gap:28px` → `gap:20px`. Tighten `.guar-grid` (line 1311) `gap:22px` → `gap:18px`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "style(template): densify layout + upgrade visuals (chips, tags, mini-stats, testimonials grid)"
```

---

### Task 8: Inject sample data in `test-site-gen.mts` (preview only)

**Files:**
- Modify: `test-site-gen.mts`

**Interfaces:**
- Consumes: existing sample lead builder.
- Produces: sample `googleReviewsData`, `googleRating`, `googleReviews`, `reviewUrl`, `serviceAreas`, `hours`, `establishedYear` per sector.

- [ ] **Step 1: Add sample review data to the generator**

In `test-site-gen.mts`, where each sample `lead` is built, add fields (example for electricien; replicate per sector with sector-appropriate copy):

```ts
const sampleReviews = (sector: string) => ([
  { author: 'Julie M.', text: `Intervention rapide et propre, je recommande ce ${sector}.`, rating: 5, date: '2025-11-02' },
  { author: 'Karim B.', text: 'Devis clair, travail soigné, rien à redire.', rating: 5, date: '2025-09-18' },
  { author: 'Sophie T.', text: 'Équipe à l’écoute et résultat au rendez-vous.', rating: 4, date: '2025-07-30' },
]);
// in each lead object:
googleRating: 4.7,
googleReviews: 124,
googleReviewsData: sampleReviews(sector.toLowerCase()),
reviewUrl: 'https://search.google.com/local/writereview?placeid=CHANGE_ME',
establishedYear: 2011,
hours: 'Lun-Sam 08h-19h',
```

(Values are clearly sample/preview only; they exercise the real-data branches. Do NOT change `generateUltimateSite` gating.)

- [ ] **Step 2: Regenerate and confirm no errors**

Run: `npx tsx test-site-gen.mts`
Expected: all 10 sectors green, no exceptions.

- [ ] **Step 3: Commit**

```bash
git add test-site-gen.mts
git commit -m "chore(samples): inject sample reviews/rating/hours for preview"
```

---

### Task 9: Full verification + honesty re-check

**Files:**
- Test: `src/lib/__tests__/template-design.test.ts` (already extended in Tasks 1-7)
- Script: `test-site-gen.mts`

- [ ] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no output.

- [ ] **Step 2: Run the full design test suite**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: all tests PASS (existing 12 + new from Tasks 1-7).

- [ ] **Step 3: Regenerate all 10 sectors and assert honesty**

Run: `npx tsx test-site-gen.mts`
Expected: exit 0, all assertions true.

- [ ] **Step 4: Grep generated HTML for forbidden patterns**

Run (PowerShell):
```powershell
Get-ChildItem test-*-*.html | ForEach-Object {
  $c = (Get-Content $_.FullName -Raw)
  if ($c -match 'Avis en attente') { Write-Error "FAIL $($_.Name): Avis en attente" }
  if ($c -match 'undefined|NaN') { Write-Error "FAIL $($_.Name): undefined/NaN" }
}
Write-Output "honesty check done"
```
Expected: "honesty check done" only, no FAIL.

- [ ] **Step 5: Commit any final sample HTML updates**

```bash
git add test-*.html
git commit -m "chore(samples): regenerate enriched sites"
```

---

## Self-Review Notes

- Spec coverage: §4.1 (testimonials) → Task 1; §4.2 (process) → Task 2; §5 hero/services/about/why → Tasks 3-6; §6 (CSS) → Task 7; §7 (sample data) → Task 8; §8/§9 (tests/verify) → Tasks 1-9. Contact map already exists (line 905) — out of scope, no new task.
- Honesty: every new branch gates on real data; the no-data branch shows a CTA + real trust badges only. Tests in Task 1 explicitly forbid fabricated stars/counts.
- Type consistency: `buildTestimonials(content, lang)` and `buildProcess(content, lang)` signatures match their call sites; `pack.bespoke` used for skip logic matches the `SectorCopy.bespoke` union extended earlier.
- No placeholders: each step shows concrete code or exact commands.
