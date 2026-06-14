# Template Henbo Redesign — Design Spec

## Goal
Créer un nouveau fichier template (`src/lib/template-henbo.ts`) inspiré du thème Elementor "Henbo" pour générer des sites vitrines professionnels pour artisans et services de proximité.

## Architecture
- **Fichier unique** : `src/lib/template-henbo.ts` (nouveau fichier, pas de modification de `ultimateTemplate.ts`)
- **Mêmes points d'entrée** : `generateUltimateSite(lead, aiContent)` et `generateUltimateSiteAsync(lead, aiContent)` — signature identique pour compatibilité avec `WebsiteGen.tsx`
- **Mêmes données** : `UltimateContent`, `template` (SECTOR_ULTIMATE_TEMPLATES), images, avis
- **Pas de Tailwind** : CSS 100% custom, pas de dépendance CDN
- **Zéro inline styles** : tout dans les classes CSS
- **Zéro décorations superflues** : pas de blobs, glassmorphism, patterns, anim-shapes

## Design System

### Couleurs (CSS variables)
```css
:root {
  --primary: #...;        /* couleur secteur */
  --primary-dark: #...;   /* version foncée */
  --accent: #...;         /* couleur secteur */
  --text: #1e293b;
  --text-light: #64748b;
  --text-muted: #94a3b8;
  --bg: #ffffff;
  --bg-alt: #f8fafc;
  --bg-dark: #0f172a;
  --border: rgba(0,0,0,0.07);
  --hero-overlay: rgba(0,0,0,0.5);
}
```

### Typographie
- Google Fonts : Plus Jakarta Sans (300-800)
- H1 : clamp(2.25rem, 4vw, 3.5rem), weight 800, -0.02em letter-spacing
- H2 : clamp(1.75rem, 3vw, 2.5rem), weight 800, -0.02em
- H3 : 1.25rem, weight 700
- Body : 1rem / line-height 1.7

### Espacement
- Sections : clamp(60px, 8vw, 100px) 5vw
- Container : max-width 1200px, margin 0 auto
- Gap grilles : 24px
- Gap icône-texte : 12px

### Cards
- border-radius: 16px
- border: 1px solid var(--border)
- padding: 28px
- background: white
- hover: translateY(-4px), box-shadow augmenté
- transition: 0.3s ease

### Boutons
- height: 48px
- border-radius: 8px
- font-weight: 600
- padding: 0 28px
- .btn-primary : fond primary, texte blanc
- .btn-outline : bordure primary, texte primary
- .btn-white : fond blanc, texte primary (sur fond sombre)

### Header
- Position fixed, transparent, z-index 100
- Padding: 15px 5vw
- Logo + nav links centrés + bouton CTA droit
- Hamburger menu mobile
- Backdrop-filter blur(10px) au scroll

## Sections

### 1. Marquee (barre d'infos)
Barre défilante avec horaires, téléphone, email, localisation.
```html
<div class="top-marquee">...</div>
```

### 2. Hero
- Plein écran (100vh), background-image + overlay foncé
- Texte centré, blanc
- Eyebrow : badge ville
- H1 : titre du prospect
- P : sous-titre
- 2 boutons CTA : Appel (primary) + Devis (outline white)
- Badges confiance : note, disponibilité, certifié
- Optionnel : formulaire rapide flottant sur la droite (variante desktop)

### 3. Services
- Badge "Nos Services" + H2 + description
- Grille 3 colonnes (→ 2 → 1 mobile)
- Chaque carte : icône (44px, bg accent 10%) → H3 → description → ul features → lien

### 4. À propos
- 2 colonnes : texte à gauche, image à droite
- Badge + H2 + paragraphe + liste features (check) + bouton
- Image : border-radius 16px, aspect-ratio 4/3

### 5. Témoignages
- Badge + H2 + grille de cartes (max 6, filtre avis vides/IA)
- Chaque carte : étoiles (rating) → citation → auteur + date
- Si pas d'avis réels : placeholder HTML comment

### 6. Contact
- 2 colonnes : coordonnées (adresse, tel, email, horaires) + formulaire
- Fond alterné (bg-alt)

### 7. Footer
- 4 colonnes : logo+description+social → services → liens → contact
- Barre copyright en bas

### 8. Sticky CTA mobile
- Barre fixe en bas sur mobile (< 768px)
- Lien tel: avec icône téléphone

## Gestion des données

### Avis clients
- Utiliser `extractAndValidateRealReviews()` + `buildCompleteTestimonialList()` (réutiliser les fonctions existantes)
- Filtrer les avis avec text/author undefined ou "undefined"
- FormatReviewDate : isNaN guard pour éviter "Il y a NaN an"
- Si IA-generated (author = 'Client satisfait') : placeholder comment

### Images
- Hero : `heroImage` en background avec overlay
- About : première image de `allImages` ou fallback
- Icônes services : Lucide icons (wrench, zap, scissors, etc.) selon secteur

### Palettes couleurs
- Réutiliser/getSectorPalette() depuis `SECTOR_PALETTES` existant
- Override primary/accent selon secteur

## Layout variants
- 2 variantes : centered (hero centré classique) et split (hero 50/50 texte/image)
- Déterminé par hash du nom (actuel)

## Fichiers modifiés
- NOUVEAU : `src/lib/template-henbo.ts`
- AUCUN changement dans `ultimateTemplate.ts`
- WebsiteGen.tsx : import supplémentaire (optionnel, peut être fait après)

## Non inclus (YAGNI)
- Section "How it works" (4 étapes)
- Section "Projects" (galerie)
- Newsletter/email subscription
- Compteurs animés
- Carousel logos clients
- Section équipe
