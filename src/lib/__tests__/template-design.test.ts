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
    expect(html).toMatch(/class="[^"]*\breveal\b/);
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
