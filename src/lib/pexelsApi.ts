// Service API Pexels dynamique avec recherche sectorielle
// Télécharge les images dans Supabase Storage pour persistance

import { supabase } from './supabase';

const PEXELS_API_KEY = process.env.VITE_PEXELS_API_KEY || process.env.PEXELS_API_KEY || '';
const PEXELS_API_URL = 'https://api.pexels.com/v1';

// Mots-clés de recherche par secteur (en anglais pour Pexels)
const SECTOR_SEARCH_QUERIES: Record<string, string[]> = {
  plomberie: ['plumber working', 'plumbing repair', 'plumber fixing pipe', 'plumber tools', 'bathroom repair'],
  electricien: ['electrician working', 'electrical repair', 'electrician tools', 'wiring installation', 'circuit breaker'],
  coiffeur: ['hairdresser working', 'hair stylist salon', 'barber cutting hair', 'hair salon professional', 'hairdresser tools'],
  restaurant: ['chef cooking', 'restaurant kitchen', 'professional cooking', 'chef preparing food', 'restaurant service'],
  garage: ['mechanic working', 'car repair shop', 'auto mechanic', 'car maintenance', 'garage workshop'],
  nettoyage: ['cleaning service', 'professional cleaner', 'office cleaning', 'janitor working', 'cleaning equipment'],
  jardin: ['gardener working', 'landscaping professional', 'garden maintenance', 'lawn care', 'tree trimming'],
  fitness: ['personal trainer', 'gym workout', 'fitness coach', 'gym equipment', 'athletic training'],
  medical: ['doctor consultation', 'medical professional', 'healthcare worker', 'clinic interior', 'medical examination'],
  avocat: ['lawyer office', 'legal professional', 'attorney working', 'law firm', 'legal consultation'],
  default: ['professional working', 'business service', 'artisan working', 'trade professional', 'service worker']
};

// Mots-clés à éviter pour filtrer les images de nourriture
const BLOCKED_IMAGE_KEYWORDS = [
  'food', 'fruit', 'vegetable', 'carrot', 'salmon', 'pizza', 'burger', 
  'dessert', 'cake', 'meal', 'cooking', 'recipe', 'kitchen', 'dining',
  'restaurant food', 'gourmet', 'cuisine', 'plate', 'dish', 'snack',
  'breakfast', 'lunch', 'dinner', 'brunch', 'appetizer'
];

// Mots-clés à éviter de manière très stricte pour les images récupérées du lead (profils, logos, designs, etc.)
const BLOCKED_LEAD_IMAGE_KEYWORDS = [
  'logo', 'badge', 'icon', 'favicon', 'sprite', 'pixel', 'avatar', 'profile', 
  'map', 'marker', 'banner', 'sign', 'button', 'menu', 'advertisement', 'promo',
  'flyer', 'poster', 'facebook', 'instagram', 'twitter', 'linkedin', 'yelp', 
  'tripadvisor', 'pagesjaunes', 'google', 'gstatic', 'cloudfront', 'lh3.', 
  'googleusercontent', 'ggpht', 'googleapis', 'food', 'fruit', 'vegetable', 
  'carrot', 'salmon', 'pizza', 'burger', 'dessert', 'cake', 'meal', 'dish',
  'portrait', 'selfie', 'face', 'person', 'man', 'woman', 'people', 'team',
  'client', 'owner', 'staff', 'pose', 'headshot', 'photo-de-profil'
];

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
  photographer: string;
  alt: string;
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
  total_results: number;
  page: number;
  per_page: number;
}

/**
 * Recherche des images sur l'API Pexels pour un secteur donné
 */
export async function searchPexelsImages(sector: string, perPage: number = 10): Promise<string[]> {
  if (!PEXELS_API_KEY) {
    console.warn('⚠️ Clé API Pexels non configurée');
    return [];
  }

  const normalizedSector = (sector || '').toLowerCase().trim();
  
  // Trouver les mots-clés appropriés
  let searchQueries = SECTOR_SEARCH_QUERIES.default;
  for (const [key, queries] of Object.entries(SECTOR_SEARCH_QUERIES)) {
    if (normalizedSector.includes(key)) {
      searchQueries = queries;
      break;
    }
  }
  
  // Utiliser la première requête comme principale
  const query = searchQueries[0];
  
  try {
    const response = await fetch(
      `${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }
    
    const data: PexelsSearchResponse = await response.json();
    
    // Filtrer les images de nourriture
    const filteredPhotos = data.photos.filter(photo => {
      const alt = (photo.alt || '').toLowerCase();
      const photographer = (photo.photographer || '').toLowerCase();
      
      // Vérifier si c'est une image de nourriture
      const isFoodImage = BLOCKED_IMAGE_KEYWORDS.some(keyword => 
        alt.includes(keyword) || photographer.includes(keyword)
      );
      
      return !isFoodImage;
    });
    
    // Retourner les URLs d'images de qualité moyenne (plus rapide à charger)
    return filteredPhotos.map(photo => photo.src.large || photo.src.medium);
    
  } catch (error) {
    console.error('❌ Erreur recherche Pexels:', error);
    return [];
  }
}

/**
 * Télécharge une image et la stocke dans Supabase Storage
 */
export async function downloadAndStoreImage(
  imageUrl: string, 
  leadId: string, 
  index: number
): Promise<string | null> {
  try {
    // Télécharger l'image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // Vérifier que c'est bien une image
    if (!blob.type.startsWith('image/')) {
      throw new Error('Not an image file');
    }
    
    // Générer un nom de fichier unique
    const fileName = `${leadId}/image_${index}_${Date.now()}.webp`;
    
    // Uploader dans Supabase Storage
    const { data, error } = await supabase.storage
      .from('site-images')
      .upload(fileName, blob, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      throw error;
    }
    
    // Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from('site-images')
      .getPublicUrl(fileName);
    
    console.log(`✅ Image stockée: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
    
  } catch (error) {
    console.error('❌ Erreur stockage image:', error);
    return null;
  }
}

/**
 * Obtient des images pour un lead (API Pexels + Storage)
 * PRIORITÉ 1: Images réelles du lead
 * PRIORITÉ 2: Images API Pexels stockées dans Supabase
 */
export async function getImagesForLead(
  lead: { 
    id: string; 
    sector?: string; 
    images?: string[]; 
    websiteImages?: string[];
  },
  count: number = 6
): Promise<string[]> {
  const leadId = lead.id;
  const sector = lead.sector || 'default';
  
  // 1. Récupérer les images réelles du lead (filtrées avec le blocklist strict)
  const rawLeadImages = [...(lead.images || []), ...(lead.websiteImages || [])]
    .filter(img => {
      if (!img || typeof img !== 'string') return false;
      if (!img.startsWith('https://')) return false;
      const low = img.toLowerCase();
      // Bloquer les images du blocklist strict pour le lead (logos, selfies, etc.)
      if (BLOCKED_LEAD_IMAGE_KEYWORDS.some(kw => low.includes(kw))) return false;
      return true;
    });
  
  console.log(`🖼️ ${leadId}: ${rawLeadImages.length} images réelles trouvées`);
  
  // Si on a assez d'images réelles, les utiliser
  if (rawLeadImages.length >= count) {
    return rawLeadImages.slice(0, count);
  }
  
  // 2. Compléter avec l'API Pexels
  const neededImages = count - rawLeadImages.length;
  console.log(`🔍 Recherche de ${neededImages} images sur Pexels API...`);
  
  const pexelsUrls = await searchPexelsImages(sector, neededImages + 5); // +5 pour avoir de la marge si certaines échouent
  
  // 3. Télécharger et stocker les images Pexels
  const storedUrls: string[] = [];
  for (let i = 0; i < pexelsUrls.length && storedUrls.length < neededImages; i++) {
    const storedUrl = await downloadAndStoreImage(pexelsUrls[i], leadId, i);
    if (storedUrl) {
      storedUrls.push(storedUrl);
    }
  }
  
  // 4. Combiner: réelles + stockées
  const combinedImages = [...rawLeadImages, ...storedUrls];
  
  console.log(`✅ ${leadId}: ${rawLeadImages.length} réelles + ${storedUrls.length} Pexels stockées = ${combinedImages.length} total`);
  
  return combinedImages.slice(0, count);
}

/**
 * Fonction de fallback si l'API échoue - utilise les images statiques
 */
export function getFallbackImages(sector: string): string[] {
  // Import dynamique pour éviter les dépendances circulaires
  const { getSectorImages } = require('./pexelsImages');
  return getSectorImages(sector);
}
