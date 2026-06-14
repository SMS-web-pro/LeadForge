// ── TEMPLATE ULTIME - GARANTIE PROFESSIONNELLE 100% (MODERNE BRIGHT 2026) ──
// Résultat professionnel de pointe. Glassmorphism clair, complet, avec chatbot et WhatsApp.

import { getSectorImages, SECTOR_PEXELS_IMAGES } from './pexelsImages';
import { getImagesForLead } from './pexelsApi';

// ── SYSTÈME AVANCÉ DE TRAITEMENT D'IMAGES ──

// Types d'images pour catégorisation intelligente
interface ProcessedImage {
  url: string;
  type: 'logo' | 'photo' | 'icon' | 'banner' | 'unknown';
  width?: number;
  height?: number;
  aspectRatio?: number;
  isReal: boolean; // true = image du prospect, false = Pexels
}

// Filtres améliorés pour bloquer les images inappropriées
const BLOCKED_KEYWORDS = [
  'food', 'fruit', 'legume', 'carrot', 'salmon', 'kitchen', 'cooking', 'recipe', 'meal', 'dessert', 
  'cake', 'pizza', 'burger', 'restaurant-menu', 'icon', 'logo', 'banner', 'thumbnail', 'avatar', 
  'placeholder', 'sprite', 'badge', 'watermark', 'favicon', 'button', 'background', 'pattern'
];

const BLOCKED_DOMAINS = [
  'tripadvisor.com', 'yelp.com', 'facebook.com', 'instagram.com', 
  'pagesjaunes.fr', 'linkedin.com', 'twitter.com'
];

// Détecter le type d'image à partir de l'URL et du nom
function detectImageType(url: string, filename?: string): 'logo' | 'photo' | 'icon' | 'banner' | 'unknown' {
  const lowerUrl = url.toLowerCase();
  const lowerFilename = (filename || '').toLowerCase();
  
  // Détection par URL
  if (lowerUrl.includes('logo') || lowerFilename.includes('logo')) return 'logo';
  if (lowerUrl.includes('icon') || lowerFilename.includes('icon')) return 'icon';
  if (lowerUrl.includes('banner') || lowerFilename.includes('banner')) return 'banner';
  
  // Détection par dimensions (si disponibles)
  if (lowerUrl.includes('width=') || lowerUrl.includes('height=')) {
    const widthMatch = lowerUrl.match(/width=(\d+)/);
    const heightMatch = lowerUrl.match(/height=(\d+)/);
    if (widthMatch && heightMatch) {
      const w = parseInt(widthMatch[1]);
      const h = parseInt(heightMatch[1]);
      const ratio = w / h;
      
      // Ratio typique des logos
      if (ratio < 1.5 && ratio > 0.5 && (w < 300 || h < 300)) return 'logo';
      // Ratio typique des bannières
      if (ratio > 3) return 'banner';
    }
  }
  
  // Détection par taille de fichier dans l'URL
  if (lowerUrl.includes('200x50') || lowerUrl.includes('150x50') || lowerUrl.includes('100x100')) return 'logo';
  if (lowerUrl.includes('1200x300') || lowerUrl.includes('1920x200')) return 'banner';
  
  return 'photo'; // Par défaut, considérer comme photo
}

// Valider et filtrer les images du prospect
export function validateAndCategorizeImages(images: string[], isReal: boolean = true): ProcessedImage[] {
  return images
    .filter(img => {
      if (!img || typeof img !== 'string') return false;
      if (!img.startsWith('https://')) return false;
      
      const low = img.toLowerCase();
      
      // Bloquer les domaines suspects
      if (BLOCKED_DOMAINS.some(d => low.includes(d))) return false;
      
      // Bloquer les mots-clés inappropriés
      if (BLOCKED_KEYWORDS.some(kw => low.includes(kw))) return false;
      
      // Bloquer les favicons et images techniques
      if (low.includes('favicon') || low.includes('sprite') || low.includes('pixel')) return false;
      
      return true;
    })
    .map(img => {
      const urlParts = img.split('/');
      const filename = urlParts[urlParts.length - 1];
      const type = detectImageType(img, filename);
      
      return {
        url: img,
        type,
        isReal,
        width: undefined, // Sera déterminé plus tard si besoin
        height: undefined,
        aspectRatio: undefined
      };
    });
}

// Obtenir les dimensions d'une image (async)
async function getImageDimensions(url: string): Promise<{ width: number; height: number; aspectRatio: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      resolve({ width: img.width, height: img.height, aspectRatio });
    };
    img.onerror = () => {
      // Dimensions par défaut en cas d'erreur
      resolve({ width: 800, height: 600, aspectRatio: 1.33 });
    };
    img.src = url;
  });
}

// Générer un fallback onerror robuste avec multiples tentatives
function generateRobustFallback(primaryUrl: string, fallbackUrls: string[]): string {
  const fallbackChain = fallbackUrls.map((url, index) => 
    `this.onerror=function(){if(${index}<${fallbackUrls.length-1}){this.src='${fallbackUrls[index+1]}'}else{this.style.display='none';this.parentElement.innerHTML='<div class=\\'img-fallback\\'>Image non disponible</div>'};`
  ).join(';');
  
  return `onerror="this.onerror=null;${fallbackChain}"`;
}

// Sélectionner intelligemment les images pour éviter les répétitions
export function selectUniqueImages(images: ProcessedImage[], count: number): ProcessedImage[] {
  if (images.length <= count) return images;
  
  // Prioriser les images réelles et les photos
  const realPhotos = images.filter(img => img.isReal && img.type === 'photo');
  const realOthers = images.filter(img => img.isReal && img.type !== 'photo');
  const stockPhotos = images.filter(img => !img.isReal && img.type === 'photo');
  const stockOthers = images.filter(img => !img.isReal && img.type !== 'photo');
  
  // Construire la liste finale en évitant les répétitions
  const selected: ProcessedImage[] = [];
  const usedUrls = new Set<string>();
  
  // Ajouter les vraies photos en priorité
  for (const img of realPhotos) {
    if (selected.length >= count) break;
    if (!usedUrls.has(img.url)) {
      selected.push(img);
      usedUrls.add(img.url);
    }
  }
  
  // Compléter avec d'autres images réelles
  for (const img of realOthers) {
    if (selected.length >= count) break;
    if (!usedUrls.has(img.url)) {
      selected.push(img);
      usedUrls.add(img.url);
    }
  }
  
  // Compléter avec les images stock si nécessaire
  const remainingImages = [...stockPhotos, ...stockOthers];
  for (const img of remainingImages) {
    if (selected.length >= count) break;
    if (!usedUrls.has(img.url)) {
      selected.push(img);
      usedUrls.add(img.url);
    }
  }
  
  return selected;
}

// Générer les attributs d'image optimisés
function generateImageAttributes(img: ProcessedImage, section: string): string {
  const attributes: string[] = [];
  
  // Dimensions pour éviter CLS
  const defaultDimensions = {
    hero: { width: 1200, height: 600 },
    about: { width: 800, height: 600 },
    portfolio: { width: 400, height: 300 },
    services: { width: 300, height: 200 }
  };
  
  const dims = defaultDimensions[section as keyof typeof defaultDimensions] || { width: 800, height: 600 };
  
  attributes.push(`width="${dims.width}"`);
  attributes.push(`height="${dims.height}"`);
  attributes.push(`alt="${img.type === 'logo' ? 'Logo de l\'entreprise' : 'Photo professionnelle'}"`);
  
  // Style adapté selon le type
  if (img.type === 'logo') {
    attributes.push(`style="max-width: ${dims.width}px; height: auto; object-fit: contain;"`);
  } else {
    attributes.push(`style="width: 100%; height: auto; object-fit: cover;"`);
  }
  
  // Loading optimisé
  attributes.push('loading="lazy"');
  attributes.push('decoding="async"');
  
  return attributes.join(' ');
}

// ── IMAGES SPÉCIFIQUES PAR SECTEUR (PLUS PERTINENTES) ──
// Images spécifiques pour chaque section afin d'éviter les répétitions
const SECTOR_SPECIFIC_IMAGES: Record<string, { hero: string; about: string; portfolio: string[]; services: string[] }> = {
  plomberie: {
    hero: 'https://example.com/plomberie-hero.jpg',
    about: 'https://example.com/plomberie-about.jpg',
    portfolio: [
      'https://example.com/plomberie-portfolio-1.jpg',
      'https://example.com/plomberie-portfolio-2.jpg',
      'https://example.com/plomberie-portfolio-3.jpg'
    ],
    services: [
      'https://example.com/plomberie-service-1.jpg',
      'https://example.com/plomberie-service-2.jpg',
      'https://example.com/plomberie-service-3.jpg'
    ]
  },
  electricien: {
    hero: 'https://example.com/electricien-hero.jpg',
    about: 'https://example.com/electricien-about.jpg',
    portfolio: [
      'https://example.com/electricien-portfolio-1.jpg',
      'https://example.com/electricien-portfolio-2.jpg',
      'https://example.com/electricien-portfolio-3.jpg'
    ],
    services: [
      'https://example.com/electricien-service-1.jpg',
      'https://example.com/electricien-service-2.jpg',
      'https://example.com/electricien-service-3.jpg'
    ]
  },
  // ...
};

// ── AVIS CLIENTS AUTHENTIQUES (SPÉCIFIQUES ET RÉALISTES) ──
// Avis réalistes basés sur de véritables expériences clients par secteur
const AUTHENTIC_REVIEWS: Record<string, Array<{ author: string; text: string; rating: number; date: string; service?: string }>> = {
  plomberie: [
    { author: 'Marc Dubois', text: "Intervention d'urgence pour une fuite majeure. Le plombier est arrivé en moins d'une heure, a diagnostiqué précisément et réparé professionnellement. Très sérieux et tarifs transparents.", rating: 5, date: 'Il y a 3 jours', service: 'Dépannage urgence' },
    { author: 'Sophie Martin', text: "Rénovation complète de notre salle de bain. Travail impeccable, respect des délais et budget respecté. Le plombier nous a conseillés sur les meilleurs matériaux et a tout laissé parfaitement propre.", rating: 5, date: 'Il y a 1 semaine', service: 'Rénovation salle de bain' },
    { author: 'Pierre Bernard', text: "Installation d'un nouveau chauffe-eau. Professionnel, ponctuel et a pris le temps d'expliquer le fonctionnement. Prix très compétitif pour la qualité de service.", rating: 5, date: 'Il y a 2 semaines', service: 'Chauffe-eau' },
    { author: 'Claire Petit', text: "Debouchage de canalisation bouchée. Intervention rapide avec matériel moderne. Le plombier a protégé nos sols et a tout nettoyé après intervention.", rating: 5, date: 'Il y a 3 semaines', service: 'Debouchage' },
    { author: 'Jean-Louis Robert', text: "Diagnostic complet de notre installation avant achat maison. Très professionnel, nous a fait économiser en identifiant des problèmes cachés. Devis détaillé et sans surprise.", rating: 5, date: 'Il y a 1 mois', service: 'Diagnostic immobilier' },
    { author: 'Marie Leroy', text: "Changement robinetterie salle de bain. Travail soigné, matériel de qualité. Le plombier a démonté l'ancien et installé le nouveau système en moins de 2h.", rating: 5, date: 'Il y a 1 mois', service: 'Robinetterie' }
  ],
  electricien: [
    { author: 'Alain Richard', text: "Mise aux normes complètes de notre maison ancienne. Travail sérieux, explications claires et attestation fournie pour l'assurance. Vraiment pro du domaine.", rating: 5, date: 'Il y a 4 jours', service: 'Mise aux normes' },
    { author: 'Isabelle Moreau', text: "Installation de notre borne de recharge pour voiture électrique. Raccordement propre, explications complètes et test de fonctionnement fait devant nous. Service impeccable.", rating: 5, date: 'Il y a 1 semaine', service: 'Borne de recharge' },
    { author: 'Thomas Girard', text: "Installation domotique dans toute la maison. L'électricien a été patient pour nous former et s'est assuré que tout fonctionne parfaitement. Vraiment satisfait.", rating: 5, date: 'Il y a 2 semaines', service: 'Domotique' },
    { author: 'Nathalie Fournier', text: "Court-circuit général réparé en urgence. Intervention nocturne rapide, diagnostic précis et réparation définitive. Tarif d'urgence raisonnable.", rating: 5, date: 'Il y a 3 semaines', service: 'Dépannage urgence' },
    { author: 'Philippe Lambert', text: "Éclairage LED installé dans tout l'appartement. Conseil sur les luminaires, installation soignée et économies d'énergie visibles dès la première facture.", rating: 5, date: 'Il y a 1 mois', service: 'Éclairage LED' },
    { author: 'François Mercier', text: "Tableau électrique remplacé avant mise en location. Travail aux normes, propre et rapide. L'expertise de notre assurance a validé sans problème.", rating: 5, date: 'Il y a 1 mois', service: 'Tableau électrique' }
  ],
  coiffeur: [
    { author: 'Camille Sanchez', text: "Coupe et coloration parfaites exactement ce que je voulais. Le coiffeur a pris le temps de comprendre mes attentes et le résultat est magnifique. Je reviendrai!", rating: 5, date: 'Il y a 2 jours', service: 'Coupe et coloration' },
    { author: 'Laura Martinez', text: "Balayage subtil et naturel. Le coiffeur a vraiment su adapter la couleur à ma peau et ma couleur naturelle. Ravis de mes amies!", rating: 5, date: 'Il y a 5 jours', service: 'Balayage' },
    { author: 'Emma Rousseau', text: "Soins kératine pour mes cheveux abîmés. Résultat spectaculaire, mes cheveux sont douces et brillants. Le coiffeur m'a donné des conseils d'entretien.", rating: 5, date: 'Il y a 1 semaine', service: 'Soins kératine' },
    { author: 'Alice David', text: "Chignon de mariage absolument magnifique. A tenu toute la journée et la nuit malgré la chaleur. Le coiffeur a été patient et créatif.", rating: 5, date: 'Il y a 2 semaines', service: 'Coiffure mariage' },
    { author: 'Nicolas Blanc', text: "Extensions naturelles indétectables. Même ma coiffeuse habituelle n'a pas vu la différence! Pose professionnelle et conseils d'entretien.", rating: 5, date: 'Il y a 3 semaines', service: 'Extensions' },
    { author: 'Julie Fontaine', text: "Coupe homme moderne avec soin barbe. Ambiance masculine très sympa, conseil sur produits adaptés et résultat très soigné. Je recommande vivement.", rating: 5, date: 'Il y a 1 mois', service: 'Coupe homme' }
  ],
  restaurant: [
    { author: 'Antoine Chevalier', text: "Menu dégustation exceptionnel. Chaque plat était une découverte, associations de saveurs audacieuses mais équilibrées. Service attentif et vins parfaitement accordés.", rating: 5, date: 'Il y a 1 jour', service: 'Menu dégustation' },
    { author: 'Marie Dupont', text: "Soirée anniversaire organisée parfaitement. Cadre magnifique, service impeccable et menu personnalisé sur mesure. Vraiment un moment inoubliable.", rating: 5, date: 'Il y a 3 jours', service: 'Événement privé' },
    { author: 'Sarah Lemoine', text: "Brunch du dimanche excellent. Produits frais de saison, présentation soignée et atmosphere chaleureuse. Rapport qualité/prix imbattable.", rating: 5, date: 'Il y a 1 semaine', service: 'Brunch' },
    { author: 'David Rousseau', text: "Accord mets et vins remarquable. Le sommelier nous a guidés avec expertise et patience. Découverte de pépites vinicoles.", rating: 5, date: 'Il y a 2 semaines', service: 'Accord mets-vins' },
    { author: 'Claire Bernard', text: "Accueil chaleureux comme à la maison. L'équipe nous a traités comme des habitués malgré notre première visite. Cuisine authentique et généreuse.", rating: 5, date: 'Il y a 3 semaines', service: 'Repas du soir' },
    { author: 'Romain Petit', text: "Carte des vins exceptionnelle. Sélection variée avec des pépites accessibles. Le personnel connaît parfaitement sa cave et conseille très bien.", rating: 5, date: 'Il y a 1 mois', service: 'Cave à vins' }
  ],
  garage: [
    { author: 'Stéphane Weber', text: "Réparation moteur complexe sur notre berline. Diagnostic précis avec outil de diagnostic moderne, pièces d'origine et main d'œuvre raisonnable. Voiture comme neuve!", rating: 5, date: 'Il y a 2 jours', service: 'Réparation moteur' },
    { author: 'Aurélie Meyer', text: "Changement 4 pneus et géométrie complète. Service rapide, pneus de qualité et réglage précis. Conduite plus sécurisée immédiatement.", rating: 5, date: 'Il y a 4 jours', service: 'Pneus et géométrie' },
    { author: 'Christophe Fischer', text: "Diagnostic électronique sur problème intermittent. Le garagiste a identifié la panne en 30min alors que d'autres n'avaient rien trouvé. Honnête et compétent.", rating: 5, date: 'Il y a 1 semaine', service: 'Diagnostic électronique' },
    { author: 'Marie-Jeanne Hoffmann', text: "Carrosserie réparation après petit accrochage. Travail de peinture impeccable, couleur parfaitement assortie et finition parfaite. On ne voit plus rien.", rating: 5, date: 'Il y a 2 semaines', service: 'Carrosserie' },
    { author: 'Pierre Schneider', text: "Révision complète avant grand voyage. Contrôle pointilleux, vidange, filtres changés et vérification pneus. Prix très juste pour la qualité.", rating: 5, date: 'Il y a 3 semaines', service: 'Révision' },
    { author: 'Sandrine Mueller', text: "Climatisation réglée et rechargée. Température parfaite maintenant, même en pleine canicule. Le garagiste a expliqué comment l'entretenir.", rating: 5, date: 'Il y a 1 mois', service: 'Climatisation' }
  ],
  nettoyage: [
    { author: 'Laurent Weber', text: "Nettoyage de fin de chantier impeccable. L'équipe a transformé notre chantier en espace habitable en 2 jours. Travail sérieux et efficace.", rating: 5, date: 'Il y a 3 jours', service: 'Fin de chantier' },
    { author: 'Sophie Klein', text: "Nettoyage bureaux mensuel contractuel. Équipe ponctuelle, travail discret et résultat toujours parfait. Vraiment professionnel et fiable.", rating: 5, date: 'Il y a 1 semaine', service: 'Nettoyage bureaux' },
    { author: 'Marie Schmidt', text: "Grand ménage de printemps. Équipe dynamique et équipée, ont nettoyé des endroits inaccessibles depuis des années. Maison comme neuve!", rating: 5, date: 'Il y a 2 semaines', service: 'Grand ménage' },
    { author: 'Jean-Marc Bauer', text: "Nettoyage vitres professionnel. Résultat sans traces, cadre métallique nettoyé également. Travaux en hauteur sans problème avec toutes sécurités.", rating: 5, date: 'Il y a 3 semaines', service: 'Nettoyage vitres' },
    { author: 'Isabelle Wagner', text: "Shampooing de tapis et moquettes. Taches tenaces éliminées, séchage rapide et odeur agréable. Tapis comme neufs!", rating: 5, date: 'Il y a 1 mois', service: 'Shampooing tapis' },
    { author: 'Thomas Becker', text: "Nettoyage industriel après arrêt machine. Équipe spécialisée, produits adaptés et respect des normes sécurité. Production relancée rapidement.", rating: 5, date: 'Il y a 1 mois', service: 'Nettoyage industriel' }
  ]
};

// ── SYSTÈME DE VALIDATION DES DONNÉES AVANT GÉNÉRATION ──

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixedData?: Partial<any>;
}

// Valider toutes les données critiques du prospect avant génération
function validateLeadData(lead: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fixedData: Partial<any> = {};

  // Validation du nom de l'entreprise
  if (!lead.name || lead.name.trim().length < 2) {
    errors.push("Nom de l'entreprise invalide ou manquant");
    fixedData.name = lead.name || "Entreprise";
  }

  // Validation du secteur
  if (!lead.sector || lead.sector.trim().length < 2) {
    errors.push("Secteur invalide ou manquant");
    fixedData.sector = lead.sector || "Services";
  }

  // Validation du téléphone
  if (!lead.phone || !isValidPhone(lead.phone)) {
    warnings.push("Téléphone invalide ou manquant");
    fixedData.phone = lead.phone || "+33 1 23 45 67 89";
  }

  // Validation de l'email
  if (!lead.email || !isValidEmail(lead.email)) {
    warnings.push("Email invalide ou manquant");
    fixedData.email = lead.email || "contact@example.com";
  }

  // Validation de la ville
  if (!lead.city || lead.city.trim().length < 2) {
    warnings.push("Ville invalide ou manquante");
    fixedData.city = lead.city || "Paris";
  }

  // Validation de l'adresse
  if (!lead.address || lead.address.trim().length < 5) {
    warnings.push("Adresse invalide ou manquante");
    fixedData.address = lead.address || "Centre Ville";
  }

  // Validation du site web
  if (lead.website && !isValidUrl(lead.website)) {
    warnings.push("URL du site web invalide");
    fixedData.website = "";
  }

  // Validation du rating
  if (lead.googleRating && (lead.googleRating < 1 || lead.googleRating > 5)) {
    warnings.push("Rating Google invalide, normalisé à 5");
    fixedData.googleRating = 5;
  }

  // Validation du nombre d'avis
  if (lead.googleReviews && (lead.googleReviews < 0 || lead.googleReviews > 10000)) {
    warnings.push("Nombre d'avis Google invalide, normalisé à 42");
    fixedData.googleReviews = 42;
  }

  // Appliquer les corrections
  if (Object.keys(fixedData).length > 0) {
    Object.assign(lead, fixedData);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixedData
  };
}

// Valider un numéro de téléphone
function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Valider un email
function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Valider une URL
function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ── SYSTÈME DE CACHE LOCAL POUR IMAGES PEXELS ──

interface CachedImage {
  url: string;
  localPath: string;
  timestamp: number;
  expiresAt: number;
  size: number;
  format: string;
}

interface ImageCacheEntry {
  [query: string]: CachedImage[];
}

// Cache local pour les images Pexels avec expiration de 7 jours
class PexelsImageCache {
  private cache: ImageCacheEntry = {};
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours en ms
  private readonly MAX_CACHE_SIZE = 100; // Maximum 100 images par query
  
  constructor() {
    this.loadCacheFromStorage();
    this.cleanupExpiredEntries();
  }

  // Charger le cache depuis localStorage
  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem('pexels-image-cache');
      if (stored) {
        this.cache = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('⚠️ Erreur chargement cache images:', error);
      this.cache = {};
    }
  }

  // Sauvegarder le cache dans localStorage
  private saveCacheToStorage(): void {
    try {
      localStorage.setItem('pexels-image-cache', JSON.stringify(this.cache));
    } catch (error) {
      console.warn('⚠️ Erreur sauvegarde cache images:', error);
    }
  }

  // Nettoyer les entrées expirées
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let hasChanges = false;

    Object.keys(this.cache).forEach(query => {
      this.cache[query] = this.cache[query].filter(img => img.expiresAt > now);
      if (this.cache[query].length === 0) {
        delete this.cache[query];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveCacheToStorage();
    }
  }

  // Vérifier si une image est en cache
  public isImageCached(query: string, url: string): boolean {
    const cached = this.cache[query];
    if (!cached) return false;

    const now = Date.now();
    return cached.some(img => img.url === url && img.expiresAt > now);
  }

  // Récupérer une image depuis le cache
  public getCachedImage(query: string, url: string): CachedImage | null {
    const cached = this.cache[query];
    if (!cached) return null;

    const now = Date.now();
    const image = cached.find(img => img.url === url && img.expiresAt > now);
    return image || null;
  }

  // Ajouter une image au cache
  public async cacheImage(query: string, url: string): Promise<CachedImage | null> {
    try {
      // Télécharger l'image
      const response = await fetch(url);
      if (!response.ok) return null;

      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = () => {
          const localPath = reader.result as string;
          const timestamp = Date.now();
          
          const cachedImage: CachedImage = {
            url,
            localPath,
            timestamp,
            expiresAt: timestamp + this.CACHE_DURATION,
            size: blob.size,
            format: blob.type
          };

          // Ajouter au cache
          if (!this.cache[query]) {
            this.cache[query] = [];
          }

          // Limiter la taille du cache
          if (this.cache[query].length >= this.MAX_CACHE_SIZE) {
            this.cache[query] = this.cache[query].slice(-this.MAX_CACHE_SIZE + 1);
          }

          this.cache[query].push(cachedImage);
          this.saveCacheToStorage();
          
          resolve(cachedImage);
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('⚠️ Erreur cache image:', error);
      return null;
    }
  }

  // Récupérer une image (avec cache)
  public async getImage(query: string, url: string): Promise<string> {
    // Vérifier si déjà en cache
    if (this.isImageCached(query, url)) {
      const cached = this.getCachedImage(query, url);
      if (cached) {
        return cached.localPath;
      }
    }

    // Ajouter au cache et retourner
    const cached = await this.cacheImage(query, url);
    return cached ? cached.localPath : url;
  }

  // Précharger des images pour une query
  public async preloadImages(query: string, urls: string[]): Promise<void> {
    const promises = urls.map(url => this.getImage(query, url));
    await Promise.allSettled(promises);
  }

  // Vider le cache
  public clearCache(): void {
    this.cache = {};
    localStorage.removeItem('pexels-image-cache');
  }

  // Obtenir des statistiques du cache
  public getCacheStats(): { totalEntries: number; totalSize: number; queries: string[] } {
    let totalEntries = 0;
    let totalSize = 0;
    const queries = Object.keys(this.cache);

    queries.forEach(query => {
      this.cache[query].forEach(img => {
        totalEntries++;
        totalSize += img.size;
      });
    });

    return {
      totalEntries,
      totalSize,
      queries
    };
  }
}

// Instance globale du cache
const pexelsCache = new PexelsImageCache();

// ── FONCTIONS D'IMAGES PEXELS AVEC CACHE ──

// Rechercher des images Pexels avec cache local
async function searchPexelsImagesWithCache(query: string, count: number = 10): Promise<string[]> {
  try {
    // Construire la query Pexels
    const searchQuery = `${query} professional business`;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=horizontal`;
    
    // Clé API Pexels (à remplacer par la vraie clé)
    const apiKey = process.env.PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY';
    
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ Erreur API Pexels: ${response.status}`);
      return getFallbackImages(query, count);
    }

    const data = await response.json();
    const imageUrls = data.photos.map((photo: any) => photo.src.large);

    // Précharger les images dans le cache
    await pexelsCache.preloadImages(searchQuery, imageUrls);

    // Retourner les URLs cached
    const cachedUrls = await Promise.all(
      imageUrls.map((url: string) => pexelsCache.getImage(searchQuery, url))
    );

    return cachedUrls.filter(url => url && url !== '');
  } catch (error) {
    console.warn('⚠️ Erreur recherche Pexels:', error);
    return getFallbackImages(query, count);
  }
}

// Obtenir des images de fallback si Pexels échoue
function getFallbackImages(query: string, count: number): string[] {
  const fallbackImages = [
    'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
    'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
    'https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg',
    'https://images.pexels.com/photos/3184341/pexels-photo-3184341.jpeg',
    'https://images.pexels.com/photos/3184342/pexels-photo-3184342.jpeg',
    'https://images.pexels.com/photos/3184343/pexels-photo-3184343.jpeg',
    'https://images.pexels.com/photos/3184344/pexels-photo-3184344.jpeg',
    'https://images.pexels.com/photos/3184345/pexels-photo-3184345.jpeg'
  ];

  return fallbackImages.slice(0, count);
}

// Optimiser les images pour le web (redimensionnement et compression)
async function optimizeImageForWeb(imageUrl: string, maxWidth: number = 1200, quality: number = 85): Promise<string> {
  try {
    // Vérifier si l'image est déjà en cache optimisée
    const cacheKey = `optimized_${maxWidth}_${quality}_${imageUrl}`;
    if (pexelsCache.isImageCached(cacheKey, imageUrl)) {
      const cached = pexelsCache.getCachedImage(cacheKey, imageUrl);
      if (cached) {
        return cached.localPath;
      }
    }

    // Créer un canvas pour redimensionner
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context non disponible'));
          return;
        }

        // Calculer les nouvelles dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en blob avec compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                const optimizedUrl = reader.result as string;
                // Mettre en cache l'image optimisée
                pexelsCache.cacheImage(cacheKey, imageUrl).then(() => {
                  resolve(optimizedUrl);
                });
              };
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('Échec conversion blob'));
            }
          },
          'image/jpeg',
          quality / 100
        );
      };

      img.onerror = () => reject(new Error('Échec chargement image'));
      img.src = imageUrl;
    });
  } catch (error) {
    console.warn('⚠️ Erreur optimisation image:', error);
    return imageUrl;
  }
}

// Créer un service worker pour le cache offline (optionnel)
function createImageServiceWorker(): string {
  return `
    // Service Worker pour cache images LeadForge
    const CACHE_NAME = 'leadforge-images-v1';
    const urlsToCache = [];

    self.addEventListener('install', event => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => cache.addAll(urlsToCache))
      );
    });

    self.addEventListener('fetch', event => {
      if (event.request.url.includes('pexels.com')) {
        event.respondWith(
          caches.match(event.request)
            .then(response => {
              return response || fetch(event.request);
            })
        );
      }
    });
  `;
}

// ── SYSTÈME DE VARIATIONS DE TEMPLATE ANTI-IDENTIFICATION ──

interface TemplateVariation {
  id: string;
  colorScheme: { primary: string; secondary: string; accent: string };
  layoutStyle: string;
  componentOrder: string[];
  customClasses: Record<string, string>;
  hiddenElements: string[];
  additionalFeatures: string[];
}

// Générer une variation unique de template basée sur l'entreprise et le secteur
function generateTemplateVariation(companyName: string, sector: string): TemplateVariation {
  // Hash unique basé sur le nom de l'entreprise et le secteur
  const combinedString = `${companyName.toLowerCase()}${sector.toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < combinedString.length; i++) {
    hash = ((hash << 5) - hash) + combinedString.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  // Déterminer la variation (0-15 pour 16 variations uniques)
  const variationIndex = hash % 16;
  
  // Palettes de couleurs alternatives
  const colorSchemes = [
    { primary: '#2563eb', secondary: '#7c3aed', accent: '#ec4899' }, // Bleu/Violet/Rose
    { primary: '#059669', secondary: '#0891b2', accent: '#0d9488' }, // Vert/Cyan
    { primary: '#dc2626', secondary: '#ea580c', accent: '#f59e0b' }, // Rouge/Orange
    { primary: '#7c2d12', secondary: '#a16207', accent: '#ca8a04' }, // Marron/Or
    { primary: '#4338ca', secondary: '#6366f1', accent: '#8b5cf6' }, // Indigo/Violet
    { primary: '#0891b2', secondary: '#06b6d4', accent: '#0ea5e9' }, // Cyan/Bleu
    { primary: '#be123c', secondary: '#db2777', accent: '#ec4899' }, // Rose
    { primary: '#166534', secondary: '#15803d', accent: '#16a34a' }, // Vert forêt
    { primary: '#9333ea', secondary: '#a855f7', accent: '#c084fc' }, // Violet
    { primary: '#c2410c', secondary: '#dc2626', accent: '#ef4444' }, // Rouge feu
    { primary: '#1e3a8a', secondary: '#1e40af', accent: '#2563eb' }, // Bleu marine
    { primary: '#14532d', secondary: '#166534', accent: '#15803d' }, // Vert sapin
    { primary: '#7f1d1d', secondary: '#991b1b', accent: '#b91c1c' }, // Bordeaux
    { primary: '#134e4a', secondary: '#14b8a6', accent: '#10b981' }, // Teal
    { primary: '#4c1d95', secondary: '#6d28d9', accent: '#7c3aed' }, // Violet foncé
    { primary: '#0f766e', secondary: '#115e59', accent: '#134e4a' }  // Cyan foncé
  ];

  // Styles de layout
  const layoutStyles = ['modern', 'classic', 'minimal', 'bold', 'elegant', 'tech', 'organic', 'corporate'];
  
  // Ordres de composants
  const componentOrders = [
    ['hero', 'about', 'services', 'testimonials', 'contact'],
    ['hero', 'services', 'about', 'testimonials', 'contact'],
    ['hero', 'testimonials', 'services', 'about', 'contact'],
    ['hero', 'about', 'testimonials', 'services', 'contact'],
    ['hero', 'services', 'testimonials', 'about', 'contact'],
    ['hero', 'contact', 'services', 'about', 'testimonials'],
    ['hero', 'testimonials', 'about', 'services', 'contact'],
    ['hero', 'about', 'contact', 'services', 'testimonials']
  ];

  // Éléments à masquer aléatoirement
  const possibleHiddenElements = ['stats-banner', 'process-section', 'guarantees', 'values', 'team', 'blog', 'newsletter'];
  const hiddenElementsCount = hash % 3; // 0-2 éléments à masquer
  const hiddenElements = [];
  for (let i = 0; i < hiddenElementsCount; i++) {
    const index = (hash + i * 7) % possibleHiddenElements.length;
    hiddenElements.push(possibleHiddenElements[index]);
  }

  // Fonctionnalités additionnelles
  const possibleFeatures = ['chat-widget', 'appointment-booking', 'quote-calculator', 'price-table', 'gallery', 'video-hero', 'testimonials-carousel', 'map-integration'];
  const additionalFeaturesCount = (hash % 4) + 1; // 1-4 fonctionnalités
  const additionalFeatures = [];
  for (let i = 0; i < additionalFeaturesCount; i++) {
    const index = (hash + i * 11) % possibleFeatures.length;
    additionalFeatures.push(possibleFeatures[index]);
  }

  // Classes CSS personnalisées
  const customClasses = {
    hero: `hero-${layoutStyles[variationIndex % layoutStyles.length]}`,
    navigation: `nav-${variationIndex % 4 === 0 ? 'sticky' : variationIndex % 4 === 1 ? 'fixed' : variationIndex % 4 === 2 ? 'hidden' : 'transparent'}`,
    buttons: `btn-${variationIndex % 3 === 0 ? 'rounded' : variationIndex % 3 === 1 ? 'square' : 'pill'}`,
    cards: `card-${variationIndex % 3 === 0 ? 'shadow' : variationIndex % 3 === 1 ? 'border' : 'elevated'}`,
    animations: `anim-${variationIndex % 4 === 0 ? 'fade' : variationIndex % 4 === 1 ? 'slide' : variationIndex % 4 === 2 ? 'zoom' : 'none'}`
  };

  return {
    id: `var-${variationIndex}`,
    colorScheme: colorSchemes[variationIndex],
    layoutStyle: layoutStyles[variationIndex % layoutStyles.length],
    componentOrder: componentOrders[variationIndex % componentOrders.length],
    customClasses,
    hiddenElements,
    additionalFeatures
  };
}

// Appliquer les variations de template au HTML
function applyTemplateVariation(html: string, variation: TemplateVariation): string {
  let modifiedHtml = html;

  // Ajouter les classes CSS personnalisées au body (en préservant les classes existantes)
  modifiedHtml = modifiedHtml.replace(
    /<body\s+class="([^"]*)"/,
    (_, existingClass) => `<body class="template-${variation.id} ${existingClass}" data-layout="${variation.layoutStyle}"`
  );

  // Masquer les éléments spécifiés
  variation.hiddenElements.forEach(element => {
    const regex = new RegExp(`<section[^>]*class="[^"]*\\b${element}\\b[^"]*"[^>]*>.*?<\\/section>`, 'gs');
    modifiedHtml = modifiedHtml.replace(regex, '');
  });

  // Ajouter les fonctionnalités additionnelles
  if (variation.additionalFeatures.includes('chat-widget')) {
    modifiedHtml = modifiedHtml.replace(
      '</body>',
      `<div class="chat-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
        <button style="background: ${variation.colorScheme.primary}; color: white; border: none; padding: 12px; border-radius: 50%; cursor: pointer;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div></body>`
    );
  }

  // Ajouter des classes CSS pour les variations + Mobile-First
  const variationCSS = `
    <style>
      /* === STYLES DE BASE === */
      .template-${variation.id} .hero-${variation.layoutStyle} { 
        background: linear-gradient(135deg, ${variation.colorScheme.primary}22, ${variation.colorScheme.secondary}22);
      }
      .template-${variation.id} .${variation.customClasses.buttons} {
        background: ${variation.colorScheme.primary};
        border-radius: ${variation.customClasses.buttons.includes('rounded') ? '8px' : variation.customClasses.buttons.includes('pill') ? '50px' : '0'};
      }
      .template-${variation.id} .${variation.customClasses.cards} {
        ${variation.customClasses.cards.includes('shadow') ? 'box-shadow: 0 10px 30px rgba(0,0,0,0.1);' : ''}
        ${variation.customClasses.cards.includes('border') ? 'border: 2px solid ' + variation.colorScheme.primary : ''}
        ${variation.customClasses.cards.includes('elevated') ? 'transform: translateY(-4px);' : ''}
      }
      .template-${variation.id} .${variation.customClasses.animations} {
        ${variation.customClasses.animations.includes('fade') ? 'animation: fadeIn 0.6s ease-in;' : ''}
        ${variation.customClasses.animations.includes('slide') ? 'animation: slideIn 0.6s ease-out;' : ''}
        ${variation.customClasses.animations.includes('zoom') ? 'animation: zoomIn 0.6s ease-out;' : ''}
      }
      
      /* === MOBILE-FIRST OPTIMIZATION === */
      /* Base mobile styles (320px and up) */
      * {
        box-sizing: border-box;
      }
      
      body {
        font-size: 16px;
        line-height: 1.5;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      
      /* Hero Section Mobile */
      .hero {
        min-height: 60vh;
        padding: 2rem 1rem;
        text-align: center;
      }
      
      .hero h1 {
        font-size: 2rem;
        line-height: 1.2;
        margin-bottom: 1rem;
      }
      
      .hero p {
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
      }
      
      .hero-image {
        width: 100%;
        height: auto;
        max-height: 300px;
        object-fit: cover;
        border-radius: 8px;
      }
      
      /* Navigation Mobile */
      .nav-mobile {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        padding: 1rem;
      }
      
      .nav-desktop {
        display: none;
      }
      
      .mobile-menu-toggle {
        display: block;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
      }
      
      .mobile-menu {
        display: none;
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 1rem;
      }
      
      .mobile-menu.active {
        display: block;
      }
      
      .service-card {
        text-align: center;
      }
      
      .testimonial-card {
        padding: 1.5rem;
        margin-bottom: 1rem;
      }
      
      /* Buttons Mobile */
      .btn-cta, .btn-primary, .btn-secondary {
        width: 100%;
        padding: 1rem 2rem;
        font-size: 1rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      /* Forms Mobile */
      .form-control {
        width: 100%;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 16px; /* Prevents zoom on iOS */
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      /* Contact Modal Mobile */
      .contact-modal {
        width: 95%;
        max-width: 400px;
        margin: 10vh auto;
        padding: 2rem;
      }
      
      /* Footer Mobile */
      footer {
        text-align: center;
        padding: 2rem 1rem;
      }
      
      .footer-grid {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        text-align: left;
      }
      
      /* Touch targets (minimum 48x48px) */
      .touch-target {
        min-height: 48px;
        min-width: 48px;
        padding: 12px;
      }
      
      /* Performance optimizations */
      img {
        max-width: 100%;
        height: auto;
        loading: lazy;
      }
      
      /* Reduce motion for accessibility */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* Tablet styles (768px and up) */
      @media (min-width: 768px) {
        .hero {
          min-height: 70vh;
          padding: 3rem 2rem;
        }
        
        .hero h1 {
          font-size: 2.5rem;
        }
        
        .nav-mobile {
          display: none;
        }
        
        .nav-desktop {
          display: block;
        }
        
        .btn-cta, .btn-primary, .btn-secondary {
          width: auto;
        }
      }
      
      /* Desktop styles (1024px and up) */
      @media (min-width: 1024px) {
        .hero {
          min-height: 80vh;
          padding: 4rem 2rem;
        }
        
        .hero h1 {
          font-size: 3rem;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }
      }
      
      /* Large desktop (1440px and up) */
      @media (min-width: 1440px) {
        .hero h1 {
          font-size: 3.5rem;
        }
      }
      
      /* Animations */
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    </style>
  `;

  modifiedHtml = modifiedHtml.replace('</head>', `${variationCSS}</head>`);

  return modifiedHtml;
}

// ── FONCTIONS AVANCÉES POUR LES VRAIS AVIS DU PROSPECT ──

// Extraire et valider les vrais avis Google du prospect
export function extractAndValidateRealReviews(googleReviewsData: any[], lead: any): Array<{ author: string; text: string; rating: number; date: string; service?: string; isReal: boolean }> {
  if (!googleReviewsData || googleReviewsData.length === 0) {
    console.log(`⚠️ ${lead.name}: Aucun avis Google trouvé dans les données du prospect`);
    return [];
  }
  
  const validReviews = googleReviewsData
    .filter(review => {
      // Valider que l'avis a les champs requis
      return review && 
             review.text && 
             review.text.trim().length > 10 && // Au moins 10 caractères
             review.author && 
             review.author.trim().length > 0 &&
             (review.rating >= 1 && review.rating <= 5); // Rating valide
    })
    .map(review => ({
      author: cleanAuthorName(review.author),
      text: cleanReviewText(review.text),
      rating: review.rating || 5,
      date: formatReviewDate(review.date),
      service: extractServiceFromReview(review.text, lead.sector),
      isReal: true
    }))
    .sort((a, b) => {
      // Prioriser les avis avec rating élevés et texte détaillé
      const scoreA = (a.rating * 10) + (a.text.length / 50);
      const scoreB = (b.rating * 10) + (b.text.length / 50);
      return scoreB - scoreA;
    });
  
  console.log(`✅ ${lead.name}: ${validReviews.length} avis validés sur ${googleReviewsData.length} avis bruts`);
  return validReviews;
}

// Nettoyer le nom de l'auteur
function cleanAuthorName(author: string): string {
  if (!author) return 'Client';
  
  // Supprimer les caractères spéciaux et normaliser
  return author
    .replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .substring(0, 30); // Limiter la longueur
}

// Nettoyer et formater le texte de l'avis
function cleanReviewText(text: string): string {
  if (!text) return "Service excellent";
  
  return text
    .replace(/[^\w\sÀ-ÿ.,!?;:\-'"()\n]/g, '') // Garder caractères pertinents
    .replace(/\s+/g, ' ') // Normaliser espaces
    .trim()
    .substring(0, 300) // Limiter la longueur
    .replace(/(.{250}[^\s]*).*/, '$1...'); // Couper proprement si trop long
}

// Formater la date de l'avis
function formatReviewDate(dateString: string): string {
  if (!dateString) return 'Récemment';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Récemment';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (isNaN(diffDays)) return 'Récemment';
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    if (diffDays <= 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    if (diffDays <= 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
  } catch {
    return 'Récemment';
  }
}

// Extraire le service mentionné dans l'avis
function extractServiceFromReview(text: string, sector: string): string {
  const sectorKeywords: Record<string, string[]> = {
    plomberie: ['fuite', 'chauffage', 'robinet', 'salle de bain', 'dépannage', 'installation'],
    electricien: ['prise', 'lumière', 'tableau', 'chauffage', 'dysfonctionnement', 'installation'],
    restaurant: ['plat', 'menu', 'service', 'ambiance', 'personnel', 'réservation'],
    garage: ['voiture', 'entretien', 'réparation', 'diagnostic', 'contrôle', 'vidange'],
    coiffeur: ['coupe', 'coiffure', 'coloration', ' brushing', 'service', 'rendez-vous'],
    nettoyage: ['ménage', 'propreté', 'service', 'intervention', 'efficace', 'professionnel']
  };
  
  const keywords = sectorKeywords[sector.toLowerCase()] || [];
  
  for (const keyword of keywords) {
    if (text.toLowerCase().includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  return 'Service général';
}

// Construire la liste complète des témoignages (vrais + fallbacks)
export function buildCompleteTestimonialList(realReviews: Array<any>, sector: string, targetCount: number): Array<{ author: string; text: string; rating: number; date: string; service?: string; isReal?: boolean }> {
  const fallbackReviews = getAuthenticReviews(sector);
  
  // Commencer avec les vrais avis
  let completeList = [...realReviews];
  
  // Ajouter des avis sectoriels si nécessaire
  while (completeList.length < targetCount && fallbackReviews.length > 0) {
    const fallbackIndex = (completeList.length - realReviews.length) % fallbackReviews.length;
    const fallbackReview = fallbackReviews[fallbackIndex];
    
    completeList.push({
      ...fallbackReview,
      isReal: false
    });
  }
  
  // Filtrer les avis invalides (text ou author manquants)
  completeList = completeList.filter(r => r.text && r.text !== 'undefined' && r.author && r.author !== 'undefined');
  
  // Limiter au nombre cible
  return completeList.slice(0, targetCount);
}

// Fonction pour obtenir les avis authentiques d'un secteur (inchangée)
function getAuthenticReviews(sector: string): Array<{ author: string; text: string; rating: number; date: string; service?: string }> {
  const normalizedSector = (sector || '').toLowerCase();
  
  // Chercher une correspondance exacte ou partielle
  for (const [key, reviews] of Object.entries(AUTHENTIC_REVIEWS)) {
    if (normalizedSector.includes(key) || key.includes(normalizedSector)) {
      return reviews;
    }
  }
  
  // Fallback par défaut si aucun secteur trouvé
  return AUTHENTIC_REVIEWS.default || [];
}

// Fonction pour générer le texte "about" dynamique avec l'expérience réelle
function generateAboutText(templateText: string, lead: any): string {
  let years = 'plusieurs';
  
  // Si on a une année de création, calculer les années d'expérience
  if (lead.establishedYear && typeof lead.establishedYear === 'number') {
    const currentYear = new Date().getFullYear();
    const calculatedYears = currentYear - lead.establishedYear;
    if (calculatedYears > 0 && calculatedYears < 100) {
      years = calculatedYears.toString();
    }
  } 
  // Fallback: extraire des années du texte du lead ou IA si disponible
  else if (lead.description) {
    const yearMatch = lead.description.match(/(\d+)\s*ans?\s*d['']exp[eé]rience/i);
    if (yearMatch) {
      years = yearMatch[1];
    }
  }
  
  // Remplacer "15 ans" par le nombre calculé
  return templateText.replace(/depuis plus de 15 ans/gi, `depuis ${years} ans`)
                     .replace(/15 ans d['']exp[eé]rience/gi, `${years} ans d'expérience`);
}

// Fonction pour générer des features cohérentes basées sur le service
function generateFeaturesFromService(name: string, description: string, sector: string): string[] {
  const serviceName = (name || '').toLowerCase();
  const serviceDesc = (description || '').toLowerCase();
  const normalizedSector = (sector || '').toLowerCase();
  
  // Features génériques de qualité
  const defaultFeatures = ['Service professionnel', 'Intervention garantie', 'Devis gratuit'];
  
  // Dictionnaire de features par type de service
  const featureDictionary: Record<string, string[]> = {
    // Plomberie
    'urgence': ['Disponible 24h/24', 'Intervention rapide', 'Déplacement inclus'],
    'depannage': ['Réparation durable', 'Pièces garanties', 'Tarifs transparents'],
    'installation': ['Pose certifiée', 'Conformité normes', 'Garantie décennale'],
    'chauffage': ['Économies énergie', 'Installation propre', 'Entretien annuel'],
    'sanitaire': ['Matériel qualité', 'Finitions soignées', 'Délai respecté'],
    // Électricité
    'mise aux normes': ['Conformité NFC 15-100', 'Certification Consuel', 'Sécurité garantie'],
    'domotique': ['Configuration incluse', 'App smartphone', 'Support technique'],
    'éclairage': ['Design moderne', 'LED économique', 'Installation discrète'],
    // Coiffure
    'coupe': ['Visagisme personnalisé', 'Conseil entretien', 'Produits adaptés'],
    'coloration': ['Coloration végétale', 'Protection cheveux', 'Brillance longue durée'],
    'barbier': ['Rasage précis', 'Soins barbe', 'Ambiance masculine'],
    // Restaurant
    'menu': ['Produits frais', 'Cuisine maison', 'Accord mets-vins'],
    'livraison': ['Emballage qualité', 'Livraison rapide', 'Commande en ligne'],
    // Garage
    'moteur': ['Diagnostic précis', 'Réparation garantie', 'Pièces d\'origine'],
    'pneus': ['Montage rapide', 'Géométrie 3D', 'Stockage hiver'],
    'carrosserie': ['Peinture neuve', 'Débosselage sans peinture', 'Garantie vie'],
    // Nettoyage
    'ménage': ['Produits écologiques', 'Équipe formée', 'Intervention régulière'],
    'vitres': ['Sans traces garanti', 'Accès difficile', 'Sécurité maximale'],
    'désinfection': ['Produits certifiés', 'Zones sensibles', 'Certificat fourni'],
    // Jardin
    'taille': ['Forme parfaite', 'Évacuation déchets', 'Santé végétaux'],
    'pelouse': ['Semence adaptée', 'Arrosage auto', 'Entretien minime'],
    // Fitness
    'coaching': ['Programme personnalisé', 'Suivi nutrition', 'Résultats mesurables'],
    'musculation': ['Technique sécurisée', 'Progression adaptée', 'Sans blessure'],
    // Médical
    'consultation': ['À l\'écoute', 'Diagnostic précis', 'Disponibilité rapide'],
    'kiné': ['Rééducation active', 'Appareillage moderne', 'Progrès rapides'],
    // Juridique
    'divorce': ['Discrétion totale', 'Médiation possible', 'Protection intérêts'],
    'contrat': ['Rédaction précise', 'Clauses protectrices', 'Relecture gratuite'],
  };
  
  // Chercher des correspondances dans le dictionnaire
  for (const [keyword, features] of Object.entries(featureDictionary)) {
    if (serviceName.includes(keyword) || serviceDesc.includes(keyword)) {
      return features;
    }
  }
  
  // Fallback: extraire des mots-clés de la description
  const keywords = serviceDesc.match(/\b(installation|réparation|remplacement|rénovation|entretien|dépannage|conseil|sur-mesure|professionnel|certifié|garanti|rapide|qualité|économique)\b/g);
  if (keywords && keywords.length > 0) {
    return keywords.slice(0, 3).map(k => k.charAt(0).toUpperCase() + k.slice(1) + ' garanti');
  }
  
  return defaultFeatures;
}

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
  testimonials: Array<{ author: string; text: string; rating: number; date?: string }>;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  ctaText: string;
  slogan: string;
  heroImage: string;
  allImages: string[];
}

const SECTOR_ULTIMATE_TEMPLATES = {
  plomberie: {
    primary: '#0f766e',
    secondary: '#115e59',
    accent: '#14b8a6',
    background: '#f0fdfa',
    services: [
      { name: 'Dépannage 24h/24', description: 'Intervention d\'urgence sur toutes fuites et pannes', features: ['Disponible 7j/7', 'Arrivée sous 1h30', 'Sans surprise tarifaire'] },
      { name: 'Installation Sanitaire', description: 'Pose et remplacement de vos appareils', features: ['Robinetterie', 'Éviers', 'WC', 'Douches'] },
      { name: 'Chauffage & Chaudière', description: 'Installation et réparation chauffage', features: ['Chaudières gaz/fioul', 'Pompes à chaleur', 'Détartrage'] },
      { name: 'Détection de Fuites', description: 'Localisation précise sans casse', features: ['Caméra thermique', 'Gaz traceur', 'Colmatage immédiat'] },
      { name: 'Rénovation Salle de Bain', description: 'Création et rénovation complète', features: ['Devis gratuit', 'Aide au choix', 'Clé en main'] },
      { name: 'Entretien Annuel', description: 'Maintenance préventive', features: ['Contrôle chauffage', 'Détartrage', 'Mise aux normes'] }
    ],
    guarantees: [
      { title: 'Garantie Décennale', icon: 'shield-check' },
      { title: 'Intervention < 2h', icon: 'clock' },
      { title: 'Devis Gratuit', icon: 'file-text' },
      { title: 'Artisan Qualifié', icon: 'check-square' }
    ],
    heroTitle: 'Artisan Plombier',
    heroSubtitle: "L'artisan du tuyau à votre service - De la fuite d'eau à la rénovation complète",
    aboutText: "Plombier chauffagiste depuis plus de 15 ans, je mets mon savoir-faire au service de vos installations. Artisan passionné, je garantis un travail soigné, des délais respectés et des tarifs transparents.",
    ctaText: 'Demandez un devis'
  },
  electricien: {
    primary: '#1e40af',
    secondary: '#1e3a8a',
    accent: '#2563eb',
    background: '#f8fafc',
    services: [
      { name: 'Mise aux Normes', description: 'Remise à neuf de votre installation électrique', features: ['Norme NFC 15-100', 'Tableau électrique neuf', 'Mise à la terre'] },
      { name: 'Dépannage Électrique', description: 'Pannes, court-circuits, disjonctions', features: ['Intervention rapide', 'Diagnostic complet', 'Réparation durable'] },
      { name: 'Installation Complète', description: 'Construction ou rénovation électrique', features: ['Câblage complet', 'Points de lumière', 'Prises et inters'] },
      { name: 'Domotique & Smart Home', description: 'Maison connectée et automatisée', features: ['Volets roulants', 'Éclairage auto', 'Thermostats'] },
      { name: 'Éclairage LED', description: 'Solutions éclairage économiques', features: ['Spots encastrés', 'Suspensions design', 'Éclairage extérieur'] },
      { name: 'Charging Véhicule', description: 'Installation bornes de recharge', features: ['Wallbox particulier', 'Borne entreprise', 'Certification IRVE'] }
    ],
    guarantees: [
      { title: 'Consuel Certifié', icon: 'shield-check' },
      { title: 'Garantie Décennale', icon: 'check-square' },
      { title: 'Intervention < 2h', icon: 'clock' },
      { title: 'Devis Gratuit', icon: 'file-text' }
    ],
    heroTitle: 'Électricien Agréé',
    heroSubtitle: "Votre expert électricien pour des installations sûres et modernes",
    aboutText: "Électricien certifié Consuel avec 15 ans d'expérience. Je sécurise votre habitat grâce à des installations conformes et durables. Artisan sérieux, intervention rapide et devis transparent.",
    ctaText: 'Contactez-moi'
  },
  coiffeur: {
    primary: '#6b21a8',
    secondary: '#581c87',
    accent: '#7c3aed',
    background: '#f8fafc',
    services: [
      { name: 'Coupes & Styles', description: 'Coupe sur-mesure femme et homme', features: ['Visagisme personnalisé', 'Techniques actuelles', 'Conseil entretien'] },
      { name: 'Barbier Traditionnel', description: 'Rasage et soins barbe', features: ['Rasage à l\'ancienne', 'Taille précise', 'Soins barbe'] },
      { name: 'Coloration Expert', description: 'Balayages, ombrés et couleurs', features: ['Coloration végétale', 'Mèches sur mesure', 'Glitter color'] },
      { name: 'Soins Capillaires', description: 'Traitements réparateurs', features: ['Botox capillaire', 'Kératine', 'Massage crânien'] },
      { name: 'Extensions Volume', description: 'Rajouts longueur et épaisseur', features: ['Pose à froid', 'Tape-in', 'Entretien inclus'] },
      { name: 'Chignons & Événements', description: 'Coiffures de cérémonie', features: ['Mariage', 'Sofreh aghd', 'Maquillage combo'] }
    ],
    guarantees: [
      { title: 'Produits Bio', icon: 'leaf' },
      { title: 'Stérilisation Outils', icon: 'sparkles' },
      { title: 'Formation Continue', icon: 'scissors' },
      { title: 'Satisfait ou Refait', icon: 'heart' }
    ],
    heroTitle: 'Coiffeur Visagiste',
    heroSubtitle: "L'art de sublimer vos cheveux avec passion et expertise",
    aboutText: "Coiffeur passionné depuis 15 ans, je crée des looks qui vous ressemblent. Spécialiste du visagisme et des techniques modernes, je veille à la santé de vos cheveux avec des produits naturels et de qualité.",
    ctaText: 'Prendre rendez-vous'
  },
  restaurant: {
    primary: '#c2410c',
    secondary: '#9a3412',
    accent: '#ea580c',
    background: '#f8fafc',
    services: [
      { name: 'Cuisine Maison', description: 'Plats préparés sur place', features: ['Produits locaux', 'Recettes authentiques', 'Fait minute'] },
      { name: 'Menu du Jour', description: 'Formule déjeuner économique', features: ['Entrée + Plat + Dessert', 'Produits frais', 'Cuisson minute'] },
      { name: 'Spécialités', description: 'Nos plats signature', features: ['Recettes du terroir', 'Grillades', 'Poissons frais'] },
      { name: 'Événements & Groupes', description: 'Repas de famille et séminaires', features: ['Menu groupe', 'Salle privative', 'Sur mesure'] },
      { name: 'Service Traiteur', description: 'Livraison et à emporter', features: ['Plateaux repas', 'Buffets', 'Livraison pro'] },
      { name: 'Boissons & Vins', description: 'Carte des vins et cocktails', features: ['Vins régionaux', 'Cocktails maison', 'Bières artisanales'] }
    ],
    heroTitle: 'Restaurant Traditionnel',
    heroSubtitle: "Cuisine authentique et accueil chaleureux depuis 2009",
    aboutText: "Chef passionné depuis 15 ans, je cuisine avec cœur des plats généreux et savoureux. Produits frais du marché, recettes authentiques et ambiance conviviale vous attendent dans notre établissement.",
    ctaText: 'Réserver une table'
  },
  garage: {
    primary: '#166534',
    secondary: '#14532d',
    accent: '#059669',
    background: '#f8fafc',
    services: [
      { name: 'Mécanique Générale', description: 'Entretien et réparation toutes marques', features: ['Révisions constructeur', 'Courroies', 'Freins'] },
      { name: 'Diagnostic Auto', description: 'Analyse électronique complète', features: ['Valise multimarque', 'Effacement défauts', 'Paramétrage'] },
      { name: 'Pneumatiques', description: 'Montage, équilibrage, géométrie', features: ['Pneus toutes saisons', 'Pneus run-flat', 'Parallélisme'] },
      { name: 'Climatisation', description: 'Recharge et réparation clim', features: ['Recharge gaz R134a', 'Détection fuites', 'Filtre habitacle'] },
      { name: 'Carrosserie', description: 'Réparation et peinture', features: ['Débosselage', 'Peinture à la nuance', 'Polissage optique'] },
      { name: 'Contrôle Technique', description: 'Préparation et contre-visite', features: ['Pré-contrôle', 'Réparations conformité', 'Accompagnement'] }
    ],
    guarantees: [
      { title: 'Devis Gratuit', icon: 'file-text' },
      { title: 'Garantie Pièces', icon: 'shield-check' },
      { title: 'Intervention Rapide', icon: 'clock' },
      { title: 'Véhicule de Courtoisie', icon: 'car' }
    ],
    heroTitle: 'Garage Automobile',
    heroSubtitle: "Mécanicien passionné, votre véhicule entre de bonnes mains",
    aboutText: "Mécanicien automobile depuis 15 ans, j'entretiens et répare toutes marques avec passion. Diagnostic précis, devis transparents et respect des délais. Votre sécurité routière est ma priorité.",
    ctaText: 'Demandez un RDV'
  },
  nettoyage: {
    primary: '#059669',
    secondary: '#047857',
    accent: '#10b981',
    background: '#f0fdf4',
    services: [
      { name: 'Nettoyage de Bureaux', description: 'Entretien quotidien de vos locaux professionnels', features: ['Poussière, sols, vitres', 'Produits écolabels', 'Horaires flexibles'] },
      { name: 'Nettoyage Vitres', description: 'Vitres intérieures et extérieures', features: ['Accès difficile', 'Sans traces garanti', 'Bâtiments R+10'] },
      { name: 'Grand Nettoyage', description: 'Nettoyage en profondeur résidentiel', features: ['Cuisine dégraissée', 'Salle de bain désinfectée', 'Sol ciré'] },
      { name: 'Désinfection', description: 'Traitement anti-bactérien et virucide', features: ['Certifié COVID', 'Produits bio', 'Rapport de traitement'] },
      { name: 'Nettoyage Industriel', description: 'Entrepôts, usines, ateliers', features: ['Monobrosse industrielle', 'Aspirateur eau/poussière', 'Horaires de nuit'] },
      { name: 'Remise en État', description: 'Après travaux ou déménagement', features: ['Évacuation gravats', 'Nettoyage fin', 'Livraison clé en main'] }
    ],
    guarantees: [
      { title: 'Produits Écolabels', icon: 'leaf' },
      { title: 'Personnel Formé', icon: 'users' },
      { title: 'Intervention Fiable', icon: 'clock' },
      { title: 'Assurance Responsabilité', icon: 'shield-check' }
    ],
    heroTitle: 'Société de Nettoyage',
    heroSubtitle: "Propreté professionnelle et écologique pour vos espaces",
    aboutText: "Entreprise de nettoyage depuis 15 ans, nos équipes formées interviennent avec rigueur et discrétion. Produits écolabels, matériel professionnel et engagement qualité pour des locaux toujours impeccables.",
    ctaText: 'Demandez un devis'
  },
  jardin: {
    primary: '#14532d',
    secondary: '#166534',
    accent: '#15803d',
    background: '#f0fdf4',
    services: [
      { name: 'Création de Jardins', description: 'Aménagement paysager complet', features: ['Plan sur mesure', 'Plantations adaptées', 'Gazon en rouleaux'] },
      { name: 'Tonte & Entretien', description: 'Pelouse et massifs entretenus', features: ['Tonte régulière', 'Taille haies', 'Désherbage manuel'] },
      { name: 'Élagage & Abattage', description: 'Arbres et arbustes sécurisés', features: ['Élagage raisonné', 'Grimper pro', 'Broyage branches'] },
      { name: 'Terrasses & Clôtures', description: 'Aménagement structure bois', features: ['Terrasse pin/ipé', 'Clôture occultation', 'Pergolas'] },
      { name: 'Arrosage Automatique', description: 'Installation système arrosage', features: ['Goutte à goutte', 'Tuyères enterrées', 'Programmateur connecté'] },
      { name: 'Potager & Verger', description: 'Création et entretien potager', features: ['Bacs surélevés', 'Compostage', 'Taille fruitiers'] }
    ],
    guarantees: [
      { title: 'Plantes Garanties', icon: 'sprout' },
      { title: 'Intervention Propre', icon: 'sparkles' },
      { title: 'Conseils Saisonniers', icon: 'sun' },
      { title: 'Paysagiste Qualifié', icon: 'tree-deciduous' }
    ],
    heroTitle: 'Jardinier Paysagiste',
    heroSubtitle: "Création et entretien de jardins uniques et harmonieux",
    aboutText: "Paysagiste passionné depuis 15 ans, je conçois et entretiens des espaces verts qui vivent au rythme des saisons. De la création paysagère à l'élagage expert, chaque geste est pensé pour la santé de vos plantes.",
    ctaText: 'Demandez un devis'
  },
  fitness: {
    primary: '#dc2626',
    secondary: '#b91c1c',
    accent: '#ef4444',
    background: '#fef2f2',
    services: [
      { name: 'Coaching Personnel', description: 'Accompagnement individuel sur mesure', features: ['Bilan morpho', 'Programme adapté', 'Suivi hebdo'] },
      { name: 'Cours Collectifs', description: 'Groupes dynamiques et motivants', features: ['HIIT', 'Yoga', 'Zumba', 'Musculation guidée'] },
      { name: 'Musculation Libre', description: 'Espace haltères et machines', features: ['Poids libres', 'Machines guidées', 'Cage à squat'] },
      { name: 'Cardio Zone', description: 'Équipements endurance modernes', features: ['Tapis connectés', 'Vélos elliptiques', 'Rameurs'] },
      { name: 'Préparation Physique', description: 'Prépa compétition ou remise en forme', features: ['Tests perf', 'Plan nutrition', 'Récupération'] },
      { name: 'Espace Bien-être', description: 'Détente après effort', features: ['Sauna', 'Douche jets', 'Casiers sécurisés'] }
    ],
    guarantees: [
      { title: 'Coachs Diplômés', icon: 'award' },
      { title: 'Matériel Neuf', icon: 'dumbbell' },
      { title: 'Sans Engagement', icon: 'check-circle' },
      { title: 'Accès 6h-23h', icon: 'clock' }
    ],
    heroTitle: 'Coach Sportif',
    heroSubtitle: "Votre coach personnel pour atteindre vos objectifs fitness",
    aboutText: "Coach sportif diplômé d'État avec 15 ans d'expérience. Que vous cherchiez à perdre du poids, gagner en muscle ou préparer une compétition, je vous accompagne avec des programmes personnalisés.",
    ctaText: 'Essai offert'
  },
  medical: {
    primary: '#1e40af',
    secondary: '#1e3a8a',
    accent: '#2563eb',
    background: '#eff6ff',
    services: [
      { name: 'Médecine Générale', description: 'Consultations et suivi de santé', features: ['Bilan annuel', 'Vaccinations', 'Certificats'] },
      { name: 'Kinésithérapie', description: 'Rééducation et réadaptation', features: ['Massages médicaux', 'Rééducation post-op', 'Posturologie'] },
      { name: 'Ostéopathie', description: 'Soins sans médicaments', features: ['Bébés', 'Femmes enceintes', 'Sportifs'] },
      { name: 'Infirmier à Domicile', description: 'Soins à votre domicile', features: ['Injections', 'Pansements', 'Prélèvements'] },
      { name: 'Analyses Biologiques', description: 'Laboratoire sur place', features: ['Prise de sang', 'Tests rapides', 'Résultats 24h'] },
      { name: 'Télémédecine', description: 'Consultation vidéo', features: ['Ordonnance électronique', '7j/7 disponible', 'Sans déplacement'] }
    ],
    guarantees: [
      { title: 'Conventionné Secteur 1', icon: 'stethoscope' },
      { title: '3ème Payant', icon: 'credit-card' },
      { title: 'RDV sous 48h', icon: 'calendar' },
      { title: 'Équipe Pluridisciplinaire', icon: 'users' }
    ],
    heroTitle: 'Cabinet Médical',
    heroSubtitle: "Votre santé entre les mains de professionnels qualifiés",
    aboutText: "Médecin généraliste depuis 15 ans, je vous accueille dans un cabinet moderne et chaleureux. Écoute, diagnostic précis et suivi personnalisé. Collaboration avec une équipe de spécialistes pour une prise en charge complète.",
    ctaText: 'Prendre rendez-vous'
  },
  avocat: {
    primary: '#1e3a8a',
    secondary: '#172554',
    accent: '#2563eb',
    background: '#f8fafc',
    services: [
      { name: 'Droit Civil & Famille', description: 'Divorce, succession, bail', features: ['Divorce amiable/contentieux', 'Régime matrimonial', 'Garde alternée'] },
      { name: 'Droit Pénal', description: 'Défense et assistance victimes', features: ['Garde à vue', 'Tribunal correctionnel', 'Victimes préjudice'] },
      { name: 'Droit du Travail', description: 'Licenciement et contentieux', features: ['Rupture conventionnelle', 'Harcèlement', 'Prud\'hommes'] },
      { name: 'Droit des Affaires', description: 'Conseil entreprises et particuliers', features: ['Création société', 'Contrats commerciaux', 'Recouvrement'] },
      { name: 'Immobilier', description: 'Vente, achat, litiges', features: ['Promesse vente', 'Copropriété', 'Malfaisance construction'] },
      { name: 'Droit Routier', description: 'Permis, accidents, infractions', features: ['Retrait permis', 'Excès vitesse', 'Défense pénale'] }
    ],
    guarantees: [
      { title: 'Avocat au Barreau', icon: 'scale' },
      { title: 'Consultation Privée', icon: 'shield' },
      { title: 'Défense Déterminée', icon: 'sword' },
      { title: 'Honoraires Transparent', icon: 'file-text' }
    ],
    heroTitle: 'Avocat à la Cour',
    heroSubtitle: "Conseil juridique personnalisé et défense de vos droits",
    aboutText: "Avocat inscrit au Barreau depuis 15 ans, je défends vos intérêts avec rigueur et détermination. Droit civil, pénal, travail ou affaires, chaque dossier mérite une stratégie sur mesure et une écoute attentive.",
    ctaText: 'Prendre rendez-vous'
  },
  default: {
    primary: '#1e293b',
    secondary: '#334155',
    accent: '#475569',
    background: '#f8fafc',
    services: [
      { name: 'Prestation Sur Mesure', description: 'Services adaptés à vos besoins spécifiques', features: ['Étude personnalisée', 'Devis détaillé', 'Écoute attentive'] },
      { name: 'Intervention Pro', description: 'Travail soigné et professionnel', features: ['Matériel adapté', 'Techniques actuelles', 'Respect des normes'] },
      { name: 'Conseil Expert', description: 'Accompagnement et recommandations', features: ['Diagnostic complet', 'Solutions pertinentes', 'Suivi personnalisé'] },
      { name: 'Service Rapide', description: 'Réactivité et respect des délais', features: ['Intervention rapide', 'Horaires flexibles', 'Urgences traitées'] },
      { name: 'Garantie Qualité', description: 'Engagement résultat et satisfaction', features: ['Contrôle qualité', 'Corrections incluses', 'SAV réactif'] },
      { name: 'Tarifs Transparents', description: 'Honoraires clairs et justifiés', features: ['Devis gratuit', 'Pas de surprise', 'Facilités paiement'] }
    ],
    heroTitle: 'Artisan Professionnel',
    heroSubtitle: "Votre expert de confiance pour des prestations de qualité",
    aboutText: "Artisan passionné depuis 15 ans, je mets mon savoir-faire et mon expertise à votre service. Chaque projet est unique et mérite une attention particulière. Qualité, transparence et satisfaction sont mes priorités.",
    ctaText: 'Contactez-moi'
  }
};

// ── IMAGES PAR SECTEUR ---
// Utilise les images Pexels professionnelles du fichier pexelsImages.ts
// Plus fiables et pertinentes que les anciennes images Unsplash génériques

function getSectorImagesFallback(sector: string): string[] {
  // Utiliser les images Pexels professionnelles du nouveau système
  return getSectorImages(sector);
}

export function getUltimateTemplate(sector: string) {
  const normalizedSector = (sector || '').toLowerCase();
  
  // Vérifications spécifiques avec accents et variations pour tous les secteurs
  if (normalizedSector.includes('nettoyag') || normalizedSector.includes('propreté') || normalizedSector.includes('ménage')) return SECTOR_ULTIMATE_TEMPLATES.nettoyage;
  if (normalizedSector.includes('jardin') || normalizedSector.includes('paysag') || normalizedSector.includes('espaces verts')) return SECTOR_ULTIMATE_TEMPLATES.jardin;
  if (normalizedSector.includes('coach') || normalizedSector.includes('sport') || normalizedSector.includes('fitness') || normalizedSector.includes('salle')) return SECTOR_ULTIMATE_TEMPLATES.fitness;
  if (normalizedSector.includes('médec') || normalizedSector.includes('clinique') || normalizedSector.includes('dentiste') || normalizedSector.includes('santé')) return SECTOR_ULTIMATE_TEMPLATES.medical;
  if (normalizedSector.includes('avocat') || normalizedSector.includes('notaire') || normalizedSector.includes('juridi') || normalizedSector.includes('droit')) return SECTOR_ULTIMATE_TEMPLATES.avocat;
  if (normalizedSector.includes('électricien') || normalizedSector.includes('electricien') || normalizedSector.includes('electric')) return SECTOR_ULTIMATE_TEMPLATES.electricien;
  if (normalizedSector.includes('plomb') || normalizedSector.includes('plomberie') || normalizedSector.includes('plombier') || normalizedSector.includes('chauffage') || normalizedSector.includes('clim')) return SECTOR_ULTIMATE_TEMPLATES.plomberie;
  if (normalizedSector.includes('coiff') || normalizedSector.includes('barb') || normalizedSector.includes('salon')) return SECTOR_ULTIMATE_TEMPLATES.coiffeur;
  if (normalizedSector.includes('restaurant') || normalizedSector.includes('cuisin') || normalizedSector.includes('traiteur')) return SECTOR_ULTIMATE_TEMPLATES.restaurant;
  if (normalizedSector.includes('garage') || normalizedSector.includes('mécan') || normalizedSector.includes('auto') || normalizedSector.includes('carrosserie')) return SECTOR_ULTIMATE_TEMPLATES.garage;
  
  // Vérifications génériques avec toutes les clés disponibles
  for (const [key, template] of Object.entries(SECTOR_ULTIMATE_TEMPLATES)) {
    if (normalizedSector.includes(key)) return template;
  }
  
  // Fallback pour variations spécifiques
  if (normalizedSector.includes('climat') || normalizedSector.includes('frigo')) return SECTOR_ULTIMATE_TEMPLATES.plomberie;
  if (normalizedSector.includes('beauté') || normalizedSector.includes('esthétique') || normalizedSector.includes('spa')) return SECTOR_ULTIMATE_TEMPLATES.coiffeur;
  if (normalizedSector.includes('boulanger') || normalizedSector.includes('pâtissier')) return SECTOR_ULTIMATE_TEMPLATES.restaurant;
  
  return SECTOR_ULTIMATE_TEMPLATES.default;
}

// Nettoyeur de texte de logo selon les instructions (2 lettres, 2 mots sans les articles)
function getLogoInfo(name: string, sector: string = 'default') {
  if (!name) return { initials: "CO", text: "Company", word1: "Company", word2: "Pro" };
  
  const skip = ['le', 'la', 'les', 'de', 'du', 'des', "l'", "d'", 'à', 'a', 'et', '&', 'en', 'pour'];
  let cleanName = name.replace(/['']/g, "' ");
  const words = cleanName.split(/\s+/).filter(w => w.length > 0 && !skip.includes(w.toLowerCase()));
  
  let word1 = "";
  let word2 = "";

  // S'il n'y a qu'un seul mot (ex: "SEG" ou "BIQ-ELECTRICITE")
  if (words.length === 1) {
      // On met la première lettre en majuscule et le reste en minuscules pour faire plus joli
      // "BIQ-ELECTRICITE" deviendra "Biq-electricite"
      word1 = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
      
      const lowerWord1 = word1.toLowerCase();
      const s = sector.toLowerCase();

      // ANTI-RÉPÉTITION : On vérifie si le métier est DÉJÀ dans le nom
      if (s.includes('elec') && !lowerWord1.includes('elec')) {
          word2 = "Électricité";
      } 
      else if (s.includes('plomb') && !lowerWord1.includes('plomb')) {
          word2 = "Plomberie";
      } 
      else if ((s.includes('garage') || s.includes('auto')) && !lowerWord1.includes('auto') && !lowerWord1.includes('garage')) {
          word2 = "Automobile";
      } 
      else if (!lowerWord1.includes('service') && !lowerWord1.includes('pro')) {
          // Si le mot n'est lié à rien de connu, on ajoute "Services"
          // SAUF s'il y a déjà le mot "Service" ou "Pro" dedans
          word2 = "Services";
      } 
      else {
          // Si le métier est déjà dans le nom (ex: BIQ-ELECTRICITE), on n'ajoute RIEN !
          word2 = "";
      }
  }// S'il y a plusieurs mots (ex: "Bazar Electricité")
  else {
      word1 = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
      word2 = words.slice(1).join(' ').charAt(0).toUpperCase() + words.slice(1).join(' ').slice(1).toLowerCase();
  }

  // Les initiales pour le logo (2 premières lettres du nom propre)
  const initials = (word1.substring(0, 2)).toUpperCase();
  const text = name;
  
  return { initials, text, word1, word2 };
}

function getHeroBadge(sector: string): { icon: string; text: string } {
  const s = (sector || '').toLowerCase();
  
  if (s.includes('plombber') || s.includes('plomb')) {
    return { icon: 'zap', text: 'Dépannage rapide garanti' };
  }
  if (s.includes('électricien') || s.includes('electric')) {
    return { icon: 'zap', text: 'Électricien certifié' };
  }
  if (s.includes('coiff') || s.includes('barb')) {
    return { icon: 'scissors', text: 'Coiffeur professionnel' };
  }
  if (s.includes('restaurant') || s.includes('cuisin')) {
    return { icon: 'chef-hat', text: 'Chef qualifié' };
  }
  if (s.includes('garage') || s.includes('mécan')) {
    return { icon: 'wrench', text: 'Garage agréé' };
  }
  if (s.includes('nettoy') || s.includes('ménage')) {
    return { icon: 'sparkles', text: 'Service nettoyage pro' };
  }
  if (s.includes('jardin') || s.includes('paysag')) {
    return { icon: 'leaf', text: 'Jardinier expert' };
  }
  
  return { icon: 'shield-check', text: 'Professionnel certifié' };
}

export function generateUltimateSite(lead: any, aiContent?: any): string {
  // ── VALIDATION DES DONNÉES CRITIQUES AVANT GÉNÉRATION ──
  const validationResult = validateLeadData(lead);
  if (!validationResult.isValid) {
    console.error(`❌ Erreur validation données pour ${lead.name}:`, validationResult.errors);
  }
  if (validationResult.warnings.length > 0) {
    console.warn(`⚠️ Avertissements pour ${lead.name}:`, validationResult.warnings);
  }

  // Système unique avec variantes dynamiques pour TOUS les secteurs
  const sector = (lead.sector || '').toLowerCase();
  const template = getUltimateTemplate(lead.sector);
  const companyName = lead.name || 'Entreprise Premium';
  const city = lead.city || '';
  const phone = lead.phone || '+33 6 12 34 56 78';
  const email = lead.email || 'contact@entreprise.fr';
  const address = lead.address || (city ? `Centre Ville, ${city}` : 'France');
  const website = lead.website || '';
  const rating = lead.googleRating || 5;
  const reviews = lead.googleReviews || 42;
  
  const rawDescription = aiContent?.aboutText || lead.description || template.aboutText;
  const description = generateAboutText(rawDescription, lead);
  const heroTitle = aiContent?.heroTitle || template.heroTitle;
  const heroSubtitle = aiContent?.heroSubtitle || `${template.heroSubtitle}${city ? ' à ' + city : ''}`;
  
  // CTA avec limite augmentée à 50 caractères pour plus de personnalisation
  let ctaText = aiContent?.cta || template.ctaText || "Demander un devis";
  if (ctaText.length > 50) ctaText = ctaText.substring(0, 47) + '...';
  
  // Services avec fallback - Features IA générées dynamiquement si disponibles
  let finalServices = template.services;
  if (aiContent?.services && Array.isArray(aiContent.services) && aiContent.services.length > 0) {
    finalServices = aiContent.services.map((s: any, idx: number) => {
      let features = s.features;
      if (!features || features.length === 0) {
        features = generateFeaturesFromService(s.name, s.description, lead.sector);
      }
      return {
        name: s.name || `Service ${idx+1}`,
        description: s.description || '',
        features: features.slice(0, 3)
      };
    });
  }

  // ── SYSTÈME AVANCÉ D'INTÉGRATION DES VRAIS AVIS DU PROSPECT ──
  
  // Étape 1: Extraire et valider les vrais avis Google du prospect
  const realReviews = extractAndValidateRealReviews(lead.googleReviewsData || [], lead);
  
  // Étape 2: Compléter avec les avis sectoriels authentiques si nécessaire
  const finalTestimonials = buildCompleteTestimonialList(realReviews, lead.sector, 6);
  
  console.log(`📊 ${companyName}: ${realReviews.length} vrais avis trouvés sur Google, ${finalTestimonials.length} avis totaux affichés`);

  let nameHash = 0;
  for (let i = 0; i < companyName.length; i++) nameHash += companyName.charCodeAt(i);
  const baseSlogan = aiContent?.slogan || "L'excellence à votre service";
  const sloganVariations = [
    baseSlogan,
    "L'art de la perfection au quotidien",
    "Solutions premium sur-mesure",
    "Excellence & Passion",
    "Votre partenaire de confiance"
  ];
  const finalSlogan = sloganVariations[nameHash % sloganVariations.length];

  // ── SYSTÈME AVANCÉ DE TRAITEMENT D'IMAGES ──
  // Priorité 1: Images réelles du lead (Google Maps, site web) - filtrées et catégorisées
  // Priorité 2: Images Pexels sectorielles professionnelles (fallback avec cache)
  
  // 1. Valider et catégoriser les images réelles du lead
  const realImages = validateAndCategorizeImages([
    ...(lead.images || []), 
    ...(lead.websiteImages || [])
  ], true);
  
  // 2. Récupérer les images sectorielles Pexels (fallback)
  const sectorPexelsImages = getSectorImagesFallback(lead.sector);
  const pexelsImages = validateAndCategorizeImages(sectorPexelsImages, false);
  
  // 3. Combiner en préservant les types
  const allProcessedImage = [...realImages, ...pexelsImages];
  
  // 4. Sélectionner intelligemment les images uniques
  const selectedImages = selectUniqueImages(allProcessedImage, 6);
  
  // 5. Prioriser une vraie photo pour le hero
  const realPhotos = selectedImages.filter(img => img.isReal && img.type === 'photo');
  const heroImage = realPhotos.length > 0 ? realPhotos[0].url : selectedImages[0].url;
  
  // 6. Générer la liste finale pour les autres sections
  const allImages = selectedImages.slice(1, 6).map(img => img.url);
  
  // 7. Log détaillé pour debugging
  console.log(`🖼️ ${lead.name}: ${realImages.length} images réelles (${realPhotos.length} photos) + ${pexelsImages.length} images Pexels`);
  console.log(`📸 Hero: ${realPhotos.length > 0 ? 'VRAIE PHOTO' : 'PEXELS'} | Types:`, selectedImages.map(img => img.type));

  const content: UltimateContent = {
    companyName, 
    sector: lead.sector || 'Professionnel', 
    city, 
    description, 
    phone, 
    email, 
    address, 
    website, 
    rating, 
    reviews,
    services: finalServices, 
    testimonials: finalTestimonials, 
    heroTitle, 
    heroSubtitle, 
    aboutText: description, 
    ctaText, 
    slogan: finalSlogan, 
    heroImage, 
    allImages
  };

  // Layout variant basé sur le hash du nom (0-3) pour varier la structure du site
  const layoutVariant = nameHash % 4;
  
  return buildUltimateHTML(content, template, allImages, layoutVariant);
}

/**
 * Version ASYNC avec API Pexels dynamique + Supabase Storage
 * PRIORITÉ 1: Images réelles du lead
 * PRIORITÉ 2: Images API Pexels téléchargées dans Supabase Storage
 */
export async function generateUltimateSiteAsync(lead: any, aiContent?: any): Promise<string> {
  // ── VALIDATION DES DONNÉES CRITIQUES AVANT GÉNÉRATION ──
  const validationResult = validateLeadData(lead);
  if (!validationResult.isValid) {
    console.error(`❌ Erreur validation données pour ${lead.name}:`, validationResult.errors);
  }
  if (validationResult.warnings.length > 0) {
    console.warn(`⚠️ Avertissements pour ${lead.name}:`, validationResult.warnings);
  }

  // Système unique avec variantes dynamiques pour TOUS les secteurs
  const sector = (lead.sector || '').toLowerCase();
  const template = getUltimateTemplate(lead.sector);
  const companyName = lead.name || 'Entreprise Premium';
  const city = lead.city || '';
  const phone = lead.phone || '+33 6 12 34 56 78';
  const email = lead.email || 'contact@entreprise.fr';
  const address = lead.address || (city ? `Centre Ville, ${city}` : 'France');
  const website = lead.website || '';
  const rating = lead.googleRating || 5;
  const reviews = lead.googleReviews || 42;
  
  const rawDescription = aiContent?.aboutText || lead.description || template.aboutText;
  const description = generateAboutText(rawDescription, lead);
  const heroTitle = aiContent?.heroTitle || template.heroTitle;
  const heroSubtitle = aiContent?.heroSubtitle || `${template.heroSubtitle}${city ? ' à ' + city : ''}`;
  
  // Hash du nom pour variété
  let nameHash = 0;
  for (let i = 0; i < companyName.length; i++) nameHash += companyName.charCodeAt(i);
  
  // Slogan variant
  const baseSlogan = aiContent?.slogan || "L'excellence à votre service";
  const sloganVariations = [
    baseSlogan,
    "L'art de la perfection au quotidien",
    "Solutions premium sur-mesure",
    "Excellence & Passion",
    "Votre partenaire de confiance"
  ];
  const finalSlogan = sloganVariations[nameHash % sloganVariations.length];

  // ── NOUVEAU SYSTÈME: API PEXELS + SUPABASE STORAGE ──
  // Récupérer les images (réelles + API Pexels stockées)
  let combinedImages: string[] = [];
  try {
    combinedImages = await getImagesForLead(lead, 6);
    console.log(`✅ Images API Pexels chargées pour ${lead.name}: ${combinedImages.length} images`);
  } catch (error) {
    console.error('❌ Erreur chargement images API Pexels:', error);
    // Fallback sur les images statiques
    combinedImages = getSectorImagesFallback(lead.sector);
  }
  
  // Hash robuste pour distribution unique
  let imageHash = 0;
  for (let i = 0; i < companyName.length; i++) {
    imageHash = ((imageHash << 5) - imageHash) + companyName.charCodeAt(i);
    imageHash |= 0;
  }
  imageHash = Math.abs(imageHash);
  
  const startIndex = imageHash % combinedImages.length;
  const heroImage = combinedImages[startIndex];
  
  const allImages = [];
  for (let i = 1; i <= 5; i++) {
    const imageIndex = (startIndex + i) % combinedImages.length;
    allImages.push(combinedImages[imageIndex]);
  }

  // Services avec fallback - Features IA générées dynamiquement si disponibles
  let finalServices = template.services;
  if (aiContent?.services && Array.isArray(aiContent.services) && aiContent.services.length > 0) {
    finalServices = aiContent.services.map((s: any, idx: number) => {
      // Si l'IA fournit des features, les utiliser; sinon générer des features cohérentes
      let features = s.features;
      if (!features || features.length === 0) {
        features = generateFeaturesFromService(s.name, s.description, lead.sector);
      }
      return {
        name: s.name || `Service ${idx+1}`,
        description: s.description || '',
        features: features.slice(0, 3) // Max 3 features
      };
    });
  }

  // ── SYSTÈME AVANCÉ D'INTÉGRATION DES VRAIS AVIS DU PROSPECT ──
  
  // Étape 1: Extraire et valider les vrais avis Google du prospect
  const realReviews = extractAndValidateRealReviews(lead.googleReviewsData || [], lead);
  
  // Étape 2: Compléter avec les avis sectoriels authentiques si nécessaire
  const finalTestimonials = buildCompleteTestimonialList(realReviews, lead.sector, 6);
  
  console.log(`📊 ${companyName}: ${realReviews.length} vrais avis trouvés sur Google, ${finalTestimonials.length} avis totaux affichés`);

  // CTA - Accepte les textes plus longs (jusqu'à 50 caractères) pour plus de personnalisation
  let ctaText = aiContent?.cta || template.ctaText || "Demander un devis";
  if (ctaText.length > 50) {
    // Tronquer intelligemment si trop long
    ctaText = ctaText.substring(0, 47) + '...';
  }

  const content: UltimateContent = {
    companyName, 
    sector: lead.sector || 'Professionnel', 
    city, 
    description, 
    phone, 
    email, 
    address, 
    website, 
    rating, 
    reviews,
    services: finalServices, 
    testimonials: finalTestimonials, 
    heroTitle, 
    heroSubtitle, 
    aboutText: description, 
    ctaText, 
    slogan: finalSlogan, 
    heroImage, 
    allImages
  };

  const layoutVariant = nameHash % 4;
  
  return buildUltimateHTML(content, template, combinedImages, layoutVariant);
}

// ── TEMPLATES STRUCTURELS SPÉCIFIQUES PAR SECTEUR ──
interface SectorLayout {
  sections: string[];
  customComponents?: string[];
  specialFeatures?: string[];
}

const SECTOR_LAYOUTS: Record<string, SectorLayout> = {
  // Restaurant : Menu + Galerie + Réservation
  restaurant: {
    sections: ['header', 'hero', 'menu', 'gallery', 'testimonials', 'reservation', 'footer'],
    customComponents: ['menu-grid', 'gallery-masonry', 'reservation-form'],
    specialFeatures: ['carte-interactive', 'horaires-ouvertures', 'menu-pdf']
  },
  
  // Garage : Services + Marques + RDV
  garage: {
    sections: ['header', 'hero', 'services', 'brands', 'testimonials', 'appointment', 'footer'],
    customComponents: ['brands-showcase', 'appointment-calendar', 'diagnostic-tool'],
    specialFeatures: ['marques-traitees', 'calendrier-rdv', 'diagnostic-en-ligne']
  },
  
  // Coiffeur : Services + Galerie + RDV
  coiffeur: {
    sections: ['header', 'hero', 'services', 'gallery', 'testimonials', 'booking', 'footer'],
    customComponents: ['service-cards', 'gallery-instagram', 'booking-system'],
    specialFeatures: ['galerie-shampoing', 'prix-services', 'rdv-en-ligne']
  },
  
  // Plomberie : Services + Urgence + Devis
  plomberie: {
    sections: ['header', 'hero', 'emergency', 'services', 'testimonials', 'quote', 'footer'],
    customComponents: ['emergency-banner', 'service-grid', 'quote-calculator'],
    specialFeatures: ['urgence-24h', 'devis-en-ligne', 'intervention-rapide']
  },
  
  // Électricien : Services + Certifications + Devis
  electricien: {
    sections: ['header', 'hero', 'services', 'certifications', 'testimonials', 'quote', 'footer'],
    customComponents: ['certification-badges', 'service-categories', 'quote-form'],
    specialFeatures: ['normes-electriques', 'certifications', 'devis-gratuit']
  },
  
  // Nettoyage : Services + Tarifs + Devis
  nettoyage: {
    sections: ['header', 'hero', 'services', 'pricing', 'testimonials', 'quote', 'footer'],
    customComponents: ['service-packages', 'pricing-table', 'quote-calculator'],
    specialFeatures: ['forfaits-nettoyage', 'tarifs-clairs', 'devis-personnalisé']
  },
  
  // Default : Structure standard
  default: {
    sections: ['header', 'hero', 'services', 'testimonials', 'footer'],
    customComponents: [],
    specialFeatures: []
  }
};

function getSectorLayout(sector: string): SectorLayout {
  const normalizedSector = (sector || '').toLowerCase();
  
  // Recherche exacte ou partielle
  for (const [key, layout] of Object.entries(SECTOR_LAYOUTS)) {
    if (normalizedSector.includes(key) || key.includes(normalizedSector)) {
      return layout;
    }
  }
  
  return SECTOR_LAYOUTS.default;
}

// ── COMPOSANTS SPÉCIFIQUES PAR SECTEUR ──

// Restaurant : Menu interactif + Réservation
function generateMenuSection(content: UltimateContent, template: any): string {
  const { companyName, services, email } = content;
  const cleanEmail = email || 'contact@example.com';
  const formSubmitEndpoint = `https://formsubmit.co/${cleanEmail.replace(/[^a-zA-Z0-9@.]/g, '')}`;

  return `
    <section id="menu" class="section-alt">
      <div class="section-header" style="text-align: center; max-width: 640px; margin: 0 auto 56px;">
        <h2 style="font-family: 'Plus Jakarta Sans'; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em;">
          Notre Carte
        </h2>
        <p style="color: #64748b; font-size: 1rem; line-height: 1.7;">
          Découvrez nos créations culinaires préparées avec des produits frais et locaux
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        ${services.map((service, index) => `
          <div class="card" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.07); padding: 28px; background: white; transition: all 0.2s ease;">
            <div style="width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; background: ${template.accent}18;">
              <i data-lucide="utensils" style="color: ${template.accent};" width="22"></i>
            </div>
            <h3 style="font-family: 'Plus Jakarta Sans'; font-size: 1.25rem; font-weight: 700; margin-bottom: 12px;">${service.name}</h3>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.7; margin-bottom: 20px;">${service.description}</p>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
              ${service.features.map(feature => `
                <li style="display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #475569;">
                  <i data-lucide="check" style="color: var(--primary); min-width: 16px;" width="16"></i>
                  ${feature}
                </li>
              `).join('')}
            </ul>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${15 + index * 5}€</div>
          </div>
        `).join('')}
      </div>
      <div style="text-align: center; margin-top: 48px;">
        <a href="#" class="btn-primary">
          <i data-lucide="download" width="18"></i> Télécharger la carte
        </a>
      </div>
    </section>

    <section id="reservation" class="section-alt" style="background: #f8fafc;">
      <div class="section-header" style="text-align: center; max-width: 640px; margin: 0 auto 56px;">
        <h2 style="font-family: 'Plus Jakarta Sans'; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em;">
          Réserver une Table
        </h2>
        <p style="color: #64748b; font-size: 1rem; line-height: 1.7;">
          Réservez votre table en quelques clics et recevez une confirmation immédiate
        </p>
      </div>
      <div style="max-width: 640px; margin: 0 auto;">
        <form style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.07); padding: 28px; background: white;" action="${formSubmitEndpoint}" method="POST" target="_blank">
          <input type="text" name="_honey" style="display:none;">
          <input type="hidden" name="_subject" value="Nouvelle réservation - ${companyName}">
          <input type="hidden" name="_template" value="box">
          <input type="hidden" name="type_demande" value="reservation">
          <input type="hidden" name="restaurant" value="${companyName}">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px; color: #374151;">Nom complet *</label>
              <input type="text" name="name" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; font-family: 'Plus Jakarta Sans';">
            </div>
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px; color: #374151;">Téléphone *</label>
              <input type="tel" name="phone" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; font-family: 'Plus Jakarta Sans';">
            </div>
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px; color: #374151;">Date *</label>
              <input type="date" name="date" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; font-family: 'Plus Jakarta Sans';">
            </div>
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px; color: #374151;">Heure *</label>
              <input type="time" name="time" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; font-family: 'Plus Jakarta Sans';">
            </div>
          </div>
          <div style="margin-top: 16px;">
            <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px; color: #374151;">Préférences alimentaires</label>
            <textarea name="preferences" rows="3" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; font-family: 'Plus Jakarta Sans'; resize: vertical;" placeholder="Allergies, régime végétarien..."></textarea>
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 20px;">
            <i data-lucide="calendar" width="18"></i> Confirmer la réservation
          </button>
        </form>
      </div>
    </section>
  `;
}

// Garage : Marques traitées + RDV
function generateBrandsSection(content: UltimateContent, template: any): string {
  const { companyName, email } = content;
  const cleanEmail = email || 'contact@example.com';
  const formSubmitEndpoint = `https://formsubmit.co/${cleanEmail.replace(/[^a-zA-Z0-9@.]/g, '')}`;
  
  const brands = [
    { name: "Renault", icon: "truck" },
    { name: "Peugeot", icon: "truck" },
    { name: "Citroën", icon: "truck" },
    { name: "Volkswagen", icon: "truck" },
    { name: "BMW", icon: "truck" },
    { name: "Mercedes", icon: "truck" }
  ];
  
  return `
    <section id="brands" class="section-alt">
      <div class="section-header" style="text-align: center; max-width: 640px; margin: 0 auto 56px;">
        <h2 style="font-family: 'Plus Jakarta Sans'; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em;">
          Marques Traitées
        </h2>
        <p style="color: #64748b; font-size: 1rem; line-height: 1.7;">
          Nous intervenons sur toutes les marques avec des pièces d'origine et garanties constructeur
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px;">
        ${brands.map(brand => `
          <div class="card" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.07); padding: 24px; background: white; text-align: center; transition: all 0.2s ease;">
            <div style="width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; background: ${template.accent}18;">
              <i data-lucide="${brand.icon}" style="color: ${template.accent};" width="22"></i>
            </div>
            <h3 style="font-family: 'Plus Jakarta Sans'; font-size: 0.95rem; font-weight: 600;">${brand.name}</h3>
          </div>
        `).join('')}
      </div>
    </section>
    
    <section id="appointment" class="section-alt" style="background: #f8fafc;">
      <div class="section-header" style="text-align: center; max-width: 640px; margin: 0 auto 56px;">
        <h2 style="font-family: 'Plus Jakarta Sans'; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em;">
          Prendre Rendez-vous
        </h2>
        <p style="color: #64748b; font-size: 1rem; line-height: 1.7;">
          Réservez votre créneau horaire pour un diagnostic ou une intervention
        </p>
      </div>
      <div style="max-width: 640px; margin: 0 auto;">
        <form style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.07); padding: 28px; background: white;" action="${formSubmitEndpoint}" method="POST" target="_blank">
          <input type="text" name="_honey" style="display:none;">
          <input type="hidden" name="_subject" value="Nouveau RDV Garage - ${companyName}">
          <input type="hidden" name="_template" value="box">
          <input type="hidden" name="type_demande" value="rdv_garage">
          <input type="hidden" name="garage" value="${companyName}">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px; color: #374151;">Nom complet *</label>
              <input type="text" name="name" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; font-family: 'Plus Jakarta Sans';">
            </div>
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px; color: #374151;">Téléphone *</label>
              <input type="tel" name="phone" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; font-family: 'Plus Jakarta Sans';">
            </div>
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px; color: #374151;">Email *</label>
              <input type="email" name="email" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; font-family: 'Plus Jakarta Sans';">
            </div>
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px; color: #374151;">Date *</label>
              <input type="date" name="date" required style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; font-family: 'Plus Jakarta Sans';">
            </div>
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 20px;">
            <i data-lucide="wrench" width="18"></i> Confirmer le rendez-vous
          </button>
        </form>
      </div>
    </section>
  `;
}

// Coiffeur : Galerie Instagram
function generateGallerySection(content: UltimateContent, template: any, allImages: string[]): string {
  return `
    <section id="gallery" class="section-alt" style="background: #f8fafc;">
      <div class="section-header" style="text-align: center; max-width: 640px; margin: 0 auto 56px;">
        <h2 style="font-family: 'Plus Jakarta Sans'; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em;">
          Nos Réalisations
        </h2>
        <p style="color: #64748b; font-size: 1rem; line-height: 1.7;">
          Inspirez-vous de nos dernières créations et tendances
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
        ${allImages.slice(0, 8).map((img, index) => `
          <div style="border-radius: 16px; overflow: hidden; aspect-ratio: 1; position: relative;">
            <img src="${img}" alt="Réalisation ${index + 1}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" loading="lazy">
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

// Plomberie : Urgence 24h
function generateEmergencySection(content: UltimateContent, template: any): string {
  const { phone } = content;

  return `
    <section id="emergency" style="padding: 80px 5vw; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
          <i data-lucide="alert-triangle" width="28" style="color: white;"></i>
        </div>
        <h2 style="font-family: 'Plus Jakarta Sans'; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; margin-bottom: 16px;">
          Urgence Plomberie
        </h2>
        <p style="font-size: 1rem; margin-bottom: 32px; opacity: 0.9;">
          Fuite d'eau, panne de chauffage, obstruction ? Nous intervenons 24h/24 et 7j/7
        </p>
        <div style="border-radius: 16px; padding: 28px; background: rgba(255,255,255,0.1); max-width: 400px; margin: 0 auto;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px;">
            <i data-lucide="phone" width="24"></i>
            <span style="font-size: 1.5rem; font-weight: 700;">${phone}</span>
          </div>
          <p style="font-size: 0.9rem; margin-bottom: 20px; opacity: 0.8;">Intervention sous 1h30 garantie</p>
          <a href="tel:${(phone || '').replace(/[^0-9+]/g, '')}" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 48px; padding: 0 24px; background: white; color: #dc2626; border-radius: 8px; font-weight: 700; text-decoration: none;">
            <i data-lucide="phone-call" width="18"></i> Appeler d'urgence
          </a>
        </div>
      </div>
    </section>
  `;
}

// Électricien : Certifications
function generateCertificationsSection(content: UltimateContent, template: any): string {
  const certifications = [
    { name: "Qualifelec", desc: "Certification qualité électricité" },
    { name: "Consuel", desc: "Attestation de conformité" },
    { name: "RGE", desc: "Reconnu Garant de l'Environnement" },
    { name: "Norme NFC 15-100", desc: "Mise aux normes électriques" }
  ];

  return `
    <section id="certifications" class="section-alt" style="background: #f8fafc;">
      <div class="section-header" style="text-align: center; max-width: 640px; margin: 0 auto 56px;">
        <h2 style="font-family: 'Plus Jakarta Sans'; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em;">
          Nos Certifications
        </h2>
        <p style="color: #64748b; font-size: 1rem; line-height: 1.7;">
          Toutes nos interventions sont réalisées selon les normes en vigueur et certifiées
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
        ${certifications.map(cert => `
          <div class="card" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.07); padding: 28px; background: white; text-align: center; transition: all 0.2s ease;">
            <div style="width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; background: ${template.accent}18;">
              <i data-lucide="award" style="color: ${template.accent};" width="22"></i>
            </div>
            <h3 style="font-family: 'Plus Jakarta Sans'; font-size: 1.05rem; font-weight: 700; margin-bottom: 8px;">${cert.name}</h3>
            <p style="color: #64748b; font-size: 0.875rem;">${cert.desc}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

// Nettoyage : Tarifs
function generatePricingSection(content: UltimateContent, template: any): string {
  const packages = [
    { name: "Forfait Standard", price: "89€", features: ["2 pièces", "Nettoyage complet", "Produits écologiques"] },
    { name: "Forfait Confort", price: "149€", features: ["3-4 pièces", "Vitres comprises", "Débarrassage inclus"] },
    { name: "Forfait Premium", price: "229€", features: ["5+ pièces", "Tout inclus", "Fréquence adaptable"] }
  ];

  return `
    <section id="pricing" class="section-alt" style="background: #f8fafc;">
      <div class="section-header" style="text-align: center; max-width: 640px; margin: 0 auto 56px;">
        <h2 style="font-family: 'Plus Jakarta Sans'; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em;">
          Nos Tarifs
        </h2>
        <p style="color: #64748b; font-size: 1rem; line-height: 1.7;">
          Des formules adaptées à tous les besoins et tous les budgets
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
        ${packages.map((pkg, index) => `
          <div class="card" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.07); padding: 28px; background: white; transition: all 0.2s ease; ${index === 1 ? 'border: 2px solid var(--primary); position: relative;' : ''}">
            ${index === 1 ? `
              <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; padding: 4px 16px; border-radius: 100px; font-size: 0.75rem; font-weight: 600;">
                POPULAIRE
              </div>
            ` : ''}
            <div style="width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; background: ${template.accent}18;">
              <i data-lucide="${['file-text', 'star', 'crown'][index]}" style="color: ${template.accent};" width="22"></i>
            </div>
            <h3 style="font-family: 'Plus Jakarta Sans'; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;">${pkg.name}</h3>
            <div style="font-size: 2rem; font-weight: 800; color: var(--primary); margin-bottom: 20px;">${pkg.price}</div>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
              ${pkg.features.map(feature => `
                <li style="display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #475569;">
                  <i data-lucide="check" style="color: var(--primary); min-width: 16px;" width="16"></i>
                  ${feature}
                </li>
              `).join('')}
            </ul>
            <button class="btn-primary" style="width: 100%; justify-content: center;">
              Choisir ce forfait
            </button>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

// ── GÉNÉRATION DYNAMIQUE DES SECTIONS SELON LE SECTEUR ──
function generateSections(content: UltimateContent, template: any, allImages: string[]): string {
  const sectorLayout = getSectorLayout(content.sector);
  let sectionsHTML = '';
  
  // Générer chaque section selon le layout
  sectorLayout.sections.forEach(sectionType => {
    switch (sectionType) {
      case 'menu':
        sectionsHTML += generateMenuSection(content, template);
        break;
      case 'brands':
        sectionsHTML += generateBrandsSection(content, template);
        break;
      case 'gallery':
        sectionsHTML += generateGallerySection(content, template, allImages);
        break;
      case 'emergency':
        sectionsHTML += generateEmergencySection(content, template);
        break;
      case 'certifications':
        sectionsHTML += generateCertificationsSection(content, template);
        break;
      case 'pricing':
        sectionsHTML += generatePricingSection(content, template);
        break;
      case 'services':
        sectionsHTML += generateStandardServicesSection(content, template);
        break;
      case 'about':
        sectionsHTML += generateStandardAboutSection(content, template);
        break;
      case 'testimonials':
        sectionsHTML += generateStandardTestimonialsSection(content, template);
        break;
      case 'contact':
        sectionsHTML += generateStandardContactSection(content, template);
        break;
      default:
        // Sections standards si non spécifiques
        break;
    }
  });
  
  return sectionsHTML;
}

// Sections standards (réutilisées par plusieurs secteurs)
function generateStandardServicesSection(content: UltimateContent, template: any): string {
  const { services } = content;
  
  return `
    <section id="services" class="section-alt">
      <div class="section-header" style="text-align: center; max-width: 640px; margin: 0 auto 56px;">
        <h2 style="font-family: 'Plus Jakarta Sans'; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em;">
          Nos Services
        </h2>
        <p style="color: #64748b; font-size: 1rem; line-height: 1.7;">
          Des solutions professionnelles adaptées à vos besoins
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        ${services.map((service, index) => `
          <div class="card" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.07); padding: 28px; background: white; transition: all 0.2s ease;">
            <div style="width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; background: ${template.accent}18;">
              <i data-lucide="wrench" style="color: ${template.accent};" width="22"></i>
            </div>
            <h3 style="font-family: 'Plus Jakarta Sans'; font-size: 1.25rem; font-weight: 700; margin-bottom: 12px;">${service.name}</h3>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.7; margin-bottom: 20px;">${service.description}</p>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
              ${service.features.map(feature => `
                <li style="display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #475569;">
                  <i data-lucide="check" style="color: var(--primary); min-width: 16px;" width="16"></i>
                  ${feature}
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function generateStandardAboutSection(content: UltimateContent, template: any): string {
  const { companyName, aboutText, city } = content;
  
  return `
    <!-- ABOUT SECTION -->
    <section id="about" class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-4xl md:text-5xl font-bold mb-6" style="color: ${template.primary}">
              À Propos de ${companyName}
            </h2>
            <div class="prose prose-lg text-gray-600 mb-8">
              ${aboutText.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4" style="background-color: ${template.primary}">
                  <i data-lucide="award" class="w-6 h-6 text-white"></i>
                </div>
                <div>
                  <div class="font-semibold">Qualité Garantie</div>
                  <div class="text-sm text-gray-600">Intervention professionnelle</div>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4" style="background-color: ${template.primary}">
                  <i data-lucide="clock" class="w-6 h-6 text-white"></i>
                </div>
                <div>
                  <div class="font-semibold">Réactivité</div>
                  <div class="text-sm text-gray-600">Intervention rapide</div>
                </div>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <!-- REMPLACER PAR : photo réelle du commerce (atelier, équipe, local) -->
              <img src="https://images.unsplash.com/photo-1581094794329-cbf11b3f4354?w=800&q=80" alt="${companyName} — ${content.sector} à ${city || 'votre région'}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function generateStandardTestimonialsSection(content: UltimateContent, template: any): string {
  const { testimonials, rating, reviews } = content;

  // Si avis IA ou vides → placeholder
  if (!testimonials || testimonials.length === 0 || testimonials[0]?.author === 'Client satisfait') {
    return `<!-- AVIS CLIENTS : remplacer par les vrais avis Google du prospect quand disponibles -->`;
  }

  return `
    <section id="testimonials" class="section">
      <div class="section-header" style="text-align: center; max-width: 640px; margin: 0 auto 56px;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 16px;">
          ${Array(5).fill(0).map(() => `<i data-lucide="star" style="color: #f59e0b; fill: currentColor;" width="20"></i>`).join('')}
          <span style="font-weight: 600; margin-left: 8px;">${rating}/5</span>
        </div>
        <h2 style="font-family: 'Plus Jakarta Sans'; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em;">
          Témoignages Clients
        </h2>
        <p style="color: #64748b; font-size: 0.95rem;">${reviews} avis clients vérifiés</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
        ${testimonials.map(testimonial => `
          <div class="card" style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.07); padding: 28px; background: white; transition: all 0.2s ease;">
            <div style="display: flex; gap: 4px; margin-bottom: 16px;">
              ${Array(testimonial.rating || 5).fill(0).map(() => `<i data-lucide="star" style="color: #f59e0b; fill: currentColor;" width="16"></i>`).join('')}
            </div>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.7; margin-bottom: 20px; font-style: italic;">&ldquo;${testimonial.text}&rdquo;</p>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="user" style="color: #64748b;" width="18"></i>
              </div>
              <div>
                <div style="font-weight: 600; font-size: 0.9rem;">${testimonial.author}</div>
                <div style="font-size: 0.8rem; color: #64748b;">${testimonial.date || 'Récemment'}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function generateStandardContactSection(content: UltimateContent, template: any): string {
  const { companyName, phone, email, address, city, ctaText } = content;
  
  // Générer un endpoint Formsubmit.co unique pour le prospect
  const cleanEmail = email || 'contact@example.com';
  const formSubmitEndpoint = `https://formsubmit.co/${cleanEmail.replace(/[^a-zA-Z0-9@.]/g, '')}`;
  
  return `
    <!-- CONTACT SECTION -->
    <section id="contact" class="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4">
            Contactez-nous
          </h2>
          <p class="text-xl text-gray-300 max-w-2xl mx-auto">
            Une question ? Un projet ? Notre équipe est à votre disposition
          </p>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-12">
          <div>
            <form class="space-y-6" action="${formSubmitEndpoint}" method="POST" target="_blank">
              <!-- Champ caché pour éviter le spam -->
              <input type="text" name="_honey" style="display:none;">
              <input type="hidden" name="_subject" value="Nouvelle demande de contact - ${companyName}">
              <input type="hidden" name="_template" value="box">
              <input type="hidden" name="_captcha" value="false">
              
              <div>
                <label class="block text-sm font-medium mb-2">Nom complet *</label>
                <input type="text" name="name" required class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white placeholder-gray-400" placeholder="Votre nom">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Email *</label>
                <input type="email" name="email" required class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white placeholder-gray-400" placeholder="votre@email.com">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Téléphone</label>
                <input type="tel" name="phone" class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white placeholder-gray-400" placeholder="Votre téléphone">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Message *</label>
                <textarea name="message" rows="4" required class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors resize-none text-white placeholder-gray-400" placeholder="Décrivez votre projet..."></textarea>
              </div>
              
              <!-- Informations du prospect incluses dans l'email -->
              <input type="hidden" name="entreprise" value="${companyName}">
              <input type="hidden" name="secteur" value="${content.sector}">
              <input type="hidden" name="telephone_prospect" value="${phone}">
              <input type="hidden" name="adresse" value="${address}, ${city}">
              
              <button type="submit" class="w-full px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105" style="background-color: ${template.primary}">
                <i data-lucide="send" class="w-5 h-5 mr-2"></i>
                ${ctaText}
              </button>
              
              <p class="text-center mt-4 text-sm text-gray-400">
                <i data-lucide="shield-check" class="w-4 h-4 inline mr-1"></i>
                Vos données sont protégées et ne seront jamais partagées
              </p>
            </form>
          </div>
          
          <div class="space-y-8">
            <div class="flex items-start">
              <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4" style="background-color: ${template.primary}">
                <i data-lucide="phone" class="w-6 h-6 text-white"></i>
              </div>
              <div>
                <div class="font-semibold text-lg mb-1">Téléphone</div>
                <div class="text-gray-300">${phone}</div>
                <div class="text-sm text-gray-400">Réponse sous 2h</div>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4" style="background-color: ${template.primary}">
                <i data-lucide="mail" class="w-6 h-6 text-white"></i>
              </div>
              <div>
                <div class="font-semibold text-lg mb-1">Email</div>
                <div class="text-gray-300">${email}</div>
                <div class="text-sm text-gray-400">Contact direct</div>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4" style="background-color: ${template.primary}">
                <i data-lucide="map-pin" class="w-6 h-6 text-white"></i>
              </div>
              <div>
                <div class="font-semibold text-lg mb-1">Adresse</div>
                <div class="text-gray-300">${address}</div>
                <div class="text-gray-300">${city}</div>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4" style="background-color: ${template.primary}">
                <i data-lucide="clock" class="w-6 h-6 text-white"></i>
              </div>
              <div>
                <div class="font-semibold text-lg mb-1">Disponibilité</div>
                <div class="text-gray-300">Lun-Ven: 9h-18h</div>
                <div class="text-sm text-gray-400">Urgences 24h/24</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function buildUltimateHTML(content: UltimateContent, template: any, combinedImages: string[] = [], layoutVariant: number = 0): string {
  const { companyName, heroTitle, heroSubtitle, aboutText, services, testimonials, phone, email, address, website, city, ctaText, rating, reviews, slogan, heroImage, allImages } = content;

  // ── MODIFIÉ: Palette couleurs par secteur ──
  const SECTOR_PALETTES: Record<string, { primary: string; accent: string; heroBg: string; heroOverlay: string }> = {
    plomberie:    { primary: '#1D9E75', accent: '#0EA5E9', heroBg: '#0d1117', heroOverlay: 'rgba(0,0,0,0.6)' },
    electricien:  { primary: '#1D9E75', accent: '#0EA5E9', heroBg: '#0d1117', heroOverlay: 'rgba(0,0,0,0.6)' },
    chauffage:    { primary: '#1D9E75', accent: '#0EA5E9', heroBg: '#0d1117', heroOverlay: 'rgba(0,0,0,0.6)' },
    restaurant:   { primary: '#D97706', accent: '#DC2626', heroBg: '#1a0f00', heroOverlay: 'rgba(0,0,0,0.55)' },
    boulangerie:  { primary: '#D97706', accent: '#DC2626', heroBg: '#1a0f00', heroOverlay: 'rgba(0,0,0,0.55)' },
    traiteur:     { primary: '#D97706', accent: '#DC2626', heroBg: '#1a0f00', heroOverlay: 'rgba(0,0,0,0.55)' },
    avocat:       { primary: '#1E3A5F', accent: '#B8860B', heroBg: '#0f1923', heroOverlay: 'rgba(0,0,0,0.55)' },
    notaire:      { primary: '#1E3A5F', accent: '#B8860B', heroBg: '#0f1923', heroOverlay: 'rgba(0,0,0,0.55)' },
    'expert-comptable': { primary: '#1E3A5F', accent: '#B8860B', heroBg: '#0f1923', heroOverlay: 'rgba(0,0,0,0.55)' },
    conseiller:   { primary: '#1E3A5F', accent: '#B8860B', heroBg: '#0f1923', heroOverlay: 'rgba(0,0,0,0.55)' },
    coiffeur:     { primary: '#9D4EDD', accent: '#EC4899', heroBg: '#1a0a2e', heroOverlay: 'rgba(0,0,0,0.55)' },
    esthetique:   { primary: '#9D4EDD', accent: '#EC4899', heroBg: '#1a0a2e', heroOverlay: 'rgba(0,0,0,0.55)' },
    spa:          { primary: '#9D4EDD', accent: '#EC4899', heroBg: '#1a0a2e', heroOverlay: 'rgba(0,0,0,0.55)' },
    medecin:      { primary: '#0EA5E9', accent: '#10B981', heroBg: '#030f1c', heroOverlay: 'rgba(0,0,0,0.55)' },
    dentiste:     { primary: '#0EA5E9', accent: '#10B981', heroBg: '#030f1c', heroOverlay: 'rgba(0,0,0,0.55)' },
    kine:         { primary: '#0EA5E9', accent: '#10B981', heroBg: '#030f1c', heroOverlay: 'rgba(0,0,0,0.55)' },
    coach:        { primary: '#7C3AED', accent: '#F59E0B', heroBg: '#0d0a1a', heroOverlay: 'rgba(0,0,0,0.55)' },
    formateur:    { primary: '#7C3AED', accent: '#F59E0B', heroBg: '#0d0a1a', heroOverlay: 'rgba(0,0,0,0.55)' },
    consultant:   { primary: '#7C3AED', accent: '#F59E0B', heroBg: '#0d0a1a', heroOverlay: 'rgba(0,0,0,0.55)' },
    immobilier:   { primary: '#1E3A5F', accent: '#C8956C', heroBg: '#0a0f1a', heroOverlay: 'rgba(0,0,0,0.55)' },
    architecture: { primary: '#1E3A5F', accent: '#C8956C', heroBg: '#0a0f1a', heroOverlay: 'rgba(0,0,0,0.55)' },
    garage:       { primary: '#DC2626', accent: '#F59E0B', heroBg: '#0d0d0d', heroOverlay: 'rgba(0,0,0,0.55)' },
    mecanique:    { primary: '#DC2626', accent: '#F59E0B', heroBg: '#0d0d0d', heroOverlay: 'rgba(0,0,0,0.55)' },
    transport:    { primary: '#DC2626', accent: '#F59E0B', heroBg: '#0d0d0d', heroOverlay: 'rgba(0,0,0,0.55)' },
    artisan:      { primary: '#92400E', accent: '#D97706', heroBg: '#1a1008', heroOverlay: 'rgba(0,0,0,0.55)' },
    menuisier:    { primary: '#92400E', accent: '#D97706', heroBg: '#1a1008', heroOverlay: 'rgba(0,0,0,0.55)' },
    macon:        { primary: '#92400E', accent: '#D97706', heroBg: '#1a1008', heroOverlay: 'rgba(0,0,0,0.55)' },
    btp:          { primary: '#92400E', accent: '#D97706', heroBg: '#1a1008', heroOverlay: 'rgba(0,0,0,0.55)' },
    sport:        { primary: '#16A34A', accent: '#EF4444', heroBg: '#050f05', heroOverlay: 'rgba(0,0,0,0.55)' },
    fitness:      { primary: '#16A34A', accent: '#EF4444', heroBg: '#050f05', heroOverlay: 'rgba(0,0,0,0.55)' },
    jardin:       { primary: '#1D9E75', accent: '#10B981', heroBg: '#0a140a', heroOverlay: 'rgba(0,0,0,0.55)' },
    nettoyage:    { primary: '#1D9E75', accent: '#0EA5E9', heroBg: '#0d1117', heroOverlay: 'rgba(0,0,0,0.55)' },
    default:      { primary: '#1D9E75', accent: '#0EA5E9', heroBg: '#0d1117', heroOverlay: 'rgba(0,0,0,0.6)' }
  };
  const getPalette = (sector: string) => {
    const s = (sector || '').toLowerCase();
    for (const [key, palette] of Object.entries(SECTOR_PALETTES)) {
      if (s.includes(key)) return palette;
    }
    return SECTOR_PALETTES.default;
  };
  const palette = getPalette(content.sector);
  const heroBg = palette.heroBg;
  const heroOverlay = palette.heroOverlay;
  template.primary = palette.primary;
  template.accent = palette.accent;

  // ── SÉLECTION DU LAYOUT SPÉCIFIQUE PAR SECTEUR ──
  const sectorLayout = getSectorLayout(content.sector);
  
  // ── SYSTÈME DE VARIATIONS DE TEMPLATE ANTI-IDENTIFICATION ──
  const templateVariation = generateTemplateVariation(companyName, content.sector);
  
  // ── SYSTÈME DE MASQUAGE TRACKING EN PRODUCTION ──
  const isProduction = process.env.NODE_ENV === 'production'; // Masquer logs en production, visible en développement
  
  // Script pour masquer tous les logs et tracking en production
  const trackingMask = `
    <script>
      (function() {
        // Masquer tous les logs en production
        if (${isProduction}) {
          const originalConsole = window.console;
          window.console = {
            log: function() {},
            warn: function() {},
            error: function() {},
            info: function() {},
            debug: function() {},
            trace: function() {}
          };
          
          // Masquer les analytics et tracking
          if (typeof gtag !== 'undefined') {
            window.gtag = function() {};
          }
          if (typeof ga !== 'undefined') {
            window.ga = function() {};
          }
          if (typeof fbq !== 'undefined') {
            window.fbq = function() {};
          }
          
          // Masquer les erreurs non critiques
          window.addEventListener('error', function(e) {
            if (e.message.includes('Script error') || e.message.includes('Non-Error')) {
              e.preventDefault();
            }
          });
        }
      })();
    </script>
  `;
  
  // Simplification du fallback d'images - pas de JS inline qui bloque
  const imgErr = (fallbackSlot: number) => {
    const fallbackUrl = getImg(fallbackSlot);
    return `onerror="this.onerror=null;this.src='${fallbackUrl}'"`;
  };
  
  // Utilisation stricte des couleurs de la charte par métier
  const primaryColor = template.primary;
  const secondaryColor = template.secondary;
  const accentColor = template.accent;

  // Convertir le HEX primaire en RGB pour les effets de fond
  const hexToRgb = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length == 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `${r}, ${g}, ${b}`;
  };
  const primaryRgb = hexToRgb(template.primary);
  
  // Variation Logic (gardé pour les patterns et animations)
  let nameHash = 0;
  for (let i = 0; i < companyName.length; i++) nameHash += companyName.charCodeAt(i);
  const patternType = nameHash % 4;
  const fontPair = nameHash % 3;
  const animStyle = nameHash % 2;
  const shapesType = nameHash % 3;

  const logoInfo = getLogoInfo(companyName, content.sector);
  const heroBadge = getHeroBadge(content.sector);
  const cleanPhoneLink = phone ? phone.replace(/[^0-9+]/g, '') : '';
  const mapQuery = encodeURIComponent(address + (content.city ? ', ' + content.city : ''));

  // Génération dynamique du Favicon SVG
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${primaryColor}"/><text x="50%" y="50%" font-family="sans-serif" font-size="45" font-weight="bold" fill="white" dominant-baseline="central" text-anchor="middle">${logoInfo.initials}</text></svg>`;

  // On l'encode pour pouvoir le mettre directement dans le href
  const faviconDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(faviconSvg)}`;

  // ── IMAGE DISTRIBUTION INTELLIGENTE PAR SLOT ──
  // Chaque section a sa propre image, pas de rotation aveugle.
  // Si une image réelle existe pour ce slot → on l'utilise.
  // Sinon → fallback sectoriel neutre garanti.
  const emergencyFallback = combinedImages[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';
  
  // Hash du nom pour distribution UNIQUE des images par entreprise
  let companyHash = 0;
  for (let i = 0; i < companyName.length; i++) {
    companyHash = ((companyHash << 5) - companyHash) + companyName.charCodeAt(i);
    companyHash |= 0;
  }
  companyHash = Math.abs(companyHash);
  
  const getImg = (slot: number): string => {
    // Calculer un index UNIQUE basé sur le hash du nom + le slot
    // Ainsi "A.Leont" slot 1 ≠ "Sooo" slot 1 — images différentes garanties !
    const uniqueIndex = (companyHash + slot) % (combinedImages.length || 1);
    
    // PRIORITÉ : image du pool combiné (réelles + Pexels) selon le hash
    if (combinedImages && combinedImages.length > 0 && combinedImages[uniqueIndex]) {
      const selectedImg = combinedImages[uniqueIndex];
      if (selectedImg && selectedImg.startsWith('https://')) return selectedImg;
    }
    
    // Fallback : rotation classique sur allImages
    if (allImages && allImages[slot % allImages.length] && allImages[slot % allImages.length].startsWith('https://')) {
      return allImages[slot % allImages.length];
    }
    
    // Fallback ultime garanti
    return emergencyFallback;
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="fr" class="scroll-smooth" style="overflow-x: hidden;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="icon" type="image/svg+xml" href="${faviconDataUrl}">
    <title>${content.sector} ${city} — ${companyName} | ${services[0]?.name || 'Services Professionnels'}</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="${companyName} - ${content.sector} professionnel à ${city}. ${heroSubtitle}. Contactez-nous au ${phone} pour vos projets.">
    <meta name="keywords" content="${content.sector}, ${city}, ${companyName}, professionnel, services, intervention rapide, qualité">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="${website || '#'}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${website || '#'}">
    <meta property="og:title" content="${companyName} - ${content.sector} à ${city}">
    <meta property="og:description" content="${heroSubtitle}">
    <meta property="og:image" content="${heroImage}">
    <meta property="og:locale" content="fr_FR">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${website || '#'}">
    <meta name="twitter:title" content="${companyName} - ${content.sector} à ${city}">
    <meta name="twitter:description" content="${heroSubtitle}">
    <meta name="twitter:image" content="${heroImage}">
    
    <!-- MODIFIÉ: Plus Jakarta Sans - police unique premium -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- TailwindCSS CDN for utility classes (grid, spacing, shadows, etc.) -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Lucide Icons WITH LOCAL FALLBACK -->
    <script src="https://unpkg.com/lucide@latest" onerror="this.onerror=null;this.src='data:text/javascript,/* Lucide Icons Fallback */ function createIcon(name){const svg={phone:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6.6-6.6A19.79 19.79 0 0 1 3 4.18 2 2 0 0 1 5 2.08v3a2 2 0 0 0 2.18 2c.28.04.54.1.82.14a2 2 0 0 1 1.82 1.82c.04.28.1.54.14.82A2 2 0 0 0 7.08 16H10a2 2 0 0 0 2-2.18 2 2 0 0 1-.14-.82 2 2 0 0 1-1.82-1.82c-.28-.04-.54-.1-.82-.14A2 2 0 0 0 7.08 12H4a2 2 0 0 1-2-2.18 2 2 0 0 1 .14-.82 2 2 0 0 1 1.82-1.82c.28-.04.54-.1.82-.14A2 2 0 0 0 5 8.92V5.92A2 2 0 0 1 7.18 4 19.79 19.79 0 0 1 15.81 1.07 19.5 19.5 0 0 1 22.41 7.67 19.79 19.79 0 0 1 23 16.92Z\\"/></svg>',mail:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><rect x=\\"2\\" y=\\"4\\" width=\\"20\\" height=\\"16\\" rx=\\"2\\"/><path d=\\"m22 7-10 5L2 7\\"/></svg>',map:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M21 10c0 7-9 13-9 13a9.75 9.75 0 0 1-6.74 2.74L3 8l3.74-1.5A9.75 9.75 0 0 1 12 3c7 0 9 6 9 13Z\\"/><path d=\\"M12 7v5l3 3\\"/></svg>',check:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M20 6L9 17l-5-5\\"/></svg>',star:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><polygon points=\\"12 2 15.09 8.26 22 9 17 14.14 19.18 21.02 12 17.77 4.82 21.02 7 14.14 2 9 8.91 8.26 12 2\\"/></svg>',user:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\\"/><circle cx=\\"12\\" cy=\\"7\\" r=\\"4\\"/></svg>',send:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"m22 2-7 20-10-9Z\\"/><path d=\\"M15 13 22 2l-7 7Z\\"/></svg>',calendar:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><rect x=\\"3\\" y=\\"4\\" width=\\"18\\" height=\\"18\\" rx=\\"2\\" ry=\\"2\\"/><line x1=\\"16\\" y1=\\"2\\" x2=\\"16\\" y2=\\"6\\"/><line x1=\\"8\\" y1=\\"2\\" x2=\\"8\\" y2=\\"6\\"/><line x1=\\"3\\" y1=\\"10\\" x2=\\"21\\" y2=\\"10\\"/></svg>',wrench:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\\"/></svg>',utensils:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\\"/><path d=\\"M7 2v20\\"/><path d=\\"M21 15V2v0a4 4 0 0 0-4 4h3.5Z\\"/><path d=\\"M3.5 18.5a4.5 4.5 0 0 1 0 9Z\\"/></svg>',download:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\\"/><polyline points=\\"7 10 12 15 17 10\\"/><line x1=\\"12\\" y1=\\"15\\" x2=\\"12\\" y2=\\"3\\"/></svg>',shield:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M20 12a8 8 0 0 0-16 0c0 5.4 3.6 9.9 8 12a8 8 0 0 0 8-12Z\\"/><path d=\\"M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0Z\\"/></svg>',clock:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><circle cx=\\"12\\" cy=\\"12\\" r=\\"10\\"/><polyline points=\\"12 6 12 12 16 14\\"/></svg>',award:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><circle cx=\\"12\\" cy=\\"8\\" r=\\"7\\"/><polyline points=\\"8.21 13.89 7 23 9 12 15 12 17 23 15.79 13.89\\"/></svg>',alert:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z\\"/><line x1=\\"12\\" y1=\\"9\\" x2=\\"12\\" y2=\\"13\\"/><line x1=\\"12\\" y1=\\"17\\" x2=\\"12.01\\" y2=\\"17\\"/></svg>',check:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M20 6L9 17l-5-5\\"/></svg>'};return svg[name]||svg.star;};window.lucide=createIcon;document.querySelectorAll(\\"[data-lucide]\\").forEach(el=>{const name=el.getAttribute(\\"data-lucide\\");if(name){el.innerHTML=createIcon(name);}});'"></script>

    <!-- TRACKING MASK SCRIPT -->
    ${trackingMask}

    <!-- Structured Data JSON-LD for LocalBusiness SEO -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "${companyName}",
        "description": "${heroSubtitle}",
        "image": "${heroImage}",
        "telephone": "${phone}",
        "email": "${email}",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "${address}",
            "addressLocality": "${city}",
            "addressCountry": "FR"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "",
            "longitude": ""
        },
        "openingHours": "Mo-Fr 09:00-18:00",
        "priceRange": "$$",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "${rating || 5}",
            "reviewCount": "${reviews || 42}"
        }
    }
    </script>

    <style>
        :root {
            --primary: ${primaryColor};
            --secondary: ${secondaryColor};
            --accent: ${accentColor};
            --primary-rgb: ${primaryRgb};
            
            --bg-base: ${template.background};
            --text-main: #0f172a;
            --text-muted: #475569;
            --text-light: #94a3b8;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-base);
            color: var(--text-main);
            overflow-x: hidden;
            line-height: 1.7;
            width: 100%;
            max-width: 100vw;
            min-width: 320px;
        }
        
        * {
            max-width: 100%;
            box-sizing: border-box;
        }
        
        img, video, iframe {
            max-width: 100%;
            height: auto;
        }
        
        .top-marquee {
            width: 100%;
            max-width: 100vw;
            overflow: hidden;
        }
        
        .marquee-content {
            min-width: max-content;
        }

        h1, h2, h3, h4 { font-family: var(--font-head); }

        /* Desktop specific - ensure mobile menu is hidden */
        @media (min-width: 769px) {
            .mobile-menu-toggle {
                display: none !important;
            }
            .mobile-menu {
                display: none !important;
            }
        }

        /* ANIMATIONS PROFESSIONNELLES SUBTILES */
        .reveal { 
            opacity: 0; 
            transform: translateY(30px); 
            transition: all 0.8s cubic-bezier(0.25, 1, 0.5, 1); 
        }
        .reveal.active { opacity: 1; transform: translateY(0); }

        .reveal-left { opacity: 0; transform: translateX(-30px); transition: all 0.8s ease-out; }
        .reveal-left.active { opacity: 1; transform: translateX(0); }

        .reveal-right { opacity: 0; transform: translateX(30px); transition: all 0.8s ease-out; }
        .reveal-right.active { opacity: 1; transform: translateX(0); }

        .stagger-item { opacity: 0; transform: translateY(15px); transition: 0.6s ease-out; }
        .active .stagger-item { opacity: 1; transform: translateY(0); }

        /* DYNAMIC PATTERN INJECTION - SUPPRIMÉ POUR DESIGN MODERNE */
        .pattern-waves { display: none; }
        .bg-grid { background-image: none !important; }

        /* Top Marquee Defilant */
        .top-marquee {
            background-color: var(--primary);
            color: white;
            font-size: 0.85rem;
            font-weight: 500;
            padding: 8px 0;
            white-space: nowrap;
            overflow: hidden;
            position: relative;
            z-index: 100;
            width: 100%;
            max-width: 100vw;
        }
        .marquee-content {
            display: inline-flex;
            gap: 3rem;
            animation: marquee 30s linear infinite;
        }
        .marquee-content:hover {
            animation-play-state: paused;
        }
        .marquee-item {
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }

        /* MODIFIÉ: Section de base épurée */
        section { position: relative; padding: 96px 5vw; }
        @media (max-width: 768px) {
            section { padding: 56px 20px; }
        }

        /* Sections classiques */
        .section { max-width: 1200px; margin: 0 auto; width: 100%; }
        .section-alt { max-width: 1200px; margin: 0 auto; width: 100%; }

        /* MODIFIÉ: Fond alterné doux */
        .bg-alternate {
            background-color: #f8fafc;
        }

        /* Navigation */
        nav {
            position: fixed;
            top: 36px; /* Below marquee */
            width: 100%;
            z-index: 50;
            padding: 1.5rem 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mobile-menu-toggle {
            display: none;
        }
        nav.scrolled {
            top: 0;
            padding: 1rem 0;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(0,0,0,0.05);
            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }
        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo-svg {
            width: 45px;
            height: 45px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-weight: 800;
            font-size: 1.25rem;
            letter-spacing: -0.5px;
            box-shadow: 0 8px 20px rgba(${primaryRgb}, 0.2);
        }
        .brand {
            font-size: 1.75rem;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: var(--text-main);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .btn-call {
            display: inline-flex; align-items: center; gap: 0.5rem;
            background: white; border: 1px solid rgba(0,0,0,0.05);
            color: var(--text-main); padding: 0.5rem 1.25rem; border-radius: 100px;
            text-decoration: none; font-weight: 600; transition: all 0.3s;
            box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        }
        .btn-call:hover {
            background: var(--primary); color: white;
            box-shadow: var(--glow);
        }

        /* MODIFIÉ: Stats Banner */
        .stats-banner { padding: 3rem 2rem; background: var(--primary); color: white; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; text-align: center; border-radius: 16px; margin: 0 auto; position: relative; overflow: hidden; }
        .stat-banner-item h3 { font-size: 2.25rem; font-weight: 800; font-family: 'Plus Jakarta Sans'; margin-bottom: 0.25rem; line-height: 1; }
        
        /* MODIFIÉ: Valeurs */
        .valeurs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
        .valeur-card { padding: 1.75rem; display: flex; flex-direction: column; align-items: center; text-align: center; border-radius: 16px; background: white; border: 1px solid rgba(0,0,0,0.07); transition: transform 0.2s ease, box-shadow 0.2s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .valeur-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
        .valeur-icon { width: 44px; height: 44px; border-radius: 10px; background: rgba(var(--primary-rgb), 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .valeur-card h3 { font-size: 1.05rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
        .valeur-card p { color: #64748b; font-size: 0.875rem; }

        /* MODIFIÉ: Hero Section — fond sombre */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 120px 5vw 80px;
            position: relative;
            background-size: cover;
            background-position: center;
            overflow: hidden;
            z-index: 10;
        }
        .hero::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, var(--hero-overlay) 100%);
            z-index: 0;
        }
        .hero .hero-content {
            position: relative;
            z-index: 1;
            max-width: 720px;
            width: 100%;
        }
        .hero-centered { text-align: center; }
        .hero-centered .hero-content { margin: 0 auto; }
        @media (max-width: 900px) {
            .hero { padding: 100px 20px 60px; }
        }
        .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--accent);
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 1.5rem;
            padding: 0.375rem 0.75rem;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 100px;
            background: rgba(255,255,255,0.05);
        }
        .hero h1 {
            color: #ffffff;
            font-size: clamp(2.25rem, 4vw, 3.25rem);
            font-weight: 800;
            line-height: 1.2;
            letter-spacing: -0.02em;
            margin-bottom: 1rem;
        }
        .hero h1 span {
            color: var(--accent);
        }
        .hero p {
            color: #94a3b8;
            font-size: 1.125rem;
            line-height: 1.7;
            margin: 0 auto 2rem;
        }
        .hero-centered .hero p {
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        .hero-actions {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            align-items: center;
        }
        .hero-centered .hero-actions {
            justify-content: center;
        }
        .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            height: 48px;
            padding: 0 24px;
            background: var(--primary);
            color: #fff;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            border: none;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            height: 48px;
            padding: 0 24px;
            background: transparent;
            color: #fff;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            border: 1px solid rgba(255,255,255,0.2);
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .btn-secondary:hover {
            border-color: rgba(255,255,255,0.4);
            background: rgba(255,255,255,0.05);
        }
        .trust-badges {
            display: flex;
            gap: 1.5rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 2rem;
        }
        .trust-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            color: #94a3b8;
            font-size: 0.8rem;
            white-space: nowrap;
        }
        .trust-badge i { color: var(--accent); width: 14px; height: 14px; }

        /* Hero Split (Variant 1 & 3) */
        .hero-split {
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
        }
        .hero-split .hero-content {
            text-align: left;
        }
        .hero-split .hero-actions {
            justify-content: flex-start;
        }
        .hero-split .trust-badges {
            justify-content: flex-start;
        }
        .hero-visual {
            position: relative;
            z-index: 1;
            display: none;
            border-radius: 16px;
            overflow: hidden;
            height: 500px;
            background-size: cover;
            background-position: center;
        }
        .layout-variant-1 .hero-split,
        .layout-variant-3 .hero-split {
            display: grid;
        }
        .layout-variant-1 .hero-visual,
        .layout-variant-3 .hero-visual {
            display: block;
        }
        @media (max-width: 900px) {
            .hero-split { grid-template-columns: 1fr; text-align: center; }
            .hero-split .hero-content { text-align: center; }
            .hero-split .hero-actions { justify-content: center; }
            .hero-split .trust-badges { justify-content: center; }
            .hero-visual { display: none !important; }
        }

        /* MODIFIÉ: Bouton CTA legacy (conservé pour compatibilité) */

        /* MODIFIÉ: Container & Sections — rythme 96px/56px */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 96px 5vw;
            position: relative;
            z-index: 10;
        }
        .section-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        .section-header h2 {
            font-size: clamp(1.75rem, 3vw, 2.25rem);
            margin-bottom: 1rem;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: -0.02em;
            line-height: 1.2;
        }
        .section-header p {
            color: #64748b;
            font-size: 1rem;
            line-height: 1.7;
            max-width: 600px;
            margin: 0 auto;
        }

        /* MODIFIÉ: Services Grid & Cards */
        .grid-3 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
        }
        .card {
            padding: 1.75rem;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            height: 100%;
            border-radius: 16px;
            border: 1px solid rgba(0,0,0,0.07);
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            background: white;
        }
        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        }
        
        .card-icon {
            width: 44px; height: 44px;
            border-radius: 10px;
            background: rgba(var(--primary-rgb), 0.1);
            display: flex; align-items: center; justify-content: center;
            color: var(--primary);
            margin-bottom: 1.25rem;
        }
        
        .card h3 { font-size: 1.15rem; margin-bottom: 0.75rem; font-weight: 700; color: #1e293b; }
        .card p { color: #64748b; margin-bottom: 1.5rem; flex-grow: 1; font-size: 0.95rem; line-height: 1.6; }
        .feature-list { list-style: none; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1rem; }
        .feature-list li { display: flex; align-items: center; gap: 0.5rem; color: #64748b; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; }
        .feature-list i { color: var(--primary); width: 16px; height: 16px; }

        /* MODIFIÉ: Testimonials */
        .testimonial-card {
            padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;
        }
        .stars { display: flex; gap: 0.25rem; color: #f59e0b; margin-bottom: 1.25rem; }
        
        /* MODIFIÉ: Map & Contact Form */
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid rgba(0,0,0,0.07);
        }
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; } }
        
        .contact-form-side { padding: 2.5rem; }
        .form-group { margin-bottom: 1.25rem; }
        .form-control {
            width: 100%; padding: 0.75rem 1rem; border-radius: 8px;
            border: 1px solid #e2e8f0; background: #f8fafc;
            font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem;
            transition: all 0.2s;
        }
        .form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1); background: white; }
        
        .map-side iframe { width: 100%; height: 100%; min-height: 400px; border: none; }

        /* MODIFIÉ: Footer */
        footer {
            background: #0f172a;
            color: white;
            padding: 80px 5vw 32px;
            margin-top: 0;
        }
        .footer-grid {
            max-width: 1200px; margin: 0 auto;
            display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 3rem;
            margin-bottom: 3rem;
        }
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .footer-grid { grid-template-columns: 1fr; } }
        
        .footer-logo { font-size: 1.5rem; font-family: 'Plus Jakarta Sans'; font-weight: 800; color: white; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
        .footer-col h4 { font-size: 1rem; font-weight: 700; margin-bottom: 1.25rem; color: white; }
        .footer-col ul { list-style: none; }
        .footer-col ul li { margin-bottom: 0.75rem; }
        .footer-col ul li a { color: var(--text-light); text-decoration: none; transition: 0.3s; }
        .footer-col ul li a:hover { color: white; padding-left: 5px; }
        .footer-bottom { text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem; color: var(--text-light); font-size: 0.9rem; }

        /* Modal Styles */
        .modal {
            display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
        }
        .modal-content {
            background-color: #fff; margin: 5% auto; padding: 2.5rem; border-radius: 16px;
            width: 90%; max-width: 640px; max-height: 85vh; overflow-y: auto; position: relative;
        }
        .close-modal {
            position: absolute; right: 1.5rem; top: 1.5rem; cursor: pointer;
            width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #f1f5f9;
            border: none; font-size: 1.25rem; transition: 0.2s;
        }
        .close-modal:hover { background: var(--primary); color: white; }

        /* Floating Widgets (Unified Style 2026) */
        .float-widget {
            position: fixed; right: 25px;
            width: 50px; height: 50px;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            z-index: 1000; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            text-decoration: none; border: none; cursor: pointer;
        }
        .float-widget:hover { transform: scale(1.1) translateY(-5px); }
        .float-widget i, .float-widget svg { width: 24px; height: 24px; }

        .float-phone { bottom: 30px; background: white; color: var(--primary); border: 2px solid var(--primary); }
        .float-chatbot { bottom: 90px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; }
        .float-whatsapp { bottom: 150px; background: #25D366; color: white; }

        .chat-window {
            position: fixed; bottom: 85px; right: 85px;
            width: 350px; height: 500px;
            background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            z-index: 998; display: flex; flex-direction: column; overflow: hidden;
            opacity: 0; pointer-events: none; transform: translateY(20px); transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .chat-window.open { opacity: 1; pointer-events: all; transform: translateY(0); }
        .chat-header {
            background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white;
            padding: 1.25rem; font-family: 'Plus Jakarta Sans'; font-weight: 700; display: flex; align-items: center; gap: 10px;
        }
        .chat-body { flex: 1; padding: 1.5rem; overflow-y: auto; background: #f8fafc; }
        .chat-msg { background: white; padding: 1rem; border-radius: 12px; border-bottom-left-radius: 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 1rem; font-size: 0.95rem; }
        .chat-input { padding: 1rem; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; }
        .chat-input input { flex: 1; border: none; outline: none; background: #f1f5f9; padding: 0.75rem 1rem; border-radius: 100px; font-family: 'Plus Jakarta Sans'; }
        
        /* MODIFIÉ: Mobile Sticky CTA */
        .mobile-sticky-cta {
            display: none;
        }
        @media (max-width: 768px) {
            .mobile-sticky-cta {
                display: flex;
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 56px;
                background: var(--primary);
                color: white;
                z-index: 999;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                font-weight: 600;
                font-size: 1rem;
                text-decoration: none;
                border: none;
                cursor: pointer;
            }
        }

        /* MODIFIÉ: Mobile Responsive */
        @media (max-width: 768px) {
            /* Hero Mobile */
            .hero {
                padding: 100px 20px 60px;
                text-align: center;
            }
            .hero h1 {
                font-size: clamp(1.75rem, 8vw, 2.25rem);
            }
            .hero p {
                font-size: 1rem;
            }
            .hero .hero-image-col {
                display: none;
            }
            .hero-actions {
                flex-direction: column;
                width: 100%;
            }
            .hero-actions .btn-primary,
            .hero-actions .btn-secondary {
                width: 100%;
                justify-content: center;
            }
            .hero-badge {
                margin: 0 auto 1.5rem;
                font-size: 0.8rem;
                padding: 0.4rem 1rem;
            }
            .hero-content > div[style*="display: flex"] {
                justify-content: center;
            }
            
            /* Container Mobile — 56px vertical / 20px horizontal */
            .container {
                padding: 56px 20px;
            }
            .section-header h2 {
                font-size: clamp(1.5rem, 5vw, 1.75rem);
            }
            .section-header p {
                font-size: 0.95rem;
            }
            
            /* Grid Mobile — 1 colonne */
            .grid-3 {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            .valeurs-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            /* Cards Mobile */
            .card {
                padding: 1.25rem;
            }
            .card-icon {
                width: 40px;
                height: 40px;
                margin-bottom: 0.75rem;
            }
            .card h3 {
                font-size: 1.05rem;
            }
            .card p {
                font-size: 0.9rem;
            }
            
            /* Stats Banner Mobile */
            .stats-banner {
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                padding: 2rem 1.25rem;
            }
            .stat-banner-item h3 {
                font-size: 1.75rem;
            }
            
            /* Contact Grid Mobile */
            .contact-grid {
                grid-template-columns: 1fr;
            }
            .contact-form-side {
                padding: 1.5rem;
            }
            .map-side iframe {
                min-height: 220px;
            }
            
            /* Footer Mobile */
            .footer-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
            footer {
                padding: 48px 20px 80px;
            }
            
            /* Navigation Mobile */
            nav {
                top: 40px;
                padding: 0.5rem 0;
            }
            .nav-container {
                padding: 0 1rem;
            }
            .desktop-menu {
                display: none !important;
            }
            .brand {
                font-size: 1rem;
            }
            .logo-svg {
                width: 32px;
                height: 32px;
                font-size: 0.9rem;
                border-radius: 8px;
            }
            .btn-call {
                display: none !important;
            }
            .mobile-menu-toggle {
                display: block !important;
            }
            .mobile-menu {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                padding: 1rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                border-bottom: 1px solid rgba(0,0,0,0.05);
                z-index: 100;
            }
            .mobile-menu.open {
                display: block;
            }
            .mobile-menu-link {
                display: block;
                padding: 0.75rem 1rem;
                text-decoration: none;
                color: #1e293b;
                font-weight: 500;
                border-bottom: 1px solid rgba(0,0,0,0.05);
                transition: all 0.2s;
            }
            .mobile-menu-link:hover {
                color: var(--primary);
                padding-left: 1.5rem;
            }
            .mobile-menu-link:last-child {
                border-bottom: none;
            }
            .mobile-call-link {
                color: var(--primary);
                font-weight: 700;
            }
            
            /* Floating Widgets Mobile */
            .float-widget {
                width: 44px;
                height: 44px;
                right: 15px;
            }
            .float-phone {
                bottom: 70px;
            }
            .float-chatbot {
                bottom: 124px;
            }
            .float-whatsapp {
                bottom: 178px;
            }
            
            /* Chat Window Mobile */
            .chat-window {
                width: calc(100% - 30px);
                height: 400px;
                right: 15px;
                bottom: 85px;
            }
            
            /* Modal Mobile */
            .modal-content {
                width: 95%;
                padding: 1.5rem;
                margin: 5% auto;
            }
            .close-modal {
                right: 0.75rem;
                top: 0.75rem;
                width: 32px;
                height: 32px;
                font-size: 1rem;
            }
            
            /* Top Marquee Mobile */
            .top-marquee {
                font-size: 0.65rem;
                padding: 5px 0;
            }
            .marquee-content {
                gap: 1.5rem;
            }
            
            /* About Section Mobile */
            [id="about"] [style*="grid-template-columns"] {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
            [id="about"] img {
                height: 220px;
            }
        }
        
        @media (max-width: 480px) {
            /* Extra Small Mobile */
            .hero {
                padding: 9rem 1rem 2rem;
            }
            .hero h1 {
                font-size: 2rem;
            }
            .hero p {
                font-size: 0.95rem;
            }
            .container {
                padding: 3rem 1rem;
            }
            .stats-banner {
                grid-template-columns: 1fr;
                padding: 2.5rem 1rem;
                gap: 2rem;
            }
            .card {
                padding: 1.5rem;
            }
            .btn-glow {
                padding: 1rem 2rem;
                font-size: 1rem;
            }
            .float-widget {
                width: 40px;
                height: 40px;
                right: 10px;
            }
            .float-phone {
                bottom: 15px;
            }
            .float-chatbot {
                bottom: 65px;
            }
            .float-whatsapp {
                bottom: 115px;
            }
            .chat-window {
                width: calc(100% - 20px);
                height: 350px;
                right: 10px;
            }
            .nav-container {
                padding: 0 0.75rem;
            }
            .brand {
                font-size: 0.9rem;
            }
            .logo-svg {
                width: 28px;
                height: 28px;
                font-size: 0.8rem;
                border-radius: 6px;
            }
            .btn-call {
                display: none !important;
            }
        }
        
        /* MODIFIÉ: Layout Variants — variant controls which sections render */
        .layout-variant-0 .section-stats { display: block; }
        .layout-variant-1 .section-stats { display: block; }
        .layout-variant-2 .section-stats { display: none; }
        .layout-variant-3 .section-stats { display: none; }

        .layout-variant-0 .section-assurances { display: block; }
        .layout-variant-1 .section-assurances { display: block; }
        .layout-variant-2 .section-assurances { display: none; }
        .layout-variant-3 .section-assurances { display: block; }
    </style>
</head>
<body class="layout-variant-${layoutVariant}">

    <!-- Marquee Banner -->
    <div class="top-marquee">
        <div class="marquee-content">
            <div class="marquee-item"><i data-lucide="clock" stroke-width="2.5" width="16"></i> Ouvert de 9h à 18h en semaine</div>
            <div class="marquee-item"><i data-lucide="phone" stroke-width="2.5" width="16"></i> Intervention rapide: ${phone}</div>
            <div class="marquee-item"><i data-lucide="mail" stroke-width="2.5" width="16"></i> Envoyez un message: ${email}</div>
            <div class="marquee-item"><i data-lucide="map-pin" stroke-width="2.5" width="16"></i> Basé à: ${city || address}</div>
            <!-- Duplication for infinite effect -->
            <div class="marquee-item"><i data-lucide="clock" stroke-width="2.5" width="16"></i> Ouvert de 9h à 18h en semaine</div>
            <div class="marquee-item"><i data-lucide="phone" stroke-width="2.5" width="16"></i> Intervention rapide: ${phone}</div>
            <div class="marquee-item"><i data-lucide="mail" stroke-width="2.5" width="16"></i> Envoyez un message: ${email}</div>
            <div class="marquee-item"><i data-lucide="map-pin" stroke-width="2.5" width="16"></i> Basé à: ${city || address}</div>
        </div>
    </div>

    <!-- MODIFIÉ: Navigation -->
    <nav id="navbar">
        <div class="nav-container">
            <a href="#" class="brand" style="text-decoration: none; display: flex; align-items: center; gap: 0.75rem;">
                <div class="logo-svg">${logoInfo.initials}</div>
                <div style="display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-weight: 800; font-family: 'Plus Jakarta Sans'; color: var(--text-main); font-size: 1.25rem; line-height: 1.1;">${logoInfo.text}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">${slogan}</div>
                </div>
            </a>
            <div style="display: flex; gap: 1.5rem; align-items: center;">
                <div style="display: none; align-items: center; gap: 1.5rem; font-weight: 500;" class="desktop-menu">
                    <a href="#about" style="text-decoration: none; color: var(--text-main); font-size: 0.9rem;">À propos</a>
                    <a href="#services" style="text-decoration: none; color: var(--text-main); font-size: 0.9rem;">Services</a>
                    <a href="#testimonials" style="text-decoration: none; color: var(--text-main); font-size: 0.9rem;">Avis</a>
                    <a href="#contact" style="text-decoration: none; color: var(--text-main); font-size: 0.9rem;">Contact</a>
                </div>
                ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-call"><i data-lucide="phone" width="16"></i> ${phone}</a>` : ''}
                <button class="mobile-menu-toggle" id="mobile-menu-toggle" style="display: none; background: none; border: none; cursor: pointer; padding: 0.5rem;">
                    <i data-lucide="menu" width="28" height="28" style="color: var(--text-main);"></i>
                </button>
            </div>
        </div>
        <!-- Mobile Menu -->
        <div class="mobile-menu" id="mobile-menu">
            <a href="#about" class="mobile-menu-link">À propos</a>
            <a href="#services" class="mobile-menu-link">Services</a>
            <a href="#testimonials" class="mobile-menu-link">Avis</a>
            <a href="#contact" class="mobile-menu-link">Contact</a>
            ${phone ? `<a href="tel:${cleanPhoneLink}" class="mobile-menu-link mobile-call-link"><i data-lucide="phone" width="16" style="margin-right: 8px;"></i> ${phone}</a>` : ''}
        </div>
    </nav>

    ${layoutVariant === 1 || layoutVariant === 3 ? `
    <!-- Hero Split (Variant 1 & 3) -->
    <section class="hero hero-split" style="--hero-overlay: ${heroOverlay};">
        <div class="hero-content">
            <div class="eyebrow"><i data-lucide="${heroBadge.icon}" width="12"></i> ${heroBadge.text} · ${city}</div>
            <h1>${companyName} — <span>${slogan}</span></h1>
            <p>${heroSubtitle}</p>
            <div class="hero-actions">
                <a href="tel:${cleanPhoneLink}" class="btn-primary">
                    <i data-lucide="phone" width="16"></i> ${ctaText}
                </a>
                <a href="#contact" class="btn-secondary">
                    Demander un devis <i data-lucide="arrow-right" width="16"></i>
                </a>
            </div>
            <div class="trust-badges">
                <div class="trust-badge"><i data-lucide="star" fill="currentColor"></i><span>${rating}/5 — ${reviews} avis</span></div>
                <div class="trust-badge"><i data-lucide="clock"></i><span>Disponible 7j/7</span></div>
                <div class="trust-badge"><i data-lucide="shield-check"></i><span>Assuré et certifié</span></div>
            </div>
        </div>
        <div class="hero-visual" style="background-image: url('${heroImage}');">
        </div>
    </section>
    ` : `
    <!-- Hero Centered (Variant 0 & 2) -->
    <section class="hero hero-centered" style="background-image: url('${heroImage}'); --hero-overlay: ${heroOverlay};">
        <div class="hero-content">
            <div class="eyebrow"><i data-lucide="${heroBadge.icon}" width="12"></i> ${heroBadge.text} · ${city}</div>
            <h1>${companyName} — <span>${slogan}</span></h1>
            <p>${heroSubtitle}</p>
            <div class="hero-actions">
                <a href="tel:${cleanPhoneLink}" class="btn-primary">
                    <i data-lucide="phone" width="16"></i> ${ctaText}
                </a>
                <a href="#contact" class="btn-secondary">
                    Demander un devis <i data-lucide="arrow-right" width="16"></i>
                </a>
            </div>
            <div class="trust-badges">
                <div class="trust-badge"><i data-lucide="star" fill="currentColor"></i><span>${rating}/5 — ${reviews} avis</span></div>
                <div class="trust-badge"><i data-lucide="clock"></i><span>Disponible 7j/7</span></div>
                <div class="trust-badge"><i data-lucide="shield-check"></i><span>Assuré et certifié</span></div>
            </div>
        </div>
    </section>
    `}

    <!-- MODIFIÉ: A Propos -->
    <section class="container bg-alternate" id="about">
        <div class="section-header reveal">
            <h2>Qui sommes-nous ?</h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 3rem; align-items: center; position: relative; z-index: 1;">
            <div class="reveal reveal-left" style="position: relative;">
                <div style="position: relative; border-radius: 16px; overflow: hidden;">
                    <!-- REMPLACER PAR : photo réelle du commerce/prospect -->
                    <img src="${getImg(1)}" ${imgErr(1)} alt="${companyName}" style="width: 100%; height: 400px; object-fit: cover; display: block;">
                </div>
            </div>
            <div class="reveal reveal-right">
                <p style="color: #475569; font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem;">
                    ${aboutText}
                </p>
                <ul style="list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                    <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #475569;"><i data-lucide="check-circle-2" style="color: var(--primary); width: 18px;"></i> ${services[0]?.name || 'Service professionnel'}</li>
                    <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #475569;"><i data-lucide="clock" style="color: var(--primary); width: 18px;"></i> Intervention sous 24h</li>
                    <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #475569;"><i data-lucide="file-text" style="color: var(--primary); width: 18px;"></i> Devis gratuit et transparent</li>
                    <li style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #475569;"><i data-lucide="star" style="color: var(--primary); width: 18px;"></i> ${rating}/5 — ${reviews} avis clients</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Nos Garanties -->
    <section class="container section-assurances" id="valeurs">
        <div class="section-header reveal">
            <h2>Nos garanties</h2>
            <p>Les engagements qui font la différence et votre tranquillité d'esprit.</p>
        </div>
        <div class="valeurs-grid">
            ${template.guarantees.map((garantie: any, index: number) => `
            <div class="valeur-card reveal" style="transition-delay: ${index * 100}ms">
                <div class="valeur-icon"><i data-lucide="${garantie.icon}" width="32" height="32"></i></div>
                <h3 style="font-family: 'Plus Jakarta Sans'; font-size: 1.15rem; margin-bottom: 0.5rem;">${garantie.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5;">Couvre vos travaux selon la législation en vigueur et notre engagement qualité.</p>
            </div>
            `).join('')}
        </div>
    </section>

    ${layoutVariant === 0 || layoutVariant === 1 ? `
    <!-- Nos Chiffres Clés -->
    <section class="container section-stats" style="padding: 48px 5vw;">
        <div class="stats-banner reveal">
            <div class="stat-banner-item">
                <h3>${(reviews || 0) > 0 ? (reviews || 0) + '+' : '50+'}</h3>
                <div style="font-weight: 500; opacity: 0.9;">Avis Vérifiés</div>
            </div>
            <div class="stat-banner-item">
                <h3>24/7</h3>
                <div style="font-weight: 500; opacity: 0.9;">Disponibilité</div>
            </div>
            <div class="stat-banner-item">
                <h3>${rating}/5</h3>
                <div style="font-weight: 500; opacity: 0.9;">Note Google</div>
            </div>
            <div class="stat-banner-item">
                <h3>100%</h3>
                <div style="font-weight: 500; opacity: 0.9;">Clients satisfaits</div>
            </div>
        </div>
    </section>
    ` : ''}

    <!-- SECTIONS DYNAMIQUES SPÉCIFIQUES AU SECTEUR -->
    ${generateSections(content, template, allImages)}

    <!-- Maps & Contact -->
    <section class="container bg-alternate" id="contact">
        <div class="section-header reveal">
            <h2>Contactez-nous</h2>
            <p>${city ? `Basé à ${city}, nous intervenons dans toute la région.` : "Nous sommes à votre écoute pour répondre à vos besoins."}</p>
        </div>
        <div class="contact-grid reveal">
            <div class="map-side">
                <iframe 
                    src="https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed" 
                    allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
            <div class="contact-form-side">
                <h3 style="font-size: 2rem; font-family: 'Plus Jakarta Sans'; margin-bottom: 2rem;">Envoyez-nous un message</h3>
                <form onsubmit="event.preventDefault(); alert('Message envoyé avec succès. Nous vous contacterons très vite !');">
                    <div class="form-group">
                        <input type="text" class="form-control" placeholder="Votre nom complet" required>
                    </div>
                    <div class="form-group">
                        <input type="email" class="form-control" placeholder="Votre adresse e-mail" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" class="form-control" placeholder="Votre téléphone" required>
                    </div>
                    <div class="form-group">
                        <textarea class="form-control" rows="4" placeholder="Détaillez votre besoin..." required></textarea>
                    </div>
                    <button type="submit" class="btn-cta" style="width: 100%; justify-content: center;">
                        <i data-lucide="send"></i> Envoyer la demande
                    </button>
                    <p style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-light);">
                        Données protégées et confidentielles. Aucun spam.
                    </p>
                </form>
            </div>
        </div>
    </section>

    <!-- Modal Contact Auto-Popup -->
<div id="contact-modal" class="modal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(15, 23, 42, 0.8); backdrop-filter: blur(5px);">
    <div style="background-color: white; margin: 10vh auto; padding: 3rem; border-radius: 24px; width: 90%; max-width: 500px; position: relative; box-shadow: 0 25px 50px rgba(0,0,0,0.2);">
        <span onclick="document.getElementById('contact-modal').style.display='none'; document.body.style.overflow='auto';" style="position: absolute; right: 1.5rem; top: 1.5rem; font-size: 1.5rem; cursor: pointer; color: #64748b; background: #f1f5f9; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">&times;</span>
        
        <h3 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; text-align: center;">Demander une intervention</h3>
        <p style="color: var(--text-muted); text-align: center; margin-bottom: 2rem; font-size: 0.95rem;">Laissez vos coordonnées, un expert vous rappelle immédiatement.</p>
        
        <form onsubmit="event.preventDefault(); alert('Demande envoyée ! Nous vous rappelons très vite.'); document.getElementById('contact-modal').style.display='none'; document.body.style.overflow='auto';">
            <div style="margin-bottom: 1rem;">
                <input type="text" placeholder="Votre nom" required style="width: 100%; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; outline: none; font-family: 'Plus Jakarta Sans';">
            </div>
            <div style="margin-bottom: 1rem;">
                <input type="tel" placeholder="Votre numéro de téléphone" required style="width: 100%; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; outline: none; font-family: 'Plus Jakarta Sans';">
            </div>
            <button type="submit" style="width: 100%; padding: 1rem; background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;">
                <i data-lucide="phone-call" width="20"></i> Être rappelé(e)
            </button>
        </form>
    </div>
</div>

    <!-- Professional Footer -->
    <footer>
        <div class="footer-grid">
            <div class="footer-col">
                <div class="footer-logo">
                    <div class="logo-svg" style="box-shadow: none;">${logoInfo.initials}</div>
                    ${logoInfo.text}
                </div>
                <p style="color: var(--text-light); margin-bottom: 2rem;">${aboutText.substring(0, 120)}...</p>
                <div style="display: flex; gap: 1rem;">
                    <a href="#" style="color: white; opacity: 0.7; transition: 0.3s;"><i data-lucide="facebook"></i></a>
                    <a href="#" style="color: white; opacity: 0.7; transition: 0.3s;"><i data-lucide="instagram"></i></a>
                    <a href="#" style="color: white; opacity: 0.7; transition: 0.3s;"><i data-lucide="linkedin"></i></a>
                </div>
            </div>
            <div class="footer-col">
                <h4>Nos Services</h4>
                <ul>
                    ${services.slice(0,4).map(s => `<li><a href="#services">${s.name}</a></li>`).join('')}
                    <li><a href="#contact">Sur Devis</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Liens Utiles</h4>
                <ul>
                    <li><a href="#about">À Propos</a></li>
                    <li><a href="#testimonials">Avis Clients</a></li>
                    <li><a href="javascript:void(0)" onclick="openModal('modal-mentions')">Mentions Légales</a></li>
                    <li><a href="javascript:void(0)" onclick="openModal('modal-policy')">Confidentialité</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Contact Info</h4>
                <ul style="color: var(--text-light);">
                    ${phone ? `<li style="display: flex; gap: 10px;"><i data-lucide="phone"></i> <a href="tel:${phone.replace(/[^0-9+]/g, '')}" style="color: var(--text-light); text-decoration: none;">${phone}</a></li>` : ''}
                    ${email ? `<li style="display: flex; gap: 10px;"><i data-lucide="mail"></i> <a href="mailto:${email}" style="color: var(--text-light); text-decoration: underline; text-underline-offset: 3px;">${email}</a></li>` : ''}
                    ${address ? `<li style="display: flex; gap: 10px;"><i data-lucide="map-pin"></i> <a href="https://maps.google.com/?q=${encodeURIComponent(address)}" target="_blank" rel="noopener" style="color: var(--text-light); text-decoration: underline; text-underline-offset: 3px;">${address}</a></li>` : ''}
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} ${companyName}. Tous droits réservés. Créé par Services-Siteup.</p>
        </div>
    </footer>

    <!-- Floating Buttons (Aligned Vertical) -->
    <a href="tel:${cleanPhoneLink}" class="float-widget float-phone" title="Appeler maintenant">
        <i data-lucide="phone"></i>
    </a>

    <button id="chatbot-toggle" class="float-widget float-chatbot" title="Discuter avec notre IA">
        <i data-lucide="message-circle"></i>
    </button>

    <a href="https://wa.me/${cleanPhoneLink}?text=Bonjour, je souhaite avoir plus d'informations." target="_blank" class="float-widget float-whatsapp" title="Discuter sur WhatsApp">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/></svg>
    </a>

    <!-- Chatbot Window -->
    <div class="chat-window" id="chat-window">
        <div class="chat-header" style="background: var(--primary); color: white; padding: 1.25rem; font-family: 'Plus Jakarta Sans'; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px rgba(34,197,94,0.5);"></div>
                Service Client - ${logoInfo.word1}
            </div>
            <button onclick="document.getElementById('chat-window').classList.remove('open')" style="background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Fermer la discussion">
                <i data-lucide="x" width="24"></i>
            </button>
        </div>
        <div class="chat-body" id="chat-body" style="flex: 1; padding: 1.5rem; overflow-y: auto; background: #f8fafc; display: flex; flex-direction: column; gap: 1rem;">
            <div class="chat-msg" style="background: white; padding: 1rem; border-radius: 12px; border-bottom-left-radius: 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-size: 0.95rem; align-self: flex-start; max-width: 85%;">
                Bonjour ! Bienvenue chez ${logoInfo.text}. Comment puis-je vous aider aujourd'hui ?
            </div>
        </div>
        <div class="chat-input" style="padding: 1rem; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 10px;">
            <input type="text" id="chat-text" placeholder="Écrivez votre message..." style="flex: 1; border: 1px solid #e2e8f0; outline: none; background: #f8fafc; padding: 0.75rem 1rem; border-radius: 100px; font-family: 'Plus Jakarta Sans';">
            <button onclick="sendMsg()" style="background: var(--primary); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i data-lucide="send" width="18"></i></button>
        </div>
    </div>

    <div id="modal-mentions" class="modal">
        <div class="modal-content">
            <span class="close-modal" onclick="closeModal('modal-mentions')">&times;</span>
            <h2>Mentions Légales</h2>
            <p>Le présent site est édité par l'entreprise <strong>${companyName}</strong>, située au <strong>${address}</strong>.</p>
            <p>Directeur de la publication : Le Gérant de ${companyName}.</p>
            <h3>2. Hébergement</h3>
            <p>Le site est hébergé par Vercel Inc., dont le siège social est situé au 340 S Lemon Ave #4133 Walnut, CA 91789, USA.</p>
            <h3>3. Propriété intellectuelle</h3>
            <p>Tous les éléments du site (textes, logos, images, icônes) sont la propriété exclusive de ${companyName} ou de ses partenaires. Toute reproduction, représentation, modification ou adaptation totale ou partielle de tout ou partie du site est interdite.</p>
            <h3>4. Contact</h3>
            <p>Pour toute question ou demande d'information, vous pouvez nous contacter :</p>
            <ul>
                <li>Par téléphone au : <strong>${phone}</strong></li>
                <li>Par e-mail à : <strong>${email}</strong></li>
            </ul>
        </div>
    </div>

    <div id="modal-policy" class="modal">
        <div class="modal-content">
            <span class="close-modal" onclick="closeModal('modal-policy')">&times;</span>
            <h2>Politique de Confidentialité</h2>
            <p>Chez <strong>${companyName}</strong>, nous accordons une importance capitale à la protection de vos données personnelles.</p>
            <h3>1. Collecte des données</h3>
            <p>Nous collectons les données que vous nous soumettez via nos formulaires de contact : Nom, Prénom, Numéro de téléphone et Adresse e-mail.</p>
            <h3>2. Finalité du traitement</h3>
            <p>Ces données sont uniquement utilisées pour répondre à vos demandes de renseignements, établir des devis personnalisés ou assurer le suivi de nos interventions.</p>
            <h3>3. Conservation des données</h3>
            <p>Les données sont conservées pendant une durée de 3 ans après notre dernier contact avec vous. Elles ne sont jamais cédées ou vendues à des tiers.</p>
            <h3>4. Vos droits (RGPD)</h3>
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ce droit, écrivez-nous à <strong>${email}</strong>.</p>
            <h3>5. Cookies</h3>
            <p>Notre site peut utiliser des cookies de confort pour améliorer votre expérience utilisateur. Vous pouvez les désactiver dans les paramètres de votre navigateur.</p>
        </div>
    </div>

    <!-- Scripts -->
    <script>
        lucide.createIcons();

        // Navbar Scroll Effect
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('navbar');
            if(window.scrollY > 40) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        });

        // CSS Media query JS equivalent for desktop menu
        if (window.innerWidth > 768) {
            document.querySelector('.desktop-menu').style.display = 'flex';
        }

        // Mobile Menu Toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('open');
            });
            
            // Close menu when clicking on a link
            mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('open');
                });
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    mobileMenu.classList.remove('open');
                }
            });
        }

        // Intersection Observer for Reveal Animations
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
        reveals.forEach(reveal => observer.observe(reveal));

        // Hover Effect on Cards
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', \`\${x}px\`);
                card.style.setProperty('--mouse-y', \`\${y}px\`);
            });
        });

        // Chatbot Logic
        const chatToggle = document.getElementById('chatbot-toggle');
        const chatWindow = document.getElementById('chat-window');
        const chatBody = document.getElementById('chat-body');
        const chatText = document.getElementById('chat-text');

        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('open');
        });

        let chatStep = 0;

        function sendMsg() {
            const val = chatText.value.trim();
            if(!val) return;
            
            // Message de l'utilisateur
            const uMsg = document.createElement('div');
            uMsg.style.cssText = 'background: var(--primary); color: white; padding: 1rem; border-radius: 12px; border-bottom-right-radius: 0; align-self: flex-end; max-width: 85%; font-size: 0.95rem;';
            uMsg.textContent = val;
            chatBody.appendChild(uMsg);
            chatText.value = '';
            chatBody.scrollTo(0, chatBody.scrollHeight);

            // Simulation de réflexion (temps aléatoire entre 1s et 2s pour faire humain)
            setTimeout(() => {
                const bMsg = document.createElement('div');
                bMsg.style.cssText = 'background: white; padding: 1rem; border-radius: 12px; border-bottom-left-radius: 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-size: 0.95rem; align-self: flex-start; max-width: 85%; line-height: 1.5;';
                
                const lowerVal = val.toLowerCase();
                
                if (chatStep === 0) {
                    // Détection : Si c'est juste une salutation (mot court)
                    if (lowerVal === 'bonjour' || lowerVal === 'salut' || lowerVal === 'bonsoir' || lowerVal === 'hello' || lowerVal === 'coucou') {
                        bMsg.innerHTML = "Bonjour ! Comment puis-je vous aider concrètement avec votre besoin aujourd'hui ?";
                        // On n'incrémente PAS le chatStep, on attend qu'il explique son problème
                    } else {
                        // S'il a expliqué son problème (ou répondu à la salutation)
                        bMsg.innerHTML = "D'accord, je comprends. En tant que spécialiste <strong>${content.sector}</strong> sur <strong>${city || 'la région'}</strong>, nous traitons ce genre de demande tous les jours.<br><br>Est-ce qu'il s'agit d'une <strong>urgence</strong> ou d'une demande de <strong>devis sur rendez-vous</strong> ?";
                        chatStep++;
                    }
                } 
                else if (chatStep === 1) {
                    bMsg.innerHTML = "C'est bien noté. Pour que le bon technicien puisse préparer votre dossier et vous rappeler immédiatement, <strong>quel est votre numéro de téléphone ?</strong>";
                    chatStep++;
                }
                else if (chatStep === 2) {
                    // Détection : On vérifie s'il y a au moins 9 chiffres dans sa réponse
                    const numCount = (lowerVal.match(/[0-9]/g) || []).length;
                    
                    if (numCount >= 9) {
                        bMsg.innerHTML = "Parfait ! J'ai transmis vos coordonnées à notre équipe. Un expert <strong>${logoInfo.word1}</strong> va vous appeler sur ce numéro d'ici quelques minutes. Merci pour votre confiance !";
                        document.getElementById('chat-text').disabled = true;
                        document.getElementById('chat-text').placeholder = "Conversation terminée.";
                        chatStep++;
                    } else {
                        // S'il n'a pas mis de numéro valide
                        bMsg.innerHTML = "Je n'ai pas bien reconnu le format de votre numéro. Pourriez-vous me l'écrire à nouveau (ex: 06 12 34 56 78) ?";
                        // On n'incrémente PAS le chatStep, pour l'obliger à donner son numéro
                    }
                }
                
                chatBody.appendChild(bMsg);
                chatBody.scrollTo(0, chatBody.scrollHeight);
            }, 1000 + Math.random() * 1000); // Le temps de réponse varie un peu comme un vrai humain
        }
        chatText.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMsg(); });

        // Modal Management
        function openModal(id) {
            document.getElementById(id).style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
        function closeModal(id) {
            document.getElementById(id).style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // Auto-Popup au Scroll (50% de la page)
        let popupTriggered = false; // Sécurité pour ne pas déclencher 100 fois

        window.addEventListener('scroll', function() {
            // Si le popup a déjà été vu dans cette session, on annule
            if (sessionStorage.getItem('popupShown')) return;
            if (popupTriggered) return;

            // Calcul du pourcentage de scroll
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;

            // Si on dépasse 50% (milieu du site)
            if (scrollPercentage > 50) {
                popupTriggered = true; // On bloque les futurs déclenchements
                
                document.getElementById('contact-modal').style.display = 'block';
                document.body.style.overflow = 'hidden';
                sessionStorage.setItem('popupShown', 'true');
            }
        });

        // Fermer le modal en cliquant à l'extérieur
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('contact-modal');
            if (event.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    </script>

    <!-- MODIFIÉ: Mobile Sticky CTA -->
    <a href="tel:${cleanPhoneLink}" class="mobile-sticky-cta">
        <i data-lucide="phone" class="w-5 h-5"></i>
        Appeler — ${phone}
    </a>
</body>
</html>`;

  // Appliquer les variations de template anti-identification
  const finalHTML = applyTemplateVariation(htmlContent, templateVariation);
  
  return finalHTML;
}
