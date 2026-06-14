// ══════════════════════════════════════════════════════════════════
// websiteGenerator.ts — VERSION FINALE CORRIGÉE
// Tous les patches intégrés:
//   ✅ Images: filtre logo/photo, dédup, object-fit intelligent
//   ✅ Témoignages: vrais avis Google uniquement
//   ✅ Formulaire: Formsubmit.co → email du prospect
//   ✅ Chatbot: collecte nom+tel, envoie email via Formsubmit
//   ✅ WhatsApp: formatage international automatique
//   ✅ Menu desktop: CSS pur, sans JS
//   ✅ Lucide: version 1.11.0 fixée, CDN jsDelivr
//   ✅ Popup: déclenchement à 60% (au lieu de 50%)
// ══════════════════════════════════════════════════════════════════

import { getSectorImages } from './pexelsImages';
import { getImagesForLead } from './pexelsApi';

// ── TYPES ──────────────────────────────────────────────────────────
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

// ── TEMPLATES PAR SECTEUR ─────────────────────────────────────────
const SECTOR_ULTIMATE_TEMPLATES: Record<string, any> = {
  plomberie: {
    primary: '#0f766e', secondary: '#115e59', accent: '#14b8a6', background: '#f0fdfa',
    services: [
      { name: 'Dépannage 24h/24', description: "Intervention d'urgence sur toutes fuites et pannes", features: ['Disponible 7j/7', 'Arrivée sous 1h30', 'Sans surprise tarifaire'] },
      { name: 'Installation Sanitaire', description: 'Pose et remplacement de vos appareils', features: ['Robinetterie', 'Éviers', 'WC', 'Douches'] },
      { name: 'Chauffage & Chaudière', description: 'Installation et réparation chauffage', features: ['Chaudières gaz/fioul', 'Pompes à chaleur', 'Détartrage'] },
      { name: 'Détection de Fuites', description: 'Localisation précise sans casse', features: ['Caméra thermique', 'Gaz traceur', 'Colmatage immédiat'] },
      { name: 'Rénovation Salle de Bain', description: 'Création et rénovation complète', features: ['Devis gratuit', 'Aide au choix', 'Clé en main'] },
      { name: 'Entretien Annuel', description: 'Maintenance préventive', features: ['Contrôle chauffage', 'Détartrage', 'Mise aux normes'] }
    ],
    guarantees: [
      { title: 'Garantie Décennale', icon: 'shield-check' }, { title: 'Intervention < 2h', icon: 'clock' },
      { title: 'Devis Gratuit', icon: 'file-text' }, { title: 'Artisan Qualifié', icon: 'check-square' }
    ],
    heroTitle: 'Artisan Plombier',
    heroSubtitle: "L'artisan du tuyau à votre service - De la fuite d'eau à la rénovation complète",
    aboutText: "Plombier chauffagiste de confiance, je mets mon savoir-faire à votre service. Artisan passionné, je garantis un travail soigné, des délais respectés et des tarifs transparents.",
    ctaText: 'Demandez un devis'
  },
  electricien: {
    primary: '#1e40af', secondary: '#1e3a8a', accent: '#2563eb', background: '#f8fafc',
    services: [
      { name: 'Mise aux Normes', description: 'Remise à neuf de votre installation électrique', features: ['Norme NFC 15-100', 'Tableau électrique neuf', 'Mise à la terre'] },
      { name: 'Dépannage Électrique', description: 'Pannes, court-circuits, disjonctions', features: ['Intervention rapide', 'Diagnostic complet', 'Réparation durable'] },
      { name: 'Installation Complète', description: 'Construction ou rénovation électrique', features: ['Câblage complet', 'Points de lumière', 'Prises et inters'] },
      { name: 'Domotique & Smart Home', description: 'Maison connectée et automatisée', features: ['Volets roulants', 'Éclairage auto', 'Thermostats'] },
      { name: 'Éclairage LED', description: 'Solutions éclairage économiques', features: ['Spots encastrés', 'Suspensions design', 'Éclairage extérieur'] },
      { name: 'Borne de Recharge', description: 'Installation bornes véhicule électrique', features: ['Wallbox particulier', 'Borne entreprise', 'Certification IRVE'] }
    ],
    guarantees: [
      { title: 'Consuel Certifié', icon: 'shield-check' }, { title: 'Garantie Décennale', icon: 'check-square' },
      { title: 'Intervention < 2h', icon: 'clock' }, { title: 'Devis Gratuit', icon: 'file-text' }
    ],
    heroTitle: 'Électricien Agréé',
    heroSubtitle: "Votre expert électricien pour des installations sûres et modernes",
    aboutText: "Électricien certifié Consuel, je sécurise votre habitat grâce à des installations conformes et durables. Artisan sérieux, intervention rapide et devis transparent.",
    ctaText: 'Contactez-moi'
  },
  coiffeur: {
    primary: '#6b21a8', secondary: '#581c87', accent: '#7c3aed', background: '#f8fafc',
    services: [
      { name: 'Coupes & Styles', description: 'Coupe sur-mesure femme et homme', features: ['Visagisme personnalisé', 'Techniques actuelles', 'Conseil entretien'] },
      { name: 'Barbier Traditionnel', description: 'Rasage et soins barbe', features: ["Rasage à l'ancienne", 'Taille précise', 'Soins barbe'] },
      { name: 'Coloration Expert', description: 'Balayages, ombrés et couleurs', features: ['Coloration végétale', 'Mèches sur mesure', 'Glitter color'] },
      { name: 'Soins Capillaires', description: 'Traitements réparateurs', features: ['Botox capillaire', 'Kératine', 'Massage crânien'] },
      { name: 'Extensions Volume', description: 'Rajouts longueur et épaisseur', features: ['Pose à froid', 'Tape-in', 'Entretien inclus'] },
      { name: 'Chignons & Événements', description: 'Coiffures de cérémonie', features: ['Mariage', 'Soirée', 'Maquillage combo'] }
    ],
    guarantees: [
      { title: 'Produits Bio', icon: 'leaf' }, { title: 'Stérilisation Outils', icon: 'sparkles' },
      { title: 'Formation Continue', icon: 'scissors' }, { title: 'Satisfait ou Refait', icon: 'heart' }
    ],
    heroTitle: 'Coiffeur Visagiste',
    heroSubtitle: "L'art de sublimer vos cheveux avec passion et expertise",
    aboutText: "Coiffeur passionné, je crée des looks qui vous ressemblent. Spécialiste du visagisme et des techniques modernes, je veille à la santé de vos cheveux avec des produits naturels.",
    ctaText: 'Prendre rendez-vous'
  },
  restaurant: {
    primary: '#c2410c', secondary: '#9a3412', accent: '#ea580c', background: '#f8fafc',
    services: [
      { name: 'Cuisine Maison', description: 'Plats préparés sur place', features: ['Produits locaux', 'Recettes authentiques', 'Fait minute'] },
      { name: 'Menu du Jour', description: 'Formule déjeuner économique', features: ['Entrée + Plat + Dessert', 'Produits frais', 'Cuisson minute'] },
      { name: 'Spécialités', description: 'Nos plats signature', features: ['Recettes du terroir', 'Grillades', 'Poissons frais'] },
      { name: 'Événements & Groupes', description: 'Repas de famille et séminaires', features: ['Menu groupe', 'Salle privative', 'Sur mesure'] },
      { name: 'Service Traiteur', description: 'Livraison et à emporter', features: ['Plateaux repas', 'Buffets', 'Livraison pro'] },
      { name: 'Boissons & Vins', description: 'Carte des vins et cocktails', features: ['Vins régionaux', 'Cocktails maison', 'Bières artisanales'] }
    ],
    guarantees: [
      { title: 'Produits Frais', icon: 'leaf' }, { title: 'Chef Qualifié', icon: 'award' },
      { title: 'Réservation Facile', icon: 'calendar' }, { title: 'Accueil Chaleureux', icon: 'heart' }
    ],
    heroTitle: 'Restaurant Traditionnel',
    heroSubtitle: "Cuisine authentique et accueil chaleureux",
    aboutText: "Chef passionné, je cuisine avec cœur des plats généreux et savoureux. Produits frais du marché, recettes authentiques et ambiance conviviale vous attendent.",
    ctaText: 'Réserver une table'
  },
  garage: {
    primary: '#166534', secondary: '#14532d', accent: '#059669', background: '#f8fafc',
    services: [
      { name: 'Mécanique Générale', description: 'Entretien et réparation toutes marques', features: ['Révisions constructeur', 'Courroies', 'Freins'] },
      { name: 'Diagnostic Auto', description: 'Analyse électronique complète', features: ['Valise multimarque', 'Effacement défauts', 'Paramétrage'] },
      { name: 'Pneumatiques', description: 'Montage, équilibrage, géométrie', features: ['Pneus toutes saisons', 'Pneus run-flat', 'Parallélisme'] },
      { name: 'Climatisation', description: 'Recharge et réparation clim', features: ['Recharge gaz R134a', 'Détection fuites', 'Filtre habitacle'] },
      { name: 'Carrosserie', description: 'Réparation et peinture', features: ['Débosselage', 'Peinture à la nuance', 'Polissage optique'] },
      { name: 'Contrôle Technique', description: 'Préparation et contre-visite', features: ['Pré-contrôle', 'Réparations conformité', 'Accompagnement'] }
    ],
    guarantees: [
      { title: 'Devis Gratuit', icon: 'file-text' }, { title: 'Garantie Pièces', icon: 'shield-check' },
      { title: 'Intervention Rapide', icon: 'clock' }, { title: 'Véhicule de Courtoisie', icon: 'car' }
    ],
    heroTitle: 'Garage Automobile',
    heroSubtitle: "Mécanicien passionné, votre véhicule entre de bonnes mains",
    aboutText: "Mécanicien automobile de confiance, j'entretiens et répare toutes marques avec passion. Diagnostic précis, devis transparents et respect des délais. Votre sécurité routière est ma priorité.",
    ctaText: 'Demandez un RDV'
  },
  nettoyage: {
    primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#f0fdf4',
    services: [
      { name: 'Nettoyage de Bureaux', description: 'Entretien quotidien de vos locaux professionnels', features: ['Poussière, sols, vitres', 'Produits écolabels', 'Horaires flexibles'] },
      { name: 'Nettoyage Vitres', description: 'Vitres intérieures et extérieures', features: ['Accès difficile', 'Sans traces garanti', 'Bâtiments R+10'] },
      { name: 'Grand Nettoyage', description: 'Nettoyage en profondeur résidentiel', features: ['Cuisine dégraissée', 'Salle de bain désinfectée', 'Sol ciré'] },
      { name: 'Désinfection', description: 'Traitement anti-bactérien et virucide', features: ['Certifié COVID', 'Produits bio', 'Rapport de traitement'] },
      { name: 'Nettoyage Industriel', description: 'Entrepôts, usines, ateliers', features: ['Monobrosse industrielle', 'Aspirateur eau/poussière', 'Horaires de nuit'] },
      { name: 'Remise en État', description: 'Après travaux ou déménagement', features: ['Évacuation gravats', 'Nettoyage fin', 'Livraison clé en main'] }
    ],
    guarantees: [
      { title: 'Produits Écolabels', icon: 'leaf' }, { title: 'Personnel Formé', icon: 'users' },
      { title: 'Intervention Fiable', icon: 'clock' }, { title: 'Assurance RC Pro', icon: 'shield-check' }
    ],
    heroTitle: 'Société de Nettoyage',
    heroSubtitle: "Propreté professionnelle et écologique pour vos espaces",
    aboutText: "Entreprise de nettoyage de confiance, nos équipes formées interviennent avec rigueur et discrétion. Produits écolabels, matériel professionnel et engagement qualité.",
    ctaText: 'Demandez un devis'
  },
  jardin: {
    primary: '#14532d', secondary: '#166534', accent: '#15803d', background: '#f0fdf4',
    services: [
      { name: 'Création de Jardins', description: 'Aménagement paysager complet', features: ['Plan sur mesure', 'Plantations adaptées', 'Gazon en rouleaux'] },
      { name: 'Tonte & Entretien', description: 'Pelouse et massifs entretenus', features: ['Tonte régulière', 'Taille haies', 'Désherbage manuel'] },
      { name: 'Élagage & Abattage', description: 'Arbres et arbustes sécurisés', features: ['Élagage raisonné', 'Grimper pro', 'Broyage branches'] },
      { name: 'Terrasses & Clôtures', description: 'Aménagement structure bois', features: ['Terrasse pin/ipé', 'Clôture occultation', 'Pergolas'] },
      { name: 'Arrosage Automatique', description: 'Installation système arrosage', features: ['Goutte à goutte', 'Tuyères enterrées', 'Programmateur connecté'] },
      { name: 'Potager & Verger', description: 'Création et entretien potager', features: ['Bacs surélevés', 'Compostage', 'Taille fruitiers'] }
    ],
    guarantees: [
      { title: 'Plantes Garanties', icon: 'sprout' }, { title: 'Intervention Propre', icon: 'sparkles' },
      { title: 'Conseils Saisonniers', icon: 'sun' }, { title: 'Paysagiste Qualifié', icon: 'award' }
    ],
    heroTitle: 'Jardinier Paysagiste',
    heroSubtitle: "Création et entretien de jardins uniques et harmonieux",
    aboutText: "Paysagiste passionné, je conçois et entretiens des espaces verts qui vivent au rythme des saisons. De la création paysagère à l'élagage expert.",
    ctaText: 'Demandez un devis'
  },
  fitness: {
    primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', background: '#fef2f2',
    services: [
      { name: 'Coaching Personnel', description: 'Accompagnement individuel sur mesure', features: ['Bilan morpho', 'Programme adapté', 'Suivi hebdo'] },
      { name: 'Cours Collectifs', description: 'Groupes dynamiques et motivants', features: ['HIIT', 'Yoga', 'Zumba'] },
      { name: 'Musculation Libre', description: 'Espace haltères et machines', features: ['Poids libres', 'Machines guidées', 'Cage à squat'] },
      { name: 'Cardio Zone', description: 'Équipements endurance modernes', features: ['Tapis connectés', 'Vélos elliptiques', 'Rameurs'] },
      { name: 'Préparation Physique', description: 'Prépa compétition ou remise en forme', features: ['Tests perf', 'Plan nutrition', 'Récupération'] },
      { name: 'Espace Bien-être', description: 'Détente après effort', features: ['Sauna', 'Douche jets', 'Casiers sécurisés'] }
    ],
    guarantees: [
      { title: 'Coachs Diplômés', icon: 'award' }, { title: 'Matériel Neuf', icon: 'zap' },
      { title: 'Sans Engagement', icon: 'check-circle' }, { title: 'Accès 6h-23h', icon: 'clock' }
    ],
    heroTitle: 'Coach Sportif',
    heroSubtitle: "Votre coach personnel pour atteindre vos objectifs fitness",
    aboutText: "Coach sportif diplômé d'État. Que vous cherchiez à perdre du poids, gagner en muscle ou préparer une compétition, je vous accompagne avec des programmes personnalisés.",
    ctaText: 'Essai offert'
  },
  medical: {
    primary: '#1e40af', secondary: '#1e3a8a', accent: '#2563eb', background: '#eff6ff',
    services: [
      { name: 'Médecine Générale', description: 'Consultations et suivi de santé', features: ['Bilan annuel', 'Vaccinations', 'Certificats'] },
      { name: 'Kinésithérapie', description: 'Rééducation et réadaptation', features: ['Massages médicaux', 'Rééducation post-op', 'Posturologie'] },
      { name: 'Ostéopathie', description: 'Soins sans médicaments', features: ['Bébés', 'Femmes enceintes', 'Sportifs'] },
      { name: 'Infirmier à Domicile', description: 'Soins à votre domicile', features: ['Injections', 'Pansements', 'Prélèvements'] },
      { name: 'Analyses Biologiques', description: 'Laboratoire sur place', features: ['Prise de sang', 'Tests rapides', 'Résultats 24h'] },
      { name: 'Télémédecine', description: 'Consultation vidéo', features: ['Ordonnance électronique', '7j/7 disponible', 'Sans déplacement'] }
    ],
    guarantees: [
      { title: 'Conventionné Secteur 1', icon: 'stethoscope' }, { title: '3ème Payant', icon: 'credit-card' },
      { title: 'RDV sous 48h', icon: 'calendar' }, { title: 'Équipe Qualifiée', icon: 'users' }
    ],
    heroTitle: 'Cabinet Médical',
    heroSubtitle: "Votre santé entre les mains de professionnels qualifiés",
    aboutText: "Médecin généraliste de confiance, je vous accueille dans un cabinet moderne et chaleureux. Écoute, diagnostic précis et suivi personnalisé.",
    ctaText: 'Prendre rendez-vous'
  },
  avocat: {
    primary: '#1e3a8a', secondary: '#172554', accent: '#2563eb', background: '#f8fafc',
    services: [
      { name: 'Droit Civil & Famille', description: 'Divorce, succession, bail', features: ['Divorce amiable/contentieux', 'Régime matrimonial', 'Garde alternée'] },
      { name: 'Droit Pénal', description: 'Défense et assistance victimes', features: ['Garde à vue', 'Tribunal correctionnel', 'Victimes préjudice'] },
      { name: 'Droit du Travail', description: 'Licenciement et contentieux', features: ['Rupture conventionnelle', 'Harcèlement', "Prud'hommes"] },
      { name: 'Droit des Affaires', description: 'Conseil entreprises et particuliers', features: ['Création société', 'Contrats commerciaux', 'Recouvrement'] },
      { name: 'Immobilier', description: 'Vente, achat, litiges', features: ['Promesse vente', 'Copropriété', 'Malfaisance construction'] },
      { name: 'Droit Routier', description: 'Permis, accidents, infractions', features: ['Retrait permis', 'Excès vitesse', 'Défense pénale'] }
    ],
    guarantees: [
      { title: 'Avocat au Barreau', icon: 'scale' }, { title: 'Consultation Privée', icon: 'shield' },
      { title: 'Défense Déterminée', icon: 'award' }, { title: 'Honoraires Transparents', icon: 'file-text' }
    ],
    heroTitle: 'Avocat à la Cour',
    heroSubtitle: "Conseil juridique personnalisé et défense de vos droits",
    aboutText: "Avocat inscrit au Barreau, je défends vos intérêts avec rigueur et détermination. Droit civil, pénal, travail ou affaires, chaque dossier mérite une stratégie sur mesure.",
    ctaText: 'Prendre rendez-vous'
  },
  default: {
    primary: '#1e293b', secondary: '#334155', accent: '#475569', background: '#f8fafc',
    services: [
      { name: 'Prestation Sur Mesure', description: 'Services adaptés à vos besoins spécifiques', features: ['Étude personnalisée', 'Devis détaillé', 'Écoute attentive'] },
      { name: 'Intervention Pro', description: 'Travail soigné et professionnel', features: ['Matériel adapté', 'Techniques actuelles', 'Respect des normes'] },
      { name: 'Conseil Expert', description: 'Accompagnement et recommandations', features: ['Diagnostic complet', 'Solutions pertinentes', 'Suivi personnalisé'] },
      { name: 'Service Rapide', description: 'Réactivité et respect des délais', features: ['Intervention rapide', 'Horaires flexibles', 'Urgences traitées'] },
      { name: 'Garantie Qualité', description: 'Engagement résultat et satisfaction', features: ['Contrôle qualité', 'Corrections incluses', 'SAV réactif'] },
      { name: 'Tarifs Transparents', description: 'Honoraires clairs et justifiés', features: ['Devis gratuit', 'Pas de surprise', 'Facilités paiement'] }
    ],
    guarantees: [
      { title: 'Devis Gratuit', icon: 'file-text' }, { title: 'Garantie Qualité', icon: 'shield-check' },
      { title: 'Intervention Rapide', icon: 'clock' }, { title: 'Satisfaction Client', icon: 'heart' }
    ],
    heroTitle: 'Artisan Professionnel',
    heroSubtitle: "Votre expert de confiance pour des prestations de qualité",
    aboutText: "Artisan passionné, je mets mon savoir-faire et mon expertise à votre service. Chaque projet est unique et mérite une attention particulière.",
    ctaText: 'Contactez-moi'
  }
};

// ── SÉLECTION DE TEMPLATE ─────────────────────────────────────────
function getUltimateTemplate(sector: string): any {
  const s = (sector || '').toLowerCase();
  if (s.includes('nettoyag') || s.includes('propreté') || s.includes('ménage')) return SECTOR_ULTIMATE_TEMPLATES.nettoyage;
  if (s.includes('jardin') || s.includes('paysag') || s.includes('espaces verts')) return SECTOR_ULTIMATE_TEMPLATES.jardin;
  if (s.includes('coach') || s.includes('sport') || s.includes('fitness') || s.includes('salle')) return SECTOR_ULTIMATE_TEMPLATES.fitness;
  if (s.includes('médec') || s.includes('clinique') || s.includes('dentiste') || s.includes('santé') || s.includes('kiné')) return SECTOR_ULTIMATE_TEMPLATES.medical;
  if (s.includes('avocat') || s.includes('notaire') || s.includes('juridi') || s.includes('droit')) return SECTOR_ULTIMATE_TEMPLATES.avocat;
  if (s.includes('électricien') || s.includes('electricien') || s.includes('electric')) return SECTOR_ULTIMATE_TEMPLATES.electricien;
  if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim')) return SECTOR_ULTIMATE_TEMPLATES.plomberie;
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) return SECTOR_ULTIMATE_TEMPLATES.coiffeur;
  if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur') || s.includes('boulang') || s.includes('pâtissier')) return SECTOR_ULTIMATE_TEMPLATES.restaurant;
  if (s.includes('garage') || s.includes('mécan') || s.includes('auto') || s.includes('carrosserie')) return SECTOR_ULTIMATE_TEMPLATES.garage;
  if (s.includes('beauté') || s.includes('esthétique') || s.includes('spa')) return SECTOR_ULTIMATE_TEMPLATES.coiffeur;
  if (s.includes('climat') || s.includes('frigo')) return SECTOR_ULTIMATE_TEMPLATES.plomberie;
  for (const [key, tmpl] of Object.entries(SECTOR_ULTIMATE_TEMPLATES)) {
    if (s.includes(key)) return tmpl;
  }
  return SECTOR_ULTIMATE_TEMPLATES.default;
}

// ── IMAGES — FILTRE INTELLIGENT ───────────────────────────────────
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
  // websiteImages délibérément exclus (source principale de logos parasites)
  const rawLeadImages = [...(lead.images || [])];
  const realPhotos = deduplicateImages(filterLeadImages(rawLeadImages));
  const realSet = new Set(realPhotos.map((u: string) => u.split('?')[0]));
  const pexelsPool = sectorImages.filter(u => !realSet.has(u.split('?')[0]));
  const combined = [...realPhotos, ...pexelsPool];
  while (combined.length < 6 && pexelsPool.length > 0) {
    combined.push(pexelsPool[combined.length % pexelsPool.length]);
  }
  console.log(`🖼️ ${lead.name}: ${realPhotos.length} photos réelles | ${pexelsPool.length} Pexels | Total: ${combined.length}`);
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

// ── WHATSAPP — FORMATAGE INTERNATIONAL ───────────────────────────
function detectCountryCode(city: string, address: string): string {
  const text = ((city || '') + ' ' + (address || '')).toLowerCase();
  if (text.includes('maroc') || text.includes('morocco') || text.includes('casablanca') ||
      text.includes('rabat') || text.includes('marrakech') || text.includes('fès') ||
      text.includes('tanger') || text.includes('agadir') || text.includes('settat') ||
      text.includes('kenitra') || text.includes('meknès') || text.includes('oujda')) return '212';
  if (text.includes('belgique') || text.includes('belgium') || text.includes('bruxelles') ||
      text.includes('liège') || text.includes('bruges') || text.includes('gand')) return '32';
  if (text.includes('suisse') || text.includes('switzerland') || text.includes('zurich') ||
      text.includes('genève') || text.includes('lausanne') || text.includes('berne')) return '41';
  if (text.includes('tunisie') || text.includes('tunisia') || text.includes('tunis') ||
      text.includes('sfax')) return '216';
  if (text.includes('algérie') || text.includes('algeria') || text.includes('alger') ||
      text.includes('oran')) return '213';
  return '33'; // France par défaut
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

// ── UTILS ─────────────────────────────────────────────────────────
function generateAboutText(text: string, lead: any): string {
  let years = 'plusieurs';
  if (lead.establishedYear && typeof lead.establishedYear === 'number') {
    const calc = new Date().getFullYear() - lead.establishedYear;
    if (calc > 0 && calc < 100) years = calc.toString();
  } else if (lead.description) {
    const m = lead.description.match(/(\d+)\s*ans?\s*d['']exp[eé]rience/i);
    if (m) years = m[1];
  }
  return text.replace(/depuis plus de 15 ans/gi, `depuis ${years} ans`)
             .replace(/15 ans d['']exp[eé]rience/gi, `${years} ans d'expérience`);
}

function generateFeaturesFromService(name: string, description: string): string[] {
  const s = ((name || '') + ' ' + (description || '')).toLowerCase();
  const dict: Record<string, string[]> = {
    'urgence': ['Disponible 24h/24', 'Intervention rapide', 'Déplacement inclus'],
    'installation': ['Pose certifiée', 'Conformité normes', 'Garantie décennale'],
    'chauffage': ['Économies énergie', 'Installation propre', 'Entretien annuel'],
    'domotique': ['Configuration incluse', 'App smartphone', 'Support technique'],
    'coupe': ['Visagisme personnalisé', 'Conseil entretien', 'Produits adaptés'],
    'coloration': ['Coloration végétale', 'Protection cheveux', 'Brillance longue durée'],
    'moteur': ['Diagnostic précis', 'Réparation garantie', "Pièces d'origine"],
    'pneus': ['Montage rapide', 'Géométrie 3D', 'Stockage hiver'],
    'ménage': ['Produits écologiques', 'Équipe formée', 'Intervention régulière'],
    'vitres': ['Sans traces garanti', 'Accès difficile', 'Sécurité maximale'],
    'coaching': ['Programme personnalisé', 'Suivi nutrition', 'Résultats mesurables'],
    'consultation': ["À l'écoute", 'Diagnostic précis', 'Disponibilité rapide'],
  };
  for (const [kw, features] of Object.entries(dict)) {
    if (s.includes(kw)) return features;
  }
  return ['Service professionnel', 'Intervention garantie', 'Devis gratuit'];
}

function getLogoInfo(name: string, sector: string = 'default') {
  if (!name) return { initials: 'CO', text: 'Company', word1: 'Company', word2: 'Pro' };
  const skip = ['le','la','les','de','du','des',"l'","d'",'à','a','et','&','en','pour'];
  const words = name.replace(/['']/g, "' ").split(/\s+/).filter(w => w.length > 0 && !skip.includes(w.toLowerCase()));
  let word1 = '', word2 = '';
  if (words.length === 1) {
    word1 = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    const low1 = word1.toLowerCase(); const s = sector.toLowerCase();
    if (s.includes('elec') && !low1.includes('elec')) word2 = 'Électricité';
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
  if (s.includes('plomb')) return { icon: 'zap', text: 'Dépannage rapide garanti' };
  if (s.includes('electric') || s.includes('électric')) return { icon: 'zap', text: 'Électricien certifié' };
  if (s.includes('coiff') || s.includes('barb')) return { icon: 'scissors', text: 'Coiffeur professionnel' };
  if (s.includes('restaurant') || s.includes('cuisin')) return { icon: 'chef-hat', text: 'Chef qualifié' };
  if (s.includes('garage') || s.includes('mécan')) return { icon: 'wrench', text: 'Garage agréé' };
  if (s.includes('nettoy') || s.includes('ménage')) return { icon: 'sparkles', text: 'Service nettoyage pro' };
  if (s.includes('jardin') || s.includes('paysag')) return { icon: 'leaf', text: 'Jardinier expert' };
  return { icon: 'shield-check', text: 'Professionnel certifié' };
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

// ── TÉMOIGNAGES — VRAIS AVIS UNIQUEMENT ──────────────────────────
function buildTestimonialsHTML(lead: any, rating: number, reviews: number): string {
  const realReviews = (lead.googleReviewsData || [])
    .filter((r: any) => r && r.text && r.text.trim().length > 10)
    .slice(0, 6)
    .map((r: any) => ({
      author: r.author || 'Client vérifié',
      text: r.text.trim(),
      rating: r.rating || 5,
      date: r.date || null,
    }));

  const count = realReviews.length;
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent((lead.name || '') + ' ' + (lead.city || ''))}`;

  // Pas assez d'avis → section alternative sans faux avis
  if (count < 3) {
    return `
    <section class="container" id="testimonials">
      <div class="section-header reveal">
        <h2>Nos clients nous font confiance</h2>
        <p>Rejoignez nos clients satisfaits et découvrez la qualité de nos prestations.</p>
      </div>
      <div style="text-align:center;padding:3rem;background:white;border-radius:24px;border:1px solid rgba(0,0,0,0.05);box-shadow:0 5px 20px rgba(0,0,0,0.02);">
        <div style="font-size:4rem;margin-bottom:1rem;">⭐</div>
        <div style="font-size:3rem;font-weight:800;color:var(--text-main);">${rating}/5</div>
        <div style="color:var(--text-muted);margin-bottom:0.5rem;">Note Google Maps</div>
        <div style="color:var(--text-muted);font-size:0.9rem;margin-bottom:2rem;">Basé sur ${reviews} avis</div>
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
        Avis authentiques vérifiés par Google Maps
      </div>
      <h2>Ce que disent nos clients</h2>
      <p>${count} avis réels — aucun avis inventé.</p>
    </div>
    <div style="display:flex;justify-content:center;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:3rem;">
      <div style="font-size:3rem;font-weight:800;color:var(--text-main);line-height:1;">${rating}</div>
      <div>
        <div style="display:flex;color:#f59e0b;gap:4px;margin-bottom:4px;">
          ${'<i data-lucide="star" fill="currentColor"></i>'.repeat(5)}
        </div>
        <div style="color:var(--text-muted);font-weight:500;">Basé sur ${reviews} avis Google</div>
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
              Avis vérifié Google${t.date ? ' · ' + t.date : ''}
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

// ── EXPORT PRINCIPAL ──────────────────────────────────────────────
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
  const heroSubtitle = aiContent?.heroSubtitle || `${template.heroSubtitle}${city ? ' à ' + city : ''}`;

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

  const baseSlogan = aiContent?.slogan || "L'excellence à votre service";
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
  const heroSubtitle = aiContent?.heroSubtitle || `${template.heroSubtitle}${city ? ' à ' + city : ''}`;

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

  const baseSlogan = aiContent?.slogan || "L'excellence à votre service";
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

// ── GÉNÉRATEUR HTML PRINCIPAL ─────────────────────────────────────
function buildUltimateHTML(content: UltimateContent, template: any, imagePool: string[], layoutVariant: number, lead: any): string {
  const { companyName, heroSubtitle, aboutText, services, phone, email, address, website, city, ctaText, rating, reviews, slogan, heroImage, allImages } = content;

<<<<<<< HEAD
const SECTOR_LAYOUTS: Record<string, SectorLayout> = {
  // Restaurant : Menu + Galerie + Réservation
  restaurant: {
    sections: ['header', 'hero', 'menu', 'about', 'gallery', 'testimonials', 'reservation', 'contact', 'footer'],
    customComponents: ['menu-grid', 'gallery-masonry', 'reservation-form'],
    specialFeatures: ['carte-interactive', 'horaires-ouvertures', 'menu-pdf']
  },
  
  // Garage : Services + Marques + RDV
  garage: {
    sections: ['header', 'hero', 'services', 'brands', 'about', 'testimonials', 'appointment', 'contact', 'footer'],
    customComponents: ['brands-showcase', 'appointment-calendar', 'diagnostic-tool'],
    specialFeatures: ['marques-traitees', 'calendrier-rdv', 'diagnostic-en-ligne']
  },
  
  // Coiffeur : Services + Galerie + RDV
  coiffeur: {
    sections: ['header', 'hero', 'services', 'gallery', 'about', 'testimonials', 'booking', 'contact', 'footer'],
    customComponents: ['service-cards', 'gallery-instagram', 'booking-system'],
    specialFeatures: ['galerie-shampoing', 'prix-services', 'rdv-en-ligne']
  },
  
  // Plomberie : Services + Urgence + Devis
  plomberie: {
    sections: ['header', 'hero', 'emergency', 'services', 'about', 'testimonials', 'quote', 'contact', 'footer'],
    customComponents: ['emergency-banner', 'service-grid', 'quote-calculator'],
    specialFeatures: ['urgence-24h', 'devis-en-ligne', 'intervention-rapide']
  },
  
  // Électricien : Services + Certifications + Devis
  electricien: {
    sections: ['header', 'hero', 'services', 'certifications', 'about', 'testimonials', 'quote', 'contact', 'footer'],
    customComponents: ['certification-badges', 'service-categories', 'quote-form'],
    specialFeatures: ['normes-electriques', 'certifications', 'devis-gratuit']
  },
  
  // Nettoyage : Services + Tarifs + Devis
  nettoyage: {
    sections: ['header', 'hero', 'services', 'pricing', 'about', 'testimonials', 'quote', 'contact', 'footer'],
    customComponents: ['service-packages', 'pricing-table', 'quote-calculator'],
    specialFeatures: ['forfaits-nettoyage', 'tarifs-clairs', 'devis-personnalisé']
  },
  
  // Default : Structure standard
  default: {
    sections: ['header', 'hero', 'services', 'about', 'testimonials', 'contact', 'footer'],
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
    <!-- MENU SECTION -->
    <section id="menu" class="py-20 bg-gradient-to-br from-stone-50 to-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4" style="color: ${template.primary}">
            Notre Carte
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez nos créations culinaires préparées avec des produits frais et locaux
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${services.map((service, index) => `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div class="h-48 bg-gradient-to-br from-${template.primary}/20 to-${template.accent}/20 flex items-center justify-center">
                <div class="text-center">
                  <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: ${template.primary}">
                    <i data-lucide="utensils" class="w-8 h-8 text-white"></i>
                  </div>
                  <h3 class="text-2xl font-bold" style="color: ${template.primary}">${service.name}</h3>
                </div>
              </div>
              <div class="p-6">
                <p class="text-gray-600 mb-4">${service.description}</p>
                <div class="space-y-2">
                  ${service.features.map(feature => `
                    <div class="flex items-center text-sm text-gray-700">
                      <i data-lucide="check" class="w-4 h-4 mr-2 text-green-500"></i>
                      ${feature}
                    </div>
                  `).join('')}
                </div>
                <div class="mt-6">
                  <span class="text-2xl font-bold" style="color: ${template.primary}">${15 + index * 5}€</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="text-center mt-12">
          <button class="px-8 py-4 rounded-full text-white font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105" style="background-color: ${template.primary}">
            <i data-lucide="download" class="w-5 h-5 mr-2"></i>
            Télécharger la carte complète
          </button>
        </div>
      </div>
    </section>
    
    <!-- RESERVATION SECTION -->
    <section id="reservation" class="py-20 bg-gradient-to-br from-orange-50 to-amber-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4" style="color: ${template.primary}">
            Réserver une Table
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Réservez votre table en quelques clics et recevez une confirmation immédiate
          </p>
        </div>
        
        <div class="max-w-2xl mx-auto">
          <form class="bg-white rounded-2xl shadow-xl p-8" action="${formSubmitEndpoint}" method="POST" target="_blank">
            <input type="text" name="_honey" style="display:none;">
            <input type="hidden" name="_subject" value="Nouvelle réservation - ${companyName}">
            <input type="hidden" name="_template" value="box">
            <input type="hidden" name="type_demande" value="reservation">
            <input type="hidden" name="restaurant" value="${companyName}">
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                <input type="text" name="name" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Votre nom">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input type="tel" name="phone" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Votre téléphone">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input type="date" name="date" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Heure *</label>
                <input type="time" name="time" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de personnes *</label>
                <select name="personnes" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option value="">Choisir...</option>
                  <option value="1">1 personne</option>
                  <option value="2">2 personnes</option>
                  <option value="3">3 personnes</option>
                  <option value="4">4 personnes</option>
                  <option value="5">5 personnes</option>
                  <option value="6">6 personnes</option>
                  <option value="7+">7+ personnes</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="votre@email.com">
              </div>
            </div>
            
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Préférences alimentaires</label>
              <textarea name="preferences" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Allergies, régime végétarien, etc."></textarea>
            </div>
            
            <button type="submit" class="w-full mt-6 px-8 py-4 rounded-full text-white font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105" style="background-color: ${template.primary}">
              <i data-lucide="calendar" class="w-5 h-5 mr-2"></i>
              Confirmer la réservation
            </button>
          </form>
        </div>
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
    { name: "Renault", logo: "🚗" },
    { name: "Peugeot", logo: "🚙" },
    { name: "Citroën", logo: "🚐" },
    { name: "Volkswagen", logo: "🏎️" },
    { name: "BMW", logo: "🚘" },
    { name: "Mercedes", logo: "🚛" }
  ];
  
  return `
    <!-- BRANDS SECTION -->
    <section id="brands" class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4" style="color: ${template.primary}">
            Marques Traitées
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Nous intervenons sur toutes les marques avec des pièces d'origine et des garanties constructeur
          </p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          ${brands.map(brand => `
            <div class="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div class="text-4xl mb-4">${brand.logo}</div>
              <h3 class="font-semibold text-gray-800">${brand.name}</h3>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    
    <!-- APPOINTMENT SECTION -->
    <section id="appointment" class="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4" style="color: ${template.primary}">
            Prendre Rendez-vous
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Réservez votre créneau horaire pour un diagnostic ou une intervention
          </p>
        </div>
        
        <div class="max-w-2xl mx-auto">
          <form class="bg-white rounded-2xl shadow-xl p-8" action="${formSubmitEndpoint}" method="POST" target="_blank">
            <input type="text" name="_honey" style="display:none;">
            <input type="hidden" name="_subject" value="Nouveau RDV Garage - ${companyName}">
            <input type="hidden" name="_template" value="box">
            <input type="hidden" name="type_demande" value="rdv_garage">
            <input type="hidden" name="garage" value="${companyName}">
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                <input type="text" name="name" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Votre nom">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input type="tel" name="phone" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Votre téléphone">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="votre@email.com">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Marque du véhicule *</label>
                <select name="marque" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Choisir...</option>
                  <option value="Renault">Renault</option>
                  <option value="Peugeot">Peugeot</option>
                  <option value="Citroën">Citroën</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes">Mercedes</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Modèle *</label>
                <input type="text" name="modele" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Clio, 208, Golf">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Année *</label>
                <input type="number" name="annee" required min="1990" max="2024" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: 2018">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date souhaitée *</label>
                <input type="date" name="date" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Heure souhaitée *</label>
                <input type="time" name="time" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            </div>
            
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Type d'intervention *</label>
              <select name="type_intervention" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Choisir...</option>
                <option value="diagnostic">Diagnostic</option>
                <option value="entretien">Entretien</option>
                <option value="reparation">Réparation</option>
                <option value="controle_technique">Contrôle technique</option>
                <option value="urgence">Urgence</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description du problème</label>
              <textarea name="description" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Décrivez le problème ou l'intervention souhaitée..."></textarea>
            </div>
            
            <button type="submit" class="w-full mt-6 px-8 py-4 rounded-full text-white font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105" style="background-color: ${template.primary}">
              <i data-lucide="wrench" class="w-5 h-5 mr-2"></i>
              Confirmer le rendez-vous
            </button>
          </form>
        </div>
      </div>
    </section>
  `;
}

// Coiffeur : Galerie Instagram
function generateGallerySection(content: UltimateContent, template: any, allImages: string[]): string {
  return `
    <!-- GALLERY SECTION -->
    <section id="gallery" class="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4" style="color: ${template.primary}">
            Nos Réalisations
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Inspirez-vous de nos dernières créations et tendances
          </p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${allImages.slice(0, 8).map((img, index) => `
            <div class="relative group overflow-hidden rounded-xl aspect-square">
              <img src="${img}" alt="Réalisation ${index + 1}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy">
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="absolute bottom-4 left-4 text-white">
                  <p class="text-sm font-semibold">Style ${['Classique', 'Moderne', 'Tendance', 'Avant-gardiste'][index % 4]}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="text-center mt-12">
          <button class="px-8 py-4 rounded-full text-white font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105" style="background-color: ${template.primary}">
            <i data-lucide="instagram" class="w-5 h-5 mr-2"></i>
            Voir plus sur Instagram
          </button>
        </div>
      </div>
    </section>
  `;
}

// Plomberie : Urgence 24h
function generateEmergencySection(content: UltimateContent, template: any): string {
  const { phone } = content;
  
  return `
    <!-- EMERGENCY SECTION -->
    <section id="emergency" class="py-20 bg-red-600 text-white">
      <div class="container mx-auto px-6">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <i data-lucide="alert-triangle" class="w-10 h-10"></i>
          </div>
          <h2 class="text-4xl md:text-5xl font-bold mb-4">
            Urgence Plomberie
          </h2>
          <p class="text-xl mb-8 max-w-2xl mx-auto">
            Fuite d'eau, panne de chauffage, obstruction ? Nous intervenons 24h/24 et 7j/7
          </p>
          
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <div class="flex items-center justify-center mb-6">
              <i data-lucide="phone" class="w-8 h-8 mr-3"></i>
              <span class="text-3xl font-bold">${phone}</span>
            </div>
            <p class="text-lg mb-4">Intervention sous 1h30 garantie</p>
            <button class="w-full px-8 py-4 bg-white text-red-600 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300">
              Appeler d'urgence
            </button>
          </div>
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
    <!-- CERTIFICATIONS SECTION -->
    <section id="certifications" class="py-20 bg-blue-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4" style="color: ${template.primary}">
            Nos Certifications
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Toutes nos interventions sont réalisées selon les normes en vigueur et certifiées
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${certifications.map(cert => `
            <div class="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: ${template.primary}">
                <i data-lucide="award" class="w-8 h-8 text-white"></i>
              </div>
              <h3 class="font-bold text-lg mb-2" style="color: ${template.primary}">${cert.name}</h3>
              <p class="text-gray-600 text-sm">${cert.desc}</p>
            </div>
          `).join('')}
        </div>
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
    <!-- PRICING SECTION -->
    <section id="pricing" class="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4" style="color: ${template.primary}">
            Nos Tarifs
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Des formules adaptées à tous les besoins et tous les budgets
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          ${packages.map((pkg, index) => `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${index === 1 ? 'ring-4 ring-' + template.primary + '/20' : ''}">
              ${index === 1 ? `
                <div class="text-center py-4" style="background-color: ${template.primary}">
                  <span class="text-white font-semibold">PLUS POPULAIRE</span>
                </div>
              ` : ''}
              <div class="p-8">
                <h3 class="text-2xl font-bold mb-4">${pkg.name}</h3>
                <div class="text-4xl font-bold mb-6" style="color: ${template.primary}">${pkg.price}</div>
                <ul class="space-y-3 mb-8">
                  ${pkg.features.map(feature => `
                    <li class="flex items-center text-gray-700">
                      <i data-lucide="check" class="w-5 h-5 mr-3 text-green-500"></i>
                      ${feature}
                    </li>
                  `).join('')}
                </ul>
                <button class="w-full px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${index === 1 ? 'text-white' : 'border-2 border-' + template.primary + ' text-' + template.primary}" style="${index === 1 ? 'background-color: ' + template.primary : ''}">
                  Choisir ce forfait
                </button>
              </div>
            </div>
          `).join('')}
        </div>
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
    <!-- SERVICES SECTION -->
    <section id="services" class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4" style="color: ${template.primary}">
            Nos Services
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Des solutions professionnelles adaptées à vos besoins
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${services.map((service, index) => `
            <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mb-6" style="background-color: ${template.primary}">
                <i data-lucide="wrench" class="w-8 h-8 text-white"></i>
              </div>
              <h3 class="text-2xl font-bold mb-4" style="color: ${template.primary}">${service.name}</h3>
              <p class="text-gray-600 mb-6">${service.description}</p>
              <ul class="space-y-3">
                ${service.features.map(feature => `
                  <li class="flex items-center text-sm text-gray-700">
                    <i data-lucide="check" class="w-4 h-4 mr-2 text-green-500"></i>
                    ${feature}
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
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
              <img src="https://images.unsplash.com/photo-1581094794329-cbf11b3f4354?w=800&q=80" alt="À propos" class="w-full h-full object-cover">
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function generateStandardTestimonialsSection(content: UltimateContent, template: any): string {
  const { testimonials, rating, reviews } = content;
  
  return `
    <!-- TESTIMONIALS SECTION -->
    <section id="testimonials" class="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-4" style="color: ${template.primary}">
            Témoignages Clients
          </h2>
          <div class="flex items-center justify-center mb-4">
            ${Array(5).fill(0).map(() => `<i data-lucide="star" class="w-6 h-6 text-yellow-400 fill-current"></i>`).join('')}
            <span class="ml-3 text-lg font-semibold">${rating}/5</span>
          </div>
          <p class="text-xl text-gray-600">${reviews} avis clients vérifiés</p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${testimonials.map(testimonial => `
            <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div class="flex mb-4">
                ${Array(testimonial.rating || 5).fill(0).map(() => `<i data-lucide="star" class="w-5 h-5 text-yellow-400 fill-current"></i>`).join('')}
              </div>
              <p class="text-gray-700 mb-6 italic">"${testimonial.text}"</p>
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <i data-lucide="user" class="w-6 h-6 text-gray-600"></i>
                </div>
                <div>
                  <div class="font-semibold">${testimonial.author}</div>
                  <div class="text-sm text-gray-600">${testimonial.date || 'Récemment'}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
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
            <form class="space-y-6" action="${formSubmitEndpoint}" method="POST" target="_blank" id="contactForm">
              <!-- Protection CSRF avancée -->
              <input type="hidden" name="_csrf_token" value="${generateCSRFToken()}">
              <input type="hidden" name="_form_timestamp" value="${Date.now()}">
              <input type="hidden" name="_form_id" value="contact_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}">
              
              <!-- Champ caché pour éviter le spam (honeypot) -->
              <input type="text" name="_honey" style="display:none;" aria-label="Ne pas remplir ce champ" tabindex="-1" autocomplete="off">
              <input type="hidden" name="_subject" value="Nouvelle demande de contact - ${companyName}">
              <input type="hidden" name="_template" value="box">
              <input type="hidden" name="_captcha" value="false">
              
              <!-- Validation JavaScript côté client -->
              <input type="hidden" name="_js_enabled" value="false">
              
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
  
  // ── SÉLECTION DU LAYOUT SPÉCIFIQUE PAR SECTEUR ──
  const sectorLayout = getSectorLayout(content.sector);
  
  // ── SYSTÈME DE VARIATIONS DE TEMPLATE ANTI-IDENTIFICATION ──
  const templateVariation = generateTemplateVariation(companyName, content.sector);
  
  // ── SYSTÈME DE MASQUAGE TRACKING EN PRODUCTION ──
  const isProduction = process.env.NODE_ENV === 'production' || true; // Toujours masquer en production
  
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
=======
>>>>>>> c96dc41a6d903c2bcd1fa17cb866365be9525410
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

<<<<<<< HEAD
  // Fonction de génération de token CSRF
  function generateCSRFToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
=======
  const fontLink = fontPair === 0
    ? `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`
    : fontPair === 1
    ? `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`
    : `<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`;

  const fontHead = fontPair === 0 ? "'Outfit'" : fontPair === 1 ? "'Plus Jakarta Sans'" : "'Lexend'";
>>>>>>> c96dc41a6d903c2bcd1fa17cb866365be9525410

  return `<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="icon" type="image/svg+xml" href="${faviconDataUrl}">
<<<<<<< HEAD
  
  <!-- SEO Meta Tags améliorés -->
  <title>${companyName} — ${content.sector} professionnel${city ? ' à ' + city : ''} | Expert ${content.sector}</title>
  <meta name="description" content="${companyName}, ${content.sector} professionnel${city ? ' à ' + city : ''}. ${heroSubtitle}. ${rating ? 'Note ' + rating + '/5' : 'Excellence garantie'}${reviews ? ' - ' + reviews + ' avis clients' : ''}.${phone ? ' Contactez-nous au ' + phone : ''}">
  <meta name="keywords" content="${content.sector}, ${city}, professionnel, expert, artisan, ${companyName}, intervention rapide, devis gratuit${phone ? ', ' + phone.replace(/\s/g, '') : ''}${city ? ', ' + city.toLowerCase() : ''}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="author" content="${companyName}">
  <meta name="language" content="fr">
  <meta name="geo.region" content="FR">
  <meta name="geo.placename" content="${city || 'France'}">
  <meta name="ICBM" content="${city ? '48.8566, 2.3522' : '48.8566, 2.3522'}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${website || '#'}">
  <meta property="og:title" content="${companyName} — ${content.sector} professionnel${city ? ' à ' + city : ''}">
  <meta property="og:description" content="${heroSubtitle}">
  <meta property="og:image" content="${heroImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${companyName} - ${content.sector}">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="${companyName}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@${companyName.toLowerCase().replace(/\s+/g, '')}">
  <meta name="twitter:creator" content="@${companyName.toLowerCase().replace(/\s+/g, '')}">
  <meta name="twitter:title" content="${companyName} — ${content.sector} professionnel">
  <meta name="twitter:description" content="${heroSubtitle}">
  <meta name="twitter:image" content="${heroImage}">
  <meta name="twitter:image:alt" content="${companyName} - ${content.sector}">

  <!-- Favicon et ressources -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  ${fontPair === 0 ? `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" onerror="this.onerror=null;this.href='data:text/css,@import url(https://cdn.jsdelivr.net/npm/@fontsource/outfit@5.0.13/outfit.css');@import url(https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/inter.css);'">` :
    fontPair === 1 ? `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" onerror="this.onerror=null;this.href='data:text/css,@import url(https://cdn.jsdelivr.net/npm/@fontsource/plus-jakarta-sans@5.1.0/plus-jakarta-sans.css');@import url(https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/inter.css);'">` :
    `<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" onerror="this.onerror=null;this.href='data:text/css,@import url(https://cdn.jsdelivr.net/npm/@fontsource/lexend@5.0.4/lexend.css');@import url(https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/inter.css);'">`}

  <!-- ✅ Lucide v1.11.0 — version fixée, CDN jsDelivr -->
  <script src="https://cdn.jsdelivr.net/npm/lucide@1.11.0/dist/umd/lucide.min.js"></script>

  <!-- Schema.org structuré amélioré -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "${website || '#organization'}",
    "name": "${companyName}",
    "alternateName": "${logoInfo.text}",
    "description": "${heroSubtitle}",
    "url": "${website || '#'}",
    "image": "${heroImage}",
    "telephone": "${phone}",
    "email": "${email}",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "${address}",
      "addressLocality": "${city}",
      "addressRegion": "${city ? (city.includes('75') ? 'Île-de-France' : city.includes('69') ? 'Auvergne-Rhône-Alpes' : city.includes('13') ? 'Provence-Alpes-Côte d\'Azur' : '') : ''}",
      "postalCode": "${address.match(/\b\d{5}\b/) ? address.match(/\b\d{5}\b/)[0] : ''}",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "48.8566",
      "longitude": "2.3522"
    },
    "openingHours": "Mo-Fr 09:00-18:00",
    "priceRange": "$$",
    "paymentAccepted": "Cash, Credit Card, Bank Transfer",
    "currenciesAccepted": "EUR",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "${rating}",
      "reviewCount": "${reviews}",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      ${finalTestimonials.slice(0, 3).map((review: any) => `{
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "${review.author}"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "${review.rating}",
          "bestRating": "5"
        },
        "reviewBody": "${review.text.replace(/"/g, '\\"')}"
      }`).join(',')}

    ],
    "serviceType": "${content.sector}",
    "slogan": "${slogan}",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services ${content.sector}",
      "itemListElement": [
        ${finalServices.slice(0, 3).map((service: any, index: number) => `{
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "${service.name}",
            "description": "${service.description.replace(/"/g, '\\"')}"
          }
        }`).join(',')}

      ]
    }
  }
  </script>

  <!-- Canonical URL -->
  <link rel="canonical" href="${website || '#'}">
  
  <!-- Préchargement des ressources critiques -->
  <link rel="preload" href="${heroImage}" as="image">
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=${fontHead.includes('Outfit') ? 'Outfit:wght@300;400;500;700;800' : fontHead.includes('Plus') ? 'Plus+Jakarta+Sans:wght@300;400;500;700;800' : 'Lexend:wght@300;400;500;700;800'}&family=Inter:wght@300;400;500;600;700&display=swap" as="style">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    ${fontPair === 0 ? `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" onerror="this.onerror=null;this.href='data:text/css,@import url(https://cdn.jsdelivr.net/npm/@fontsource/outfit@5.0.13/outfit.css');@import url(https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/inter.css);'">` :
      fontPair === 1 ? `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" onerror="this.onerror=null;this.href='data:text/css,@import url(https://cdn.jsdelivr.net/npm/@fontsource/plus-jakarta-sans@5.1.0/plus-jakarta-sans.css');@import url(https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/inter.css);'">` :
      `<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" onerror="this.onerror=null;this.href='data:text/css,@import url(https://cdn.jsdelivr.net/npm/@fontsource/lexend@5.0.4/lexend.css');@import url(https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/inter.css);'">`}
    
    <!-- Lucide Icons WITH LOCAL FALLBACK -->
{{ ... }
    <script src="https://unpkg.com/lucide@latest" onerror="this.onerror=null;this.src='data:text/javascript,/* Lucide Icons Fallback */ function createIcon(name){const svg={phone:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6.6-6.6A19.79 19.79 0 0 1 3 4.18 2 2 0 0 1 5 2.08v3a2 2 0 0 0 2.18 2c.28.04.54.1.82.14a2 2 0 0 1 1.82 1.82c.04.28.1.54.14.82A2 2 0 0 0 7.08 16H10a2 2 0 0 0 2-2.18 2 2 0 0 1-.14-.82 2 2 0 0 1-1.82-1.82c-.28-.04-.54-.1-.82-.14A2 2 0 0 0 7.08 12H4a2 2 0 0 1-2-2.18 2 2 0 0 1 .14-.82 2 2 0 0 1 1.82-1.82c.28-.04.54-.1.82-.14A2 2 0 0 0 5 8.92V5.92A2 2 0 0 1 7.18 4 19.79 19.79 0 0 1 15.81 1.07 19.5 19.5 0 0 1 22.41 7.67 19.79 19.79 0 0 1 23 16.92Z\\"/></svg>',mail:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><rect x=\\"2\\" y=\\"4\\" width=\\"20\\" height=\\"16\\" rx=\\"2\\"/><path d=\\"m22 7-10 5L2 7\\"/></svg>',map:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M21 10c0 7-9 13-9 13a9.75 9.75 0 0 1-6.74 2.74L3 8l3.74-1.5A9.75 9.75 0 0 1 12 3c7 0 9 6 9 13Z\\"/><path d=\\"M12 7v5l3 3\\"/></svg>',check:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M20 6L9 17l-5-5\\"/></svg>',star:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><polygon points=\\"12 2 15.09 8.26 22 9 17 14.14 19.18 21.02 12 17.77 4.82 21.02 7 14.14 2 9 8.91 8.26 12 2\\"/></svg>',user:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\\"/><circle cx=\\"12\\" cy=\\"7\\" r=\\"4\\"/></svg>',send:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"m22 2-7 20-10-9Z\\"/><path d=\\"M15 13 22 2l-7 7Z\\"/></svg>',calendar:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><rect x=\\"3\\" y=\\"4\\" width=\\"18\\" height=\\"18\\" rx=\\"2\\" ry=\\"2\\"/><line x1=\\"16\\" y1=\\"2\\" x2=\\"16\\" y2=\\"6\\"/><line x1=\\"8\\" y1=\\"2\\" x2=\\"8\\" y2=\\"6\\"/><line x1=\\"3\\" y1=\\"10\\" x2=\\"21\\" y2=\\"10\\"/></svg>',wrench:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\\"/></svg>',utensils:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\\"/><path d=\\"M7 2v20\\"/><path d=\\"M21 15V2v0a4 4 0 0 0-4 4h3.5Z\\"/><path d=\\"M3.5 18.5a4.5 4.5 0 0 1 0 9Z\\"/></svg>',download:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\\"/><polyline points=\\"7 10 12 15 17 10\\"/><line x1=\\"12\\" y1=\\"15\\" x2=\\"12\\" y2=\\"3\\"/></svg>',shield:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M20 12a8 8 0 0 0-16 0c0 5.4 3.6 9.9 8 12a8 8 0 0 0 8-12Z\\"/><path d=\\"M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0Z\\"/></svg>',clock:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><circle cx=\\"12\\" cy=\\"12\\" r=\\"10\\"/><polyline points=\\"12 6 12 12 16 14\\"/></svg>',award:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><circle cx=\\"12\\" cy=\\"8\\" r=\\"7\\"/><polyline points=\\"8.21 13.89 7 23 9 12 15 12 17 23 15.79 13.89\\"/></svg>',alert:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z\\"/><line x1=\\"12\\" y1=\\"9\\" x2=\\"12\\" y2=\\"13\\"/><line x1=\\"12\\" y1=\\"17\\" x2=\\"12.01\\" y2=\\"17\\"/></svg>',check:'<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><path d=\\"M20 6L9 17l-5-5\\"/></svg>'};return svg[name]||svg.star;};window.lucide=createIcon;document.querySelectorAll(\\"[data-lucide]\\").forEach(el=>{const name=el.getAttribute(\\"data-lucide\\");if(name){el.innerHTML=createIcon(name);}});'"></script>
=======
  <title>${companyName} — ${content.sector}${city ? ' à ' + city : ''}</title>
>>>>>>> c96dc41a6d903c2bcd1fa17cb866365be9525410

  <meta name="description" content="${companyName} — ${content.sector} professionnel${city ? ' à ' + city : ''}. ${heroSubtitle}.${phone ? ' Contactez-nous au ' + phone : ''}">
  <meta name="robots" content="index, follow">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${companyName} — ${content.sector}${city ? ' à ' + city : ''}">
  <meta property="og:description" content="${heroSubtitle}">
  <meta property="og:image" content="${heroImage}">
  <meta property="og:locale" content="fr_FR">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${companyName} — ${content.sector}">
  <meta name="twitter:image" content="${heroImage}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${fontLink}

  <!-- ✅ Lucide v1.11.0 — version fixée, CDN jsDelivr (plus stable qu'unpkg @latest) -->
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

    /* Navigation — ✅ CSS PUR, pas de JS */
    nav { position:fixed; top:36px; width:100%; z-index:50; padding:1.5rem 0; transition:all 0.4s cubic-bezier(0.4,0,0.2,1); }
    nav.scrolled { top:0; padding:1rem 0; background:rgba(255,255,255,0.92); backdrop-filter:blur(20px); border-bottom:1px solid rgba(0,0,0,0.05); box-shadow:0 10px 30px rgba(0,0,0,0.03); }
    .nav-container { max-width:1200px; margin:0 auto; padding:0 2rem; display:flex; justify-content:space-between; align-items:center; }
    .logo-svg { width:45px; height:45px; border-radius:12px; background:linear-gradient(135deg,var(--primary),var(--secondary)); display:flex; align-items:center; justify-content:center; color:white; font-family:'Outfit',sans-serif; font-weight:800; font-size:1.25rem; box-shadow:0 8px 20px rgba(${primaryRgb},0.2); }
    .brand { font-size:1.75rem; font-weight:800; color:var(--text-main); text-decoration:none; display:flex; align-items:center; gap:0.75rem; }
    .btn-call { display:inline-flex; align-items:center; gap:0.5rem; background:white; border:1px solid rgba(0,0,0,0.05); color:var(--text-main); padding:0.5rem 1.25rem; border-radius:100px; text-decoration:none; font-weight:600; transition:all 0.3s; }
    .btn-call:hover { background:var(--primary); color:white; }

    /* ✅ Desktop menu — CSS pur via @media */
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

    /* Modals légales */
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
      <div class="marquee-item"><i data-lucide="clock" width="16"></i> Ouvert de 9h à 18h en semaine</div>
      ${phone ? `<div class="marquee-item"><i data-lucide="phone" width="16"></i> Intervention rapide : ${phone}</div>` : ''}
      ${email ? `<div class="marquee-item"><i data-lucide="mail" width="16"></i> ${email}</div>` : ''}
      <div class="marquee-item"><i data-lucide="map-pin" width="16"></i> ${city || address}</div>
      <div class="marquee-item"><i data-lucide="clock" width="16"></i> Ouvert de 9h à 18h en semaine</div>
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
          <a href="#about">À propos</a>
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
      <a href="#about" class="mobile-menu-link">À propos</a>
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

  <!-- À propos -->
  <section class="container bg-alternate" id="about">
    <div class="section-header reveal"><h2>Un professionnel de confiance à votre service</h2></div>
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
          <li style="display:flex;align-items:center;gap:0.5rem;font-weight:600;"><i data-lucide="check-circle-2" style="color:#8b5cf6;"></i> Réactivité garantie</li>
        </ul>
        <button onclick="document.getElementById('contact-modal').style.display='flex';document.body.style.overflow='hidden';" class="btn-cta" style="border:none;">
          ${ctaText} <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </div>
  </section>

  <!-- Garanties -->
  <section class="container" id="valeurs">
    <div class="section-header reveal"><h2>Nos garanties</h2><p>Les engagements qui font la différence et votre tranquillité d'esprit.</p></div>
    <div class="valeurs-grid">
      ${template.guarantees.map((g: any, i: number) => `
      <div class="valeur-card reveal" style="transition-delay:${i * 100}ms;">
        <div class="valeur-icon"><i data-lucide="${g.icon}" width="32" height="32"></i></div>
        <h3 style="font-family:'Outfit';font-size:1.35rem;margin-bottom:1rem;">${g.title}</h3>
        <p style="color:var(--text-muted);font-size:0.95rem;">Un engagement pris pour votre satisfaction et votre sécurité.</p>
      </div>`).join('')}
    </div>
  </section>

  <!-- Stats -->
  <section class="container" style="padding-top:2rem;padding-bottom:2rem;">
    <div class="stats-banner reveal">
      <div class="stat-banner-item"><h3>${reviews > 0 ? reviews + '+' : '100%'}</h3><div style="font-weight:500;opacity:0.9;">Avis Vérifiés</div></div>
      <div class="stat-banner-item"><h3>24/7</h3><div style="font-weight:500;opacity:0.9;">Disponibilité</div></div>
      <div class="stat-banner-item"><h3>${rating}/5</h3><div style="font-weight:500;opacity:0.9;">Note Google</div></div>
      <div class="stat-banner-item"><h3>100%</h3><div style="font-weight:500;opacity:0.9;">Satisfaction</div></div>
    </div>
  </section>

  <!-- Process -->
  <section class="container" id="process">
    <div class="section-header reveal"><h2>Notre démarche en 4 étapes</h2><p>Une méthodologie claire et transparente pour garantir le succès de votre projet.</p></div>
    <div class="process-grid reveal">
      ${['Prise de contact','Devis détaillé','Intervention','Suivi qualité'].map((step, i) => `
      <div class="step-card">
        <div class="step-number">${i + 1}</div>
        <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:1rem;font-family:'Outfit';">${step}</h3>
        <p style="color:var(--text-muted);font-size:0.95rem;">${['Nous étudions ensemble votre besoin et définissons les priorités.','Un chiffrage précis et transparent, sans aucun frais caché.','Réalisation de la prestation par nos experts qualifiés.','Nous nous assurons de votre entière satisfaction après livraison.'][i]}</p>
      </div>`).join('')}
    </div>
  </section>

  <!-- Services -->
  <section class="container bg-alternate" id="services">
    <div class="section-header reveal"><h2>Nos Services et Interventions</h2><p>Des prestations de qualité, réalisées dans le respect des normes et des délais.</p></div>
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

  <!-- Témoignages — ✅ Vrais avis uniquement -->
  ${buildTestimonialsHTML(lead, rating, reviews)}

  <!-- Contact -->
  <section class="container bg-alternate" id="contact">
    <div class="section-header reveal"><h2>Passez à l'action dès aujourd'hui</h2><p>Notre équipe est prête à intervenir. Contactez-nous pour un diagnostic rapide.</p></div>
    <div class="contact-grid reveal">
      <div class="map-side">
        <iframe src="https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <div class="contact-form-side">
        <h3 style="font-size:2rem;font-family:'Outfit';margin-bottom:0.5rem;">Envoyez-nous un message</h3>
        <p style="color:var(--text-muted);margin-bottom:2rem;font-size:0.95rem;">Réponse garantie sous 24h.</p>
        <div id="form-wrapper">
          <form id="contact-form" action="${formsubmitEndpoint}" method="POST">
            <input type="hidden" name="_subject" value="💬 Nouveau message depuis votre site — ${companyName}">
            <input type="hidden" name="_captcha" value="false">
            <input type="hidden" name="_template" value="table">
            <input type="hidden" name="_next" value="about:blank">
            <div class="form-group"><input type="text" name="Nom" class="form-control" placeholder="Votre nom complet" required></div>
            <div class="form-group"><input type="email" name="Email" class="form-control" placeholder="Votre adresse e-mail" required></div>
            <div class="form-group"><input type="tel" name="Téléphone" class="form-control" placeholder="Votre téléphone"></div>
            <div class="form-group"><textarea name="Message" class="form-control" rows="4" placeholder="Détaillez votre besoin..." required></textarea></div>
            <button type="submit" id="form-submit-btn" class="btn-cta" style="width:100%;justify-content:center;border:none;">
              <i data-lucide="send"></i> <span id="btn-text">Envoyer la demande</span>
            </button>
            <p style="text-align:center;margin-top:1rem;font-size:0.85rem;color:var(--text-muted);">🔒 Données protégées et confidentielles.</p>
          </form>
        </div>
        <div id="form-success" style="display:none;text-align:center;padding:3rem 1rem;">
          <div style="width:80px;height:80px;border-radius:50%;background:rgba(16,185,129,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
            <i data-lucide="check-circle-2" width="40" height="40" style="color:#10b981;"></i>
          </div>
          <h4 style="font-size:1.5rem;font-family:'Outfit';margin-bottom:0.75rem;">Message envoyé !</h4>
          <p style="color:var(--text-muted);margin-bottom:1.5rem;">Nous avons bien reçu votre demande et vous répondrons très vite.</p>
          ${phone ? `<a href="tel:${cleanPhoneLink}" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.5rem;background:var(--primary);color:white;border-radius:12px;text-decoration:none;font-weight:700;"><i data-lucide="phone" width="18"></i> ${phone}</a>` : ''}
        </div>
      </div>
    </div>
  </section>

<<<<<<< HEAD
    <!-- Hero Split (Variant 1 & 3) -->
    <section class="hero bg-grid hero-split">
        <div class="bg-pattern"></div>
        <!-- Désactivé : animations géométriques pour design plus propre -->
        <!-- <div class="pattern-waves"></div> -->
        <div class="hero-content reveal active" style="position: relative; z-index: 1;">
            <div class="hero-badge"><i data-lucide="${heroBadge.icon}" width="18"></i> ${heroBadge.text}</div>
            <h1 style="text-align: left; font-size: clamp(3rem, 6vw, 5rem); margin-bottom: 0.5rem; line-height: 1.1; color: var(--text-main);">
                ${logoInfo.word1} <span style="color: var(--primary);">${logoInfo.word2}</span>
            </h1>
            <h2 style="text-align: left; font-size: clamp(1.2rem, 3vw, 2rem); font-family: 'Outfit'; color: var(--text-main); font-weight: 700; margin-bottom: 1.5rem; opacity: 0.8;">${slogan}</h2>
            <p style="text-align: left; margin-bottom: 2.5rem; font-size: 1.15rem;">${heroSubtitle}</p>
            
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-bottom: 2rem; justify-content: flex-start; ${(rating || 0) === 0 && (reviews || 0) === 0 ? 'display: none;' : ''}">
                <div style="display: flex; color: #f59e0b;">
                    <i data-lucide="star" fill="currentColor"></i>
                    <i data-lucide="star" fill="currentColor"></i>
                    <i data-lucide="star" fill="currentColor"></i>
                    <i data-lucide="star" fill="currentColor"></i>
                    <i data-lucide="star" fill="currentColor" ${(rating || 0) < 5 ? 'opacity="0.5"' : ''}></i>
                </div>
                <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem;">${rating || 5}/5</div>
                <div style="color: var(--text-muted); font-size: 0.9rem;">(Basé sur ${reviews || 42} avis certifiés)</div>
            </div>

            <div style="text-align: left;">
                <button onclick="document.getElementById('contact-modal').style.display='block'; document.body.style.overflow='hidden';" class="btn-cta" style="border: none;">
                    ${ctaText} <i data-lucide="arrow-right"></i>
                </button>
            </div>
        </div>
        <div class="hero-image-col reveal reveal-left" style="position: relative; z-index: 1;">
            <!-- Les éléments décoratifs (les mêmes que dans About) -->
            <div style="position: absolute; top: -20px; left: -20px; width: 100px; height: 100px; background: radial-gradient(var(--primary) 2px, transparent 2px); background-size: 10px 10px; z-index: 0; opacity: 0.2;"></div>
            <div style="position: absolute; bottom: -20px; right: -20px; border: 4px solid var(--primary); width: 80%; height: 80%; border-radius: 30px; z-index: 0; opacity: 0.1;"></div>
            
            <div style="position: relative; border-radius: 30px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.1); z-index: 1; border: 8px solid white; background: white;">
                <!-- Lazy loading avec placeholder -->
                <div class="lazy-image-container" style="position: relative; width: 100%; height: 450px; background: linear-gradient(45deg, #f0f0f0 25%, #e0e0e0 25%, #e0e0e0 50%, #f0f0f0 50%, #f0f0f0 75%, #e0e0e0 75%, #e0e0e0); background-size: 20px 20px; animation: shimmer 1.5s infinite linear;">
                    <img 
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3C/svg%3E" 
                        data-src="${heroImage}" 
                        ${imgErr(0)} 
                        alt="${companyName}" 
                        class="lazy-image" 
                        style="width: 100%; height: 450px; display: block; object-fit: cover; transition: opacity 0.3s ease;"
                        loading="lazy">
                </div>
            </div>
        </div>
    </section>

    <!-- A Propos -->
    <section class="container bg-alternate" id="about">
        <div class="bg-pattern"></div>
        <div class="section-header reveal">
            <h2>Un professionnel de confiance à votre service</h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 4rem; align-items: center; position: relative; z-index: 1;">
            <div class="reveal reveal-left" style="position: relative;">
                <!-- Decorative background elements -->
                <div style="position: absolute; top: -20px; left: -20px; width: 100px; height: 100px; background: radial-gradient(var(--primary) 2px, transparent 2px); background-size: 10px 10px; z-index: 0; opacity: 0.2;"></div>
                <div style="position: absolute; bottom: -20px; right: -20px; border: 4px solid var(--primary); width: 80%; height: 80%; border-radius: 30px; z-index: 0; opacity: 0.1;"></div>
                
                <div style="position: relative; border-radius: 30px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.1); z-index: 1; border: 8px solid white;">
                    <div class="lazy-image-container" style="position: relative; width: 100%; height: 450px; background: linear-gradient(45deg, #f0f0f0 25%, #e0e0e0 25%, #e0e0e0 50%, #f0f0f0 50%, #f0f0f0 75%, #e0e0e0 75%, #e0e0e0); background-size: 20px 20px; animation: shimmer 1.5s infinite linear;">
                        <img 
                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3C/svg%3E" 
                            data-src="${getImg(1)}" 
                            ${imgErr(1)} 
                            alt="${companyName}" 
                            class="lazy-image" 
                            style="width: 100%; height: 450px; display: block; object-fit: cover; transition: opacity 0.3s ease;"
                            loading="lazy">
                    </div>
                </div>
            </div>
            <div class="reveal reveal-right">
                <h2 style="font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; margin-bottom: 1.5rem; font-family: 'Outfit';">
                    Qui sommes-nous ?
                </h2>
                <p style="color: var(--text-muted); font-size: 1.125rem; line-height: 1.8; margin-bottom: 2.5rem;">
                    ${aboutText}
                </p>
                <ul style="list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                    <li style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--text-main);"><i data-lucide="check-circle-2" style="color: var(--primary);"></i> Expertise reconnue</li>
                    <li style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--text-main);"><i data-lucide="check-circle-2" style="color: #10b981;"></i> Solutions sur-mesure</li>
                    <li style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--text-main);"><i data-lucide="check-circle-2" style="color: #f59e0b;"></i> Accompagnement total</li>
                    <li style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--text-main);"><i data-lucide="check-circle-2" style="color: #8b5cf6;"></i> Réactivité garantie</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Nos Garanties -->
    <section class="container" id="valeurs">
        <div class="section-header reveal" style="position: relative; z-index: 1;">
            <h2>Nos garanties</h2>
            <p>Les engagements qui font la différence et votre tranquillité d'esprit.</p>
        </div>
        <div class="valeurs-grid">
            ${template.guarantees.map((garantie: any, index: number) => `
            <div class="valeur-card reveal" style="transition-delay: ${index * 100}ms">
                <div class="valeur-icon"><i data-lucide="${garantie.icon}" width="32" height="32"></i></div>
                <h3 style="font-family: 'Outfit'; font-size: 1.35rem; margin-bottom: 1rem;">${garantie.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem;">Un engagement pris pour votre satisfaction et votre sécurité.</p>
            </div>
            `).join('')}
        </div>
    </section>

    <!-- Nos Chiffres Clés -->
    <section class="container section-stats" style="padding-top: 2rem; padding-bottom: 2rem;">
        <div class="stats-banner reveal">
            <div class="stat-banner-item">
                <h3>${(reviews || 0) > 0 ? (reviews || 0) + '+' : '100%'}</h3>
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
                <div style="font-weight: 500; opacity: 0.9;">Satisfaction</div>
            </div>
        </div>
    </section>

    <!-- Garanties & Assurances -->
    <section class="container bg-alternate section-assurances" id="garanties" style="background: rgba(255,255,255,0.4); backdrop-filter: blur(10px); margin: 3rem auto; border-radius: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.05);">
        <div class="section-header reveal">
            <h2>Garanties & Assurances</h2>
            <p>Travaillez l'esprit serein grâce à nos couvertures complètes conformes à la législation.</p>
        </div>
        <div class="valeurs-grid">
            ${(template.guarantees || [
              { title: 'Garantie Décennale', icon: 'shield-check' },
              { title: 'Assurance RC Pro', icon: 'briefcase' },
              { title: 'Certification Qualité', icon: 'award' },
              { title: 'Satisfaction Garantie', icon: 'heart' }
            ]).map((g: any, i: number) => `
            <div class="valeur-card reveal" style="border-top: 4px solid var(--primary); transition-delay: ${i * 100}ms; background: white;">
                <div class="valeur-icon" style="background: rgba(var(--primary-rgb), 0.1); color: var(--primary);"><i data-lucide="${g.icon}" width="32" height="32"></i></div>
                <h3 style="font-family: 'Outfit'; font-size: 1.25rem; font-weight: 700; color: var(--text-main);">${g.title}</h3>
            </div>
            `).join('')}
        </div>
    </section>

    <!-- Process (4 Démarches) -->
    <section class="container section-process" id="process">
        <!-- Supprimé : anim-shape pour design plus propre -->
        <div class="section-header reveal">
            <h2>Notre démarche en 4 étapes</h2>
            <p>Une méthodologie claire et transparente pour garantir le succès de votre projet.</p>
        </div>
        <div class="process-grid reveal">
            <div class="step-card">
                <div class="step-number">1</div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; font-family: 'Outfit';">Prise de contact</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem;">Nous étudions ensemble votre besoin et définissons les priorités.</p>
            </div>
            <div class="step-card">
                <div class="step-number">2</div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; font-family: 'Outfit';">Devis détaillé</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem;">Un chiffrage précis et transparent, sans aucun frais caché.</p>
            </div>
            <div class="step-card">
                <div class="step-number">3</div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; font-family: 'Outfit';">Intervention</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem;">Réalisation de la prestation par nos experts qualifiés.</p>
            </div>
            <div class="step-card">
                <div class="step-number">4</div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; font-family: 'Outfit';">Suivi qualité</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem;">Nous nous assurons de votre entière satisfaction après livraison.</p>
            </div>
        </div>
    </section>

    <!-- SECTIONS DYNAMIQUES SPÉCIFIQUES AU SECTEUR -->
    ${generateSections(content, template, allImages)}
        </div>
        
        <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 3rem;">
            <div style="font-size: 3rem; font-weight: 800; color: var(--text-main); line-height: 1;">${rating}</div>
            <div>
                <div style="display: flex; color: #f59e0b; gap: 4px; margin-bottom: 4px;">
                    <i data-lucide="star" fill="currentColor"></i><i data-lucide="star" fill="currentColor"></i><i data-lucide="star" fill="currentColor"></i><i data-lucide="star" fill="currentColor"></i><i data-lucide="star" fill="currentColor"></i>
                </div>
                <div style="color: var(--text-muted); font-weight: 500;">Basé sur ${reviews} avis Google</div>
            </div>
        </div>
        
        <div class="grid-3">
            ${testimonials.map((t, i) => `
            <div class="card testimonial-card glass reveal" style="transition-delay: ${(i%3) * 100}ms">
                <div>
                    <div class="stars" style="margin-bottom: 1rem;">
                        ${Array(t.rating).fill('<i data-lucide="star" fill="currentColor"></i>').join('')}
                    </div>
                    <p style="color: var(--text-main); font-size: 1.125rem; font-weight: 500; font-style: italic; line-height: 1.6; 
                      display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;">"${t.text}"</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 2rem; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1.5rem;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items:center; justify-content:center; font-weight: 700; color: white; font-size: 1.25rem;">
                        ${t.author.charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight: 700; color: var(--text-main);">${t.author}</div>
                        ${t.date ? `<div style="font-size: 0.875rem; color: var(--text-muted);">${t.date}</div>` : ''}
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </section>

    <!-- Maps & Contact -->
    <section class="container bg-alternate" id="contact">
        <div class="section-header reveal">
            <h2>Passez à l'action dès aujourd'hui</h2>
            <p>Notre équipe est prête à intervenir. Contactez-nous pour un diagnostic rapide.</p>
        </div>
        <div class="contact-grid reveal">
            <div class="map-side">
                <iframe 
                    src="https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed" 
                    allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
            <div class="contact-form-side">
                <h3 style="font-size: 2rem; font-family: 'Outfit'; margin-bottom: 2rem;">Envoyez-nous un message</h3>
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
                <input type="text" placeholder="Votre nom" required style="width: 100%; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; outline: none; font-family: 'Inter';">
            </div>
            <div style="margin-bottom: 1rem;">
                <input type="tel" placeholder="Votre numéro de téléphone" required style="width: 100%; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; outline: none; font-family: 'Inter';">
            </div>
            <button type="submit" style="width: 100%; padding: 1rem; background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;">
                <i data-lucide="phone-call" width="20"></i> Être rappelé(e)
            </button>
=======
  <!-- Modal Contact — ✅ Formsubmit.co -->
  <div id="contact-modal" class="modal" style="display:none;align-items:center;justify-content:center;">
    <div style="background:white;padding:3rem;border-radius:24px;width:90%;max-width:500px;position:relative;box-shadow:0 25px 50px rgba(0,0,0,0.2);">
      <button onclick="closeContactModal()" style="position:absolute;right:1.5rem;top:1.5rem;background:#f1f5f9;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1.5rem;display:flex;align-items:center;justify-content:center;color:#64748b;">×</button>
      <div id="modal-form-wrapper">
        <h3 style="font-size:1.5rem;font-weight:700;color:var(--text-main);margin-bottom:0.5rem;text-align:center;">Demander une intervention</h3>
        <p style="color:var(--text-muted);text-align:center;margin-bottom:2rem;font-size:0.95rem;">Laissez vos coordonnées, nous vous répondons rapidement.</p>
        <form id="modal-form" action="${formsubmitEndpoint}" method="POST">
          <input type="hidden" name="_subject" value="🚀 Demande d'intervention — ${companyName}">
          <input type="hidden" name="_captcha" value="false">
          <input type="hidden" name="_template" value="table">
          <input type="hidden" name="_next" value="about:blank">
          <div style="margin-bottom:1rem;"><input type="text" name="Nom" placeholder="Votre nom" required style="width:100%;padding:1rem;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;outline:none;font-family:'Inter';font-size:1rem;"></div>
          <div style="margin-bottom:1rem;"><input type="tel" name="Téléphone" placeholder="Votre numéro de téléphone" required style="width:100%;padding:1rem;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;outline:none;font-family:'Inter';font-size:1rem;"></div>
          <div style="margin-bottom:1.5rem;"><textarea name="Message" placeholder="Votre besoin en quelques mots (optionnel)" rows="3" style="width:100%;padding:1rem;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;outline:none;font-family:'Inter';font-size:1rem;resize:none;"></textarea></div>
          <button type="submit" id="modal-submit-btn" style="width:100%;padding:1rem;background:var(--primary);color:white;border:none;border-radius:12px;font-weight:700;font-size:1rem;cursor:pointer;display:flex;justify-content:center;align-items:center;gap:8px;">
            <i data-lucide="phone-call" width="20"></i> <span id="modal-btn-text">Envoyer ma demande</span>
          </button>
>>>>>>> c96dc41a6d903c2bcd1fa17cb866365be9525410
        </form>
      </div>
      <div id="modal-success" style="display:none;text-align:center;padding:2rem 1rem;">
        <div style="width:70px;height:70px;border-radius:50%;background:rgba(16,185,129,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
          <i data-lucide="check-circle-2" width="36" height="36" style="color:#10b981;"></i>
        </div>
        <h4 style="font-size:1.4rem;font-family:'Outfit';margin-bottom:0.75rem;">Demande envoyée !</h4>
        <p style="color:var(--text-muted);margin-bottom:1.5rem;">Nous vous contacterons très rapidement.</p>
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
          <li><a href="#process">Notre Démarche</a></li>
          <li><a href="#testimonials">Avis Clients</a></li>
          <li><a href="javascript:void(0)" onclick="openLegalModal('modal-mentions')">Mentions Légales</a></li>
          <li><a href="javascript:void(0)" onclick="openLegalModal('modal-policy')">Confidentialité</a></li>
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
      <p>© ${new Date().getFullYear()} ${companyName}. Tous droits réservés.</p>
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
        Service Client — ${logoInfo.word1}
      </div>
      <button onclick="document.getElementById('chat-window').classList.remove('open')" style="background:none;border:none;color:white;cursor:pointer;display:flex;align-items:center;"><i data-lucide="x" width="24"></i></button>
    </div>
    <div id="chat-body" style="flex:1;padding:1.5rem;overflow-y:auto;background:#f8fafc;display:flex;flex-direction:column;gap:0.5rem;">
      <div style="background:white;padding:1rem;border-radius:12px;border-bottom-left-radius:0;box-shadow:0 2px 10px rgba(0,0,0,0.05);font-size:0.95rem;align-self:flex-start;max-width:85%;">
        Bonjour ! Bienvenue chez ${logoInfo.text}. Comment puis-je vous aider aujourd'hui ? 😊
      </div>
    </div>
    <div style="padding:1rem;background:white;border-top:1px solid #e2e8f0;display:flex;gap:10px;">
      <input type="text" id="chat-text" placeholder="Écrivez votre message..." style="flex:1;border:1px solid #e2e8f0;outline:none;background:#f8fafc;padding:0.75rem 1rem;border-radius:100px;font-family:'Inter';">
      <button id="chat-send-btn" onclick="sendMsg()" style="background:var(--primary);border:none;color:white;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;"><i data-lucide="send" width="18"></i></button>
    </div>
  </div>

  <!-- Modals légaux -->
  <div id="modal-mentions" class="modal">
    <div class="legal-modal-content">
      <button class="close-modal" onclick="closeLegalModal('modal-mentions')">×</button>
      <h2 style="font-family:'Outfit';font-weight:800;color:var(--text-main);font-size:2.5rem;margin-bottom:2rem;">Mentions Légales</h2>
      <p>Le présent site est édité par <strong>${companyName}</strong>, situé au <strong>${address}</strong>.</p>
      <h3 style="margin-top:2rem;margin-bottom:1rem;font-family:'Outfit';">Hébergement</h3>
      <p>Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133 Walnut, CA 91789, USA.</p>
      <h3 style="margin-top:2rem;margin-bottom:1rem;font-family:'Outfit';">Contact</h3>
      <p>${phone ? 'Téléphone : <strong>' + phone + '</strong><br>' : ''}${email ? 'Email : <strong>' + email + '</strong>' : ''}</p>
    </div>
  </div>
  <div id="modal-policy" class="modal">
    <div class="legal-modal-content">
      <button class="close-modal" onclick="closeLegalModal('modal-policy')">×</button>
      <h2 style="font-family:'Outfit';font-weight:800;color:var(--text-main);font-size:2.5rem;margin-bottom:2rem;">Politique de Confidentialité</h2>
      <p>Chez <strong>${companyName}</strong>, nous accordons une importance capitale à la protection de vos données personnelles.</p>
      <h3 style="margin-top:2rem;margin-bottom:1rem;font-family:'Outfit';">Collecte des données</h3>
      <p>Nous collectons uniquement les données soumises via nos formulaires : nom, téléphone, email. Ces données sont utilisées pour répondre à vos demandes et ne sont jamais cédées à des tiers.</p>
      <h3 style="margin-top:2rem;margin-bottom:1rem;font-family:'Outfit';">Vos droits (RGPD)</h3>
      <p>Vous disposez d'un droit d'accès, de rectification et de suppression. Pour l'exercer : ${email ? '<strong>' + email + '</strong>' : 'contactez-nous'}</p>
    </div>
  </div>

  <script>
    // ── Init Lucide Icons ──
    lucide.createIcons();

    // ── Navbar scroll ──
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
    });

    // ── Mobile menu ──
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
      mobileMenu.querySelectorAll('.mobile-menu-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.remove('open')));
      document.addEventListener('click', e => { if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) mobileMenu.classList.remove('open'); });
    }

    // ── Reveal animations ──
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); observer.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // ── Chatbot ──
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
        fd.append('Nom', collectedName || 'Non précisé');
        fd.append('Téléphone', collectedPhone);
        fd.append('Source', 'Chatbot site démo');
        fd.append('Entreprise', '${companyName}');
        fd.append('_subject', '📱 Lead chatbot — ${companyName}');
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
          if (salut) { addBotMsg("Bonjour ! 😊 Comment puis-je vous aider concrètement aujourd'hui ?"); }
          else { addBotMsg("Bien reçu ! Pour mieux vous aider, puis-je avoir votre <strong>prénom</strong> ?"); chatStep++; }
        } else if (chatStep === 1) {
          collectedName = val;
          addBotMsg("Merci <strong>" + collectedName + "</strong> ! 👋 Quel est votre <strong>numéro de téléphone</strong> pour qu'on vous rappelle ?");
          chatStep++;
        } else if (chatStep === 2) {
          const digits = (val.match(/[0-9]/g) || []).length;
          if (digits >= 8) {
            collectedPhone = val; chatStep++;
            addBotMsg("Parfait ! ✅ Un expert va vous rappeler très prochainement. Merci de votre confiance !");
            chatInput.disabled = true;
            chatInput.placeholder = 'Conversation terminée.';
            document.getElementById('chat-send-btn').disabled = true;
            notifyLead();
          } else {
            addBotMsg("Je n'ai pas reconnu ce numéro. Pouvez-vous le ré-écrire ? <br><span style='font-size:0.85rem;color:#9ca3af;'>Exemple : 06 12 34 56 78</span>");
          }
        }
      }, 800 + Math.random() * 600);
    }
    chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(); });

    // ── Formulaire principal ──
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

    // ── Modal formulaire ──
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

    // ── Modal helpers ──
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

<<<<<<< HEAD
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

        // === LAZY LOADING AVANCÉ ===
        // Lazy loading avec Intersection Observer
        const lazyImages = document.querySelectorAll('.lazy-image');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    
                    if (src) {
                        // Charger l'image réelle
                        img.src = src;
                        img.onload = () => {
                            // Animation de fondu
                            img.style.opacity = '1';
                            // Cacher le placeholder shimmer
                            const container = img.closest('.lazy-image-container');
                            if (container) {
                                container.style.background = 'none';
                                container.style.animation = 'none';
                            }
                        };
                        
                        // Nettoyer l'observer
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px', // Charger 50px avant qu'elle ne soit visible
            threshold: 0.01
        });

        // Observer toutes les images lazy
        lazyImages.forEach(img => {
            // Initialiser avec opacité 0 pour le fondu
            img.style.opacity = '0';
            imageObserver.observe(img);
        });

        // Fallback pour les navigateurs qui ne supportent pas Intersection Observer
        if (!('IntersectionObserver' in window)) {
            lazyImages.forEach(img => {
                const src = img.dataset.src;
                if (src) {
                    img.src = src;
                    img.style.opacity = '1';
                    const container = img.closest('.lazy-image-container');
                    if (container) {
                        container.style.background = 'none';
                        container.style.animation = 'none';
                    }
                }
            });
        }

        // === PROTECTION CSRF AVANCÉE ===
        // Génération de token CSRF
        function generateCSRFToken() {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }

        // Validation et protection des formulaires
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Marquer que JavaScript est activé
            const jsField = form.querySelector('input[name="_js_enabled"]');
            if (jsField) {
                jsField.value = 'true';
            }

            // Validation avant soumission
            form.addEventListener('submit', function(e) {
                const submitTime = Date.now();
                const timestampField = form.querySelector('input[name="_form_timestamp"]');
                const formIdField = form.querySelector('input[name="_form_id"]');
                const csrfField = form.querySelector('input[name="_csrf_token"]');
                const honeyField = form.querySelector('input[name="_honey"]');

                // Vérifier le honeypot (anti-spam)
                if (honeyField && honeyField.value.trim() !== '') {
                    e.preventDefault();
                    console.warn('Honeypot field filled - possible spam bot');
                    return false;
                }

                // Vérifier le timestamp (anti-brute force)
                if (timestampField) {
                    const formTime = parseInt(timestampField.value);
                    const timeDiff = submitTime - formTime;
                    
                    // Si le formulaire est soumis trop rapidement (< 3 secondes) ou trop lentement (> 1 heure)
                    if (timeDiff < 3000 || timeDiff > 3600000) {
                        e.preventDefault();
                        console.warn('Invalid form submission timing - possible bot');
                        return false;
                    }
                }

                // Vérifier le token CSRF
                if (csrfField) {
                    const token = csrfField.value;
                    if (!token || token.length !== 64) {
                        e.preventDefault();
                        console.warn('Invalid CSRF token');
                        return false;
                    }
                }

                // Validation des champs requis
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');
                        
                        // Afficher un message d'erreur
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'field-error';
                        errorMsg.textContent = 'Ce champ est obligatoire';
                        errorMsg.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;';
                        
                        const existingError = field.parentNode.querySelector('.field-error');
                        if (!existingError) {
                            field.parentNode.appendChild(errorMsg);
                        }
                    } else {
                        field.classList.remove('error');
                        const errorMsg = field.parentNode.querySelector('.field-error');
                        if (errorMsg) {
                            errorMsg.remove();
                        }
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                    return false;
                }

                // Validation email
                const emailField = form.querySelector('input[type="email"]');
                if (emailField && emailField.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(emailField.value)) {
                        e.preventDefault();
                        emailField.classList.add('error');
                        
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'field-error';
                        errorMsg.textContent = 'Veuillez entrer une adresse email valide';
                        errorMsg.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;';
                        
                        const existingError = emailField.parentNode.querySelector('.field-error');
                        if (!existingError) {
                            emailField.parentNode.appendChild(errorMsg);
                        }
                        return false;
                    }
                }

                // Validation téléphone (si présent)
                const phoneField = form.querySelector('input[type="tel"]');
                if (phoneField && phoneField.value) {
                    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
                    if (!phoneRegex.test(phoneField.value) || phoneField.value.replace(/\D/g, '').length < 10) {
                        e.preventDefault();
                        phoneField.classList.add('error');
                        
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'field-error';
                        errorMsg.textContent = 'Veuillez entrer un numéro de téléphone valide';
                        errorMsg.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;';
                        
                        const existingError = phoneField.parentNode.querySelector('.field-error');
                        if (!existingError) {
                            phoneField.parentNode.appendChild(errorMsg);
                        }
                        return false;
                    }
                }

                // Ajouter des headers de sécurité supplémentaires
                const formData = new FormData(form);
                formData.append('_user_agent', navigator.userAgent);
                formData.append('_referrer', document.referrer);
                formData.append('_origin', window.location.origin);
                
                // Marquer le formulaire comme soumis pour éviter les doubles soumissions
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Envoi en cours...';
                    
                    // Réactiver après 10 secondes (au cas où la soumission échoue)
                    setTimeout(() => {
                        submitButton.disabled = false;
                        submitButton.textContent = submitButton.getAttribute('data-original-text') || 'Envoyer';
                    }, 10000);
                }
            });

            // Nettoyer les erreurs lors de la saisie
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', function() {
                    input.classList.remove('error');
                    const errorMsg = input.parentNode.querySelector('.field-error');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                });
            });
        });

        // Protection contre le clic multiple rapide
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON' && e.target.type === 'submit') {
                const form = e.target.closest('form');
                if (form && form.dataset.submitting === 'true') {
                    e.preventDefault();
                    return false;
                }
                form.dataset.submitting = 'true';
                setTimeout(() => {
                    form.dataset.submitting = 'false';
                }, 5000);
            }
        });
    </script>
=======
    // ── Auto-popup à 60% de scroll (une seule fois par session) ──
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
>>>>>>> c96dc41a6d903c2bcd1fa17cb866365be9525410
</body>
</html>`;
}