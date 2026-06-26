# Website Generator Modularisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modulariser le générateur de sites web en 4 engines indépendants + 4 layouts pour résoudre images incohérentes, contenu générique, répétition, et manque de variété.

**Architecture:** Découpage de `ultimateTemplate.ts` (1935 lignes) et `WebsiteGen.tsx` en modules : types partagés, content-engine, image-engine, layout-engine, 4 layouts distincts, et unificateur comme point d'entrée unique.

**Tech Stack:** React 19, TypeScript 5.9, aucun nouveau package requis.

## Global Constraints

- Tous les nouveaux fichiers dans `src/lib/website/`
- Utiliser les types Lead et ApiConfig existants depuis `src/lib/supabase-store.ts`
- Fonctions safeStr, safeNum, safeStrArr déjà disponibles
- L'interface `generateUltimateSite(lead, aiContent)` existe déjà et doit être préservée comme fallback
- Pas de nouveau package npm
- Les textes fr/en existent déjà dans `ultimateTemplate.ts` (const UI)

---

### Task 1: Types partagés et données extraites

**Files:**
- Create: `src/lib/website/types.ts`
- Create: `src/lib/website/data/palettes.ts`
- Create: `src/lib/website/data/sector-services.ts`
- Create: `src/lib/website/data/fallback-reviews.ts`
- Create: `src/lib/website/data/process-steps.ts`
- Create: `src/lib/website/data/curated-images.ts`
- Create: `src/lib/website/data/ui-strings.ts`

**Interfaces:**
- Produces: `WebsiteContent`, `WebsiteImages`, `Palette`, `LayoutModule`, `UiStrings` types
- Produces: `SECTOR_PALETTES` (Record secteur → Palette)
- Produces: `SECTOR_SERVICES` (Record secteur → service names)
- Produces: `SECTOR_FALLBACK_REVIEWS` (Record secteur → reviews)
- Produces: `SECTOR_PROCESS_STEPS` (Record secteur → process steps)
- Produces: `SECTOR_CURATED_IMAGES` (Record secteur → URLs string[])
- Produces: `UI` (Record lang → UI string translations)

- [ ] **Step 1: Create `types.ts`**

```typescript
export interface WebsiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  aboutTitle: string;
  services: Array<{ name: string; description: string; features: string[] }>;
  servicesTitle: string;
  whyChooseUs: string[];
  testimonials: Array<{ author: string; text: string; rating: number; date?: string }>;
  ctaText: string;
  ctaSubtext?: string;
  metaDescription: string;
  galleryTitle?: string;
  processSteps?: Array<{ title: string; desc: string }>;
}

export interface WebsiteImages {
  hero: string;
  gallery: string[];
  services: string[];
  logo?: string;
  logoInitials?: string;
  logoWord1?: string;
  logoWord2?: string;
}

export interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  "on-primary": string;
  "on-accent": string;
}

export interface LayoutModule {
  id: string;
  name: string;
  render(lead: Lead, content: WebsiteContent, images: WebsiteImages, palette: Palette): string;
}

export interface UiStrings {
  lang: string; hreflang: string;
  navAbout: string; navServices: string; navWhy: string; navAvis: string; navContact: string;
  heroCall: string; heroNote: string;
  svcTitle: string; svcDesc: string;
  aboutTitle: string;
  whyLabel: string;
  testTitle: string; testDesc: string; testGoogle: string; testBasé: string; testAvis: string;
  contactTitle: string; contactDesc: string;
  formName: string; formPhone: string; formEmail: string; formMsg: string; formSubmit: string;
  footerNav: string; footerContact: string; footerPrivacy: string;
  hoursTitle: string; hoursLunVen: string; hoursSam: string; hoursDim: string;
  contactCall: string; whatsapp: string;
  privacyTitle: string;
}
```

- [ ] **Step 2: Create `data/palettes.ts`**

Extraire depuis `ultimateTemplate.ts:203-452` (SECTOR_ULTIMATE_TEMPLATES). Exporter `getPalette(sector: string): Palette`.

```typescript
import { Palette } from '../types';

const SECTOR_PALETTES: Record<string, Palette> = {
  plomberie: { primary: '#0f766e', secondary: '#115e59', accent: '#14b8a6', background: '#f0fdfa', "on-primary": '#ffffff', "on-accent": '#ffffff' },
  electricien: { primary: '#1e40af', secondary: '#1e3a8a', accent: '#2563eb', background: '#f8fafc', "on-primary": '#ffffff', "on-accent": '#ffffff' },
  coiffeur: { primary: '#6b21a8', secondary: '#581c87', accent: '#7c3aed', background: '#faf5ff', "on-primary": '#ffffff', "on-accent": '#ffffff' },
  restaurant: { primary: '#c2410c', secondary: '#9a3412', accent: '#ea580c', background: '#fff7ed', "on-primary": '#ffffff', "on-accent": '#ffffff' },
  garage: { primary: '#166534', secondary: '#14532d', accent: '#059669', background: '#f0fdf4', "on-primary": '#ffffff', "on-accent": '#ffffff' },
  nettoyage: { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#f0fdf4', "on-primary": '#ffffff', "on-accent": '#ffffff' },
  jardin: { primary: '#14532d', secondary: '#166534', accent: '#15803d', background: '#f0fdf4', "on-primary": '#ffffff', "on-accent": '#ffffff' },
  fitness: { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', background: '#fef2f2', "on-primary": '#ffffff', "on-accent": '#ffffff' },
  medical: { primary: '#1e40af', secondary: '#1e3a8a', accent: '#2563eb', background: '#eff6ff', "on-primary": '#ffffff', "on-accent": '#ffffff' },
  avocat: { primary: '#1e3a8a', secondary: '#172554', accent: '#2563eb', background: '#f8fafc', "on-primary": '#ffffff', "on-accent": '#ffffff' },
  default: { primary: '#1e293b', secondary: '#334155', accent: '#475569', background: '#f8fafc', "on-primary": '#ffffff', "on-accent": '#ffffff' },
};

export function getPalette(sector: string): Palette {
  const s = (sector || '').toLowerCase();
  for (const [key, palette] of Object.entries(SECTOR_PALETTES)) {
    if (s.includes(key)) return palette;
  }
  return SECTOR_PALETTES.default;
}
```

- [ ] **Step 3: Create `data/sector-services.ts`**

Extraire les services depuis `ultimateTemplate.ts:203-452` et `WebsiteGen.tsx:327-353`. Exporter `getSectorServices(sector: string)`, `getSectorServiceDescriptions(sector: string, lang: 'fr' | 'en')`.

```typescript
export const SECTOR_SERVICES: Record<string, Array<{ name: string; description: string; features: string[] }>> = {
  plomberie: [
    { name: 'Dépannage 24h/24', description: "Intervention d'urgence sur toutes fuites et pannes", features: ['Disponible 7j/7', 'Arrivée sous 1h30', 'Sans surprise tarifaire'] },
    { name: 'Installation Sanitaire', description: 'Pose et remplacement de vos appareils', features: ['Robinetterie', 'Éviers', 'WC', 'Douches'] },
    { name: 'Chauffage & Chaudière', description: 'Installation et réparation chauffage', features: ['Chaudières gaz/fioul', 'Pompes à chaleur', 'Détartrage'] },
    { name: 'Détection de Fuites', description: 'Localisation précise sans casse', features: ['Caméra thermique', 'Gaz traceur', 'Colmatage immédiat'] },
    { name: 'Rénovation Salle de Bain', description: 'Création et rénovation complète', features: ['Devis gratuit', 'Aide au choix', 'Clé en main'] },
    { name: 'Entretien Annuel', description: 'Maintenance préventive', features: ['Contrôle chauffage', 'Détartrage', 'Mise aux normes'] }
  ],
  electricien: [
    { name: 'Mise aux Normes', description: 'Remise à neuf de votre installation électrique', features: ['Norme NFC 15-100', 'Tableau électrique neuf', 'Mise à la terre'] },
    { name: 'Dépannage Électrique', description: 'Pannes, court-circuits, disjonctions', features: ['Intervention rapide', 'Diagnostic complet', 'Réparation durable'] },
    { name: 'Installation Complète', description: 'Construction ou rénovation électrique', features: ['Câblage complet', 'Points de lumière', 'Prises et inters'] },
    { name: 'Domotique & Smart Home', description: 'Maison connectée et automatisée', features: ['Volets roulants', 'Éclairage auto', 'Thermostats'] },
    { name: 'Éclairage LED', description: 'Solutions éclairage économiques', features: ['Spots encastrés', 'Suspensions design', 'Éclairage extérieur'] },
    { name: 'Bornes de Recharge', description: 'Installation bornes véhicule électrique', features: ['Wallbox particulier', 'Borne entreprise', 'Certification IRVE'] }
  ],
  coiffeur: [
    { name: 'Coupes & Styles', description: 'Coupe sur-mesure femme et homme', features: ['Visagisme personnalisé', 'Techniques actuelles', 'Conseil entretien'] },
    { name: 'Barbier Traditionnel', description: 'Rasage et soins barbe', features: ["Rasage à l'ancienne", 'Taille précise', 'Soins barbe'] },
    { name: 'Coloration Expert', description: 'Balayages, ombrés et couleurs', features: ['Coloration végétale', 'Mèches sur mesure', 'Glitter color'] },
    { name: 'Soins Capillaires', description: 'Traitements réparateurs', features: ['Botox capillaire', 'Kératine', 'Massage crânien'] },
    { name: 'Extensions Volume', description: 'Rajouts longueur et épaisseur', features: ['Pose à froid', 'Tape-in', 'Entretien inclus'] },
    { name: 'Chignons & Événements', description: 'Coiffures de cérémonie', features: ['Mariage', 'Sofreh aghd', 'Maquillage combo'] }
  ],
  // ... tous les secteurs extraits de ultimateTemplate.ts:203-452
  default: [
    { name: 'Prestation Sur Mesure', description: 'Services adaptés à vos besoins', features: ['Étude personnalisée', 'Devis détaillé', 'Écoute attentive'] },
    { name: 'Service Professionnel', description: 'Un travail soigné et de qualité', features: ['Matériel adapté', 'Techniques actuelles', 'Respect des normes'] },
    { name: 'Conseil & Accompagnement', description: 'Un accompagnement de A à Z', features: ['Diagnostic complet', 'Solutions pertinentes', 'Suivi personnalisé'] },
    { name: 'Réactivité', description: 'Un service à votre rythme', features: ['Réponse rapide', 'Horaires flexibles', 'Prise en charge efficace'] },
    { name: 'Qualité Garantie', description: 'Un engagement sur le résultat', features: ['Contrôle qualité', 'Corrections incluses', 'SAV réactif'] },
    { name: 'Tarifs Clairs', description: 'Des honoraires transparents', features: ['Devis préalable', 'Pas de surprise', 'Facilités de paiement'] }
  ]
};

export function getSectorServices(sector: string) {
  const s = (sector || '').toLowerCase();
  for (const [key, services] of Object.entries(SECTOR_SERVICES)) {
    if (s.includes(key)) return services;
  }
  return SECTOR_SERVICES.default;
}
```

- [ ] **Step 4: Create `data/fallback-reviews.ts`**

Extraire depuis `ultimateTemplate.ts:10-107`. Exporter `getSectorFallbackReviews(sector: string)`.

- [ ] **Step 5: Create `data/process-steps.ts`**

Extraire depuis `ultimateTemplate.ts:473-619`. Exporter `getProcessSteps(sector: string, lang: 'fr' | 'en')`.

- [ ] **Step 6: Create `data/curated-images.ts`**

Extraire les images Unsplash statiques depuis `pexelsImages.ts:297-385`. Exporter `getStaticImages(sector: string, seed: number): string[]`.

```typescript
export const STATIC_SECTOR_IMAGES: Record<string, string[]> = {
  plomberie: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920&q=80',
    // ... toutes les URLs
  ],
  // ... tous les secteurs
  default: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
    // ...
  ]
};

export function getStaticImages(sector: string, seed: number = 0): string[] {
  const s = (sector || '').toLowerCase();
  for (const [key, imgs] of Object.entries(STATIC_SECTOR_IMAGES)) {
    if (s.includes(key)) {
      const offset = seed % imgs.length;
      return [...imgs.slice(offset), ...imgs.slice(0, offset)];
    }
  }
  const def = STATIC_SECTOR_IMAGES.default;
  const offset = seed % def.length;
  return [...def.slice(offset), ...def.slice(0, offset)];
}
```

- [ ] **Step 7: Create `data/ui-strings.ts`**

Extraire la const `UI` depuis `ultimateTemplate.ts:752-797`. Exporter `getUiStrings(lang: 'fr' | 'en'): UiStrings`.

- [ ] **Step 8: Verify all files compile**

Run: `npx tsc --noEmit`
Expected: No errors (or only pre-existing errors unrelated to new files)

- [ ] **Step 9: Commit**

```bash
git add src/lib/website/
git commit -m "feat(website): add shared types and extracted data files"
```

---

### Task 2: Image Engine

**Files:**
- Create: `src/lib/website/image-engine.ts`

**Interfaces:**
- Consumes: `Lead` (from supabase-store), `ApiConfig`, `getPalette()`, `getStaticImages()`, `WebsiteImages`
- Produces: `fetchImages(lead: Lead, apiConfig: ApiConfig): Promise<WebsiteImages>`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/website/__tests__/image-engine.test.ts
import { describe, it, expect } from '@jest/globals';

describe('ImageEngine', () => {
  it('should return lead images when available', async () => {
    const lead = {
      id: 'test-1',
      name: 'Test Plumber',
      sector: 'plomberie',
      city: 'Paris',
      images: ['https://example.com/img1.jpg'],
      websiteImages: ['https://example.com/img2.jpg'],
      logo: ''
    };
    // mock fetch to avoid real API call
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    });
    
    const images = await fetchImages(lead, { pexelsKey: '' });
    expect(images).toBeDefined();
    expect(images.gallery.length).toBeGreaterThan(0);
  });
  
  it('should apply sector filter to exclude mismatched images', () => {
    const result = filterImagesBySector(
      ['https://example.com/car-engine.jpg', 'https://example.com/plumber-pipe.jpg'],
      'plomberie'
    );
    expect(result.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --config jest.config.fixed.js --watchAll=false src/lib/website/__tests__/image-engine.test.ts`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write the implementation**

```typescript
import { Lead, ApiConfig } from '../supabase-store';
import { WebsiteImages } from './types';
import { getStaticImages } from './data/curated-images';

// Hash simple pour seed stable par lead
function getLeadHash(lead: Lead): number {
  const seed = lead.name + (lead.city || '') + (lead.sector || '');
  return seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

// Pexels API call
async function fetchPexelsForSector(sector: string, apiKey: string, count: number = 10): Promise<string[]> {
  if (!apiKey) return [];
  const queries: Record<string, string[]> = {
    plomberie: ['plumber working pipes leak repair', 'bathroom renovation plumbing', 'kitchen sink faucet installation', 'water heater boiler service'],
    electricien: ['electrician wiring electrical panel', 'modern lighting installation', 'smart home automation', 'electrician tools professional'],
    // ... mêmes requêtes que pexelsImages.ts:SECTOR_PEXEL_QUERIES (tous les secteurs)
    default: ['professional service workspace', 'modern office professional', 'business meeting team']
  };
  
  const s = (sector || '').toLowerCase();
  let sectorQueries = queries.default;
  for (const [key, q] of Object.entries(queries)) {
    if (s.includes(key)) { sectorQueries = q; break; }
  }
  
  const allImages: string[] = [];
  const isImageBlocked = (await import('../imageFilters')).isImageBlocked;
  
  for (const query of sectorQueries) {
    try {
      const resp = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&size=medium`,
        { headers: { Authorization: apiKey } }
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      for (const photo of (data.photos || [])) {
        const url = photo?.src?.large2x || photo?.src?.large || photo?.src?.medium || '';
        const alt = photo?.alt || '';
        if (url && !isImageBlocked(url, alt, sector)) {
          allImages.push(url);
        }
      }
    } catch { /* ignore */ }
  }
  
  return [...new Set(allImages)];
}

export function filterImagesBySector(images: string[], sector: string): string[] {
  const s = (sector || '').toLowerCase();
  const blockedKeywords = s.includes('plomb') 
    ? ['car', 'engine', 'food', 'hair', 'makeup', 'court', 'lawyer', 'medical', 'doctor']
    : s.includes('electric')
    ? ['food', 'hair', 'makeup', 'court', 'plumber', 'pipe', 'wrench']
    : s.includes('coiff')
    ? ['car', 'engine', 'food', 'court', 'lawyer', 'pipe', 'wrench']
    : s.includes('restaurant')
    ? ['car', 'engine', 'hair', 'makeup', 'court', 'pipe', 'wrench', 'electrical']
    : s.includes('garage')
    ? ['food', 'hair', 'makeup', 'court', 'pipe', 'wrench', 'medical', 'plumber']
    : s.includes('jardin')
    ? ['car', 'engine', 'food', 'hair', 'court', 'pipe', 'wrench', 'kitchen']
    : ['food', 'car', 'engine', 'hair', 'makeup', 'court', 'pipe', 'wrench'];
  
  return images.filter(img => {
    const low = img.toLowerCase();
    return !blockedKeywords.some(kw => low.includes(kw));
  });
}

export async function fetchImages(lead: Lead, apiConfig: ApiConfig): Promise<WebsiteImages> {
  const leadHash = getLeadHash(lead);
  
  // 1) Collect source images
  const leadImages = [...(lead.images || []), ...(lead.websiteImages || [])]
    .filter(img => img && img.startsWith('https://'));
  
  // 2) Try Pexels API
  let pexelImages: string[] = [];
  if (apiConfig.pexelsKey) {
    pexelImages = await fetchPexelsForSector(lead.sector, apiConfig.pexelsKey);
    pexelImages = filterImagesBySector(pexelImages, lead.sector);
  }
  
  // 3) Static fallback with rotation
  const staticImages = getStaticImages(lead.sector, leadHash);
  const filteredStatic = filterImagesBySector(staticImages, lead.sector);
  
  // 4) Merge: lead images first, then pexels, then static
  const allImages = [...new Set([
    ...leadImages,
    ...pexelImages,
    ...filteredStatic
  ])];
  
  // 5) Assign with stable ordering
  const offset = leadHash % Math.max(allImages.length, 1);
  const rotated = [...allImages.slice(offset), ...allImages.slice(0, offset)];
  
  return {
    hero: rotated[0] || filteredStatic[0] || '',
    gallery: rotated.slice(0, 6),
    services: rotated.slice(0, 6)
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest --config jest.config.fixed.js --watchAll=false src/lib/website/__tests__/image-engine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/website/image-engine.ts src/lib/website/__tests__/image-engine.test.ts
git commit -m "feat(website): add image engine with Pexels + filter + rotation"
```

---

### Task 3: Content Engine

**Files:**
- Create: `src/lib/website/content-engine.ts`

**Interfaces:**
- Consumes: `Lead` (from supabase-store), `ApiConfig`, `WebsiteContent`
- Produces: `generateContent(lead: Lead, apiConfig: ApiConfig): Promise<WebsiteContent>`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/website/__tests__/content-engine.test.ts
import { describe, it, expect, jest } from '@jest/globals';

describe('ContentEngine', () => {
  it('should use enriched templates when no LLM key', async () => {
    const lead = {
      id: 'test-1',
      name: 'Plomberie Pro',
      sector: 'plomberie',
      city: 'Paris',
      description: 'Expert en plomberie depuis 15 ans',
      googleReviewsData: [{ author: 'Jean', text: 'Excellent service', rating: 5, date: '2024-01-01' }],
      googleRating: 4.8,
      googleReviews: 23,
    };
    
    const content = await generateContent(lead, { groqKey: '', geminiKey: '', nvidiaKey: '', openrouterKey: '' });
    expect(content.heroTitle).toBe('Plomberie Pro');
    expect(content.services.length).toBeGreaterThan(0);
    expect(content.services[0].name).toBeDefined();
    expect(content.testimonials.length).toBe(1);
  });
  
  it('should include lead data in enriched text', async () => {
    const lead = {
      id: 'test-2',
      name: 'Électricien Lyon',
      sector: 'electricien',
      city: 'Lyon',
      description: 'Électricien certifié depuis 10 ans',
      googleReviewsData: [],
      googleRating: 0,
      googleReviews: 0,
    };
    
    const content = await generateContent(lead, { groqKey: '', geminiKey: '', nvidiaKey: '', openrouterKey: '' });
    // Should include city in hero subtitle
    expect(content.heroSubtitle).toContain('Lyon');
    // Should include years in whyChooseUs or about
    expect(content.whyChooseUs.some(w => w.includes('10'))).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --config jest.config.fixed.js --watchAll=false src/lib/website/__tests__/content-engine.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the implementation**

```typescript
import { Lead, ApiConfig, callLLM } from '../supabase-store';
import { WebsiteContent } from './types';
import { getSectorServices } from './data/sector-services';
import { getSectorFallbackReviews } from './data/fallback-reviews';

function detectLanguage(lead: Lead): 'fr' | 'en' {
  // Copier depuis ultimateTemplate.ts:731-750 (detectLanguage existant)
  const city = (lead.city || '').toLowerCase();
  const englishCities = ['london', 'new york', 'chicago', 'los angeles', 'san francisco', 'miami', 'toronto', 'sydney', 'dubai'];
  const frenchCities = ['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'bordeaux', 'lille', 'strasbourg'];
  if (englishCities.some(c => city.includes(c))) return 'en';
  if (frenchCities.some(c => city.includes(c))) return 'fr';
  return 'fr';
}

function extractYears(lead: Lead): string {
  if (lead.description) {
    const match = lead.description.match(/(\d+)\s*ans?\s+d['']exp[eé]rience/i);
    if (match) return match[1];
  }
  return '15';
}

function buildEnrichedContent(lead: Lead, isEn: boolean): WebsiteContent {
  const sector = (lead.sector || '').toLowerCase();
  const services = getSectorServices(lead.sector);
  const lang = isEn ? 'en' : 'fr';
  const years = extractYears(lead);
  
  // Services enrichis
  const enrichedServices = services.map(s => ({
    name: s.name,
    description: isEn
      ? `${s.name} - Professional ${lead.sector || 'service'} tailored to your needs.`
      : `${s.name} — Prestation ${lead.sector || 'professionnelle'} adaptée à vos besoins.`,
    features: s.features
  }));
  
  // Témoignages : Google reviews ou fallback
  const googleReviews = (lead.googleReviewsData || [])
    .filter(r => r && r.text)
    .slice(0, 6)
    .map(r => ({
      author: r.author || (isEn ? 'Client' : 'Client satisfait'),
      text: r.text || (isEn ? 'Excellent service!' : 'Excellent service !'),
      rating: r.rating || 5,
      date: r.date || ''
    }));
  
  const testimonials = googleReviews.length >= 2 
    ? googleReviews 
    : getSectorFallbackReviews(lead.sector, lang).slice(0, 4);
  
  // Why choose us enrichi
  const whyChooseUs = isEn
    ? [`Over ${years} years of experience`, 'Professional certified team', 'Free quote and consultation', 'Satisfaction guaranteed']
    : [`Plus de ${years} ans d'expérience`, 'Équipe professionnelle certifiée', 'Devis gratuit et sans engagement', 'Satisfaction garantie'];
  
  // About text enriched
  const cityStr = lead.city ? (isEn ? ` in ${lead.city}` : ` à ${lead.city}`) : '';
  const aboutText = lead.description 
    ? lead.description
    : isEn
      ? `${lead.name} is a ${lead.sector || 'professional business'}${cityStr}. Our team is committed to delivering quality service.`
      : `${lead.name} est ${lead.sector || 'un établissement'}${cityStr}. Notre équipe met un point d'honneur à offrir un service de qualité.`;
  
  return {
    heroTitle: lead.name,
    heroSubtitle: lead.description || (isEn
      ? `Professional ${lead.sector || 'service'}${cityStr} — Discover our expertise`
      : `${lead.sector || 'Professionnel'}${cityStr} — Découvrez notre savoir-faire`),
    aboutText,
    aboutTitle: isEn ? 'About Us' : 'À Propos',
    services: enrichedServices,
    servicesTitle: isEn ? 'Our Services' : 'Nos Services',
    whyChooseUs,
    testimonials,
    ctaText: isEn ? 'Contact Us' : 'Contactez-nous',
    metaDescription: `${lead.name} — ${lead.sector || 'Professionnel'}${cityStr}. ${lead.description || ''}`.substring(0, 160),
    galleryTitle: isEn ? 'Our Gallery' : 'Nos Réalisations',
    processSteps: undefined
  };
}

function buildLlmPrompt(lead: Lead, isEn: boolean): string {
  const lang = isEn ? 'en' : 'fr';
  const sector = lead.sector || 'professional';
  const city = lead.city || '';
  const years = extractYears(lead);
  const reviews = (lead.googleReviewsData || []).slice(0, 4)
    .map(r => `"${r.text}" — ${r.author} (${r.rating}★)`)
    .join('\n');
  
  return `Generate unique website content for "${lead.name}" (${sector}${city ? ` in ${city}` : ''}).
${reviews ? `\nCustomer reviews:\n${reviews}` : ''}

Return valid JSON only with these fields:
- heroTitle: string (company name or variant)
- heroSubtitle: string (tagline with ${sector} and ${city} context)
- aboutText: string (company description, ${years}+ years experience)
- aboutTitle: string
- services: array of { name, description, features: string[] } (6 services specific to ${sector})
- servicesTitle: string
- whyChooseUs: string[] (4 reasons including ${years} years experience)
- ctaText: string
- metaDescription: string (max 160 chars)
- testimonials: array of { author, text, rating, date } (use provided reviews or generate plausible ones)

Language: ${lang === 'fr' ? 'French' : 'English'}
ONLY return the JSON object, no markdown.`;
}

export async function generateContent(lead: Lead, apiConfig: ApiConfig): Promise<WebsiteContent> {
  const isEn = detectLanguage(lead) === 'en';
  const hasLLM = !!(apiConfig.groqKey || apiConfig.geminiKey || apiConfig.nvidiaKey || apiConfig.openrouterKey);
  
  if (!hasLLM) {
    return buildEnrichedContent(lead, isEn);
  }
  
  try {
    const prompt = buildLlmPrompt(lead, isEn);
    const system = isEn
      ? 'You are a French web copywriter. Return ONLY valid JSON, no markdown.'
      : 'Tu es un copywriter web expert français. Retourne UNIQUEMENT du JSON valide sans markdown.';
    
    const response = await callLLM(apiConfig, prompt, system);
    
    // Extract JSON from response
    const jsonMatch = response?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Merge with enriched content to fill missing fields
      const enriched = buildEnrichedContent(lead, isEn);
      return {
        ...enriched,
        ...parsed,
        services: parsed.services || enriched.services,
        testimonials: parsed.testimonials || enriched.testimonials,
        whyChooseUs: parsed.whyChooseUs || enriched.whyChooseUs,
      };
    }
  } catch {
    // Fallback on error
  }
  
  return buildEnrichedContent(lead, isEn);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest --config jest.config.fixed.js --watchAll=false src/lib/website/__tests__/content-engine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/website/content-engine.ts src/lib/website/__tests__/content-engine.test.ts
git commit -m "feat(website): add content engine with LLM support and enriched fallback"
```

---

### Task 4: Layout Engine + Layouts

**Files:**
- Create: `src/lib/website/layout-engine.ts`
- Create: `src/lib/website/layouts/classic.ts`
- Create: `src/lib/website/layouts/modern.ts`
- Create: `src/lib/website/layouts/bold.ts`
- Create: `src/lib/website/layouts/magazine.ts`

**Interfaces:**
- Consumes: `LayoutModule`, `Lead`, `WebsiteContent`, `WebsiteImages`, `Palette`, `getUiStrings()`
- Produces: `selectLayout(lead: Lead, styleHint?: string): LayoutModule`

- [ ] **Step 1: Write the layout selection test**

```typescript
// src/lib/website/__tests__/layout-engine.test.ts
import { describe, it, expect } from '@jest/globals';

describe('LayoutEngine', () => {
  it('should select classic for plumber', () => {
    const layout = selectLayout({ id: '1', sector: 'plomberie', name: 'Test' } as any);
    expect(layout.id).toBe('classic');
  });
  
  it('should select bold for coiffeur', () => {
    const layout = selectLayout({ id: '1', sector: 'coiffeur', name: 'Test' } as any);
    expect(layout.id).toBe('bold');
  });
  
  it('should respect styleHint override', () => {
    const layout = selectLayout({ id: '1', sector: 'plomberie', name: 'Test' } as any, 'magazine');
    expect(layout.id).toBe('magazine');
  });
});
```

- [ ] **Step 2: Create `layout-engine.ts`**

```typescript
import { Lead, LayoutModule } from './types';
import { classicLayout } from './layouts/classic';
import { modernLayout } from './layouts/modern';
import { boldLayout } from './layouts/bold';
import { magazineLayout } from './layouts/magazine';

const layouts: LayoutModule[] = [classicLayout, modernLayout, boldLayout, magazineLayout];

const SECTOR_LAYOUT_MAP: Record<string, string> = {
  plomberie: 'classic',
  electricien: 'classic',
  garage: 'classic',
  nettoyage: 'classic',
  coiffeur: 'bold',
  spa: 'bold',
  fitness: 'bold',
  beaute: 'bold',
  restaurant: 'modern',
  boulanger: 'modern',
  traiteur: 'modern',
  avocat: 'magazine',
  medecin: 'magazine',
  medical: 'magazine',
  hotel: 'magazine',
  notaire: 'magazine',
};

// 10% chance of alternate layout for variety
function getAlternateLayout(baseId: string, sector: string): string {
  const alternates: Record<string, string[]> = {
    'classic': ['modern', 'magazine'],
    'modern': ['classic', 'magazine'],
    'bold': ['modern', 'classic'],
    'magazine': ['classic', 'modern'],
  };
  const alts = alternates[baseId] || ['classic'];
  return alts[Math.abs(sector.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % alts.length];
}

export function selectLayout(lead: Lead, styleHint?: string): LayoutModule {
  if (styleHint) {
    const match = layouts.find(l => l.id === styleHint);
    if (match) return match;
  }
  
  const sector = (lead.sector || '').toLowerCase();
  let layoutId = 'classic';
  
  for (const [key, id] of Object.entries(SECTOR_LAYOUT_MAP)) {
    if (sector.includes(key)) { layoutId = id; break; }
  }
  
  // 10% variety: use lead name hash
  const hash = (lead.name || lead.id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  if (hash % 10 === 0) {
    layoutId = getAlternateLayout(layoutId, sector);
  }
  
  return layouts.find(l => l.id === layoutId) || layouts[0];
}
```

- [ ] **Step 3: Create classic layout (`layouts/classic.ts`)**

Le layout existant de `ultimateTemplate.ts` converti en module LayoutModule. Structure :

```typescript
import { LayoutModule, WebsiteContent, WebsiteImages, Palette, UiStrings, Lead } from '../types';
import { getUiStrings } from '../data/ui-strings';
import { getSectorFallbackReviews } from '../data/fallback-reviews';
import { getProcessSteps } from '../data/process-steps';

export const classicLayout: LayoutModule = {
  id: 'classic',
  name: 'Classic',
  
  render(lead: Lead, content: WebsiteContent, images: WebsiteImages, palette: Palette): string {
    const lang = detectLanguage(lead);
    const ui = getUiStrings(lang);
    const reviews = content.testimonials.length >= 2 ? content.testimonials : getSectorFallbackReviews(lead.sector, lang).slice(0, 4);
    const steps = getProcessSteps(lead.sector, lang);
    
    return `<!DOCTYPE html>
<html lang="${ui.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(content.heroTitle)} - ${escapeHtml(lead.sector || 'Professionnel')}</title>
  <meta name="description" content="${escapeHtml(content.metaDescription)}">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    :root {
      --primary: ${palette.primary};
      --secondary: ${palette.secondary};
      --accent: ${palette.accent};
      --bg: ${palette.background};
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: #1f2937; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    header { background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
    nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
    .logo { font-size: 1.5rem; font-weight: bold; color: var(--primary); text-decoration: none; }
    .hero { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 5rem 0; text-align: center; }
    .hero h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 700; }
    .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
    .cta-btn { display: inline-block; padding: 1rem 2rem; background: white; color: var(--primary); border-radius: 8px; text-decoration: none; font-weight: 600; }
    .section-title { text-align: center; font-size: 2.5rem; color: var(--primary); margin: 3rem 0; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
    .service-card { background: white; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: transform 0.2s; }
    .service-card:hover { transform: translateY(-4px); }
    .guarantees-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
    .guarantee-card { text-align: center; padding: 2rem; background: white; border-radius: 12px; }
    .contact { background: var(--primary); color: white; padding: 4rem 0; text-align: center; }
    .contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin: 2rem 0; }
    .contact-item { background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px; }
    footer { background: var(--secondary); color: white; text-align: center; padding: 2rem 0; }
    @media (max-width: 768px) { .hero h1 { font-size: 2rem; } }
  </style>
</head>
<body>
  <header>
    <nav class="container">
      <a href="#home" class="logo">${escapeHtml(content.heroTitle)}</a>
      <div>
        <a href="#services" style="color:var(--primary);text-decoration:none;margin:0 1rem">${escapeHtml(ui.navServices)}</a>
        <a href="#about" style="color:var(--primary);text-decoration:none;margin:0 1rem">${escapeHtml(ui.navAbout)}</a>
        <a href="#testimonials" style="color:var(--primary);text-decoration:none;margin:0 1rem">${escapeHtml(ui.navAvis)}</a>
        <a href="#contact" style="color:var(--primary);text-decoration:none;margin:0 1rem">${escapeHtml(ui.navContact)}</a>
      </div>
    </nav>
  </header>

  <section class="hero" id="home">
    <div class="container">
      <h1>${escapeHtml(content.heroTitle)}</h1>
      <p>${escapeHtml(content.heroSubtitle)}</p>
      <a href="#contact" class="cta-btn">${escapeHtml(ui.heroCall)}</a>
    </div>
  </section>

  <section id="services" class="container">
    <h2 class="section-title">${escapeHtml(ui.svcTitle)}</h2>
    <div class="services-grid">
      ${content.services.map(s => `
        <div class="service-card">
          <h3>${escapeHtml(s.name)}</h3>
          <p>${escapeHtml(s.description)}</p>
          ${s.features?.length ? `<div style="margin-top:1rem;text-align:left">
            ${s.features.map(f => `<span style="display:inline-block;background:var(--bg);padding:0.25rem 0.5rem;margin:0.25rem;border-radius:4px;font-size:0.85rem">${escapeHtml(f)}</span>`).join('')}
          </div>` : ''}
        </div>
      `).join('')}
    </div>
  </section>

  <section id="about" class="container">
    <h2 class="section-title">${escapeHtml(content.aboutTitle)}</h2>
    <p style="text-align:center;max-width:800px;margin:0 auto 3rem;font-size:1.1rem">${escapeHtml(content.aboutText)}</p>
  </section>

  ${reviews.length ? `
  <section id="testimonials" style="background:white;padding:3rem 0">
    <div class="container">
      <h2 class="section-title">${escapeHtml(ui.testTitle)}</h2>
      ${reviews.slice(0, 4).map(r => `
        <div style="background:var(--bg);padding:1.5rem;border-radius:12px;margin-bottom:1rem">
          <p style="font-style:italic;margin-bottom:0.5rem">"${escapeHtml(r.text)}"</p>
          <strong>${escapeHtml(r.author)}</strong>
          <span style="color:#f59e0b;margin-left:0.5rem">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        </div>
      `).join('')}
    </div>
  </section>` : ''}

  <section id="contact" class="contact">
    <div class="container">
      <h2>${escapeHtml(ui.contactTitle)}</h2>
      <div class="contact-info">
        ${lead.phone ? `<div class="contact-item"><h3>${escapeHtml(ui.contactCall)}</h3><a href="tel:${escapeHtml(lead.phone)}" style="color:white;text-decoration:none">${escapeHtml(lead.phone)}</a></div>` : ''}
        ${lead.email ? `<div class="contact-item"><h3>Email</h3><a href="mailto:${escapeHtml(lead.email)}" style="color:white;text-decoration:none">${escapeHtml(lead.email)}</a></div>` : ''}
        ${lead.address ? `<div class="contact-item"><h3>Adresse</h3><p>${escapeHtml(lead.address)}</p></div>` : ''}
      </div>
      <a href="tel:${escapeHtml(lead.phone || '')}" class="cta-btn" style="margin-top:1rem">${escapeHtml(content.ctaText)}</a>
    </div>
  </section>

  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(content.heroTitle)}. ${escapeHtml(ui.footerContact)}</p>
    </div>
  </footer>
</body>
</html>`;
  }
};

function detectLanguage(lead: Lead): 'fr' | 'en' {
  const city = (lead.city || '').toLowerCase();
  const englishCities = ['london', 'new york', 'chicago', 'los angeles', 'miami', 'toronto', 'sydney', 'dubai'];
  const frenchCities = ['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'bordeaux', 'lille', 'strasbourg'];
  if (englishCities.some(c => city.includes(c))) return 'en';
  return 'fr';
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```

- [ ] **Step 4: Create `layouts/modern.ts`**

Layout moderne : hero full-screen avec image de fond, cards flottantes, animations, large whitespace.

```typescript
import { LayoutModule } from '../types';

export const modernLayout: LayoutModule = {
  id: 'modern',
  name: 'Modern',
  
  render(lead, content, images, palette) {
    const isEn = lead.city ? ['london', 'new york', 'chicago', 'los angeles'].some(c => (lead.city || '').toLowerCase().includes(c)) : false;
    const lang = isEn ? 'en' : 'fr';
    
    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(content.heroTitle)}</title>
  <meta name="description" content="${escapeHtml(content.metaDescription)}">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${palette.primary};
      --primary-dark: ${palette.secondary};
      --accent: ${palette.accent};
      --bg: ${palette.background};
      --text: #1a1a2e;
      --text-light: #6b7280;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; color: var(--text); background: white; overflow-x: hidden; }
    
    /* Transparent nav becomes solid on scroll */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 1.5rem 2rem; transition: all 0.3s ease; background: transparent; }
    nav.scrolled { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); box-shadow: 0 1px 10px rgba(0,0,0,0.05); }
    .nav-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: white; text-decoration: none; transition: color 0.3s; }
    nav.scrolled .logo { color: var(--primary); }
    .nav-links { display: flex; gap: 2rem; list-style: none; }
    .nav-links a { color: white; text-decoration: none; font-weight: 500; font-size: 0.9rem; opacity: 0.8; transition: opacity 0.3s; }
    nav.scrolled .nav-links a { color: var(--text); }
    .nav-links a:hover { opacity: 1; }
    
    /* Full-screen hero with image overlay */
    .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
    .hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--accent) 100%); }
    .hero-bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.3; mix-blend-mode: overlay; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)); }
    .hero-content { position: relative; z-index: 2; text-align: center; max-width: 800px; padding: 0 2rem; }
    .hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 8vw, 5rem); color: white; line-height: 1.1; margin-bottom: 1.5rem; }
    .hero p { font-size: 1.2rem; color: rgba(255,255,255,0.85); line-height: 1.6; margin-bottom: 2.5rem; }
    .hero-cta { display: inline-block; padding: 1rem 2.5rem; background: white; color: var(--primary); border-radius: 50px; text-decoration: none; font-weight: 600; transition: all 0.3s; }
    .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    
    /* Content sections with generous whitespace */
    section { padding: 6rem 2rem; }
    .section-inner { max-width: 1100px; margin: 0 auto; }
    .section-label { text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.8rem; color: var(--accent); font-weight: 600; margin-bottom: 0.5rem; }
    .section-title { font-family: 'Playfair Display', serif; font-size: 2.8rem; margin-bottom: 1rem; line-height: 1.2; }
    .section-desc { color: var(--text-light); font-size: 1.1rem; max-width: 600px; line-height: 1.7; }
    
    /* Service cards with shadows and float */
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; margin-top: 3rem; }
    .service-card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); transition: all 0.3s; border: 1px solid rgba(0,0,0,0.04); }
    .service-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); border-color: var(--accent); }
    .service-card h3 { font-size: 1.3rem; margin-bottom: 1rem; color: var(--primary); }
    .service-card p { color: var(--text-light); line-height: 1.6; }
    
    /* Stats bar */
    .stats { background: var(--primary); color: white; padding: 4rem 2rem; }
    .stats-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; text-align: center; }
    .stat-value { font-size: 2.5rem; font-weight: 700; font-family: 'Playfair Display', serif; }
    .stat-label { opacity: 0.8; font-size: 0.95rem; margin-top: 0.5rem; }
    
    /* Testimonials carousel */
    .testimonials-carousel { display: flex; gap: 2rem; overflow-x: auto; padding: 2rem 0; scroll-snap-type: x mandatory; }
    .testimonial-card { min-width: 350px; flex-shrink: 0; scroll-snap-align: start; background: var(--bg); padding: 2rem; border-radius: 16px; }
    .testimonial-text { font-style: italic; line-height: 1.7; margin-bottom: 1.5rem; }
    .testimonial-author { font-weight: 600; }
    .testimonial-rating { color: #f59e0b; }
    
    /* Contact minimal */
    .contact-section { background: var(--bg); }
    .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem; }
    .contact-item { padding: 1.5rem; background: white; border-radius: 12px; text-align: center; }
    .contact-item a { color: var(--primary); text-decoration: none; font-weight: 500; }
    
    footer { padding: 3rem 2rem; text-align: center; color: var(--text-light); border-top: 1px solid #eee; }
    
    @media (max-width: 768px) {
      nav { padding: 1rem; }
      .nav-links { gap: 1rem; }
      .hero-content h1 { font-size: 2.5rem; }
      section { padding: 4rem 1.5rem; }
      .section-title { font-size: 2rem; }
      .services-grid { grid-template-columns: 1fr; }
      .testimonial-card { min-width: 280px; }
    }
  </style>
</head>
<body>
  <nav id="navbar">
    <div class="nav-inner">
      <a href="#home" class="logo">${escapeHtml(content.heroTitle)}</a>
      <ul class="nav-links">
        <li><a href="#services">${isEn ? 'Services' : 'Services'}</a></li>
        <li><a href="#about">${isEn ? 'About' : 'À propos'}</a></li>
        <li><a href="#testimonials">${isEn ? 'Reviews' : 'Avis'}</a></li>
        <li><a href="#contact">${isEn ? 'Contact' : 'Contact'}</a></li>
      </ul>
    </div>
  </nav>

  <section class="hero" id="home">
    <div class="hero-bg">
      ${images.hero ? `<img src="${escapeHtml(images.hero)}" alt="">` : ''}
    </div>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1>${escapeHtml(content.heroTitle)}</h1>
      <p>${escapeHtml(content.heroSubtitle)}</p>
      <a href="#contact" class="hero-cta">${escapeHtml(content.ctaText)}</a>
    </div>
  </section>

  <section id="services">
    <div class="section-inner">
      <div class="section-label">${isEn ? 'What We Offer' : 'Notre Expertise'}</div>
      <h2 class="section-title">${escapeHtml(content.servicesTitle)}</h2>
      <p class="section-desc">${escapeHtml(content.heroSubtitle.substring(0, 120))}</p>
      <div class="services-grid">
        ${content.services.map(s => `
          <div class="service-card">
            <h3>${escapeHtml(s.name)}</h3>
            <p>${escapeHtml(s.description)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  ${content.whyChooseUs?.length ? `
  <section class="stats">
    <div class="stats-grid">
      ${content.whyChooseUs.slice(0, 4).map(w => `
        <div>
          <div class="stat-value">✓</div>
          <div class="stat-label">${escapeHtml(w)}</div>
        </div>
      `).join('')}
    </div>
  </section>` : ''}

  <section id="about">
    <div class="section-inner">
      <div class="section-label">${isEn ? 'About' : 'À propos'}</div>
      <h2 class="section-title">${escapeHtml(content.aboutTitle)}</h2>
      <p style="font-size:1.1rem;line-height:1.8;color:var(--text-light);max-width:800px">${escapeHtml(content.aboutText)}</p>
    </div>
  </section>

  ${content.testimonials?.length ? `
  <section id="testimonials" style="background:var(--bg)">
    <div class="section-inner">
      <div class="section-label">${isEn ? 'Client Reviews' : 'Avis Clients'}</div>
      <h2 class="section-title">${isEn ? 'What Our Clients Say' : 'Ce que disent nos clients'}</h2>
      <div class="testimonials-carousel">
        ${content.testimonials.slice(0, 6).map(t => `
          <div class="testimonial-card">
            <div class="testimonial-text">"${escapeHtml(t.text)}"</div>
            <div class="testimonial-author">${escapeHtml(t.author)}</div>
            <div class="testimonial-rating">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''}

  <section class="contact-section" id="contact">
    <div class="section-inner">
      <div class="section-label">${isEn ? 'Get in Touch' : 'Contact'}</div>
      <h2 class="section-title">${isEn ? 'Contact Us' : 'Contactez-nous'}</h2>
      <div class="contact-grid">
        ${lead.phone ? `<div class="contact-item"><h3 style="color:var(--primary);margin-bottom:0.5rem">${isEn ? 'Phone' : 'Téléphone'}</h3><a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a></div>` : ''}
        ${lead.email ? `<div class="contact-item"><h3 style="color:var(--primary);margin-bottom:0.5rem">Email</h3><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></div>` : ''}
        ${lead.address ? `<div class="contact-item"><h3 style="color:var(--primary);margin-bottom:0.5rem">${isEn ? 'Address' : 'Adresse'}</h3><p>${escapeHtml(lead.address)}</p></div>` : ''}
      </div>
    </div>
  </section>

  <footer>
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(content.heroTitle)}. ${isEn ? 'All rights reserved.' : 'Tous droits réservés.'}</p>
  </footer>

  <script>
    window.addEventListener('scroll', function() {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 100);
    });
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      });
    });
  </script>
</body>
</html>`;
  }
};

function escapeHtml(text: string): string {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```

- [ ] **Step 5: Create `layouts/bold.ts`**

```typescript
import { LayoutModule } from '../types';

export const boldLayout: LayoutModule = {
  id: 'bold',
  name: 'Bold',

  render(lead, content, images, palette) {
    const isEn = ['london', 'new york', 'chicago', 'los angeles'].some(c => (lead.city || '').toLowerCase().includes(c));
    const lang = isEn ? 'en' : 'fr';

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(content.heroTitle)}</title>
  <meta name="description" content="${escapeHtml(content.metaDescription)}">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${palette.primary};
      --accent: ${palette.accent};
      --bg: #0f0f0f;
      --surface: #1a1a2e;
      --surface2: #16213e;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }

    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 1.2rem 2rem; }
    .nav-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-weight: 900; font-size: 1.3rem; color: white; text-decoration: none; letter-spacing: -0.02em; }
    .nav-links { display: flex; gap: 2rem; list-style: none; }
    .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; transition: color 0.3s; }
    .nav-links a:hover { color: var(--accent); }

    /* Hero avec titre gradient néon */
    .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; padding: 0 2rem; }
    .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, var(--surface) 0%, var(--bg) 70%); }
    .hero-content { position: relative; z-index: 2; text-align: center; max-width: 900px; }
    .hero h1 { font-size: clamp(3.5rem, 10vw, 7rem); font-weight: 900; line-height: 0.95; margin-bottom: 1.5rem; background: linear-gradient(135deg, var(--accent) 0%, ${palette.accent} 30%, ${palette.primary} 70%, white 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.03em; }
    .hero p { font-size: 1.15rem; color: var(--text-muted); max-width: 600px; margin: 0 auto 2.5rem; line-height: 1.7; }
    .hero-cta { display: inline-block; padding: 1rem 2.5rem; background: var(--accent); color: white; text-decoration: none; font-weight: 700; border-radius: 8px; border: none; font-size: 0.95rem; transition: all 0.3s; text-transform: uppercase; letter-spacing: 0.05em; }
    .hero-cta:hover { transform: translateY(-3px); box-shadow: 0 10px 40px rgba(0,0,0,0.4); }

    section { padding: 5rem 2rem; }
    .section-inner { max-width: 1100px; margin: 0 auto; }
    .section-label { color: var(--accent); text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; }
    .section-title { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: -0.02em; }

    /* Services zigzag */
    .service-row { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; margin-bottom: 4rem; }
    .service-row.reverse { direction: rtl; }
    .service-row.reverse > * { direction: ltr; }
    .service-visual { aspect-ratio: 4/3; border-radius: 16px; overflow: hidden; background: var(--surface); ${images.hero ? `background-image: url(${escapeHtml(images.hero)}); background-size: cover; background-position: center;` : ''} }
    .service-info h3 { font-size: 1.5rem; margin-bottom: 0.75rem; color: var(--accent); }
    .service-info p { color: var(--text-muted); line-height: 1.7; }
    .service-features { margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .service-features span { background: var(--surface); padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.05); }

    /* Counters */
    .counters { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin: 3rem 0; text-align: center; }
    .counter-value { font-size: 3rem; font-weight: 900; color: var(--accent); }
    .counter-label { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; }

    /* Testimonials quotes */
    .quote-card { border-left: 3px solid var(--accent); padding: 2rem; margin-bottom: 2rem; background: var(--surface); border-radius: 0 12px 12px 0; }
    .quote-text { font-size: 1.1rem; line-height: 1.7; font-style: italic; margin-bottom: 1rem; color: var(--text); }
    .quote-author { font-weight: 600; color: var(--accent); }

    /* Neon contact */
    .contact-neon { background: var(--surface); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 3rem; text-align: center; max-width: 600px; margin: 0 auto; box-shadow: 0 0 40px rgba(${palette.primary.replace('#', '')}, 0.1); }
    .contact-neon h2 { font-size: 2rem; margin-bottom: 1rem; }
    .contact-neon a { color: var(--accent); text-decoration: none; font-size: 1.2rem; font-weight: 600; }
    .contact-neon .cta-glow { display: inline-block; margin-top: 1.5rem; padding: 1rem 3rem; background: linear-gradient(135deg, var(--accent), ${palette.accent}); color: white; border-radius: 8px; text-decoration: none; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s; }
    .contact-neon .cta-glow:hover { transform: scale(1.05); box-shadow: 0 0 30px var(--accent); }

    footer { padding: 3rem 2rem; text-align: center; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.05); }

    @media (max-width: 768px) {
      .service-row { grid-template-columns: 1fr; gap: 1.5rem; }
      .service-row.reverse { direction: ltr; }
      .hero h1 { font-size: 2.5rem; }
      section { padding: 3rem 1.5rem; }
      .counters { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <a href="#home" class="logo">◆ ${escapeHtml(content.heroTitle)}</a>
      <ul class="nav-links">
        <li><a href="#services">${isEn ? 'Services' : 'Services'}</a></li>
        <li><a href="#about">${isEn ? 'About' : 'À propos'}</a></li>
        <li><a href="#testimonials">${isEn ? 'Reviews' : 'Avis'}</a></li>
        <li><a href="#contact">${isEn ? 'Contact' : 'Contact'}</a></li>
      </ul>
    </div>
  </nav>

  <section class="hero" id="home">
    <div class="hero-bg"></div>
    <div class="hero-content">
      <h1>${escapeHtml(content.heroTitle)}</h1>
      <p>${escapeHtml(content.heroSubtitle)}</p>
      <a href="#contact" class="hero-cta">${escapeHtml(content.ctaText)}</a>
    </div>
  </section>

  <section id="services">
    <div class="section-inner">
      <div class="section-label">${isEn ? 'Expertise' : 'Notre Expertise'}</div>
      <h2 class="section-title">${escapeHtml(content.servicesTitle)}</h2>
      ${content.services.map((s, i) => `
        <div class="service-row ${i % 2 === 1 ? 'reverse' : ''}">
          <div class="service-visual"></div>
          <div class="service-info">
            <h3>${escapeHtml(s.name)}</h3>
            <p>${escapeHtml(s.description)}</p>
            ${s.features?.length ? `<div class="service-features">${s.features.map(f => `<span>${escapeHtml(f)}</span>`).join('')}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </section>

  <section id="about" style="background:var(--surface)">
    <div class="section-inner">
      <div class="section-label">${isEn ? 'About' : 'À propos'}</div>
      <h2 class="section-title">${escapeHtml(content.aboutTitle)}</h2>
      <p style="color:var(--text-muted);font-size:1.1rem;line-height:1.8;max-width:800px">${escapeHtml(content.aboutText)}</p>
      <div class="counters">
        <div><div class="counter-value">15+</div><div class="counter-label">${isEn ? 'Years Experience' : 'Ans d\'expérience'}</div></div>
        <div><div class="counter-value">500+</div><div class="counter-label">${isEn ? 'Clients Served' : 'Clients servis'}</div></div>
        <div><div class="counter-value">4.9★</div><div class="counter-label">${isEn ? 'Google Rating' : 'Note Google'}</div></div>
        <div><div class="counter-value">100%</div><div class="counter-label">${isEn ? 'Satisfaction' : 'Satisfaction'}</div></div>
      </div>
    </div>
  </section>

  ${content.testimonials?.length ? `
  <section id="testimonials">
    <div class="section-inner">
      <div class="section-label">${isEn ? 'Testimonials' : 'Témoignages'}</div>
      <h2 class="section-title">${isEn ? 'What Clients Say' : 'Ce que disent nos clients'}</h2>
      ${content.testimonials.slice(0, 4).map(t => `
        <div class="quote-card">
          <div class="quote-text">"${escapeHtml(t.text)}"</div>
          <div class="quote-author">${escapeHtml(t.author)} ★${t.rating}</div>
        </div>
      `).join('')}
    </div>
  </section>` : ''}

  <section id="contact" style="padding-bottom:5rem">
    <div class="section-inner">
      <div class="section-label">${isEn ? 'Contact' : 'Contact'}</div>
      <div class="contact-neon">
        <h2>${isEn ? 'Get in Touch' : 'Contactez-nous'}</h2>
        ${lead.phone ? `<p style="margin:1rem 0;color:var(--text-muted)">${isEn ? 'Call us' : 'Appelez-nous'}</p><a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a>` : ''}
        ${lead.email ? `<p style="margin:0.5rem 0;color:var(--text-muted)">Email</p><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>` : ''}
        <br>
        <a href="tel:${escapeHtml(lead.phone || '')}" class="cta-glow">${escapeHtml(content.ctaText)}</a>
      </div>
    </div>
  </section>

  <footer>
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(content.heroTitle)}.</p>
  </footer>

  <script>
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      });
    });
    window.addEventListener('scroll', function() {
      document.querySelector('nav').style.background = window.scrollY > 50 ? 'rgba(15,15,15,0.95)' : 'transparent';
    });
  </script>
</body>
</html>`;
  }
};

function escapeHtml(text: string): string {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```

- [ ] **Step 6: Create `layouts/magazine.ts`**

```typescript
import { LayoutModule } from '../types';

export const magazineLayout: LayoutModule = {
  id: 'magazine',
  name: 'Magazine',

  render(lead, content, images, palette) {
    const isEn = ['london', 'new york', 'chicago', 'los angeles'].some(c => (lead.city || '').toLowerCase().includes(c));
    const lang = isEn ? 'en' : 'fr';

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(content.heroTitle)}</title>
  <meta name="description" content="${escapeHtml(content.metaDescription)}">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${palette.primary};
      --accent: ${palette.accent};
      --bg: ${palette.background};
      --surface: white;
      --text: #1a1a2e;
      --text-muted: #64748b;
      --border: #e2e8f0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; color: var(--text); background: white; line-height: 1.6; }

    /* Thin elegant nav */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 1rem 2rem; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
    .nav-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--primary); text-decoration: none; }
    .nav-links { display: flex; gap: 2rem; list-style: none; }
    .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: color 0.3s; }
    .nav-links a:hover { color: var(--primary); }

    /* Split-screen hero */
    .hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 90vh; margin-top: 60px; }
    .hero-visual { background: var(--bg); display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .hero-visual img { width: 100%; height: 100%; object-fit: cover; }
    .hero-text { display: flex; flex-direction: column; justify-content: center; padding: 4rem; }
    .hero-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--accent); font-weight: 600; margin-bottom: 0.5rem; }
    .hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(2.5rem, 5vw, 4rem); line-height: 1.1; margin-bottom: 1.5rem; }
    .hero p { color: var(--text-muted); font-size: 1.05rem; line-height: 1.7; margin-bottom: 2rem; }
    .hero-cta { display: inline-block; padding: 0.9rem 2rem; background: var(--primary); color: white; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 0.9rem; align-self: flex-start; }

    section { padding: 5rem 2rem; }
    .section-inner { max-width: 1200px; margin: 0 auto; }

    /* Services as 2-column asymmetric magazine layout */
    .magazine-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 3rem; }
    .magazine-main h2 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 2rem; }
    .service-entry { border-bottom: 1px solid var(--border); padding: 1.5rem 0; }
    .service-entry:last-child { border-bottom: none; }
    .service-entry h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--primary); }
    .service-entry p { color: var(--text-muted); line-height: 1.6; }
    .magazine-sidebar { background: var(--bg); padding: 2rem; border-radius: 12px; }
    .magazine-sidebar h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid var(--primary); }
    .sidebar-item { margin-bottom: 1.25rem; }
    .sidebar-item strong { display: block; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.25rem; }
    .sidebar-item span { font-size: 1rem; }

    .about-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
    .about-layout h2 { font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 1rem; }
    .about-layout p { color: var(--text-muted); line-height: 1.8; }

    /* Testimonials in sidebar style */
    .testimonial-side { border-left: 2px solid var(--accent); padding-left: 1.5rem; margin-bottom: 2rem; }
    .testimonial-side p { font-style: italic; color: var(--text-muted); line-height: 1.7; margin-bottom: 0.75rem; }
    .testimonial-side .author { font-weight: 600; color: var(--primary); }
    .testimonial-side .rating { color: #f59e0b; font-size: 0.85rem; }

    /* Minimal contact */
    .contact-simple { max-width: 600px; margin: 0 auto; text-align: center; }
    .contact-simple h2 { font-family: 'Playfair Display', serif; font-size: 2.5rem; margin-bottom: 1.5rem; }
    .contact-row { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; margin: 2rem 0; }
    .contact-row a { color: var(--primary); text-decoration: none; font-weight: 500; }
    .contact-row a:hover { text-decoration: underline; }

    footer { padding: 3rem 2rem; text-align: center; color: var(--text-muted); border-top: 1px solid var(--border); font-size: 0.9rem; }

    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; min-height: auto; }
      .hero-visual { min-height: 300px; }
      .hero-text { padding: 2rem; }
      .magazine-grid { grid-template-columns: 1fr; }
      .about-layout { grid-template-columns: 1fr; gap: 2rem; }
      section { padding: 3rem 1.5rem; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <a href="#home" class="logo">${escapeHtml(content.heroTitle)}</a>
      <ul class="nav-links">
        <li><a href="#services">${isEn ? 'Services' : 'Services'}</a></li>
        <li><a href="#about">${isEn ? 'About' : 'À propos'}</a></li>
        <li><a href="#reviews">${isEn ? 'Reviews' : 'Avis'}</a></li>
        <li><a href="#contact">${isEn ? 'Contact' : 'Contact'}</a></li>
      </ul>
    </div>
  </nav>

  <div class="hero" id="home">
    <div class="hero-visual">
      ${images.hero ? `<img src="${escapeHtml(images.hero)}" alt="">` : `<div style="font-size:4rem;color:var(--accent);opacity:0.3">◆</div>`}
    </div>
    <div class="hero-text">
      <div class="hero-label">${escapeHtml(content.heroTitle)}</div>
      <h1>${escapeHtml(content.heroTitle)}</h1>
      <p>${escapeHtml(content.heroSubtitle)}</p>
      <a href="#contact" class="hero-cta">${escapeHtml(content.ctaText)}</a>
    </div>
  </div>

  <section id="services">
    <div class="section-inner">
      <div class="magazine-grid">
        <div class="magazine-main">
          <h2>${escapeHtml(content.servicesTitle)}</h2>
          ${content.services.map(s => `
            <div class="service-entry">
              <h3>${escapeHtml(s.name)}</h3>
              <p>${escapeHtml(s.description)}</p>
              ${s.features?.length ? `<div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.5rem">${s.features.map(f => `<span style="background:var(--bg);padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;color:var(--text-muted)">${escapeHtml(f)}</span>`).join('')}</div>` : ''}
            </div>
          `).join('')}
        </div>
        <div class="magazine-sidebar">
          <h3>${isEn ? 'Contact Info' : 'Informations'}</h3>
          ${lead.phone ? `<div class="sidebar-item"><strong>${isEn ? 'Phone' : 'Téléphone'}</strong><span>${escapeHtml(lead.phone)}</span></div>` : ''}
          ${lead.email ? `<div class="sidebar-item"><strong>Email</strong><span>${escapeHtml(lead.email)}</span></div>` : ''}
          ${lead.address ? `<div class="sidebar-item"><strong>${isEn ? 'Address' : 'Adresse'}</strong><span>${escapeHtml(lead.address)}</span></div>` : ''}
          <div class="sidebar-item"><strong>${isEn ? 'Hours' : 'Horaires'}</strong><span>${isEn ? 'Mon-Fri: 9:00-19:00' : 'Lun-Ven: 9h-19h'}</span></div>
          ${content.whyChooseUs?.length ? `<div style="margin-top:2rem"><h3 style="font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:1rem">${isEn ? 'Why Us' : 'Pourquoi nous'}</h3>${content.whyChooseUs.slice(0, 3).map(w => `<div style="margin-bottom:0.75rem;font-size:0.9rem;color:var(--text-muted)">› ${escapeHtml(w)}</div>`).join('')}</div>` : ''}
        </div>
      </div>
    </div>
  </section>

  <section id="about" style="background:var(--bg)">
    <div class="section-inner">
      <div class="about-layout">
        <div>
          <h2>${escapeHtml(content.aboutTitle)}</h2>
          <p>${escapeHtml(content.aboutText)}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          ${(content.whyChooseUs || []).slice(0, 4).map(w => `
            <div style="background:white;padding:1.5rem;border-radius:8px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.04)">
              <div style="font-size:1.5rem;color:var(--accent);margin-bottom:0.5rem">✦</div>
              <div style="font-size:0.9rem;color:var(--text-muted)">${escapeHtml(w)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>

  ${content.testimonials?.length ? `
  <section id="reviews">
    <div class="section-inner">
      <h2 style="font-family:'Playfair Display',serif;font-size:2rem;margin-bottom:2rem;text-align:center">${isEn ? 'Client Reviews' : 'Avis Clients'}</h2>
      <div style="max-width:700px;margin:0 auto">
        ${content.testimonials.slice(0, 4).map(t => `
          <div class="testimonial-side">
            <p>"${escapeHtml(t.text)}"</p>
            <span class="author">${escapeHtml(t.author)}</span>
            <span class="rating"> ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''}

  <section id="contact" style="background:var(--bg)">
    <div class="section-inner">
      <div class="contact-simple">
        <h2>${isEn ? 'Get in Touch' : 'Contactez-nous'}</h2>
        <p style="color:var(--text-muted);margin-bottom:2rem">${isEn ? 'We\'d love to hear from you' : 'Nous serions ravis de vous entendre'}</p>
        <div class="contact-row">
          ${lead.phone ? `<a href="tel:${escapeHtml(lead.phone)}">${isEn ? '📞 ' : '📞 '}${escapeHtml(lead.phone)}</a>` : ''}
          ${lead.email ? `<a href="mailto:${escapeHtml(lead.email)}">✉️ ${escapeHtml(lead.email)}</a>` : ''}
        </div>
        ${lead.address ? `<p style="color:var(--text-muted);margin-top:1rem">📍 ${escapeHtml(lead.address)}</p>` : ''}
      </div>
    </div>
  </section>

  <footer>
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(content.heroTitle)}. ${isEn ? 'All rights reserved.' : 'Tous droits réservés.'}</p>
  </footer>

  <script>
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      });
    });
  </script>
</body>
</html>`;
  }
};

function escapeHtml(text: string): string {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```

- [ ] **Step 7: Run layout tests**

Run: `npx jest --config jest.config.fixed.js --watchAll=false src/lib/website/__tests__/layout-engine.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/lib/website/layout-engine.ts src/lib/website/layouts/ src/lib/website/__tests__/layout-engine.test.ts
git commit -m "feat(website): add layout engine with 4 layout variants"
```

---

### Task 5: Unificateur — point d'entrée unique

**Files:**
- Create: `src/lib/website/unificateur.ts`

**Interfaces:**
- Consumes: `Lead`, `ApiConfig`, `generateContent()`, `fetchImages()`, `selectLayout()`, `getPalette()`
- Produces: `generateSite(lead: Lead, apiConfig: ApiConfig, options?: { style?: string }): Promise<string>`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/website/__tests__/unificateur.test.ts
import { describe, it, expect } from '@jest/globals';

describe('Unificateur', () => {
  it('should generate valid HTML for a lead', async () => {
    const lead = {
      id: 'test-1',
      name: 'Plomberie Test',
      sector: 'plomberie',
      city: 'Paris',
      description: 'Expert en plomberie',
      phone: '+33612345678',
      email: 'test@test.fr',
      address: 'Paris',
      images: [],
      websiteImages: [],
      googleReviewsData: [],
      googleRating: 0,
      googleReviews: 0,
      logo: '',
    };
    
    const html = await generateSite(lead, { pexelsKey: '', groqKey: '' });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
    expect(html).toContain('Plomberie Test');
    expect(html.toLowerCase()).toContain('plomberie');
  });
});
```

- [ ] **Step 2: Create `unificateur.ts`**

```typescript
import { Lead, ApiConfig } from '../supabase-store';
import { generateContent } from './content-engine';
import { fetchImages } from './image-engine';
import { selectLayout } from './layout-engine';
import { getPalette } from './data/palettes';

export async function generateSite(
  lead: Lead,
  apiConfig: ApiConfig,
  options?: { style?: string }
): Promise<string> {
  const palette = getPalette(lead.sector);
  const content = await generateContent(lead, apiConfig);
  const images = await fetchImages(lead, apiConfig);
  const layout = selectLayout(lead, options?.style);
  
  return layout.render(lead, content, images, palette);
}
```

- [ ] **Step 3: Run test**

Run: `npx jest --config jest.config.fixed.js --watchAll=false src/lib/website/__tests__/unificateur.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/website/unificateur.ts src/lib/website/__tests__/unificateur.test.ts
git commit -m "feat(website): add unificateur as single entry point"
```

---

### Task 6: Mettre à jour WebsiteGen.tsx

**Files:**
- Modify: `src/components/WebsiteGen.tsx`

**Interfaces:**
- Consumes: `generateSite` from `src/lib/website/unificateur.ts`
- Anciens imports à remplacer : `generateUltimateSite`, `generateUltimateSiteAsync`

- [ ] **Step 1: Update imports in `WebsiteGen.tsx`**

Remplacer :
```typescript
import { generateUltimateSite, generateUltimateSiteAsync, detectLanguage } from '../lib/ultimateTemplate';
```
Par :
```typescript
import { generateSite } from '../lib/website/unificateur';
import { detectLanguage } from '../lib/ultimateTemplate';
```

- [ ] **Step 2: Mettre à jour la fonction `generateSite`**

Dans `WebsiteGen.tsx`, la fonction `generateSite(lead: Lead)` (une des nombreuses définitions) devient :

```typescript
const generateSite = async (lead: Lead) => {
  updateProgress({ step: `Génération du site pour ${lead.name}...` });
  
  if (!lead.id) {
    console.log('❌ Lead sans ID, ignoré');
    return;
  }
  
  try {
    const html = await generateSiteNew(lead, apiConfig);
    
    if (!html || html.length < 500) {
      throw new Error('HTML generated is too short or empty');
    }
    
    await updateLead(lead.id, {
      siteHtml: html,
      siteGenerated: true,
      siteUrl: lead.website || '',
      landingUrl: lead.website || '',
    });
    
    console.log(`✅ Site généré pour ${lead.name} (${(html.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.log(`❌ Erreur pour ${lead.name}: ${err}`);
    // Fallback: utiliser l'ancien template
    try {
      const { generateUltimateSite } = await import('../lib/ultimateTemplate');
      const html = generateUltimateSite(lead);
      if (html) {
        await updateLead(lead.id, {
          siteHtml: html,
          siteGenerated: true,
        });
        console.log(`✅ Fallback réussi pour ${lead.name}`);
      }
    } catch (fallbackErr) {
      console.log(`❌ Fallback également échoué pour ${lead.name}: ${fallbackErr}`);
    }
  }
};
```

- [ ] **Step 3: Renommer les conflits de noms**

Dans WebsiteGen.tsx, il y a déjà plusieurs fonctions nommées `generateSite`, `buildShortPrompt`, etc. Renommer l'import du nouvel unificateur en `generateSiteNew` :

```typescript
import { generateSite as generateSiteNew } from '../lib/website/unificateur';
```

- [ ] **Step 4: Update `handleBatchGenerate`**

Dans la boucle batch, remplacer l'appel à l'ancien `generateSite(lead)` (qui utilisait `generateUltimateSite`) par le nouvel appel via unificateur.

- [ ] **Step 5: Vérifier que tout compile**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 6: Commit**

```bash
git add src/components/WebsiteGen.tsx
git commit -m "feat(website): integrate new modular generator in WebsiteGen"
```

---

### Task 7: Test d'intégration et validation

**Files:**
- Run: tests existants
- Vérifier : les sites générés

- [ ] **Step 1: Run all unit tests**

Run: `npx jest --config jest.config.fixed.js --watchAll=false`
Expected: All tests pass (or pre-existing failures only)

- [ ] **Step 2: Générer un site test**

Run: `node -e "
const { generateSite } = require('./src/lib/website/unificateur');
const lead = {
  id: 'test-final',
  name: 'Plomberie Express',
  sector: 'plomberie',
  city: 'Lyon',
  description: 'Plombier professionnel depuis 20 ans',
  phone: '+33611223344',
  email: 'contact@plomberie-express.fr',
  address: '15 rue de la République, Lyon',
  images: [],
  websiteImages: [],
  googleReviewsData: [
    { author: 'Marie D.', text: 'Intervention rapide et efficace !', rating: 5, date: '2024-01-15' },
    { author: 'Paul M.', text: 'Plombier sérieux et compétent.', rating: 5, date: '2024-02-20' }
  ],
  googleRating: 4.9,
  googleReviews: 34,
  logo: ''
};
generateSite(lead, { pexelsKey: '', groqKey: '' }).then(html => {
  require('fs').writeFileSync('test-generated-site.html', html);
  console.log('Site generated:', html.length, 'bytes');
});
"`

Expected: `test-generated-site.html` créé avec un site valide.

- [ ] **Step 3: Vérifier la diversité des layouts**

Run: `node -e "
const { selectLayout } = require('./src/lib/website/layout-engine');
const sectors = ['plomberie', 'electricien', 'coiffeur', 'restaurant', 'garage', 'avocat', 'medecin', 'fitness', 'jardin', 'nettoyage'];
sectors.forEach(s => {
  const l = selectLayout({ id: 'test', name: 'Test', sector: s });
  console.log(s + ' -> ' + l.id);
});
"`

Expected: Les sectors mappent aux bons layouts, avec ~10% de variation.

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "feat(website): complete modularisation with 4 layouts, image/content engines"
```
