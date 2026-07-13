### Task 1: Testimonials / Reviews section (`#testimonials`)

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` â€” replace `buildTrust` (lines ~828-854) with `buildTestimonials`; change assembly call at line ~1605.
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
  expect(html).not.toMatch(/BasÃ© sur \d+ avis|Based on \d+ reviews/);
  expect(html).not.toMatch(/â˜…â˜…â˜…â˜…â˜…|â˜†â˜†â˜†â˜†â˜†/);
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
    const ctaSub = lang === 'fr' ? 'Aidez dâ€™autres clients Ã  faire le bon choix.' : 'Help others choose with confidence.';
    // Branch 1: real testimonial text available
    if (reviews.length > 0) {
      const cards = reviews.map((r: any) => {
        const full = Math.max(0, Math.min(5, Math.round(r.rating || 5)));
        const stars = 'â˜…â˜…â˜…â˜…â˜…'.slice(0, full) + 'â˜†â˜†â˜†â˜†â˜†'.slice(0, 5 - full);
        return `<div class="tcard reveal">
            <div class="tcard-stars">${stars}</div>
            <p class="tcard-text">${r.text}</p>
            <div class="tcard-foot"><span class="tcard-author">${r.author}</span>${r.date ? `<span class="tcard-date">${r.date}</span>` : ''}</div>
        </div>`;
      }).join('');
      return `    <section class="section section-alt" id="testimonials">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowTestimonials || (lang === 'fr' ? 'TÃ©moignages' : 'Testimonials')}</span>
                <h2>${title}</h2>
                ${hasRating ? `<p>${gLink} â€” ${rating}/5 Â· ${reviewCount} ${(lang === 'fr' ? 'avis' : 'reviews')}</p>` : ''}
            </div>
            <div class="tcard-grid reveal">${cards}</div>
        </div>
    </section>`;
    }
    // Branch 2: real rating but no testimonial text
    if (hasRating) {
      const stars = 'â˜…â˜…â˜…â˜…â˜…'.slice(0, Math.round(rating)) + 'â˜†â˜†â˜†â˜†â˜†'.slice(0, 5 - Math.round(rating));
      const meta = lang === 'fr' ? `BasÃ© sur ${reviewCount} avis vÃ©rifiÃ©s Google` : `Based on ${reviewCount} verified Google reviews`;
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

