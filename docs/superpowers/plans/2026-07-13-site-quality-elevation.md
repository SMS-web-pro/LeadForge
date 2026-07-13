# Site Quality Elevation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate every AI-generated LeadForge site to a premium, editorial-minimal yet conversion-focused, sector-differentiated template with no empty/broken sections, while keeping all Rapport honesty guarantees.

**Architecture:** Keep the single-string-literal output model of `src/lib/ultimateTemplate.ts` but decompose the monolithic builder into internal section helpers (`buildHero`, `buildServices`, `buildWhyUs`, `buildTrust`, `buildGallery`, `buildContact`, `buildBespoke`). Add a new focused module `src/lib/template/sectorContent.ts` holding per-sector copy packs + a keyword resolver (with a dedicated `dentiste` entry). The external generation API (`generateUltimateSite`, `generateUltimateSiteAsync`) is unchanged.

**Tech Stack:** TypeScript, React 19 / Vite (build only), Vitest 4, Supabase Storage (output target, no code change), Web3Forms (form backend, unchanged).

## Global Constraints

- Keep the single-string-literal output architecture of `ultimateTemplate.ts`; external generation API (`generateUltimateSite`, `generateUltimateSiteAsync`) unchanged.
- Preserve all a11y invariants: contrast ≥ 4.5:1, visible focus, `prefers-reduced-motion`, responsive at 375/768/1024/1440.
- Preserve Rapport honesty: never invent reviews, star ratings, review counts, or prices. Trust elements use only real `lead` data; missing data degrades to non-numeric trust badges.
- No new external runtime dependencies. Custom cursor Vibe stays subtle/guarded.
- The 8 pre-existing failures in `basic.test.ts`/`validation.test.ts` are out of scope — do not "fix" them.
- `tsc --noEmit` must stay clean. The T7 design test must pass (8 → extended invariants).

## File Structure

- **Modify** `src/lib/ultimateTemplate.ts` — (a) refactor builder into section helpers; (b) add visual-elevation CSS tokens + components (glassy nav, trust strip, asymmetric gallery, editorial type scale); (c) implement `buildTrust` (replaces testimonials empty state), `buildGallery` fallback/proof strip, `buildBespoke`, deduped hero, expanded service descriptions. Keep `computeAccentOnDark` and all Soft Evolution tokens.
- **Create** `src/lib/template/sectorContent.ts` — `SectorCopy` type, authored copy packs for the main sectors, `dentiste` pack, and `resolveSectorContent(sector, lang)` with keyword fallback. Pure, typed, no DOM.
- **Modify** `src/lib/template/helpers.ts` — add `getServiceDescriptions(pack, services, lang)` helper (maps service names → 2–3 sentence copy) and `getTrustBadges(lang)`; keep `cleanText`/`getStats`/`getStats`.
- **Modify** `src/lib/__tests__/template-design.test.ts` — replace the `Avis en attente` invariant (lines 53–57) with trust-block invariants; add dedupe / no-empty-section / sector-tailored `why-us` / accent-token invariants.
- **Modify** `test-site-gen.mts` — extend the lead list to 10 sectors (add coiffeur, restaurant, dentiste, avocat, nettoyage, jardin, coach, garage) so regeneration verifies differentiation.

---

### Task 1: Decompose builder into section helpers (output-identical)

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` (inside `generateUltimateSite`)
- Test: `src/lib/__tests__/template-design.test.ts` (must still pass 8/8 after this task)

**Interfaces:**
- Produces (new internal functions, all return `string`, consume the already-destructured `content` + `template` + `lang`):
  - `buildHero(content, template, lang): string`
  - `buildServices(content, lang, serviceDescs: {name:string;desc:string}[]): string`
  - `buildWhyUs(content, whyItems: {title:string;desc:string}[]): string`
  - `buildTrust(content, lang): string`  *(stub for now — returns the current testimonials markup; real impl in Task 6)*
  - `buildGallery(content): string`  *(stub — current gallery logic; real impl in Task 6)*
  - `buildContact(content, lang): string`
  - `buildBespoke(content, template, lang): string`  *(returns `''` for now; real impl in Task 4)*

- [ ] **Step 1: Refactor** — replace the inline section HTML construction in `generateUltimateSite` with calls to the helpers above. Each helper initially returns exactly the markup the inline code produced (no visual change). Keep `navbar`, `footer`, JSON-LD, and the `:root` block inline (they are not sections).

- [ ] **Step 2: Run the existing design test to confirm no regression**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: 8 passed. (This task must NOT alter rendered output.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/ultimateTemplate.ts
git commit -m "refactor(template): extract section builder helpers (output-identical)"
```

---

### Task 2: Visual elevation — editorial + conversion CSS

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` (`:root` token block + component CSS, near the existing Soft Evolution tokens)

**Interfaces:**
- Consumes: existing tokens `--primary`, `--accent`, `--accent-rgb`, `--secondary-rgb`, `--sh-1/2/glow`, `--r*`, `--ease`, `--dur`.
- Produces: new tokens and classes used by later tasks' HTML.

- [ ] **Step 1: Extend `:root` tokens** — add an editorial type scale and trust-strip tokens (append to the existing `:root{...}` string):

```
--fs-display:clamp(2.4rem,5vw,4rem);--fs-h2:clamp(1.7rem,3.2vw,2.4rem);--fs-h3:1.15rem;--lh-body:1.7;--section-py:clamp(64px,9vw,120px);--trust-bg:color-mix(in srgb,var(--accent) 6%,#fff);--hairline:color-mix(in srgb,var(--accent) 14%,var(--border));--maxw:1140px
```

- [ ] **Step 2: Add component CSS** (insert after the existing `.navbar-cta` rules; keep guarded cursor + reduced-motion untouched):

```
.container{max-width:var(--maxw);margin:0 auto;padding:0 24px}
.section{padding:var(--section-py) 0}
h1{font-size:var(--fs-display);line-height:1.05;letter-spacing:-.02em;font-weight:800}
h2{font-size:var(--fs-h2);line-height:1.1;letter-spacing:-.02em;font-weight:800}
.navbar{position:sticky;top:0;z-index:80;backdrop-filter:blur(12px);background:color-mix(in srgb,var(--surface) 82%,transparent);border-bottom:1px solid var(--hairline)}
.trust-strip{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:28px}
.trust-badge{display:inline-flex;align-items:center;gap:8px;background:var(--trust-bg);border:1px solid var(--hairline);color:var(--text);padding:10px 16px;border-radius:999px;font-size:.9rem;font-weight:600}
.trust-badge i{color:var(--accent)}
.gal-grid{grid-template-columns:2fr 1fr 1fr}
@media(max-width:768px){.gal-grid{grid-template-columns:1fr 1fr}.trust-strip{gap:8px}}
```

- [ ] **Step 3: Apply tokens** — in existing component rules, swap hardcoded paddings for `var(--section-py)` on `.section` equivalents and set `h1`/`h2` to use the new scale where they currently use ad-hoc `clamp(...)`. Do not remove the reduced-motion or `cursor-dot` CSS.

- [ ] **Step 4: Verify no a11y regression + tsc**

Run: `npx tsc --noEmit` → expect exit 0.
Run: `npx vitest run src/lib/__tests__/template-design.test.ts` → expect 8 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): elevate visual system (editorial scale, glassy nav, trust strip)"
```

---

### Task 3: Sector copy packs + keyword resolver + Dentiste fix

**Files:**
- Create: `src/lib/template/sectorContent.ts`
- Modify: `src/lib/template/helpers.ts` (add `getServiceDescriptions`, `getTrustBadges`)

**Interfaces:**
- Produces: `resolveSectorContent(sector: string, lang: 'fr'|'en'): SectorCopy` and helpers used by Tasks 4–6.
- `SectorCopy` shape:

```ts
export interface SectorCopy {
  whyUs: { title: string; desc: string }[];        // 3-4 items, sector-specific
  services: { name: string; desc: string }[];       // matches the sector template's canonical services
  faq: { q: string; a: string }[];                   // 3-4 sector-specific Q&As
  bespoke: 'restaurant' | 'coach' | 'medical' | 'artisan' | null;
  trustBadges: string[];                             // shown only when no real rating
}
```

- [ ] **Step 1: Write `sectorContent.ts`** with authored packs for at least: `electricien`, `plombier`, `coiffeur`, `restaurant`, `dentiste` (dedicated dental services — NOT generic medical), `avocat`, `nettoyage`, `jardin`, `coach` (fitness), `garage`, `medical`, `default`. Each pack: 3–4 `whyUs` items with concrete, sector-relevant copy (no identical generic list across sectors); `services` entries with 2–3 sentence descriptions; 3–4 `faq`. Example `dentiste`:

```ts
dentiste: {
  whyUs: [
    { title: 'Soins indolores', desc: 'Des techniques modernes et une attention à votre confort à chaque rendez-vous.' },
    { title: 'Hygiène stricte', desc: 'Protocoles de stérilisation conformes aux normes les plus exigeantes.' },
    { title: 'Urgences prises en charge', desc: 'Un créneau dédié aux douleurs et urgences dentaires.' },
    { title: 'Suivi personnalisé', desc: 'Un plan de prévention adapté à votre histoire bucco-dentaire.' },
  ],
  services: [
    { name: 'Soins dentaires', desc: 'Consultations, détartrage et traitements conservateurs pour préserver votre santé bucco-dentaire au quotidien.' },
    { name: 'Blanchiment', desc: 'Un éclaircissement professionnel et sécurisé pour un sourire visiblement plus lumineux.' },
    { name: 'Orthodontie', desc: 'Aligneurs transparents et appareils pour corriger la position des dents à tout âge.' },
    { name: 'Urgence dentaire', desc: 'Prise en charge rapide des douleurs, infections et traumatismes dentaires.' },
    { name: 'Implantologie', desc: 'Remplacement durable d’une dent manquante par un implant titane et sa couronne.' },
    { name: 'Esthétique du sourire', desc: 'Facettes et contouring pour harmoniser la forme et la couleur de votre sourire.' },
  ],
  faq: [ /* 3-4 dental Q&As */ ],
  bespoke: 'medical',
  trustBadges: ['Devis clair', 'Urgences 7j/7', 'Hygiène certifiée'],
},
```

- [ ] **Step 2: Implement `resolveSectorContent(sector, lang)`** — exact-sector match first; else keyword fallback (e.g. `dentiste|orthodont|blanch` → `dentiste`; `avocat|jurid|notaire` → `avocat`; `coach|sport|fitness` → `coach`; `restaurant|cuisin|traiteur` → `restaurant`; `nettoy|ménage|menage` → `nettoyage`; `jardin|paysag|arbor` → `jardin`; `garage|mécan|auto` → `garage`; `électric|plomb|renov|peintr|chauffag` → `artisan`; `médic|clinique|kiné|pharmac|optic|infirm|ostéo|sage` → `medical`); else `default`. Return the matched pack for the requested `lang` (author both `fr` and `en` variants in each pack).

- [ ] **Step 3: Add helpers** in `helpers.ts`:

```ts
export function getServiceDescriptions(pack: SectorCopy, services: { name: string }[], lang: 'fr'|'en'): { name: string; desc: string }[] {
  return services.map(s => {
    const found = pack.services.find(p => p.name.toLowerCase() === s.name.toLowerCase());
    return { name: s.name, desc: found ? found.desc : `${s.name} : un service professionnel, adapté à vos besoins.` };
  });
}
export function getTrustBadges(lang: 'fr'|'en'): string[] {
  return lang === 'fr'
    ? ['Devis gratuit', 'Réponse rapide', 'Garantie satisfaction', 'Équipe certifiée']
    : ['Free quote', 'Fast response', 'Satisfaction guarantee', 'Certified team'];
}
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit` → expect exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/template/sectorContent.ts src/lib/template/helpers.ts
git commit -m "feat(content): sector copy packs + keyword resolver + dentiste fix"
```

---

### Task 4: Bespoke blocks per sector family

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` (`buildBespoke`)
- Consumes: `resolveSectorContent(...).bespoke` from Task 3

**Interfaces:**
- `buildBespoke(content, pack: SectorCopy, lang): string` returns a section HTML string or `''`.

- [ ] **Step 1: Implement `buildBespoke`** — switch on `pack.bespoke`:
  - `'restaurant'` → "Carte & Horaires" card using `content` hours + a few specialties from `pack.services`.
  - `'coach'` → "Nos Programmes" 3-column block (Personnalisé / Collectif / Préparation) from `pack`.
  - `'medical'` → "Nos Soins" care grid from `pack.services`.
  - `'artisan'` → "Certifications & Garanties" credentials strip (e.g. RGE, assurance, devis) — use only generic, non-fabricated labels.
  - `null` → `''`.

- [ ] **Step 2: Wire into `generateUltimateSite`** — call `buildBespoke(content, pack, lang)` after `buildServices` (or after `buildWhyUs`), only when it returns non-empty.

- [ ] **Step 3: Verify + test**

Run: `npx tsc --noEmit` (exit 0) and `npx vitest run src/lib/__tests__/template-design.test.ts` (8 passed).

- [ ] **Step 4: Commit**

```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): sector bespoke blocks (restaurant/coach/medical/artisan)"
```

---

### Task 5: Content expansion (services, hero dedupe, About/Approche, FAQ)

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` (`buildHero`, `buildServices`, `buildWhyUs`, About/"Notre Approche" markup)
- Consumes: `getServiceDescriptions` + `resolveSectorContent` (Task 3)

**Interfaces:**
- `buildServices(content, lang, descs)` now receives the 2–3 sentence `descs` from `getServiceDescriptions`.

- [ ] **Step 1: Hero dedupe** — ensure the hero renders exactly ONE subtitle. Locate the current duplicate (the same phrase appears twice in the hero/sub-hero) and remove the second occurrence. Keep `content.heroSubtitle` as the single source.

- [ ] **Step 2: Service descriptions** — in `generateUltimateSite`, compute `const descs = getServiceDescriptions(pack, content.services, lang);` and pass to `buildServices`. Each card shows the 2–3 sentence `desc`.

- [ ] **Step 3: Why-us from pack** — pass `pack.whyUs` into `buildWhyUs` instead of the generic `ADV_DESC` loop, so every sector shows tailored advantages.

- [ ] **Step 4: Enrich About / "Notre Approche"** — use `pack`-informed copy; avoid generic filler. Keep `cleanText` applied to any lead-provided text.

- [ ] **Step 5: FAQ from pack** — render `pack.faq` instead of the current generic FAQ builder.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` (exit 0) and `npx vitest run src/lib/__tests__/template-design.test.ts` (8 passed).

- [ ] **Step 7: Commit**

```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(content): expanded service/about/faq copy, deduped hero, tailored why-us"
```

---

### Task 6: Trust block + gallery fallback (no empty sections)

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` (`buildTrust`, `buildGallery`)
- Consumes: `content.rating`, `content.reviews` (real lead data), `getTrustBadges` (Task 3)

**Interfaces:**
- `buildTrust(content, lang): string` — replaces the old testimonials empty state.
- `buildGallery(content): string` — returns gallery, or a proof strip, or `''`.

- [ ] **Step 1: Implement `buildTrust`**

```ts
function buildTrust(c: any, lang: 'fr'|'en'): string {
  const rating = c.rating, reviews = c.reviews;
  if (rating && reviews) {
    const stars = '★★★★★'.slice(0, Math.round(rating)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(rating));
    return `<section class="section trust"><div class="container"><div class="trust-card">
      <div class="trust-score">${stars} <strong>${rating}/5</strong></div>
      <p class="trust-meta">Basé sur ${reviews} avis vérifiés Google</p>
      <div class="trust-strip">${['Devis gratuit','Réponse rapide','Garantie satisfaction'].map(b=>`<span class="trust-badge"><i data-lucide="check-circle"></i> ${b}</span>`).join('')}</div>
    </div></div></section>`;
  }
  const badges = getTrustBadges(lang);
  return `<section class="section trust"><div class="container"><div class="trust-card">
    <h2>Ils nous font confiance</h2>
    <div class="trust-strip">${badges.map(b=>`<span class="trust-badge"><i data-lucide="check-circle"></i> ${b}</span>`).join('')}</div>
  </div></div></section>`;
}
```
Never output `"Avis en attente"` or any fabricated quote/number. Heading uses "Ils nous font confiance" when no real reviews.

- [ ] **Step 2: Implement `buildGallery`** — if `content.galleryImages?.length` → render asymmetric grid (Task 2 CSS). Else if any of `content.heroImage`/`content.serviceImages`/`content.aboutImage` exist → reuse them to fill the grid. Else return `''` (suppressed) so no empty section appears; the trust strip (Task 2/6) keeps the page full.

- [ ] **Step 3: Wire** — `generateUltimateSite` calls `buildTrust(content, lang)` in place of the old testimonials block, and `buildGallery(content)` for the gallery.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` (exit 0) and `npx vitest run src/lib/__tests__/template-design.test.ts` (8 passed — the `Avis en attente` test is updated in Task 7, so temporarily it may fail; see Task 7).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): trust block (real rating or badges) + gallery fallback"
```

---

### Task 7: Extend T7 invariants + regenerate samples

**Files:**
- Modify: `src/lib/__tests__/template-design.test.ts`
- Modify: `test-site-gen.mts` (10 sectors)

**Interfaces:**
- Consumes: `generateUltimateSite` / `generateUltimateSiteAsync`, `resolveSectorContent` (Task 3).

- [ ] **Step 1: Replace the `Avis en attente` test (lines 53–57)** with trust-block invariants:

```ts
it('shows a trust block, never "Avis en attente"', () => {
  const noReviews = generateUltimateSite({ ...lead, googleRating: 0, googleReviews: 0 } as any, undefined);
  expect(noReviews).not.toContain('Avis en attente');
  expect(noReviews).toContain('trust-badge');
  const withReviews = generateUltimateSite(lead as any, undefined);
  expect(withReviews).toContain('avis vérifiés Google');
  expect(withReviews).toContain('trust-card');
});
```

- [ ] **Step 2: Add new invariants**

```ts
it('has no duplicate hero subtitle', () => {
  const h = build();
  const subs = [...h.matchAll(/<p class="hero-sub[^"]*"[^>]*>([\s\S]*?)<\/p>/g)].map(m => m[1].trim());
  const uniq = new Set(subs);
  expect(uniq.size).toBe(subs.length);
});
it('renders no empty <section>', () => {
  const h = build();
  const sections = [...h.matchAll(/<section[^>]*>([\s\S]*?)<\/section>/g)].map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
  expect(sections.every(s => s.length > 20)).toBe(true);
});
it('uses sector-tailored why-us (not the generic 4-list)', () => {
  const h = build();
  expect(h).not.toContain('Équipe Qualifiée'); // generic default must not appear for mapped sectors
  expect(h).toContain('Pourquoi nous choisir');
});
it('declares accent-driven tokens', () => {
  const h = build();
  expect(h).toContain('--accent-rgb');
  expect(h).toContain('--secondary-rgb');
});
```

- [ ] **Step 3: Update `test-site-gen.mts`** to generate 10 sectors (electricien, plombier, coiffeur, restaurant, dentiste, avocat, nettoyage, jardin, coach, garage) and assert that for each: no `undefined`/`NaN`, no `Avis en attente`, `trust-badge` present, and `why-us` differs from the generic list.

- [ ] **Step 4: Run full design suite + tsc + regenerate**

Run: `npx tsc --noEmit` (exit 0)
Run: `npx vitest run src/lib/__tests__/template-design.test.ts` → expect ALL invariants pass (including the 4 new ones).
Run: `npx tsx test-site-gen.mts` → expect 10 files written, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/__tests__/template-design.test.ts test-site-gen.mts
git commit -m "test(template): extend design invariants (trust block, no-empty, tailored why-us)"
```

---

### Task 8: Final broad review + merge prep

**Files:**
- Review: entire `feature/site-quality-elevation` diff vs `feature/soft-evolution-redesign`

- [ ] **Step 1: Run a final whole-branch review** (code-reviewer subagent) over `git diff feature/soft-evolution-redesign...HEAD`, focusing on: a11y preserved, no fabricated data, sector differentiation actually varies, no regressions in the 8 original T7 invariants, tsc clean.

- [ ] **Step 2: Confirm green**

Run: `npx tsc --noEmit` (exit 0) and `npx vitest run src/lib/__tests__/template-design.test.ts` (all pass). Note the 8 pre-existing `basic`/`validation` failures as out-of-scope.

- [ ] **Step 3: Summarize for the user** — list what changed per sector, confirm no empty sections, and offer to open a PR / merge.

- [ ] **Step 4: Commit any review-fixups** (each as its own commit) and do NOT merge without explicit user request.

---

## Self-Review (done at write time)

- **Spec coverage:** §3 visual → Task 2; §4 personality → Tasks 3,4,5; §5 content → Task 5; §6 no-empty → Task 6 (+ Task 7 test); §7 engineering/tests → Tasks 1,7,8. All covered.
- **Placeholder scan:** no TBD/TODO; every code step has a concrete block or exact instruction.
- **Type consistency:** `SectorCopy`, `resolveSectorContent`, `getServiceDescriptions`, `getTrustBadges` names match across Tasks 3–7; `buildTrust`/`buildGallery`/`buildBespoke` signatures consistent between definition (Tasks 4,6) and wiring (Tasks 4,5,6).
