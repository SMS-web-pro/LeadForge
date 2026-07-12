import { logger } from './logger';
// Pexels Images Service — Images professionnelles par secteur
// 20 images UNIQUES par secteur, récupérées via l'API Pexels

let PEXELS_API_KEY = process.env.VITE_PEXELS_API_KEY || process.env.PEXELS_API_KEY || '';

export function setPexelsApiKey(key: string): void {
  if (key && key.length > 5) PEXELS_API_KEY = key;
}

export function getPexelsApiKey(): string {
  return PEXELS_API_KEY;
}

// Requêtes Pexels spécifiques par secteur (5 requêtes × 4 images = 20 images uniques)
const SECTOR_PEXEL_QUERIES: Record<string, string[]> = {
  plomberie: [
    'copper pipes plumbing installation',
    'bathroom faucet water pipe',
    'plumber hands fixing pipe',
    'water heater boiler plumbing',
    'sink drain pipe wrench repair'
  ],
  electricien: [
    'electrician wiring electrical panel',
    'electrician working wires installation',
    'electrical circuit breaker box panel',
    'led lighting fixture installation',
    'electrician using multimeter tools'
  ],
  coiffeur: [
    'hairdresser cutting hair scissors',
    'hair salon interior mirror chair',
    'barber shaving beard razor',
    'hair coloring treatment salon',
    'hairdresser blow drying hair'
  ],
  restaurant: [
    'chef cooking kitchen restaurant',
    'gourmet plated dish food',
    'restaurant dining table interior',
    'chef preparing meal kitchen',
    'fine dining plate presentation'
  ],
  garage: [
    'mechanic working car engine',
    'auto repair garage tools',
    'car tire wheel change',
    'car diagnostic computer scan',
    'mechanic fixing vehicle undercar'
  ],
  nettoyage: [
    'professional cleaning mop floor',
    'cleaning spray bottle window',
    'office cleaning vacuum cleaner',
    'cleaning team uniform service',
    'industrial floor cleaning machine'
  ],
  jardin: [
    'gardener mowing lawn garden',
    'garden flowers plants landscaping',
    'tree pruning gardener tool',
    'garden design green lawn',
    'landscaping patio outdoor design'
  ],
  fitness: [
    'gym weights dumbbell fitness',
    'personal trainer coaching gym',
    'group fitness class workout',
    'gym cardio treadmill running',
    'crossfit training exercise gym'
  ],
  medical: [
    'doctor stethoscope patient consultation',
    'medical office hospital hallway',
    'dentist dental clinic treatment',
    'nurse healthcare medical checkup',
    'pharmacy medicine professional shelves'
  ],
  avocat: [
    'lawyer office desk books',
    'courtroom scales justice law',
    'lawyer signing legal documents',
    'law office gavel courtroom',
    'attorney meeting client office'
  ],
  boulangerie: [
    'baker kneading bread dough',
    'bakery display pastries bread',
    'pastry chef decorating cake',
    'fresh croissants bakery oven',
    'artisan bread loaf bakery'
  ],
  peintre: [
    'painter painting wall roller',
    'house interior painting renovation',
    'paint bucket brush wall color',
    'professional painter working ceiling',
    'interior wall paint color'
  ],
  menuisier: [
    'carpenter woodworking saw bench',
    'wood furniture workshop craft',
    'carpenter measuring wood plank',
    'wooden cabinet joinery workshop',
    'carpenter using chisel wood'
  ],
  serrurier: [
    'locksmith changing door lock',
    'security lock door key',
    'locksmith tools lock repair',
    'key cutting machine locksmith',
    'smart lock digital door'
  ],
  transport: [
    'delivery truck cargo logistics',
    'moving company boxes furniture',
    'delivery driver van package',
    'warehouse logistics forklift',
    'freight truck shipping transport'
  ],
  immobilier: [
    'real estate house exterior modern',
    'property keys handover sale',
    'modern apartment building facade',
    'real estate agent showing house',
    'luxury home interior design'
  ],
  photo: [
    'photographer camera studio professional',
    'wedding photographer event photo',
    'portrait photography studio lighting',
    'photographer taking photo camera',
    'event photography candid moment'
  ],
  fleuriste: [
    'florist arranging flowers bouquet',
    'flower shop colorful arrangement',
    'florist hands tying flowers',
    'wedding flowers floral decoration',
    'fresh flowers bouquet display'
  ],
  spa: [
    'spa candles stones massage table',
    'spa facial treatment beauty',
    'aromatherapy oil massage hands',
    'wellness spa relaxing interior',
    'hot stone massage therapy'
  ],
  default: [
    'modern office workspace professional',
    'business meeting team office',
    'professional working desk computer',
    'corporate office modern interior',
    'team collaboration workplace modern'
  ]
};

// Cache pour les images récupérées
const imagesCache: Record<string, string[]> = {};

/**
 * Récupère des images depuis l'API Pexels pour une requête donnée
 */
// Mots-clés REJETÉS par secteur — si l'alt-text ou l'URL les contient, l'image est exclue
const SECTOR_REJECT_KEYWORDS: Record<string, string[]> = {
  plomberie: ['car ', 'auto ', 'mechanic', 'hair', 'food', 'restaurant', 'gym', 'lawyer', 'doctor', 'flower', 'paint'],
  electricien: ['car ', 'auto ', 'mechanic', 'hair', 'food', 'restaurant', 'gym', 'lawyer', 'doctor', 'flower', 'paint'],
  coiffeur: ['car ', 'auto ', 'mechanic', 'food', 'restaurant', 'gym', 'lawyer', 'doctor', 'flower', 'paint', 'pipe', 'wire'],
  restaurant: ['car ', 'auto ', 'mechanic', 'hair', 'gym', 'lawyer', 'doctor', 'flower', 'pipe', 'wire', 'paint'],
  garage: ['hair', 'food', 'restaurant', 'gym', 'lawyer', 'doctor', 'flower', 'pipe', 'wire', 'paint', 'salon'],
  nettoyage: ['car ', 'auto ', 'mechanic', 'hair', 'food', 'restaurant', 'gym', 'lawyer', 'doctor', 'flower', 'pipe'],
  jardin: ['car ', 'auto ', 'mechanic', 'hair', 'food', 'restaurant', 'gym', 'lawyer', 'doctor', 'pipe', 'wire', 'salon'],
  fitness: ['car ', 'auto ', 'mechanic', 'hair', 'food', 'restaurant', 'lawyer', 'doctor', 'flower', 'pipe', 'wire', 'paint'],
  medical: ['car ', 'auto ', 'mechanic', 'hair', 'food', 'restaurant', 'gym', 'lawyer', 'flower', 'pipe', 'wire', 'paint', 'salon'],
  avocat: ['car ', 'auto ', 'mechanic', 'hair', 'food', 'restaurant', 'gym', 'doctor', 'flower', 'pipe', 'wire', 'paint', 'salon'],
  spa: ['car ', 'auto ', 'mechanic', 'hair', 'food', 'restaurant', 'gym', 'lawyer', 'doctor', 'flower', 'pipe', 'wire', 'paint'],
  boulangerie: ['car ', 'auto ', 'mechanic', 'hair', 'gym', 'lawyer', 'doctor', 'flower', 'pipe', 'wire', 'paint', 'salon'],
  default: [],
};

function isRelevantToSector(altText: string, url: string, sector: string): boolean {
  const lowSector = (sector || '').toLowerCase();
  for (const [key, rejects] of Object.entries(SECTOR_REJECT_KEYWORDS)) {
    if (lowSector.includes(key)) {
      const combined = (altText + ' ' + url).toLowerCase();
      return !rejects.some(r => combined.includes(r));
    }
  }
  return true;
}

async function fetchPexelsSearch(query: string, count: number = 4, sector?: string): Promise<string[]> {
  if (!PEXELS_API_KEY) return [];

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&size=medium&safesearch=true`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!response.ok) return [];

    const data = await response.json();
    const { isImageBlocked } = await import('./imageFilters');
    return (data.photos || [])
      .filter((p: any) => {
        const url = p?.src?.large2x || p?.src?.large || p?.src?.medium || '';
        const alt = p?.alt || '';
        if (!url || !url.startsWith('https://')) return false;
        if (isImageBlocked(url, alt, sector)) return false;
        if (sector && !isRelevantToSector(alt, url, sector)) return false;
        return true;
      })
      .map((p: any) => p?.src?.large2x || p?.src?.large || p?.src?.medium || '')
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Cache par requête de service exacte (pas par secteur)
 */
const serviceImagesCache: Record<string, string[]> = {};

/**
 * Récupère des images Pexels pour une requête de service spécifique.
 * Appelle Pexels directement avec la requête exacte — aucun mapping sectoriel.
 * Cache par requête exacte pour éviter les appels répétés.
 */
export async function fetchServiceImages(query: string, count: number = 4, sector?: string): Promise<string[]> {
  const cacheKey = `svc_${query}`;
  if (serviceImagesCache[cacheKey]) {
    return serviceImagesCache[cacheKey];
  }

  if (!PEXELS_API_KEY) return [];

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&size=medium&safesearch=true`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!response.ok) return [];

    const data = await response.json();
    const { isImageBlocked } = await import('./imageFilters');
    const images = (data.photos || [])
      .filter((p: any) => {
        const url = p?.src?.large2x || p?.src?.large || p?.src?.medium || '';
        const alt = p?.alt || '';
        if (!url || !url.startsWith('https://')) return false;
        if (isImageBlocked(url, alt, sector)) return false;
        if (sector && !isRelevantToSector(alt, url, sector)) return false;
        return true;
      })
      .map((p: any) => p?.src?.large2x || p?.src?.large || p?.src?.medium || '')
      .filter(Boolean);

    serviceImagesCache[cacheKey] = images;
    return images;
  } catch {
    return [];
  }
}

/**
 * Récupère toutes les images uniques d'un secteur via l'API Pexels
 * 5 requêtes × 4 images = jusqu'à 20 images uniques
 * Utilise un offset basé sur le hash du lead pour varier les résultats
 */
export async function fetchSectorImagesFromAPI(sector: string, leadHash: number = 0): Promise<string[]> {
  const normalizedSector = (sector || '').toLowerCase().trim();
  const cacheKey = `sector_${normalizedSector}_${leadHash % 10}`;

  if (imagesCache[cacheKey]) {
    return imagesCache[cacheKey];
  }

  // Trouver les requêtes appropriées
  let queries = SECTOR_PEXEL_QUERIES.default;
  for (const [key, q] of Object.entries(SECTOR_PEXEL_QUERIES)) {
    if (normalizedSector.includes(key)) {
      queries = q;
      break;
    }
  }

  // Requêtes spécifiques par mot-clé — élargies pour couvrir plus de secteurs
  // IMPORTANT: l'ordre compte — les secteurs les plus spécifiques en premier
  if (normalizedSector.includes('plomb')) queries = SECTOR_PEXEL_QUERIES.plomberie;
  else if (normalizedSector.includes('électri') || normalizedSector.includes('electri') || normalizedSector.includes('domotique')) queries = SECTOR_PEXEL_QUERIES.electricien;
  else if (normalizedSector.includes('boulanger') || normalizedSector.includes('pâtiss') || normalizedSector.includes('patis') || normalizedSector.includes('viennoiserie')) queries = SECTOR_PEXEL_QUERIES.boulangerie;
  else if (normalizedSector.includes('coiff') || normalizedSector.includes('hair') || normalizedSector.includes('barber') || normalizedSector.includes('salon') || normalizedSector.includes('beauté') || normalizedSector.includes('esthétique') || normalizedSector.includes('ongle') || normalizedSector.includes('tatou')) queries = SECTOR_PEXEL_QUERIES.coiffeur;
  else if (normalizedSector.includes('spa') || normalizedSector.includes('massage') || normalizedSector.includes('wellness') || normalizedSector.includes('bien-être') || normalizedSector.includes('bienetre') || normalizedSector.includes('détente') || normalizedSector.includes('detente')) queries = SECTOR_PEXEL_QUERIES.spa;
  else if (normalizedSector.includes('restaurant') || normalizedSector.includes('chef') || normalizedSector.includes('cuisine') || normalizedSector.includes('traiteur') || normalizedSector.includes('pizzeria') || normalizedSector.includes('café') || normalizedSector.includes('brasserie') || normalizedSector.includes('bar ')) queries = SECTOR_PEXEL_QUERIES.restaurant;
  else if (normalizedSector.includes('garage') || normalizedSector.includes('mécan') || normalizedSector.includes('mecan') || normalizedSector.includes('auto') || normalizedSector.includes('pneu') || normalizedSector.includes('carrosserie') || normalizedSector.includes('moto') || normalizedSector.includes('camion')) queries = SECTOR_PEXEL_QUERIES.garage;
  else if (normalizedSector.includes('nettoy') || normalizedSector.includes('clean') || normalizedSector.includes('ménage') || normalizedSector.includes('menage') || normalizedSector.includes('menager') || normalizedSector.includes('hygiène')) queries = SECTOR_PEXEL_QUERIES.nettoyage;
  else if (normalizedSector.includes('jardin') || normalizedSector.includes('paysag') || normalizedSector.includes('espace vert') || normalizedSector.includes('pépinière') || normalizedSector.includes('arbori')) queries = SECTOR_PEXEL_QUERIES.jardin;
  else if (normalizedSector.includes('fitness') || normalizedSector.includes('gym') || normalizedSector.includes('musculation') || normalizedSector.includes('yoga') || normalizedSector.includes('crossfit') || normalizedSector.includes('boxe')) queries = SECTOR_PEXEL_QUERIES.fitness;
  else if (normalizedSector.includes('médec') || normalizedSector.includes('medical') || normalizedSector.includes('dentiste') || normalizedSector.includes('kiné') || normalizedSector.includes('pharmac') || normalizedSector.includes('infirm') || normalizedSector.includes('opticien') || normalizedSector.includes('ostéo')) queries = SECTOR_PEXEL_QUERIES.medical;
  else if (normalizedSector.includes('avocat') || normalizedSector.includes('jurid') || normalizedSector.includes('droit') || normalizedSector.includes('notaire')) queries = SECTOR_PEXEL_QUERIES.avocat;
  else if (normalizedSector.includes('peintre') || normalizedSector.includes('décor') || normalizedSector.includes('decor') || normalizedSector.includes('revêtement') || normalizedSector.includes('revetement') || normalizedSector.includes('tapisserie')) queries = SECTOR_PEXEL_QUERIES.peintre;
  else if (normalizedSector.includes('menuis') || normalizedSector.includes('ébénist') || normalizedSector.includes('ebenist') || normalizedSector.includes('charpent') || normalizedSector.includes('parquet') || normalizedSector.includes('bois')) queries = SECTOR_PEXEL_QUERIES.menuisier;
  else if (normalizedSector.includes('serrur') || normalizedSector.includes('sécurit') || normalizedSector.includes('securit') || normalizedSector.includes('alarme')) queries = SECTOR_PEXEL_QUERIES.serrurier;
  else if (normalizedSector.includes('transport') || normalizedSector.includes('livraison') || normalizedSector.includes('logistiq') || normalizedSector.includes('déménag') || normalizedSector.includes('demenag') || normalizedSector.includes('taxi') || normalizedSector.includes('vtc')) queries = SECTOR_PEXEL_QUERIES.transport;
  else if (normalizedSector.includes('immobili') || normalizedSector.includes('immo') || normalizedSector.includes('syndic')) queries = SECTOR_PEXEL_QUERIES.immobilier;
  else if (normalizedSector.includes('photo') || normalizedSector.includes('vidéo') || normalizedSector.includes('video') || normalizedSector.includes('mariage')) queries = SECTOR_PEXEL_QUERIES.photo;
  else if (normalizedSector.includes('fleur') || normalizedSector.includes('flore')) queries = SECTOR_PEXEL_QUERIES.fleuriste;

  // Offset les requêtes basé sur le hash du lead pour varier les résultats
  const offset = leadHash % queries.length;
  const offsetQueries = [...queries.slice(offset), ...queries.slice(0, offset)];

  logger.log(`🖼️ Pexels: Récupération d'images pour "${sector}" (${offsetQueries.length} requêtes, offset ${offset})`);

  const allImages: string[] = [];
  for (const query of offsetQueries) {
    const imgs = await fetchPexelsSearch(query, 4, normalizedSector);
    allImages.push(...imgs);
  }

  // Dédupliquer
  const unique = [...new Set(allImages)];
  logger.log(`✅ Pexels: ${unique.length} images uniques pour "${sector}"`);

  imagesCache[cacheKey] = unique;
  return unique;
}

/**
 * Fallback statique si l'API n'est pas disponible
 * Images Unsplash vérifiées, 5 par secteur minimum
 */
const STATIC_FALLBACK: Record<string, string[]> = {
  plomberie: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80',
    'https://images.unsplash.com/photo-1607472586893-edb5ca08f55d?w=1920&q=80',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1920&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7a13?w=1920&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1920&q=80',
  ],
  electricien: [
    'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=1920&q=80',
    'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=1920&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80',
    'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=1920&q=80',
  ],
  coiffeur: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1920&q=80',
    'https://images.unsplash.com/photo-1605497746444-052d5b593485?w=1920&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&q=80',
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
    'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=1920&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80',
  ],
  garage: [
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1920&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=1920&q=80',
    'https://images.unsplash.com/photo-1507767439269-2c64f107e609?w=1920&q=80',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1920&q=80',
  ],
  nettoyage: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1920&q=80',
    'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=1920&q=80',
    'https://images.unsplash.com/photo-1603712726208-4617905499f9?w=1920&q=80',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1920&q=80',
  ],
  jardin: [
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=1920&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80',
    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1920&q=80',
    'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=1920&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
  ],
  fitness: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1920&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&q=80',
  ],
  medical: [
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1920&q=80',
    'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1920&q=80',
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=1920&q=80',
  ],
  avocat: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80',
    'https://images.unsplash.com/photo-1505664194779-8bebcb3f9e5c?w=1920&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1920&q=80',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1920&q=80',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80',
  ],
  spa: [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&q=80',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1920&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=1920&q=80',
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1920&q=80',
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1920&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
    'https://images.unsplash.com/photo-1521791136368-1a8be852934b?w=1920&q=80',
  ]
};

/**
 * Récupère les images d'un secteur (API Pexels d'abord, fallback statique)
 */
export async function getSectorImagesAsync(sector: string, leadHash: number = 0): Promise<string[]> {
  const apiImages = await fetchSectorImagesFromAPI(sector, leadHash);
  if (apiImages.length >= 5) return apiImages;

  // Fallback statique — varier par hash pour éviter la répétition
  const normalizedSector = (sector || '').toLowerCase();
  for (const [key, imgs] of Object.entries(STATIC_FALLBACK)) {
    if (normalizedSector.includes(key)) {
      const offset = leadHash % imgs.length;
      return [...imgs.slice(offset), ...imgs.slice(0, offset)];
    }
  }
  const defaultOffset = leadHash % STATIC_FALLBACK.default.length;
  return [...STATIC_FALLBACK.default.slice(defaultOffset), ...STATIC_FALLBACK.default.slice(0, defaultOffset)];
}

/**
 * Version synchrone (fallback statique uniquement)
 */
export function getSectorImages(sector: string): string[] {
  const normalizedSector = (sector || '').toLowerCase().trim();
  for (const [key, imgs] of Object.entries(STATIC_FALLBACK)) {
    if (normalizedSector.includes(key)) return imgs;
  }
  return STATIC_FALLBACK.default;
}

// ── SERVICE → IMAGE MAPPING ──
// Couvre TOUTES les variantes orthographiques réelles de template.services
const SERVICE_IMAGE_QUERIES: Record<string, string> = {
  // === Plomberie ===
  'dépannage 24h/24': 'plumber emergency pipe repair',
  'depannage 24h/24': 'plumber emergency pipe repair',
  'installation sanitaire': 'bathroom sink faucet install',
  'chauffage': 'boiler heating radiator',
  'chauffage & chaudière': 'boiler heating radiator',
  'chauffage & chaudiere': 'boiler heating radiator',
  'détection de fuites': 'water leak pipe detection',
  'detection de fuites': 'water leak pipe detection',
  'rénovation salle de bain': 'bathroom renovation tiles',
  'renovation salle de bain': 'bathroom renovation tiles',
  'entretien annuel': 'boiler maintenance cleaning',

  // === Électricien ===
  'mise aux normes': 'electrician panel wiring cables',
  'mise aux normes electrique': 'electrician panel wiring cables',
  'dépannage électrique': 'electrician fixing wire circuit',
  'depannage electrique': 'electrician fixing wire circuit',
  'installation complète': 'electrician installing light wire',
  'installation complete': 'electrician installing light wire',
  'domotique & smart home': 'smart home panel control',
  'domotique': 'smart home panel control',
  'éclairage led': 'led light bulb fixture',
  'eclairage led': 'led light bulb fixture',
  'bornes de recharge': 'electric car charger station',

  // === Coiffeur ===
  'coupes & styles': 'hairdresser cutting hair woman',
  'coupes': 'hairdresser cutting hair woman',
  'barbier traditionnel': 'barber shaving beard razor',
  'barbier': 'barber shaving beard razor',
  'coloration expert': 'hair dye color salon brush',
  'coloration': 'hair dye color salon brush',
  'soins capillaires': 'hair treatment salon wash',
  'extensions volume': 'hair extensions styling salon',
  'chignons & événements': 'bridal hair updo styling',
  'chignons & evenements': 'bridal hair updo styling',
  'chignons': 'bridal hair updo styling',

  // === Restaurant ===
  'cuisine maison': 'chef cooking kitchen stove',
  'menu du jour': 'restaurant plated lunch dish',
  'spécialités': 'gourmet dish plated chef',
  'specialites': 'gourmet dish plated chef',
  'événements & groupes': 'restaurant private dining room',
  'evenements & groupes': 'restaurant private dining room',
  'service traiteur': 'catering buffet service food',
  'boissons & vins': 'wine bottle glass restaurant',

  // === Garage ===
  'mécanique générale': 'mechanic hands car engine',
  'mecanique generale': 'mechanic hands car engine',
  'diagnostic auto': 'car diagnostic scanner tool',
  'pneumatiques': 'car tire wheel mounting',
  'climatisation': 'car air conditioning vent',
  'carrosserie': 'car body paint repair shop',
  'contrôle technique': 'car inspection lift garage',
  'controle technique': 'car inspection lift garage',

  // === Nettoyage ===
  'nettoyage de bureaux': 'cleaning office desk vacuum',
  'nettoyage vitres': 'window cleaning squeegee glass',
  'grand nettoyage': 'deep cleaning bucket mop',
  'désinfection': 'disinfection spray surface clean',
  'desinfection': 'disinfection spray surface clean',
  'nettoyage industriel': 'industrial floor cleaning machine',
  'remise en état': 'post renovation cleaning debris',
  'remise en etat': 'post renovation cleaning debris',

  // === Jardin ===
  'création de jardins': 'garden landscape design plants',
  'creation de jardins': 'garden landscape design plants',
  'tonte & entretien': 'lawn mower cutting grass',
  'élagage & abattage': 'tree pruning saw branches',
  'elagage & abattage': 'tree pruning saw branches',
  'terrasses & clôtures': 'wooden deck patio planks',
  'terrasses & cloutures': 'wooden deck patio planks',
  'terrasses': 'wooden deck patio planks',
  'clôtures': 'garden fence wooden panels',
  'cloutures': 'garden fence wooden panels',
  'arrosage automatique': 'sprinkler watering garden lawn',
  'potager & verger': 'vegetable garden raised bed',

  // === Fitness ===
  'coaching personnel': 'personal trainer gym coaching',
  'cours collectifs': 'group exercise class fitness',
  'musculation libre': 'gym dumbbell weight rack',
  'cardio zone': 'treadmill running gym cardio',
  'préparation physique': 'athlete training gym professional',
  'preparation physique': 'athlete training gym professional',
  'espace bien-être': 'gym sauna relaxation area',
  'espace bien etre': 'gym sauna relaxation area',

  // === Médical ===
  'médecine générale': 'doctor stethoscope consultation',
  'medecine generale': 'doctor stethoscope consultation',
  'kinésithérapie': 'physiotherapist patient rehabilitation',
  'kinesitherapie': 'physiotherapist patient rehabilitation',
  'ostéopathie': 'osteopathy treatment hands back',
  'osteopathie': 'osteopathy treatment hands back',
  'infirmier à domicile': 'nurse healthcare visit home',
  'infirmier a domicile': 'nurse healthcare visit home',
  'analyses biologiques': 'laboratory blood test tube',
  'télémédecine': 'telemedicine video doctor screen',
  'telemdecine': 'telemedicine video doctor screen',

  // === Avocat ===
  'droit civil & famille': 'lawyer meeting client desk',
  'droit civil et famille': 'lawyer meeting client desk',
  'droit pénal': 'courtroom judge gavel justice',
  'droit penal': 'courtroom judge gavel justice',
  'droit du travail': 'employment contract signing desk',
  'droit des affaires': 'business meeting lawyer office',
  'immobilier': 'real estate contract keys house',
  'droit routier': 'driving license document paper',

  // === Spa ===
  'massage relaxant': 'spa hot stone massage back',
  'soin du visage': 'facial treatment beauty cream',
  'gommage corps': 'body scrub treatment spa',
  'manucure & pédicure': 'manicure nails polish salon',
  'manucure et pedicure': 'manicure nails polish salon',
  'épilation': 'waxing treatment beauty salon',
  'epilation': 'waxing treatment beauty salon',
  'routine bien-être': 'spa aromatherapy candle oil',
  'routine bien etre': 'spa aromatherapy candle oil',
};

/**
 * Retourne une requête Pexels adaptée au nom d'un service
 */
export function getServiceImageQuery(serviceName: string): string {
  const normalized = serviceName.toLowerCase().trim();
  if (SERVICE_IMAGE_QUERIES[normalized]) return SERVICE_IMAGE_QUERIES[normalized];

  // Recherche par inclusion
  for (const [key, query] of Object.entries(SERVICE_IMAGE_QUERIES)) {
    if (normalized.includes(key) || key.includes(normalized)) return query;
  }

  return 'professional service work';
}
