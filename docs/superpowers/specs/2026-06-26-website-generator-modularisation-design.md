# Website Generator — Modularisation & Amélioration

**Date :** 2026-06-26
**Statut :** Design validé

## Résumé

Refonte complète du générateur de sites web pour résoudre 5 problèmes critiques :
1. Images incohérentes avec le secteur
2. Contenu textuel générique et non-personnalisé
3. Mêmes images répétées sur tous les sites d'un même secteur
4. Aucune variété de mise en page
5. Structure identique pour 100% des sites

## Architecture

```
src/lib/website/
├── layout-engine.ts       # Sélection et rendu du layout
├── content-engine.ts      # Génération du contenu (LLM ou enrichi)
├── image-engine.ts        # Récupération et rotation des images
├── unificateur.ts         # Assemble lead + content + images + layout → HTML
├── types.ts               # Interfaces partagées
├── layouts/               # Layouts individuels
│   ├── classic.ts
│   ├── modern.ts
│   ├── bold.ts
│   └── magazine.ts
└── __tests__/             # Tests unitaires
    ├── layout-engine.test.ts
    ├── content-engine.test.ts
    └── image-engine.test.ts
```

### Interfaces partagées (`types.ts`)

```typescript
interface WebsiteContent {
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

interface WebsiteImages {
  hero: string;
  gallery: string[];
  services: string[];
  logo?: string;
}

interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  "on-primary": string;
  "on-accent": string;
}
```

## Modules

### 1. Layout Engine (`layout-engine.ts`)

Sélectionne le layout approprié pour un lead donné.

**Entrée :** `lead`, `styleHint?`
**Sortie :** `LayoutModule`

**Logique de sélection :**
- Par défaut : mapping secteur → layout
  - plomberie, electricien, garage, nettoyage → classic
  - coiffeur, spa, fitness, beauté → bold
  - restaurant, boulanger → modern
  - avocat, médecin, hôtel → magazine
  - default → classic
- `lead.id.hashCode() % 10` pour ajouter une micro-variation (10% de chance de layout alternatif)
- `styleHint` explicite override

**LayoutModule interface :**
```typescript
interface LayoutModule {
  id: string;
  render(lead: Lead, content: WebsiteContent, images: WebsiteImages, palette: Palette): string;
}
```

### 2. Content Engine (`content-engine.ts`)

Génère le contenu textuel unique par lead.

**Flux :**
1. Si LLM configuré (Groq/Gemini/OpenRouter) :
   - Construire un prompt avec TOUTES les données du lead (nom, secteur, ville, description, années, avis, spécialités)
   - Appel unique LLM
   - Valider le JSON retourné
   - Fallback sur template enrichi si échec
2. Si pas de LLM :
   - Prendre le template secteur (services, garanties, textes)
   - Enrichir avec données du lead : remplacer `{name}`, `{city}`, `{years}` par les vraies valeurs
   - Rotation des variantes texte via seed

### 3. Image Engine (`image-engine.ts`)

**Priorité :** Pexels API → Banque statique → Seed aléatoire

**Pexels API Flow :**
- 3 requêtes spécifiques par secteur (ex. "plumber working", "bathroom renovation", "pipe repair")
- `per_page=10` par requête → 30 résultats
- Mélanger avec seed basé sur `lead.id`
- Prendre 6 images (hero + 5 galerie)
- Filtrer : exclure toute image dont le tag/alt ne correspond pas au secteur

**Banque statique (fallback) :**
- 50 URLs par secteur (au lieu de ~5-10 actuellement)
- Seed → `lead.id.hashCode() % len(banque)` pour combinaison unique
- URLs triées par lot de 6, une rotation complète avant de recommencer

**Filtre secteur strict :**
- `imageEngine.filterBySector(images, lead.sector)` — vérifie alt text, tags, ou source
- Bloque toute image d'un secteur différent

### 4. Unificateur (`unificateur.ts`)

Point d'entrée unique. Orchestre les 3 engines.

```typescript
async function generateSite(
  lead: Lead,
  apiConfig: ApiConfig,
  options?: { style?: string }
): Promise<string>
```

**Étapes :**
1. `getPalette(lead.sector)` — couleurs secteur (inchangé, déjà bon)
2. `contentEngine.generate(lead, apiConfig)` → `content`
3. `imageEngine.fetch(lead, apiConfig)` → `images`
4. `layoutEngine.select(lead, options.style)` → `layoutModule`
5. `layoutModule.render(lead, content, images, palette)` → `html`
6. Retourner html

### 5. Layouts individuels

Chaque layout expose un rendu fondamentalement différent :

| Layout | Hero | Sections | Typo | Ambiance |
|--------|------|----------|------|----------|
| **Classic** | Dégradé + CTA | Services grid, garanties, contact, footer | Inter/Plus Jakarta | Pro, rassurant |
| **Modern** | Full-screen overlay | Cards flottantes, large whitespace, animations | Playfair + Inter | Luxury, épuré |
| **Bold** | Fond sombre + néon | Asymétrique, floating elements, scroll-triggered | Impact, large | Créatif, énergique |
| **Magazine** | Split-screen (img/texte) | 2-colonnes asymétriques, sidebar, serif | Cormorant Garamond | Élégant, éditorial |

## Détail des Layouts

### Classic Layout
- Navbar sticky (couleur secteur)
- Hero : bandeau dégradé, titre, sous-titre, bouton CTA
- Services : grille responsive 3-colonnes avec cartes
- Garanties : 4 cartes avec icônes
- Galerie images (si disponibles)
- Avis clients (Google Reviews ou fallback)
- Contact : téléphone, email, adresse, formulaire
- Footer simple

### Modern Layout
- Navbar transparente qui devient solide au scroll
- Hero : image plein écran en background, overlay sombre, titre centré énorme
- Services : cartes superposées avec ombres portées, apparition au scroll
- Statistiques : barre de chiffres (années, clients, avis)
- À propos : texte large sur fond gris clair
- Galerie : masonry grid
- Avis : carrousel horizontal
- Contact : section épurée, fond blanc
- Footer : 3 colonnes (liens, contact, social)

### Bold Layout
- Fond dark (#0f0f0f ou #1a1a2e)
- Hero : immense titre en gradient néon, sous-titre fin
- Services : disposition asymétrique (zigzag texte/image)
- Pourcentage ou compteurs animés
- Avis : citations larges en italique
- Contact : néon sur fond sombre, bouton large
- Animations scroll fréquentes

### Magazine Layout
- Split hero : image à gauche 50%, texte à droite 50%
- Navigation fine, typo serif Playfair Display
- Services : 2 colonnes asymétriques (30/70 ou 40/60)
- Sidebar avec infos clés (horaires, téléphone, adresse)
- Avis : colonne latérale scrollée
- Contact : minimal, focus sur le formulaire
- Footer : compact, noir

## Migration Plan

1. Créer le dossier `src/lib/website/` et sous-dossiers
2. Déplacer les types et interfaces dans `types.ts`
3. **Extraire les données** des fichiers existants (ultimateTemplate.ts, modernTemplate.ts, sectorConfig.ts) :
   - Palettes de couleurs → `data/palettes.ts`
   - Templates de services par secteur → `data/sector-services.ts`
   - Avis fallback → `data/fallback-reviews.ts`
   - Process steps → `data/process-steps.ts`
   - Images Unsplash en dur → `data/curated-images.ts`
4. Extraire `image-engine.ts` du système existant (pexelsImages.ts, imageAgent.ts, pexelsApi.ts)
5. Extraire `content-engine.ts` du système existant (generateContent dans WebsiteGen.tsx)
6. Créer les 4 layouts dans `layouts/` — chaque layout importe les données depuis `data/`
7. Créer `layout-engine.ts` — sélectionne le layout selon le secteur
8. Créer `unificateur.ts` comme point d'entrée unique — orchestre les 3 engines
9. Mettre à jour `WebsiteGen.tsx` pour utiliser le nouvel `unificateur`
10. Marquer les anciens fichiers comme dépréciés (`ultimateTemplate.ts`, `modernTemplate.ts`) — ne les supprimer qu'après validation que tout fonctionne

## Tests

- `content-engine.test.ts` — vérifier que LLM prompt est bien construit, fallback fonctionne
- `image-engine.test.ts` — vérifier filtre secteur, seed rotation, Pexels fetch
- `layout-engine.test.ts` — vérifier sélection correcte du layout par secteur
- Tests de rendu : chaque layout produit un HTML valide avec les bonnes données

## Non-Goals

- Ne pas modifier le système de scoring/enrichissement (Agent 02)
- Ne pas modifier l'outreach email (Agent 04)
- Ne pas changer la BDD Supabase
- Ne pas toucher à l'authentification ou aux paramètres
