// ── PREMIUM LOCAL BUSINESS TEMPLATE ──
// Design épuré, luxe, professionnel. Zero gimmicks, zero popups agressifs.

import { getSectorImages, getSectorImagesAsync, getServiceImageQuery, fetchSectorImagesFromAPI, fetchServiceImages, getPexelsApiKey, setPexelsApiKey } from './pexelsImages';
import { getImagesForLead } from './pexelsApi';
import { isImageBlocked, filterImages, isStockImage } from './imageFilters';
import { getSectorConfig } from './sectorConfig';
import { UI } from './template/ui';
import { getProcessSteps, getGuarantees, getHeroBadge, getGalleryDesc, getPrivacyContent, generateFeaturesFromService, generateAboutText, capitalizeCity, getLogoInfo, detectLanguage, isEnglishText, getFaq, getWhyContent, getWhyPoints, getAboutPoints, getTrustBar, iconForService, normalizeReviewDate } from './template/helpers';
export { detectLanguage };

// ── AVIS FALLBACK SECTORIELS ──
const SECTOR_FALLBACK_REVIEWS: Record<string, Array<{ author: string; text: string; rating: number; date: string }>> = {
  plomberie: [
    { author: 'M. Dupont', text: "Intervention rapide pour une fuite d'eau en pleine nuit. Plombier professionnel et tarifs justes. Je recommande !", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Mme Martin', text: "Chauffage réparé en 1h, impeccable. Un vrai pro qui connait son métier.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Pierre L.', text: "Remplacement complet de la salle de bain. Travail soigné, respect des délais.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Sophie R.', text: "Détection de fuite sans casse. Technologie au top et prix raisonnable.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Jean-Claude B.', text: "Entretien annuel de la chaudière. Consciencieux et sympathique.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Marie T.', text: "Débouchage d'urgence. Arrivé en 45min, problème résolu. Merci !", rating: 5, date: 'Il y a 2 mois' }
  ],
  electricien: [
    { author: 'Sylvie M.', text: "Mise aux normes complète de ma maison ancienne. Travail propre et conforme.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Marc D.', text: "Installation de ma borne de recharge voiture électrique. Parfait !", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Nathalie P.', text: "Domotique installée dans toute la maison. Un vrai confort au quotidien.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Philippe R.', text: "Court-circuit réparé en urgence. Intervention rapide et efficace.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Isabelle G.', text: "Éclairage LED dans tout l'appartement. Économies d'énergie garanties.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'François L.', text: "Diagnostic complet avant achat immobilier. Rassurant et professionnel.", rating: 5, date: 'Il y a 2 mois' }
  ],
  coiffeur: [
    { author: 'Sophie L.', text: "Coupe parfaite, exactement ce que je voulais. Le visagisme fait toute la différence !", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Thomas H.', text: "Barbier au top, rasage à l'ancienne de qualité. Ambiance masculine garantie.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Camille D.', text: "Coloration balayage magnifique. Des compliments tous les jours !", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Laura M.', text: "Soins kératine pour mes cheveux abîmés. Résultat spectaculaire.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Emma B.', text: "Chignon de mariage exceptionnel. Tenu toute la journée et la nuit.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Nicolas P.', text: "Extensions naturelles, on ne voit pas la différence. Super travail.", rating: 5, date: 'Il y a 2 mois' }
  ],
  restaurant: [
    { author: 'Julie M.', text: "Menu dégustation exceptionnel. Une explosion de saveurs à chaque plat !", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Antoine D.', text: "Service impeccable et cadre magnifique. Parfait pour les occasions spéciales.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Sarah K.', text: "Produits locaux et cuisine créative. Une belle découverte gastronomique.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'David L.', text: "Brunch de qualité, copieux et fait maison. On reviendra !", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Claire P.', text: "Accueil chaleureux comme à la maison. Une cuisine avec du cœur.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Romain G.', text: "Carte des vins excellente et conseils avisés. Soirée parfaite.", rating: 5, date: 'Il y a 2 mois' }
  ],
  garage: [
    { author: 'Stéphane B.', text: "Réparation moteur complexe résolue en 2 jours. Mécanicien de talent !", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Aurélie M.', text: "Pneus changés et géométrie faite. Prix compétitif et rapide.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Christophe L.', text: "Diagnostic électronique précis. Enfin un garage honnête !", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Marie-Jeanne T.', text: "Carrosserie réparée impeccablement. On ne voit plus la rayure.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Pierre D.', text: "Révision complète à prix juste. Pas de travaux inutiles proposés.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Sandrine H.', text: "Climatisation rechargée et nettoyée. Parfait pour l'été.", rating: 5, date: 'Il y a 2 mois' }
  ],
  nettoyage: [
    { author: 'Mme Bernard', text: "Appartement rendu impeccable après déménagement. Propreté impeccable !", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'M. Leroy', text: "Bureaux entreprise nettoyés tous les soirs. Service fiable et discret.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Famille Dubois', text: "Nettoyage après travaux. Poussière et débris partout enlevés. Bravo !", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Mme Petit', text: "Canapé et moquettes nettoyés à domicile. Comme neuf, odeurs disparues.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'M. Moreau', text: "Vitres immeuble 4 étages sans traces. Équipe courageuse !", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Mme Roux', text: "Désinfection complète post-covid. Rassurant et professionnel.", rating: 5, date: 'Il y a 2 mois' }
  ],
  jardin: [
    { author: 'M. Fontaine', text: "Jardin totalement transformé. Un vrai havre de paix maintenant !", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Mme Chevalier', text: "Taille de haies millimétrée. Géométrie parfaite et nettoyé.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'M. Lambert', text: "Terrasse bois rénovée et traitée. Protégée pour des années.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Mme Simon', text: "Massif fleuri créé de A à Z. Plantes parfaitement adaptées.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'M. Roussel', text: "Pelouse semée et arrosage automatique installé. Zéro entretien !", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Mme Garnier', text: "Élagage dangereux d'un grand chêne. Pro sans risques.", rating: 5, date: 'Il y a 2 mois' }
  ],
  fitness: [
    { author: 'Nicolas V.', text: "Programme perte de poids efficace -8kg en 3 mois. Coach motivant !", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Caroline M.', text: "Remise en forme post-grossesse adaptée. Exercices sur mesure.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Alexandre K.', text: "Préparation marathon réussie. Temps visé atteint grâce au suivi.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Émilie R.', text: "Cours collectifs dynamiques. Ambiance top et résultats garantis.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Julien B.', text: "Nutrition + sport = résultats durables. Accompagnement complet.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Sophie G.', text: "Musculation sans blessure grâce aux conseils techniques.", rating: 5, date: 'Il y a 2 mois' }
  ],
  medical: [
    { author: 'M. Durand', text: "Consultation à l'écoute et diagnostic précis. Enfin un médecin disponible !", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Mme Lefebvre', text: "Kiné compétente pour ma rééducation genou. Progrès rapides.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'M. Michel', text: "Dentiste doux et patient. Phobie du dentiste vaincue !", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Mme Fournier', text: "Infirmière à domicile régulière et professionnelle. Rassurante.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'M. Girard', text: "Pédicure soignante pour diabétique. Extrêmement précautionneuse.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Mme Bonnet', text: "Ostéo qui soulage enfin mes maux de dos chroniques. Un soulagement !", rating: 5, date: 'Il y a 2 mois' }
  ],
  avocat: [
    { author: 'M. Lemaire', text: "Divorce compliqué géré avec professionnalisme et empathie.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Mme Duval', text: "Succès en appel pour mon licenciement abusif. Défense exemplaire !", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'M. Bernard', text: "Contrat commercial rédigé avec précision. Zéro zone grise.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Mme Morin', text: "Succession familiale débloquée rapidement. Fin des conflits.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'M. Petit', text: "Conseil fiscal pertinent qui m'a fait économiser beaucoup.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Mme Giraud', text: "Défense pénale efficace. Acquittement obtenu. Excellence !", rating: 5, date: 'Il y a 2 mois' }
  ],
  default: [
    { author: 'Emma L.', text: "Une expérience tout simplement majestueuse, du premier contact jusqu'à la réalisation. Je recommande les yeux fermés.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Arthur D.', text: "Service d'excellence du début à la fin. Une équipe professionnelle, à l'écoute et ponctuelle.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Sophie M.', text: "Je recommande vivement cette entreprise : travail soigné, devis clair et suivi impeccable.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Lucas P.', text: "Professionnalisme et expertise remarquables. On sent le savoir-faire à chaque étape.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Marie B.', text: "Un service client irréprochable, réactif et bienveillant. Merci pour votre sérieux.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Thomas R.', text: "Excellence et qualité au rendez-vous. Le résultat dépasse mes attentes, bravo !", rating: 5, date: 'Il y a 2 mois' }
  ]
};

function getSectorFallbackReviews(sector: string): Array<{ author: string; text: string; rating: number; date: string }> {
  const normalizedSector = (sector || '').toLowerCase();
  for (const [key, reviews] of Object.entries(SECTOR_FALLBACK_REVIEWS)) {
    if (normalizedSector.includes(key)) return reviews;
  }
  return SECTOR_FALLBACK_REVIEWS.default;
}

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
  formKey?: string;
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
      { title: 'Avis 4.8/5', icon: 'star' },
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
      { title: 'Équipe Qualifiée', icon: 'clock' },
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
      { title: 'Équipe Qualifiée', icon: 'badge-check' },
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

export function generateUltimateSite(lead: any, aiContent?: any): string {
  const template = getUltimateTemplate(lead.sector);
  const companyName = lead.name || 'Entreprise Premium';
  const city = capitalizeCity(lead.city || '');
  const phone = lead.phone || '+33 6 12 34 56 78';
  const email = lead.email || 'contact@entreprise.fr';
  const address = lead.address || (city ? `Centre Ville, ${city}` : 'France');
  const rating = lead.googleRating || 5;
  const reviews = lead.googleReviews || 42;
  const description = generateAboutText(aiContent?.aboutText || lead.description || template.aboutText, lead);
  const heroTitle = aiContent?.heroTitle || template.heroTitle;
  const heroSubtitle = aiContent?.heroSubtitle || `${template.heroSubtitle}${city ? ' à ' + city : ''}`;
  let ctaText = aiContent?.cta || template.ctaText || 'Demander un devis';
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
      text: review.text.trim(),
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
  const fallbackReviews = getSectorFallbackReviews(lead.sector);
  while (testimonials.length < 6) testimonials.push(fallbackReviews[testimonials.length % fallbackReviews.length]);
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
  const finalSlogan = aiContent?.slogan || sloganVariations[combinedHash % sloganVariations.length];

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
  const content: UltimateContent = {
    companyName, sector: lead.sector || 'Professionnel', city, description, phone, email, address,
    website: lead.website || '', rating, reviews, services: finalServices, serviceImages, galleryImages, testimonials,
    heroTitle, heroSubtitle, aboutText: description, ctaText, slogan: finalSlogan, heroImage, allImages,
    hours: lead.hours || lead.serperHours || '', establishedYear: lead.establishedYear
  };

  const layoutVariant = combinedHash % 4;
  return buildUltimateHTML(content, template, combinedImages, layoutVariant);
}

export async function generateUltimateSiteAsync(lead: any, aiContent?: any, pexelsKey?: string, web3formsKey?: string): Promise<string> {
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
  const description = generateAboutText(aiContent?.aboutText || lead.description || (lang === 'en' ? template.aboutTextEn : template.aboutText), lead);
  const heroTitle = aiContent?.heroTitle || (lang === 'en' ? template.heroTitleEn : template.heroTitle);
  const heroSubtitle = aiContent?.heroSubtitle || `${lang === 'en' ? template.heroSubtitleEn : template.heroSubtitle}${city ? (lang === 'en' ? ' in ' : ' à ') + city : ''}`;
  let ctaText = aiContent?.cta || (lang === 'en' ? template.ctaTextEn : template.ctaText) || (lang === 'en' ? 'Contact Us' : 'Contactez-nous');
  if (ctaText.split(/\s+/).filter(Boolean).length > 4 || ctaText.length > 30) {
    ctaText = (lang === 'en' ? template.ctaTextEn : template.ctaText) || (lang === 'en' ? 'Contact Us' : 'Contactez-nous');
  }

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
  const finalSlogan = aiContent?.slogan || (lang === 'en' ? sloganVariationsEn[combinedHash % sloganVariationsEn.length] : sloganVariationsFr[combinedHash % sloganVariationsFr.length]);

  const sectorImages = await getSectorImagesAsync(lead.sector, combinedHash);

  // Lighten accent for dark backgrounds — WCAG AA contrast ≥ 4.5:1
  const hexToRgb = (hex: string) => {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
  };
  const luminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };
  const contrastRatio = (l1: number, l2: number) => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };
  const lightenHex = (hex: string, factor: number) => {
    const [r, g, b] = hexToRgb(hex);
    return `rgb(${Math.min(255, Math.round(r + (255 - r) * factor))}, ${Math.min(255, Math.round(g + (255 - g) * factor))}, ${Math.min(255, Math.round(b + (255 - b) * factor))})`;
  };

  const darkBg = '#1a2744';
  const darkRgbArr = hexToRgb(darkBg);
  const darkLum = luminance(darkRgbArr[0], darkRgbArr[1], darkRgbArr[2]);
  const rawAccent = template.accent || '#6366f1';
  let accentOnDark = rawAccent;
  const accentRgbArr = hexToRgb(rawAccent);
  const accentLum = luminance(accentRgbArr[0], accentRgbArr[1], accentRgbArr[2]);
  if (contrastRatio(accentLum, darkLum) < 3.0) {
    let factor = 0.1;
    const lightenLum = (h: string, f: number) => {
      const a = hexToRgb(h);
      const lr = Math.min(255, Math.round(a[0] + (255 - a[0]) * f));
      const lg = Math.min(255, Math.round(a[1] + (255 - a[1]) * f));
      const lb = Math.min(255, Math.round(a[2] + (255 - a[2]) * f));
      return luminance(lr, lg, lb);
    };
    while (contrastRatio(lightenLum(rawAccent, factor), darkLum) < 4.5 && factor < 0.85) {
      factor += 0.05;
    }
    accentOnDark = lightenHex(rawAccent, factor);
  }

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
      text: review.text.trim(),
      rating: Math.min(5, Math.max(1, review.rating || 5)),
      date: normalizeReviewDate(review.date, lang)
    }));
  const seenTextsAsync = new Set<string>();
  testimonials = testimonials.filter((t: any) => {
    const normalized = t.text.toLowerCase().substring(0, 50);
    if (seenTextsAsync.has(normalized)) return false;
    seenTextsAsync.add(normalized);
    return true;
  });
  const fallbackReviews = getSectorFallbackReviews(lead.sector);
  while (testimonials.length < 6) testimonials.push(fallbackReviews[testimonials.length % fallbackReviews.length]);
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
    website: lead.website || '', rating, reviews, services: finalServices, serviceImages, galleryImages, realPhotos, testimonials,
    heroTitle, heroSubtitle, aboutText: description, ctaText, slogan: finalSlogan, heroImage, allImages,
    socialLinks, accentOnDark, hours: lead.hours || lead.serperHours || '', establishedYear: lead.establishedYear, formKey: web3formsKey
  };

  return buildUltimateHTML(content, template, allImages, combinedHash % 4);
}

function buildUltimateHTML(content: UltimateContent, template: any, combinedImages: string[] = [], layoutVariant: number = 0): string {
  const { companyName, heroTitle, heroSubtitle, aboutText, services, serviceImages, galleryImages, realPhotos, testimonials, phone, email, address, website, city, ctaText, rating, reviews, slogan, heroImage, allImages, galleryTitle, aboutTitle, servicesTitle, accentOnDark, hours: leadHours, establishedYear, formKey } = content;
  const lang = content.lang || 'fr';
  const ui = UI[lang];
  const cleanWebsite = (website || '').split('?')[0].split('#')[0] || '#';
  const sector = content.sector || '';
  const sectorCfg = getSectorConfig(sector);
  const hoursSummary = leadHours || `${ui.hoursLunVen} ${sectorCfg.defaultHours.weekdays} · ${ui.hoursSam} ${sectorCfg.defaultHours.saturday}`;
  const primaryColor = template.primary;
  const secondaryColor = template.secondary;
  const accentColor = template.accent;
  const hexToRgb = (hex: string) => { let r = 0, g = 0, b = 0; if (hex.length === 7) { r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16); } return `${r}, ${g}, ${b}`; };
  const primaryRgb = hexToRgb(primaryColor);

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
  const mapQuery = encodeURIComponent(address + (city ? ', ' + city : ''));

  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${primaryColor}"/><text x="50%" y="50%" font-family="sans-serif" font-size="45" font-weight="bold" fill="white" dominant-baseline="central" text-anchor="middle">${logoInfo.initials}</text></svg>`;
  const faviconDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(faviconSvg)}`;

  const companyHash = (() => { let h = 0; for (let i = 0; i < companyName.length; i++) { h = ((h << 5) - h) + companyName.charCodeAt(i); h |= 0; } return Math.abs(h); })();
  const emergencyFallback = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80';
  const allImgs = content.allImages || [];
  // Pool unique d'images ; on répartit hero / about / why / services sur des slots
  // DISTINCTS pour qu'aucune photo ne se répète en scrollant.
  const imageUniverse = Array.from(new Set([heroImage, ...allImgs, ...combinedImages].filter((u: string) => u && typeof u === 'string' && u.startsWith('https://'))));
  const heroPos = heroImage && imageUniverse.length ? imageUniverse.indexOf(heroImage) : 0;
  const orderedPool = imageUniverse.length
    ? [imageUniverse[heroPos], ...imageUniverse.slice(0, heroPos), ...imageUniverse.slice(heroPos + 1)]
    : [emergencyFallback];
  const aboutImg = orderedPool[1 % orderedPool.length];
  const whyImg = orderedPool[2 % orderedPool.length];
  const svcImgs: string[] = services.map((_: any, i: number) => orderedPool[(3 + i) % orderedPool.length]);
  const heroSectorFallback = orderedPool;
  const heroImgErr = `onerror="this.onerror=null;this.src='${proxiedImg(orderedPool[1 % orderedPool.length])}';this.style.opacity='0.7'"`;
  const imgErr = (fallbackSlot: number) => `onerror="this.onerror=null;this.src='${proxiedImg(orderedPool[fallbackSlot % orderedPool.length])}';this.style.opacity='0.8'"`;

  const fontPair = combinedHash % 4;
  const headingFont = fontPair === 0 ? "'DM Sans'" : fontPair === 1 ? "'Plus Jakarta Sans'" : fontPair === 2 ? "'Playfair Display'" : "'Cormorant Garamond'";

  const leadVariant = combinedHash % 5;
  const decoRotation = (combinedHash * 7) % 360;
  const decoScale = 0.8 + ((combinedHash * 3) % 40) / 100;
  const accentOpacity = 0.04 + ((combinedHash * 11) % 6) / 100;
  const sectionShape = combinedHash % 3;

  return `<!DOCTYPE html>
<html lang="${ui.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <link rel="icon" type="image/svg+xml" href="${faviconDataUrl}">
    <title>${companyName} - ${content.sector} à ${city}</title>
    <meta name="description" content="${heroSubtitle}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${cleanWebsite}">
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
    <link rel="alternate" hreflang="${ui.hreflang}" href="${cleanWebsite}">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"${sectorCfg.schemaOrg}","name":"${companyName}","description":"${heroSubtitle}","image":"${heroImage}","telephone":"${phone}","email":"${email}","address":{"@type":"PostalAddress","streetAddress":"${address}","addressLocality":"${city}","addressCountry":"FR"},"aggregateRating":{"@type":"AggregateRating","ratingValue":"${rating || 5}","reviewCount":"${reviews || 42}"}}}</script>
    <style>
        :root{--primary:${primaryColor};--primary-rgb:${primaryRgb};--secondary:${secondaryColor};--accent:${accentColor};--accent-dark:${accentOnDark};--bg:#fafaf9;--surface:#fff;--text:#1a1a2e;--text-s:#555770;--text-t:#8b8da3;--border:#e8e8ef;--border-l:#f2f2f7;--dark:#1a2744;--dark-rgb:26,39,68;--deco-rotation:${decoRotation}deg;--deco-scale:${decoScale};--accent-opacity:${accentOpacity};--section-shape:${sectionShape}}
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth;font-size:16px}
        body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);line-height:1.75;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden}
        img{max-width:100%;height:auto;display:block}
        h1,h2,h3,h4,h5{font-family:${headingFont},'DM Sans',sans-serif;line-height:1.25;font-weight:700;letter-spacing:-0.02em}
        .container{max-width:1400px;margin:0 auto;padding:0 32px}
        @media(max-width:768px){.container{padding:0 20px}}

        .navbar{position:fixed;top:36px;left:0;right:0;z-index:100;padding:12px 0;transition:all .4s cubic-bezier(.4,0,.2,1)}
        .navbar.scrolled{background:rgba(255,255,255,.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid var(--border);padding:10px 0;box-shadow:0 2px 30px rgba(0,0,0,.08)}
        .navbar-inner{max-width:1400px;margin:0 auto;padding:0 32px;display:flex;justify-content:space-between;align-items:center}
        .navbar-brand{display:flex;align-items:center;gap:14px;text-decoration:none;color:var(--text);transition:color .3s}
        .navbar:not(.scrolled) .navbar-brand{color:#fff}
        .navbar-logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;box-shadow:0 4px 15px rgba(var(--primary-rgb),.3);flex-shrink:0}
        .navbar-name{font-weight:700;font-size:1.05rem;color:var(--text);line-height:1.15;max-width:300px;transition:color .3s}
        .navbar:not(.scrolled) .navbar-name{color:#fff}
        .navbar-links{display:flex;align-items:center;gap:32px}
        .navbar-links a{text-decoration:none;color:var(--text-s);font-size:.9rem;font-weight:500;transition:color .25s;position:relative}
        .navbar:not(.scrolled) .navbar-links a{color:rgba(255,255,255,.85)}
        .navbar:not(.scrolled) .navbar-links a:hover{color:#fff}
        .navbar-links a:hover{color:var(--primary)}
        .navbar-cta{display:inline-flex;align-items:center;gap:8px;background:var(--primary);color:#fff!important;padding:11px 24px;border-radius:10px;font-weight:600;font-size:.9rem;transition:all .25s;box-shadow:0 4px 15px rgba(var(--primary-rgb),.25)}
        .navbar-cta:hover{opacity:.92;transform:translateY(-1px);box-shadow:0 6px 20px rgba(var(--primary-rgb),.35)}
        .mobile-toggle{display:none;background:none;border:none;cursor:pointer;padding:8px;border-radius:8px;transition:background .2s}
        .navbar:not(.scrolled) .mobile-toggle i{color:#fff}
        .mobile-toggle:hover{background:rgba(0,0,0,.05)}
        .mobile-menu{display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border-bottom:1px solid var(--border);padding:16px 24px;box-shadow:0 12px 40px rgba(0,0,0,.1)}
        .mobile-menu.open{display:block}
        .mobile-menu a{display:block;padding:14px 0;text-decoration:none;color:var(--text);font-weight:500;border-bottom:1px solid var(--border-l);font-size:.95rem}
        .mobile-menu a:last-child{border:none}
        @media(max-width:768px){.navbar-links{display:none!important}.mobile-toggle{display:block}}

        .hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:var(--dark)}
        .hero-bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.6;transition:opacity .6s}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(var(--dark-rgb),.7) 0%,rgba(var(--dark-rgb),.5) 40%,rgba(var(--dark-rgb),.8) 100%)}
        .hero-inner{position:relative;z-index:10;max-width:1400px;margin:0 auto;padding:130px 32px 80px;width:100%;display:grid;grid-template-columns:1fr 380px;gap:48px;align-items:center}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);padding:8px 20px;border-radius:100px;color:#fff;font-size:.8rem;font-weight:600;margin-bottom:24px;letter-spacing:.8px;text-transform:uppercase;backdrop-filter:blur(10px)}
        .hero h1{font-size:clamp(2.5rem,5.5vw,4.2rem);font-weight:800;color:#fff;margin-bottom:20px;letter-spacing:-.03em;line-height:1.1}
        .hero h1 em{font-style:normal;color:var(--accent-dark);position:relative}
        .hero-sub{font-size:1.15rem;color:rgba(255,255,255,.8);max-width:540px;margin-bottom:36px;line-height:1.8}
        .hero-actions{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:40px}
        .btn-pri{display:inline-flex;align-items:center;gap:10px;background:var(--primary);color:#fff;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:.95rem;transition:all .3s;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(var(--primary-rgb),.3)}
        .btn-pri:hover{transform:translateY(-2px);box-shadow:0 8px 35px rgba(var(--primary-rgb),.4)}
        .btn-sec{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);color:#fff;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:.95rem;transition:all .3s;backdrop-filter:blur(8px)}
        .btn-sec:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.35)}
        .hero-rating{display:flex;align-items:center;gap:10px}
        .hero-stars{display:flex;gap:2px;color:#fbbf24}
        .hero-rating-text{font-size:.88rem;color:rgba(255,255,255,.65)}

        .hero-card{background:rgba(255,255,255,.1);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:36px;color:#fff;box-shadow:0 8px 40px rgba(0,0,0,.15)}
        .hero-card-title{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:rgba(255,255,255,.5);margin-bottom:24px}
        .hero-hours{margin-bottom:28px}
        .hero-hours-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);font-size:.92rem}
        .hero-hours-row:last-child{border:none}
        .hero-hours-day{color:rgba(255,255,255,.7)}
        .hero-hours-time{font-weight:600}
        .hero-card .btn-pri{width:100%;justify-content:center;margin-top:18px}
        .hero-card-note{text-align:center;font-size:.78rem;color:rgba(255,255,255,.4);margin-top:12px}
        @media(max-width:900px){.hero-inner{grid-template-columns:1fr;padding:110px 20px 60px}.hero-card{display:none}.hero-actions{flex-direction:column;align-items:stretch}.btn-pri,.btn-sec{justify-content:center}}
        @media(max-width:480px){.hero h1{font-size:2rem}.hero-sub{font-size:1rem}.hero-badge{font-size:.7rem;padding:6px 16px}.hero-rating-text{font-size:.8rem}.hero-inner{padding:100px 16px 40px}}

        .trust-bar{background:#fff;border-bottom:1px solid var(--border);padding:22px 0}
        .trust-inner{display:flex;justify-content:center;align-items:center;gap:48px;flex-wrap:wrap}
        .trust-item{display:flex;align-items:center;gap:10px;font-size:.9rem;color:var(--text-s);font-weight:500}
        .trust-item i{color:var(--primary)}
        .trust-div{width:1px;height:24px;background:var(--border)}
        @media(max-width:768px){.trust-inner{gap:16px}.trust-div{display:none}}

        .section{padding:110px 0}
        .section-alt{background:#fff}
        .section-dark{background:var(--dark);color:#fff;padding:110px 0}
        .section-hdr{text-align:center;margin-bottom:72px}
        .section-hdr h2{font-size:clamp(1.8rem,4vw,2.85rem);font-weight:800;margin-bottom:18px;letter-spacing:-.03em}
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
        .about-text h2{font-size:clamp(1.55rem,3vw,2.3rem);font-weight:800;margin-bottom:18px;letter-spacing:-.02em}
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
        @media(min-width:769px){.stat-item:not(:last-child){border-right:1px solid rgba(255,255,255,.16)}}

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
        @media(max-width:768px){.svc-grid{grid-template-columns:1fr}.svc-card-img{height:200px}}

        .why-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
        .why-text h2{font-size:clamp(1.55rem,3vw,2.3rem);font-weight:800;color:#fff;margin-bottom:18px;letter-spacing:-.02em}
        .why-text>p{color:rgba(255,255,255,.75);margin-bottom:36px;font-size:1.02rem;line-height:1.8}
        .why-stats{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .why-stat{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:24px;text-align:center;transition:all .3s}
        .why-stat:hover{background:rgba(255,255,255,.12);transform:translateY(-3px)}
        .why-stat-num{font-size:1.85rem;font-weight:800;color:var(--accent);line-height:1}
        .why-stat-label{font-size:.78rem;color:rgba(255,255,255,.5);margin-top:8px;text-transform:uppercase;letter-spacing:1.2px}
        .why-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:40px 38px;backdrop-filter:blur(6px)}
        .why-card-rating{font-size:3.4rem;font-weight:800;line-height:1;color:#fff;font-family:${headingFont}}
        .why-card-rating span{font-size:1.4rem;opacity:.7;font-weight:600}
        .why-card-stars{display:flex;gap:3px;color:var(--accent);margin:10px 0 6px}
        .why-card-text{color:rgba(255,255,255,.72);font-size:.95rem;line-height:1.6}
        .why-card-div{height:1px;background:rgba(255,255,255,.12);margin:24px 0}
        .why-card-points{display:grid;gap:14px}
        .why-card-point{display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.88);font-weight:500;font-size:.98rem}
        .why-card-point i{color:var(--accent);flex-shrink:0}
        @media(max-width:768px){.why-grid{grid-template-columns:1fr;gap:44px}.why-card{padding:32px 26px}}

        .guar-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
        .guar-card{text-align:center;padding:32px 18px;border-radius:16px;border:1px solid var(--border);background:#fff;transition:all .35s}
        .guar-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.07)}
        .guar-icon{width:56px;height:56px;border-radius:50%;background:rgba(var(--primary-rgb),.08);display:flex;align-items:center;justify-content:center;color:var(--primary);margin:0 auto 16px}
        .guar-card h3{font-size:.92rem;font-weight:700;margin-bottom:8px}
        .guar-desc{font-size:.85rem;color:var(--text-s);line-height:1.6}

        .faq-wrap{max-width:820px;margin:0 auto}
        .faq-item{border:1px solid var(--border);border-radius:14px;margin-bottom:14px;background:#fff;overflow:hidden;transition:border-color .25s,box-shadow .25s}
        .faq-item.open{border-color:var(--primary);box-shadow:0 8px 30px rgba(var(--primary-rgb),.08)}
        .faq-q{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 26px;cursor:pointer;font-weight:600;font-size:1.02rem;width:100%;text-align:left;background:none;border:none;color:var(--text);font-family:inherit}
        .faq-q .faq-ico{color:var(--primary);flex-shrink:0;transition:transform .35s ease}
        .faq-item.open .faq-q .faq-ico{transform:rotate(45deg)}
        .faq-a-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows .4s ease}
        .faq-a-wrap>div{overflow:hidden}
        .faq-item.open .faq-a-wrap{grid-template-rows:1fr}
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

        .proc-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:28px;position:relative}
        .proc-grid::before{content:'';position:absolute;top:36px;left:10%;right:10%;height:2px;background:var(--border)}
        .proc-step{text-align:center;position:relative;z-index:1}
        .proc-num{width:68px;height:68px;border-radius:50%;border:3px solid var(--primary);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.3rem;margin:0 auto 18px;background:var(--bg);font-family:${headingFont};transition:all .3s}
        .proc-step:hover .proc-num{background:var(--primary);color:#fff}
        .proc-step h3{font-size:.98rem;font-weight:700;margin-bottom:8px}
        .proc-step p{font-size:.82rem;color:var(--text-s);line-height:1.6}
        @media(max-width:900px){.proc-grid{grid-template-columns:repeat(3,1fr)}.proc-grid::before{display:none}}
        @media(max-width:600px){.proc-grid{grid-template-columns:1fr 1fr;gap:20px}.proc-step p{font-size:.78rem}.proc-num{width:56px;height:56px;font-size:1.1rem}}

        .cta-banner{background:linear-gradient(135deg,var(--primary),var(--secondary));padding:90px 0;text-align:center;color:#fff;position:relative;overflow:hidden}
        .cta-banner::before{content:'';position:absolute;top:-50%;right:-20%;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,.06)}
        .cta-banner::after{content:'';position:absolute;bottom:-30%;left:-10%;width:400px;height:400px;border-radius:50%;background:rgba(255,255,255,.04)}
        .cta-banner h2{font-size:clamp(1.6rem,3.5vw,2.6rem);font-weight:800;margin-bottom:18px;letter-spacing:-.02em;position:relative;z-index:1}
        .cta-banner p{font-size:1.1rem;opacity:.88;margin-bottom:36px;max-width:520px;margin-left:auto;margin-right:auto;position:relative;z-index:1;line-height:1.7}
        .btn-cta{display:inline-flex;align-items:center;gap:10px;background:#fff;color:var(--primary);padding:18px 40px;border-radius:12px;text-decoration:none;font-weight:700;font-size:1.02rem;transition:all .3s;position:relative;z-index:1;box-shadow:0 4px 20px rgba(0,0,0,.15)}
        .btn-cta:hover{transform:translateY(-2px);box-shadow:0 8px 35px rgba(0,0,0,.2)}
        @media(max-width:768px){.cta-banner{padding:60px 0}.cta-banner h2{font-size:1.5rem}.btn-cta{padding:14px 28px;font-size:.95rem}}

        .devis-banner{background:linear-gradient(135deg,var(--primary),var(--secondary));padding:90px 0;text-align:center;color:#fff;position:relative;overflow:hidden}
        .devis-banner::before{content:'';position:absolute;top:-50%;left:-20%;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,.06)}
        .devis-banner .section-label{color:rgba(255,255,255,.7)}
        .devis-banner h2{font-size:clamp(1.6rem,3.5vw,2.6rem);font-weight:800;margin-bottom:18px;letter-spacing:-.02em;position:relative;z-index:1}
        .devis-banner p{color:rgba(255,255,255,.85);margin-bottom:36px;max-width:620px;margin-left:auto;margin-right:auto;line-height:1.7;position:relative;z-index:1}
        .devis-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:880px;margin:0 auto 40px;position:relative;z-index:1}
        .devis-card{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:16px;padding:30px 20px;backdrop-filter:blur(10px);transition:transform .3s,background .3s}
        .devis-card:hover{transform:translateY(-4px);background:rgba(255,255,255,.16)}
        .devis-ico{width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;color:#fff;margin:0 auto 16px}
        .devis-title{font-size:1.1rem;font-weight:700;color:#fff}
        .devis-label{font-size:.85rem;margin-top:8px;opacity:.85;line-height:1.5}
        @media(max-width:768px){.devis-banner{padding:60px 0}.devis-grid{grid-template-columns:1fr}}

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

        .reveal{opacity:0;transform:translateY(35px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)}
        .reveal.active{opacity:1;transform:translateY(0)}
        .reveal-d1{transition-delay:.12s}.reveal-d2{transition-delay:.24s}.reveal-d3{transition-delay:.36s}
        @media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}.stat-item{animation:none;opacity:1}.deco-circle,.deco-diamond,.deco-line,.deco-dot{animation:none!important}.hero-badge{animation:none!important}.cta-banner::before,.cta-banner::after{animation:none!important}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .hero-badge{animation:float 3s ease-in-out infinite}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .cta-banner{background-size:200% 100%;position:relative;overflow:hidden}
        .cta-banner::before{content:'';position:absolute;top:-50%;right:-20%;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,.06);animation:ctaFloat 8s ease-in-out infinite}
        .cta-banner::after{content:'';position:absolute;bottom:-30%;left:-10%;width:400px;height:400px;border-radius:50%;background:rgba(255,255,255,.04);animation:ctaFloat 10s ease-in-out infinite reverse}
        @keyframes ctaFloat{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,-20px) scale(1.05)}}
        .svc-card{transition:all .4s cubic-bezier(.4,0,.2,1)}
        .svc-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 20px 50px rgba(var(--primary-rgb),.15)}
        .gal-item{transition:all .5s cubic-bezier(.25,1,.5,1)}
        .gal-item:hover{transform:scale(1.02);box-shadow:0 12px 40px rgba(0,0,0,.15);z-index:2}
        .test-card{transition:all .4s cubic-bezier(.4,0,.2,1)}
        .test-card:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 16px 48px rgba(0,0,0,.08)}
        .proc-step{transition:all .3s}
        .proc-step:hover .proc-num{transform:scale(1.1);box-shadow:0 0 20px rgba(var(--primary-rgb),.3)}
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

        .proc-num{transition:all .4s cubic-bezier(.4,0,.2,1)}
        .proc-step:hover .proc-num{background:var(--primary);color:#fff;border-color:var(--primary);transform:scale(1.15) rotate(5deg);box-shadow:0 0 30px rgba(var(--primary-rgb),.3)}

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
            <div class="info-bar-item"><i data-lucide="clock" width="14"></i> ${hoursSummary}</div>
            ${rating ? `<div class="info-bar-item"><i data-lucide="star" width="14" fill="currentColor"></i> ${rating}/5 ${ui.testGoogle} (${reviews} ${ui.testAvis})</div>` : ''}
            ${phone ? `<div class="info-bar-item"><i data-lucide="phone" width="14"></i> <a href="tel:${cleanPhoneLink}">${phone}</a></div>` : ''}
            ${email ? `<div class="info-bar-item"><i data-lucide="mail" width="14"></i> <a href="mailto:${email}">${email}</a></div>` : ''}
            ${address ? `<div class="info-bar-item"><i data-lucide="map-pin" width="14"></i> ${address}${city ? ', ' + city : ''}</div>` : ''}
            <div class="info-bar-item"><i data-lucide="clock" width="14"></i> ${hoursSummary}</div>
            ${rating ? `<div class="info-bar-item"><i data-lucide="star" width="14" fill="currentColor"></i> ${rating}/5 ${ui.testGoogle} (${reviews} ${ui.testAvis})</div>` : ''}
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

    <section class="hero" id="hero">
        <img src="${proxiedImg(heroImage)}" ${heroImgErr} alt="${companyName}" class="hero-bg">
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
                    <div class="hero-rating"><div class="hero-stars">${Array(5).fill('<i data-lucide="star" fill="currentColor" width="16"></i>').join('')}</div><span class="hero-rating-text">${rating}/5 — ${reviews} ${ui.testGoogle}</span></div>
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
    </section>

    <main id="main-content">
    <div class="trust-bar">
        <div class="trust-inner">
            ${getTrustBar(content.sector, lang, rating).map((g: { title: string; icon: string }, i: number) => `
            <div class="trust-item"><i data-lucide="${g.icon}" width="16"></i> ${g.title}</div>
            ${i < 3 ? '<div class="trust-div"></div>' : ''}
            `).join('')}
        </div>
    </div>

    <section class="section" id="services">
        <div class="container" style="position:relative">
            <div class="section-deco deco-circle" style="width:200px;height:200px;top:-60px;right:${leadVariant % 2 === 0 ? '-80px' : 'auto'};left:${leadVariant % 2 !== 0 ? '-80px' : 'auto'};animation-delay:${leadVariant}s"></div>
            ${leadVariant % 2 === 0 ? '<div class="section-deco deco-line" style="width:180px;top:40%;left:-40px;animation-delay:2s"></div>' : ''}
            <div class="section-hdr reveal">
                <span class="section-label">${servicesTitle || ui.svcLabel}</span>
                <h2>${sectorCfg.ui.svcTitle[lang]}</h2>
                <p>${sectorCfg.ui.svcDesc[lang]}</p>
            </div>
            <div class="svc-grid">
                ${services.map((s, i) => {
                  const iconName = iconForService(s.name, content.sector) || sectorCfg.serviceIcons[i % sectorCfg.serviceIcons.length] || 'check-circle';
                return `
                <div class="svc-card reveal reveal-d${(i % 3) + 1}">
                    <img src="${proxiedImg(svcImgs[i] || heroImage)}" ${imgErr(0)} class="svc-card-img" alt="${s.name}" loading="lazy">
                    <div class="svc-card-body">
                        <div class="svc-icon"><i data-lucide="${iconName}" width="22" height="22"></i></div>
                        <h3>${s.name}</h3>
                        <p>${s.description}</p>
                        <a href="#contact" class="svc-link">${ui.svcLink} <i data-lucide="arrow-right" width="14"></i></a>
                    </div>
                </div>`}).join('')}
            </div>
        </div>
    </section>

    <section class="section section-alt" id="about">
        <div class="container" style="position:relative">
            <div class="section-deco deco-diamond" style="top:-40px;${leadVariant % 3 === 0 ? 'left:-30px' : leadVariant % 3 === 1 ? 'right:-30px' : 'left:50%;margin-left:-60px'};animation-delay:${leadVariant * 2}s"></div>
            ${leadVariant > 1 ? '<div class="section-deco deco-dot" style="top:20%;right:10%;animation-delay:1.5s"></div>' : ''}
            <div class="about-grid">
                <div class="about-img reveal">
                    <img src="${proxiedImg(aboutImg)}" ${imgErr(2)} alt="${companyName}" loading="lazy">
                    <div class="about-badge"><div class="about-badge-num">${establishedYear ? (new Date().getFullYear() - establishedYear) + '+' : sectorCfg.aboutBadge.value}</div><div class="about-badge-text">${establishedYear ? (lang === 'en' ? 'Years Experience' : 'Ans d\'expérience') : sectorCfg.aboutBadge.label[lang]}</div></div>
                </div>
                <div class="about-text reveal">
                    <span class="section-label">${aboutTitle || ui.aboutLabel}</span>
                    <h2>${content.aboutTitle || ui.aboutTitle || template.heroTitle} — ${city || companyName}</h2>
                    <p>${aboutText}</p>
                    <ul class="about-checks">
                        ${getAboutPoints(content.sector, lang).map(p => `<li><i data-lucide="check-circle-2" width="18"></i> ${p}</li>`).join('')}
                    </ul>
                    <a href="#contact" class="btn-pri">${ctaText} <i data-lucide="arrow-right" width="16"></i></a>
                </div>
            </div>
        </div>
    </section>

    <section class="section-dark" id="why">
        <div class="container">
            <div class="why-grid">
                <div class="why-text reveal">
                <span class="section-label">${ui.whyLabel}</span>
                ${(() => { const wc = getWhyContent(content.sector, lang, city, companyName); return `<h2>${wc.title}</h2><p>${wc.text}</p>`; })()}
                <a href="#contact" class="btn-pri" style="margin-top:24px">${ctaText} <i data-lucide="arrow-right" width="16"></i></a>
                </div>
                <div class="why-card reveal">
                    <div class="why-card-rating">${rating}<span>/5</span></div>
                    <div class="why-card-stars">${Array(5).fill('<i data-lucide="star" fill="currentColor" width="16"></i>').join('')}</div>
                    <div class="why-card-text">${rating ? (lang === 'en' ? `Based on ${reviews} verified Google reviews` : `Issu de ${reviews} avis Google vérifiés`) : (lang === 'en' ? 'Trusted by our clients' : 'La confiance de nos clients')}</div>
                    <div class="why-card-div"></div>
                    <div class="why-card-points">
                        ${getWhyPoints(content.sector, lang).map(p => `<div class="why-card-point"><i data-lucide="check" width="16"></i> ${p}</div>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div class="stats" style="background:var(--primary)">
        ${sectorCfg.stats.map((s, i) => {
          const raw = i === 0 ? (rating + '/5') : s.value;
          const m = String(raw).match(/^([\d.]+)(.*)$/);
          if (!m) {
            const safeRaw = String(raw).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<div class="stat-item"><div class="stat-num">${safeRaw}</div><div class="stat-label">${s.label[lang]}</div></div>`;
          }
          const num = parseFloat(m[1]);
          const suffix = m[2];
          const dec = (m[1].includes('.')) ? m[1].split('.')[1].length : 0;
          return `<div class="stat-item"><div class="stat-num" data-count="${num}" data-dec="${dec}" data-suffix="${suffix}">0${suffix}</div><div class="stat-label">${s.label[lang]}</div></div>`;
        }).join('')}
    </div>

    <section class="section section-alt" id="process">
        <div class="container" style="position:relative">
            <div class="section-deco deco-circle" style="width:160px;height:160px;bottom:-40px;${leadVariant % 2 === 0 ? 'right:-60px' : 'left:-60px'};animation-delay:${leadVariant + 3}s"></div>
            <div class="section-hdr reveal">
                <span class="section-label">${ui.procLabel}</span>
                <h2>${ui.procTitle}</h2>
                <p>${ui.procDesc}</p>
            </div>
            <div class="proc-grid">
                ${getProcessSteps(content.sector, lang).map((step, i) => `
                <div class="proc-step reveal reveal-d${Math.min(i, 3)}"><div class="proc-num">0${i + 1}</div><h3>${step.title}</h3><p>${step.desc}</p></div>
                `).join('')}
            </div>
            <div style="text-align:center;margin-top:40px"><a href="#contact" class="btn-pri">${ctaText} <i data-lucide="arrow-right" width="16"></i></a></div>
        </div>
    </section>

    <section class="section" id="pourquoi">
        <div class="container" style="position:relative">
            ${leadVariant % 2 === 0 ? '<div class="section-deco deco-line" style="width:200px;bottom:20%;right:-60px;animation-delay:3s"></div>' : ''}
            <div class="section-deco deco-dot" style="top:10%;${leadVariant % 2 === 0 ? 'left:5%' : 'right:5%'};animation-delay:${leadVariant}s"></div>
            <div class="section-hdr reveal">
                <span class="section-label">${lang === 'en' ? 'Our Promise' : 'La promesse'}</span>
                <h2>${lang === 'en' ? 'Our Commitments' : 'Nos Engagements'}</h2>
                <p>${lang === 'en' ? 'The concrete guarantees we stand behind on every job, in your sector like the others.' : 'Les garanties concrètes que nous honorons sur chaque intervention, dans votre secteur comme les autres.'}</p>
            </div>
            <div class="guar-grid reveal">
                ${getGuarantees(content.sector, lang, rating).map((g: any, i: number) => `
                <div class="guar-card reveal-d${Math.min(i, 3)}">
                    <div class="guar-icon"><i data-lucide="${g.icon}" width="24" height="24"></i></div>
                    <h3>${g.title}</h3>
                    <p class="guar-desc">${ADV_DESC[g.icon]?.[lang] || (lang === 'en' ? 'A commitment we stand behind' : 'Un engagement que nous honorons')}</p>
                </div>`).join('')}
            </div>
        </div>
    </section>

    <section class="section section-alt" id="testimonials">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.testLabel}</span>
                <h2>${ui.testTitle}</h2>
                <p>${ui.testDesc}</p>
            </div>
            <div class="test-grid">
                ${testimonials.slice(0,6).map((t,i) => `
                <div class="test-card reveal reveal-d${(i % 3) + 1}">
                    <div><div class="test-stars">${Array(t.rating).fill('<i data-lucide="star" fill="currentColor" width="15"></i>').join('')}</div><p class="test-text">"${t.text}"</p></div>
                    <div class="test-author"><div class="test-avatar">${t.author.charAt(0)}</div><div><div class="test-name">${t.author}</div>${t.date?`<div class="test-date">${t.date}</div>`:''}</div></div>
                </div>`).join('')}
            </div>
            <div class="test-google reveal"><i data-lucide="star" fill="#f59e0b" width="20" class="test-google-star"></i><div><strong>${rating}/5 ${ui.testGoogle}</strong><div style="font-size:.8rem;color:var(--text-s)">${ui.testBasé} ${reviews} ${ui.testAvis}</div></div></div>
        </div>
    </section>

    <section class="section section-alt" id="faq">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">FAQ</span>
                <h2>${lang === 'en' ? 'Frequently Asked Questions' : 'Questions fréquentes'}</h2>
                <p>${lang === 'en' ? `Everything you need to know before calling ${companyName}.` : `Tout ce qu'il faut savoir avant de faire appel à ${companyName}.`}</p>
            </div>
            <div class="faq-wrap reveal">
                ${getFaq(content.sector, lang, city, rating ?? 5, reviews ?? 0).map(f => `
                <div class="faq-item">
                    <button type="button" class="faq-q" aria-expanded="false">${f.q} <i data-lucide="plus" width="18" class="faq-ico"></i></button>
                    <div class="faq-a-wrap"><div class="faq-a">${f.a}</div></div>
                </div>`).join('')}
            </div>
        </div>
    </section>

    <section class="devis-banner" id="devis-banner">
        <div class="container reveal">
            <span class="section-label">${lang === 'en' ? 'Free Quote' : 'Devis gratuit'}</span>
            <h2>${lang === 'en' ? 'Get your free quote' : 'Demandez votre devis gratuit'}</h2>
            <p>${lang === 'en' ? `${companyName} sends you a detailed, no-obligation quote before any work begins.` : `${companyName} vous communique un devis détaillé et sans engagement avant tout travail.`}</p>
            <div class="devis-grid">
                <div class="devis-card"><div class="devis-ico"><i data-lucide="file-text" width="26"></i></div><div class="devis-title">${lang === 'en' ? 'Free quote' : 'Devis gratuit'}</div><div class="devis-label">${lang === 'en' ? 'Detailed, no obligation' : 'Détaillé, sans engagement'}</div></div>
                <div class="devis-card"><div class="devis-ico"><i data-lucide="clock" width="26"></i></div><div class="devis-title">${lang === 'en' ? 'Fast response' : 'Réponse rapide'}</div><div class="devis-label">${lang === 'en' ? 'Within 2 business hours' : 'Sous 2h ouvrées'}</div></div>
                <div class="devis-card"><div class="devis-ico"><i data-lucide="badge-check" width="26"></i></div><div class="devis-title">${lang === 'en' ? 'Certified pros' : 'Artisans certifiés'}</div><div class="devis-label">${lang === 'en' ? 'Qualified & insured' : 'Qualifiés et assurés'}</div></div>
            </div>
            <a href="#contact" class="btn-cta">${lang === 'en' ? 'Request my free quote' : 'Demander mon devis gratuit'} <i data-lucide="arrow-right" width="18"></i></a>
        </div>
    </section>

    <section class="cta-banner">
        <div class="container reveal">
            <h2>${ui.ctaTitle}</h2>
            <p>${ui.ctaDesc}</p>
            <a href="#contact" class="btn-cta">${ctaText} <i data-lucide="arrow-right" width="18"></i></a>
        </div>
    </section>

    <section class="section" id="contact">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.contactLabel}</span>
                <h2>${ui.contactTitle}</h2>
                <p>${ui.contactDesc}</p>
            </div>
            <div class="contact-map reveal" style="margin-bottom:36px">
                <iframe src="https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <div class="contact-wrap reveal">
                <div class="contact-form">
                    <h3>${sectorCfg.ui.contactTitle[lang]}</h3>
                    <p>${ui.formDesc}</p>
                    <form action="https://api.web3forms.com/submit" method="POST" id="contact-form" onsubmit="return (function(f){var k=f.querySelector('[name=access_key]').value;if(!k){return true}event.preventDefault();var b=f.querySelector('.form-submit');b.disabled=true;b.innerHTML='${lang === 'en' ? 'Sending…' : 'Envoi…'}';fetch('https://api.web3forms.com/submit',{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}}).then(function(r){return r.json()}).then(function(d){if(d.success){b.innerHTML='${lang === 'en' ? 'Message sent ✓' : 'Message envoyé ✓'}';b.style.background='#16a34a';b.style.color='#fff'}else{throw new Error('e')}}).catch(function(){b.innerHTML='${lang === 'en' ? 'Error — please call us' : 'Erreur — appelez-nous'}';b.disabled=false});return false})(this)">
                        <input type="hidden" name="access_key" value="${formKey || ''}">
                        <input type="hidden" name="_captcha" value="false">
                        <input type="hidden" name="subject" value="${lang === 'en' ? 'New website request — ' : 'Nouvelle demande via le site — '}${companyName}">
                        <input type="hidden" name="from_name" value="${companyName}">
                        ${sectorCfg.formFields.map(field => {
                          if (field.type === 'textarea') {
                            return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><textarea class="form-control" name="${field.name}" rows="4" placeholder="${field.placeholder[lang]}" ${field.required ? 'required' : ''}></textarea></div>`;
                          }
                          if (field.type === 'select' && field.options) {
                            return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><select class="form-control" name="${field.name}" ${field.required ? 'required' : ''}><option value="">${field.placeholder[lang]}</option>${field.options.map(opt => `<option value="${opt.fr}">${opt[lang]}</option>`).join('')}</select></div>`;
                          }
                          return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><input class="${field.type}" class="form-control" name="${field.name}" placeholder="${field.placeholder[lang]}" ${field.required ? 'required' : ''}></div>`;
                        }).join('')}
                        <button type="submit" class="form-submit"><i data-lucide="send" width="16"></i> ${ui.formSubmit}</button>
                        <p class="form-note">${formKey ? ui.formNote : (lang === 'en' ? 'Form not configured — please call us.' : 'Formulaire non configuré — appelez-nous.')}</p>
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
        </div>
    </section>
    </main>

    <footer>
        <div class="container">
            <div class="footer-grid">
                <div>
                    <div class="footer-brand"><div class="footer-brand-logo"><i data-lucide="${heroBadge.icon}" width="18" height="18"></i></div><span class="footer-brand-text">${logoInfo.text}</span></div>
                    <p class="footer-desc">${aboutText}</p>
                    <div class="footer-social">
                        ${content.socialLinks?.facebook ? `<a href="${content.socialLinks.facebook}" target="_blank" rel="noopener" aria-label="Facebook"><i data-lucide="facebook" width="18"></i></a>` : ''}
                        ${content.socialLinks?.instagram ? `<a href="${content.socialLinks.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><i data-lucide="instagram" width="18"></i></a>` : ''}
                        ${content.socialLinks?.linkedin ? `<a href="${content.socialLinks.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn"><i data-lucide="linkedin" width="18"></i></a>` : ''}
                        ${content.socialLinks?.twitter ? `<a href="${content.socialLinks.twitter}" target="_blank" rel="noopener" aria-label="Twitter"><i data-lucide="twitter" width="18"></i></a>` : ''}
                        ${content.socialLinks?.youtube ? `<a href="${content.socialLinks.youtube}" target="_blank" rel="noopener" aria-label="YouTube"><i data-lucide="youtube" width="18"></i></a>` : ''}
                        ${content.socialLinks?.tiktok ? `<a href="${content.socialLinks.tiktok}" target="_blank" rel="noopener" aria-label="TikTok"><i data-lucide="music" width="18"></i></a>` : ''}
                        <a href="https://maps.google.com/?q=${mapQuery}" target="_blank" rel="noopener" aria-label="Google Maps"><i data-lucide="map-pin" width="18"></i></a>
                        ${cleanWebsite && cleanWebsite !== '#' ? `<a href="${cleanWebsite}" target="_blank" rel="noopener" aria-label="Site web"><i data-lucide="globe" width="18"></i></a>` : ''}
                    </div>
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

    ${phone ? `<a href="tel:${cleanPhoneLink}" class="float-urgent"><i data-lucide="alarm-clock" width="18"></i> ${(() => { const s = (content.sector || '').toLowerCase(); if (s.includes('électr') || s.includes('electric') || s.includes('plomb') || s.includes('chauffage') || s.includes('garage') || s.includes('mécan') || s.includes('auto')) return lang === 'en' ? '24/7 Emergency' : '⚡ Urgence 24h/24'; return lang === 'en' ? 'Get a Free Quote' : 'Devis gratuit'; })()}</a>` : ''}

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
        // Stats count-up animation
        const statNums = document.querySelectorAll('.stat-num[data-count]');
        const runCount = (el) => {
          const target = parseFloat(el.getAttribute('data-count')) || 0;
          const dec = parseInt(el.getAttribute('data-dec') || '0', 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const dur = 1400; const start = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - start) / dur);
            const val = target * (1 - Math.pow(1 - p, 3));
            el.textContent = (dec > 0 ? val.toFixed(dec) : Math.round(val).toString()) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        };
        if ('IntersectionObserver' in window && statNums.length) {
          const so = new IntersectionObserver((es) => { es.forEach(e => { if (e.isIntersecting) { runCount(e.target); so.unobserve(e.target); } }); }, { threshold: 0.4 });
          statNums.forEach((el) => so.observe(el));
        } else {
          statNums.forEach((el) => runCount(el));
        }
        // FAQ accordion
        document.querySelectorAll('.faq-q').forEach((btn) => {
          btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const open = item.classList.toggle('open');
            btn.setAttribute('aria-expanded', String(open));
          });
        });
    </script>
</body>
</html>`;
}
