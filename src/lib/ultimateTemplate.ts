// ── PREMIUM LOCAL BUSINESS TEMPLATE ──
// Design épuré, luxe, professionnel. Zero gimmicks, zero popups agressifs.

import { getSectorImages, getSectorImagesAsync, getServiceImageQuery, fetchSectorImagesFromAPI, fetchServiceImages, getPexelsApiKey, setPexelsApiKey } from './pexelsImages';
import { getImagesForLead } from './pexelsApi';
import { isImageBlocked, filterImages, isStockImage } from './imageFilters';
import { getSectorConfig } from './sectorConfig';
import { UI } from './template/ui';
import { getProcessSteps, getGuarantees, getHeroBadge, getGalleryDesc, getPrivacyContent, generateFeaturesFromService, generateAboutText, capitalizeCity, getLogoInfo, detectLanguage, isEnglishText, cleanText, getStats, getServiceDescriptions, getTrustBadges } from './template/helpers';
export { detectLanguage };
import { resolveSectorContent } from './template/sectorContent';
import type { SectorCopy } from './template/sectorContent';


// Descriptions courtes des engagements (clé = icône lucide) — secteur-adaptables
const ADV_DESC: Record<string, { fr: string; en: string }> = {
  'shield-check': { fr: 'Protection et conformité garanties sur chaque intervention', en: 'Guaranteed protection & compliance on every job' },
  'badge-check': { fr: 'Un professionnel certifié et qualifié', en: 'A certified, qualified professional' },
  'clock': { fr: 'Une réactivité au rendez-vous, en urgence comme en routine', en: 'Responsiveness you can count on, urgent or routine' },
  'file-text': { fr: 'Devis transparent et détaillé, sans mauvaise surprise', en: 'Transparent, detailed quote — no surprises' },
  'leaf': { fr: 'Des produits respectueux de votre santé et de l\'environnement', en: 'Products that respect your health and the environment' },
  'sparkles': { fr: 'Un soin minutieux et une finition soignée', en: 'Meticulous care and a polished finish' },
  'scissors': { fr: 'Savoir-faire et formation continue', en: 'Expertise backed by ongoing training' },
  'heart': { fr: 'Votre satisfaction est notre priorité absolue', en: 'Your satisfaction is our absolute priority' },
  'star': { fr: 'Régulièrement apprécié de nos clients', en: 'Consistently loved by our clients' },
  'car': { fr: 'Un service pratique, pensé pour vous', en: 'A convenient service designed around you' },
  'users': { fr: 'Une équipe formée et professionnelle', en: 'A trained, professional team' },
  'award': { fr: 'Des experts diplômés d\'État', en: 'State-certified experts' },
  'dumbbell': { fr: 'Un matériel de qualité, toujours entretenu', en: 'Quality equipment, always maintained' },
  'sun': { fr: 'Des conseils adaptés à chaque saison', en: 'Advice tailored to every season' },
  'sprout': { fr: 'Des végétaux vigoureux, garantis', en: 'Healthy, guaranteed plants' },
  'tree-deciduous': { fr: 'Un paysagiste qualifié à votre écoute', en: 'A qualified landscaper who listens' },
  'stethoscope': { fr: 'Un professionnel de santé conventionné', en: 'A contracted health professional' },
  'credit-card': { fr: 'Pas d\'avance de frais, des facilités de paiement', en: 'No upfront fees, flexible payment' },
  'calendar': { fr: 'Un rendez-vous sous 48h, sans attente', en: 'An appointment within 48h, no waiting' },
  'scale': { fr: 'Un avocat inscrit au barreau', en: 'An attorney licensed at the bar' },
  'shield': { fr: 'Confidentialité et discrétion préservées', en: 'Privacy and discretion preserved' },
  'sword': { fr: 'Une défense déterminée de vos droits', en: 'A determined defense of your rights' },
};

// ── Inline functions moved to template/helpers.ts ──
// generateAboutText, generateFeaturesFromService, getProcessSteps,
// getPrivacyContent, getGalleryDesc, getLogoInfo, capitalizeCity,
// getGuarantees, getHeroBadge — all imported from './template/helpers'

export interface UltimateContent {
  companyName: string;
  sector: string;
  city: string;
  description: string;
  lang?: 'fr' | 'en';
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  googleRating?: number;
  googleReviews?: number;
  services: Array<{ name: string; description: string; features: string[] }>;
  serviceImages: string[];
  galleryImages: string[];
  realPhotos?: string[];
  testimonials: Array<{ author: string; text: string; rating: number; date?: string }>;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  ctaText: string;
  slogan: string;
  heroImage: string;
  allImages: string[];
  galleryTitle?: string;
  aboutTitle?: string;
  servicesTitle?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  accentOnDark?: string;
  hours?: string;
  establishedYear?: number;
  footerDesc?: string;
  hasRealRating?: boolean;
  hasRealReviews?: boolean;
}

const SECTOR_ULTIMATE_TEMPLATES: Record<string, {
  primary: string; secondary: string; accent: string; background: string;
  services: Array<{ name: string; description: string; features: string[] }>;
  servicesEn?: Array<{ name: string; description: string; features: string[] }>;
  guarantees: Array<{ title: string; icon: string }>;
  heroTitle: string; heroTitleEn?: string;
  heroSubtitle: string; heroSubtitleEn?: string;
  aboutText: string; aboutTextEn?: string;
  ctaText: string; ctaTextEn?: string;
}> = {
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
      { title: 'Garantie Décennale', icon: 'shield-check' },
      { title: 'Intervention < 2h', icon: 'clock' },
      { title: 'Devis Gratuit', icon: 'file-text' },
      { title: 'Artisan Qualifié', icon: 'badge-check' }
    ],
    heroTitle: 'Artisan Plombier', heroTitleEn: 'Plumbing Expert',
    heroSubtitle: "De la fuite d'eau à la rénovation complète, un savoir-faire au service de vos installations", heroSubtitleEn: 'From leak repair to complete renovation, expertise for your plumbing systems',
    aboutText: "Plombier chauffagiste depuis plus de 15 ans, je mets mon savoir-faire au service de vos installations. Artisan passionné, je garantis un travail soigné, des délais respectés et des tarifs transparents.", aboutTextEn: 'Plumber and heating specialist for over 15 years. I bring my expertise to your installations with quality work, respected deadlines, and transparent pricing.',
    ctaText: 'Demander un devis gratuit', ctaTextEn: 'Get a Free Quote'
  },
  electricien: {
    primary: '#1e40af', secondary: '#1e3a8a', accent: '#2563eb', background: '#f8fafc',
    services: [
      { name: 'Mise aux Normes', description: 'Remise à neuf de votre installation électrique', features: ['Norme NFC 15-100', 'Tableau électrique neuf', 'Mise à la terre'] },
      { name: 'Dépannage Électrique', description: 'Pannes, court-circuits, disjonctions', features: ['Intervention rapide', 'Diagnostic complet', 'Réparation durable'] },
      { name: 'Installation Complète', description: 'Construction ou rénovation électrique', features: ['Câblage complet', 'Points de lumière', 'Prises et inters'] },
      { name: 'Domotique & Smart Home', description: 'Maison connectée et automatisée', features: ['Volets roulants', 'Éclairage auto', 'Thermostats'] },
      { name: 'Éclairage LED', description: 'Solutions éclairage économiques', features: ['Spots encastrés', 'Suspensions design', 'Éclairage extérieur'] },
      { name: 'Bornes de Recharge', description: 'Installation bornes véhicule électrique', features: ['Wallbox particulier', 'Borne entreprise', 'Certification IRVE'] }
    ],
    guarantees: [
      { title: 'Consuel Certifié', icon: 'shield-check' },
      { title: 'Garantie Décennale', icon: 'badge-check' },
      { title: 'Intervention < 2h', icon: 'clock' },
      { title: 'Devis Gratuit', icon: 'file-text' }
    ],
    heroTitle: 'Électricien Agréé', heroTitleEn: 'Certified Electrician',
    heroSubtitle: "Des installations sûres, conformes et durables pour votre habitat et votre entreprise", heroSubtitleEn: 'Safe, compliant, and durable installations for your home and business',
    aboutText: "Électricien certifié Consuel avec 15 ans d'expérience. Je sécurise votre habitat grâce à des installations conformes et durables. Artisan sérieux, intervention rapide et devis transparent.", aboutTextEn: 'Consuel-certified electrician with 15 years of experience. I secure your home with compliant and durable installations. Professional work, fast response, and transparent quotes.',
    ctaText: 'Contactez-nous', ctaTextEn: 'Contact Us'
  },
  coiffeur: {
    primary: '#6b21a8', secondary: '#581c87', accent: '#7c3aed', background: '#faf5ff',
    services: [
      { name: 'Coupes & Styles', description: 'Coupe sur-mesure femme et homme', features: ['Visagisme personnalisé', 'Techniques actuelles', 'Conseil entretien'] },
      { name: 'Barbier Traditionnel', description: 'Rasage et soins barbe', features: ["Rasage à l'ancienne", 'Taille précise', 'Soins barbe'] },
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
    heroTitle: 'Coiffeur Visagiste', heroTitleEn: 'Hair Stylist',
    heroSubtitle: "L'art de sublimer vos cheveux avec passion et expertise", heroSubtitleEn: 'The art of enhancing your hair with passion and expertise',
    aboutText: "Coiffeur passionné depuis 15 ans, je crée des looks qui vous ressemblent. Spécialiste du visagisme et des techniques modernes, je veille à la santé de vos cheveux avec des produits naturels et de qualité.", aboutTextEn: 'Passionate hair stylist for 15 years, I create looks that suit you. Specialist in face-shaping and modern techniques, I care for your hair with natural, quality products.',
    ctaText: 'Prendre rendez-vous', ctaTextEn: 'Book Appointment'
  },
  restaurant: {
    primary: '#c2410c', secondary: '#9a3412', accent: '#ea580c', background: '#fff7ed',
    services: [
      { name: 'Cuisine Maison', description: 'Plats préparés sur place', features: ['Produits locaux', 'Recettes authentiques', 'Fait minute'] },
      { name: 'Menu du Jour', description: 'Formule déjeuner économique', features: ['Entrée + Plat + Dessert', 'Produits frais', 'Cuisson minute'] },
      { name: 'Spécialités', description: 'Nos plats signature', features: ['Recettes du terroir', 'Grillades', 'Poissons frais'] },
      { name: 'Événements & Groupes', description: 'Repas de famille et séminaires', features: ['Menu groupe', 'Salle privative', 'Sur mesure'] },
      { name: 'Service Traiteur', description: 'Livraison et à emporter', features: ['Plateaux repas', 'Buffets', 'Livraison pro'] },
      { name: 'Boissons & Vins', description: 'Carte des vins et cocktails', features: ['Vins régionaux', 'Cocktails maison', 'Bières artisanales'] }
    ],
    guarantees: [
      { title: 'Produits Frais', icon: 'leaf' },
      { title: 'Service Rapide', icon: 'clock' },
      { title: 'Avis Clients', icon: 'star' },
      { title: 'Parking Gratuit', icon: 'car' }
    ],
    heroTitle: 'Restaurant Traditionnel', heroTitleEn: 'Traditional Restaurant',
    heroSubtitle: "Cuisine authentique et accueil chaleureux depuis 2009", heroSubtitleEn: 'Authentic cuisine and warm hospitality since 2009',
    aboutText: "Chef passionné depuis 15 ans, je cuisine avec cœur des plats généreux et savoureux. Produits frais du marché, recettes authentiques et ambiance conviviale vous attendent.", aboutTextEn: 'Passionate chef for 15 years, cooking generous and flavorful dishes with heart. Fresh market produce, authentic recipes, and a welcoming atmosphere await you.',
    ctaText: 'Réserver une table', ctaTextEn: 'Reserve a Table'
  },
  garage: {
    primary: '#166534', secondary: '#14532d', accent: '#059669', background: '#f0fdf4',
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
      { title: 'Mécaniciens Certifiés', icon: 'clock' },
      { title: 'Véhicule de Courtoisie', icon: 'car' }
    ],
    heroTitle: 'Garage Automobile', heroTitleEn: 'Auto Garage',
    heroSubtitle: "Mécanicien passionné, votre véhicule entre de bonnes mains", heroSubtitleEn: 'Passionate mechanic, your vehicle in good hands',
    aboutText: "Mécanicien automobile depuis 15 ans, j'entretiens et répare toutes marques avec passion. Diagnostic précis, devis transparents et respect des délais.", aboutTextEn: 'Automotive mechanic for 15 years, I maintain and repair all brands with passion. Accurate diagnostics, transparent quotes, and respected deadlines.',
    ctaText: 'Demendez un RDV', ctaTextEn: 'Book an Appointment'
  },
  nettoyage: {
    primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#f0fdf4',
    services: [
      { name: 'Nettoyage de Bureaux', description: 'Entretien quotidien de vos locaux', features: ['Poussière, sols, vitres', 'Produits écolabels', 'Horaires flexibles'] },
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
      { title: 'Assurance RC Pro', icon: 'shield-check' }
    ],
    heroTitle: 'Société de Nettoyage', heroTitleEn: 'Cleaning Company',
    heroSubtitle: "Propreté professionnelle et écologique pour vos espaces", heroSubtitleEn: 'Professional and eco-friendly cleanliness for your spaces',
    aboutText: "Entreprise de nettoyage depuis 15 ans, nos équipes formées interviennent avec rigueur et discrétion. Produits écolabels, matériel professionnel et engagement qualité.", aboutTextEn: 'Cleaning company for 15 years, our trained teams work with precision and discretion. Eco-label products, professional equipment, and quality commitment.',
    ctaText: 'Demander un devis', ctaTextEn: 'Request a Quote'
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
      { title: 'Plantes Garanties', icon: 'sprout' },
      { title: 'Intervention Propre', icon: 'sparkles' },
      { title: 'Conseils Saisonniers', icon: 'sun' },
      { title: 'Paysagiste Qualifié', icon: 'tree-deciduous' }
    ],
    heroTitle: 'Jardinier Paysagiste', heroTitleEn: 'Landscaper',
    heroSubtitle: "Création et entretien de jardins uniques et harmonieux", heroSubtitleEn: 'Creation and maintenance of unique, harmonious gardens',
    aboutText: "Paysagiste passionné depuis 15 ans, je conçois et entretiens des espaces verts qui vivent au rythme des saisons.", aboutTextEn: 'Passionate landscaper for 15 years, I design and maintain green spaces that live in harmony with the seasons.',
    ctaText: 'Demander un devis', ctaTextEn: 'Request a Quote'
  },
  fitness: {
    primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', background: '#fef2f2',
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
      { title: 'Sans Engagement', icon: 'badge-check' },
      { title: 'Accès 6h-23h', icon: 'clock' }
    ],
    heroTitle: 'Coach Sportif', heroTitleEn: 'Fitness Coach',
    heroSubtitle: "Votre coach personnel pour atteindre vos objectifs fitness", heroSubtitleEn: 'Your personal coach to reach your fitness goals',
    aboutText: "Coach sportif diplômé d'État avec 15 ans d'expérience. Programmes personnalisés pour perdre du poids, gagner en muscle ou préparer une compétition.", aboutTextEn: 'State-certified fitness coach with 15 years of experience. Personalized programs for weight loss, muscle gain, or competition preparation.',
    ctaText: 'Essai offert', ctaTextEn: 'Free Trial'
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
      { title: 'Conventionné Secteur 1', icon: 'stethoscope' },
      { title: '3ème Payant', icon: 'credit-card' },
      { title: 'RDV sous 48h', icon: 'calendar' },
      { title: 'Équipe Pluridisciplinaire', icon: 'users' }
    ],
    heroTitle: 'Cabinet Médical', heroTitleEn: 'Medical Practice',
    heroSubtitle: "Votre santé entre les mains de professionnels qualifiés", heroSubtitleEn: 'Your health in the hands of qualified professionals',
    aboutText: "Médecin généraliste depuis 15 ans, je vous accueille dans un cabinet moderne et chaleureux. Écoute, diagnostic précis et suivi personnalisé.", aboutTextEn: 'General practitioner for 15 years, welcoming you in a modern, warm practice. Listening, accurate diagnosis, and personalized follow-up.',
    ctaText: 'Prendre rendez-vous', ctaTextEn: 'Book Appointment'
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
      { title: 'Avocat au Barreau', icon: 'scale' },
      { title: 'Consultation Privée', icon: 'shield' },
      { title: 'Défense Déterminée', icon: 'sword' },
      { title: 'Honoraires Transparent', icon: 'file-text' }
    ],
    heroTitle: 'Avocat à la Cour', heroTitleEn: 'Attorney at Law',
    heroSubtitle: "Conseil juridique personnalisé et défense de vos droits", heroSubtitleEn: 'Personalized legal advice and defense of your rights',
    aboutText: "Avocat inscrit au Barreau depuis 15 ans, je défends vos intérêts avec rigueur et détermination. Chaque dossier mérite une stratégie sur mesure.", aboutTextEn: 'Bar-certified attorney for 15 years, defending your interests with rigor and determination. Every case deserves a tailored strategy.',
    ctaText: 'Prendre rendez-vous', ctaTextEn: 'Book Appointment'
  },
  default: {
    primary: '#1e293b', secondary: '#334155', accent: '#475569', background: '#f8fafc',
    services: [
      { name: 'Prestation Sur Mesure', description: 'Services adaptés à vos besoins', features: ['Étude personnalisée', 'Devis détaillé', 'Écoute attentive'] },
      { name: 'Service Professionnel', description: 'Un travail soigné et de qualité', features: ['Matériel adapté', 'Techniques actuelles', 'Respect des normes'] },
      { name: 'Conseil & Accompagnement', description: 'Un accompagnement de A à Z', features: ['Diagnostic complet', 'Solutions pertinentes', 'Suivi personnalisé'] },
      { name: 'Réactivité', description: 'Un service à votre rythme', features: ['Réponse rapide', 'Horaires flexibles', 'Prise en charge efficace'] },
      { name: 'Qualité Garantie', description: 'Un engagement sur le résultat', features: ['Contrôle qualité', 'Corrections incluses', 'SAV réactif'] },
      { name: 'Tarifs Clairs', description: 'Des honoraires transparents', features: ['Devis préalable', 'Pas de surprise', 'Facilités de paiement'] }
    ],
    servicesEn: [
      { name: 'Tailored Service', description: 'Services adapted to your needs', features: ['Personalized study', 'Detailed quote', 'Attentive listening'] },
      { name: 'Professional Service', description: 'Careful, quality work', features: ['Adapted equipment', 'Modern techniques', 'Standards compliance'] },
      { name: 'Consulting & Support', description: 'End-to-end guidance', features: ['Complete diagnosis', 'Relevant solutions', 'Personalized follow-up'] },
      { name: 'Responsiveness', description: 'A service at your pace', features: ['Fast response', 'Flexible hours', 'Efficient handling'] },
      { name: 'Quality Guaranteed', description: 'A commitment to results', features: ['Quality control', 'Corrections included', 'Responsive support'] },
      { name: 'Clear Pricing', description: 'Transparent fees', features: ['Prior quote', 'No surprises', 'Payment options'] }
    ],
    guarantees: [
      { title: 'Expertise Reconnue', icon: 'badge-check' },
      { title: 'Devis Clair', icon: 'file-text' },
      { title: 'Réactivité', icon: 'clock' },
      { title: 'Satisfaction Client', icon: 'heart' }
    ],
    heroTitle: 'Notre Établissement', heroTitleEn: 'Our Business',
    heroSubtitle: "Un service de qualité, à l'écoute de vos besoins", heroSubtitleEn: 'Quality service, attentive to your needs',
    aboutText: "Notre équipe met un point d'honneur à offrir un service personnalisé et de qualité. Avec des années d'expérience, nous mettons notre expertise au service de votre satisfaction.", aboutTextEn: 'Our team is committed to delivering personalized, quality service. With years of experience, we put our expertise at your service.',
    ctaText: 'Contactez-nous', ctaTextEn: 'Contact Us'
  }
};

function getUltimateTemplate(sector: string) {
  const s = (sector || '').toLowerCase();
  if (s.includes('nettoyag') || s.includes('propreté') || s.includes('ménage') || s.includes('menage') || s.includes('menager') || s.includes('hygiène') || s.includes('hygiene')) return SECTOR_ULTIMATE_TEMPLATES.nettoyage;
  if (s.includes('jardin') || s.includes('paysag') || s.includes('espaces verts') || s.includes('espace vert') || s.includes('pépinière') || s.includes('arbori') || s.includes('arrosage')) return SECTOR_ULTIMATE_TEMPLATES.jardin;
  if (s.includes('coach') || s.includes('sport') || s.includes('fitness') || s.includes('salle') || s.includes('musculation') || s.includes('yoga') || s.includes('crossfit') || s.includes('boxe')) return SECTOR_ULTIMATE_TEMPLATES.fitness;
  if (s.includes('médec') || s.includes('clinique') || s.includes('dentiste') || s.includes('santé') || s.includes('sante') || s.includes('kiné') || s.includes('pharmac') || s.includes('opticien') || s.includes('infirm') || s.includes('ostéo') || s.includes('sage-femme')) return SECTOR_ULTIMATE_TEMPLATES.medical;
  if (s.includes('avocat') || s.includes('notaire') || s.includes('juridi') || s.includes('droit') || s.includes('cabinet d\'avocat') || s.includes('huissier')) return SECTOR_ULTIMATE_TEMPLATES.avocat;
  if (s.includes('électricien') || s.includes('electricien') || s.includes('electric') || s.includes('électri') || s.includes('electri')) return SECTOR_ULTIMATE_TEMPLATES.electricien;
  if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim') || s.includes('chaud') || s.includes('pompe à chaleur') || s.includes('pompe a chaleur')) return SECTOR_ULTIMATE_TEMPLATES.plomberie;
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon') || s.includes('beauté') || s.includes('beaute') || s.includes('esthétique') || s.includes('esthetique') || s.includes('spa') || s.includes('ongle') || s.includes('tatou')) return SECTOR_ULTIMATE_TEMPLATES.coiffeur;
  if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur') || s.includes('boulanger') || s.includes('pâtissier') || s.includes('patisserie') || s.includes('pizzeria') || s.includes('café') || s.includes('cafe') || s.includes('brasserie') || s.includes('bar ') || s.includes('glacier') || s.includes('poissonnerie') || s.includes('boucherie') || s.includes('charcuterie')) return SECTOR_ULTIMATE_TEMPLATES.restaurant;
  if (s.includes('garage') || s.includes('mécan') || s.includes('mecan') || s.includes('auto') || s.includes('carrosserie') || s.includes('pneu') || s.includes('véhicule') || s.includes('vehicule') || s.includes('camion') || s.includes('moto')) return SECTOR_ULTIMATE_TEMPLATES.garage;
  if (s.includes('peintre') || s.includes('platrier') || s.includes('couvreur') || s.includes('maçon') || s.includes('macon') || s.includes('rénov') || s.includes('renov') || s.includes('isolation') || s.includes('terrassement') || s.includes('menuisier') || s.includes('charpentier') || s.includes('serrurier') || s.includes('vitrerie') || s.includes('démol') || s.includes('demol')) return SECTOR_ULTIMATE_TEMPLATES.electricien;
  if (s.includes('transport') || s.includes('livraison') || s.includes('logistique') || s.includes('déménage') || s.includes('demenage') || s.includes('taxi') || s.includes('vTC') || s.includes('vtc') || s.includes('chauffeur')) return SECTOR_ULTIMATE_TEMPLATES.garage;
  if (s.includes('immobili') || s.includes('agent immo') || s.includes('propriété') || s.includes('propriete') || s.includes('syndic')) return SECTOR_ULTIMATE_TEMPLATES.default;
  if (s.includes('photo') || s.includes('vidéo') || s.includes('video') || s.includes('mariage') || s.includes('traiteur') || s.includes('fleuriste') || s.includes('fleur')) return SECTOR_ULTIMATE_TEMPLATES.restaurant;
  return SECTOR_ULTIMATE_TEMPLATES.default;
}

// getProcessSteps, getPrivacyContent, getGalleryDesc, getLogoInfo, capitalizeCity,
// isEnglishText, detectLanguage, UI, getGuarantees, getHeroBadge — all imported from './template/helpers' and './template/ui'

function computeAccentOnDark(accent: string): string {
  const hexToRgb = (hex: string): [number, number, number] => {
    const h = (hex || '').replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return [r, g, b];
  };
  const luminance = (r: number, g: number, b: number) => {
    const f = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const contrastRatio = (l1: number, l2: number) =>
    (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  const lightenHex = (hex: string, factor: number) => {
    const [r, g, b] = hexToRgb(hex);
    return `rgb(${Math.min(255, Math.round(r + (255 - r) * factor))}, ${Math.min(255, Math.round(g + (255 - g) * factor))}, ${Math.min(255, Math.round(b + (255 - b) * factor))})`;
  };
  const rawAccent = accent || '#6366f1';
  const darkBg = '#1a2744';
  const darkRgbArr = hexToRgb(darkBg);
  const darkLum = luminance(darkRgbArr[0], darkRgbArr[1], darkRgbArr[2]);
  const accentRgbArr = hexToRgb(rawAccent);
  const accentLum = luminance(accentRgbArr[0], accentRgbArr[1], accentRgbArr[2]);
  if (contrastRatio(accentLum, darkLum) < 3.0) {
    let factor = 0.1;
    const lightenLum = (h: string, f: number) => {
      const a = hexToRgb(h);
      return luminance(a[0], a[1], a[2]);
    };
    while (contrastRatio(lightenLum(rawAccent, factor), darkLum) < 4.5 && factor < 0.85) {
      factor += 0.05;
    }
    return lightenHex(rawAccent, factor);
  }
  return rawAccent;
}

export function generateUltimateSite(lead: any, aiContent?: any): string {
  const template = getUltimateTemplate(lead.sector);
  const companyName = lead.name || 'Entreprise Premium';
  const city = capitalizeCity(lead.city || '');
  const phone = lead.phone || '+33 6 12 34 56 78';
  const email = lead.email || 'contact@entreprise.fr';
  const address = lead.address || (city ? `Centre Ville, ${city}` : 'France');
  const rating = lead.googleRating || 5;
  const reviews = lead.googleReviews || 42;
  const hasRealRating = typeof lead.googleRating === 'number';
  const hasRealReviews = typeof lead.googleReviews === 'number';
  const description = cleanText(generateAboutText(aiContent?.aboutText || lead.description || template.aboutText, lead));
  const heroTitle = aiContent?.heroTitle || template.heroTitle;
  const heroSubtitle = cleanText(aiContent?.heroSubtitle || `${template.heroSubtitle}${city ? ' à ' + city : ''}`);
  let ctaText = cleanText(aiContent?.cta || template.ctaText || 'Demander un devis');
  if (ctaText.length > 50) ctaText = ctaText.substring(0, 47) + '...';

  let finalServices = template.services;
  if (aiContent?.services && Array.isArray(aiContent.services) && aiContent.services.length > 0) {
    finalServices = aiContent.services.map((s: any, idx: number) => {
      let features = s.features;
      if (!features || features.length === 0) features = generateFeaturesFromService(s.name, s.description, lead.sector);
      return { name: s.name || `Service ${idx + 1}`, description: s.description || '', features: features.slice(0, 3) };
    });
  }

  let testimonials = (lead.googleReviewsData || [])
    .filter((review: any) => {
      if (!review.text || review.text.trim().length < 25) return false;
      if (isEnglishText(review.text)) return false;
      const text = review.text.trim().toLowerCase();
      const spamIndicators = ['http', 'www.', '@', 'click here', 'buy now', 'free money'];
      if (spamIndicators.some(ind => text.includes(ind))) return false;
      return true;
    })
    .map((review: any) => ({
      author: review.author || 'Client',
      text: review.text.trim().length > 200 ? review.text.trim().substring(0, 197) + '...' : review.text.trim(),
      rating: Math.min(5, Math.max(1, review.rating || 5)),
      date: review.date || 'Récemment'
    }));
  const seenTexts = new Set<string>();
  testimonials = testimonials.filter((t: any) => {
    const normalized = t.text.toLowerCase().substring(0, 50);
    if (seenTexts.has(normalized)) return false;
    seenTexts.add(normalized);
    return true;
  });
  testimonials = testimonials.slice(0, 6);

  const computeHash = (str: string): number => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  };
  const nameHash = computeHash(companyName);
  const cityHash = computeHash(city || 'france');
  const sectorHash = computeHash(lead.sector || 'default');
  const phoneHash = computeHash(phone || '0');
  const emailHash = computeHash(email || 'x');
  const combinedHash = (nameHash * 7 + cityHash * 13 + sectorHash * 23 + phoneHash * 31 + emailHash * 37) % 100000;
  
  const sloganVariations = ["L'excellence à votre service", "L'art de la perfection au quotidien", "Solutions premium sur-mesure", "Excellence & Passion", "Votre partenaire de confiance"];
  const finalSlogan = cleanText(aiContent?.slogan || sloganVariations[combinedHash % sloganVariations.length]);

  // IMAGES — lead's own scraped images (sync version, no Pexels API)
  const leadImages = [
    ...(lead.images || []),
    ...(lead.websiteImages || []),
    ...(lead.logo ? [lead.logo] : []),
  ].filter((img: string) => img && typeof img === 'string' && img.startsWith('http'));

  const heroImage = leadImages.length > 0
    ? leadImages[((combinedHash * 2654435761) >>> 0) % leadImages.length]
    : '';
  const combinedImages = leadImages.slice(0, 2);
  const allImages = leadImages.slice(0, 5);

  const serviceImages: string[] = finalServices.map((_: any, i: number) =>
    leadImages[i % leadImages.length] || heroImage
  );

  const galleryImages = leadImages.slice(0, 5);

  const socialLinks = lead.socialLinks || {};
  const accentOnDark = computeAccentOnDark(template.accent);
  const content: UltimateContent = {
    companyName, sector: lead.sector || 'Professionnel', city, description, phone, email, address,
    website: lead.website || '', rating, reviews, googleRating: lead.googleRating, googleReviews: lead.googleReviews, services: finalServices, serviceImages, galleryImages, testimonials,
    heroTitle, heroSubtitle, aboutText: description, ctaText, slogan: finalSlogan, heroImage, allImages,
    socialLinks, accentOnDark, hours: lead.hours || lead.serperHours || '', establishedYear: lead.establishedYear,
    footerDesc: lead.footerDesc || '', hasRealRating, hasRealReviews
  };

  const layoutVariant = combinedHash % 4;
  return buildUltimateHTML(content, template, combinedImages, layoutVariant);
}

export async function generateUltimateSiteAsync(lead: any, aiContent?: any, pexelsKey?: string): Promise<string> {
  const lang = detectLanguage(lead);
  const template = getUltimateTemplate(lead.sector);
  // Alimente la clé Pexels globale du module pour que fetchSectorImagesFromAPI
  // (requêtes anglaises pertinentes) fonctionne avec la clé fournie.
  setPexelsApiKey(pexelsKey || getPexelsApiKey());
  const companyName = lead.name || (lang === 'en' ? 'Premium Business' : 'Entreprise Premium');
  const city = capitalizeCity(lead.city || '');
  const phone = lead.phone || (lang === 'en' ? '+1 (555) 000-0000' : '+33 6 12 34 56 78');
  const email = lead.email || (lang === 'en' ? 'contact@business.com' : 'contact@entreprise.fr');
  const address = lead.address || (city ? (lang === 'en' ? `Downtown, ${city}` : `Centre Ville, ${city}`) : (lang === 'en' ? 'USA' : 'France'));
  const rating = lead.googleRating || 5;
  const reviews = lead.googleReviews || 42;
  const hasRealRating = typeof lead.googleRating === 'number';
  const hasRealReviews = typeof lead.googleReviews === 'number';
  const description = cleanText(generateAboutText(aiContent?.aboutText || lead.description || (lang === 'en' ? template.aboutTextEn : template.aboutText), lead));
  const heroTitle = aiContent?.heroTitle || (lang === 'en' ? template.heroTitleEn : template.heroTitle);
  const heroSubtitle = cleanText(aiContent?.heroSubtitle || `${lang === 'en' ? template.heroSubtitleEn : template.heroSubtitle}${city ? (lang === 'en' ? ' in ' : ' à ') + city : ''}`);
  let ctaText = cleanText(aiContent?.cta || (lang === 'en' ? template.ctaTextEn : template.ctaText) || (lang === 'en' ? 'Contact Us' : 'Contactez-nous'));
  if (ctaText.length > 50) ctaText = ctaText.substring(0, 47) + '...';

  const computeHash = (str: string): number => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  };
  const nameHash = computeHash(companyName);
  const cityHash = computeHash(city || 'france');
  const sectorHash = computeHash(lead.sector || 'default');
  const phoneHash = computeHash(phone || '0');
  const emailHash = computeHash(email || 'x');
  const combinedHash = (nameHash * 7 + cityHash * 13 + sectorHash * 23 + phoneHash * 31 + emailHash * 37) % 100000;

  const sloganVariationsFr = ["L'excellence à votre service", "L'art de la perfection au quotidien", "Solutions premium sur-mesure", "Excellence & Passion", "Votre partenaire de confiance"];
  const sloganVariationsEn = ["Excellence at your service", "The art of everyday perfection", "Premium tailored solutions", "Excellence & Passion", "Your trusted partner"];
  const finalSlogan = cleanText(aiContent?.slogan || (lang === 'en' ? sloganVariationsEn[combinedHash % sloganVariationsEn.length] : sloganVariationsFr[combinedHash % sloganVariationsFr.length]));

  const sectorImages = await getSectorImagesAsync(lead.sector, combinedHash);

  const accentOnDark = computeAccentOnDark(template.accent);

  // IMAGES — séparation stricte : Pexels (stock) vs scrapées (Google Maps)
  // pexelsImages = pool anglais pertinent (API Pexels EN via fetchSectorImagesFromAPI,
  // sinon fallback Unsplash sectoriel inclus par getSectorImagesAsync). Aucune requête
  // en français : les images correspondent donc au secteur ET aux services du prospect.
  const pexelsImages: string[] = sectorImages;

  // Images scrapées du lead (Google Maps) — contiennent souvent des logos
  const scrapedImages = [
    ...(lead.images || []),
    ...(lead.websiteImages || []),
  ].filter(img => img && typeof img === 'string' && img.startsWith('http'));

  // Filtrer les logos parmi les images scrapées (garder pour galerie seulement)
  const isLikelyLogo = (url: string): boolean => {
    const low = url.toLowerCase();
    // Google Maps profile photos are usually square/cropped logos
    if (low.includes('lh3.googleusercontent.com') && (low.includes('s120') || low.includes('s64') || low.includes('w120') || low.includes('w64'))) return true;
    // Common logo patterns
    if (low.includes('/logo') || low.includes('favicon') || low.includes('icon')) return true;
    return false;
  };
  const realPhotos = scrapedImages.filter(img => !isLikelyLogo(img));
  const allScraped = scrapedImages;

  // Hero : TOUJOURS Pexels (jamais logo scrapé)
  const heroImage = pexelsImages.length > 0
    ? pexelsImages[((combinedHash * 2654435761) >>> 0) % pexelsImages.length]
    : (sectorImages[0] || '');

  // allImages : Pexels pour hero/about/approach
  const allImages = pexelsImages.length > 0 ? pexelsImages.slice(0, 6) : sectorImages.slice(0, 6);

  let finalServices = (lang === 'en' ? template.servicesEn : undefined) || template.services;
  if (aiContent?.services && Array.isArray(aiContent.services) && aiContent.services.length > 0) {
    finalServices = aiContent.services.map((s: any, idx: number) => {
      let features = s.features;
      if (!features || features.length === 0) features = generateFeaturesFromService(s.name, s.description, lead.sector);
      return { name: s.name || `Service ${idx + 1}`, description: s.description || '', features: features.slice(0, 3) };
    });
  }

  let testimonials = (lead.googleReviewsData || [])
    .filter((review: any) => {
      if (!review.text || review.text.trim().length < 25) return false;
      if (lang === 'fr' && isEnglishText(review.text)) return false;
      if (lang === 'en' && !isEnglishText(review.text)) return false;
      const text = review.text.trim().toLowerCase();
      const spamIndicators = ['http', 'www.', '@', 'click here', 'buy now', 'free money'];
      if (spamIndicators.some(ind => text.includes(ind))) return false;
      return true;
    })
    .map((review: any) => ({
      author: review.author || (lang === 'en' ? 'Client' : 'Client'),
      text: review.text.trim().length > 200 ? review.text.trim().substring(0, 197) + '...' : review.text.trim(),
      rating: Math.min(5, Math.max(1, review.rating || 5)),
      date: review.date || (lang === 'en' ? 'Recently' : 'Récemment')
    }));
  const seenTextsAsync = new Set<string>();
  testimonials = testimonials.filter((t: any) => {
    const normalized = t.text.toLowerCase().substring(0, 50);
    if (seenTextsAsync.has(normalized)) return false;
    seenTextsAsync.add(normalized);
    return true;
  });
  testimonials = testimonials.slice(0, 6);

  // Service images : TOUJOURS Pexels (images pro, sans texte/logo)
  const serviceImages: string[] = finalServices.map((s, i) =>
    pexelsImages[i % pexelsImages.length] || heroImage || (sectorImages[i % (sectorImages.length || 1)])
  );

  // Gallery : images scrapées du lead (photos du vrai business, pas les logos)
  const galleryImages = realPhotos.length > 0
    ? realPhotos.slice(0, 5)
    : pexelsImages.length > 0
      ? pexelsImages.slice(0, 5)
      : allScraped.slice(0, 5);

  // Dériver les liens sociaux de façon fiable.
  // lead.socialLinks n'est pas toujours peuplé (absent du type Lead), donc on
  // reconstruit depuis lead.website quand il pointe vers une plateforme connue.
  const deriveSocialLinks = (website?: string): Record<string, string> => {
    const links: Record<string, string> = {};
    const w = (website || '').toLowerCase();
    if (w.includes('facebook.com') || w.includes('fb.me')) links.facebook = website!;
    else if (w.includes('instagram.com')) links.instagram = website!;
    else if (w.includes('linkedin.com')) links.linkedin = website!;
    else if (w.includes('x.com') || w.includes('twitter.com')) links.twitter = website!;
    else if (w.includes('youtube.com') || w.includes('youtu.be')) links.youtube = website!;
    else if (w.includes('tiktok.com')) links.tiktok = website!;
    return links;
  };
  const socialLinks = { ...deriveSocialLinks(lead.website), ...(lead.socialLinks || {}) };
  const content: UltimateContent = {
    companyName, sector: lead.sector || (lang === 'en' ? 'Professional' : 'Professionnel'), city, description, lang, phone, email, address,
    website: lead.website || '', rating, reviews, googleRating: lead.googleRating, googleReviews: lead.googleReviews, services: finalServices, serviceImages, galleryImages, realPhotos, testimonials,
    heroTitle, heroSubtitle, aboutText: description, ctaText, slogan: finalSlogan, heroImage, allImages,
    socialLinks, accentOnDark, hours: lead.hours || lead.serperHours || '', establishedYear: lead.establishedYear,
    footerDesc: lead.footerDesc || '', hasRealRating, hasRealReviews
  };

  return buildUltimateHTML(content, template, allImages, combinedHash % 4);
}

function buildUltimateHTML(content: UltimateContent, template: any, combinedImages: string[] = [], layoutVariant: number = 0): string {
  const { companyName, heroTitle, heroSubtitle, aboutText, services, serviceImages, galleryImages, realPhotos, testimonials, phone, email, address, website, city, ctaText, rating, reviews, slogan, heroImage, allImages, galleryTitle, aboutTitle, servicesTitle, accentOnDark, hours: leadHours, establishedYear, footerDesc, hasRealRating, hasRealReviews } = content;
  const lang = content.lang || 'fr';
  const ui = UI[lang];
  const sector = content.sector || '';
  const sectorCfg = getSectorConfig(sector);
  const primaryColor = template.primary;
  const secondaryColor = template.secondary;
  const accentColor = template.accent;
  const hexToRgb = (hex: string) => { let r = 0, g = 0, b = 0; if (hex.length === 7) { r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16); } return `${r}, ${g}, ${b}`; };
  const primaryRgb = hexToRgb(primaryColor);
const accentRgb = hexToRgb(accentColor);
const secondaryRgb = hexToRgb(secondaryColor);

  const computeHash = (str: string): number => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  };
  const nameHash = computeHash(companyName);
  const cityHash = computeHash(city || 'france');
  const sectorHash = computeHash(content.sector || 'default');
  const combinedHash = (nameHash * 7 + cityHash * 13 + sectorHash * 23) % 10000;

  const logoInfo = getLogoInfo(companyName, content.sector);

  // Proxy images through wsrv.nl to fix Mixed Content (HTTP→HTTPS) and CORS
  const proxiedImg = (url: string): string => {
    if (!url || !url.startsWith('http')) return url;
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=1200&q=80&output=webp&default=1`;
  };
  const heroBadge = getHeroBadge(content.sector);
  const cleanPhoneLink = phone ? phone.replace(/[^0-9+]/g, '') : '';
  const mapQuery = encodeURIComponent(address || '');

  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${primaryColor}"/><text x="50%" y="50%" font-family="sans-serif" font-size="45" font-weight="bold" fill="white" dominant-baseline="central" text-anchor="middle">${logoInfo.initials}</text></svg>`;
  const faviconDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(faviconSvg)}`;

  const companyHash = (() => { let h = 0; for (let i = 0; i < companyName.length; i++) { h = ((h << 5) - h) + companyName.charCodeAt(i); h |= 0; } return Math.abs(h); })();
  const emergencyFallback = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80';
  const allImgs = content.allImages || [];
  const usedImages = new Set<string>();
  
  const heroSectorFallback = allImgs.length > 0 ? allImgs : [emergencyFallback];
  const heroImgErr = `onerror="this.onerror=null;this.src='${proxiedImg(heroSectorFallback[(companyHash + 1) % heroSectorFallback.length])}';this.style.opacity='0.7'"`;
  
  const getImg = (slot: number): string => {
    const candidates = [...combinedImages, ...allImgs].filter(img => img && img.startsWith('https://') && !usedImages.has(img));
    if (candidates.length > 0) {
      const selected = candidates[(companyHash + slot) % candidates.length];
      usedImages.add(selected);
      return selected;
    }
    // Fallback to available images
    const fallbackPool = allImgs.filter(img => img && img.startsWith('https://'));
    if (fallbackPool.length > 0) return fallbackPool[slot % fallbackPool.length];
    return emergencyFallback;
  };
  const imgErr = (fallbackSlot: number) => `onerror="this.onerror=null;this.src='${proxiedImg(getImg(fallbackSlot))}';this.style.opacity='0.8'"`;

  const fontPair = combinedHash % 4;
  const headingFont = fontPair === 0 ? "'DM Sans'" : fontPair === 1 ? "'Plus Jakarta Sans'" : fontPair === 2 ? "'Playfair Display'" : "'Cormorant Garamond'";

  const leadVariant = combinedHash % 5;
  const decoRotation = (combinedHash * 7) % 360;
  const decoScale = 0.8 + ((combinedHash * 3) % 40) / 100;
  const accentOpacity = 0.04 + ((combinedHash * 11) % 6) / 100;
  const sectionShape = combinedHash % 3;

  function buildHero(content: UltimateContent, template: any, lang: 'fr' | 'en'): string {
    return `    <section class="hero" id="hero">
        <img src="${proxiedImg(heroImage)}" ${heroImgErr} alt="${companyName}" class="hero-bg">
        <div class="hero-mesh"></div>
        <div class="hero-overlay"></div>
        <div class="hero-inner">
            <div>
                <div class="hero-badge"><i data-lucide="${heroBadge.icon}" width="14"></i> ${heroBadge.text}</div>
                <h1>${heroTitle.replace(/\b(\w+)/g, (m: string, w: string, i: number) => i === 0 || i === 2 ? `<em>${w}</em>` : w)}</h1>
                <p class="hero-sub">${heroSubtitle}</p>
                <div class="hero-actions">
                    <a href="#contact" class="btn-pri">${ctaText} <i data-lucide="arrow-right" width="18"></i></a>
                    ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-sec"><i data-lucide="phone" width="18"></i> ${ui.heroCall}</a>` : ''}
                </div>
                <div style="display:flex;gap:24px;flex-wrap:wrap">
                    ${hasRealRating && rating ? `<div class="hero-rating"><div class="hero-stars">${Array(Math.round(rating)).fill('<i data-lucide="star" fill="currentColor" width="16"></i>').join('')}</div><span class="hero-rating-text">${rating}/5 — ${reviews} ${ui.testGoogle}</span></div>` : ''}
                </div>
            </div>
            <div class="hero-card">
                <div class="hero-card-title">${ui.heroHours}</div>
                <div class="hero-hours">
                    ${leadHours ? `
                    <div class="hero-hours-row"><span class="hero-hours-day">${leadHours}</span></div>
                    ` : `
                    <div class="hero-hours-row"><span class="hero-hours-day">${ui.monLunVen}</span><span class="hero-hours-time">${sectorCfg.defaultHours.weekdays}</span></div>
                    <div class="hero-hours-row"><span class="hero-hours-day">${ui.monSam}</span><span class="hero-hours-time">${sectorCfg.defaultHours.saturday}</span></div>
                    <div class="hero-hours-row"><span class="hero-hours-day">${ui.monDim}</span><span class="hero-hours-time" style="color:var(--accent-dark)">${sectorCfg.defaultHours.sunday}</span></div>
                    `}
                </div>
                ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-pri"><i data-lucide="phone" width="16"></i> ${phone}</a>` : ''}
                <div class="hero-card-note">${ui.heroNote}</div>
            </div>
        </div>
    </section>`;
  }

  function buildServices(content: UltimateContent, lang: 'fr' | 'en', serviceDescs: any[], serviceList?: any[]): string {
    const list = serviceList || services;
    return `    <section class="section" id="services">
        <div class="container" style="position:relative">
            <div class="section-deco deco-circle" style="width:200px;height:200px;top:-60px;right:${leadVariant % 2 === 0 ? '-80px' : 'auto'};left:${leadVariant % 2 !== 0 ? '-80px' : 'auto'};animation-delay:${leadVariant}s"></div>
            ${leadVariant % 2 === 0 ? '<div class="section-deco deco-line" style="width:180px;top:40%;left:-40px;animation-delay:2s"></div>' : ''}
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowServices}</span>
                <h2>${sectorCfg.ui.svcTitle[lang]}</h2>
                ${heroSubtitle.startsWith(sectorCfg.ui.svcDesc[lang]) ? '' : `<p>${sectorCfg.ui.svcDesc[lang]}</p>`}
            </div>
            <div class="svc-grid">
                ${list.map((s, i) => {
                  const iconName = sectorCfg.serviceIcons[i % sectorCfg.serviceIcons.length] || 'check-circle';
                return `
                <div class="svc-card reveal reveal-d${(i % 3) + 1}">
                    <img src="${proxiedImg(serviceImages[i] || heroImage)}" class="svc-card-img" alt="${s.name} à ${city}" loading="lazy">
                    <div class="svc-card-body">
                        <div class="svc-icon"><i data-lucide="${iconName}" width="22" height="22"></i></div>
                        <h3>${s.name}</h3>
                        <p>${serviceDescs[i]?.desc || s.description}</p>
                        <a href="#contact" class="svc-link">${ui.svcLink} <i data-lucide="arrow-right" width="14"></i></a>
                    </div>
                </div>`}).join('')}
            </div>
        </div>
    </section>`;
  }

  function buildWhyUs(content: UltimateContent, whyItems: any[]): string {
    return `    <section class="section" id="pourquoi">
        <div class="container" style="position:relative">
            ${leadVariant % 2 === 0 ? '<div class="section-deco deco-line" style="width:200px;bottom:20%;right:-60px;animation-delay:3s"></div>' : ''}
            <div class="section-deco deco-dot" style="top:10%;${leadVariant % 2 === 0 ? 'left:5%' : 'right:5%'};animation-delay:${leadVariant}s"></div>
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowGuarantees}</span>
                <h2>${lang === 'en' ? 'Why Choose Us' : 'Pourquoi nous choisir'}</h2>
                <p>${lang === 'en' ? 'The concrete reasons our clients trust us, sector after sector.' : 'Les raisons concrètes pour lesquelles nos clients nous confient leurs projets, dans votre secteur comme les autres.'}</p>
            </div>
            <div class="guar-grid reveal">
                ${whyItems.map((w: any, i: number) => `
                <div class="guar-card reveal-d${Math.min(i, 3)}">
                    <div class="guar-icon"><i data-lucide="check-circle" width="24" height="24"></i></div>
                    <h3>${w.title}</h3>
                    <p class="guar-desc">${w.desc}</p>
                </div>`).join('')}
            </div>
            ${buildGallery(content)}
        </div>
    </section>`;
  }

  function buildGallery(content: UltimateContent): string {
    const imgs = (content.galleryImages || []).filter(Boolean);
    if (imgs.length > 0) {
      const grid = imgs.slice(0, 5).map((src, i) => `<div class="gal-item${i === 0 ? ' gal-main' : ''}"><img src="${proxiedImg(src)}" ${imgErr(i + 1)} alt="${companyName}" loading="lazy"></div>`).join('');
      return `<div class="gal-grid reveal" style="margin-top:44px">${grid}</div>`;
    }
    const fallback = [content.heroImage, ...(content.serviceImages || [])].filter(Boolean).slice(0, 5);
    if (fallback.length > 0) {
      const grid = fallback.map((src, i) => `<div class="gal-item${i === 0 ? ' gal-main' : ''}"><img src="${proxiedImg(src)}" ${imgErr(i + 1)} alt="${companyName}" loading="lazy"></div>`).join('');
      return `<div class="gal-grid reveal" style="margin-top:44px">${grid}</div>`;
    }
    return '';
  }

  function buildTrust(content: UltimateContent, lang: 'fr' | 'en'): string {
    const rating = content.googleRating;
    const reviews = content.googleReviews;
    if (rating && reviews) {
      const stars = '★★★★★'.slice(0, Math.round(rating)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(rating));
      const meta = lang === 'fr' ? `Basé sur ${reviews} avis vérifiés Google` : `Based on ${reviews} verified Google reviews`;
      return `    <section class="section trust" id="confiance">
        <div class="container">
            <div class="trust-card reveal">
                <div class="trust-score">${stars} <strong>${rating}/5</strong></div>
                <p class="trust-meta">${meta}</p>
                <div class="trust-strip">${['Devis gratuit', 'Réponse rapide', 'Garantie satisfaction'].map(b => `<span class="trust-badge"><i data-lucide="check-circle"></i> ${b}</span>`).join('')}</div>
            </div>
        </div>
    </section>`;
    }
    const badges = getTrustBadges(lang);
    const heading = lang === 'fr' ? 'Ils nous font confiance' : 'Trusted by our clients';
    return `    <section class="section trust" id="confiance">
        <div class="container">
            <div class="trust-card reveal">
                <h2>${heading}</h2>
                <div class="trust-strip">${badges.map(b => `<span class="trust-badge"><i data-lucide="check-circle"></i> ${b}</span>`).join('')}</div>
            </div>
        </div>
    </section>`;
  }

  function buildContact(content: UltimateContent, lang: 'fr' | 'en'): string {
    return `    <section class="section" id="contact">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowContact}</span>
                <h2>${ui.contactTitle}</h2>
                <p>${ui.contactDesc}</p>
            </div>
            <div class="contact-wrap reveal">
                <div class="contact-form">
                    <h3>${sectorCfg.ui.contactTitle[lang]}</h3>
                    <p>${ui.formDesc}</p>
                    <form action="javascript:void(0)" onsubmit="event.preventDefault();this.querySelector('.form-submit').textContent='${lang === 'en' ? 'Message sent ✓' : 'Message envoyé ✓'}';this.querySelector('.form-submit').style.background='#16a34a'">
                        ${sectorCfg.formFields.map(field => {
                          if (field.type === 'textarea') {
                            return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><textarea class="form-control" name="${field.name}" rows="4" placeholder="${field.placeholder[lang]}" ${field.required ? 'required' : ''}></textarea></div>`;
                          }
                          if (field.type === 'select' && field.options) {
                            return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><select class="form-control" name="${field.name}" ${field.required ? 'required' : ''}><option value="">${field.placeholder[lang]}</option>${field.options.map(opt => `<option value="${opt.fr}">${opt[lang]}</option>`).join('')}</select></div>`;
                          }
                          return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><input type="${field.type}" class="form-control" name="${field.name}" placeholder="${field.placeholder[lang]}" ${field.required ? 'required' : ''}></div>`;
                        }).join('')}
                        <div class="form-check">
                            <input type="checkbox" id="consent" name="consent" required>
                            <label for="consent">${ui.formConsent}<a href="#" onclick="event.preventDefault();document.getElementById('privacy-modal').classList.add('open')">${ui.privacyLink}</a>.</label>
                        </div>
                        <button type="submit" class="form-submit"><i data-lucide="send" width="16"></i> ${ui.formSubmit}</button>
                        <p class="form-note">${ui.formNote}</p>
                    </form>
                </div>
                <div class="contact-sidebar">
                    <div class="contact-hours">
                        <h4><i data-lucide="clock" width="16" style="color:var(--primary)"></i> ${ui.hoursTitle}</h4>
                        ${leadHours ? `
                        <div class="hours-row"><span class="hours-day">${leadHours}</span></div>
                        ` : `
                        <div class="hours-row"><span class="hours-day">${ui.hoursLunVen}</span><span class="hours-time">${sectorCfg.defaultHours.weekdays}</span></div>
                        <div class="hours-row"><span class="hours-day">${ui.hoursSam}</span><span class="hours-time">${sectorCfg.defaultHours.saturday}</span></div>
                        <div class="hours-row"><span class="hours-day">${ui.hoursDim}</span><span class="hours-time" style="color:var(--accent)">${sectorCfg.defaultHours.sunday}</span></div>
                        `}
                    </div>
                    <div class="contact-card">
                        <div class="contact-card-item"><i data-lucide="phone" width="16"></i> ${phone ? `<a href="tel:${cleanPhoneLink}">${phone}</a>` : 'Non renseigné'}</div>
                        <div class="contact-card-item"><i data-lucide="mail" width="16"></i> ${email ? `<a href="mailto:${email}">${email}</a>` : 'Non renseigné'}</div>
                        <div class="contact-card-item"><i data-lucide="map-pin" width="16"></i> ${address}</div>
                        ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-pri" style="margin-top:16px;width:100%;justify-content:center"><i data-lucide="phone" width="16"></i> ${ui.contactCall}</a>` : ''}
                    </div>
                </div>
            </div>
            <div class="contact-map reveal" style="margin-top:32px">
                <iframe src="https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
        </div>
    </section>`;
  }

  function buildBespoke(content: UltimateContent, pack: SectorCopy, lang: 'fr' | 'en'): string {
    const kind = pack.bespoke;
    if (!kind) return '';
    const t = (fr: string, en: string) => (lang === 'en' ? en : fr);

    if (kind === 'restaurant') {
      const specialties = (pack.services || []).slice(0, 4).map(s => `
                <div class="spec-item"><i data-lucide="utensils" width="16"></i><div><strong>${s.name}</strong><br><span class="spec-desc">${s.desc}</span></div></div>`).join('');
      const reservation = (pack.trustBadges || []).find(b => /réservation|reserva|book/i.test(b));
      const hoursBlock = content.hours
        ? `<div class="bespoke-hours">${content.hours}</div>`
        : (reservation ? `<div class="bespoke-note"><i data-lucide="calendar-check" width="16"></i> ${reservation}</div>` : '');
      return `    <section class="section" id="carte-horaires">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowServices}</span>
                <h2>${t('Carte & Horaires', 'Menu & Hours')}</h2>
                <p>${t('Une cuisine préparée sur place, à découvrir sur notre carte.', 'House-made dishes, discover our menu.')}</p>
            </div>
            <div class="bespoke-grid reveal">
                <div class="bespoke-card">
                    <h3>${t('Nos spécialités', 'Our specialties')}</h3>
                    ${specialties}
                </div>
                <div class="bespoke-card">
                    <h3>${t('Horaires', 'Hours')}</h3>
                    ${hoursBlock}
                </div>
            </div>
        </div>
    </section>`;
    }

    if (kind === 'coach') {
      const get = (name: string) => (pack.services || []).find(s => s.name.toLowerCase().includes(name.toLowerCase()));
      const programs = [
        { label: t('Personnalisé', 'Personal'), svc: get('Coaching') },
        { label: t('Collectif', 'Group'), svc: get('Collectif') },
        { label: t('Préparation', 'Preparation'), svc: get('Préparation') },
      ];
      const cols = programs.map(p => `
                <div class="bespoke-prog reveal">
                    <div class="bespoke-prog-icon"><i data-lucide="dumbbell" width="22"></i></div>
                    <h3>${p.label}</h3>
                    <p>${p.svc ? p.svc.desc : (lang === 'en' ? 'A session adapted to your goals.' : 'Une séance adaptée à vos objectifs.')}</p>
                </div>`).join('');
      return `    <section class="section" id="programmes">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowServices}</span>
                <h2>${t('Nos Programmes', 'Our Programs')}</h2>
                <p>${t('Des formules pour chaque objectif, encadrées par des coachs diplômés.', 'Formats for every goal, led by certified coaches.')}</p>
            </div>
            <div class="bespoke-progs reveal">${cols}</div>
        </div>
    </section>`;
    }

    if (kind === 'medical') {
      const cares = (pack.services || []).map((s, i) => `
                <div class="bespoke-care reveal reveal-d${(i % 3) + 1}">
                    <h3>${s.name}</h3>
                    <p>${s.desc}</p>
                </div>`).join('');
      return `    <section class="section section-alt" id="soins">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowServices}</span>
                <h2>${t('Nos Soins', 'Our Care')}</h2>
                <p>${t('Des prises en charge adaptées, réalisées par des professionnels de santé.', 'Tailored care delivered by health professionals.')}</p>
            </div>
            <div class="bespoke-cares reveal">${cares}</div>
        </div>
    </section>`;
    }

    if (kind === 'artisan') {
      const creds = [t('RGE', 'RGE'), t('Assurance décennale', '10-Year Warranty'), t('Devis gratuit', 'Free quote'), t('Garantie satisfaction', 'Satisfaction guarantee')];
      const badges = creds.map(c => `<span class="trust-badge"><i data-lucide="badge-check" width="16"></i> ${c}</span>`).join('');
      return `    <section class="section" id="certifications">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowGuarantees}</span>
                <h2>${t('Certifications & Garanties', 'Certifications & Guarantees')}</h2>
                <p>${t('Les garanties qui encadrent chaque intervention.', 'The guarantees that back every job.')}</p>
            </div>
            <div class="trust-strip reveal">${badges}</div>
        </div>
    </section>`;
    }

    const stepsBlock = (
      id: string,
      title: string,
      sub: string,
      steps: { icon: string; label: string; desc: string }[],
    ) => `
    <section class="section" id="${id}">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowServices}</span>
                <h2>${title}</h2>
                <p>${sub}</p>
            </div>
            <div class="bespoke-progs reveal">${steps.map(s => `
                <div class="bespoke-prog reveal">
                    <div class="bespoke-prog-icon"><i data-lucide="${s.icon}" width="22"></i></div>
                    <h3>${s.label}</h3>
                    <p>${s.desc}</p>
                </div>`).join('')}</div>
        </div>
    </section>`;

    if (kind === 'coiffeur') {
      return stepsBlock('rituel',
        t('Notre Rituel', 'Our Ritual'),
        t('Un accompagnement sur mesure, du conseil à la finition.', 'Tailored care, from consultation to the finishing touch.'),
        [
          { icon: 'message-circle', label: t('Consultation', 'Consultation'), desc: t('Échange sur votre style, votre morphologie et vos envies.', 'We discuss your style, face shape and wishes.') },
          { icon: 'scissors', label: t('Coupe & Styling', 'Cut & Styling'), desc: t('Une coupe précise et un brushing travaillé pour un rendu naturel.', 'A precise cut and a polished blow-dry for a natural result.') },
          { icon: 'sparkles', label: t('Soin & Couleur', 'Care & Color'), desc: t('Colorations, balayage et soins réalisés avec des produits professionnels.', 'Color, balayage and treatments with professional products.') },
        ]);
    }

    if (kind === 'avocat') {
      return stepsBlock('dossier',
        t('Votre dossier, en toute sérénité', 'Your case, with peace of mind'),
        t('Un accompagnement juridique clair à chaque étape.', 'Clear legal support at every step.'),
        [
          { icon: 'lock', label: t('Consultation confidentielle', 'Confidential consultation'), desc: t('Un premier échange pour comprendre votre situation et vos objectifs.', 'A first conversation to understand your situation and goals.') },
          { icon: 'search', label: t('Analyse juridique', 'Legal analysis'), desc: t('Étude de vos documents et stratégie adaptée à votre dossier.', 'We review your documents and build a strategy for your case.') },
          { icon: 'scale', label: t('Action & Défense', 'Action & Defense'), desc: t('Rédaction, négociation et représentation dans vos intérêts.', 'Drafting, negotiation and representation in your interest.') },
          { icon: 'folder-check', label: t('Suivi du dossier', 'Case follow-up'), desc: t('Un accompagnement jusqu’à la résolution, sans surprise.', 'Support through to resolution, with no surprises.') },
        ]);
    }

    if (kind === 'nettoyage') {
      return stepsBlock('methode',
        t('Notre méthode', 'Our method'),
        t('Un entretien rigoureux, du diagnostic au contrôle qualité.', 'Rigorous cleaning, from assessment to quality check.'),
        [
          { icon: 'clipboard-list', label: t('Diagnostic', 'Assessment'), desc: t('Évaluation de vos besoins et plan d’intervention personnalisé.', 'We assess your needs and plan a tailored intervention.') },
          { icon: 'sparkle', label: t('Intervention détaillée', 'Detailed cleaning'), desc: t('Nettoyage en profondeur, du sol au plafond, selon vos priorités.', 'Deep cleaning, floor to ceiling, by your priorities.') },
          { icon: 'badge-check', label: t('Contrôle qualité', 'Quality check'), desc: t('Vérification finale et exigence de propreté constante.', 'Final check and consistent cleanliness standards.') },
        ]);
    }

    if (kind === 'jardin') {
      return stepsBlock('savoirfaire',
        t('Notre savoir-faire', 'Our expertise'),
        t('Un espace vert pensé, créé et entretenu par des professionnels.', 'A green space designed, built and maintained by pros.'),
        [
          { icon: 'lightbulb', label: t('Conseil & Conception', 'Advice & Design'), desc: t('Étude de votre terrain et proposition paysagère sur mesure.', 'We study your land and propose a tailored landscape.') },
          { icon: 'trees', label: t('Réalisation', 'Build'), desc: t('Plantation, aménagement et pose d’arrosage automatique.', 'Planting, landscaping and automatic irrigation.') },
          { icon: 'calendar-check', label: t('Entretien régulier', 'Regular care'), desc: t('Taille, tonte et suivi saisonnier pour un jardin toujours parfait.', 'Pruning, mowing and seasonal care for a perfect garden.') },
        ]);
    }

    if (kind === 'garage') {
      return stepsBlock('process',
        t('Notre process', 'Our process'),
        t('Un véhicule pris en charge en toute transparence.', 'Your vehicle handled with full transparency.'),
        [
          { icon: 'wrench', label: t('Diagnostic', 'Diagnosis'), desc: t('Inspection complète et identification précise de la panne.', 'Full inspection and precise fault identification.') },
          { icon: 'file-text', label: t('Devis transparent', 'Transparent quote'), desc: t('Un devis clair validé avant toute intervention.', 'A clear quote agreed before any work.') },
          { icon: 'shield-check', label: t('Intervention & Garantie', 'Service & Warranty'), desc: t('Réparation soignée et garantie sur les pièces et la main-d’œuvre.', 'Careful repair, warranted parts and labor.') },
        ]);
    }

    return '';
  }

  const pack = resolveSectorContent(content.sector, lang);
  const packServiceNames = new Set(pack.services.map(p => p.name.toLowerCase()));
const servicesMatch = (content.services || []).some(s => packServiceNames.has((s.name || '').toLowerCase()));
const displayServices = (!servicesMatch && pack.services.length) ? pack.services.map(p => ({ name: p.name })) : content.services;
const descs = getServiceDescriptions(pack, displayServices, lang);
  const bespokeSection = buildBespoke(content, pack, lang);

  return `<!DOCTYPE html>
<html lang="${ui.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <link rel="icon" type="image/svg+xml" href="${faviconDataUrl}">
    <title>${companyName} - ${content.sector} à ${city}</title>
    <meta name="description" content="${heroSubtitle}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${website || '#'}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${companyName} - ${content.sector}">
    <meta property="og:description" content="${heroSubtitle}">
    <meta property="og:image" content="${heroImage}">
    <meta property="og:image:width" content="1920">
    <meta property="og:image:height" content="1080">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${companyName}">
    <meta name="twitter:description" content="${heroSubtitle}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="alternate" hreflang="${ui.hreflang}" href="${website || '#'}">
    <script type="application/ld+json">${JSON.stringify({ "@context":"https://schema.org", "@type":sectorCfg.schemaOrg, name:companyName, description:heroSubtitle, image:heroImage, telephone:phone, email:email, address:{ "@type":"PostalAddress", streetAddress:address, addressLocality:city, addressCountry:"FR" }, ...(hasRealRating && hasRealReviews && (content.googleRating ?? 0) > 0 && (content.googleReviews ?? 0) > 0 ? { aggregateRating:{ "@type":"AggregateRating", ratingValue:String(content.googleRating ?? 0), reviewCount:String(content.googleReviews ?? 0) } } : {}) })}</script>
    <style>
        :root{--primary:${primaryColor};--primary-rgb:${primaryRgb};--secondary:${secondaryColor};--accent:${accentColor};--accent-dark:${accentOnDark};--accent-rgb:${accentRgb};--secondary-rgb:${secondaryRgb};--bg:#f7f8fb;--surface:#fff;--text:#161a2b;--text-s:#51566e;--text-t:#868aa3;--border:#e6e8f0;--border-l:#f1f2f7;--dark:#16203c;--dark-rgb:22,32,60;--deco-rotation:${decoRotation}deg;--deco-scale:${decoScale};--accent-opacity:${accentOpacity};--section-shape:${sectionShape};--r-sm:10px;--r:16px;--r-lg:24px;--r-xl:32px;--sh-1:0 1px 2px rgba(16,24,40,.04),0 6px 20px rgba(16,24,40,.06);--sh-2:0 8px 24px rgba(16,24,40,.10),0 18px 48px rgba(16,24,40,.10);--sh-glow:0 14px 44px rgba(var(--primary-rgb),.28);--accent-soft:color-mix(in srgb,var(--accent) 9%,#fff);--ease:cubic-bezier(.22,1,.36,1);--dur:220ms;--fs-display:clamp(2.4rem,5vw,4rem);--fs-h2:clamp(1.7rem,3.2vw,2.4rem);--fs-h3:1.15rem;--lh-body:1.7;--section-py:clamp(64px,9vw,120px);--trust-bg:color-mix(in srgb,var(--accent) 6%,#fff);--hairline:color-mix(in srgb,var(--accent) 14%,var(--border));--maxw:1140px}
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth;font-size:16px}
        body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);line-height:1.75;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden}
        img{max-width:100%;height:auto;display:block}
        h1,h2,h3,h4,h5{font-family:${headingFont},'DM Sans',sans-serif;line-height:1.25;font-weight:700;letter-spacing:-0.02em}
        a,button,[role="button"]{cursor:pointer}
        :focus-visible{outline:2px solid var(--primary);outline-offset:3px;border-radius:4px}
        ::selection{background:color-mix(in srgb,var(--accent) 22%,#fff);color:var(--text)}
        .container{max-width:var(--maxw);margin:0 auto;padding:0 24px}
        @media(max-width:768px){.container{padding:0 20px}}

        .navbar{position:sticky;top:0;z-index:80;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);background:color-mix(in srgb,var(--surface) 82%,transparent);border-bottom:1px solid var(--hairline);padding:12px 0;transition:all .4s cubic-bezier(.4,0,.2,1)}
        .navbar.scrolled{background:rgba(255,255,255,.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid var(--border);padding:10px 0;box-shadow:0 2px 30px rgba(0,0,0,.08)}
        .navbar-inner{max-width:1400px;margin:0 auto;padding:0 32px;display:flex;justify-content:space-between;align-items:center}
        .navbar-brand{display:flex;align-items:center;gap:14px;text-decoration:none;color:var(--text);transition:color .3s}
        .navbar:not(.scrolled) .navbar-brand{color:var(--text)}
        .navbar-logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;box-shadow:0 4px 15px rgba(var(--primary-rgb),.3);flex-shrink:0}
        .navbar-name{font-weight:700;font-size:1.05rem;color:var(--text);line-height:1.15;max-width:300px;transition:color .3s}
        .navbar:not(.scrolled) .navbar-name{color:var(--text)}
        .navbar-links{display:flex;align-items:center;gap:32px}
        .navbar-links a{text-decoration:none;color:var(--text-s);font-size:.9rem;font-weight:500;transition:color .25s;position:relative}
        .navbar:not(.scrolled) .navbar-links a{color:var(--text-s)}
        .navbar:not(.scrolled) .navbar-links a:hover{color:var(--primary)}
        .navbar-links a:hover{color:var(--primary)}
        .navbar-cta{display:inline-flex;align-items:center;gap:8px;background:var(--primary);color:#fff!important;padding:11px 24px;border-radius:10px;font-weight:600;font-size:.9rem;transition:all .25s;box-shadow:0 4px 15px rgba(var(--primary-rgb),.25)}
        .navbar-cta:hover{opacity:.92;transform:translateY(-1px);box-shadow:0 6px 20px rgba(var(--primary-rgb),.35)}
        h1{font-size:var(--fs-display);line-height:1.05;letter-spacing:-.02em;font-weight:800}
        h2{font-size:var(--fs-h2);line-height:1.1;letter-spacing:-.02em;font-weight:800}
        .trust-strip{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:28px}
        .trust-badge{display:inline-flex;align-items:center;gap:8px;background:var(--trust-bg);border:1px solid var(--hairline);color:var(--text);padding:10px 16px;border-radius:999px;font-size:.9rem;font-weight:600}
        .trust-badge i{color:var(--accent)}
        .trust-card{background:var(--surface);border:1px solid var(--hairline);border-radius:24px;padding:clamp(32px,5vw,56px);text-align:center;max-width:720px;margin:0 auto;box-shadow:0 10px 40px rgba(var(--primary-rgb),.06)}
        .trust-card h2{margin-bottom:20px}
        .trust-score{display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.6rem;color:var(--accent);letter-spacing:2px}
        .trust-score strong{font-size:1.1rem;color:var(--text);letter-spacing:0}
        .trust-meta{margin:8px 0 0;color:var(--text-s);font-size:.95rem}
        @media(max-width:768px){.trust-strip{gap:8px}}

        /* Sector bespoke blocks (Task 4) */
        .bespoke-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:28px;margin-top:48px}
        .bespoke-card{background:#fff;border:1px solid var(--border);border-radius:var(--r-lg);padding:32px;box-shadow:var(--sh-1)}
        .bespoke-card h3{font-size:1.15rem;margin-bottom:18px}
        .spec-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-l)}
        .spec-item:last-child{border:none}
        .spec-item i{color:var(--accent);flex-shrink:0;margin-top:4px}
        .spec-item strong{font-weight:600}
        .spec-desc{color:var(--text-s);font-size:.9rem;line-height:1.6}
        .bespoke-hours{font-size:.98rem;color:var(--text-s);line-height:1.8;white-space:pre-line}
        .bespoke-note{margin-top:8px;font-size:.92rem;color:var(--text-t);display:flex;align-items:center;gap:8px}
        .bespoke-progs{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px}
        .bespoke-prog{background:#fff;border:1px solid var(--border);border-radius:var(--r-lg);padding:32px;box-shadow:var(--sh-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease)}
        .bespoke-prog:hover{transform:translateY(-4px);box-shadow:var(--sh-2)}
        .bespoke-prog-icon{width:48px;height:48px;border-radius:12px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:14px}
        .bespoke-prog h3{font-size:1.1rem;margin-bottom:10px}
        .bespoke-prog p{color:var(--text-s);font-size:.92rem;line-height:1.6}
        .bespoke-cares{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px}
        .bespoke-care{background:#fff;border:1px solid var(--border);border-radius:var(--r-lg);padding:28px;box-shadow:var(--sh-1)}
        .bespoke-care h3{font-size:1.05rem;margin-bottom:10px}
        .bespoke-care p{color:var(--text-s);font-size:.9rem;line-height:1.6}
        @media(max-width:768px){.bespoke-grid{grid-template-columns:1fr}.bespoke-progs{grid-template-columns:1fr}.bespoke-cares{grid-template-columns:1fr}}
        .mobile-toggle{display:none;background:none;border:none;cursor:pointer;padding:8px;border-radius:8px;transition:background .2s}
        .navbar:not(.scrolled) .mobile-toggle i{color:var(--text)}
        .mobile-toggle:hover{background:rgba(0,0,0,.05)}
        .mobile-menu{display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border-bottom:1px solid var(--border);padding:16px 24px;box-shadow:0 12px 40px rgba(0,0,0,.1)}
        .mobile-menu.open{display:block}
        .mobile-menu a{display:block;padding:14px 0;text-decoration:none;color:var(--text);font-weight:500;border-bottom:1px solid var(--border-l);font-size:.95rem}
        .mobile-menu a:last-child{border:none}
        @media(max-width:768px){.navbar-links{display:none!important}.mobile-toggle{display:block}}

        .hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:var(--dark);padding-top:36px}
        .hero-mesh{position:absolute;inset:0;z-index:1;background:
          radial-gradient(60% 70% at 18% 20%,rgba(var(--primary-rgb),.35) 0%,transparent 60%),
          radial-gradient(50% 60% at 85% 15%,rgba(var(--accent-rgb,120,120,160),.30) 0%,transparent 55%),
          radial-gradient(70% 80% at 75% 90%,rgba(var(--secondary-rgb,80,90,140),.28) 0%,transparent 60%);
          filter:saturate(1.05);opacity:.95;transition:opacity .6s}
        .hero-bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.45;z-index:0;transition:opacity .6s}
        .hero-overlay{position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(var(--dark-rgb),.72) 0%,rgba(var(--dark-rgb),.55) 45%,rgba(var(--dark-rgb),.82) 100%)}
        .hero-inner{position:relative;z-index:10;max-width:1400px;margin:0 auto;padding:130px 32px 80px;width:100%;display:grid;grid-template-columns:1.1fr 360px;gap:56px;align-items:center}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.20);padding:9px 20px;border-radius:100px;color:#fff;font-size:.78rem;font-weight:600;margin-bottom:24px;letter-spacing:.6px;text-transform:uppercase;backdrop-filter:blur(10px)}
        .hero h1{font-size:var(--fs-display);font-weight:800;color:#fff;margin-bottom:20px;letter-spacing:-.03em;line-height:1.08;text-shadow:0 2px 24px rgba(0,0,0,.25)}
        .hero h1 em{font-style:normal;color:var(--accent-dark);position:relative}
        .hero-sub{font-size:1.12rem;color:rgba(255,255,255,.86);max-width:540px;margin-bottom:36px;line-height:1.8;text-shadow:0 1px 12px rgba(0,0,0,.2)}
        .hero-actions{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:40px}
        .btn-pri{display:inline-flex;align-items:center;gap:10px;background:var(--primary);color:#fff;padding:16px 32px;border-radius:14px;text-decoration:none;font-weight:700;font-size:.95rem;transition:all var(--dur) var(--ease);border:none;cursor:pointer;box-shadow:var(--sh-glow),0 0 0 1px rgba(255,255,255,.08) inset}
        .btn-pri:hover{transform:translateY(-2px);box-shadow:0 20px 50px rgba(var(--primary-rgb),.42)}
        .btn-sec{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.26);color:#fff;padding:16px 32px;border-radius:14px;text-decoration:none;font-weight:600;font-size:.95rem;transition:all var(--dur) var(--ease);backdrop-filter:blur(8px)}
        .btn-sec:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.4)}
        .hero-rating{display:flex;align-items:center;gap:10px}
        .hero-stars{display:flex;gap:2px;color:#fbbf24}
        .hero-rating-text{font-size:.88rem;color:rgba(255,255,255,.72)}
        .hero-card{background:rgba(255,255,255,.10);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.16);border-radius:var(--r-lg);padding:36px;color:#fff;box-shadow:var(--sh-2)}
        .hero-card-title{font-size:.74rem;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:rgba(255,255,255,.5);margin-bottom:24px}
        .hero-hours{margin-bottom:28px}
        .hero-hours-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);font-size:.92rem}
        .hero-hours-row:last-child{border:none}
        .hero-hours-day{color:rgba(255,255,255,.7)}
        .hero-hours-time{font-weight:600}
        .hero-card .btn-pri{width:100%;justify-content:center;margin-top:18px}
        .hero-card-note{text-align:center;font-size:.78rem;color:rgba(255,255,255,.45);margin-top:12px}
        @media(max-width:900px){.hero-inner{grid-template-columns:1fr;padding:110px 20px 60px}.hero-card{display:none}.hero-actions{flex-direction:column;align-items:stretch}.btn-pri,.btn-sec{justify-content:center}}
        @media(max-width:480px){.hero h1{font-size:2rem}.hero-sub{font-size:1rem}.hero-badge{font-size:.7rem;padding:6px 16px}.hero-rating-text{font-size:.8rem}.hero-inner{padding:100px 16px 40px}}

        .trust-bar{background:#fff;border-bottom:1px solid var(--border);padding:22px 0}
        .trust-inner{display:flex;justify-content:center;align-items:center;gap:48px;flex-wrap:wrap}
        .trust-item{display:flex;align-items:center;gap:10px;font-size:.9rem;color:var(--text-s);font-weight:500}
        .trust-item i{color:var(--primary)}
        .trust-div{width:1px;height:24px;background:var(--border)}
        @media(max-width:768px){.trust-inner{gap:16px}.trust-div{display:none}}

        .section{padding:var(--section-py) 0}
        .section-alt{background:#fff}
        .section-dark{background:var(--dark);color:#fff;padding:var(--section-py) 0}
        .section-hdr{text-align:center;margin-bottom:72px}
        .section-hdr h2{font-size:var(--fs-h2);font-weight:800;margin-bottom:18px;letter-spacing:-.03em}
        .section-hdr p{font-size:1.1rem;color:var(--text-s);max-width:580px;margin:0 auto;line-height:1.7}
        .section-dark .section-hdr h2{color:#fff}
        .section-dark .section-hdr p{color:rgba(255,255,255,.75)}
        .section-label{display:inline-block;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:var(--primary);margin-bottom:14px}
        .section-dark .section-label{color:var(--accent-dark)}
        @media(max-width:768px){.section{padding:60px 0}.section-dark{padding:60px 0}.section-hdr{margin-bottom:40px}.section-hdr p{font-size:1rem}}

        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
        .about-img{border-radius:20px;overflow:hidden;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.12)}
        .about-img img{width:100%;height:480px;object-fit:cover;display:block}
        .about-badge{position:absolute;bottom:24px;right:24px;background:var(--primary);color:#fff;padding:20px 28px;border-radius:16px;text-align:center;box-shadow:0 12px 32px rgba(var(--primary-rgb),.35)}
        .about-badge-num{font-size:2rem;font-weight:800;line-height:1}
        .about-badge-text{font-size:.72rem;text-transform:uppercase;letter-spacing:1.2px;opacity:.85;margin-top:4px}
        .about-text h2{font-size:var(--fs-h2);font-weight:800;margin-bottom:18px;letter-spacing:-.02em}
        .about-text>p{color:var(--text-s);margin-bottom:22px;font-size:1.02rem;line-height:1.8}
        .about-checks{list-style:none;display:grid;gap:14px;margin-bottom:32px}
        .about-checks li{display:flex;align-items:center;gap:12px;font-weight:500;font-size:.97rem}
        .about-checks i{color:var(--primary);flex-shrink:0}
        @media(max-width:768px){.about-grid{grid-template-columns:1fr;gap:44px}.about-img img{height:300px}.about-badge{bottom:16px;right:16px;padding:16px 22px}.about-badge-num{font-size:1.6rem}}

        .stats{padding:64px 0;display:grid;grid-template-columns:repeat(4,1fr);gap:36px;text-align:center;color:#fff;position:relative;overflow:hidden}
        .stats::before{content:'';position:absolute;top:-50%;left:-25%;width:150%;height:200%;background:radial-gradient(ellipse at center,rgba(255,255,255,.08) 0%,transparent 70%);animation:statsGlow 6s ease-in-out infinite alternate}
        @keyframes statsGlow{0%{transform:translateX(-20%)}100%{transform:translateX(20%)}}
        .stat-num{font-size:3.2rem;font-weight:800;line-height:1;margin-bottom:10px;font-family:${headingFont};transition:transform .3s}
        .stat-label{font-size:.82rem;text-transform:uppercase;letter-spacing:1.8px;opacity:.7;font-weight:600}
        .stat-item{animation:countUp .8s ease forwards;opacity:0;transition:transform .3s}
        .stat-item:hover{transform:scale(1.08)}
        .stat-item:nth-child(1){animation-delay:.15s}
        .stat-item:nth-child(2){animation-delay:.3s}
        .stat-item:nth-child(3){animation-delay:.45s}
        .stat-item:nth-child(4){animation-delay:.6s}
        @keyframes countUp{0%{opacity:0;transform:translateY(30px) scale(.9)}60%{opacity:1;transform:translateY(-5px) scale(1.02)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @media(max-width:768px){.stats{grid-template-columns:1fr 1fr;padding:44px 24px;gap:28px}.stat-num{font-size:2.4rem}}
        @media(max-width:480px){.stats{padding:36px 20px;gap:20px}.stat-num{font-size:2rem}.stat-label{font-size:.72rem;letter-spacing:1.2px}}

        .svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
        .svc-card{background:#fff;border:1px solid var(--border);border-radius:18px;padding:0;transition:all .35s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden}
        .svc-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--primary);transform:scaleX(0);transition:transform .35s;transform-origin:left}
        .svc-card:hover{border-color:var(--primary);box-shadow:0 12px 40px rgba(var(--primary-rgb),.1);transform:translateY(-6px)}
        .svc-card:hover::before{transform:scaleX(1)}
        .svc-card-img{width:100%;height:200px;object-fit:cover;display:block;transition:transform .5s}
        @media(min-width:1200px){.svc-card-img{height:220px}}
        .svc-card:hover .svc-card-img{transform:scale(1.05)}
        .svc-card-body{padding:28px}
        .svc-icon{width:48px;height:48px;border-radius:12px;background:rgba(var(--primary-rgb),.08);display:flex;align-items:center;justify-content:center;color:var(--primary);margin-bottom:14px}
        .svc-card h3{font-size:1.12rem;font-weight:700;margin-bottom:8px}
        .svc-card p{color:var(--text-s);font-size:.92rem;margin-bottom:16px;line-height:1.6}
        .svc-link{display:inline-flex;align-items:center;gap:6px;color:var(--primary);font-weight:600;font-size:.88rem;text-decoration:none;transition:gap .25s}
        .svc-link:hover{gap:10px}
        /* Soft Evolution card elevation */
        .svc-card{border-radius:var(--r-lg);box-shadow:var(--sh-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease),border-color var(--dur) var(--ease)}
        .svc-card:hover{border-color:color-mix(in srgb,var(--primary) 40%,var(--border));box-shadow:var(--sh-2);transform:translateY(-6px)}
        .svc-card-img{transition:transform .6s var(--ease);border-bottom:1px solid var(--border-l)}
        .guar-card{border-radius:var(--r-lg);box-shadow:var(--sh-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease)}
        .guar-card:hover{transform:translateY(-4px);box-shadow:var(--sh-2)}
        .guar-icon{background:var(--accent-soft)}
        .test-card{border-radius:var(--r-lg);box-shadow:var(--sh-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease)}
        .test-card:hover{box-shadow:var(--sh-2);transform:translateY(-4px)}
        .contact-form{border-radius:var(--r-lg);box-shadow:var(--sh-1)}
        .about-img{border-radius:var(--r-lg);box-shadow:var(--sh-2)}
        .why-stat{border-radius:var(--r);transition:transform var(--dur) var(--ease),background var(--dur) var(--ease)}
        .why-stat:hover{transform:translateY(-3px)}
        @media(max-width:768px){.svc-grid{grid-template-columns:1fr}.svc-card-img{height:200px}}

        .why-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
        .why-text h2{font-size:var(--fs-h2);font-weight:800;color:#fff;margin-bottom:18px;letter-spacing:-.02em}
        .why-text>p{color:rgba(255,255,255,.75);margin-bottom:36px;font-size:1.02rem;line-height:1.8}
        .why-stats{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .why-stat{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:24px;text-align:center;transition:all .3s}
        .why-stat:hover{background:rgba(255,255,255,.12);transform:translateY(-3px)}
        .why-stat-num{font-size:1.85rem;font-weight:800;color:var(--accent);line-height:1}
        .why-stat-label{font-size:.78rem;color:rgba(255,255,255,.5);margin-top:8px;text-transform:uppercase;letter-spacing:1.2px}
        .why-img{position:relative;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.2)}
        .why-img img{width:100%;height:480px;object-fit:cover;display:block}
        .why-img-badge{position:absolute;bottom:24px;right:24px;background:var(--primary);color:#fff;padding:20px 28px;border-radius:16px;text-align:center;box-shadow:0 12px 32px rgba(0,0,0,.3)}
        .why-img-badge-num{font-size:2.2rem;font-weight:800;line-height:1}
        .why-img-badge-text{font-size:.72rem;text-transform:uppercase;letter-spacing:1.2px;opacity:.85;margin-top:4px}
        @media(max-width:768px){.why-grid{grid-template-columns:1fr;gap:44px}.why-img{order:-1}.why-img-badge{bottom:16px;right:16px;padding:16px 22px}.why-img-badge-num{font-size:1.8rem}.why-stats{gap:12px}.why-stat{padding:18px}}

        .guar-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
        .guar-card{text-align:center;padding:32px 18px;border-radius:16px;border:1px solid var(--border);background:#fff;transition:all .35s}
        .guar-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.07)}
        .guar-icon{width:56px;height:56px;border-radius:50%;background:rgba(var(--primary-rgb),.08);display:flex;align-items:center;justify-content:center;color:var(--primary);margin:0 auto 16px}
        .guar-card h3{font-size:.92rem;font-weight:700;margin-bottom:8px}
        .guar-desc{font-size:.85rem;color:var(--text-s);line-height:1.6}

        .faq-wrap{max-width:820px;margin:0 auto}
        .faq-item{border:1px solid var(--border);border-radius:14px;margin-bottom:14px;background:#fff;overflow:hidden;transition:border-color .25s,box-shadow .25s}
        .faq-item[open]{border-color:var(--primary);box-shadow:0 8px 30px rgba(var(--primary-rgb),.08)}
        .faq-q{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 26px;cursor:pointer;font-weight:600;font-size:1.02rem;list-style:none}
        .faq-q::-webkit-details-marker{display:none}
        .faq-q i{color:var(--primary);flex-shrink:0;transition:transform .3s}
        .faq-item[open] .faq-q i{transform:rotate(180deg)}
        .faq-a{padding:0 26px 24px;color:var(--text-s);font-size:.96rem;line-height:1.75}
        @media(max-width:768px){.faq-q{padding:18px 20px;font-size:.95rem}.faq-a{padding:0 20px 20px}}
        @media(max-width:768px){.guar-grid{grid-template-columns:1fr 1fr;gap:16px}.guar-card{padding:24px 14px}.guar-icon{width:48px;height:48px}}
        @media(max-width:480px){.guar-grid{grid-template-columns:1fr 1fr;gap:12px}.guar-card{padding:20px 12px}.guar-card h3{font-size:.84rem}}

        .gal-grid{display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:300px 300px;gap:12px}
        @media(min-width:1200px){.gal-grid{grid-template-rows:360px 360px}}
        .gal-item{border-radius:14px;overflow:hidden;position:relative;background:var(--border-l)}
        .gal-main{grid-row:1/-1}
        .gal-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s cubic-bezier(.25,1,.5,1)}
        .gal-item:hover img{transform:scale(1.06)}
        .gal-item img[data-fallback="true"]{opacity:.6;object-fit:contain;padding:20px;background:var(--bg)}
        @media(max-width:768px){.gal-grid{grid-template-columns:1fr 1fr;grid-template-rows:auto}.gal-main{grid-row:auto}.gal-item{aspect-ratio:4/3}}
        @media(max-width:480px){.gal-grid{grid-template-columns:1fr}.gal-item{aspect-ratio:16/9}}

        .test-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
        .test-card{background:#fff;border:1px solid var(--border);border-radius:18px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;transition:all .35s}
        .test-card:hover{box-shadow:0 12px 40px rgba(0,0,0,.07);transform:translateY(-4px)}
        .test-stars{display:flex;gap:2px;color:#f59e0b;margin-bottom:16px}
        .test-text{font-size:.97rem;color:var(--text);font-style:italic;line-height:1.8;margin-bottom:24px;flex-grow:1}
        .test-author{display:flex;align-items:center;gap:14px;border-top:1px solid var(--border-l);padding-top:18px}
        .test-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1rem;flex-shrink:0}
        .test-name{font-weight:700;font-size:.92rem}
        .test-date{font-size:.75rem;color:var(--text-t)}
        .test-google{display:flex;align-items:center;gap:10px;justify-content:center;margin-top:32px;padding:16px 24px;border:1px solid var(--border);border-radius:12px;background:#fff;width:fit-content;margin-left:auto;margin-right:auto}
        .test-google-star{color:#f59e0b}
        @media(max-width:768px){.test-grid{grid-template-columns:1fr}.test-card{padding:24px}}

        /* process + cta-banner sections removed -> their CSS purged */

        .contact-wrap{display:grid;grid-template-columns:1fr 1fr;gap:36px}
        .contact-form{background:#fff;border:1px solid var(--border);border-radius:20px;padding:44px;box-shadow:0 4px 20px rgba(0,0,0,.04)}
        .contact-form h3{font-size:1.45rem;font-weight:800;margin-bottom:8px}
        .contact-form>p{color:var(--text-s);margin-bottom:32px;font-size:.98rem;line-height:1.6}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .form-group{margin-bottom:18px}
        .form-control{width:100%;padding:14px 18px;border-radius:12px;border:1px solid var(--border);background:var(--bg);font-family:'Inter',sans-serif;font-size:.92rem;transition:all .25s;outline:none}
        .form-control:focus{border-color:var(--primary);box-shadow:0 0 0 4px rgba(var(--primary-rgb),.1);background:#fff}
        .form-label{display:block;font-size:.76rem;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;color:var(--text-s);margin-bottom:7px}
        .form-submit{width:100%;padding:15px;border-radius:12px;border:none;background:var(--primary);color:#fff;font-weight:700;font-size:.98rem;cursor:pointer;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:10px;margin-top:10px;box-shadow:0 4px 15px rgba(var(--primary-rgb),.25)}
        .form-submit:hover{opacity:.92;transform:translateY(-1px)}
        .form-note{text-align:center;margin-top:12px;font-size:.78rem;color:var(--text-t)}
        .form-check{display:flex;align-items:flex-start;gap:10px;margin:6px 0 14px;font-size:.82rem;color:var(--text-s);line-height:1.5}
        .form-check input{margin-top:3px;width:16px;height:16px;accent-color:var(--primary);flex-shrink:0;cursor:pointer}
        .form-check a{color:var(--primary);text-decoration:underline}
        .test-empty{text-align:center;padding:48px 20px;color:var(--text-t);background:#fff;border:1px dashed var(--border);border-radius:var(--r-lg)}
        .test-empty i{color:var(--primary);margin-bottom:12px;display:block}
        .test-empty p{font-size:.98rem}

        .contact-sidebar{display:flex;flex-direction:column;gap:22px}
        .contact-hours{background:var(--bg);border:1px solid var(--border);border-radius:18px;padding:32px}
        .contact-hours h4{font-size:.88rem;font-weight:700;margin-bottom:18px;display:flex;align-items:center;gap:8px}
        .hours-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-l);font-size:.92rem}
        .hours-row:last-child{border:none}
        .hours-day{color:var(--text-s)}
        .hours-time{font-weight:600}
        .contact-card{background:var(--dark);border-radius:18px;padding:32px;color:#fff}
        .contact-card-item{display:flex;align-items:center;gap:14px;margin-bottom:16px;font-size:.92rem;color:rgba(255,255,255,.75)}
        .contact-card-item:last-child{margin-bottom:0}
        .contact-card-item i{color:var(--accent-dark)}
        .contact-card-item a{color:inherit;text-decoration:none;transition:color .2s}
        .contact-card-item a:hover{color:#fff}
        .contact-map{border-radius:18px;overflow:hidden;border:1px solid var(--border);min-height:280px}
        .contact-map iframe{width:100%;height:100%;min-height:280px;border:none}
        @media(max-width:768px){.contact-wrap{grid-template-columns:1fr}.form-row{grid-template-columns:1fr}.contact-form{padding:28px}}

        footer{background:var(--dark);color:#fff;padding:70px 0 32px}
        .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1.5fr;gap:44px;margin-bottom:44px}
        .footer-brand{font-size:1.25rem;font-weight:800;margin-bottom:12px;display:flex;align-items:center;gap:12px}
        .footer-brand-logo{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--primary));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;flex-shrink:0}
        .footer-brand-text{white-space:normal;max-width:260px;line-height:1.2}
        .footer-desc{font-size:.9rem;color:rgba(255,255,255,.5);line-height:1.8;margin-bottom:20px}
        .footer-social{display:flex;gap:12px}
        .footer-social a{width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;transition:all .25s}
        .footer-social a:hover{background:rgba(255,255,255,.15);transform:translateY(-2px)}
        .footer-col h4{font-size:.82rem;font-weight:700;margin-bottom:18px;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,255,255,.4)}
        .footer-col ul{list-style:none}
        .footer-col li{margin-bottom:10px}
        .footer-col a{color:rgba(255,255,255,.6);text-decoration:none;font-size:.9rem;transition:color .25s;display:inline-block}
        .footer-col a:hover{color:#fff}
        .footer-contact-item{display:flex;align-items:center;gap:12px;margin-bottom:12px;color:rgba(255,255,255,.65);font-size:.9rem}
        .footer-contact-item i{color:var(--accent)}
        .footer-bottom{border-top:1px solid rgba(255,255,255,.1);padding-top:24px;text-align:center;font-size:.82rem;color:rgba(255,255,255,.3)}
        @media(max-width:900px){.footer-grid{grid-template-columns:1fr 1fr;gap:32px}}
        @media(max-width:600px){.footer-grid{grid-template-columns:1fr;gap:28px}footer{padding:48px 0 24px}}

        .float-urgent{position:fixed;bottom:28px;right:28px;z-index:90;display:inline-flex;align-items:center;gap:10px;background:var(--primary);color:#fff;padding:16px 28px;border-radius:100px;text-decoration:none;font-weight:700;font-size:.92rem;box-shadow:0 8px 35px rgba(var(--primary-rgb),.4);transition:all .3s;animation:pulse-urgent 2.5s infinite}
        .float-urgent:hover{transform:translateY(-3px);box-shadow:0 12px 45px rgba(var(--primary-rgb),.5)}
        @keyframes pulse-urgent{0%,100%{box-shadow:0 8px 35px rgba(var(--primary-rgb),.4)}50%{box-shadow:0 8px 35px rgba(var(--primary-rgb),.6),0 0 0 10px rgba(var(--primary-rgb),.1)}}
        @media(max-width:768px){.float-urgent{bottom:20px;right:20px;padding:14px 22px;font-size:.85rem}}
        .cursor-dot{position:fixed;top:0;left:0;width:8px;height:8px;border-radius:50%;background:var(--accent-dark);pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .2s var(--ease),height .2s var(--ease),background .2s var(--ease);mix-blend-mode:difference;opacity:0}
        .cursor-dot.is-active{opacity:1}
        .cursor-dot.is-hover{width:34px;height:34px;background:rgba(255,255,255,.6)}
        @media(pointer:coarse),(max-width:767px),(prefers-reduced-motion:reduce){.cursor-dot{display:none!important}}

        .reveal{opacity:0;transform:translateY(28px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
        .reveal.active{opacity:1;transform:translateY(0)}
        .reveal-d1{transition-delay:.06s}.reveal-d2{transition-delay:.14s}.reveal-d3{transition-delay:.22s}
        @media(prefers-reduced-motion:reduce){
          *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
          .reveal{opacity:1!important;transform:none!important}
          .hero-mesh{opacity:.8!important}
        }
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .hero-badge{animation:float 3s ease-in-out infinite}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        /* cta-banner variant removed -> CSS purged */
        .svc-card{transition:all .4s cubic-bezier(.4,0,.2,1)}
        .svc-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 20px 50px rgba(var(--primary-rgb),.15)}
        .gal-item{transition:all .5s cubic-bezier(.25,1,.5,1)}
        .gal-item:hover{transform:scale(1.02);box-shadow:0 12px 40px rgba(0,0,0,.15);z-index:2}
        .test-card{transition:all .4s cubic-bezier(.4,0,.2,1)}
        .test-card:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 16px 48px rgba(0,0,0,.08)}
        .about-img{transition:all .4s}
        .about-img:hover{transform:scale(1.02);box-shadow:0 24px 64px rgba(0,0,0,.15)}
        .btn-pri{position:relative;overflow:hidden}
        .btn-pri::after{content:'';position:absolute;top:50%;left:50%;width:0;height:0;background:rgba(255,255,255,.15);border-radius:50%;transform:translate(-50%,-50%);transition:width .4s,height .4s}
        .btn-pri:hover::after{width:300px;height:300px}
        .guar-card{transition:all .35s cubic-bezier(.4,0,.2,1)}
        .guar-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(var(--primary-rgb),.1)}
        .guar-icon{transition:all .3s}
        .guar-card:hover .guar-icon{transform:scale(1.1);background:var(--primary);color:#fff}
        .section-dark::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 20% 50%,rgba(var(--primary-rgb),.08) 0%,transparent 50%);pointer-events:none}
        .section-dark{position:relative;overflow:hidden}

        .section-deco{position:absolute;pointer-events:none;z-index:0}
        .deco-circle{border-radius:50%;background:radial-gradient(circle,rgba(var(--primary-rgb),var(--accent-opacity)) 0%,transparent 70%);animation:decoFloat 12s ease-in-out infinite}
        .deco-diamond{width:120px;height:120px;background:linear-gradient(135deg,rgba(var(--primary-rgb),.03),rgba(var(--primary-rgb),.06));transform:rotate(var(--deco-rotation));animation:decoSpin 20s linear infinite}
        .deco-line{height:2px;background:linear-gradient(90deg,transparent,rgba(var(--primary-rgb),.12),transparent);animation:decoSlide 8s ease-in-out infinite}
        .deco-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);animation:decoPulse 3s ease-in-out infinite}
        @keyframes decoFloat{0%,100%{transform:translateY(0) scale(var(--deco-scale))}50%{transform:translateY(-20px) scale(calc(var(--deco-scale) * 1.05))}}
        @keyframes decoSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes decoSlide{0%,100%{transform:translateX(-30px);opacity:.3}50%{transform:translateX(30px);opacity:.7}}
        @keyframes decoPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}

        .svc-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:50%;background:linear-gradient(to top,rgba(var(--primary-rgb),.02),transparent);pointer-events:none;border-radius:0 0 18px 18px;opacity:0;transition:opacity .4s}
        .svc-card:hover::after{opacity:1}
        .svc-icon{transition:all .3s}
        .svc-card:hover .svc-icon{transform:scale(1.1) rotate(5deg);box-shadow:0 4px 16px rgba(var(--primary-rgb),.2)}

        .about-text{position:relative}
        .about-text::before{content:'';position:absolute;top:-20px;left:-20px;width:60px;height:60px;border:3px solid rgba(var(--primary-rgb),.08);border-radius:50%;animation:decoPulse 4s ease-in-out infinite}

        .why-text::after{content:'';position:absolute;top:50%;right:-30px;width:200px;height:200px;border:1px solid rgba(255,255,255,.05);border-radius:50%;transform:translateY(-50%);animation:decoFloat 15s ease-in-out infinite;pointer-events:none}

        .test-card{position:relative;overflow:hidden}
        .test-card::before{content:'';position:absolute;top:0;left:0;width:4px;height:0;background:var(--primary);transition:height .4s;border-radius:0 0 4px 4px}
        .test-card:hover::before{height:100%}

        .gal-item::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(var(--primary-rgb),0),rgba(var(--primary-rgb),.1));opacity:0;transition:opacity .5s;pointer-events:none}
        .gal-item:hover::after{opacity:1}

        .trust-item{transition:all .3s}
        .trust-item:hover{transform:translateY(-2px);color:var(--primary)}
        .trust-item:hover i{transform:scale(1.2)}

        .section-alt{position:relative}
        .section-alt::before{content:'';position:absolute;top:0;right:0;width:300px;height:300px;background:radial-gradient(circle,rgba(var(--primary-rgb),.03) 0%,transparent 70%);pointer-events:none}
        .privacy-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:200;justify-content:center;align-items:center;padding:24px}
        .privacy-overlay.open{display:flex}
        .privacy-modal{background:#fff;border-radius:20px;max-width:700px;width:100%;max-height:80vh;overflow-y:auto;padding:40px;position:relative;-webkit-overflow-scrolling:touch}
        .privacy-modal h2{font-size:1.5rem;margin-bottom:20px;color:var(--text)}
        .privacy-modal h3{font-size:1.1rem;margin:20px 0 10px;color:var(--text)}
        .privacy-modal p{color:var(--text-s);font-size:.92rem;line-height:1.8;margin-bottom:12px}
        .privacy-close{position:absolute;top:16px;right:16px;background:var(--bg);border:none;border-radius:50%;width:44px;height:44px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:var(--text-s);transition:all .2s}
        .privacy-close:hover{background:var(--border);color:var(--text)}

        .skip-link{position:absolute;top:-100px;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;padding:12px 24px;border-radius:0 0 12px 12px;z-index:999;font-weight:600;text-decoration:none;transition:top .3s}
        .skip-link:focus{top:0}
        *:focus-visible{outline:3px solid var(--primary);outline-offset:3px;border-radius:4px}
        .mobile-toggle[aria-expanded="true"] i{transform:rotate(90deg)}

        .info-bar{background:var(--dark);color:rgba(255,255,255,.85);padding:8px 0;overflow:hidden;position:fixed;top:0;left:0;right:0;z-index:110;font-size:.82rem;border-bottom:1px solid rgba(255,255,255,.08)}
        .info-bar-inner{display:flex;align-items:center;gap:0;white-space:nowrap;animation:marquee 35s linear infinite;width:max-content}
        .info-bar-inner:hover{animation-play-state:paused}
        .info-bar-item{display:inline-flex;align-items:center;gap:7px;padding:0 28px;border-right:1px solid rgba(255,255,255,.12);flex-shrink:0}
        .info-bar-item:last-child{border-right:none}
        .info-bar-item i{color:var(--accent);flex-shrink:0;width:14px;height:14px}
        .info-bar-item a{color:inherit;text-decoration:none;transition:color .2s}
        .info-bar-item a:hover{color:#fff}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @media(max-width:768px){.info-bar{font-size:.75rem}.info-bar-item{padding:0 18px;gap:5px}}
    </style>
</head>
<body>
    <div class="info-bar">
        <div class="info-bar-inner">
            ${phone ? `<div class="info-bar-item"><i data-lucide="phone" width="14"></i> <a href="tel:${cleanPhoneLink}">${phone}</a></div>` : ''}
            ${email ? `<div class="info-bar-item"><i data-lucide="mail" width="14"></i> <a href="mailto:${email}">${email}</a></div>` : ''}
            ${address ? `<div class="info-bar-item"><i data-lucide="map-pin" width="14"></i> ${address}${city ? ', ' + city : ''}</div>` : ''}
            <div class="info-bar-item"><i data-lucide="clock" width="14"></i> ${lang === 'en' ? 'Mon-Fri 8am-6pm · Sat 9am-2pm' : 'Lun-Ven 08h-18h · Sam 09h-14h'}</div>
            ${hasRealRating && rating ? `<div class="info-bar-item"><i data-lucide="star" width="14" fill="currentColor"></i> ${rating}/5 ${ui.testGoogle} (${reviews} ${ui.testAvis})</div>` : ''}
            ${phone ? `<div class="info-bar-item"><i data-lucide="phone" width="14"></i> <a href="tel:${cleanPhoneLink}">${phone}</a></div>` : ''}
            ${email ? `<div class="info-bar-item"><i data-lucide="mail" width="14"></i> <a href="mailto:${email}">${email}</a></div>` : ''}
            ${address ? `<div class="info-bar-item"><i data-lucide="map-pin" width="14"></i> ${address}${city ? ', ' + city : ''}</div>` : ''}
            <div class="info-bar-item"><i data-lucide="clock" width="14"></i> ${lang === 'en' ? 'Mon-Fri 8am-6pm · Sat 9am-2pm' : 'Lun-Ven 08h-18h · Sam 09h-14h'}</div>
            ${hasRealRating && rating ? `<div class="info-bar-item"><i data-lucide="star" width="14" fill="currentColor"></i> ${rating}/5 ${ui.testGoogle} (${reviews} ${ui.testAvis})</div>` : ''}
        </div>
    </div>
    <a href="#hero" class="skip-link">${lang === 'en' ? 'Skip to main content' : 'Aller au contenu principal'}</a>
    <nav class="navbar" id="navbar">
        <div class="navbar-inner">
            <a href="#" class="navbar-brand">
                <div class="navbar-logo"><i data-lucide="${heroBadge.icon}" width="22" height="22"></i></div>
                <span class="navbar-name">${logoInfo.text}</span>
            </a>
            <div class="navbar-links">
                ${sectorCfg.navItems.map(item => `<a href="${item.href}">${item.label[lang]}</a>`).join('')}
                ${phone ? `<a href="tel:${cleanPhoneLink}" class="navbar-cta"><i data-lucide="phone" width="16"></i> ${phone}</a>` : ''}
            </div>
            <button class="mobile-toggle" id="mobile-toggle" aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu"><i data-lucide="menu" width="24" height="24" style="color:var(--text)"></i></button>
        </div>
        <div class="mobile-menu" id="mobile-menu" role="navigation" aria-label="${lang === 'en' ? 'Mobile menu' : 'Menu mobile'}">
            ${sectorCfg.navItems.map(item => `<a href="${item.href}">${item.label[lang]}</a>`).join('')}
            ${phone ? `<a href="tel:${cleanPhoneLink}" style="color:var(--primary);font-weight:700">${phone}</a>` : ''}
        </div>
    </nav>

${buildHero(content, template, lang)}

    <main id="main-content">
    <div class="trust-bar">
        <div class="trust-inner">
            ${getGuarantees(content.sector, lang).map((g: { title: string; icon: string }, i: number) => `
            <div class="trust-item"><i data-lucide="${g.icon}" width="16"></i> ${g.title}</div>
            ${i < 3 ? '<div class="trust-div"></div>' : ''}
            `).join('')}
        </div>
    </div>

${buildServices(content, lang, descs, displayServices)}

${bespokeSection}

    <section class="section section-alt" id="about">
        <div class="container" style="position:relative">
            <div class="section-deco deco-diamond" style="top:-40px;${leadVariant % 3 === 0 ? 'left:-30px' : leadVariant % 3 === 1 ? 'right:-30px' : 'left:50%;margin-left:-60px'};animation-delay:${leadVariant * 2}s"></div>
            ${leadVariant > 1 ? '<div class="section-deco deco-dot" style="top:20%;right:10%;animation-delay:1.5s"></div>' : ''}
            <div class="about-grid">
                <div class="about-img reveal">
                    <img src="${proxiedImg(getImg(1))}" ${imgErr(1)} alt="${companyName}" loading="lazy">
                    <div class="about-badge"><div class="about-badge-num">${hasRealRating && rating ? rating + '/5' : (establishedYear ? (new Date().getFullYear() - establishedYear) + '+' : sectorCfg.aboutBadge.value)}</div><div class="about-badge-text">${hasRealRating && rating ? (lang === 'en' ? 'Google Rating' : 'Note Google') : (establishedYear ? (lang === 'en' ? 'Years Experience' : 'Ans d\'expérience') : sectorCfg.aboutBadge.label[lang])}</div></div>
                </div>
                <div class="about-text reveal">
                    <span class="section-label">${ui.eyebrowAbout}</span>
                    <h2>${lang === 'en' ? 'About' : 'À propos de'} ${companyName}</h2>
                    <p>${aboutText}</p>
                    <ul class="about-checks">
                        <li><i data-lucide="check-circle-2" width="18"></i> ${pack.whyUs[0]?.title || (lang === 'en' ? 'Quality Service' : 'Qualité professionnelle')}</li>
                        <li><i data-lucide="check-circle-2" width="18"></i> ${pack.whyUs[1]?.title || (lang === 'en' ? 'Here for You' : 'À votre écoute')}</li>
                        <li><i data-lucide="check-circle-2" width="18"></i> ${pack.whyUs[2]?.title || (lang === 'en' ? 'Satisfaction Guaranteed' : 'Satisfaction garantie')}</li>
                        <li><i data-lucide="check-circle-2" width="18"></i> ${pack.whyUs[3]?.title || (lang === 'en' ? 'Trusted Service' : 'Service de confiance')}</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <section class="section-dark" id="why">
        <div class="container">
            <div class="why-grid">
                <div class="why-text reveal">
                    <span class="section-label">${ui.eyebrowWhy}</span>
                    <h2>${content.aboutTitle || (lang === 'en' ? 'Our Approach' : 'Notre Approche')}</h2>
                    <p>${lang === 'en' ? `Our approach: ${pack.whyUs.slice(0, 2).map(w => w.title.toLowerCase()).join(' and ')}.` : `Notre approche : ${pack.whyUs.slice(0, 2).map(w => w.title.toLowerCase()).join(' et ')}.`}</p>
                </div>
                <div class="why-img reveal">
                    <img src="${proxiedImg(getImg(2))}" ${imgErr(2)} alt="${companyName}" loading="lazy">
                    <div class="why-img-badge"><div class="why-img-badge-num">${(hasRealRating && typeof rating === 'number' && rating > 0) ? rating + '/5' : (typeof establishedYear === 'number' && establishedYear > 0 ? (new Date().getFullYear() - establishedYear) + '+' : '24/7')}</div><div class="why-img-badge-text">${(hasRealRating && typeof rating === 'number' && rating > 0) ? (lang === 'en' ? 'Google Rating' : 'Note Google') : (typeof establishedYear === 'number' && establishedYear > 0 ? (lang === 'en' ? 'Years' : 'Ans') : (lang === 'en' ? 'Available' : 'Disponible'))}</div></div>
                </div>
            </div>
        </div>
    </section>

    <div class="stats" style="background:var(--primary)">
        ${getStats(content.sector, lang, rating, reviews, establishedYear, hasRealRating ?? false, hasRealReviews ?? false).map(s => `<div class="stat-item"><div class="stat-num">${s.num}</div><div class="stat-label">${s.label}</div></div>`).join('')}
    </div>

${buildWhyUs(content, pack.whyUs)}

${buildTrust(content, lang)}

    <section class="section section-alt" id="faq">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">FAQ</span>
                <h2>${lang === 'en' ? 'Frequently Asked Questions' : 'Questions fréquentes'}</h2>
                <p>${lang === 'en' ? `Everything you need to know before calling ${companyName}.` : `Tout ce qu'il faut savoir avant de faire appel à ${companyName}.`}</p>
            </div>
            <div class="faq-wrap reveal">
                ${pack.faq.map(f => `
                <details class="faq-item">
                    <summary class="faq-q">${f.q} <i data-lucide="chevron-down" width="18"></i></summary>
                    <div class="faq-a">${f.a}</div>
                </details>`).join('')}
            </div>
        </div>
    </section>

${buildContact(content, lang)}
    </main>

    <footer>
        <div class="container">
            <div class="footer-grid">
                <div>
                    <div class="footer-brand"><div class="footer-brand-logo"><i data-lucide="${heroBadge.icon}" width="18" height="18"></i></div><span class="footer-brand-text">${logoInfo.text}</span></div>
                    <p class="footer-desc">${footerDesc || (lang === 'en' ? `Your trusted ${content.sector} — ${companyName}.` : `Votre ${content.sector} de confiance — ${companyName}.`)}</p>
                    ${content.socialLinks && Object.values(content.socialLinks).some(v => v) ? `
                    <div class="footer-social">
                        ${content.socialLinks.facebook ? `<a href="${content.socialLinks.facebook}" target="_blank" rel="noopener" aria-label="Facebook"><i data-lucide="facebook" width="18"></i></a>` : ''}
                        ${content.socialLinks.instagram ? `<a href="${content.socialLinks.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><i data-lucide="instagram" width="18"></i></a>` : ''}
                        ${content.socialLinks.linkedin ? `<a href="${content.socialLinks.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn"><i data-lucide="linkedin" width="18"></i></a>` : ''}
                        ${content.socialLinks.twitter ? `<a href="${content.socialLinks.twitter}" target="_blank" rel="noopener" aria-label="Twitter"><i data-lucide="twitter" width="18"></i></a>` : ''}
                        ${content.socialLinks.youtube ? `<a href="${content.socialLinks.youtube}" target="_blank" rel="noopener" aria-label="YouTube"><i data-lucide="youtube" width="18"></i></a>` : ''}
                        ${content.socialLinks.tiktok ? `<a href="${content.socialLinks.tiktok}" target="_blank" rel="noopener" aria-label="TikTok"><i data-lucide="music" width="18"></i></a>` : ''}
                    </div>` : ''}
                </div>
                <div class="footer-col"><h4>${ui.navServices}</h4><ul>${services.slice(0,5).map(s=>`<li><a href="#services">${s.name}</a></li>`).join('')}</ul></div>
                <div class="footer-col"><h4>${ui.footerNav}</h4><ul><li><a href="#about">${ui.navAbout}</a></li><li><a href="#why">${ui.navWhy}</a></li><li><a href="#testimonials">${ui.navAvis}</a></li><li><a href="#contact">${ui.navContact}</a></li><li><a href="#" onclick="event.preventDefault();document.getElementById('privacy-modal').classList.add('open')">${ui.footerPrivacy}</a></li></ul></div>
                <div class="footer-col"><h4>${ui.footerContact}</h4>
                    ${phone?`<div class="footer-contact-item"><i data-lucide="phone" width="14"></i> ${phone}</div>`:''}
                    ${email?`<div class="footer-contact-item"><i data-lucide="mail" width="14"></i> ${email}</div>`:''}
                    ${address?`<div class="footer-contact-item"><i data-lucide="map-pin" width="14"></i> ${address}</div>`:''}
                    ${phone?`<a href="tel:${cleanPhoneLink}" class="btn-pri" style="margin-top:12px;padding:10px 20px;font-size:.85rem;width:fit-content">${ui.contactCall}</a>`:''}
                </div>
            </div>
            <div class="footer-bottom">&copy; ${new Date().getFullYear()} ${companyName}. ${lang === 'en' ? 'All rights reserved. Built by Services-Siteup.' : 'Tous droits réservés. Créé par Services-Siteup.'}</div>
        </div>
    </footer>

    ${phone ? `<a href="tel:${cleanPhoneLink}" class="float-urgent"><i data-lucide="phone" width="18"></i> ${ui.contactCall}</a>` : ''}

    <div class="privacy-overlay" id="privacy-modal">
        <div class="privacy-modal">
            <button class="privacy-close" onclick="document.getElementById('privacy-modal').classList.remove('open')">&times;</button>
            <h2>${ui.privacyTitle}</h2>
            ${getPrivacyContent(lang, companyName, email || '', address || '')}
            
            <p style="margin-top:24px;font-size:.82rem;color:var(--text-t)">${lang === 'en' ? 'Last updated' : 'Dernière mise à jour'} : ${new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
    </div>

    <script>
        lucide.createIcons();
        (function(){
          var fine = window.matchMedia('(pointer:fine)').matches;
          var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
          if(!fine || reduce) return;
          var dot=document.createElement('div');dot.className='cursor-dot';document.body.appendChild(dot);
          window.addEventListener('mousemove',function(e){dot.classList.add('is-active');dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';});
          window.addEventListener('mouseover',function(e){if(e.target.closest('a,button,[role="button"],input,textarea,select,.svc-card,.guar-card,.test-card'))dot.classList.add('is-hover');});
          window.addEventListener('mouseout',function(e){if(e.target.closest('a,button,[role="button"],input,textarea,select,.svc-card,.guar-card,.test-card'))dot.classList.remove('is-hover');});
          document.addEventListener('mouseleave',function(){dot.classList.remove('is-active');});
        })();
        window.addEventListener('scroll',()=>{
            const n=document.getElementById('navbar');
            const ib=document.querySelector('.info-bar');
            const s=window.scrollY;
            if(n)n.classList.toggle('scrolled',s>50);
            if(ib){ib.style.transform=s>36?'translateY(-100%)':'translateY(0)';ib.style.transition='transform .3s ease'}
            if(n)n.style.top=s>36?'0':'36px';
        });
        const t=document.getElementById('mobile-toggle'),m=document.getElementById('mobile-menu');
        if(t&&m){t.addEventListener('click',()=>{const o=m.classList.toggle('open');t.setAttribute('aria-expanded',String(o))});m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{m.classList.remove('open');t.setAttribute('aria-expanded','false')}));document.addEventListener('click',e=>{if(!m.contains(e.target)&&!t.contains(e.target)){m.classList.remove('open');t.setAttribute('aria-expanded','false')}})}
        if('IntersectionObserver' in window){const r=document.querySelectorAll('.reveal');const o=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('active');o.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -60px 0px'});r.forEach(el=>o.observe(el))}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('active'))}
        document.addEventListener('keydown',e=>{if(e.key==='Escape'){const pm=document.getElementById('privacy-modal');if(pm&&pm.classList.contains('open'))pm.classList.remove('open');const mm=document.getElementById('mobile-menu');if(mm&&mm.classList.contains('open')){mm.classList.remove('open');t&&t.setAttribute('aria-expanded','false')}}});
        document.querySelectorAll('img').forEach(img=>{img.addEventListener('error',function(){this.style.opacity='.5';this.style.objectFit='contain';this.alt=this.alt||'Image non disponible'})});
    </script>
</body>
</html>`;
}
