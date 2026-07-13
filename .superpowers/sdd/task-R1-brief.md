# R1 — helpers.ts: cleanText() + getStats()

**Context:** LeadForge generates sector websites. An earlier content-cleanup pass was reverted; we are re-applying it. This task adds two pure helper functions used later by the generator (R3/R4) to (a) strip leftover template tokens/placeholders from AI text and (b) build honest stats from real data, substituting commitments when real data is missing.

**Files**
- Modify: `src/lib/template/helpers.ts` — ADD two exported functions (do not change existing exports).

## cleanText
Add this exported function (place it near the other string helpers, e.g. after `capitalizeCity`):
```ts
/**
 * Strip leftover template tokens / placeholders from AI-generated copy so they
 * never appear on a live site. Removes [année], [name], {{var}}, dangling
 * "Fondé en ," and collapses whitespace.
 */
export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\[année\]/gi, '')
    .replace(/\[\s*\w[\w\-éèêàçùôîïëüæœ'’]*\s*\]/g, '')
    .replace(/\{\{\s*[^}]+\s*\}\}/g, '')
    .replace(/fond[ée]\s+en\s*,?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
```

## getStats
Add this exported function (place after `cleanText`):
```ts
export interface StatItem { num: string; label: string; }

/**
 * Build the stats band from REAL data when available; otherwise substitute honest
 * sector commitments. Never invents numbers. Max 4 items.
 */
export function getStats(
  sector: string,
  lang: 'fr' | 'en',
  rating: number | undefined,
  reviews: number | undefined,
  establishedYear: number | undefined,
  hasRealRating: boolean,
  hasRealReviews: boolean
): StatItem[] {
  const stats: StatItem[] = [];
  if (hasRealRating && typeof rating === 'number' && rating > 0) {
    stats.push({ num: String(rating), label: lang === 'en' ? 'Google Rating' : 'Note Google' });
  }
  if (hasRealReviews && typeof reviews === 'number' && reviews > 0) {
    stats.push({ num: String(reviews), label: lang === 'en' ? 'Client Reviews' : 'Avis Clients' });
  }
  if (typeof establishedYear === 'number' && establishedYear > 0) {
    const y = new Date().getFullYear() - establishedYear;
    if (y > 0) stats.push({ num: y + '+', label: lang === 'en' ? 'Years Experience' : 'Ans d\'Expérience' });
  }
  const commitments: StatItem[] = lang === 'en'
    ? [{ num: '< 2h', label: 'Response' }, { num: '24/7', label: 'Available' }, { num: 'Free', label: 'Free Quote' }]
    : [{ num: '< 2h', label: 'Réponse' }, { num: '24/7', label: 'Disponible' }, { num: 'Gratuit', label: 'Devis Gratuit' }];
  for (const c of commitments) {
    if (stats.length >= 4) break;
    stats.push(c);
  }
  return stats.slice(0, 4);
}
```

## Steps
- [ ] Step1: Add both functions to `helpers.ts` (exact code above).
- [ ] Step2: Typecheck — `npx tsc --noEmit` from repo root. Expected: 0 errors.
- [ ] Step3: Commit:
```bash
git add src/lib/template/helpers.ts
git commit -m "feat(helpers): add cleanText + getStats honest-stat helpers"
```

## Global Constraints (binding)
- Zero new external dependencies.
- `tsc` must pass.
- `getStats` MUST NOT invent numbers — only real rating/reviews/years or the listed commitments.
- `cleanText` MUST remove `[année]` and `{{var}}` style tokens and dangling "Fondé en ,".
