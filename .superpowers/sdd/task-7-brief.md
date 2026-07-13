# Task 7 — Acceptance test for design invariants

**Context:** Soft Evolution redesign + Rapport content fixes are complete. This task adds a vitest test asserting the generated HTML meets the binding design/accessibility invariants (single h1, reduced-motion hardening, focus-visible, guarded custom cursor, lucide-only icons, scroll reveal, honest empty-state for reviews, no undefined/NaN leaks).

**Files**
- Create: `src/lib/__tests__/template-design.test.ts`

## Steps

### Step1: Write the test
Create `src/lib/__tests__/template-design.test.ts` with exactly this content:

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
  description: 'Électricien certifié RGE intervenant à Paris.',
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
    expect((html.match(/<h1/g) || []).length).toBe(1);
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

  it('shows honest empty-state when no real reviews', () => {
    const noReviews = generateUltimateSite({ ...lead, googleReviewsData: [] } as any, undefined);
    expect(noReviews).toContain('Avis en attente');
    expect(noReviews).not.toContain('Marie');
  });

  it('has no undefined/NaN leaks', () => {
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('NaN');
  });
});
```

### Step2: Run the test
Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: all tests PASS.
(If `generateUltimateSite` requires an async context that throws in the sync test, switch the `build()` helper to `await generateUltimateSiteAsync(lead as any, undefined, '')` inside an `it(async () => ...)` — but try the sync version first.)

### Step3: Commit
```bash
git add src/lib/__tests__/template-design.test.ts
git commit -m "test(template): Soft Evolution design-invariant acceptance tests"
```

## Global Constraints (binding)
- Test must be self-contained (construct its own lead).
- Assert the invariants listed; do NOT assert fragile internal implementation details beyond those.
- Zero new external dependencies (vitest already in the project).
- `tsc` + vitest must pass.
