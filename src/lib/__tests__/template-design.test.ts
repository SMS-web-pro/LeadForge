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

  it('renders rating branch without leaking undefined when review count is absent', () => {
    const html = generateUltimateSite({ ...lead, googleRating: 4.8, googleReviews: undefined, testimonials: [], googleReviewsData: [] } as any, undefined);
    expect(html).toContain('id="testimonials"');
    expect(html).toContain('4.8/5');
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('NaN');
    expect(html).not.toMatch(/Basé sur undefined|Based on undefined/);
  });

  it('hero shows USP chips from guarantees', () => {
    const html = build();
    expect(html).toContain('hero-chips');
    expect(html).toMatch(/class="[^"]*hero-chip[^"]*"/);
  });

  it('marks the first service as popular and uses richer descriptions', () => {
    const html = build();
    expect(html).toContain('svc-tag');
    expect(html).toContain('svc-card-body');
  });

  it('shows #process for non-bespoke sectors and hides it for bespoke-process sectors', () => {
    const electricien = generateUltimateSite(lead as any, undefined);
    expect(electricien).toContain('id="process"');
    const coiffeur = generateUltimateSite({ ...lead, sector: 'Coiffeur' } as any, undefined);
    expect(coiffeur).not.toContain('id="process"');
  });

  it('about section has a second paragraph and honest mini-stats', () => {
    const html = build();
    expect(html).toContain('about-mini');
    expect(html).not.toContain('undefined');
  });

  it('why section lists key reasons', () => {
    const html = build();
    expect(html).toContain('why-list');
    expect(html).toMatch(/class="[^"]*why-list-item[^"]*"/);
  });

  it('densifies section padding via --section-py token', () => {
    const html = build();
    const m = html.match(/--section-py:([^;]+);/);
    expect(m).toBeTruthy();
    const maxv = parseInt((m as RegExpMatchArray)[1].match(/(\d+)px\s*\)/) as any, 10);
    expect(maxv).toBeLessThanOrEqual(96);
  });

  it('defines CSS for new enriched components', () => {
    const html = build();
    ['hero-chips', 'svc-tag', 'about-mini', 'why-list', 'tcard-grid'].forEach(c => expect(html).toContain(c));
  });
});
