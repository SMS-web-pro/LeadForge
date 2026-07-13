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

  it('shows a trust block, never "Avis en attente"', () => {
    const noReviews = generateUltimateSite({ ...lead, googleRating: 0, googleReviews: 0 } as any, undefined);
    expect(noReviews).not.toContain('Avis en attente');
    expect(noReviews).toContain('trust-badge');
    const withReviews = generateUltimateSite(lead as any, undefined);
    expect(withReviews).toContain('avis vérifiés Google');
    expect(withReviews).toContain('trust-card');
  });

  it('has no undefined/NaN leaks', () => {
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('NaN');
  });

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
});
