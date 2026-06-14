# Template Henbo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new template file `src/lib/template-henbo.ts` inspired by the Henbo Elementor theme, generating professional local-service websites.

**Architecture:** Single new file exporting `generateUltimateSite` and `generateUltimateSiteAsync` with identical signatures to `ultimateTemplate.ts`. Reuses existing data-processing functions (review validation, image selection, sector palettes) where possible. 100% custom CSS, no Tailwind, no inline styles.

**Tech Stack:** TypeScript, Plus Jakarta Sans (Google Fonts), Lucide Icons, JSON-LD structured data.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/lib/template-henbo.ts` | NEW — complete template (CSS + HTML + generators + data wiring) |
| `src/lib/ultimateTemplate.ts` | UNCHANGED — keep as fallback |
| `src/components/WebsiteGen.tsx` | UNCHANGED (adds import later if switching) |

---

### Task 1: Create file skeleton + CSS design system

**Files:**
- Create: `src/lib/template-henbo.ts`

- [ ] **Step 1: Create file with exports and imports**

```typescript
// ── IMPORTS ──
import { type UltimateContent } from './ultimateTemplate';
// Data-processing functions reused from ultimateTemplate
import { extractAndValidateRealReviews, buildCompleteTestimonialList, formatReviewDate, getSectorPalette, validateAndCategorizeImages, selectUniqueImages } from './ultimateTemplate';

// ── EXPORTS ──
export function generateUltimateSite(lead: any, aiContent?: any): string {
  // Same logic as ultimateTemplate.ts: validate, prepare content, call buildHTML
  // ... (will be wired in Task 9)
  return '';
}

export async function generateUltimateSiteAsync(lead: any, aiContent?: any): Promise<string> {
  // Async version with Pexels API
  return generateUltimateSite(lead, aiContent);
}
```

- [ ] **Step 2: Add CSS variables and base styles**

```typescript
function buildCSS(sector: string): string {
  const palette = getSectorPalette(sector);
  return `
:root {
  --primary: ${palette.primary};
  --primary-dark: ${darkenColor(palette.primary, 0.15)};
  --accent: ${palette.accent};
  --text: #1e293b;
  --text-light: #64748b;
  --text-muted: #94a3b8;
  --bg: #ffffff;
  --bg-alt: #f8fafc;
  --bg-dark: #0f172a;
  --border: rgba(0,0,0,0.07);
  --hero-overlay: rgba(0,0,0,0.5);
  --radius: 16px;
  --radius-sm: 8px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text); line-height: 1.7; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; text-decoration: none; }
ul { list-style: none; }

.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; width: 100%; }
section { padding: clamp(60px, 8vw, 100px) 0; }
.section-alt { background: var(--bg-alt); }

h1 { font-size: clamp(2.25rem, 4vw, 3.5rem); font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
h2 { font-size: clamp(1.75rem, 3vw, 2.5rem); font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
h3 { font-size: 1.25rem; font-weight: 700; line-height: 1.3; }

.section-label {
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--primary); font-size: 0.8rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;
}
.section-label i { width: 16px; height: 16px; }

.section-header { text-align: center; margin-bottom: 56px; }
.section-header h2 { margin-bottom: 16px; }
.section-header p { color: var(--text-light); font-size: 1.05rem; max-width: 600px; margin: 0 auto; }

/* Card system */
.card {
  border-radius: var(--radius); border: 1px solid var(--border);
  padding: 28px; background: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }

/* Icon container */
.icon-44 {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 28px; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; border: none; white-space: nowrap; }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
.btn-outline { background: transparent; color: var(--primary); border: 1px solid var(--primary); }
.btn-outline:hover { background: var(--primary); color: white; }
.btn-white { background: white; color: var(--primary); }
.btn-white:hover { background: var(--bg-alt); }

/* Grids */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; }
@media (max-width: 900px) { .grid-3, .grid-2 { grid-template-columns: 1fr; } }

/* Utilities */
.flex-center { display: flex; align-items: center; justify-content: center; }
.gap-8 { gap: 8px; }
.gap-12 { gap: 12px; }
.gap-16 { gap: 16px; }
.mb-16 { margin-bottom: 16px; }
.mb-24 { margin-bottom: 24px; }
  `;
}
```

Helper function for darkening color:
```typescript
function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * amount));
  return `rgb(${r},${g},${b})`;
}
```

### Task 2: Marquee + Navigation

**Files:**
- Modify: `src/lib/template-henbo.ts`

- [ ] **Step 1: Add marquee HTML generator**

```typescript
function generateMarquee(phone: string, email: string, city: string): string {
  return `
<div class="top-marquee">
  <div class="marquee-content">
    <span class="marquee-item"><i data-lucide="clock" width="14"></i> Ouvert de 9h à 18h en semaine</span>
    <span class="marquee-item"><i data-lucide="phone" width="14"></i> Intervention rapide: ${phone}</span>
    <span class="marquee-item"><i data-lucide="mail" width="14"></i> ${email}</span>
    <span class="marquee-item"><i data-lucide="map-pin" width="14"></i> Basé à ${city}</span>
    <!-- Duplicated for seamless scroll -->
    <span class="marquee-item"><i data-lucide="clock" width="14"></i> Ouvert de 9h à 18h en semaine</span>
    <span class="marquee-item"><i data-lucide="phone" width="14"></i> Intervention rapide: ${phone}</span>
    <span class="marquee-item"><i data-lucide="mail" width="14"></i> ${email}</span>
    <span class="marquee-item"><i data-lucide="map-pin" width="14"></i> Basé à ${city}</span>
  </div>
</div>`;
}
```

- [ ] **Step 2: Add marquee CSS**

```typescript
const css = /* already existing CSS object */ + `
.top-marquee {
  background: var(--bg-dark); color: var(--text-muted);
  padding: 8px 0; overflow: hidden; position: fixed; top: 0;
  width: 100%; z-index: 100; font-size: 0.75rem;
}
.marquee-content { display: inline-flex; gap: 2rem; animation: marquee 40s linear infinite; }
.marquee-item { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.marquee-item i { color: var(--accent); }
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
`;
```

- [ ] **Step 3: Add navigation HTML generator**

```typescript
function generateNav(companyName: string, phone: string, logoInitials: string): string {
  return `
<nav id="nav">
  <div class="nav-container">
    <a href="#" class="nav-logo">
      <div class="logo-circle">${logoInitials}</div>
      <span class="logo-text">${companyName}</span>
    </a>
    <div class="nav-links" id="navLinks">
      <a href="#services">Services</a>
      <a href="#about">À propos</a>
      <a href="#testimonials">Avis</a>
      <a href="#contact">Contact</a>
    </div>
    <div class="nav-actions">
      <a href="tel:${phone.replace(/[^0-9+]/g, '')}" class="btn btn-primary btn-sm">
        <i data-lucide="phone" width="16"></i> ${phone}
      </a>
      <button class="menu-toggle" id="menuToggle" aria-label="Menu">
        <i data-lucide="menu" width="24"></i>
      </button>
    </div>
  </div>
</nav>`;
}
```

- [ ] **Step 4: Add navigation CSS**

```typescript
nav {
  position: fixed; top: 36px; left: 0; width: 100%; z-index: 99;
  padding: 12px 5vw; transition: all 0.3s;
}
nav.scrolled { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); padding: 8px 5vw; }
.nav-container { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
.nav-logo { display: flex; align-items: center; gap: 12px; color: white; }
.logo-circle { width: 40px; height: 40px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; color: white; }
.logo-text { font-weight: 700; font-size: 1.1rem; }
.nav-links { display: flex; gap: 32px; }
.nav-links a { color: rgba(255,255,255,0.8); font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
.nav-links a:hover { color: white; }
.nav-actions { display: flex; align-items: center; gap: 16px; }
.btn-sm { height: 36px; padding: 0 16px; font-size: 0.85rem; }
.menu-toggle { display: none; background: none; border: none; color: white; cursor: pointer; }
@media (max-width: 768px) {
  .nav-links { display: none; }
  .menu-toggle { display: block; }
  .nav-links.open { display: flex; flex-direction: column; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-dark); padding: 80px 5vw; gap: 24px; }
  .nav-links.open a { font-size: 1.2rem; color: white; }
}
```

### Task 3: Hero section

**Files:**
- Modify: `src/lib/template-henbo.ts`

- [ ] **Step 1: Add hero HTML generator**

```typescript
function generateHero(content: UltimateContent, heroImage: string, layoutVariant: number): string {
  const { companyName, heroTitle, heroSubtitle, phone, city, rating, reviews, ctaText, sector } = content;
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const badgeIcon = getHeroBadge(sector);
  
  if (layoutVariant % 2 === 0) {
    // Centered hero
    return `
<section class="hero hero-centered" style="background-image: url('${heroImage}');">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="eyebrow"><i data-lucide="${badgeIcon}" width="12"></i> Intervention rapide · ${city}</div>
    <h1>${heroTitle || companyName}</h1>
    <p>${heroSubtitle}</p>
    <div class="hero-actions">
      <a href="tel:${cleanPhone}" class="btn btn-primary"><i data-lucide="phone" width="18"></i> ${ctaText}</a>
      <a href="#contact" class="btn btn-white">Demander un devis <i data-lucide="arrow-right" width="16"></i></a>
    </div>
    <div class="trust-badges">
      <span class="trust-badge"><i data-lucide="star" fill="currentColor" width="14"></i> ${rating}/5 — ${reviews} avis</span>
      <span class="trust-badge"><i data-lucide="clock" width="14"></i> Disponible 7j/7</span>
      <span class="trust-badge"><i data-lucide="shield-check" width="14"></i> Assuré et certifié</span>
    </div>
  </div>
</section>`;
  } else {
    // Split hero
    return `
<section class="hero hero-split">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="eyebrow"><i data-lucide="${badgeIcon}" width="12"></i> Intervention rapide · ${city}</div>
    <h1>${heroTitle || companyName}</h1>
    <p>${heroSubtitle}</p>
    <div class="hero-actions">
      <a href="tel:${cleanPhone}" class="btn btn-primary"><i data-lucide="phone" width="18"></i> ${ctaText}</a>
      <a href="#contact" class="btn btn-white">Devis gratuit <i data-lucide="arrow-right" width="16"></i></a>
    </div>
    <div class="trust-badges">
      <span class="trust-badge"><i data-lucide="star" fill="currentColor" width="14"></i> ${rating}/5 — ${reviews} avis</span>
      <span class="trust-badge"><i data-lucide="clock" width="14"></i> Disponible 7j/7</span>
      <span class="trust-badge"><i data-lucide="shield-check" width="14"></i> Assuré et certifié</span>
    </div>
  </div>
  <div class="hero-visual" style="background-image: url('${heroImage}');"></div>
</section>`;
  }
}

function getHeroBadge(sector: string): string {
  const badges: Record<string, string> = {
    plomberie: 'droplet', electricien: 'zap', coiffeur: 'scissors',
    restaurant: 'utensils-crossed', garage: 'car', nettoyage: 'spray-can',
    medecin: 'heart-pulse', dentiste: 'tooth', coach: 'dumbbell',
  };
  const key = Object.keys(badges).find(k => sector.toLowerCase().includes(k));
  return badges[key as keyof typeof badges] || 'shield-check';
}
```

- [ ] **Step 2: Add hero CSS**

```typescript
.hero {
  min-height: 100vh; display: flex; align-items: center;
  position: relative; overflow: hidden; background-size: cover; background-position: center;
}
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%);
  z-index: 0;
}
.hero-centered { justify-content: center; text-align: center; padding: 120px 5vw 80px; }
.hero-centered .hero-content { max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }
.hero-split { padding: 120px 5vw 80px; }
.hero-split .hero-content { max-width: 600px; position: relative; z-index: 1; }
.hero-split .hero-visual {
  position: absolute; right: 0; top: 0; width: 50%; height: 100%;
  background-size: cover; background-position: center; z-index: 0;
}

.eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--accent); font-size: 0.75rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.1em;
  padding: 6px 14px; border: 1px solid rgba(255,255,255,0.15);
  border-radius: 100px; background: rgba(255,255,255,0.05);
  margin-bottom: 24px;
}
.hero h1 { color: white; margin-bottom: 16px; }
.hero p { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 32px; max-width: 560px; }
.hero-centered p { margin-left: auto; margin-right: auto; }
.hero-actions { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 32px; }
.trust-badges { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
.trust-badge { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 0.8rem; }
.trust-badge i { color: var(--accent); }
```

### Task 4: Services section

**Files:**
- Modify: `src/lib/template-henbo.ts`

- [ ] **Step 1: Add services HTML generator**

```typescript
function generateServicesSection(services: Array<{name: string; description: string; features: string[]}>, sector: string): string {
  return `
<section id="services">
  <div class="container">
    <div class="section-header">
      <div class="section-label"><i data-lucide="layout-list" width="16"></i> Nos Services</div>
      <h2>Des solutions professionnelles adaptées à vos besoins</h2>
    </div>
    <div class="grid-3">
      ${services.map(s => `
        <div class="card">
          <div class="icon-44 mb-16" style="background: var(--primary)18; color: var(--primary);">
            <i data-lucide="${getServiceIcon(s.name, sector)}" width="22"></i>
          </div>
          <h3 class="mb-12">${s.name}</h3>
          <p style="color: var(--text-light); font-size: 0.9rem; line-height: 1.7; margin-bottom: 20px;">${s.description}</p>
          <ul style="display: flex; flex-direction: column; gap: 8px;">
            ${s.features.map(f => `
              <li style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-light);">
                <i data-lucide="check" width="14" style="color: var(--primary); min-width: 14px;"></i> ${f}
              </li>`).join('')}
          </ul>
        </div>`).join('')}
    </div>
  </div>
</section>`;
}

function getServiceIcon(serviceName: string, sector: string): string {
  const icons: Record<string, string> = {
    'plomberie': 'droplet', 'electricien': 'zap', 'coiffeur': 'scissors',
    'restaurant': 'utensils-crossed', 'garage': 'car', 'nettoyage': 'spray-can',
  };
  const sectorKey = Object.keys(icons).find(k => sector.includes(k));
  return sectorKey ? icons[sectorKey] : 'briefcase';
}
```

- [ ] **Step 2: Verify section renders correctly** — inspect output in test

### Task 5: About section

**Files:**
- Modify: `src/lib/template-henbo.ts`

- [ ] **Step 1: Add about HTML generator**

```typescript
function generateAboutSection(companyName: string, aboutText: string, image: string, city: string, sector: string): string {
  return `
<section id="about" class="section-alt">
  <div class="container">
    <div class="grid-2" style="align-items: center;">
      <div>
        <div class="section-label"><i data-lucide="info" width="16"></i> À Propos</div>
        <h2 class="mb-16">${companyName}</h2>
        <p style="color: var(--text-light); font-size: 1rem; line-height: 1.8; margin-bottom: 24px;">
          ${aboutText}
        </p>
        <ul style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px;">
          <li style="display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
            <i data-lucide="check-circle" width="18" style="color: var(--primary);"></i>
            Intervention rapide et fiable
          </li>
          <li style="display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
            <i data-lucide="check-circle" width="18" style="color: var(--primary);"></i>
            Devis gratuit et transparent
          </li>
          <li style="display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
            <i data-lucide="check-circle" width="18" style="color: var(--primary);"></i>
            Artisan qualifié et assuré
          </li>
          <li style="display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
            <i data-lucide="check-circle" width="18" style="color: var(--primary);"></i>
            Satisfaction client garantie
          </li>
        </ul>
        <a href="#contact" class="btn btn-primary">Contactez-nous <i data-lucide="arrow-right" width="16"></i></a>
      </div>
      <div>
        <!-- REMPLACER PAR : photo réelle du commerce -->
        <img src="${image}" alt="${companyName} — ${sector} à ${city}"
             style="width: 100%; border-radius: var(--radius); aspect-ratio: 4/3; object-fit: cover;">
      </div>
    </div>
  </div>
</section>`;
}
```

### Task 6: Testimonials section

**Files:**
- Modify: `src/lib/template-henbo.ts`

- [ ] **Step 1: Add testimonials HTML generator**

```typescript
function generateTestimonialsSection(testimonials: Array<{author: string; text: string; rating: number; date?: string}>, rating: number, reviews: number): string {
  if (!testimonials || testimonials.length === 0 || testimonials[0]?.author === 'Client satisfait') {
    return `<!-- AVIS CLIENTS : remplacer par les vrais avis Google du prospect quand disponibles -->`;
  }
  
  return `
<section id="testimonials" class="section-alt">
  <div class="container">
    <div class="section-header">
      <div class="section-label"><i data-lucide="star" width="16"></i> Avis Clients</div>
      <h2>Ce que disent nos clients</h2>
      <p>${reviews} avis vérifiés · Note moyenne ${rating}/5</p>
    </div>
    <div class="grid-3">
      ${testimonials.slice(0, 6).map(t => `
        <div class="card">
          <div style="display: flex; gap: 3px; margin-bottom: 16px;">
            ${Array(Math.min(t.rating || 5, 5)).fill(0).map(() => `<i data-lucide="star" width="14" style="color: #f59e0b; fill: #f59e0b;"></i>`).join('')}
          </div>
          <p style="color: var(--text-light); font-size: 0.9rem; line-height: 1.7; margin-bottom: 20px; font-style: italic;">
            &ldquo;${t.text}&rdquo;
          </p>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="user" width="18" style="color: var(--text-light);"></i>
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem;">${t.author || 'Client'}</div>
              <div style="font-size: 0.8rem; color: var(--text-light);">${t.date || 'Récemment'}</div>
            </div>
          </div>
        </div>`).join('')}
    </div>
  </div>
</section>`;
}
```

### Task 7: Contact section

**Files:**
- Modify: `src/lib/template-henbo.ts`

- [ ] **Step 1: Add contact HTML generator**

```typescript
function generateContactSection(companyName: string, phone: string, email: string, address: string, city: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const formEndpoint = `https://formsubmit.co/${email.replace(/[^a-zA-Z0-9@.]/g, '')}`;
  
  return `
<section id="contact">
  <div class="container">
    <div class="section-header">
      <div class="section-label"><i data-lucide="phone" width="16"></i> Contact</div>
      <h2>Contactez-nous</h2>
      <p>Basé à ${city}, nous intervenons dans toute la région.</p>
    </div>
    <div class="grid-2" style="align-items: start;">
      <div>
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div class="icon-44" style="background: var(--primary)18; color: var(--primary);"><i data-lucide="phone" width="20"></i></div>
            <div><div style="font-weight: 600; margin-bottom: 4px;">Téléphone</div>
            <a href="tel:${cleanPhone}" style="color: var(--text-light);">${phone}</a></div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div class="icon-44" style="background: var(--primary)18; color: var(--primary);"><i data-lucide="mail" width="20"></i></div>
            <div><div style="font-weight: 600; margin-bottom: 4px;">Email</div>
            <a href="mailto:${email}" style="color: var(--text-light);">${email}</a></div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div class="icon-44" style="background: var(--primary)18; color: var(--primary);"><i data-lucide="map-pin" width="20"></i></div>
            <div><div style="font-weight: 600; margin-bottom: 4px;">Adresse</div>
            <a href="https://maps.google.com/?q=${encodeURIComponent(address)}" target="_blank" rel="noopener" style="color: var(--text-light);">${address}</a></div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div class="icon-44" style="background: var(--primary)18; color: var(--primary);"><i data-lucide="clock" width="20"></i></div>
            <div><div style="font-weight: 600; margin-bottom: 4px;">Horaires</div>
            <span style="color: var(--text-light);">Lun-Ven: 9h-18h · Urgences 24h/24</span></div>
          </div>
        </div>
      </div>
      <div style="background: white; padding: 32px; border-radius: var(--radius); border: 1px solid var(--border);">
        <h3 style="margin-bottom: 24px;">Envoyez-nous un message</h3>
        <form action="${formEndpoint}" method="POST" style="display: flex; flex-direction: column; gap: 16px;">
          <input type="text" name="name" placeholder="Votre nom" required
                 style="height: 48px; padding: 0 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.95rem;">
          <input type="email" name="email" placeholder="Votre email" required
                 style="height: 48px; padding: 0 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.95rem;">
          <input type="tel" name="phone" placeholder="Votre téléphone"
                 style="height: 48px; padding: 0 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.95rem;">
          <textarea name="message" placeholder="Votre message" rows="4" required
                    style="padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.95rem; resize: vertical;"></textarea>
          <button type="submit" class="btn btn-primary" style="justify-content: center;">
            Envoyer <i data-lucide="send" width="16"></i>
          </button>
          <p style="font-size: 0.75rem; color: var(--text-light); text-align: center;">
            Données protégées et confidentielles. Aucun spam.
          </p>
        </form>
      </div>
    </div>
  </div>
</section>`;
}
```

### Task 8: Footer + Sticky CTA

**Files:**
- Modify: `src/lib/template-henbo.ts`

- [ ] **Step 1: Add footer HTML generator**

```typescript
function generateFooter(companyName: string, phone: string, email: string, address: string, services: Array<{name: string}>): string {
  const initials = companyName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  
  return `
<footer style="background: var(--bg-dark); color: white; padding: 80px 5vw 32px;">
  <div class="container">
    <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.5fr; gap: 40px; margin-bottom: 48px;">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div class="logo-circle">${initials}</div>
          <span style="font-weight: 700; font-size: 1.1rem;">${companyName}</span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.7;">Professionnel de confiance à votre service.</p>
      </div>
      <div>
        <h4 style="margin-bottom: 20px; font-size: 1rem;">Services</h4>
        <ul style="display: flex; flex-direction: column; gap: 10px;">
          ${services.slice(0, 5).map(s => `<li><a href="#services" style="color: var(--text-muted); font-size: 0.9rem;">${s.name}</a></li>`).join('')}
        </ul>
      </div>
      <div>
        <h4 style="margin-bottom: 20px; font-size: 1rem;">Liens</h4>
        <ul style="display: flex; flex-direction: column; gap: 10px;">
          <li><a href="#about" style="color: var(--text-muted); font-size: 0.9rem;">À propos</a></li>
          <li><a href="#services" style="color: var(--text-muted); font-size: 0.9rem;">Services</a></li>
          <li><a href="#testimonials" style="color: var(--text-muted); font-size: 0.9rem;">Avis</a></li>
          <li><a href="#contact" style="color: var(--text-muted); font-size: 0.9rem;">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 style="margin-bottom: 20px; font-size: 1rem;">Contact</h4>
        <ul style="display: flex; flex-direction: column; gap: 12px;">
          <li style="display: flex; gap: 10px; color: var(--text-muted); font-size: 0.9rem;">
            <i data-lucide="phone" width="16" style="color: var(--accent); min-width: 16px;"></i>
            <a href="tel:${cleanPhone}">${phone}</a>
          </li>
          <li style="display: flex; gap: 10px; color: var(--text-muted); font-size: 0.9rem;">
            <i data-lucide="mail" width="16" style="color: var(--accent); min-width: 16px;"></i>
            <a href="mailto:${email}">${email}</a>
          </li>
          <li style="display: flex; gap: 10px; color: var(--text-muted); font-size: 0.9rem;">
            <i data-lucide="map-pin" width="16" style="color: var(--accent); min-width: 16px;"></i>
            <a href="https://maps.google.com/?q=${encodeURIComponent(address)}" target="_blank">${address}</a>
          </li>
        </ul>
      </div>
    </div>
    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
      &copy; ${new Date().getFullYear()} ${companyName}. Tous droits réservés.
    </div>
  </div>
</footer>`;
}
```

- [ ] **Step 2: Add sticky mobile CTA**

```typescript
function generateStickyCTA(phone: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return `
<a href="tel:${cleanPhone}" class="mobile-sticky-cta">
  <i data-lucide="phone" width="20"></i>
  Appeler — ${phone}
</a>`;
}
```

- [ ] **Step 3: Add sticky CTA CSS**

```typescript
.mobile-sticky-cta {
  display: none;
}
@media (max-width: 768px) {
  .mobile-sticky-cta {
    display: flex; position: fixed; bottom: 0; left: 0; width: 100%;
    height: 56px; background: var(--primary); color: white; z-index: 999;
    align-items: center; justify-content: center; gap: 8px;
    font-weight: 600; font-size: 1rem; text-decoration: none;
  }
  body { padding-bottom: 56px; }
}
```

### Task 9: Data wiring + buildHTML

**Files:**
- Modify: `src/lib/template-henbo.ts`

- [ ] **Step 1: Implement `buildHTML` combining all sections**

```typescript
function buildHTML(content: UltimateContent, template: any, heroImage: string, layoutVariant: number): string {
  const { companyName, sector, city, phone, email, address, rating, reviews, services, testimonials, heroTitle, heroSubtitle, aboutText, ctaText, slogan, allImages } = content;
  const initials = companyName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const css = buildCSS(sector);

  const aboutImage = allImages[0] || 'https://images.unsplash.com/photo-1581094794329-cbf11b3f4354?w=800&q=80';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sector} ${city} — ${companyName} | ${services[0]?.name || 'Services'}</title>
  <meta name="description" content="${companyName}, ${sector} à ${city}. ${services[0]?.name || 'Interventions rapides'} — Contactez-nous au ${phone}.">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${css}</style>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
  ${generateMarquee(phone, email, city)}
  ${generateNav(companyName, phone, initials)}
  ${generateHero(content, heroImage, layoutVariant)}
  ${generateServicesSection(services, sector)}
  ${generateAboutSection(companyName, aboutText, aboutImage, city, sector)}
  ${generateTestimonialsSection(testimonials, rating, reviews)}
  ${generateContactSection(companyName, phone, email, address, city)}
  ${generateFooter(companyName, phone, email, address, services)}
  ${generateStickyCTA(phone)}
  
  <script>
    // Nav scroll effect
    window.addEventListener('scroll', () => {
      document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
    });
    // Mobile menu toggle
    document.getElementById('menuToggle')?.addEventListener('click', () => {
      document.getElementById('navLinks').classList.toggle('open');
    });
    // Init Lucide icons
    lucide.createIcons();
  </script>
</body>
</html>`;
}
```

- [ ] **Step 2: Wire up `generateUltimateSite` with data preparation**

```typescript
export function generateUltimateSite(lead: any, aiContent?: any): string {
  // Validation
  const companyName = lead.name || 'Entreprise';
  const sector = (lead.sector || '').toLowerCase();
  const city = lead.city || '';
  const phone = lead.phone || '+33 6 00 00 00 00';
  const email = lead.email || 'contact@entreprise.fr';
  const address = lead.address || (city ? `Centre Ville, ${city}` : 'France');
  const rating = lead.googleRating || 5;
  const reviews = lead.googleReviews || 42;
  const template = { primary: '#0f766e', accent: '#14b8a6' }; // simplified; real version uses getUltimateTemplate

  // Services
  const services = (aiContent?.services && aiContent.services.length > 0)
    ? aiContent.services.map((s: any, i: number) => ({
        name: s.name || `Service ${i+1}`,
        description: s.description || '',
        features: (s.features || []).slice(0, 3)
      }))
    : (template as any).services || [{ name: 'Service', description: 'Description', features: ['Pro'] }];

  // Testimonials
  const realReviews = extractAndValidateRealReviews(lead.googleReviewsData || [], lead);
  const testimonials = buildCompleteTestimonialList(realReviews, sector, 6);

  // Images
  const realImages = validateAndCategorizeImages([
    ...(lead.images || []),
    ...(lead.websiteImages || [])
  ], true);
  // Fallback Pexels images (simplified — real version imports getSectorImagesFallback)
  const pexelsImages: any[] = [];
  const allProcessed = [...realImages, ...pexelsImages];
  const selectedImages = selectUniqueImages(allProcessed, 6);
  const realPhotos = selectedImages.filter((img: any) => img.isReal && img.type === 'photo');
  const heroImage = realPhotos.length > 0 ? realPhotos[0].url : selectedImages[0]?.url || 'https://images.unsplash.com/photo-1581094794329-cbf11b3f4354?w=1200&q=80';
  const allImagesList = selectedImages.slice(1, 6).map((img: any) => img.url);

  const content: UltimateContent = {
    companyName, sector, city, phone, email, address,
    rating, reviews, services, testimonials,
    heroTitle: aiContent?.heroTitle || 'Professionnel de confiance',
    heroSubtitle: aiContent?.heroSubtitle || `Intervention rapide et professionnelle à ${city}`,
    aboutText: lead.description || `Professionnel expérimenté à ${city}, nous mettons notre savoir-faire à votre service.`,
    ctaText: aiContent?.cta || 'Intervention rapide',
    slogan: aiContent?.slogan || 'Expertise & Confiance',
    heroImage, allImages: allImagesList,
  };

  const nameHash = companyName.split('').reduce((h: number, c: string) => h + c.charCodeAt(0), 0);
  const layoutVariant = nameHash % 2;

  return buildHTML(content, template, heroImage, layoutVariant);
}
```

### Task 10: Build + verify

**Files:**
- Modify: `src/lib/template-henbo.ts`

- [ ] **Step 1: Run TypeScript compiler**

```bash
npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 2: Run build**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/template-henbo.ts
git commit -m "feat: add Henbo-inspired template (template-henbo.ts)"
```
