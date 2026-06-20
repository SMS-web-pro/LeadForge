// Pexels Images Service — Images professionnelles par secteur
// 20 images UNIQUES par secteur, récupérées via l'API Pexels

const PEXELS_API_KEY = process.env.VITE_PEXELS_API_KEY || process.env.PEXELS_API_KEY || 'ghuDtWrRvhe2R5SLLHTtV8tOYvIbvtdAGIdTDz9zK6DZXvMw1xd8JaPK';

// Requêtes Pexels spécifiques par secteur (5 requêtes × 4 images = 20 images uniques)
const SECTOR_PEXEL_QUERIES: Record<string, string[]> = {
  plomberie: [
    'plumber working pipes wrench',
    'bathroom renovation modern interior',
    'kitchen sink faucet installation',
    'water heater boiler repair',
    'plumbing tools professional'
  ],
  electricien: [
    'electrician wiring electrical panel',
    'modern lighting installation',
    'electrical circuit breaker box',
    'smart home automation wiring',
    'electrician tools professional'
  ],
  coiffeur: [
    'hair salon interior modern',
    'hairdresser cutting hair professional',
    'barber shop tools scissors',
    'hair styling color treatment',
    'salon mirror chair interior'
  ],
  restaurant: [
    'restaurant kitchen professional chef',
    'fine dining table setting',
    'gourmet food plating presentation',
    'cafe restaurant interior design',
    'chef cooking kitchen action'
  ],
  garage: [
    'auto mechanic car repair garage',
    'car engine maintenance professional',
    'auto workshop tools equipment',
    'car tires wheel alignment',
    'vehicle diagnostic modern garage'
  ],
  nettoyage: [
    'professional cleaning service team',
    'office cleaning supplies equipment',
    'commercial window cleaning',
    'housekeeping professional service',
    'industrial floor cleaning'
  ],
  jardin: [
    'landscaping garden professional work',
    'lawn mowing garden maintenance',
    'garden design plants flowers',
    'outdoor patio landscaping design',
    'gardener pruning trees bushes'
  ],
  fitness: [
    'gym interior modern equipment',
    'personal trainer workout session',
    'fitness center weights area',
    'yoga studio class training',
    'sports gym professional equipment'
  ],
  medical: [
    'doctor consultation office modern',
    'medical stethoscope healthcare',
    'dental clinic interior equipment',
    'pharmacy medicine professional',
    'healthcare hospital corridor clean'
  ],
  avocat: [
    'law office books legal desk',
    'courtroom justice scales law',
    'lawyer professional office modern',
    'legal documents contract signing',
    'justice library law books'
  ],
  default: [
    'modern office workspace professional',
    'business meeting team collaboration',
    'corporate office interior design',
    'professional service workspace',
    'business handshake partnership'
  ]
};

// Cache pour les images récupérées
const imagesCache: Record<string, string[]> = {};

/**
 * Récupère des images depuis l'API Pexels pour une requête donnée
 */
async function fetchPexelsSearch(query: string, count: number = 4): Promise<string[]> {
  if (!PEXELS_API_KEY) return [];

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&size=medium`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!response.ok) return [];

    const data = await response.json();
    return (data.photos || [])
      .map((p: any) => p?.src?.large2x || p?.src?.large || p?.src?.medium || '')
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Récupère toutes les images uniques d'un secteur via l'API Pexels
 * 5 requêtes × 4 images = jusqu'à 20 images uniques
 */
export async function fetchSectorImagesFromAPI(sector: string): Promise<string[]> {
  const normalizedSector = (sector || '').toLowerCase().trim();
  const cacheKey = `sector_${normalizedSector}`;

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

  // Requêtes spécifiques par mot-clé
  if (normalizedSector.includes('plomb')) queries = SECTOR_PEXEL_QUERIES.plomberie;
  else if (normalizedSector.includes('électri') || normalizedSector.includes('electri')) queries = SECTOR_PEXEL_QUERIES.electricien;
  else if (normalizedSector.includes('coiff') || normalizedSector.includes('hair') || normalizedSector.includes('barber') || normalizedSector.includes('salon')) queries = SECTOR_PEXEL_QUERIES.coiffeur;
  else if (normalizedSector.includes('restaurant') || normalizedSector.includes('chef') || normalizedSector.includes('cuisine') || normalizedSector.includes('boulanger') || normalizedSector.includes('traiteur')) queries = SECTOR_PEXEL_QUERIES.restaurant;
  else if (normalizedSector.includes('garage') || normalizedSector.includes('mécan') || normalizedSector.includes('mecan') || normalizedSector.includes('auto')) queries = SECTOR_PEXEL_QUERIES.garage;
  else if (normalizedSector.includes('nettoy') || normalizedSector.includes('clean') || normalizedSector.includes('ménage') || normalizedSector.includes('menage')) queries = SECTOR_PEXEL_QUERIES.nettoyage;
  else if (normalizedSector.includes('jardin') || normalizedSector.includes('paysag') || normalizedSector.includes('espace vert')) queries = SECTOR_PEXEL_QUERIES.jardin;
  else if (normalizedSector.includes('fitness') || normalizedSector.includes('gym') || normalizedSector.includes('sport') || normalizedSector.includes('coach')) queries = SECTOR_PEXEL_QUERIES.fitness;
  else if (normalizedSector.includes('médec') || normalizedSector.includes('medical') || normalizedSector.includes('sant') || normalizedSector.includes('dentiste') || normalizedSector.includes('kiné')) queries = SECTOR_PEXEL_QUERIES.medical;
  else if (normalizedSector.includes('avocat') || normalizedSector.includes('jurid') || normalizedSector.includes('droit') || normalizedSector.includes('notaire')) queries = SECTOR_PEXEL_QUERIES.avocat;

  console.log(`🖼️ Pexels: Récupération d'images pour "${sector}" (${queries.length} requêtes)`);

  const allImages: string[] = [];
  for (const query of queries) {
    const imgs = await fetchPexelsSearch(query, 4);
    allImages.push(...imgs);
  }

  // Dédupliquer
  const unique = [...new Set(allImages)];
  console.log(`✅ Pexels: ${unique.length} images uniques pour "${sector}"`);

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
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1920&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1920&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1920&q=80',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1920&q=80',
    'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1920&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=80',
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1920&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=80',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920&q=80',
  ],
  electricien: [
    'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=1920&q=80',
    'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=1920&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80',
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
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=1920&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80',
    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1920&q=80',
    'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=1920&q=80',
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
    'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=1920&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1920&q=80',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1920&q=80',
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
export async function getSectorImagesAsync(sector: string): Promise<string[]> {
  const apiImages = await fetchSectorImagesFromAPI(sector);
  if (apiImages.length >= 5) return apiImages;

  // Fallback statique
  const normalizedSector = (sector || '').toLowerCase();
  for (const [key, imgs] of Object.entries(STATIC_FALLBACK)) {
    if (normalizedSector.includes(key)) return imgs;
  }
  return STATIC_FALLBACK.default;
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
// Pour chaque nom de service, une requête Pexels dédiée
const SERVICE_IMAGE_QUERIES: Record<string, string> = {
  // Plomberie
  'dépannage 24h/24': 'emergency plumber repair',
  'depannage 24h/24': 'emergency plumber repair',
  'installation sanitaire': 'bathroom sink installation',
  'chauffage': 'heating boiler repair',
  'chauffage & chaudière': 'heating boiler repair',
  'détection de fuites': 'water leak detection',
  'detection de fuites': 'water leak detection',
  'rénovation salle de bain': 'bathroom renovation modern',
  'renovation salle de bain': 'bathroom renovation modern',
  'entretien annuel': 'boiler maintenance service',
  // Électricien
  'mise aux normes': 'electrical panel wiring',
  'dépannage électrique': 'electrician fixing circuit',
  'depannage electrique': 'electrician fixing circuit',
  'installation complète': 'electrical installation home',
  'installation complete': 'electrical installation home',
  'domotique': 'smart home automation',
  'éclairage led': 'led lighting installation',
  'eclairage led': 'led lighting installation',
  'bornes de recharge': 'electric car charging station',
  // Coiffeur
  'coupes & styles': 'hairdresser cutting hair',
  'barbier traditionnel': 'barber shop shaving',
  'coloration expert': 'hair color salon treatment',
  'soins capillaires': 'hair treatment salon',
  'extensions volume': 'hair extensions salon',
  'chignons & événements': 'bridal hair styling',
  // Restaurant
  'cuisine maison': 'restaurant kitchen chef cooking',
  'menu du jour': 'restaurant lunch menu',
  'spécialités': 'gourmet food plating',
  'evenements & groupes': 'restaurant event private dining',
  'événements & groupes': 'restaurant event private dining',
  'service traiteur': 'catering service professional',
  'boissons & vins': 'wine cellar restaurant',
  // Garage
  'mécanique générale': 'car mechanic repair engine',
  'mécanique generale': 'car mechanic repair engine',
  'diagnostic auto': 'car diagnostic computer',
  'pneumatiques': 'car tire change garage',
  'climatisation': 'car air conditioning repair',
  'carrosserie': 'car body repair paint',
  'contrôle technique': 'car inspection garage',
  'controle technique': 'car inspection garage',
  // Nettoyage
  'nettoyage de bureaux': 'office cleaning professional',
  'nettoyage vitres': 'window cleaning professional',
  'grand nettoyage': 'deep cleaning service',
  'désinfection': 'disinfection professional service',
  'desinfection': 'disinfection professional service',
  'nettoyage industriel': 'industrial cleaning factory',
  'remise en état': 'post construction cleaning',
  // Jardin
  'création de jardins': 'garden landscape design',
  'creation de jardins': 'garden landscape design',
  'tonte & entretien': 'lawn mowing garden',
  'élagage & abattage': 'tree pruning cutting',
  'elagage & abattage': 'tree pruning cutting',
  'terrasses & cloutures': 'wooden deck patio',
  'arrosage automatique': 'automatic sprinkler garden',
  'potager & verger': 'vegetable garden raised beds',
  // Fitness
  'coaching personnel': 'personal trainer gym session',
  'cours collectifs': 'group fitness class gym',
  'musculation libre': 'gym free weights area',
  'cardio zone': 'gym cardio equipment treadmills',
  'préparation physique': 'sports training professional',
  'espace bien-être': 'gym sauna wellness area',
  // Médical
  'médecine générale': 'doctor consultation office',
  'kinesithérapie': 'physiotherapy rehabilitation',
  'kinésithérapie': 'physiotherapy rehabilitation',
  'ostéopathie': 'osteopathy treatment clinic',
  'infirmier à domicile': 'nurse home care visit',
  'analyses biologiques': 'laboratory blood test',
  'télémédecine': 'telemedicine video consultation',
  // Avocat
  'droit civil & famille': 'lawyer family law office',
  'droit pénal': 'courtroom criminal defense',
  'droit du travail': 'employment lawyer office',
  'droit des affaires': 'business lawyer meeting',
  'immobilier': 'real estate lawyer contract',
  'droit routier': 'traffic lawyer office',
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
