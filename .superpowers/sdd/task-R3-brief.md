# R3 — Generator functions: cleanText, real-data flags, no fake reviews

**Context:** Re-applying reverted content fixes. The generator currently pads testimonials with FAKE reviews (`getSectorFallbackReviews`) and lets `[année]`/`{{var}}` tokens leak into copy. This task wires `cleanText` into the copy, removes the fake-review padding (real reviews only), and carries `footerDesc` + `hasRealRating`/`hasRealReviews` flags into `UltimateContent` for the builder (R4) to consume.

**Files**
- Modify: `src/lib/ultimateTemplate.ts` — add an import, and edit BOTH `generateUltimateSite` (sync) and `generateUltimateSiteAsync`.

## Steps

### Step1: Add import
At the TOP of the file, among the existing imports (e.g. near `import { getImagesForLead } from './pexelsApi';`), add:
```ts
import { cleanText } from './template/helpers';
```

### Step2: SYNC function `generateUltimateSite` (starts line 459)
- After the lines:
  ```ts
    const rating = lead.googleRating || 5;
    const reviews = lead.googleReviews || 42;
  ```
  add:
  ```ts
    const hasRealRating = typeof lead.googleRating === 'number';
    const hasRealReviews = typeof lead.googleReviews === 'number';
  ```
- Change the `description` line:
  ```ts
    const description = generateAboutText(aiContent?.aboutText || lead.description || template.aboutText, lead);
  ```
  to:
  ```ts
    const description = cleanText(generateAboutText(aiContent?.aboutText || lead.description || template.aboutText, lead));
  ```
- Change the `heroSubtitle` line:
  ```ts
    const heroSubtitle = aiContent?.heroSubtitle || `${template.heroSubtitle}${city ? ' à ' + city : ''}`;
  ```
  to:
  ```ts
    const heroSubtitle = cleanText(aiContent?.heroSubtitle || `${template.heroSubtitle}${city ? ' à ' + city : ''}`);
  ```
- Change the `ctaText` init:
  ```ts
    let ctaText = aiContent?.cta || template.ctaText || 'Demander un devis';
  ```
  to:
  ```ts
    let ctaText = cleanText(aiContent?.cta || template.ctaText || 'Demander un devis');
  ```
  (keep the existing `if (ctaText.length > 50) ctaText = ctaText.substring(0, 47) + '...';` line)
- Change the `finalSlogan` line:
  ```ts
    const finalSlogan = aiContent?.slogan || sloganVariations[combinedHash % sloganVariations.length];
  ```
  to:
  ```ts
    const finalSlogan = cleanText(aiContent?.slogan || sloganVariations[combinedHash % sloganVariations.length]);
  ```
- Replace the testimonials fallback padding:
  ```ts
    const fallbackReviews = getSectorFallbackReviews(lead.sector);
    while (testimonials.length < 6) testimonials.push(fallbackReviews[testimonials.length % fallbackReviews.length]);
    testimonials = testimonials.slice(0, 6);
  ```
  with:
  ```ts
    testimonials = testimonials.slice(0, 6);
  ```
- In the `content` object, add the three new fields. Change:
  ```ts
    const content: UltimateContent = {
      companyName, sector: lead.sector || 'Professionnel', city, description, phone, email, address,
      website: lead.website || '', rating, reviews, services: finalServices, serviceImages, galleryImages, testimonials,
      heroTitle, heroSubtitle, aboutText: description, ctaText, slogan: finalSlogan, heroImage, allImages,
      hours: lead.hours || lead.serperHours || '', establishedYear: lead.establishedYear
    };
  ```
  to:
  ```ts
    const content: UltimateContent = {
      companyName, sector: lead.sector || 'Professionnel', city, description, phone, email, address,
      website: lead.website || '', rating, reviews, services: finalServices, serviceImages, galleryImages, testimonials,
      heroTitle, heroSubtitle, aboutText: description, ctaText, slogan: finalSlogan, heroImage, allImages,
      hours: lead.hours || lead.serperHours || '', establishedYear: lead.establishedYear,
      footerDesc: lead.footerDesc || '', hasRealRating, hasRealReviews
    };
  ```

### Step3: ASYNC function `generateUltimateSiteAsync` (starts line 558)
- After:
  ```ts
    const rating = lead.googleRating || 5;
    const reviews = lead.googleReviews || 42;
  ```
  add:
  ```ts
    const hasRealRating = typeof lead.googleRating === 'number';
    const hasRealReviews = typeof lead.googleReviews === 'number';
  ```
- Change `description`:
  ```ts
    const description = generateAboutText(aiContent?.aboutText || lead.description || (lang === 'en' ? template.aboutTextEn : template.aboutText), lead);
  ```
  to:
  ```ts
    const description = cleanText(generateAboutText(aiContent?.aboutText || lead.description || (lang === 'en' ? template.aboutTextEn : template.aboutText), lead));
  ```
- Change `heroSubtitle`:
  ```ts
    const heroSubtitle = aiContent?.heroSubtitle || `${lang === 'en' ? template.heroSubtitleEn : template.heroSubtitle}${city ? (lang === 'en' ? ' in ' : ' à ') + city : ''}`;
  ```
  to:
  ```ts
    const heroSubtitle = cleanText(aiContent?.heroSubtitle || `${lang === 'en' ? template.heroSubtitleEn : template.heroSubtitle}${city ? (lang === 'en' ? ' in ' : ' à ') + city : ''}`);
  ```
- Change `ctaText` init:
  ```ts
    let ctaText = aiContent?.cta || (lang === 'en' ? template.ctaTextEn : template.ctaText) || (lang === 'en' ? 'Contact Us' : 'Contactez-nous');
  ```
  to:
  ```ts
    let ctaText = cleanText(aiContent?.cta || (lang === 'en' ? template.ctaTextEn : template.ctaText) || (lang === 'en' ? 'Contact Us' : 'Contactez-nous'));
  ```
  (keep the `if (ctaText.length > 50) ...` line)
- Change `finalSlogan`:
  ```ts
    const finalSlogan = aiContent?.slogan || (lang === 'en' ? sloganVariationsEn[combinedHash % sloganVariationsEn.length] : sloganVariationsFr[combinedHash % sloganVariationsFr.length]);
  ```
  to wrap in `cleanText(...)`:
  ```ts
    const finalSlogan = cleanText(aiContent?.slogan || (lang === 'en' ? sloganVariationsEn[combinedHash % sloganVariationsEn.length] : sloganVariationsFr[combinedHash % sloganVariationsFr.length]));
  ```
- Replace the async testimonials padding:
  ```ts
    const fallbackReviews = getSectorFallbackReviews(lead.sector);
    while (testimonials.length < 6) testimonials.push(fallbackReviews[testimonials.length % fallbackReviews.length]);
    testimonials = testimonials.slice(0, 6);
  ```
  with:
  ```ts
    testimonials = testimonials.slice(0, 6);
  ```
- In the async `content` object, add the three fields:
  ```ts
    const content: UltimateContent = {
      companyName, sector: lead.sector || (lang === 'en' ? 'Professional' : 'Professionnel'), city, description, lang, phone, email, address,
      website: lead.website || '', rating, reviews, services: finalServices, serviceImages, galleryImages, realPhotos, testimonials,
      heroTitle, heroSubtitle, aboutText: description, ctaText, slogan: finalSlogan, heroImage, allImages,
      socialLinks, accentOnDark, hours: lead.hours || lead.serperHours || '', establishedYear: lead.establishedYear,
      footerDesc: lead.footerDesc || '', hasRealRating, hasRealReviews
    };
  ```

### Step4: Typecheck
Run: `npx tsc --noEmit` (repo root). Expected: 0 errors.

### Step5: Commit
```bash
git add src/lib/ultimateTemplate.ts
git commit -m "fix(template): cleanText copy + real-data flags, drop fake-review padding"
```

## Global Constraints (binding)
- No fake reviews: testimonials MUST contain only real `lead.googleReviewsData` entries (max 6). The `getSectorFallbackReviews` padding is REMOVED in both functions.
- `cleanText` applied to description, heroSubtitle, ctaText, finalSlogan in BOTH functions.
- `hasRealRating`/`hasRealReviews` derived from `typeof lead.googleRating/googleReviews === 'number'`; carried into `content`.
- Do NOT change the builder (`buildUltimateHTML`) in this task — that is R4.
- Zero new external dependencies; `tsc` must pass.
