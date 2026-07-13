# Soft Evolution System — Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate LeadForge's generated website template to a coherent "Soft UI Evolution" premium aesthetic that stays dynamic per sector, mobile/SEO/accessibility-safe, with a subtle "Vibe" interactive layer.

**Architecture:** Add one global CSS design-token layer to the existing single-file template (`ultimateTemplate.ts`), apply soft shadows / larger radii / accent tints to existing section components, add a CSS-only hero mesh, harden `prefers-reduced-motion` + `:focus-visible`, and add a light custom-cursor dot guarded by `pointer:fine` + reduced-motion. No new dependencies; minimal guarded JS.

**Tech Stack:** TypeScript (React/Vite project), template literal HTML+CSS+JS string, vitest for tests, `generateUltimateSite` (sync) for test builds.

## Global Constraints

- Single `<h1>` per generated page (keep hero only).
- All interactive elements: `cursor:pointer`, visible `:focus-visible` ring, hover transition 150–300ms.
- No emoji icons — lucide (`data-lucide`) only.
- Light-mode text/CTA contrast ≥ 4.5:1; no neon; no AI purple-pink gradients.
- Responsive at 375 / 768 / 1024 / 1440.
- Custom cursor + scroll reveals: **auto-disabled** when `prefers-reduced-motion: reduce` OR `pointer: coarse` (touch) OR viewport < 768px.
- Zero new external dependencies; keep `sectorConfig`-driven dynamic copy (no hardcoded sector strings).
- `tsc` must pass; regenerate both test sites after changes.

## File Structure

- `src/lib/ultimateTemplate.ts` — main template. Edit `:root` token block (line ~837), base layer (838-842), hero CSS (870-897), hero HTML (1220-1222), card CSS (svc/guar/test/contact/about), add reduced-motion media query + cursor CSS, extend the `<script>` block (1522-1537) with guarded cursor logic.
- `src/lib/template/ui.ts` — add FR/EN eyebrow label strings (`eyebrowServices`, `eyebrowAbout`, etc.) consumed by sections.
- `src/lib/sectorConfig.ts` — add an optional per-sector `accentTint` note / verify palettes meet contrast (read-only verification; add `theme` token only if missing).
- `src/lib/__tests__/template-design.test.ts` — NEW acceptance test asserting design invariants.
- `test-site-gen.mts` — (no change) used to regenerate test sites.

---

### Task 1: Design-token layer in `:root` + base layer

**Files:**
- Modify: `src/lib/ultimateTemplate.ts:837` (`:root` block)
- Modify: `src/lib/ultimateTemplate.ts:838-842` (base reset / body / headings)

**Interfaces:**
- Consumes: existing `--primary`, `--primary-rgb`, `--secondary`, `--accent`, `--accent-dark`, `--bg`, `--surface`, `--text`, `--text-s`, `--text-t`, `--border`, `--border-l`, `--dark`, `--dark-rgb`.
- Produces: new tokens `--r-sm`, `--r`, `--r-lg`, `--r-xl`, `--sh-1`, `--sh-2`, `--sh-glow`, `--accent-soft`, `--ease`, `--dur` used by all later tasks.

- [ ] **Step 1: Expand the `:root` block** (replace line 837) with tokens added:

```css
:root{--primary:${primaryColor};--primary-rgb:${primaryRgb};--secondary:${secondaryColor};--accent:${accentColor};--accent-dark:${accentOnDark};--bg:#f7f8fb;--surface:#fff;--text:#161a2b;--text-s:#51566e;--text-t:#868aa3;--border:#e6e8f0;--border-l:#f1f2f7;--dark:#16203c;--dark-rgb:22,32,60;--deco-rotation:${decoRotation}deg;--deco-scale:${decoScale};--accent-opacity:${accentOpacity};--section-shape:${sectionShape};--r-sm:10px;--r:16px;--r-lg:24px;--r-xl:32px;--sh-1:0 1px 2px rgba(16,24,40,.04),0 6px 20px rgba(16,24,40,.06);--sh-2:0 8px 24px rgba(16,24,40,.10),0 18px 48px rgba(16,24,40,.10);--sh-glow:0 14px 44px rgba(var(--primary-rgb),.28);--accent-soft:color-mix(in srgb,var(--accent) 9%,#fff);--ease:cubic-bezier(.22,1,.36,1);--dur:220ms}
```

- [ ] **Step 2: Add base layer rules** after line 842 (append to the base declarations):

```css
a,button,[role="button"]{cursor:pointer}
:focus-visible{outline:2px solid var(--primary);outline-offset:3px;border-radius:4px}
::selection{background:color-mix(in srgb,var(--accent) 22%,#fff);color:var(--text)}
img{max-width:100%;height:auto;display:block}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (CSS is inside a string, so this just confirms TS still compiles).

- [ ] **Step 4: Commit**

```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): add Soft Evolution design tokens + base a11y layer"
```

---

### Task 2: Hero "Soft Evolution" mesh + refined CTAs

**Files:**
- Modify: `src/lib/ultimateTemplate.ts:870-897` (`.hero` CSS)
- Modify: `src/lib/ultimateTemplate.ts:1220-1222` (hero HTML: add mesh layer)

**Interfaces:**
- Consumes: `--primary`, `--secondary`, `--accent`, `--dark-rgb`, `--accent-soft`, `--sh-glow`, `--r`, `--ease`, `--dur` from Task 1.
- Produces: `.hero-mesh` layer + contrast-safe `.hero .btn-pri`/`.btn-sec` used by all pages.

- [ ] **Step 1: Add hero mesh + keep contrast-safe CTAs.** Replace the `.hero` block (lines 870-897) with:

```css
.hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:var(--dark);padding-top:36px}
.hero-mesh{position:absolute;inset:0;z-index:1;background:
  radial-gradient(60% 70% at 18% 20%,rgba(var(--primary-rgb),.35) 0%,transparent 60%),
  radial-gradient(50% 60% at 85% 15%,rgba(var(--accent-rgb,120,120,160),.30) 0%,transparent 55%),
  radial-gradient(70% 80% at 75% 90%,rgba(var(--secondary-rgb,80,90,140),.28) 0%,transparent 60%);
  filter:saturate(1.05);opacity:.95;transition:opacity .6s}
.hero-bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.45;z-index:0;transition:opacity .6s}
.hero-overlay{position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(var(--dark-rgb),.72) 0%,rgba(var(--dark-rgb),.55) 45%,rgba(var(--dark-rgb),.82) 100%)}
.hero-inner{position:relative;z-index:10;max-width:1400px;margin:0 auto;padding:130px 32px 80px;width:100%;display:grid;grid-template-columns:1.1fr 360px;gap:56px;align-items:center}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.20);padding:9px 20px;border-radius:100px;color:#fff;font-size:.78rem;font-weight:600;margin-bottom:24px;letter-spacing:.6px;text-transform:uppercase;backdrop-filter:blur(10px)}
.hero h1{font-size:clamp(2.4rem,5vw,3.7rem);font-weight:800;color:#fff;margin-bottom:20px;letter-spacing:-.03em;line-height:1.08;text-shadow:0 2px 24px rgba(0,0,0,.25)}
.hero h1 em{font-style:normal;color:var(--accent-dark);position:relative}
.hero-sub{font-size:1.12rem;color:rgba(255,255,255,.86);max-width:540px;margin-bottom:36px;line-height:1.8;text-shadow:0 1px 12px rgba(0,0,0,.2)}
.hero-actions{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:40px}
.btn-pri{display:inline-flex;align-items:center;gap:10px;background:var(--primary);color:#fff;padding:16px 32px;border-radius:14px;text-decoration:none;font-weight:700;font-size:.95rem;transition:all var(--dur) var(--ease);border:none;cursor:pointer;box-shadow:var(--sh-glow),0 0 0 1px rgba(255,255,255,.08) inset}
.btn-pri:hover{transform:translateY(-2px);box-shadow:0 20px 50px rgba(var(--primary-rgb),.42)}
.btn-sec{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.26);color:#fff;padding:16px 32px;border-radius:14px;text-decoration:none;font-weight:600;font-size:.95rem;transition:all var(--dur) var(--ease);backdrop-filter:blur(8px)}
.btn-sec:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.4)}
.hero-rating{display:flex;align-items:center;gap:10px}
.hero-stars{display:flex;gap:2px;color:#fbbf24}
.hero-rating-text{font-size:.88rem;color:rgba(255,255,255,.72)}
.hero-card{background:rgba(255,255,255,.10);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.16);border-radius:var(--r-lg);padding:36px;color:#fff;box-shadow:var(--sh-2)}
.hero-card-title{font-size:.74rem;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:rgba(255,255,255,.5);margin-bottom:24px}
.hero-hours{margin-bottom:28px}
.hero-hours-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);font-size:.92rem}
.hero-hours-row:last-child{border:none}
.hero-hours-day{color:rgba(255,255,255,.7)}
.hero-hours-time{font-weight:600}
.hero-card .btn-pri{width:100%;justify-content:center;margin-top:18px}
.hero-card-note{text-align:center;font-size:.78rem;color:rgba(255,255,255,.45);margin-top:12px}
@media(max-width:900px){.hero-inner{grid-template-columns:1fr;padding:110px 20px 60px}.hero-card{display:none}.hero-actions{flex-direction:column;align-items:stretch}.btn-pri,.btn-sec{justify-content:center}}
@media(max-width:480px){.hero h1{font-size:2rem}.hero-sub{font-size:1rem}.hero-badge{font-size:.7rem;padding:6px 16px}.hero-rating-text{font-size:.8rem}.hero-inner{padding:100px 16px 40px}}
```

- [ ] **Step 2: Add the mesh layer to hero HTML.** Replace lines 1220-1222:

```html
    <section class="hero" id="hero">
        <img src="${proxiedImg(heroImage)}" ${heroImgErr} alt="${companyName}" class="hero-bg">
        <div class="hero-mesh"></div>
        <div class="hero-overlay"></div>
```

- [ ] **Step 3: Typecheck + regenerate**

Run: `npx tsc --noEmit`
Expected: no errors. (Visual check in Task 8.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): Soft Evolution hero mesh + contrast-safe CTAs"
```

---

### Task 3: Elevate cards with soft shadows, radii, accent tints

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` CSS selectors (svc-card 947-953, guar-card 978-979, test-card 1007-1008, contact-form 1039, about-img 919, why-stat 966, proc-num 1022).

**Interfaces:**
- Consumes: `--r`, `--r-lg`, `--sh-1`, `--sh-2`, `--accent-soft`, `--ease`, `--dur` from Task 1.
- Produces: consistent soft-card look across services/guarantees/testimonials/contact/about.

- [ ] **Step 1: Add a consolidated card-elevation CSS block.** Insert after the `.svc-link:hover` rule (line 959), before the `@media(max-width:768px){.svc-grid...}`:

```css
/* Soft Evolution card elevation */
.svc-card{border-radius:var(--r-lg);box-shadow:var(--sh-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.svc-card:hover{border-color:color-mix(in srgb,var(--primary) 40%,var(--border));box-shadow:var(--sh-2);transform:translateY(-6px)}
.svc-card-img{transition:transform .6s var(--ease);border-bottom:1px solid var(--border-l)}
.guar-card{border-radius:var(--r-lg);box-shadow:var(--sh-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease)}
.guar-card:hover{transform:translateY(-4px);box-shadow:var(--sh-2)}
.guar-icon{background:var(--accent-soft)}
.test-card{border-radius:var(--r-lg);box-shadow:var(--sh-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease)}
.test-card:hover{box-shadow:var(--sh-2);transform:translateY(-4px)}
.contact-form{border-radius:var(--r-lg);box-shadow:var(--sh-1)}
.about-img{border-radius:var(--r-lg);box-shadow:var(--sh-2)}
.why-stat{border-radius:var(--r);transition:transform var(--dur) var(--ease),background var(--dur) var(--ease)}
.why-stat:hover{transform:translateY(-3px)}
.proc-num{border-radius:50%;transition:all var(--dur) var(--ease)}
.proc-step:hover .proc-num{box-shadow:var(--sh-glow)}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): soft shadow/radius elevation on cards"
```

---

### Task 4: Reduced-motion hardening + reveal stagger

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` — add `prefers-reduced-motion` media query; refine `.reveal` (line 1093-1094).

**Interfaces:**
- Consumes: `--dur`, `--ease` from Task 1; existing `.reveal`/`.reveal.active` and `.reveal-d1/2/3`.
- Produces: motion-safe reveals; all animations disabled under reduced-motion.

- [ ] **Step 1: Replace `.reveal` rules (lines 1093-1094)** with staggered + reduced-motion-safe version:

```css
.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
.reveal.active{opacity:1;transform:translateY(0)}
.reveal-d1{transition-delay:.06s}.reveal-d2{transition-delay:.14s}.reveal-d3{transition-delay:.22s}
@media(prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
  .reveal{opacity:1!important;transform:none!important}
  .hero-mesh{opacity:.8!important}
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): reduced-motion hardening + reveal stagger"
```

---

### Task 5: Light custom-cursor "Vibe" (guarded)

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` — add `.cursor-dot` CSS near cursor section (after `.float-urgent` block ~1091); extend `<script>` (1522-1537).

**Interfaces:**
- Consumes: `--primary`, `--accent-dark`, reduced-motion media query from Task 4.
- Produces: subtle follower dot; active only on fine-pointer, non-reduced-motion, ≥768px.

- [ ] **Step 1: Add cursor CSS** after the `.float-urgent` media query (line 1091):

```css
.cursor-dot{position:fixed;top:0;left:0;width:8px;height:8px;border-radius:50%;background:var(--accent-dark);pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .2s var(--ease),height .2s var(--ease),background .2s var(--ease);mix-blend-mode:difference;opacity:0}
.cursor-dot.is-active{opacity:1}
.cursor-dot.is-hover{width:34px;height:34px;background:rgba(255,255,255,.6)}
@media(pointer:coarse),(max-width:767px),(prefers-reduced-motion:reduce){.cursor-dot{display:none!important}}
```

- [ ] **Step 2: Extend the `<script>` block.** After the existing `lucide.createIcons();` line (1523), insert the guarded cursor logic (inside the same `<script>`):

```javascript
        (function(){
          var fine = window.matchMedia('(pointer:fine)').matches;
          var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
          if(!fine || reduce) return;
          var dot=document.createElement('div');dot.className='cursor-dot';document.body.appendChild(dot);
          var rx=false;
          window.addEventListener('mousemove',function(e){dot.classList.add('is-active');dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';});
          window.addEventListener('mouseover',function(e){if(e.target.closest('a,button,[role="button"],input,textarea,select,.svc-card,.guar-card,.test-card'))dot.classList.add('is-hover');});
          window.addEventListener('mouseout',function(e){if(e.target.closest('a,button,[role="button"],input,textarea,select,.svc-card,.guar-card,.test-card'))dot.classList.remove('is-hover');});
          document.addEventListener('mouseleave',function(){dot.classList.remove('is-active');});
        })();
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (script is inside a string).

- [ ] **Step 4: Commit**

```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): subtle guarded custom-cursor Vibe"
```

---

### Task 6: Eyebrow labels (FR/EN) in ui.ts

**Files:**
- Modify: `src/lib/template/ui.ts` — add eyebrow strings to the `ui` object (follow existing `section-label` usage).
- Modify: `src/lib/ultimateTemplate.ts` — use `ui.eyebrowServices` etc. in section headers (replaces or augments `section-label`).

**Interfaces:**
- Consumes: `ui` object shape from `ui.ts`.
- Produces: `eyebrowServices`, `eyebrowAbout`, `eyebrowWhy`, `eyebrowGuarantees`, `eyebrowTestimonials`, `eyebrowContact` (fr/en) strings.

- [ ] **Step 1: Add eyebrow strings to `ui.ts`.** Find the section-label definitions and add alongside (mirror existing fr/en pattern):

```ts
eyebrowServices: { fr: 'Nos prestations', en: 'Our services' },
eyebrowAbout: { fr: 'À propos', en: 'About us' },
eyebrowWhy: { fr: 'Pourquoi nous', en: 'Why us' },
eyebrowGuarantees: { fr: 'Nos engagements', en: 'Our guarantees' },
eyebrowTestimonials: { fr: 'Ils nous font confiance', en: 'What clients say' },
eyebrowContact: { fr: 'Contact', en: 'Get in touch' },
```

- [ ] **Step 2: Wire eyebrows into section headers.** In `ultimateTemplate.ts`, change the services/about/why/guarantees/testimonials/contact `section-label` or add a second eyebrow line. Example for services (line 1268):

```html
<span class="section-label">${ui.eyebrowServices[lang]}</span>
```

Apply the matching `ui.eyebrow*` for about (`ui.eyebrowAbout`), why (`ui.eyebrowWhy`), guarantees, testimonials, contact. Keep the existing `servicesTitle`/`svcTitle` as the `<h2>`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/template/ui.ts src/lib/ultimateTemplate.ts
git commit -m "feat(template): editorial eyebrow labels (FR/EN)"
```

---

### Task 7: Acceptance test for design invariants

**Files:**
- Create: `src/lib/__tests__/template-design.test.ts`

**Interfaces:**
- Consumes: `generateUltimateSite(lead, undefined)` from `ultimateTemplate.ts`.
- Produces: a vitest test asserting Single-`h1`, `prefers-reduced-motion` present, `:focus-visible` present, custom cursor guarded (`.cursor-dot` + `pointer:fine` guard), lucide-only icons (no emoji), reveal present.

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { generateUltimateSite } from '../ultimateTemplate';

const lead = {
  name: 'Electra Paris Électricité',
  sector: 'Électricien',
  city: 'Paris',
  phone: '+33 1 84 80 00 00',
  email: 'contact@electra-paris.fr',
  address: '12 Rue de Rivoli',
  googleRating: 4.8,
  googleReviews: 127,
  description: "Électricien certifié RGE intervenant à Paris.",
  website: 'https://electra-paris.fr',
  hours: 'Lun-Ven 08h-19h',
  establishedYear: 2009,
};

function build() {
  return generateUltimateSite(lead as any, undefined);
}

describe('Soft Evolution design invariants', () => {
  const html = build();
  it('has exactly one <h1>', () => {
    const m = html.match(/<h1/g) || [];
    expect(m.length).toBe(1);
  });
  it('hardens prefers-reduced-motion', () => {
    expect(html).toContain('prefers-reduced-motion');
  });
  it('provides a :focus-visible ring', () => {
    expect(html).toContain(':focus-visible');
  });
  it('guards the custom cursor by pointer:fine + reduced-motion', () => {
    expect(html).toContain('cursor-dot');
    expect(html).toContain("matchMedia('(pointer:fine)')");
    expect(html).toContain('prefers-reduced-motion:reduce');
  });
  it('uses lucide icons (no emoji icons)', () => {
    expect(html).toContain('data-lucide');
    expect(html).not.toMatch(/class="[^"]*\b(emoji|😀|⭐|🔧|🔌)\b/);
  });
  it('keeps scroll reveal present', () => {
    expect(html).toContain('class="reveal');
  });
  it('has no undefined/NaN leaks', () => {
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('NaN');
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: all 7 tests PASS. (If `generateUltimateSite` requires a fuller `aiContent` shape, build with `generateUltimateSiteAsync(lead, undefined, '')` inside an async test instead.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/template-design.test.ts
git commit -m "test(template): Soft Evolution design-invariant acceptance tests"
```

---

### Task 8: Regenerate test sites + full verification

**Files:**
- Run: `test-site-gen.mts` (already exists).

**Interfaces:**
- Consumes: `generateUltimateSiteAsync` + both leads.
- Produces: refreshed `test-electricien-paris.html`, `test-plombier-lyon.html`.

- [ ] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Run unit tests**

Run: `npx vitest run`
Expected: all tests PASS (including `template-design.test.ts` and existing `validation.test.ts`).

- [ ] **Step 3: Regenerate both test sites**

Run: `npx tsx test-site-gen.mts` (or `node --import tsx test-site-gen.mts`)
Expected: both HTML files written; console logs show `hasReveal:true`, `noUndefined:true`, `noNaN:true`, hero image starts with `https://`.

- [ ] **Step 4: Spot-check generated HTML for invariants**

Run:
```powershell
Select-String -Path test-electricien-paris.html -Pattern 'prefers-reduced-motion|cursor-dot|:focus-visible|class="reveal' | Select-Object -First 8
```
Expected: matches for each pattern.

- [ ] **Step 5: Commit (if any regeneration differs)**

```bash
git add test-electricien-paris.html test-plombier-lyon.html
git commit -m "chore: regenerate test sites with Soft Evolution design" 
```
(Only if the generated files changed.)

---

## Self-Review

**1. Spec coverage:** Design tokens (Task 1) ✓; color/theme (Task 1 `--accent-soft`/tints, no neon) ✓; typography (Task 2 hero scale, base) ✓; hero restructure + mesh (Task 2) ✓; component elevation (Task 3) ✓; interactions/Vibe (Task 4 reveals, Task 5 cursor) ✓; a11y/perf/seo (Task 1 focus-visible, Task 4 reduced-motion) ✓; dynamic per sector (all tokens sector-driven, ui.ts FR/EN) ✓; anti-patterns (no emoji, cursor:pointer, focus, reduced-motion) ✓; success criteria (tsc, regen, single h1, guarded cursor) ✓.

**2. Placeholder scan:** No TBD/TODO. Each step has concrete code or exact command + expected output.

**3. Type consistency:** Tokens `--r`, `--sh-1`, `--accent-soft`, `--ease`, `--dur` defined in Task 1 and consumed in Tasks 2-3. `ui.eyebrow*` defined Task 6 and referenced same task. `:focus-visible` / `prefers-reduced-motion` produced Task 1/4 and asserted Task 7. Names consistent.

**Note:** `generateUltimateSite` sync may internally call async image fetchers; if the test in Task 7 fails due to missing async context, switch to `generateUltimateSiteAsync(lead, undefined, '')` in an `it(async () => ...)`. The plan documents this fallback in Step 2.
