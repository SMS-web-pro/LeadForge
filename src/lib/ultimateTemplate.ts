// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// websiteGenerator.ts â€” VERSION FINALE CORRIGÃ‰E
// Tous les patches intÃ©grÃ©s:
//   âœ… Images: filtre logo/photo, dÃ©dup, object-fit intelligent
//   âœ… TÃ©moignages: vrais avis Google uniquement
//   âœ… Formulaire: Formsubmit.co â†’ email du prospect
//   âœ… Chatbot: collecte nom+tel, envoie email via Formsubmit
//   âœ… WhatsApp: formatage international automatique
//   âœ… Menu desktop: CSS pur, sans JS
//   âœ… Lucide: version 1.11.0 fixÃ©e, CDN jsDelivr
//   âœ… Popup: dÃ©clenchement Ã  60% (au lieu de 50%)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { getSectorImages } from './pexelsImages';
import { getImagesForLead } from './pexelsApi';

// â”€â”€ CACHE PEXELS LOCAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CachedImage {
  url: string;
  timestamp: number;
  size: number;
}

class PexelsImageCache {
  private static instance: PexelsImageCache;
  private cache: Map<string, CachedImage> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly STORAGE_KEY = 'pexels_image_cache';

  static getInstance(): PexelsImageCache {
    if (!PexelsImageCache.instance) {
      PexelsImageCache.instance = new PexelsImageCache();
    }
    return PexelsImageCache.instance;
  }

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data.entries || []);
      }
    } catch (err) {
      console.warn('Erreur chargement cache Pexels:', err);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Erreur sauvegarde cache Pexels:', err);
    }
  }

  get(key: string): string | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // VÃ©rifier si le cache est expirÃ©
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }
    
    return cached.url;
  }

  set(key: string, url: string): void {
    // Estimer la taille (approximation)
    const size = url.length * 2; // ~2 octets par caractÃ¨re
    
    // Nettoyer les anciennes entrÃ©es si nÃ©cessaire
    while (this.getCurrentSize() + size > this.MAX_CACHE_SIZE && this.cache.size > 0) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      url,
      timestamp: Date.now(),
      size
    });
    
    this.saveToStorage();
  }

  private getCurrentSize(): number {
    let total = 0;
    for (const cached of this.cache.values()) {
      total += cached.size;
    }
    return total;
  }

  clear(): void {
    this.cache.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getStats(): { size: number; count: number; maxSize: number } {
    return {
      size: this.getCurrentSize(),
      count: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }
}

// Fonction optimisÃ©e avec cache
async function optimizeImagesWithCache(images: string[], sector: string): Promise<string[]> {
  const cache = PexelsImageCache.getInstance();
  const optimized: string[] = [];
  
  for (const imageUrl of images) {
    const cacheKey = `${sector}-${imageUrl}`;
    
    // VÃ©rifier le cache
    let optimizedUrl = cache.get(cacheKey);
    
    if (!optimizedUrl) {
      // Optimiser l'image et mettre en cache
      optimizedUrl = await optimizeImage(imageUrl);
      cache.set(cacheKey, optimizedUrl);
    }
    
    optimized.push(optimizedUrl);
  }
  
  return optimized;
}

async function optimizeImage(url: string): Promise<string> {
  // Simuler l'optimisation (redimensionnement, compression)
  // En production, utiliser un service d'optimisation d'images
  return url;
}

// â”€â”€ VARIATIONS DE TEMPLATE ANTI-IDENTIFICATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface TemplateVariation {
  id: string;
  name: string;
  modifications: {
    heroLayout?: 'center' | 'left' | 'right' | 'split';
    cardStyle?: 'glass' | 'solid' | 'minimal' | 'elevated';
    buttonStyle?: 'rounded' | 'square' | 'pill' | 'sharp';
    animationStyle?: 'fade' | 'slide' | 'zoom' | 'none';
    colorScheme?: 'default' | 'dark' | 'light' | 'vibrant';
    navigationStyle?: 'fixed' | 'sticky' | 'static' | 'hidden';
  };
  cssOverrides: string;
  jsEnhancements: string;
}

const TEMPLATE_VARIATIONS: TemplateVariation[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    modifications: {
      heroLayout: 'center',
      cardStyle: 'minimal',
      buttonStyle: 'square',
      animationStyle: 'fade',
      colorScheme: 'light',
      navigationStyle: 'fixed'
    },
    cssOverrides: `
      .card { background: white; border: 1px solid rgba(0,0,0,0.08); box-shadow: none; }
      .btn-cta { border-radius: 4px; font-weight: 600; }
      .reveal { transition: opacity 0.6s ease; }
      nav { background: white !important; }
    `,
    jsEnhancements: `
      console.log('Modern Minimal variation loaded');
    `
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    modifications: {
      heroLayout: 'split',
      cardStyle: 'elevated',
      buttonStyle: 'pill',
      animationStyle: 'zoom',
      colorScheme: 'vibrant',
      navigationStyle: 'sticky'
    },
    cssOverrides: `
      .card { background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7)); border: none; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
      .btn-cta { border-radius: 50px; padding: 1rem 2.5rem; font-weight: 700; }
      .reveal { animation: zoomIn 0.8s cubic-bezier(0.25, 1, 0.5, 1); }
      @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      nav.scrolled { background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85)) !important; }
    `,
    jsEnhancements: `
      console.log('Creative Bold variation loaded');
    `
  },
  {
    id: 'tech-professional',
    name: 'Tech Professional',
    modifications: {
      heroLayout: 'left',
      cardStyle: 'glass',
      buttonStyle: 'rounded',
      animationStyle: 'slide',
      colorScheme: 'default',
      navigationStyle: 'fixed'
    },
    cssOverrides: `
      .card { background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); }
      .btn-cta { border-radius: 8px; }
      .reveal { animation: slideInUp 0.7s ease-out; }
      @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    `,
    jsEnhancements: `
      console.log('Tech Professional variation loaded');
    `
  },
  {
    id: 'elegant-dark',
    name: 'Elegant Dark',
    modifications: {
      heroLayout: 'right',
      cardStyle: 'solid',
      buttonStyle: 'sharp',
      animationStyle: 'fade',
      colorScheme: 'dark',
      navigationStyle: 'hidden'
    },
    cssOverrides: `
      body { background: #0f172a; color: #f8fafc; }
      .card { background: #1e293b; border: 1px solid #334155; }
      .btn-cta { border-radius: 0; border: 2px solid var(--primary); }
      .text-muted { color: #94a3b8 !important; }
      nav { background: #0f172a !important; }
    `,
    jsEnhancements: `
      console.log('Elegant Dark variation loaded');
    `
  }
];

function generateTemplateVariation(leadName: string, sector: string): TemplateVariation {
  // GÃ©nÃ©rer une variation unique basÃ©e sur le nom et le secteur
  let hash = 0;
  const input = (leadName + sector).toLowerCase();
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash = hash & hash; // Convertir en entier 32-bit
  }
  
  const variationIndex = Math.abs(hash) % TEMPLATE_VARIATIONS.length;
  return TEMPLATE_VARIATIONS[variationIndex];
}

function applyTemplateVariation(html: string, variation: TemplateVariation): string {
  // Injecter les CSS overrides
  const cssInsert = `<style id="template-variation">${variation.cssOverrides}</style>`;
  const htmlWithCSS = html.replace('</head>', `${cssInsert}</head>`);
  
  // Injecter les JS enhancements
  const jsInsert = `<script id="variation-enhancements">${variation.jsEnhancements}</script>`;
  const htmlWithJS = htmlWithCSS.replace('</body>', `${jsInsert}</body>`);
  
  // Ajouter des classes CSS pour les modifications de layout
  let modifiedHTML = htmlWithJS;
  
  // Hero layout
  if (variation.modifications.heroLayout) {
    modifiedHTML = modifiedHTML.replace(
      /class="hero-section"/g,
      `class="hero-section hero-${variation.modifications.heroLayout}"`
    );
  }
  
  // Card style
  if (variation.modifications.cardStyle) {
    modifiedHTML = modifiedHTML.replace(
      /class="card/g,
      `class="card card-${variation.modifications.cardStyle}`
    );
  }
  
  // Button style
  if (variation.modifications.buttonStyle) {
    modifiedHTML = modifiedHTML.replace(
      /class="btn-cta"/g,
      `class="btn-cta btn-${variation.modifications.buttonStyle}"`
    );
  }
  
  // Animation style
  if (variation.modifications.animationStyle) {
    modifiedHTML = modifiedHTML.replace(
      /class="reveal"/g,
      `class="reveal reveal-${variation.modifications.animationStyle}"`
    );
  }
  
  return modifiedHTML;
}

// â”€â”€ TYPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface UltimateContent {
  companyName: string;
  sector: string;
  city: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  services: Array<{ name: string; description: string; features: string[] }>;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  ctaText: string;
  slogan: string;
  heroImage: string;
  allImages: string[];
}

// â”€â”€ TEMPLATES PAR SECTEUR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SECTOR_ULTIMATE_TEMPLATES: Record<string, any> = {
  plomberie: {
    primary: '#0f766e', secondary: '#115e59', accent: '#14b8a6', background: '#f0fdfa',
    services: [
      { name: 'DÃ©pannage 24h/24', description: "Intervention d'urgence sur toutes fuites et pannes", features: ['Disponible 7j/7', 'ArrivÃ©e sous 1h30', 'Sans surprise tarifaire'] },
      { name: 'Installation Sanitaire', description: 'Pose et remplacement de vos appareils', features: ['Robinetterie', 'Ã‰viers', 'WC', 'Douches'] },
      { name: 'Chauffage & ChaudiÃ¨re', description: 'Installation et rÃ©paration chauffage', features: ['ChaudiÃ¨res gaz/fioul', 'Pompes Ã  chaleur', 'DÃ©tartrage'] },
      { name: 'DÃ©tection de Fuites', description: 'Localisation prÃ©cise sans casse', features: ['CamÃ©ra thermique', 'Gaz traceur', 'Colmatage immÃ©diat'] },
      { name: 'RÃ©novation Salle de Bain', description: 'CrÃ©ation et rÃ©novation complÃ¨te', features: ['Devis gratuit', 'Aide au choix', 'ClÃ© en main'] },
      { name: 'Entretien Annuel', description: 'Maintenance prÃ©ventive', features: ['ContrÃ´le chauffage', 'DÃ©tartrage', 'Mise aux normes'] }
    ],
    guarantees: [
      { title: 'Garantie DÃ©cennale', icon: 'shield-check' }, { title: 'Intervention < 2h', icon: 'clock' },
      { title: 'Devis Gratuit', icon: 'file-text' }, { title: 'Artisan QualifiÃ©', icon: 'check-square' }
    ],
    heroTitle: 'Artisan Plombier',
    heroSubtitle: "L'artisan du tuyau Ã  votre service - De la fuite d'eau Ã  la rÃ©novation complÃ¨te",
    aboutText: "Plombier chauffagiste de confiance, je mets mon savoir-faire Ã  votre service. Artisan passionnÃ©, je garantis un travail soignÃ©, des dÃ©lais respectÃ©s et des tarifs transparents.",
    ctaText: 'Demandez un devis'
  },
  electricien: {
    primary: '#1e40af', secondary: '#1e3a8a', accent: '#2563eb', background: '#f8fafc',
    services: [
      { name: 'Mise aux Normes', description: 'Remise Ã  neuf de votre installation Ã©lectrique', features: ['Norme NFC 15-100', 'Tableau Ã©lectrique neuf', 'Mise Ã  la terre'] },
      { name: 'DÃ©pannage Ã‰lectrique', description: 'Pannes, court-circuits, disjonctions', features: ['Intervention rapide', 'Diagnostic complet', 'RÃ©paration durable'] },
      { name: 'Installation ComplÃ¨te', description: 'Construction ou rÃ©novation Ã©lectrique', features: ['CÃ¢blage complet', 'Points de lumiÃ¨re', 'Prises et inters'] },
      { name: 'Domotique & Smart Home', description: 'Maison connectÃ©e et automatisÃ©e', features: ['Volets roulants', 'Ã‰clairage auto', 'Thermostats'] },
      { name: 'Ã‰clairage LED', description: 'Solutions Ã©clairage Ã©conomiques', features: ['Spots encastrÃ©s', 'Suspensions design', 'Ã‰clairage extÃ©rieur'] },
      { name: 'Borne de Recharge', description: 'Installation bornes vÃ©hicule Ã©lectrique', features: ['Wallbox particulier', 'Borne entreprise', 'Certification IRVE'] }
    ],
    guarantees: [
      { title: 'Consuel CertifiÃ©', icon: 'shield-check' }, { title: 'Garantie DÃ©cennale', icon: 'check-square' },
      { title: 'Intervention < 2h', icon: 'clock' }, { title: 'Devis Gratuit', icon: 'file-text' }
    ],
    heroTitle: 'Ã‰lectricien AgrÃ©Ã©',
    heroSubtitle: "Votre expert Ã©lectricien pour des installations sÃ»res et modernes",
    aboutText: "Ã‰lectricien certifiÃ© Consuel, je sÃ©curise votre habitat grÃ¢ce Ã  des installations conformes et durables. Artisan sÃ©rieux, intervention rapide et devis transparent.",
    ctaText: 'Contactez-moi'
  },
  coiffeur: {
    primary: '#6b21a8', secondary: '#581c87', accent: '#7c3aed', background: '#f8fafc',
    services: [
      { name: 'Coupes & Styles', description: 'Coupe sur-mesure femme et homme', features: ['Visagisme personnalisÃ©', 'Techniques actuelles', 'Conseil entretien'] },
      { name: 'Barbier Traditionnel', description: 'Rasage et soins barbe', features: ["Rasage Ã  l'ancienne", 'Taille prÃ©cise', 'Soins barbe'] },
      { name: 'Coloration Expert', description: 'Balayages, ombrÃ©s et couleurs', features: ['Coloration vÃ©gÃ©tale', 'MÃ¨ches sur mesure', 'Glitter color'] },
      { name: 'Soins Capillaires', description: 'Traitements rÃ©parateurs', features: ['Botox capillaire', 'KÃ©ratine', 'Massage crÃ¢nien'] },
      { name: 'Extensions Volume', description: 'Rajouts longueur et Ã©paisseur', features: ['Pose Ã  froid', 'Tape-in', 'Entretien inclus'] },
      { name: 'Chignons & Ã‰vÃ©nements', description: 'Coiffures de cÃ©rÃ©monie', features: ['Mariage', 'SoirÃ©e', 'Maquillage combo'] }
    ],
    guarantees: [
      { title: 'Produits Bio', icon: 'leaf' }, { title: 'StÃ©rilisation Outils', icon: 'sparkles' },
      { title: 'Formation Continue', icon: 'scissors' }, { title: 'Satisfait ou Refait', icon: 'heart' }
    ],
    heroTitle: 'Coiffeur Visagiste',
    heroSubtitle: "L'art de sublimer vos cheveux avec passion et expertise",
    aboutText: "Coiffeur passionnÃ©, je crÃ©e des looks qui vous ressemblent. SpÃ©cialiste du visagisme et des techniques modernes, je veille Ã  la santÃ© de vos cheveux avec des produits naturels.",
    ctaText: 'Prendre rendez-vous'
  },
  restaurant: {
    primary: '#c2410c', secondary: '#9a3412', accent: '#ea580c', background: '#f8fafc',
    services: [
      { name: 'Cuisine Maison', description: 'Plats prÃ©parÃ©s sur place', features: ['Produits locaux', 'Recettes authentiques', 'Fait minute'] },
      { name: 'Menu du Jour', description: 'Formule dÃ©jeuner Ã©conomique', features: ['EntrÃ©e + Plat + Dessert', 'Produits frais', 'Cuisson minute'] },
      { name: 'SpÃ©cialitÃ©s', description: 'Nos plats signature', features: ['Recettes du terroir', 'Grillades', 'Poissons frais'] },
      { name: 'Ã‰vÃ©nements & Groupes', description: 'Repas de famille et sÃ©minaires', features: ['Menu groupe', 'Salle privative', 'Sur mesure'] },
      { name: 'Service Traiteur', description: 'Livraison et Ã  emporter', features: ['Plateaux repas', 'Buffets', 'Livraison pro'] },
      { name: 'Boissons & Vins', description: 'Carte des vins et cocktails', features: ['Vins rÃ©gionaux', 'Cocktails maison', 'BiÃ¨res artisanales'] }
    ],
    guarantees: [
      { title: 'Produits Frais', icon: 'leaf' }, { title: 'Chef QualifiÃ©', icon: 'award' },
      { title: 'RÃ©servation Facile', icon: 'calendar' }, { title: 'Accueil Chaleureux', icon: 'heart' }
    ],
    heroTitle: 'Restaurant Traditionnel',
    heroSubtitle: "Cuisine authentique et accueil chaleureux",
    aboutText: "Chef passionnÃ©, je cuisine avec cÅ“ur des plats gÃ©nÃ©reux et savoureux. Produits frais du marchÃ©, recettes authentiques et ambiance conviviale vous attendent.",
    ctaText: 'RÃ©server une table'
  },
  garage: {
    primary: '#166534', secondary: '#14532d', accent: '#059669', background: '#f8fafc',
    services: [
      { name: 'MÃ©canique GÃ©nÃ©rale', description: 'Entretien et rÃ©paration toutes marques', features: ['RÃ©visions constructeur', 'Courroies', 'Freins'] },
      { name: 'Diagnostic Auto', description: 'Analyse Ã©lectronique complÃ¨te', features: ['Valise multimarque', 'Effacement dÃ©fauts', 'ParamÃ©trage'] },
      { name: 'Pneumatiques', description: 'Montage, Ã©quilibrage, gÃ©omÃ©trie', features: ['Pneus toutes saisons', 'Pneus run-flat', 'ParallÃ©lisme'] },
      { name: 'Climatisation', description: 'Recharge et rÃ©paration clim', features: ['Recharge gaz R134a', 'DÃ©tection fuites', 'Filtre habitacle'] },
      { name: 'Carrosserie', description: 'RÃ©paration et peinture', features: ['DÃ©bosselage', 'Peinture Ã  la nuance', 'Polissage optique'] },
      { name: 'ContrÃ´le Technique', description: 'PrÃ©paration et contre-visite', features: ['PrÃ©-contrÃ´le', 'RÃ©parations conformitÃ©', 'Accompagnement'] }
    ],
    guarantees: [
      { title: 'Devis Gratuit', icon: 'file-text' }, { title: 'Garantie PiÃ¨ces', icon: 'shield-check' },
      { title: 'Intervention Rapide', icon: 'clock' }, { title: 'VÃ©hicule de Courtoisie', icon: 'car' }
    ],
    heroTitle: 'Garage Automobile',
    heroSubtitle: "MÃ©canicien passionnÃ©, votre vÃ©hicule entre de bonnes mains",
    aboutText: "MÃ©canicien automobile de confiance, j'entretiens et rÃ©pare toutes marques avec passion. Diagnostic prÃ©cis, devis transparents et respect des dÃ©lais. Votre sÃ©curitÃ© routiÃ¨re est ma prioritÃ©.",
    ctaText: 'Demandez un RDV'
  },
  nettoyage: {
    primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#f0fdf4',
    services: [
      { name: 'Nettoyage de Bureaux', description: 'Entretien quotidien de vos locaux professionnels', features: ['PoussiÃ¨re, sols, vitres', 'Produits Ã©colabels', 'Horaires flexibles'] },
      { name: 'Nettoyage Vitres', description: 'Vitres intÃ©rieures et extÃ©rieures', features: ['AccÃ¨s difficile', 'Sans traces garanti', 'BÃ¢timents R+10'] },
      { name: 'Grand Nettoyage', description: 'Nettoyage en profondeur rÃ©sidentiel', features: ['Cuisine dÃ©graissÃ©e', 'Salle de bain dÃ©sinfectÃ©e', 'Sol cirÃ©'] },
      { name: 'DÃ©sinfection', description: 'Traitement anti-bactÃ©rien et virucide', features: ['CertifiÃ© COVID', 'Produits bio', 'Rapport de traitement'] },
      { name: 'Nettoyage Industriel', description: 'EntrepÃ´ts, usines, ateliers', features: ['Monobrosse industrielle', 'Aspirateur eau/poussiÃ¨re', 'Horaires de nuit'] },
      { name: 'Remise en Ã‰tat', description: 'AprÃ¨s travaux ou dÃ©mÃ©nagement', features: ['Ã‰vacuation gravats', 'Nettoyage fin', 'Livraison clÃ© en main'] }
    ],
    guarantees: [
      { title: 'Produits Ã‰colabels', icon: 'leaf' }, { title: 'Personnel FormÃ©', icon: 'users' },
      { title: 'Intervention Fiable', icon: 'clock' }, { title: 'Assurance RC Pro', icon: 'shield-check' }
    ],
    heroTitle: 'SociÃ©tÃ© de Nettoyage',
    heroSubtitle: "PropretÃ© professionnelle et Ã©cologique pour vos espaces",
    aboutText: "Entreprise de nettoyage de confiance, nos Ã©quipes formÃ©es interviennent avec rigueur et discrÃ©tion. Produits Ã©colabels, matÃ©riel professionnel et engagement qualitÃ©.",
    ctaText: 'Demandez un devis'
  },
  jardin: {
    primary: '#14532d', secondary: '#166534', accent: '#15803d', background: '#f0fdf4',
    services: [
      { name: 'CrÃ©ation de Jardins', description: 'AmÃ©nagement paysager complet', features: ['Plan sur mesure', 'Plantations adaptÃ©es', 'Gazon en rouleaux'] },
      { name: 'Tonte & Entretien', description: 'Pelouse et massifs entretenus', features: ['Tonte rÃ©guliÃ¨re', 'Taille haies', 'DÃ©sherbage manuel'] },
      { name: 'Ã‰lagage & Abattage', description: 'Arbres et arbustes sÃ©curisÃ©s', features: ['Ã‰lagage raisonnÃ©', 'Grimper pro', 'Broyage branches'] },
      { name: 'Terrasses & ClÃ´tures', description: 'AmÃ©nagement structure bois', features: ['Terrasse pin/ipÃ©', 'ClÃ´ture occultation', 'Pergolas'] },
      { name: 'Arrosage Automatique', description: 'Installation systÃ¨me arrosage', features: ['Goutte Ã  goutte', 'TuyÃ¨res enterrÃ©es', 'Programmateur connectÃ©'] },
      { name: 'Potager & Verger', description: 'CrÃ©ation et entretien potager', features: ['Bacs surÃ©levÃ©s', 'Compostage', 'Taille fruitiers'] }
    ],
    guarantees: [
      { title: 'Plantes Garanties', icon: 'sprout' }, { title: 'Intervention Propre', icon: 'sparkles' },
      { title: 'Conseils Saisonniers', icon: 'sun' }, { title: 'Paysagiste QualifiÃ©', icon: 'award' }
    ],
    heroTitle: 'Jardinier Paysagiste',
    heroSubtitle: "CrÃ©ation et entretien de jardins uniques et harmonieux",
    aboutText: "Paysagiste passionnÃ©, je conÃ§ois et entretiens des espaces verts qui vivent au rythme des saisons. De la crÃ©ation paysagÃ¨re Ã  l'Ã©lagage expert.",
    ctaText: 'Demandez un devis'
  },
  fitness: {
    primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', background: '#fef2f2',
    services: [
      { name: 'Coaching Personnel', description: 'Accompagnement individuel sur mesure', features: ['Bilan morpho', 'Programme adaptÃ©', 'Suivi hebdo'] },
      { name: 'Cours Collectifs', description: 'Groupes dynamiques et motivants', features: ['HIIT', 'Yoga', 'Zumba'] },
      { name: 'Musculation Libre', description: 'Espace haltÃ¨res et machines', features: ['Poids libres', 'Machines guidÃ©es', 'Cage Ã  squat'] },
      { name: 'Cardio Zone', description: 'Ã‰quipements endurance modernes', features: ['Tapis connectÃ©s', 'VÃ©los elliptiques', 'Rameurs'] },
      { name: 'PrÃ©paration Physique', description: 'PrÃ©pa compÃ©tition ou remise en forme', features: ['Tests perf', 'Plan nutrition', 'RÃ©cupÃ©ration'] },
      { name: 'Espace Bien-Ãªtre', description: 'DÃ©tente aprÃ¨s effort', features: ['Sauna', 'Douche jets', 'Casiers sÃ©curisÃ©s'] }
    ],
    guarantees: [
      { title: 'Coachs DiplÃ´mÃ©s', icon: 'award' }, { title: 'MatÃ©riel Neuf', icon: 'zap' },
      { title: 'Sans Engagement', icon: 'check-circle' }, { title: 'AccÃ¨s 6h-23h', icon: 'clock' }
    ],
    heroTitle: 'Coach Sportif',
    heroSubtitle: "Votre coach personnel pour atteindre vos objectifs fitness",
    aboutText: "Coach sportif diplÃ´mÃ© d'Ã‰tat. Que vous cherchiez Ã  perdre du poids, gagner en muscle ou prÃ©parer une compÃ©tition, je vous accompagne avec des programmes personnalisÃ©s.",
    ctaText: 'Essai offert'
  },
  medical: {
    primary: '#1e40af', secondary: '#1e3a8a', accent: '#2563eb', background: '#eff6ff',
    services: [
      { name: 'MÃ©decine GÃ©nÃ©rale', description: 'Consultations et suivi de santÃ©', features: ['Bilan annuel', 'Vaccinations', 'Certificats'] },
      { name: 'KinÃ©sithÃ©rapie', description: 'RÃ©Ã©ducation et rÃ©adaptation', features: ['Massages mÃ©dicaux', 'RÃ©Ã©ducation post-op', 'Posturologie'] },
      { name: 'OstÃ©opathie', description: 'Soins sans mÃ©dicaments', features: ['BÃ©bÃ©s', 'Femmes enceintes', 'Sportifs'] },
      { name: 'Infirmier Ã  Domicile', description: 'Soins Ã  votre domicile', features: ['Injections', 'Pansements', 'PrÃ©lÃ¨vements'] },
      { name: 'Analyses Biologiques', description: 'Laboratoire sur place', features: ['Prise de sang', 'Tests rapides', 'RÃ©sultats 24h'] },
      { name: 'TÃ©lÃ©mÃ©decine', description: 'Consultation vidÃ©o', features: ['Ordonnance Ã©lectronique', '7j/7 disponible', 'Sans dÃ©placement'] }
    ],
    guarantees: [
      { title: 'ConventionnÃ© Secteur 1', icon: 'stethoscope' }, { title: '3Ã¨me Payant', icon: 'credit-card' },
      { title: 'RDV sous 48h', icon: 'calendar' }, { title: 'Ã‰quipe QualifiÃ©e', icon: 'users' }
    ],
    heroTitle: 'Cabinet MÃ©dical',
    heroSubtitle: "Votre santÃ© entre les mains de professionnels qualifiÃ©s",
    aboutText: "MÃ©decin gÃ©nÃ©raliste de confiance, je vous accueille dans un cabinet moderne et chaleureux. Ã‰coute, diagnostic prÃ©cis et suivi personnalisÃ©.",
    ctaText: 'Prendre rendez-vous'
  },
  avocat: {
    primary: '#1e3a8a', secondary: '#172554', accent: '#2563eb', background: '#f8fafc',
    services: [
      { name: 'Droit Civil & Famille', description: 'Divorce, succession, bail', features: ['Divorce amiable/contentieux', 'RÃ©gime matrimonial', 'Garde alternÃ©e'] },
      { name: 'Droit PÃ©nal', description: 'DÃ©fense et assistance victimes', features: ['Garde Ã  vue', 'Tribunal correctionnel', 'Victimes prÃ©judice'] },
      { name: 'Droit du Travail', description: 'Licenciement et contentieux', features: ['Rupture conventionnelle', 'HarcÃ¨lement', "Prud'hommes"] },
      { name: 'Droit des Affaires', description: 'Conseil entreprises et particuliers', features: ['CrÃ©ation sociÃ©tÃ©', 'Contrats commerciaux', 'Recouvrement'] },
      { name: 'Immobilier', description: 'Vente, achat, litiges', features: ['Promesse vente', 'CopropriÃ©tÃ©', 'Malfaisance construction'] },
      { name: 'Droit Routier', description: 'Permis, accidents, infractions', features: ['Retrait permis', 'ExcÃ¨s vitesse', 'DÃ©fense pÃ©nale'] }
    ],
    guarantees: [
      { title: 'Avocat au Barreau', icon: 'scale' }, { title: 'Consultation PrivÃ©e', icon: 'shield' },
      { title: 'DÃ©fense DÃ©terminÃ©e', icon: 'award' }, { title: 'Honoraires Transparents', icon: 'file-text' }
    ],
    heroTitle: 'Avocat Ã  la Cour',
    heroSubtitle: "Conseil juridique personnalisÃ© et dÃ©fense de vos droits",
    aboutText: "Avocat inscrit au Barreau, je dÃ©fends vos intÃ©rÃªts avec rigueur et dÃ©termination. Droit civil, pÃ©nal, travail ou affaires, chaque dossier mÃ©rite une stratÃ©gie sur mesure.",
    ctaText: 'Prendre rendez-vous'
  },
  default: {
    primary: '#1e293b', secondary: '#334155', accent: '#475569', background: '#f8fafc',
    services: [
      { name: 'Prestation Sur Mesure', description: 'Services adaptÃ©s Ã  vos besoins spÃ©cifiques', features: ['Ã‰tude personnalisÃ©e', 'Devis dÃ©taillÃ©', 'Ã‰coute attentive'] },
      { name: 'Intervention Pro', description: 'Travail soignÃ© et professionnel', features: ['MatÃ©riel adaptÃ©', 'Techniques actuelles', 'Respect des normes'] },
      { name: 'Conseil Expert', description: 'Accompagnement et recommandations', features: ['Diagnostic complet', 'Solutions pertinentes', 'Suivi personnalisÃ©'] },
      { name: 'Service Rapide', description: 'RÃ©activitÃ© et respect des dÃ©lais', features: ['Intervention rapide', 'Horaires flexibles', 'Urgences traitÃ©es'] },
      { name: 'Garantie QualitÃ©', description: 'Engagement rÃ©sultat et satisfaction', features: ['ContrÃ´le qualitÃ©', 'Corrections incluses', 'SAV rÃ©actif'] },
      { name: 'Tarifs Transparents', description: 'Honoraires clairs et justifiÃ©s', features: ['Devis gratuit', 'Pas de surprise', 'FacilitÃ©s paiement'] }
    ],
    guarantees: [
      { title: 'Devis Gratuit', icon: 'file-text' }, { title: 'Garantie QualitÃ©', icon: 'shield-check' },
      { title: 'Intervention Rapide', icon: 'clock' }, { title: 'Satisfaction Client', icon: 'heart' }
    ],
    heroTitle: 'Artisan Professionnel',
    heroSubtitle: "Votre expert de confiance pour des prestations de qualitÃ©",
    aboutText: "Artisan passionnÃ©, je mets mon savoir-faire et mon expertise Ã  votre service. Chaque projet est unique et mÃ©rite une attention particuliÃ¨re.",
    ctaText: 'Contactez-moi'
  }
};

// â”€â”€ SÃ‰LECTION DE TEMPLATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getUltimateTemplate(sector: string): any {
  const s = (sector || '').toLowerCase();
  if (s.includes('nettoyag') || s.includes('propretÃ©') || s.includes('mÃ©nage')) return SECTOR_ULTIMATE_TEMPLATES.nettoyage;
  if (s.includes('jardin') || s.includes('paysag') || s.includes('espaces verts')) return SECTOR_ULTIMATE_TEMPLATES.jardin;
  if (s.includes('coach') || s.includes('sport') || s.includes('fitness') || s.includes('salle')) return SECTOR_ULTIMATE_TEMPLATES.fitness;
  if (s.includes('mÃ©dec') || s.includes('clinique') || s.includes('dentiste') || s.includes('santÃ©') || s.includes('kinÃ©')) return SECTOR_ULTIMATE_TEMPLATES.medical;
  if (s.includes('avocat') || s.includes('notaire') || s.includes('juridi') || s.includes('droit')) return SECTOR_ULTIMATE_TEMPLATES.avocat;
  if (s.includes('Ã©lectricien') || s.includes('electricien') || s.includes('electric')) return SECTOR_ULTIMATE_TEMPLATES.electricien;
  if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim')) return SECTOR_ULTIMATE_TEMPLATES.plomberie;
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) return SECTOR_ULTIMATE_TEMPLATES.coiffeur;
  if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur') || s.includes('boulang') || s.includes('pÃ¢tissier')) return SECTOR_ULTIMATE_TEMPLATES.restaurant;
  if (s.includes('garage') || s.includes('mÃ©can') || s.includes('auto') || s.includes('carrosserie')) return SECTOR_ULTIMATE_TEMPLATES.garage;
  if (s.includes('beautÃ©') || s.includes('esthÃ©tique') || s.includes('spa')) return SECTOR_ULTIMATE_TEMPLATES.coiffeur;
  if (s.includes('climat') || s.includes('frigo')) return SECTOR_ULTIMATE_TEMPLATES.plomberie;
  for (const [key, tmpl] of Object.entries(SECTOR_ULTIMATE_TEMPLATES)) {
    if (s.includes(key)) return tmpl;
  }
  return SECTOR_ULTIMATE_TEMPLATES.default;
}

// â”€â”€ IMAGES â€” FILTRE INTELLIGENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BLOCKED_IMAGE_KEYWORDS = [
  'food','fruit','legume','carrot','salmon','kitchen','cooking','recipe',
  'meal','dessert','cake','pizza','burger','restaurant-menu',
  'logo','icon','favicon','sprite','pixel','banner','badge','watermark',
  'thumbnail','avatar','placeholder','default','loading','spinner',
  'arrow','button','bg-','background','pattern','texture','overlay','gradient',
];
const BLOCKED_IMAGE_DOMAINS = [
  'tripadvisor.com','yelp.com','facebook.com','instagram.com','pagesjaunes.fr',
  'googletagmanager.com','doubleclick.net','googlesyndication.com',
];
const LOGO_EXTENSIONS = ['.svg', '.ico'];
const PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

function isLikelyLogo(url: string): boolean {
  const low = url.toLowerCase();
  if (LOGO_EXTENSIONS.some(ext => low.includes(ext))) return true;
  if (low.includes('logo') || low.includes('icon') || low.includes('favicon')) return true;
  if (/[?&](w|width|size)=(16|32|48|64|96|128)/i.test(url)) return true;
  return false;
}

function filterLeadImages(images: string[]): string[] {
  return images.filter(img => {
    if (!img || typeof img !== 'string') return false;
    if (!img.startsWith('https://')) return false;
    const low = img.toLowerCase();
    if (isLikelyLogo(img)) return false;
    if (BLOCKED_IMAGE_KEYWORDS.some(kw => low.includes(kw))) return false;
    if (BLOCKED_IMAGE_DOMAINS.some(d => low.includes(d))) return false;
    const hasPhotoExt = PHOTO_EXTENSIONS.some(ext => low.includes(ext));
    const hasDynamicCdn = low.includes('googleusercontent') || low.includes('maps.googleapis') ||
                          low.includes('images.pexels') || low.includes('images.unsplash') ||
                          /\/photo\//i.test(url);
    if (!hasPhotoExt && !hasDynamicCdn) return false;
    return true;
  });
}

function deduplicateImages(images: string[]): string[] {
  const seen = new Set<string>();
  return images.filter(img => {
    const base = img.split('?')[0].split('#')[0];
    if (seen.has(base)) return false;
    seen.add(base);
    return true;
  });
}

function buildImagePool(lead: any, sectorImages: string[]): string[] {
  // websiteImages dÃ©libÃ©rÃ©ment exclus (source principale de logos parasites)
  const rawLeadImages = [...(lead.images || [])];
  const realPhotos = deduplicateImages(filterLeadImages(rawLeadImages));
  const realSet = new Set(realPhotos.map((u: string) => u.split('?')[0]));
  const pexelsPool = sectorImages.filter(u => !realSet.has(u.split('?')[0]));
  const combined = [...realPhotos, ...pexelsPool];
  while (combined.length < 6 && pexelsPool.length > 0) {
    combined.push(pexelsPool[combined.length % pexelsPool.length]);
  }
  console.log(`ðŸ–¼ï¸ ${lead.name}: ${realPhotos.length} photos rÃ©elles | ${pexelsPool.length} Pexels | Total: ${combined.length}`);
  return combined;
}

function selectHeroImage(imagePool: string[]): string {
  if (imagePool.length === 0) return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';
  const googlePhoto = imagePool.find(u => u.includes('googleusercontent') || u.includes('maps.googleapis'));
  if (googlePhoto) return googlePhoto;
  return imagePool[0];
}

function buildSlotImages(imagePool: string[], heroImage: string): string[] {
  const remaining = imagePool.filter(u => u !== heroImage);
  const slots: string[] = [];
  for (let i = 0; i < 5; i++) {
    slots.push(remaining[i % Math.max(remaining.length, 1)] || heroImage);
  }
  return slots;
}

function getImageStyle(url: string, height: string = '450px'): string {
  const isKnownSource = url.includes('images.pexels.com') ||
                        url.includes('googleusercontent') ||
                        url.includes('maps.googleapis') ||
                        url.includes('images.unsplash.com');
  if (isKnownSource) {
    return `width:100%;height:${height};object-fit:cover;display:block;`;
  }
  return `width:100%;height:${height};object-fit:contain;background:#f8fafc;display:block;padding:1rem;`;
}

// â”€â”€ WHATSAPP â€” FORMATAGE INTERNATIONAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function detectCountryCode(city: string, address: string): string {
  const text = ((city || '') + ' ' + (address || '')).toLowerCase();
  if (text.includes('maroc') || text.includes('morocco') || text.includes('casablanca') ||
      text.includes('rabat') || text.includes('marrakech') || text.includes('fÃ¨s') ||
      text.includes('tanger') || text.includes('agadir') || text.includes('settat') ||
      text.includes('kenitra') || text.includes('meknÃ¨s') || text.includes('oujda')) return '212';
  if (text.includes('belgique') || text.includes('belgium') || text.includes('bruxelles') ||
      text.includes('liÃ¨ge') || text.includes('bruges') || text.includes('gand')) return '32';
  if (text.includes('suisse') || text.includes('switzerland') || text.includes('zurich') ||
      text.includes('genÃ¨ve') || text.includes('lausanne') || text.includes('berne')) return '41';
  if (text.includes('tunisie') || text.includes('tunisia') || text.includes('tunis') ||
      text.includes('sfax')) return '216';
  if (text.includes('algÃ©rie') || text.includes('algeria') || text.includes('alger') ||
      text.includes('oran')) return '213';
  return '33'; // France par dÃ©faut
}

function formatWhatsAppNumber(phone: string, countryCode: string = '33'): string {
  if (!phone) return '';
  let digits = phone.replace(/[^0-9+]/g, '');
  if (digits.startsWith('+')) return digits.slice(1);
  if (digits.startsWith('0033')) return digits.slice(2);
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return countryCode + digits.slice(1);
  return countryCode + digits;
}

// â”€â”€ UTILS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function generateAboutText(text: string, lead: any): string {
  let years = 'plusieurs';
  if (lead.establishedYear && typeof lead.establishedYear === 'number') {
    const calc = new Date().getFullYear() - lead.establishedYear;
    if (calc > 0 && calc < 100) years = calc.toString();
  } else if (lead.description) {
    const m = lead.description.match(/(\d+)\s*ans?\s*d['']exp[eÃ©]rience/i);
    if (m) years = m[1];
  }
  return text.replace(/depuis plus de 15 ans/gi, `depuis ${years} ans`)
             .replace(/15 ans d['']exp[eÃ©]rience/gi, `${years} ans d'expÃ©rience`);
}

function generateFeaturesFromService(name: string, description: string): string[] {
  const s = ((name || '') + ' ' + (description || '')).toLowerCase();
  const dict: Record<string, string[]> = {
    'urgence': ['Disponible 24h/24', 'Intervention rapide', 'DÃ©placement inclus'],
    'installation': ['Pose certifiÃ©e', 'ConformitÃ© normes', 'Garantie dÃ©cennale'],
    'chauffage': ['Ã‰conomies Ã©nergie', 'Installation propre', 'Entretien annuel'],
    'domotique': ['Configuration incluse', 'App smartphone', 'Support technique'],
    'coupe': ['Visagisme personnalisÃ©', 'Conseil entretien', 'Produits adaptÃ©s'],
    'coloration': ['Coloration vÃ©gÃ©tale', 'Protection cheveux', 'Brillance longue durÃ©e'],
    'moteur': ['Diagnostic prÃ©cis', 'RÃ©paration garantie', "PiÃ¨ces d'origine"],
    'pneus': ['Montage rapide', 'GÃ©omÃ©trie 3D', 'Stockage hiver'],
    'mÃ©nage': ['Produits Ã©cologiques', 'Ã‰quipe formÃ©e', 'Intervention rÃ©guliÃ¨re'],
    'vitres': ['Sans traces garanti', 'AccÃ¨s difficile', 'SÃ©curitÃ© maximale'],
    'coaching': ['Programme personnalisÃ©', 'Suivi nutrition', 'RÃ©sultats mesurables'],
    'consultation': ["Ã€ l'Ã©coute", 'Diagnostic prÃ©cis', 'DisponibilitÃ© rapide'],
  };
  for (const [kw, features] of Object.entries(dict)) {
    if (s.includes(kw)) return features;
  }
  return ['Service professionnel', 'Intervention garantie', 'Devis gratuit'];
}

function getLogoInfo(name: string, sector: string = 'default') {
  if (!name) return { initials: 'CO', text: 'Company', word1: 'Company', word2: 'Pro' };
  const skip = ['le','la','les','de','du','des',"l'","d'",'Ã ','a','et','&','en','pour'];
  const words = name.replace(/['']/g, "' ").split(/\s+/).filter(w => w.length > 0 && !skip.includes(w.toLowerCase()));
  let word1 = '', word2 = '';
  if (words.length === 1) {
    word1 = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    const low1 = word1.toLowerCase(); const s = sector.toLowerCase();
    if (s.includes('elec') && !low1.includes('elec')) word2 = 'Ã‰lectricitÃ©';
    else if (s.includes('plomb') && !low1.includes('plomb')) word2 = 'Plomberie';
    else if ((s.includes('garage') || s.includes('auto')) && !low1.includes('auto') && !low1.includes('garage')) word2 = 'Automobile';
    else if (!low1.includes('service') && !low1.includes('pro')) word2 = 'Services';
    else word2 = '';
  } else {
    word1 = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    word2 = words.slice(1).join(' ').charAt(0).toUpperCase() + words.slice(1).join(' ').slice(1).toLowerCase();
  }
  const initials = word1.substring(0, 2).toUpperCase();
  return { initials, text: name, word1, word2 };
}

function getHeroBadge(sector: string): { icon: string; text: string } {
  const s = (sector || '').toLowerCase();
  if (s.includes('plomb')) return { icon: 'zap', text: 'DÃ©pannage rapide garanti' };
  if (s.includes('electric') || s.includes('Ã©lectric')) return { icon: 'zap', text: 'Ã‰lectricien certifiÃ©' };
  if (s.includes('coiff') || s.includes('barb')) return { icon: 'scissors', text: 'Coiffeur professionnel' };
  if (s.includes('restaurant') || s.includes('cuisin')) return { icon: 'chef-hat', text: 'Chef qualifiÃ©' };
  if (s.includes('garage') || s.includes('mÃ©can')) return { icon: 'wrench', text: 'Garage agrÃ©Ã©' };
  if (s.includes('nettoy') || s.includes('mÃ©nage')) return { icon: 'sparkles', text: 'Service nettoyage pro' };
  if (s.includes('jardin') || s.includes('paysag')) return { icon: 'leaf', text: 'Jardinier expert' };
  return { icon: 'shield-check', text: 'Professionnel certifiÃ©' };
}

function hexToRgb(hex: string): string {
  if (hex.length === 7) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
  return '30, 41, 59';
}

// â”€â”€ TÃ‰MOIGNAGES â€” VRAIS AVIS UNIQUEMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildTestimonialsHTML(lead: any, rating: number, reviews: number): string {
  const realReviews = (lead.googleReviewsData || [])
    .filter((r: any) => r && r.text && r.text.trim().length > 10)
    .slice(0, 6)
    .map((r: any) => ({
      author: r.author || 'Client vÃ©rifiÃ©',
      text: r.text.trim(),
      rating: r.rating || 5,
      date: r.date || null,
    }));

  const count = realReviews.length;
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent((lead.name || '') + ' ' + (lead.city || ''))}`;

  // Pas assez d'avis â†’ section alternative sans faux avis
  if (count < 3) {
    return `
    <section class="container" id="testimonials">
      <div class="section-header reveal">
        <h2>Nos clients nous font confiance</h2>
        <p>Rejoignez nos clients satisfaits et dÃ©couvrez la qualitÃ© de nos prestations.</p>
      </div>
      <div style="text-align:center;padding:3rem;background:white;border-radius:24px;border:1px solid rgba(0,0,0,0.05);box-shadow:0 5px 20px rgba(0,0,0,0.02);">
        <div style="font-size:4rem;margin-bottom:1rem;">â­</div>
        <div style="font-size:3rem;font-weight:800;color:var(--text-main);">${rating}/5</div>
        <div style="color:var(--text-muted);margin-bottom:0.5rem;">Note Google Maps</div>
        <div style="color:var(--text-muted);font-size:0.9rem;margin-bottom:2rem;">BasÃ© sur ${reviews} avis</div>
        <a href="${googleMapsUrl}" target="_blank" rel="noopener"
           style="display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2rem;
                  background:var(--primary);color:white;border-radius:12px;
                  text-decoration:none;font-weight:700;transition:0.3s;">
          <i data-lucide="external-link" width="18"></i> Voir nos avis sur Google
        </a>
      </div>
    </section>`;
  }

  const gridCols = count <= 4 ? 'repeat(auto-fit, minmax(300px, 1fr))' : 'repeat(auto-fit, minmax(320px, 1fr))';

  return `
  <section class="container" id="testimonials">
    <div class="section-header reveal">
      <div style="display:inline-flex;align-items:center;gap:0.5rem;background:rgba(0,0,0,0.03);
                  padding:0.5rem 1rem;border-radius:100px;margin-bottom:1rem;font-weight:600;font-size:0.9rem;">
        <i data-lucide="map-pin" width="16" style="color:#ea4335;"></i>
        Avis authentiques vÃ©rifiÃ©s par Google Maps
      </div>
      <h2>Ce que disent nos clients</h2>
      <p>${count} avis rÃ©els â€” aucun avis inventÃ©.</p>
    </div>
    <div style="display:flex;justify-content:center;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:3rem;">
      <div style="font-size:3rem;font-weight:800;color:var(--text-main);line-height:1;">${rating}</div>
      <div>
        <div style="display:flex;color:#f59e0b;gap:4px;margin-bottom:4px;">
          ${'<i data-lucide="star" fill="currentColor"></i>'.repeat(5)}
        </div>
        <div style="color:var(--text-muted);font-weight:500;">BasÃ© sur ${reviews} avis Google</div>
      </div>
      <a href="${googleMapsUrl}" target="_blank" rel="noopener"
         style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.6rem 1.2rem;
                border:1px solid rgba(0,0,0,0.1);border-radius:100px;text-decoration:none;
                color:var(--text-muted);font-size:0.85rem;font-weight:600;background:white;">
        <i data-lucide="external-link" width="14"></i> Voir sur Google
      </a>
    </div>
    <div style="display:grid;grid-template-columns:${gridCols};gap:2rem;">
      ${realReviews.map((t: any, i: number) => `
      <div class="card glass reveal" style="transition-delay:${(i % 3) * 100}ms;padding:2.5rem;
           display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:flex;gap:0.25rem;color:#f59e0b;margin-bottom:1.25rem;">
            ${'<i data-lucide="star" fill="currentColor"></i>'.repeat(t.rating)}
            ${'<i data-lucide="star" style="opacity:0.2;"></i>'.repeat(5 - t.rating)}
          </div>
          <p style="color:var(--text-main);font-size:1.05rem;font-weight:500;font-style:italic;
                    line-height:1.7;display:-webkit-box;-webkit-line-clamp:5;
                    -webkit-box-orient:vertical;overflow:hidden;">
            "${t.text}"
          </p>
        </div>
        <div style="display:flex;align-items:center;gap:1rem;margin-top:1.5rem;
                    border-top:1px solid rgba(0,0,0,0.05);padding-top:1.5rem;">
          <div style="width:48px;height:48px;border-radius:50%;flex-shrink:0;
                      background:linear-gradient(135deg,var(--primary),var(--secondary));
                      display:flex;align-items:center;justify-content:center;
                      font-weight:700;color:white;font-size:1.25rem;">
            ${t.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-weight:700;color:var(--text-main);">${t.author}</div>
            <div style="display:flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:#6b7280;margin-top:2px;">
              <i data-lucide="check-circle-2" width="14" style="color:#16a34a;"></i>
              Avis vÃ©rifiÃ© Google${t.date ? ' Â· ' + t.date : ''}
            </div>
          </div>
        </div>
      </div>`).join('')}
    </div>
    <div style="text-align:center;margin-top:3rem;">
      <a href="${googleMapsUrl}" target="_blank" rel="noopener"
         style="display:inline-flex;align-items:center;gap:0.75rem;padding:1rem 2rem;
                border:2px solid var(--primary);color:var(--primary);border-radius:12px;
                text-decoration:none;font-weight:700;background:white;transition:0.3s;">
        <i data-lucide="map-pin" width="20"></i>
        Voir tous les ${reviews} avis sur Google Maps
        <i data-lucide="arrow-right" width="18"></i>
      </a>
    </div>
  </section>`;
}

// â”€â”€ EXPORT PRINCIPAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function generateUltimateSite(lead: any, aiContent?: any): string {
  const template = getUltimateTemplate(lead.sector);
  const companyName = lead.name || 'Entreprise Premium';
  const city = lead.city || '';
  const phone = lead.phone || '';
  const email = lead.email || '';
  const address = lead.address || (city ? `Centre Ville, ${city}` : '');
  const website = lead.website || '';
  const rating = lead.googleRating || 5;
  const reviews = lead.googleReviews || 0;

  const rawDescription = aiContent?.aboutText || lead.description || template.aboutText;
  const description = generateAboutText(rawDescription, lead);
  const heroSubtitle = aiContent?.heroSubtitle || `${template.heroSubtitle}${city ? ' Ã  ' + city : ''}`;

  let ctaText = aiContent?.cta || template.ctaText || 'Demander un devis';
  if (ctaText.length > 50) ctaText = ctaText.substring(0, 47) + '...';

  let finalServices = template.services;
  if (aiContent?.services?.length > 0) {
    finalServices = aiContent.services.map((s: any, idx: number) => ({
      name: s.name || `Service ${idx + 1}`,
      description: s.description || '',
      features: (s.features?.length > 0 ? s.features : generateFeaturesFromService(s.name, s.description)).slice(0, 3),
    }));
  }

  const sectorImages = getSectorImages(lead.sector);
  const imagePool = buildImagePool(lead, sectorImages);
  const heroImage = selectHeroImage(imagePool);
  const allImages = buildSlotImages(imagePool, heroImage);

  let nameHash = 0;
  for (let i = 0; i < companyName.length; i++) nameHash += companyName.charCodeAt(i);
  const sloganVariations = ["L'art de la perfection au quotidien", "Solutions premium sur-mesure", "Excellence & Passion", "Votre partenaire de confiance"];
  const finalSlogan = sloganVariations[nameHash % sloganVariations.length];

  const content: UltimateContent = {
    companyName, sector: lead.sector || 'Professionnel', city, description,
    phone, email, address, website, rating, reviews,
    services: finalServices, heroTitle: template.heroTitle, heroSubtitle,
    aboutText: description, ctaText, slogan: finalSlogan, heroImage, allImages,
  };

  return buildUltimateHTML(content, template, imagePool, nameHash % 4, lead);
}

export async function generateUltimateSiteAsync(lead: any, aiContent?: any): Promise<string> {
  const template = getUltimateTemplate(lead.sector);
  const companyName = lead.name || 'Entreprise Premium';
  const city = lead.city || '';
  const phone = lead.phone || '';
  const email = lead.email || '';
  const address = lead.address || (city ? `Centre Ville, ${city}` : '');
  const website = lead.website || '';
  const rating = lead.googleRating || 5;
  const reviews = lead.googleReviews || 0;

  const rawDescription = aiContent?.aboutText || lead.description || template.aboutText;
  const description = generateAboutText(rawDescription, lead);
  const heroSubtitle = aiContent?.heroSubtitle || `${template.heroSubtitle}${city ? ' Ã  ' + city : ''}`;

  let ctaText = aiContent?.cta || template.ctaText || 'Demander un devis';
  if (ctaText.length > 50) ctaText = ctaText.substring(0, 47) + '...';

  let finalServices = template.services;
  if (aiContent?.services?.length > 0) {
    finalServices = aiContent.services.map((s: any, idx: number) => ({
      name: s.name || `Service ${idx + 1}`,
      description: s.description || '',
      features: (s.features?.length > 0 ? s.features : generateFeaturesFromService(s.name, s.description)).slice(0, 3),
    }));
  }

  let imagePool: string[] = [];
  try {
    imagePool = await getImagesForLead(lead, 6);
  } catch {
    imagePool = buildImagePool(lead, getSectorImages(lead.sector));
  }

  const heroImage = selectHeroImage(imagePool);
  const allImages = buildSlotImages(imagePool, heroImage);

  let nameHash = 0;
  for (let i = 0; i < companyName.length; i++) nameHash += companyName.charCodeAt(i);

  const baseSlogan = aiContent?.slogan || "L'excellence Ã  votre service";
  const sloganVariations = [baseSlogan, "L'art de la perfection au quotidien", "Solutions premium sur-mesure", "Excellence & Passion", "Votre partenaire de confiance"];
  const finalSlogan = sloganVariations[nameHash % sloganVariations.length];

  const content: UltimateContent = {
    companyName, sector: lead.sector || 'Professionnel', city, description,
    phone, email, address, website, rating, reviews,
    services: finalServices, heroTitle: template.heroTitle, heroSubtitle,
    aboutText: description, ctaText, slogan: finalSlogan, heroImage, allImages,
  };

  return buildUltimateHTML(content, template, imagePool, nameHash % 4, lead);
}

// â”€â”€ GÃ‰NÃ‰RATEUR HTML PRINCIPAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildUltimateHTML(content: UltimateContent, template: any, imagePool: string[], layoutVariant: number, lead: any): string {
  const { companyName, heroSubtitle, aboutText, services, phone, email, address, website, city, ctaText, rating, reviews, slogan, heroImage, allImages } = content;

  const primaryColor = template.primary;
  const secondaryColor = template.secondary;
  const primaryRgb = hexToRgb(template.primary);

  let nameHash = 0;
  for (let i = 0; i < companyName.length; i++) nameHash += companyName.charCodeAt(i);
  const fontPair = nameHash % 3;

  const logoInfo = getLogoInfo(companyName, content.sector);
  const heroBadge = getHeroBadge(content.sector);
  const cleanPhoneLink = phone ? phone.replace(/[^0-9+]/g, '') : '';
  const countryCode = detectCountryCode(city, address);
  const whatsappNumber = phone ? formatWhatsAppNumber(phone, countryCode) : '';
  const mapQuery = encodeURIComponent(address + (city ? ', ' + city : ''));

  // Favicon SVG inline
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${primaryColor}"/><text x="50%" y="50%" font-family="sans-serif" font-size="45" font-weight="bold" fill="white" dominant-baseline="central" text-anchor="middle">${logoInfo.initials}</text></svg>`;
  const faviconDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(faviconSvg)}`;

  // Formsubmit endpoint
  const formsubmitEndpoint = email ? `https://formsubmit.co/${email}` : '#';

  // Images par slot sans doublon
  const getImg = (slot: number): string => {
    return allImages[slot % Math.max(allImages.length, 1)] || heroImage;
  };

  const fontLink = fontPair === 0
    ? `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`
    : fontPair === 1
    ? `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`
    : `<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`;

  const fontHead = fontPair === 0 ? "'Outfit'" : fontPair === 1 ? "'Plus Jakarta Sans'" : "'Lexend'";

  return `<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="icon" type="image/svg+xml" href="${faviconDataUrl}">
  <title>${companyName} â€” ${content.sector}${city ? ' Ã  ' + city : ''}</title>

  <meta name="description" content="${companyName} â€” ${content.sector} professionnel${city ? ' Ã  ' + city : ''}. ${heroSubtitle}.${phone ? ' Contactez-nous au ' + phone : ''}">
  <meta name="robots" content="index, follow">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${companyName} â€” ${content.sector}${city ? ' Ã  ' + city : ''}">
  <meta property="og:description" content="${heroSubtitle}">
  <meta property="og:image" content="${heroImage}">
  <meta property="og:locale" content="fr_FR">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${companyName} â€” ${content.sector}">
  <meta name="twitter:image" content="${heroImage}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${fontLink}

  <!-- âœ… Lucide v1.11.0 â€” version fixÃ©e, CDN jsDelivr (plus stable qu'unpkg @latest) -->
  <script src="https://cdn.jsdelivr.net/npm/lucide@1.11.0/dist/umd/lucide.min.js"></script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "${companyName}",
    "description": "${heroSubtitle}",
    "image": "${heroImage}",
    "telephone": "${phone}",
    "email": "${email}",
    "address": { "@type": "PostalAddress", "streetAddress": "${address}", "addressLocality": "${city}", "addressCountry": "FR" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "${rating}", "reviewCount": "${reviews}" }
  }
  </script>

  <style>
    :root {
      --primary: ${primaryColor};
      --secondary: ${secondaryColor};
      --accent: ${template.accent};
      --primary-rgb: ${primaryRgb};
      --bg-base: ${template.background};
      --bg-glass: rgba(255,255,255,0.7);
      --text-main: #0f172a;
      --text-muted: #475569;
      --text-light: rgba(255,255,255,0.7);
      --border-glass: rgba(255,255,255,0.5);
      --font-head: ${fontHead}, sans-serif;
      --glow: 0 10px 40px rgba(${primaryRgb}, 0.15);
    }
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html { overflow-x:hidden; }
    body { font-family:'Inter',sans-serif; background:var(--bg-base); color:var(--text-main); overflow-x:hidden; line-height:1.7; }
    img,video,iframe { max-width:100%; }
    h1,h2,h3,h4 { font-family:var(--font-head); }

    /* Animations */
    .reveal { opacity:0; transform:translateY(30px); transition:all 0.8s cubic-bezier(0.25,1,0.5,1); }
    .reveal.active { opacity:1; transform:translateY(0); }
    .reveal-left { opacity:0; transform:translateX(-30px); transition:all 0.8s ease-out; }
    .reveal-left.active { opacity:1; transform:translateX(0); }
    .reveal-right { opacity:0; transform:translateX(30px); transition:all 0.8s ease-out; }
    .reveal-right.active { opacity:1; transform:translateX(0); }

    /* Marquee */
    .top-marquee { background:var(--primary); color:white; font-size:0.85rem; font-weight:500; padding:8px 0; white-space:nowrap; overflow:hidden; position:relative; z-index:100; }
    .marquee-content { display:inline-flex; gap:3rem; animation:marquee 30s linear infinite; }
    .marquee-content:hover { animation-play-state:paused; }
    .marquee-item { display:inline-flex; align-items:center; gap:6px; }
    @keyframes marquee { 0%{ transform:translateX(0); } 100%{ transform:translateX(-50%); } }

    /* Navigation â€” âœ… CSS PUR, pas de JS */
    nav { position:fixed; top:36px; width:100%; z-index:50; padding:1.5rem 0; transition:all 0.4s cubic-bezier(0.4,0,0.2,1); }
    nav.scrolled { top:0; padding:1rem 0; background:rgba(255,255,255,0.92); backdrop-filter:blur(20px); border-bottom:1px solid rgba(0,0,0,0.05); box-shadow:0 10px 30px rgba(0,0,0,0.03); }
    .nav-container { max-width:1200px; margin:0 auto; padding:0 2rem; display:flex; justify-content:space-between; align-items:center; }
    .logo-svg { width:45px; height:45px; border-radius:12px; background:linear-gradient(135deg,var(--primary),var(--secondary)); display:flex; align-items:center; justify-content:center; color:white; font-family:'Outfit',sans-serif; font-weight:800; font-size:1.25rem; box-shadow:0 8px 20px rgba(${primaryRgb},0.2); }
    .brand { font-size:1.75rem; font-weight:800; color:var(--text-main); text-decoration:none; display:flex; align-items:center; gap:0.75rem; }
    .btn-call { display:inline-flex; align-items:center; gap:0.5rem; background:white; border:1px solid rgba(0,0,0,0.05); color:var(--text-main); padding:0.5rem 1.25rem; border-radius:100px; text-decoration:none; font-weight:600; transition:all 0.3s; }
    .btn-call:hover { background:var(--primary); color:white; }

    /* âœ… Desktop menu â€” CSS pur via @media */
    .desktop-menu { display:none; }
    @media (min-width: 769px) {
      .desktop-menu { display:flex !important; align-items:center; gap:1.5rem; font-weight:500; }
      .desktop-menu a { text-decoration:none; color:var(--text-main); font-size:0.95rem; position:relative; padding-bottom:2px; transition:color 0.2s; }
      .desktop-menu a::after { content:''; position:absolute; bottom:0; left:0; width:0; height:2px; background:var(--primary); transition:width 0.3s ease; border-radius:2px; }
      .desktop-menu a:hover { color:var(--primary); }
      .desktop-menu a:hover::after { width:100%; }
      .mobile-menu-toggle { display:none !important; }
      .mobile-menu { display:none !important; }
    }

    /* Mobile menu */
    .mobile-menu { display:none; position:absolute; top:100%; left:0; right:0; background:white; padding:1rem; box-shadow:0 10px 30px rgba(0,0,0,0.1); border-bottom:1px solid rgba(0,0,0,0.05); z-index:100; }
    .mobile-menu.open { display:block; }
    .mobile-menu-link { display:block; padding:1rem; text-decoration:none; color:var(--text-main); font-weight:500; border-bottom:1px solid rgba(0,0,0,0.05); transition:all 0.3s; }
    .mobile-menu-link:hover { color:var(--primary); padding-left:1.5rem; }
    .mobile-menu-link:last-child { border-bottom:none; }
    .mobile-call-link { color:var(--primary); font-weight:700; }

    /* â”€â”€ MOBILE-FIRST OPTIMISATIONS AVANCÃ‰ES â”€â”€ */
    
    /* Viewport optimizations */
    @viewport {
      width: device-width;
      initial-scale: 1.0;
      maximum-scale: 1.0;
      user-scalable: no;
    }
    
    /* Touch optimizations */
    @media (hover: none) and (pointer: coarse) {
      .btn-cta, .btn-call, .mobile-menu-link {
        min-height: 44px;
        min-width: 44px;
        padding: 12px 20px;
      }
      
      .card {
        margin: 8px;
      }
      
      input, textarea, select {
        font-size: 16px !important; /* Prevent zoom on iOS */
      }
    }
    
    /* Small mobile devices (320px - 480px) */
    @media (max-width: 480px) {
      :root {
        --font-scale: 0.9;
        --spacing-scale: 0.8;
      }
      
      body {
        font-size: 14px;
        line-height: 1.5;
      }
      
      h1 { font-size: 2rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
      
      .hero-section {
        padding: 4rem 1rem 2rem;
        min-height: 60vh;
      }
      
      .hero-title {
        font-size: 2.5rem;
        line-height: 1.1;
      }
      
      .hero-subtitle {
        font-size: 1rem;
        margin-bottom: 1.5rem;
      }
      
      .btn-cta {
        width: 100%;
        padding: 1rem 2rem;
        font-size: 1rem;
        margin: 0.5rem 0;
      }
      
      .card {
        padding: 1.5rem;
        margin: 0.5rem 0;
      }
      
      .grid-3 {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .stats-banner {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      
      .process-grid {
        grid-template-columns: 1fr;
      }
      
      .nav-container {
        padding: 0 1rem;
      }
      
      .brand {
        font-size: 1.25rem;
      }
      
      .logo-svg {
        width: 36px;
        height: 36px;
      }
    }
    
    /* Medium mobile devices (481px - 768px) */
    @media (min-width: 481px) and (max-width: 768px) {
      .hero-section {
        padding: 5rem 1.5rem 2rem;
      }
      
      .hero-title {
        font-size: 3rem;
      }
      
      .grid-3 {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .stats-banner {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    
    /* Large mobile/tablet (769px - 1024px) */
    @media (min-width: 769px) and (max-width: 1024px) {
      .grid-3 {
        grid-template-columns: repeat(3, 1fr);
      }
      
      .hero-section {
        padding: 6rem 2rem 3rem;
      }
    }
    
    /* Landscape mobile optimizations */
    @media (max-width: 768px) and (orientation: landscape) {
      .hero-section {
        min-height: 50vh;
        padding: 2rem 1rem;
      }
      
      .hero-title {
        font-size: 2rem;
      }
      
      .process-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    /* High DPI displays */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .logo-svg {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }
    }
    
    /* Dark mode support for mobile */
    @media (prefers-color-scheme: dark) and (max-width: 768px) {
      :root {
        --bg-base: #0f172a;
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
        --bg-glass: rgba(15, 23, 42, 0.7);
      }
      
      .mobile-menu {
        background: #1e293b;
        color: #f8fafc;
      }
      
      .mobile-menu-link {
        color: #f8fafc;
        border-color: #334155;
      }
    }
    
    /* Reduced motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .reveal {
        opacity: 1;
        transform: none;
      }
    }
    
    /* Safe area insets for notched phones */
    @supports (padding: max(0px)) {
      .hero-section {
        padding-left: max(1rem, env(safe-area-inset-left));
        padding-right: max(1rem, env(safe-area-inset-right));
        padding-top: max(4rem, env(safe-area-inset-top));
      }
      
      nav {
        padding-left: max(1.5rem, env(safe-area-inset-left));
        padding-right: max(1.5rem, env(safe-area-inset-right));
      }
    }

    /* Background blobs */
    .bg-blobs { position:fixed; top:0; left:0; right:0; bottom:0; overflow:hidden; z-index:-1; background:var(--bg-base); }
    .blob { position:absolute; filter:blur(100px); opacity:0.15; animation:float 20s infinite alternate cubic-bezier(0.4,0,0.2,1); border-radius:50%; }
    .blob-1 { background:var(--primary); width:45vw; height:45vw; top:-10vw; left:-10vw; }
    .blob-2 { background:var(--secondary); width:35vw; height:35vw; bottom:-5vw; right:-5vw; animation-delay:-10s; }
    @keyframes float { 0%{ transform:translate(0,0) scale(1); } 100%{ transform:translate(15vw,15vh) scale(1.1); } }

    /* Glass */
    .glass { background:var(--bg-glass); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid var(--border-glass); border-radius:24px; box-shadow:0 8px 32px rgba(31,38,135,0.04); }

    /* Hero */
    .hero-section { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:140px 2rem 100px; position:relative; text-align:center; }
    .hero-badge { display:inline-flex; align-items:center; gap:0.5rem; padding:0.5rem 1.5rem; border-radius:100px; background:white; border:1px solid rgba(${primaryRgb},0.2); color:var(--primary); font-size:0.875rem; font-weight:700; margin-bottom:2rem; text-transform:uppercase; letter-spacing:2px; box-shadow:0 4px 20px rgba(${primaryRgb},0.08); }
    .btn-cta { background:var(--primary); color:#fff; padding:1rem 2.5rem; border-radius:10px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:0.75rem; transition:all 0.3s ease; border:none; cursor:pointer; font-size:1.1rem; box-shadow:0 4px 15px rgba(0,0,0,0.1); white-space:nowrap; }
    .btn-cta:hover { transform:translateY(-2px); background:var(--secondary); box-shadow:0 8px 20px rgba(0,0,0,0.15); }

    /* Container */
    .container { max-width:1200px; margin:0 auto; padding:6rem 2rem; position:relative; z-index:10; }
    .bg-alternate { background-color:#f1f5f9; border-top:1px solid rgba(0,0,0,0.05); border-bottom:1px solid rgba(0,0,0,0.05); }
    .section-header { text-align:center; margin-bottom:4rem; }
    .section-header h2 { font-size:clamp(2.2rem,4vw,3rem); margin-bottom:1.25rem; font-weight:700; color:#1e293b; letter-spacing:-0.02em; }
    .section-header p { color:var(--text-muted); font-size:1.125rem; max-width:600px; margin:0 auto; }

    /* Grilles */
    .grid-3 { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:2rem; }
    .valeurs-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:2rem; }
    .process-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:2rem; }

    /* Cards */
    .card { padding:3rem; transition:transform 0.4s cubic-bezier(0.4,0,0.2,1),box-shadow 0.4s; position:relative; overflow:hidden; display:flex; flex-direction:column; height:100%; }
    .card:hover { transform:translateY(-4px); box-shadow:0 12px 30px rgba(0,0,0,0.08); }
    .card-icon { width:70px; height:70px; border-radius:20px; background:linear-gradient(135deg,rgba(${primaryRgb},0.15),rgba(${primaryRgb},0.05)); display:flex; align-items:center; justify-content:center; color:var(--primary); margin-bottom:2rem; }
    .card h3 { font-size:1.5rem; margin-bottom:1rem; font-weight:700; color:var(--text-main); }
    .card p { color:var(--text-muted); margin-bottom:2rem; flex-grow:1; }

    /* Valeur card */
    .valeur-card { padding:2.5rem 1.5rem; display:flex; flex-direction:column; align-items:center; text-align:center; border-radius:20px; background:white; border:1px solid rgba(0,0,0,0.04); transition:0.3s; box-shadow:0 5px 15px rgba(0,0,0,0.02); }
    .valeur-card:hover { transform:translateY(-5px); box-shadow:var(--glow); }
    .valeur-icon { width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg,rgba(${primaryRgb},0.15),rgba(${primaryRgb},0.05)); color:var(--primary); display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; }

    /* Process */
    .step-card { padding:2.5rem; text-align:center; background:white; border-radius:24px; position:relative; box-shadow:0 4px 20px rgba(0,0,0,0.02); border:1px solid rgba(0,0,0,0.03); transition:transform 0.3s; }
    .step-card:hover { transform:translateY(-3px); }
    .step-number { width:60px; height:60px; border-radius:50%; background:var(--bg-base); color:var(--primary); font-weight:800; font-size:1.5rem; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; border:2px dashed var(--primary); }

    /* Stats Banner */
    .stats-banner { padding:4rem 2rem; background:var(--primary); color:white; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:2rem; text-align:center; border-radius:30px; position:relative; overflow:hidden; box-shadow:0 15px 35px rgba(${primaryRgb},0.2); }
    .stat-banner-item h3 { font-size:3rem; font-weight:800; font-family:'Outfit'; margin-bottom:0.5rem; line-height:1; }

    /* Contact grid */
    .contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; background:white; border-radius:30px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.03); border:1px solid rgba(0,0,0,0.04); }
    .contact-form-side { padding:4rem; }
    .map-side iframe { width:100%; height:100%; min-height:450px; border:none; }
    .form-group { margin-bottom:1.5rem; }
    .form-control { width:100%; padding:1rem 1.5rem; border-radius:12px; border:1px solid #e2e8f0; background:#f8fafc; font-family:'Inter',sans-serif; font-size:1rem; transition:all 0.3s; outline:none; }
    .form-control:focus { border-color:var(--primary); box-shadow:0 0 0 4px rgba(${primaryRgb},0.1); background:white; }

    /* Modal */
    .modal { display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(15,23,42,0.8); backdrop-filter:blur(5px); }

    /* Floating widgets */
    .float-widget { position:fixed; right:25px; width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 25px rgba(0,0,0,0.15); z-index:1000; transition:all 0.3s cubic-bezier(0.175,0.885,0.32,1.275); text-decoration:none; border:none; cursor:pointer; }
    .float-widget:hover { transform:scale(1.1) translateY(-5px); }
    .float-phone { bottom:30px; background:white; color:var(--primary); border:2px solid var(--primary); }
    .float-chatbot { bottom:90px; background:linear-gradient(135deg,var(--primary),var(--secondary)); color:white; }
    .float-whatsapp { bottom:150px; background:#25D366; color:white; }

    /* Chat window */
    .chat-window { position:fixed; bottom:85px; right:85px; width:350px; height:500px; background:white; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,0.15); z-index:998; display:flex; flex-direction:column; overflow:hidden; opacity:0; pointer-events:none; transform:translateY(20px); transition:0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
    .chat-window.open { opacity:1; pointer-events:all; transform:translateY(0); }

    /* Footer */
    footer { background:var(--text-main); color:white; padding:5rem 2rem 2rem; margin-top:4rem; }
    .footer-grid { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:2fr 1fr 1fr 1.5fr; gap:4rem; margin-bottom:4rem; }
    .footer-col h4 { font-size:1.25rem; font-weight:700; margin-bottom:1.5rem; color:white; }
    .footer-col ul { list-style:none; }
    .footer-col ul li { margin-bottom:0.75rem; }
    .footer-col ul li a { color:var(--text-light); text-decoration:none; transition:0.3s; }
    .footer-col ul li a:hover { color:white; padding-left:5px; }
    .footer-bottom { text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:2rem; color:var(--text-light); font-size:0.9rem; }

    /* Modals lÃ©gales */
    .legal-modal-content { background:#fff; margin:3% auto; padding:4rem; border-radius:32px; width:90%; max-width:1000px; max-height:90vh; overflow-y:auto; position:relative; box-shadow:0 40px 100px rgba(0,0,0,0.3); }
    .close-modal { position:absolute; right:2rem; top:2rem; color:#000; font-size:32px; font-weight:300; cursor:pointer; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#f1f5f9; border:none; }
    .close-modal:hover { background:var(--primary); color:white; }

    /* Responsive */
    @media (max-width: 900px) {
      .contact-grid { grid-template-columns:1fr; }
      .footer-grid { grid-template-columns:1fr 1fr; }
    }
    @media (max-width: 768px) {
      nav { top:40px; padding:0.5rem 0; }
      .nav-container { padding:0 1rem; }
      .btn-call { display:none !important; }
      .mobile-menu-toggle { display:block !important; }
      .hero-section { padding:9rem 1.5rem 3rem; }
      .container { padding:3rem 1.25rem; }
      .grid-3, .valeurs-grid, .process-grid { grid-template-columns:1fr; gap:1.25rem; }
      .card { padding:1.5rem; }
      .stats-banner { grid-template-columns:1fr 1fr; padding:2rem 1.25rem; }
      .stat-banner-item h3 { font-size:2rem; }
      .contact-form-side { padding:2rem 1.25rem; }
      .map-side iframe { min-height:250px; }
      .footer-grid { grid-template-columns:1fr; gap:1.5rem; }
      footer { padding:3rem 1.25rem 2rem; }
      .float-widget { right:15px; }
      .float-phone { bottom:20px; }
      .float-chatbot { bottom:75px; }
      .float-whatsapp { bottom:130px; }
      .chat-window { width:calc(100% - 30px); right:15px; bottom:85px; height:400px; }
      .top-marquee { font-size:0.7rem; padding:5px 0; }
    }
    @media (max-width: 480px) {
      .hero-section { padding:9rem 1rem 2rem; }
      .container { padding:3rem 1rem; }
      .stats-banner { grid-template-columns:1fr; }
      .btn-cta { padding:0.875rem 2rem; font-size:1rem; width:100%; justify-content:center; }
    }
  </style>
</head>
<body>

  <!-- Marquee -->
  <div class="top-marquee">
    <div class="marquee-content">
      <div class="marquee-item"><i data-lucide="clock" width="16"></i> Ouvert de 9h Ã  18h en semaine</div>
      ${phone ? `<div class="marquee-item"><i data-lucide="phone" width="16"></i> Intervention rapide : ${phone}</div>` : ''}
      ${email ? `<div class="marquee-item"><i data-lucide="mail" width="16"></i> ${email}</div>` : ''}
      <div class="marquee-item"><i data-lucide="map-pin" width="16"></i> ${city || address}</div>
      <div class="marquee-item"><i data-lucide="clock" width="16"></i> Ouvert de 9h Ã  18h en semaine</div>
      ${phone ? `<div class="marquee-item"><i data-lucide="phone" width="16"></i> Intervention rapide : ${phone}</div>` : ''}
      ${email ? `<div class="marquee-item"><i data-lucide="mail" width="16"></i> ${email}</div>` : ''}
      <div class="marquee-item"><i data-lucide="map-pin" width="16"></i> ${city || address}</div>
    </div>
  </div>

  <div class="bg-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>

  <!-- Navigation -->
  <nav id="navbar">
    <div class="nav-container">
      <a href="#" class="brand">
        <div class="logo-svg">${logoInfo.initials}</div>
        <div style="display:flex;flex-direction:column;justify-content:center;">
          <div style="font-weight:800;font-family:'Outfit';color:var(--text-main);font-size:1.5rem;line-height:1.1;">${logoInfo.text}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);font-weight:500;">${slogan}</div>
        </div>
      </a>
      <div style="display:flex;gap:1.5rem;align-items:center;">
        <div class="desktop-menu">
          <a href="#about">Ã€ propos</a>
          <a href="#valeurs">Garanties</a>
          <a href="#services">Services</a>
          <a href="#testimonials">Avis</a>
          <a href="#contact">Contact</a>
        </div>
        ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-call"><i data-lucide="phone" width="18"></i> Nous appeler</a>` : ''}
        <button class="mobile-menu-toggle" id="mobile-menu-toggle" style="background:none;border:none;cursor:pointer;padding:0.5rem;" aria-label="Menu">
          <i data-lucide="menu" width="28" height="28" style="color:var(--text-main);"></i>
        </button>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu">
      <a href="#about" class="mobile-menu-link">Ã€ propos</a>
      <a href="#valeurs" class="mobile-menu-link">Garanties</a>
      <a href="#services" class="mobile-menu-link">Services</a>
      <a href="#testimonials" class="mobile-menu-link">Avis</a>
      <a href="#contact" class="mobile-menu-link">Contact</a>
      ${phone ? `<a href="tel:${cleanPhoneLink}" class="mobile-menu-link mobile-call-link"><i data-lucide="phone" width="18" style="margin-right:8px;"></i> ${phone}</a>` : ''}
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero-section">
    <div style="position:relative;z-index:1;max-width:800px;margin:0 auto;" class="reveal active">
      <div class="hero-badge"><i data-lucide="${heroBadge.icon}" width="18"></i> ${heroBadge.text}</div>
      <h1 style="font-size:clamp(2.5rem,5vw,4.5rem);font-weight:800;line-height:1.1;letter-spacing:-0.04em;margin-bottom:0.5rem;color:var(--text-main);">
        ${logoInfo.word1} <span style="color:var(--primary);">${logoInfo.word2}</span>
      </h1>
      <h2 style="font-size:clamp(1.1rem,2.5vw,1.6rem);font-family:'Outfit';color:var(--text-main);font-weight:700;margin-bottom:1.5rem;opacity:0.8;">${slogan}</h2>
      <p style="margin-bottom:2.5rem;font-size:1.15rem;max-width:600px;margin-left:auto;margin-right:auto;color:var(--text-muted);">${heroSubtitle}</p>
      ${(rating && reviews) ? `
      <div style="display:flex;justify-content:center;align-items:center;gap:0.75rem;margin-bottom:2rem;flex-wrap:wrap;">
        <div style="display:flex;color:#f59e0b;gap:2px;">
          ${'<i data-lucide="star" fill="currentColor" width="20"></i>'.repeat(5)}
        </div>
        <span style="font-weight:700;color:var(--text-main);">${rating}/5</span>
        <span style="color:var(--text-muted);font-size:0.9rem;">(${reviews} avis Google)</span>
      </div>` : ''}
      <button onclick="document.getElementById('contact-modal').style.display='flex';document.body.style.overflow='hidden';" class="btn-cta" style="margin:0 auto;">
        ${ctaText} <i data-lucide="arrow-right"></i>
      </button>
    </div>
  </section>

  <!-- Ã€ propos -->
  <section class="container bg-alternate" id="about">
    <div class="section-header reveal"><h2>Un professionnel de confiance Ã  votre service</h2></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:4rem;align-items:center;">
      <div class="reveal reveal-left" style="position:relative;">
        <div style="position:absolute;top:-20px;left:-20px;width:100px;height:100px;background:radial-gradient(var(--primary) 2px,transparent 2px);background-size:10px 10px;z-index:0;opacity:0.2;"></div>
        <div style="position:absolute;bottom:-20px;right:-20px;border:4px solid var(--primary);width:80%;height:80%;border-radius:30px;z-index:0;opacity:0.1;"></div>
        <div style="position:relative;border-radius:30px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,0.1);z-index:1;border:8px solid white;">
          <img src="${getImg(0)}" alt="${companyName}" width="800" height="450" loading="lazy" decoding="async"
               style="${getImageStyle(getImg(0), '450px')}"
               onerror="this.onerror=null;this.style.objectFit='contain';this.style.padding='2rem';this.style.background='#f8fafc';">
        </div>
      </div>
      <div class="reveal reveal-right">
        <h2 style="font-size:clamp(2rem,3.5vw,3rem);font-weight:800;margin-bottom:1.5rem;font-family:'Outfit';">Qui sommes-nous ?</h2>
        <p style="color:var(--text-muted);font-size:1.125rem;line-height:1.8;margin-bottom:2.5rem;">${aboutText}</p>
        <ul style="list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:2rem;">
          <li style="display:flex;align-items:center;gap:0.5rem;font-weight:600;"><i data-lucide="check-circle-2" style="color:var(--primary);"></i> Expertise reconnue</li>
          <li style="display:flex;align-items:center;gap:0.5rem;font-weight:600;"><i data-lucide="check-circle-2" style="color:#10b981;"></i> Solutions sur-mesure</li>
          <li style="display:flex;align-items:center;gap:0.5rem;font-weight:600;"><i data-lucide="check-circle-2" style="color:#f59e0b;"></i> Accompagnement total</li>
          <li style="display:flex;align-items:center;gap:0.5rem;font-weight:600;"><i data-lucide="check-circle-2" style="color:#8b5cf6;"></i> RÃ©activitÃ© garantie</li>
        </ul>
        <button onclick="document.getElementById('contact-modal').style.display='flex';document.body.style.overflow='hidden';" class="btn-cta" style="border:none;">
          ${ctaText} <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </div>
  </section>

  <!-- Garanties -->
  <section class="container" id="valeurs">
    <div class="section-header reveal"><h2>Nos garanties</h2><p>Les engagements qui font la diffÃ©rence et votre tranquillitÃ© d'esprit.</p></div>
    <div class="valeurs-grid">
      ${template.guarantees.map((g: any, i: number) => `
      <div class="valeur-card reveal" style="transition-delay:${i * 100}ms;">
        <div class="valeur-icon"><i data-lucide="${g.icon}" width="32" height="32"></i></div>
        <h3 style="font-family:'Outfit';font-size:1.35rem;margin-bottom:1rem;">${g.title}</h3>
        <p style="color:var(--text-muted);font-size:0.95rem;">Un engagement pris pour votre satisfaction et votre sÃ©curitÃ©.</p>
      </div>`).join('')}
    </div>
  </section>

  <!-- Stats -->
  <section class="container" style="padding-top:2rem;padding-bottom:2rem;">
    <div class="stats-banner reveal">
      <div class="stat-banner-item"><h3>${reviews > 0 ? reviews + '+' : '100%'}</h3><div style="font-weight:500;opacity:0.9;">Avis VÃ©rifiÃ©s</div></div>
      <div class="stat-banner-item"><h3>24/7</h3><div style="font-weight:500;opacity:0.9;">DisponibilitÃ©</div></div>
      <div class="stat-banner-item"><h3>${rating}/5</h3><div style="font-weight:500;opacity:0.9;">Note Google</div></div>
      <div class="stat-banner-item"><h3>100%</h3><div style="font-weight:500;opacity:0.9;">Satisfaction</div></div>
    </div>
  </section>

  <!-- Process -->
  <section class="container" id="process">
    <div class="section-header reveal"><h2>Notre dÃ©marche en 4 Ã©tapes</h2><p>Une mÃ©thodologie claire et transparente pour garantir le succÃ¨s de votre projet.</p></div>
    <div class="process-grid reveal">
      ${['Prise de contact','Devis dÃ©taillÃ©','Intervention','Suivi qualitÃ©'].map((step, i) => `
      <div class="step-card">
        <div class="step-number">${i + 1}</div>
        <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:1rem;font-family:'Outfit';">${step}</h3>
        <p style="color:var(--text-muted);font-size:0.95rem;">${['Nous Ã©tudions ensemble votre besoin et dÃ©finissons les prioritÃ©s.','Un chiffrage prÃ©cis et transparent, sans aucun frais cachÃ©.','RÃ©alisation de la prestation par nos experts qualifiÃ©s.','Nous nous assurons de votre entiÃ¨re satisfaction aprÃ¨s livraison.'][i]}</p>
      </div>`).join('')}
    </div>
  </section>

  <!-- Services -->
  <section class="container bg-alternate" id="services">
    <div class="section-header reveal"><h2>Nos Services et Interventions</h2><p>Des prestations de qualitÃ©, rÃ©alisÃ©es dans le respect des normes et des dÃ©lais.</p></div>
    <div class="grid-3">
      ${services.map((s, i) => `
      <div class="card glass reveal" style="transition-delay:${i * 100}ms;">
        <div class="card-icon" style="background:white;border:1px solid rgba(0,0,0,0.05);box-shadow:0 10px 20px rgba(0,0,0,0.05);">
          <i data-lucide="${['zap','wrench','home','shield-check','settings','check-circle'][i % 6]}" width="40" height="40" style="color:var(--primary);"></i>
        </div>
        <h3 style="font-family:'Outfit';font-size:1.25rem;font-weight:700;margin-bottom:1rem;color:var(--text-main);">${s.name}</h3>
        <p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:1.5rem;">${s.description}</p>
        <ul style="list-style:none;padding:0;">
          ${s.features.map(f => `<li style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;font-size:0.9rem;color:var(--text-muted);"><i data-lucide="check-circle-2" style="color:var(--primary);flex-shrink:0;"></i> ${f}</li>`).join('')}
        </ul>
      </div>`).join('')}
    </div>
  </section>

  <!-- TÃ©moignages â€” âœ… Vrais avis uniquement -->
  ${buildTestimonialsHTML(lead, rating, reviews)}

  <!-- Contact -->
  <section class="container bg-alternate" id="contact">
    <div class="section-header reveal"><h2>Passez Ã  l'action dÃ¨s aujourd'hui</h2><p>Notre Ã©quipe est prÃªte Ã  intervenir. Contactez-nous pour un diagnostic rapide.</p></div>
    <div class="contact-grid reveal">
      <div class="map-side">
        <iframe src="https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <div class="contact-form-side">
        <h3 style="font-size:2rem;font-family:'Outfit';margin-bottom:0.5rem;">Envoyez-nous un message</h3>
        <p style="color:var(--text-muted);margin-bottom:2rem;font-size:0.95rem;">RÃ©ponse garantie sous 24h.</p>
        <div id="form-wrapper">
          <form id="contact-form" action="${formsubmitEndpoint}" method="POST">
            <input type="hidden" name="_subject" value="ðŸ’¬ Nouveau message depuis votre site â€” ${companyName}">
            <input type="hidden" name="_captcha" value="false">
            <input type="hidden" name="_template" value="table">
            <input type="hidden" name="_next" value="about:blank">
            <div class="form-group"><input type="text" name="Nom" class="form-control" placeholder="Votre nom complet" required></div>
            <div class="form-group"><input type="email" name="Email" class="form-control" placeholder="Votre adresse e-mail" required></div>
            <div class="form-group"><input type="tel" name="TÃ©lÃ©phone" class="form-control" placeholder="Votre tÃ©lÃ©phone"></div>
            <div class="form-group"><textarea name="Message" class="form-control" rows="4" placeholder="DÃ©taillez votre besoin..." required></textarea></div>
            <button type="submit" id="form-submit-btn" class="btn-cta" style="width:100%;justify-content:center;border:none;">
              <i data-lucide="send"></i> <span id="btn-text">Envoyer la demande</span>
            </button>
            <p style="text-align:center;margin-top:1rem;font-size:0.85rem;color:var(--text-muted);">ðŸ”’ DonnÃ©es protÃ©gÃ©es et confidentielles.</p>
          </form>
        </div>
        <div id="form-success" style="display:none;text-align:center;padding:3rem 1rem;">
          <div style="width:80px;height:80px;border-radius:50%;background:rgba(16,185,129,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
            <i data-lucide="check-circle-2" width="40" height="40" style="color:#10b981;"></i>
          </div>
          <h4 style="font-size:1.5rem;font-family:'Outfit';margin-bottom:0.75rem;">Message envoyÃ© !</h4>
          <p style="color:var(--text-muted);margin-bottom:1.5rem;">Nous avons bien reÃ§u votre demande et vous rÃ©pondrons trÃ¨s vite.</p>
          ${phone ? `<a href="tel:${cleanPhoneLink}" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.5rem;background:var(--primary);color:white;border-radius:12px;text-decoration:none;font-weight:700;"><i data-lucide="phone" width="18"></i> ${phone}</a>` : ''}
        </div>
      </div>
    </div>
  </section>

  <!-- Modal Contact â€” âœ… Formsubmit.co -->
  <div id="contact-modal" class="modal" style="display:none;align-items:center;justify-content:center;">
    <div style="background:white;padding:3rem;border-radius:24px;width:90%;max-width:500px;position:relative;box-shadow:0 25px 50px rgba(0,0,0,0.2);">
      <button onclick="closeContactModal()" style="position:absolute;right:1.5rem;top:1.5rem;background:#f1f5f9;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1.5rem;display:flex;align-items:center;justify-content:center;color:#64748b;">Ã—</button>
      <div id="modal-form-wrapper">
        <h3 style="font-size:1.5rem;font-weight:700;color:var(--text-main);margin-bottom:0.5rem;text-align:center;">Demander une intervention</h3>
        <p style="color:var(--text-muted);text-align:center;margin-bottom:2rem;font-size:0.95rem;">Laissez vos coordonnÃ©es, nous vous rÃ©pondons rapidement.</p>
        <form id="modal-form" action="${formsubmitEndpoint}" method="POST">
          <input type="hidden" name="_subject" value="ðŸš€ Demande d'intervention â€” ${companyName}">
          <input type="hidden" name="_captcha" value="false">
          <input type="hidden" name="_template" value="table">
          <input type="hidden" name="_next" value="about:blank">
          <div style="margin-bottom:1rem;"><input type="text" name="Nom" placeholder="Votre nom" required style="width:100%;padding:1rem;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;outline:none;font-family:'Inter';font-size:1rem;"></div>
          <div style="margin-bottom:1rem;"><input type="tel" name="TÃ©lÃ©phone" placeholder="Votre numÃ©ro de tÃ©lÃ©phone" required style="width:100%;padding:1rem;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;outline:none;font-family:'Inter';font-size:1rem;"></div>
          <div style="margin-bottom:1.5rem;"><textarea name="Message" placeholder="Votre besoin en quelques mots (optionnel)" rows="3" style="width:100%;padding:1rem;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;outline:none;font-family:'Inter';font-size:1rem;resize:none;"></textarea></div>
          <button type="submit" id="modal-submit-btn" style="width:100%;padding:1rem;background:var(--primary);color:white;border:none;border-radius:12px;font-weight:700;font-size:1rem;cursor:pointer;display:flex;justify-content:center;align-items:center;gap:8px;">
            <i data-lucide="phone-call" width="20"></i> <span id="modal-btn-text">Envoyer ma demande</span>
          </button>
        </form>
      </div>
      <div id="modal-success" style="display:none;text-align:center;padding:2rem 1rem;">
        <div style="width:70px;height:70px;border-radius:50%;background:rgba(16,185,129,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
          <i data-lucide="check-circle-2" width="36" height="36" style="color:#10b981;"></i>
        </div>
        <h4 style="font-size:1.4rem;font-family:'Outfit';margin-bottom:0.75rem;">Demande envoyÃ©e !</h4>
        <p style="color:var(--text-muted);margin-bottom:1.5rem;">Nous vous contacterons trÃ¨s rapidement.</p>
        ${phone ? `<a href="tel:${cleanPhoneLink}" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.5rem;background:var(--primary);color:white;border-radius:12px;text-decoration:none;font-weight:700;"><i data-lucide="phone" width="18"></i> ${phone}</a>` : ''}
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer>
    <div class="footer-grid">
      <div class="footer-col">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
          <div class="logo-svg" style="box-shadow:none;">${logoInfo.initials}</div>
          <span style="font-size:1.75rem;font-family:'Outfit';font-weight:800;">${logoInfo.text}</span>
        </div>
        <p style="color:var(--text-light);margin-bottom:2rem;">${aboutText.substring(0, 120)}...</p>
        <div style="display:flex;gap:1rem;">
          <a href="#" style="color:white;opacity:0.7;transition:0.3s;"><i data-lucide="facebook"></i></a>
          <a href="#" style="color:white;opacity:0.7;transition:0.3s;"><i data-lucide="instagram"></i></a>
          <a href="#" style="color:white;opacity:0.7;transition:0.3s;"><i data-lucide="linkedin"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Nos Services</h4>
        <ul>${services.slice(0, 4).map(s => `<li><a href="#services">${s.name}</a></li>`).join('')}</ul>
      </div>
      <div class="footer-col">
        <h4>Liens Utiles</h4>
        <ul>
          <li><a href="#process">Notre DÃ©marche</a></li>
          <li><a href="#testimonials">Avis Clients</a></li>
          <li><a href="javascript:void(0)" onclick="openLegalModal('modal-mentions')">Mentions LÃ©gales</a></li>
          <li><a href="javascript:void(0)" onclick="openLegalModal('modal-policy')">ConfidentialitÃ©</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <ul style="color:var(--text-light);">
          ${phone ? `<li style="display:flex;gap:10px;margin-bottom:0.75rem;"><i data-lucide="phone" width="18" style="flex-shrink:0;"></i> ${phone}</li>` : ''}
          ${email ? `<li style="display:flex;gap:10px;margin-bottom:0.75rem;"><i data-lucide="mail" width="18" style="flex-shrink:0;"></i> ${email}</li>` : ''}
          ${address ? `<li style="display:flex;gap:10px;"><i data-lucide="map-pin" width="18" style="flex-shrink:0;"></i> ${address}</li>` : ''}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>Â© ${new Date().getFullYear()} ${companyName}. Tous droits rÃ©servÃ©s.</p>
    </div>
  </footer>

  <!-- Boutons flottants -->
  ${phone ? `<a href="tel:${cleanPhoneLink}" class="float-widget float-phone" title="Appeler"><i data-lucide="phone"></i></a>` : ''}
  <button id="chatbot-toggle" class="float-widget float-chatbot" title="Chat"><i data-lucide="message-circle"></i></button>
  ${whatsappNumber ? `<a href="https://wa.me/${whatsappNumber}?text=Bonjour, je souhaite avoir plus d'informations." target="_blank" rel="noopener" class="float-widget float-whatsapp" title="WhatsApp"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg></a>` : ''}

  <!-- Chatbot -->
  <div class="chat-window" id="chat-window">
    <div style="background:linear-gradient(135deg,var(--primary),var(--secondary));color:white;padding:1.25rem;font-family:'Outfit';font-weight:700;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:12px;height:12px;background:#22c55e;border-radius:50%;box-shadow:0 0 10px rgba(34,197,94,0.5);"></div>
        Service Client â€” ${logoInfo.word1}
      </div>
      <button onclick="document.getElementById('chat-window').classList.remove('open')" style="background:none;border:none;color:white;cursor:pointer;display:flex;align-items:center;"><i data-lucide="x" width="24"></i></button>
    </div>
    <div id="chat-body" style="flex:1;padding:1.5rem;overflow-y:auto;background:#f8fafc;display:flex;flex-direction:column;gap:0.5rem;">
      <div style="background:white;padding:1rem;border-radius:12px;border-bottom-left-radius:0;box-shadow:0 2px 10px rgba(0,0,0,0.05);font-size:0.95rem;align-self:flex-start;max-width:85%;">
        Bonjour ! Bienvenue chez ${logoInfo.text}. Comment puis-je vous aider aujourd'hui ? ðŸ˜Š
      </div>
    </div>
    <div style="padding:1rem;background:white;border-top:1px solid #e2e8f0;display:flex;gap:10px;">
      <input type="text" id="chat-text" placeholder="Ã‰crivez votre message..." style="flex:1;border:1px solid #e2e8f0;outline:none;background:#f8fafc;padding:0.75rem 1rem;border-radius:100px;font-family:'Inter';">
      <button id="chat-send-btn" onclick="sendMsg()" style="background:var(--primary);border:none;color:white;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;"><i data-lucide="send" width="18"></i></button>
    </div>
  </div>

  <!-- Modals lÃ©gaux -->
  <div id="modal-mentions" class="modal">
    <div class="legal-modal-content">
      <button class="close-modal" onclick="closeLegalModal('modal-mentions')">Ã—</button>
      <h2 style="font-family:'Outfit';font-weight:800;color:var(--text-main);font-size:2.5rem;margin-bottom:2rem;">Mentions LÃ©gales</h2>
      <p>Le prÃ©sent site est Ã©ditÃ© par <strong>${companyName}</strong>, situÃ© au <strong>${address}</strong>.</p>
      <h3 style="margin-top:2rem;margin-bottom:1rem;font-family:'Outfit';">HÃ©bergement</h3>
      <p>Le site est hÃ©bergÃ© par Vercel Inc., 340 S Lemon Ave #4133 Walnut, CA 91789, USA.</p>
      <h3 style="margin-top:2rem;margin-bottom:1rem;font-family:'Outfit';">Contact</h3>
      <p>${phone ? 'TÃ©lÃ©phone : <strong>' + phone + '</strong><br>' : ''}${email ? 'Email : <strong>' + email + '</strong>' : ''}</p>
    </div>
  </div>
  <div id="modal-policy" class="modal">
    <div class="legal-modal-content">
      <button class="close-modal" onclick="closeLegalModal('modal-policy')">Ã—</button>
      <h2 style="font-family:'Outfit';font-weight:800;color:var(--text-main);font-size:2.5rem;margin-bottom:2rem;">Politique de ConfidentialitÃ©</h2>
      <p>Chez <strong>${companyName}</strong>, nous accordons une importance capitale Ã  la protection de vos donnÃ©es personnelles.</p>
      <h3 style="margin-top:2rem;margin-bottom:1rem;font-family:'Outfit';">Collecte des donnÃ©es</h3>
      <p>Nous collectons uniquement les donnÃ©es soumises via nos formulaires : nom, tÃ©lÃ©phone, email. Ces donnÃ©es sont utilisÃ©es pour rÃ©pondre Ã  vos demandes et ne sont jamais cÃ©dÃ©es Ã  des tiers.</p>
      <h3 style="margin-top:2rem;margin-bottom:1rem;font-family:'Outfit';">Vos droits (RGPD)</h3>
      <p>Vous disposez d'un droit d'accÃ¨s, de rectification et de suppression. Pour l'exercer : ${email ? '<strong>' + email + '</strong>' : 'contactez-nous'}</p>
    </div>
  </div>

  <script>
    // â”€â”€ Init Lucide Icons â”€â”€
    lucide.createIcons();

    // â”€â”€ Navbar scroll â”€â”€
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
    });

    // â”€â”€ Mobile menu â”€â”€
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
      mobileMenu.querySelectorAll('.mobile-menu-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.remove('open')));
      document.addEventListener('click', e => { if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) mobileMenu.classList.remove('open'); });
    }

    // â”€â”€ Reveal animations â”€â”€
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); observer.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // â”€â”€ Chatbot â”€â”€
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-text');
    let chatStep = 0, collectedName = '', collectedPhone = '', chatHistory = [];

    chatToggle.addEventListener('click', () => chatWindow.classList.toggle('open'));

    function addBotMsg(html) {
      const d = document.createElement('div');
      d.style.cssText = 'background:white;padding:1rem;border-radius:12px;border-bottom-left-radius:0;box-shadow:0 2px 10px rgba(0,0,0,0.05);font-size:0.95rem;align-self:flex-start;max-width:85%;line-height:1.5;';
      d.innerHTML = html;
      chatBody.appendChild(d);
      chatBody.scrollTo(0, chatBody.scrollHeight);
    }

    function addUserMsg(text) {
      const d = document.createElement('div');
      d.style.cssText = 'background:var(--primary);color:white;padding:1rem;border-radius:12px;border-bottom-right-radius:0;align-self:flex-end;max-width:85%;font-size:0.95rem;';
      d.textContent = text;
      chatBody.appendChild(d);
      chatBody.scrollTo(0, chatBody.scrollHeight);
      chatHistory.push(text);
    }

    async function notifyLead() {
      if (!${email ? `'${email}'` : 'null'}) return;
      try {
        const fd = new FormData();
        fd.append('Nom', collectedName || 'Non prÃ©cisÃ©');
        fd.append('TÃ©lÃ©phone', collectedPhone);
        fd.append('Source', 'Chatbot site dÃ©mo');
        fd.append('Entreprise', '${companyName}');
        fd.append('_subject', 'ðŸ“± Lead chatbot â€” ${companyName}');
        fd.append('_captcha', 'false');
        fd.append('_template', 'table');
        fd.append('_next', 'about:blank');
        await fetch('${formsubmitEndpoint}', { method:'POST', body:fd, mode:'no-cors' });
      } catch(e) { console.warn('Envoi chatbot silencieux:', e); }
    }

    function sendMsg() {
      const val = chatInput.value.trim();
      if (!val) return;
      addUserMsg(val);
      chatInput.value = '';
      const lower = val.toLowerCase();
      setTimeout(() => {
        if (chatStep === 0) {
          const salut = ['bonjour','salut','bonsoir','hello','coucou','slt','bjr'].includes(lower);
          if (salut) { addBotMsg("Bonjour ! ðŸ˜Š Comment puis-je vous aider concrÃ¨tement aujourd'hui ?"); }
          else { addBotMsg("Bien reÃ§u ! Pour mieux vous aider, puis-je avoir votre <strong>prÃ©nom</strong> ?"); chatStep++; }
        } else if (chatStep === 1) {
          collectedName = val;
          addBotMsg("Merci <strong>" + collectedName + "</strong> ! ðŸ‘‹ Quel est votre <strong>numÃ©ro de tÃ©lÃ©phone</strong> pour qu'on vous rappelle ?");
          chatStep++;
        } else if (chatStep === 2) {
          const digits = (val.match(/[0-9]/g) || []).length;
          if (digits >= 8) {
            collectedPhone = val; chatStep++;
            addBotMsg("Parfait ! âœ… Un expert va vous rappeler trÃ¨s prochainement. Merci de votre confiance !");
            chatInput.disabled = true;
            chatInput.placeholder = 'Conversation terminÃ©e.';
            document.getElementById('chat-send-btn').disabled = true;
            notifyLead();
          } else {
            addBotMsg("Je n'ai pas reconnu ce numÃ©ro. Pouvez-vous le rÃ©-Ã©crire ? <br><span style='font-size:0.85rem;color:#9ca3af;'>Exemple : 06 12 34 56 78</span>");
          }
        }
      }, 800 + Math.random() * 600);
    }
    chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(); });

    // â”€â”€ Formulaire principal â”€â”€
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('form-submit-btn');
        const txt = document.getElementById('btn-text');
        btn.disabled = true; txt.textContent = 'Envoi en cours...';
        try {
          await fetch(contactForm.action, { method:'POST', body:new FormData(contactForm), mode:'no-cors' });
        } catch(err) {}
        document.getElementById('form-wrapper').style.display = 'none';
        document.getElementById('form-success').style.display = 'block';
        lucide.createIcons();
      });
    }

    // â”€â”€ Modal formulaire â”€â”€
    const modalForm = document.getElementById('modal-form');
    if (modalForm) {
      modalForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.getElementById('modal-submit-btn');
        const txt = document.getElementById('modal-btn-text');
        btn.disabled = true; txt.textContent = 'Envoi en cours...';
        try {
          await fetch(modalForm.action, { method:'POST', body:new FormData(modalForm), mode:'no-cors' });
        } catch(err) {}
        document.getElementById('modal-form-wrapper').style.display = 'none';
        document.getElementById('modal-success').style.display = 'block';
        lucide.createIcons();
      });
    }

    // â”€â”€ Modal helpers â”€â”€
    function closeContactModal() {
      document.getElementById('contact-modal').style.display = 'none';
      document.body.style.overflow = 'auto';
    }
    window.closeContactModal = closeContactModal;
    window.addEventListener('click', e => { if (e.target === document.getElementById('contact-modal')) closeContactModal(); });

    function openLegalModal(id) { document.getElementById(id).style.display = 'flex'; document.body.style.overflow = 'hidden'; }
    function closeLegalModal(id) { document.getElementById(id).style.display = 'none'; document.body.style.overflow = 'auto'; }
    window.openLegalModal = openLegalModal; window.closeLegalModal = closeLegalModal;
    document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) { m.style.display = 'none'; document.body.style.overflow = 'auto'; } }));

    // â”€â”€ LAZY LOADING AMÃ‰LIORÃ‰ POUR IMAGES â”€â”€
    class LazyImageLoader {
      constructor() {
        this.imageObserver = null;
        this.loadedImages = new Set();
        this.init();
      }

      init() {
        if ('IntersectionObserver' in window) {
          this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.imageObserver.unobserve(entry.target);
              }
            });
          }, {
            rootMargin: '50px 0px',
            threshold: 0.1
          });
        }
        this.observeImages();
      }

      observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
          if (this.imageObserver) {
            this.imageObserver.observe(img);
          } else {
            // Fallback pour vieux navigateurs
            this.loadImage(img);
          }
        });
      }

      loadImage(img) {
        if (this.loadedImages.has(img)) return;
        
        const src = img.dataset.src;
        if (!src) return;

        // Ajouter un loading state
        img.style.opacity = '0.7';
        img.style.transition = 'opacity 0.3s ease';

        // CrÃ©er une nouvelle image pour prÃ©charger
        const tempImg = new Image();
        tempImg.onload = () => {
          img.src = src;
          img.removeAttribute('data-src');
          img.style.opacity = '1';
          this.loadedImages.add(img);
          
          // Ajouter l'attribut loading="lazy" pour les futures images
          img.setAttribute('loading', 'lazy');
        };
        
        tempImg.onerror = () => {
          // Fallback en cas d'erreur
          img.style.opacity = '1';
          img.style.objectFit = 'contain';
          img.style.padding = '2rem';
          img.style.background = '#f8fafc';
          img.alt = 'Image non disponible';
        };
        
        tempImg.src = src;
      }

      // PrÃ©charger les images proches
      preloadNearbyImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach((img, index) => {
          if (index < 3) { // PrÃ©charger les 3 premiÃ¨res images
            this.loadImage(img);
          }
        });
      }
    }

    // Initialiser le lazy loading
    const lazyLoader = new LazyImageLoader();
    
    // PrÃ©charger les images hero immÃ©diatement
    setTimeout(() => {
      lazyLoader.preloadNearbyImages();
    }, 1000);

    // â”€â”€ Auto-popup Ã  60% de scroll (une seule fois par session) â”€â”€
    let popupDone = false;
    window.addEventListener('scroll', function() {
      if (popupDone || sessionStorage.getItem('popupShown')) return;
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (pct > 60) {
        popupDone = true;
        document.getElementById('contact-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        sessionStorage.setItem('popupShown', 'true');
      }
    });
  </script>
</body>
</html>    < / h t m l > \ ;  
 








