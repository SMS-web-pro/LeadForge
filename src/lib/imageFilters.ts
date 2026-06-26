// ── IMAGE FILTERS — Module unique de filtrage d'images ──

// Mots-clés de base TOUJOURS bloqués (indépendamment du secteur)
const BASE_BLOCKED_KEYWORDS: string[] = [
  'portrait', 'face', 'selfie', 'person', 'man ', 'woman ', 'people',
  'crowd', 'group', 'headshot', 'photo-de-profil', 'avatar', 'profile',
  'staff', 'client', 'owner', 'team',
  'logo', 'badge', 'stamp', 'seal', 'emblem', 'watermark', 'icon',
  'text-overlay', 'gradient-overlay', 'sign', 'button', 'menu',
  'advertisement', 'promo', 'flyer', 'poster', 'banner',
  'phone number', 'tel:', 'numero',
  'favicon', 'sprite', 'pixel',
  'map', 'marker',
  'nude', 'naked', 'bare', 'topless', 'underwear', 'lingerie', 'bikini',
  'swimsuit', 'swimwear', 'sensual', 'erotic', 'intimate', 'bedroom',
  'cleavage', 'skin ', 'body ', 'torso', 'chest', 'breast',
  'striptease', 'burlesque', 'exotic',
  'sexy', 'hot girl', 'hot guy', 'attractive',
  'yoga pants', 'tight', 'revealing',
  'sunset silhouette', 'beach body',
];

// Mots-clés food : bloqués SAUF pour les secteurs restaurant/cuisine
const FOOD_KEYWORDS = [
  'food', 'fruit', 'vegetable', 'legume', 'carrot', 'salmon', 'pizza', 'burger',
  'dessert', 'cake', 'meal', 'cooking', 'recipe', 'kitchen', 'dining',
  'gourmet', 'cuisine', 'plate', 'dish', 'snack', 'breakfast', 'lunch',
  'dinner', 'brunch', 'appetizer', 'restaurant-menu',
];

// Mots-clés spa/bien-être : bloqués SAUF pour le secteur spa
const SPA_KEYWORDS = ['massage', 'spa treatment', 'wellness ritual'];

// Secteurs autorisés pour les images food
const FOOD_SECTORS = ['restaurant', 'cuisin', 'traiteur', 'boulanger', 'pâtissier', 'patisserie', 'pizzeria', 'café', 'cafe', 'brasserie', 'bar ', 'glacier', 'poissonnerie', 'boucherie', 'charcuterie'];

// Secteurs autorisés pour les images spa
const SPA_SECTORS = ['spa', 'massage', 'wellness', 'bien-être', 'bienetre', 'détente', 'detente'];

// Alias exporté pour compatibilité avec les imports existants
export const BLOCKED_KEYWORDS: string[] = [...BASE_BLOCKED_KEYWORDS, ...FOOD_KEYWORDS, ...SPA_KEYWORDS];

export const BLOCKED_DOMAINS: string[] = [
  'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com',
  'tiktok.com', 'youtube.com', 'pinterest.com', 'snapchat.com',
  'tripadvisor.com', 'yelp.com', 'pagesjaunes.fr', 'foursquare.com',
  'google.com', 'gstatic.com', 'cloudfront.net', 'googleusercontent.com',
  'maps.google', 'lh3.', 'ggpht.com', 'googleapis.com',
  'wp.com', 'wixstatic.com', 'squarespace.com',
];

const STOCK_IMAGE_DOMAINS = ['images.pexels.com', 'images.unsplash.com', 'pexels.com', 'unsplash.com'];

const BLOCKED_PEXELS_IDS = ['16552851'];

export function isImageBlocked(url: string, altText?: string, sector?: string): boolean {
  if (!url || typeof url !== 'string') return true;
  const lowUrl = url.toLowerCase();
  const lowAlt = (altText || '').toLowerCase();
  const lowSector = (sector || '').toLowerCase();
  if (BLOCKED_DOMAINS.some(d => lowUrl.includes(d))) return true;

  if (BASE_BLOCKED_KEYWORDS.some(kw => lowUrl.includes(kw))) return true;
  if (lowAlt && BASE_BLOCKED_KEYWORDS.some(kw => lowAlt.includes(kw))) return true;

  const isFoodSector = FOOD_SECTORS.some(s => lowSector.includes(s));
  if (!isFoodSector) {
    if (FOOD_KEYWORDS.some(kw => lowUrl.includes(kw))) return true;
    if (lowAlt && FOOD_KEYWORDS.some(kw => lowAlt.includes(kw))) return true;
  }

  const isSpaSector = SPA_SECTORS.some(s => lowSector.includes(s));
  if (!isSpaSector) {
    if (SPA_KEYWORDS.some(kw => lowUrl.includes(kw))) return true;
    if (lowAlt && SPA_KEYWORDS.some(kw => lowAlt.includes(kw))) return true;
  }

  if (BLOCKED_PEXELS_IDS.some(id => lowUrl.includes(`/photos/${id}/`) || lowUrl.includes(`photo-${id}`))) return true;
  return false;
}

export function filterImages(urls: string[], altTexts?: string[], sector?: string): string[] {
  return urls.filter((url, i) => {
    if (!url || typeof url !== 'string') return false;
    if (!url.startsWith('https://')) return false;
    const alt = altTexts?.[i];
    return !isImageBlocked(url, alt, sector);
  });
}

export function isStockImage(url: string): boolean {
  if (!url) return false;
  const low = url.toLowerCase();
  return STOCK_IMAGE_DOMAINS.some(d => low.includes(d));
}

export function getImageDimensions(url: string): { width: number; height: number } | null {
  const wMatch = url.match(/[?&]w=(\d+)/);
  const hMatch = url.match(/[?&]h=(\d+)/);
  if (!wMatch && !hMatch) return null;
  return {
    width: wMatch ? parseInt(wMatch[1]) : 0,
    height: hMatch ? parseInt(hMatch[1]) : 0,
  };
}

export function isLandscapeImage(url: string, minRatio: number = 1.2): boolean {
  const dims = getImageDimensions(url);
  if (!dims || dims.width === 0 || dims.height === 0) return false;
  return dims.width / dims.height >= minRatio;
}

export function filterStockImages(urls: string[]): string[] {
  return urls.filter(url => isStockImage(url));
}
