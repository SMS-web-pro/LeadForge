# R4 — buildUltimateHTML content fixes (Rapport re-application)

**Context:** Re-applying the reverted "Rapport de corrections". R1–R3 added `cleanText`/`getStats` and wired real-data flags + removed fake-review padding. This task edits the `buildUltimateHTML` builder to: gate rating displays on real data, render honest stats, show a tasteful placeholder when there are no real reviews, add a GDPR consent checkbox, make the footer description distinct, fix the map pin to the exact address, make service-image alt text city-aware, and remove the redundant `process` section + the useless `cta-banner` ("Envie d'en savoir plus ?"). Hero CTA contrast was already handled in Task 2 — do NOT re-touch hero CSS.

**Files**
- Modify: `src/lib/ultimateTemplate.ts` — import `getStats`, destructure new fields, and edit the listed HTML/CSS regions.

## Steps (apply each exact replacement)

### Step1: Import getStats
Change:
```ts
import { cleanText } from './template/helpers';
```
to:
```ts
import { cleanText, getStats } from './template/helpers';
```

### Step2: Destructure new fields
In `buildUltimateHTML`, the destructuring line:
```ts
  const { companyName, heroTitle, heroSubtitle, aboutText, services, serviceImages, galleryImages, realPhotos, testimonials, phone, email, address, website, city, ctaText, rating, reviews, slogan, heroImage, allImages, galleryTitle, aboutTitle, servicesTitle, accentOnDark, hours: leadHours, establishedYear } = content;
```
add `footerDesc, hasRealRating, hasRealReviews`:
```ts
  const { companyName, heroTitle, heroSubtitle, aboutText, services, serviceImages, galleryImages, realPhotos, testimonials, phone, email, address, website, city, ctaText, rating, reviews, slogan, heroImage, allImages, galleryTitle, aboutTitle, servicesTitle, accentOnDark, hours: leadHours, establishedYear, footerDesc, hasRealRating, hasRealReviews } = content;
```

### Step3: Map pin = exact address
Change:
```ts
  const mapQuery = encodeURIComponent(address + (city ? ', ' + city : ''));
```
to:
```ts
  const mapQuery = encodeURIComponent(address);
```

### Step4: Gate info-bar rating on real data (two identical occurrences)
Replace BOTH occurrences of:
```ts
${rating ? `<div class="info-bar-item"><i data-lucide="star" width="14" fill="currentColor"></i> ${rating}/5 ${ui.testGoogle} (${reviews} ${ui.testAvis})</div>` : ''}
```
with:
```ts
${hasRealRating && rating ? `<div class="info-bar-item"><i data-lucide="star" width="14" fill="currentColor"></i> ${rating}/5 ${ui.testGoogle} (${reviews} ${ui.testAvis})</div>` : ''}
```

### Step5: Gate hero rating on real data
Replace:
```ts
                <div style="display:flex;gap:24px;flex-wrap:wrap">
                    <div class="hero-rating"><div class="hero-stars">${Array(5).fill('<i data-lucide="star" fill="currentColor" width="16"></i>').join('')}</div><span class="hero-rating-text">${rating}/5 — ${reviews} ${ui.testGoogle}</span></div>
                </div>
```
with:
```ts
                <div style="display:flex;gap:24px;flex-wrap:wrap">
                    ${hasRealRating && rating ? `<div class="hero-rating"><div class="hero-stars">${Array(Math.round(rating)).fill('<i data-lucide="star" fill="currentColor" width="16"></i>').join('')}</div><span class="hero-rating-text">${rating}/5 — ${reviews} ${ui.testGoogle}</span></div>` : ''}
                </div>
```

### Step6: Service image alt text city-aware
Replace:
```ts
<img src="${proxiedImg(serviceImages[i] || heroImage)}" class="svc-card-img" alt="${s.name}" loading="lazy">
```
with:
```ts
<img src="${proxiedImg(serviceImages[i] || heroImage)}" class="svc-card-img" alt="${s.name} à ${city}" loading="lazy">
```

### Step7: About badge shows real rating; about title; remove about CTA
- About badge line:
```ts
<div class="about-badge"><div class="about-badge-num">${establishedYear ? (new Date().getFullYear() - establishedYear) + '+' : sectorCfg.aboutBadge.value}</div><div class="about-badge-text">${establishedYear ? (lang === 'en' ? 'Years Experience' : 'Ans d\'expérience') : sectorCfg.aboutBadge.label[lang]}</div></div>
```
replace with:
```ts
<div class="about-badge"><div class="about-badge-num">${hasRealRating && rating ? rating + '/5' : (establishedYear ? (new Date().getFullYear() - establishedYear) + '+' : sectorCfg.aboutBadge.value)}</div><div class="about-badge-text">${hasRealRating && rating ? (lang === 'en' ? 'Google Rating' : 'Note Google') : (establishedYear ? (lang === 'en' ? 'Years Experience' : 'Ans d\'expérience') : sectorCfg.aboutBadge.label[lang])}</div></div>
```
- About title line:
```ts
<h2>${content.aboutTitle || ui.aboutTitle || template.heroTitle} — ${city || companyName}</h2>
```
replace with:
```ts
<h2>${lang === 'en' ? 'About' : 'À propos de'} ${companyName}</h2>
```
- About CTA: DELETE this line entirely:
```ts
                    <a href="#contact" class="btn-pri">${ctaText} <i data-lucide="arrow-right" width="16"></i></a>
```

### Step8: Honest stats band
Replace:
```ts
    <div class="stats" style="background:var(--primary)">
        ${sectorCfg.stats.map(s => `<div class="stat-item"><div class="stat-num">${s.value}</div><div class="stat-label">${s.label[lang]}</div></div>`).join('')}
    </div>
```
with:
```ts
    <div class="stats" style="background:var(--primary)">
        ${getStats(content.sector, lang, rating, reviews, establishedYear, hasRealRating, hasRealReviews).map(s => `<div class="stat-item"><div class="stat-num">${s.num}</div><div class="stat-label">${s.label}</div></div>`).join('')}
    </div>
```

### Step9: Remove the `#process` section
DELETE the entire block from:
```ts
    <section class="section section-alt" id="process">
```
through its closing:
```ts
    </section>
```
(the block ends right before `    <section class="section" id="pourquoi">`). Remove it completely (the process CTA inside goes with it).

### Step10: Testimonials — real reviews or tasteful placeholder
Replace the whole testimonials body (from `<div class="test-grid">` through the `</div>` that closes `.test-google`):
```ts
            <div class="test-grid">
                ${testimonials.slice(0,6).map((t,i) => `
                <div class="test-card reveal reveal-d${(i % 3) + 1}">
                    <div><div class="test-stars">${Array(t.rating).fill('<i data-lucide="star" fill="currentColor" width="15"></i>').join('')}</div><p class="test-text">"${t.text}"</p></div>
                    <div class="test-author"><div class="test-avatar">${t.author.charAt(0)}</div><div><div class="test-name">${t.author}</div>${t.date?`<div class="test-date">${t.date}</div>`:''}</div></div>
                </div>`).join('')}
            </div>
            <div class="test-google reveal"><i data-lucide="star" fill="#f59e0b" width="20" class="test-google-star"></i><div><strong>${rating}/5 ${ui.testGoogle}</strong><div style="font-size:.8rem;color:var(--text-s)">${ui.testBasé} ${reviews} ${ui.testAvis}</div></div></div>
```
with:
```ts
            ${hasRealReviews && testimonials.length > 0 ? `
            <div class="test-grid">
                ${testimonials.slice(0,6).map((t,i) => `
                <div class="test-card reveal reveal-d${(i % 3) + 1}">
                    <div><div class="test-stars">${Array(t.rating).fill('<i data-lucide="star" fill="currentColor" width="15"></i>').join('')}</div><p class="test-text">"${t.text}"</p></div>
                    <div class="test-author"><div class="test-avatar">${t.author.charAt(0)}</div><div><div class="test-name">${t.author}</div>${t.date?`<div class="test-date">${t.date}</div>`:''}</div></div>
                </div>`).join('')}
            </div>
            ${hasRealRating ? `<div class="test-google reveal"><i data-lucide="star" fill="#f59e0b" width="20" class="test-google-star"></i><div><strong>${rating}/5 ${ui.testGoogle}</strong><div style="font-size:.8rem;color:var(--text-s)">${ui.testBasé} ${reviews} ${ui.testAvis}</div></div></div>` : ''}
            ` : `
            <div class="test-empty reveal">
                <i data-lucide="message-square" width="28"></i>
                <p>${ui.testEmpty}</p>
            </div>`}
```

### Step11: Remove the `cta-banner` section
DELETE the entire block:
```ts
    <section class="cta-banner">
        <div class="container reveal">
            <h2>${ui.ctaTitle}</h2>
            <p>${ui.ctaDesc}</p>
            <a href="#contact" class="btn-cta">${ctaText} <i data-lucide="arrow-right" width="18"></i></a>
        </div>
    </section>
```

### Step12: GDPR consent checkbox in contact form
Insert this block IMMEDIATELY BEFORE the submit button line:
```ts
                        <div class="form-check">
                            <input type="checkbox" id="consent" name="consent" required>
                            <label for="consent">${ui.formConsent}<a href="#" onclick="event.preventDefault();document.getElementById('privacy-modal').classList.add('open')">${ui.privacyLink}</a>.</label>
                        </div>
```
(i.e. before `<button type="submit" class="form-submit">...`).

### Step13: Footer description distinct
Replace:
```ts
<p class="footer-desc">${aboutText.substring(0,120)}...</p>
```
with:
```ts
<p class="footer-desc">${footerDesc || (lang === 'en' ? `Your trusted ${content.sector} — ${companyName}.` : `Votre ${content.sector} de confiance — ${companyName}.`)}</p>
```

### Step14: Add CSS for `.form-check` and `.test-empty`
Insert this CSS block right after the `.form-note{...}` rule (the line `.form-note{text-align:center;margin-top:12px;font-size:.78rem;color:var(--text-t)}`):
```css
.form-check{display:flex;align-items:flex-start;gap:10px;margin:6px 0 14px;font-size:.82rem;color:var(--text-s);line-height:1.5}
.form-check input{margin-top:3px;width:16px;height:16px;accent-color:var(--primary);flex-shrink:0;cursor:pointer}
.form-check a{color:var(--primary);text-decoration:underline}
.test-empty{text-align:center;padding:48px 20px;color:var(--text-t);background:#fff;border:1px dashed var(--border);border-radius:var(--r-lg)}
.test-empty i{color:var(--primary);margin-bottom:12px;display:block}
.test-empty p{font-size:.98rem}
```

### Step15: Typecheck
Run: `npx tsc --noEmit` (repo root). Expected: 0 errors.

### Step16: Commit
```bash
git add src/lib/ultimateTemplate.ts
git commit -m "fix(template): GDPR consent, honest stats, real-rating gating, drop process/cta-banner"
```

## Global Constraints (binding)
- No fake reviews / no invented stats — `getStats` + the placeholder handle empty real data.
- Single `<h1>` (hero) preserved — this task removes sections, not headings; do NOT add an `<h1>`.
- All interactive elements `cursor:pointer`, `:focus-visible`, hover ≤300ms (the consent checkbox gets `cursor:pointer` via `.form-check input`).
- No emoji icons — lucide only (`.test-empty` uses `message-square`).
- Light-mode contrast ≥4.5:1; no neon; no AI purple-pink gradients.
- Responsive 375/768/1024/1440.
- Reduced-motion + coarse-pointer + <768px still disable cursor/reveals (unchanged).
- Zero new external dependencies; `tsc` must pass.
