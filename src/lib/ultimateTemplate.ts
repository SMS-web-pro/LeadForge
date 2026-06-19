// ── PREMIUM LOCAL BUSINESS TEMPLATE ──
// Design épuré, luxe, professionnel. Zero gimmicks, zero popups agressifs.

import { getSectorImages } from './pexelsImages';
import { getImagesForLead } from './pexelsApi';

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
    { author: 'Emma L.', text: "Une expérience tout simplement majestueuse...", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Arthur D.', text: "Service d'excellence du début à la fin...", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Sophie M.', text: "Je recommande vivement cette entreprise...", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Lucas P.', text: "Professionnalisme et expertise remarquables...", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Marie B.', text: "Un service client irréprochable...", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Thomas R.', text: "Excellence et qualité au rendez-vous...", rating: 5, date: 'Il y a 2 mois' }
  ]
};

function getSectorFallbackReviews(sector: string): Array<{ author: string; text: string; rating: number; date: string }> {
  const normalizedSector = (sector || '').toLowerCase();
  for (const [key, reviews] of Object.entries(SECTOR_FALLBACK_REVIEWS)) {
    if (normalizedSector.includes(key)) return reviews;
  }
  return SECTOR_FALLBACK_REVIEWS.default;
}

function generateAboutText(templateText: string, lead: any): string {
  let years = 'plusieurs';
  if (lead.establishedYear && typeof lead.establishedYear === 'number') {
    const currentYear = new Date().getFullYear();
    const calculatedYears = currentYear - lead.establishedYear;
    if (calculatedYears > 0 && calculatedYears < 100) years = calculatedYears.toString();
  } else if (lead.description) {
    const yearMatch = lead.description.match(/(\d+)\s*ans?\s+d['']exp[eé]rience/i);
    if (yearMatch) years = yearMatch[1];
  }
  return templateText.replace(/depuis plus de 15 ans/gi, `depuis ${years} ans`)
                     .replace(/15 ans d['']exp[eé]rience/gi, `${years} ans d'expérience`);
}

function generateFeaturesFromService(name: string, description: string, sector: string): string[] {
  const serviceName = (name || '').toLowerCase();
  const serviceDesc = (description || '').toLowerCase();
  const defaultFeatures = ['Service professionnel', 'Intervention garantie', 'Devis gratuit'];
  const featureDictionary: Record<string, string[]> = {
    'urgence': ['Disponible 24h/24', 'Intervention rapide', 'Déplacement inclus'],
    'depannage': ['Réparation durable', 'Pièces garanties', 'Tarifs transparents'],
    'installation': ['Pose certifiée', 'Conformité normes', 'Garantie décennale'],
    'chauffage': ['Économies énergie', 'Installation propre', 'Entretien annuel'],
    'sanitaire': ['Matériel qualité', 'Finitions soignées', 'Délai respecté'],
    'mise aux normes': ['Conformité NFC 15-100', 'Certification Consuel', 'Sécurité garantie'],
    'domotique': ['Configuration incluse', 'App smartphone', 'Support technique'],
    'éclairage': ['Design moderne', 'LED économique', 'Installation discrète'],
    'coupe': ['Visagisme personnalisé', 'Conseil entretien', 'Produits adaptés'],
    'coloration': ['Coloration végétale', 'Protection cheveux', 'Brillance longue durée'],
    'barbier': ['Rasage précis', 'Soins barbe', 'Ambiance masculine'],
    'menu': ['Produits frais', 'Cuisine maison', 'Accord mets-vins'],
    'livraison': ['Emballage qualité', 'Livraison rapide', 'Commande en ligne'],
    'moteur': ['Diagnostic précis', 'Réparation garantie', "Pièces d'origine"],
    'pneus': ['Montage rapide', 'Géométrie 3D', 'Stockage hiver'],
    'carrosserie': ['Peinture neuve', 'Débosselage sans peinture', 'Garantie vie'],
    'ménage': ['Produits écologiques', 'Équipe formée', 'Intervention régulière'],
    'vitres': ['Sans traces garanti', 'Accès difficile', 'Sécurité maximale'],
    'désinfection': ['Produits certifiés', 'Zones sensibles', 'Certificat fourni'],
    'taille': ['Forme parfaite', 'Évacuation déchets', 'Santé végétaux'],
    'pelouse': ['Semence adaptée', 'Arrosage auto', 'Entretien minime'],
    'coaching': ['Programme personnalisé', 'Suivi nutrition', 'Résultats mesurables'],
    'musculation': ['Technique sécurisée', 'Progression adaptée', 'Sans blessure'],
    'consultation': ["À l'écoute", 'Diagnostic précis', 'Disponibilité rapide'],
    'kiné': ['Rééducation active', 'Appareillage moderne', 'Progrès rapides'],
    'divorce': ['Discrétion totale', 'Médiation possible', 'Protection intérêts'],
    'contrat': ['Rédaction précise', 'Clauses protectrices', 'Relecture gratuite'],
  };
  for (const [keyword, features] of Object.entries(featureDictionary)) {
    if (serviceName.includes(keyword) || serviceDesc.includes(keyword)) return features;
  }
  const keywords = serviceDesc.match(/\b(installation|réparation|remplacement|rénovation|entretien|dépannage|conseil|sur-mesure|professionnel|certifié|garanti|rapide|qualité|économique)\b/g);
  if (keywords && keywords.length > 0) return keywords.slice(0, 3).map(k => k.charAt(0).toUpperCase() + k.slice(1) + ' garanti');
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
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
}

const SECTOR_ULTIMATE_TEMPLATES: Record<string, {
  primary: string; secondary: string; accent: string; background: string;
  services: Array<{ name: string; description: string; features: string[] }>;
  guarantees: Array<{ title: string; icon: string }>;
  heroTitle: string; heroSubtitle: string; aboutText: string; ctaText: string;
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
    heroTitle: 'Artisan Plombier', heroSubtitle: "De la fuite d'eau à la rénovation complète, un savoir-faire au service de vos installations",
    aboutText: "Plombier chauffagiste depuis plus de 15 ans, je mets mon savoir-faire au service de vos installations. Artisan passionné, je garantis un travail soigné, des délais respectés et des tarifs transparents.",
    ctaText: 'Demander un devis gratuit'
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
    heroTitle: 'Électricien Agréé', heroSubtitle: "Des installations sûres, conformes et durables pour votre habitat et votre entreprise",
    aboutText: "Électricien certifié Consuel avec 15 ans d'expérience. Je sécurise votre habitat grâce à des installations conformes et durables. Artisan sérieux, intervention rapide et devis transparent.",
    ctaText: 'Contactez-nous'
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
    heroTitle: 'Coiffeur Visagiste', heroSubtitle: "L'art de sublimer vos cheveux avec passion et expertise",
    aboutText: "Coiffeur passionné depuis 15 ans, je crée des looks qui vous ressemblent. Spécialiste du visagisme et des techniques modernes, je veille à la santé de vos cheveux avec des produits naturels et de qualité.",
    ctaText: 'Prendre rendez-vous'
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
    heroTitle: 'Restaurant Traditionnel', heroSubtitle: "Cuisine authentique et accueil chaleureux depuis 2009",
    aboutText: "Chef passionné depuis 15 ans, je cuisine avec cœur des plats généreux et savoureux. Produits frais du marché, recettes authentiques et ambiance conviviale vous attendent.",
    ctaText: 'Réserver une table'
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
      { title: 'Intervention Rapide', icon: 'clock' },
      { title: 'Véhicule de Courtoisie', icon: 'car' }
    ],
    heroTitle: 'Garage Automobile', heroSubtitle: "Mécanicien passionné, votre véhicule entre de bonnes mains",
    aboutText: "Mécanicien automobile depuis 15 ans, j'entretiens et répare toutes marques avec passion. Diagnostic précis, devis transparents et respect des délais.",
    ctaText: 'Demendez un RDV'
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
    heroTitle: 'Société de Nettoyage', heroSubtitle: "Propreté professionnelle et écologique pour vos espaces",
    aboutText: "Entreprise de nettoyage depuis 15 ans, nos équipes formées interviennent avec rigueur et discrétion. Produits écolabels, matériel professionnel et engagement qualité.",
    ctaText: 'Demander un devis'
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
    heroTitle: 'Jardinier Paysagiste', heroSubtitle: "Création et entretien de jardins uniques et harmonieux",
    aboutText: "Paysagiste passionné depuis 15 ans, je conçois et entretiens des espaces verts qui vivent au rythme des saisons.",
    ctaText: 'Demander un devis'
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
    heroTitle: 'Coach Sportif', heroSubtitle: "Votre coach personnel pour atteindre vos objectifs fitness",
    aboutText: "Coach sportif diplômé d'État avec 15 ans d'expérience. Programmes personnalisés pour perdre du poids, gagner en muscle ou préparer une compétition.",
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
      { title: 'Conventionné Secteur 1', icon: 'stethoscope' },
      { title: '3ème Payant', icon: 'credit-card' },
      { title: 'RDV sous 48h', icon: 'calendar' },
      { title: 'Équipe Pluridisciplinaire', icon: 'users' }
    ],
    heroTitle: 'Cabinet Médical', heroSubtitle: "Votre santé entre les mains de professionnels qualifiés",
    aboutText: "Médecin généraliste depuis 15 ans, je vous accueille dans un cabinet moderne et chaleureux. Écoute, diagnostic précis et suivi personnalisé.",
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
      { title: 'Avocat au Barreau', icon: 'scale' },
      { title: 'Consultation Privée', icon: 'shield' },
      { title: 'Défense Déterminée', icon: 'sword' },
      { title: 'Honoraires Transparent', icon: 'file-text' }
    ],
    heroTitle: 'Avocat à la Cour', heroSubtitle: "Conseil juridique personnalisé et défense de vos droits",
    aboutText: "Avocat inscrit au Barreau depuis 15 ans, je défends vos intérêts avec rigueur et détermination. Chaque dossier mérite une stratégie sur mesure.",
    ctaText: 'Prendre rendez-vous'
  },
  default: {
    primary: '#1e293b', secondary: '#334155', accent: '#475569', background: '#f8fafc',
    services: [
      { name: 'Prestation Sur Mesure', description: 'Services adaptés à vos besoins', features: ['Étude personnalisée', 'Devis détaillé', 'Écoute attentive'] },
      { name: 'Intervention Pro', description: 'Travail soigné et professionnel', features: ['Matériel adapté', 'Techniques actuelles', 'Respect des normes'] },
      { name: 'Conseil Expert', description: 'Accompagnement et recommandations', features: ['Diagnostic complet', 'Solutions pertinentes', 'Suivi personnalisé'] },
      { name: 'Service Rapide', description: 'Réactivité et respect des délais', features: ['Intervention rapide', 'Horaires flexibles', 'Urgences traitées'] },
      { name: 'Garantie Qualité', description: 'Engagement résultat et satisfaction', features: ['Contrôle qualité', 'Corrections incluses', 'SAV réactif'] },
      { name: 'Tarifs Transparents', description: 'Honoraires clairs et justifiés', features: ['Devis gratuit', 'Pas de surprise', 'Facilités paiement'] }
    ],
    guarantees: [
      { title: 'Artisan Certifié', icon: 'badge-check' },
      { title: 'Devis Gratuit', icon: 'file-text' },
      { title: 'Intervention Rapide', icon: 'clock' },
      { title: 'Satisfaction Garantie', icon: 'heart' }
    ],
    heroTitle: 'Artisan Professionnel', heroSubtitle: "Votre expert de confiance pour des prestations de qualité",
    aboutText: "Artisan passionné depuis 15 ans, je mets mon savoir-faire et mon expertise à votre service. Qualité, transparence et satisfaction sont mes priorités.",
    ctaText: 'Contactez-nous'
  }
};

function getUltimateTemplate(sector: string) {
  const s = (sector || '').toLowerCase();
  if (s.includes('nettoyag') || s.includes('propreté') || s.includes('ménage')) return SECTOR_ULTIMATE_TEMPLATES.nettoyage;
  if (s.includes('jardin') || s.includes('paysag') || s.includes('espaces verts')) return SECTOR_ULTIMATE_TEMPLATES.jardin;
  if (s.includes('coach') || s.includes('sport') || s.includes('fitness') || s.includes('salle')) return SECTOR_ULTIMATE_TEMPLATES.fitness;
  if (s.includes('médec') || s.includes('clinique') || s.includes('dentiste') || s.includes('santé')) return SECTOR_ULTIMATE_TEMPLATES.medical;
  if (s.includes('avocat') || s.includes('notaire') || s.includes('juridi') || s.includes('droit')) return SECTOR_ULTIMATE_TEMPLATES.avocat;
  if (s.includes('électricien') || s.includes('electricien') || s.includes('electric')) return SECTOR_ULTIMATE_TEMPLATES.electricien;
  if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim')) return SECTOR_ULTIMATE_TEMPLATES.plomberie;
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) return SECTOR_ULTIMATE_TEMPLATES.coiffeur;
  if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur')) return SECTOR_ULTIMATE_TEMPLATES.restaurant;
  if (s.includes('garage') || s.includes('mécan') || s.includes('auto') || s.includes('carrosserie')) return SECTOR_ULTIMATE_TEMPLATES.garage;
  if (s.includes('beauté') || s.includes('esthétique') || s.includes('spa')) return SECTOR_ULTIMATE_TEMPLATES.coiffeur;
  if (s.includes('boulanger') || s.includes('pâtissier')) return SECTOR_ULTIMATE_TEMPLATES.restaurant;
  return SECTOR_ULTIMATE_TEMPLATES.default;
}

function getLogoInfo(name: string, sector: string = 'default') {
  if (!name) return { initials: 'CO', text: 'Company', word1: 'Company', word2: 'Pro' };
  const skip = ['le', 'la', 'les', 'de', 'du', 'des', "l'", "d'", 'à', 'a', 'et', '&', 'en', 'pour'];
  const words = name.replace(/['']/g, "' ").split(/\s+/).filter(w => w.length > 0 && !skip.includes(w.toLowerCase()));
  let word1 = '', word2 = '';
  if (words.length === 1) {
    word1 = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    const lw = word1.toLowerCase(), s = sector.toLowerCase();
    if (s.includes('elec') && !lw.includes('elec')) word2 = 'Électricité';
    else if (s.includes('plomb') && !lw.includes('plomb')) word2 = 'Plomberie';
    else if ((s.includes('garage') || s.includes('auto')) && !lw.includes('auto') && !lw.includes('garage')) word2 = 'Automobile';
    else if (!lw.includes('service') && !lw.includes('pro')) word2 = 'Services';
  } else {
    word1 = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    word2 = words.slice(1).join(' ').charAt(0).toUpperCase() + words.slice(1).join(' ').slice(1).toLowerCase();
  }
  return { initials: word1.substring(0, 2).toUpperCase(), text: name, word1, word2 };
}

function capitalizeCity(city: string): string {
  if (!city) return city;
  return city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

function isEnglishText(text: string): boolean {
  if (!text) return false;
  const englishIndicators = ['the ', 'was ', 'very ', 'good ', 'great ', 'excellent ', 'highly ', 'recommend', 'amazing', 'professional', 'quick ', 'fast ', 'efficient', 'friendly', 'helpful', 'courteous', 'reasonable', 'price', 'work ', 'service', 'job '];
  const lowerText = text.toLowerCase();
  const matches = englishIndicators.filter(word => lowerText.includes(word));
  return matches.length >= 2;
}

function getHeroBadge(sector: string): { icon: string; text: string } {
  const s = (sector || '').toLowerCase();
  if (s.includes('plomb')) return { icon: 'droplets', text: 'Dépannage rapide garanti' };
  if (s.includes('électricien') || s.includes('electric')) return { icon: 'zap', text: 'Électricien certifié' };
  if (s.includes('coiff') || s.includes('barb')) return { icon: 'scissors', text: 'Coiffeur professionnel' };
  if (s.includes('restaurant') || s.includes('cuisin')) return { icon: 'chef-hat', text: 'Chef qualifié' };
  if (s.includes('garage') || s.includes('mécan')) return { icon: 'wrench', text: 'Garage agréé' };
  if (s.includes('nettoy') || s.includes('ménage')) return { icon: 'sparkles', text: 'Service nettoyage pro' };
  if (s.includes('jardin') || s.includes('paysag')) return { icon: 'leaf', text: 'Jardinier expert' };
  if (s.includes('fitness') || s.includes('sport')) return { icon: 'dumbbell', text: 'Coach diplômé' };
  if (s.includes('médec') || s.includes('santé') || s.includes('dentiste')) return { icon: 'stethoscope', text: 'Professionnel de santé' };
  if (s.includes('avocat') || s.includes('juridi')) return { icon: 'scale', text: 'Avocat au barreau' };
  return { icon: 'badge-check', text: 'Professionnel certifié' };
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
  const fallbackReviews = getSectorFallbackReviews(lead.sector);
  while (testimonials.length < 3) testimonials.push(fallbackReviews[testimonials.length % fallbackReviews.length]);
  testimonials = testimonials.slice(0, 3);

  let nameHash = 0;
  for (let i = 0; i < companyName.length; i++) nameHash += companyName.charCodeAt(i);
  const sloganVariations = ["L'excellence à votre service", "L'art de la perfection au quotidien", "Solutions premium sur-mesure", "Excellence & Passion", "Votre partenaire de confiance"];
  const finalSlogan = aiContent?.slogan || sloganVariations[nameHash % sloganVariations.length];

  const BLOCKED_KEYWORDS = ['food', 'fruit', 'legume', 'carrot', 'salmon', 'kitchen', 'cooking', 'recipe', 'meal', 'dessert', 'cake', 'pizza', 'burger', 'restaurant-menu', 'portrait', 'face', 'selfie', 'person', 'man ', 'woman ', 'people', 'crowd', 'group', 'logo', 'badge', 'stamp', 'seal', 'emblem', 'watermark', 'text-overlay', 'gradient-overlay', 'phone number', 'tel:', 'numero'];
  const BLOCKED_DOMAINS = ['tripadvisor.com', 'yelp.com', 'facebook.com', 'instagram.com', 'pagesjaunes.fr', 'google.com', 'gstatic.com', 'cloudfront.net', 'googleusercontent.com', 'maps.google', 'lh3.', 'ggpht.com', 'googleapis.com'];

  const sectorImages = getSectorImages(lead.sector);
  const heroImage = sectorImages[nameHash % sectorImages.length];

  const rawLeadImages = [...(lead.images || []), ...(lead.websiteImages || [])].filter(img => {
    if (!img || typeof img !== 'string' || !img.startsWith('https://')) return false;
    if (img === heroImage) return false;
    const low = img.toLowerCase();
    if (BLOCKED_KEYWORDS.some(kw => low.includes(kw))) return false;
    if (BLOCKED_DOMAINS.some(d => low.includes(d))) return false;
    if (low.includes('favicon') || low.includes('sprite') || low.includes('pixel')) return false;
    return true;
  }).slice(0, 3);

  const combinedImages = [heroImage, ...sectorImages.filter(s => s !== heroImage).slice(0, 2), ...rawLeadImages];
  const allImages = combinedImages.slice(0, 5);

  const socialLinks = lead.socialLinks || {};
  const content: UltimateContent = {
    companyName, sector: lead.sector || 'Professionnel', city, description, phone, email, address,
    website: lead.website || '', rating, reviews, services: finalServices, testimonials,
    heroTitle, heroSubtitle, aboutText: description, ctaText, slogan: finalSlogan, heroImage, allImages,
    socialLinks
  };

  const layoutVariant = nameHash % 4;
  return buildUltimateHTML(content, template, combinedImages, layoutVariant);
}

export async function generateUltimateSiteAsync(lead: any, aiContent?: any): Promise<string> {
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

  let nameHash = 0;
  for (let i = 0; i < companyName.length; i++) nameHash += companyName.charCodeAt(i);
  const sloganVariations = ["L'excellence à votre service", "L'art de la perfection au quotidien", "Solutions premium sur-mesure", "Excellence & Passion", "Votre partenaire de confiance"];
  const finalSlogan = aiContent?.slogan || sloganVariations[nameHash % sloganVariations.length];

  const sectorImages = getSectorImages(lead.sector);
  const heroImage = sectorImages[nameHash % sectorImages.length];

  let combinedImages: string[] = [];
  try {
    const raw = await getImagesForLead(lead, 6);
    const BLOCKED = ['googleusercontent', 'maps.google', 'ggpht', 'favicon', 'sprite', 'pixel', 'logo', 'badge'];
    combinedImages = raw.filter((img: string) => {
      if (!img || !img.startsWith('https://')) return false;
      if (img === heroImage) return false;
      const low = img.toLowerCase();
      return !BLOCKED.some(kw => low.includes(kw));
    }).slice(0, 3);
  } catch {}

  const allImages = [...sectorImages.filter(s => s !== heroImage).slice(0, 2), ...combinedImages].slice(0, 5);

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
  const seenTextsAsync = new Set<string>();
  testimonials = testimonials.filter((t: any) => {
    const normalized = t.text.toLowerCase().substring(0, 50);
    if (seenTextsAsync.has(normalized)) return false;
    seenTextsAsync.add(normalized);
    return true;
  });
  const fallbackReviews = getSectorFallbackReviews(lead.sector);
  while (testimonials.length < 3) testimonials.push(fallbackReviews[testimonials.length % fallbackReviews.length]);
  testimonials = testimonials.slice(0, 3);

  const socialLinks = lead.socialLinks || {};
  const content: UltimateContent = {
    companyName, sector: lead.sector || 'Professionnel', city, description, phone, email, address,
    website: lead.website || '', rating, reviews, services: finalServices, testimonials,
    heroTitle, heroSubtitle, aboutText: description, ctaText, slogan: finalSlogan, heroImage, allImages,
    socialLinks
  };

  return buildUltimateHTML(content, template, combinedImages, nameHash % 4);
}

function buildUltimateHTML(content: UltimateContent, template: any, combinedImages: string[] = [], layoutVariant: number = 0): string {
  const { companyName, heroTitle, heroSubtitle, aboutText, services, testimonials, phone, email, address, website, city, ctaText, rating, reviews, slogan, heroImage, allImages } = content;
  const primaryColor = template.primary;
  const secondaryColor = template.secondary;
  const accentColor = template.accent;
  const hexToRgb = (hex: string) => { let r = 0, g = 0, b = 0; if (hex.length === 7) { r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16); } return `${r}, ${g}, ${b}`; };
  const primaryRgb = hexToRgb(primaryColor);

  let nameHash = 0;
  for (let i = 0; i < companyName.length; i++) nameHash += companyName.charCodeAt(i);

  const logoInfo = getLogoInfo(companyName, content.sector);
  const heroBadge = getHeroBadge(content.sector);
  const cleanPhoneLink = phone ? phone.replace(/[^0-9+]/g, '') : '';
  const mapQuery = encodeURIComponent(address + (city ? ', ' + city : ''));

  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${primaryColor}"/><text x="50%" y="50%" font-family="sans-serif" font-size="45" font-weight="bold" fill="white" dominant-baseline="central" text-anchor="middle">${logoInfo.initials}</text></svg>`;
  const faviconDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(faviconSvg)}`;

  const companyHash = (() => { let h = 0; for (let i = 0; i < companyName.length; i++) { h = ((h << 5) - h) + companyName.charCodeAt(i); h |= 0; } return Math.abs(h); })();
  const emergencyFallback = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';
  const allImgs = content.allImages || [];
  const usedImages = new Set<string>();
  const getImg = (slot: number): string => {
    const candidates = [...combinedImages, ...allImgs].filter(img => img && img.startsWith('https://') && !usedImages.has(img));
    if (candidates.length > 0) {
      const selected = candidates[(companyHash + slot) % candidates.length];
      usedImages.add(selected);
      return selected;
    }
    const fallbackPool = [...combinedImages, ...allImgs].filter(img => img && img.startsWith('https://'));
    if (fallbackPool.length > 0) return fallbackPool[slot % fallbackPool.length];
    return emergencyFallback;
  };
  const imgErr = (fallbackSlot: number) => `onerror="this.onerror=null;this.src='${getImg(fallbackSlot)}';this.style.opacity='0.8'"`;

  const fontPair = nameHash % 4;
  const headingFont = fontPair === 0 ? "'DM Sans'" : fontPair === 1 ? "'Plus Jakarta Sans'" : fontPair === 2 ? "'Playfair Display'" : "'Cormorant Garamond'";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="${faviconDataUrl}">
    <title>${companyName} - ${content.sector} à ${city}</title>
    <meta name="description" content="${heroSubtitle}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${website || '#'}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${companyName} - ${content.sector}">
    <meta property="og:description" content="${heroSubtitle}">
    <meta property="og:image" content="${heroImage}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${companyName}">
    <meta name="twitter:description" content="${heroSubtitle}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"${companyName}","description":"${heroSubtitle}","image":"${heroImage}","telephone":"${phone}","email":"${email}","address":{"@type":"PostalAddress","streetAddress":"${address}","addressLocality":"${city}","addressCountry":"FR"},"aggregateRating":{"@type":"AggregateRating","ratingValue":"${rating || 5}","reviewCount":"${reviews || 42}"}}}</script>
    <style>
        :root{--primary:${primaryColor};--primary-rgb:${primaryRgb};--secondary:${secondaryColor};--accent:${accentColor};--bg:#fafaf9;--surface:#fff;--text:#1a1a2e;--text-s:#555770;--text-t:#8b8da3;--border:#e8e8ef;--border-l:#f2f2f7;--dark:#1a2744;--dark-rgb:26,39,68}
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth;font-size:16px}
        body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);line-height:1.75;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden}
        img{max-width:100%;height:auto;display:block}
        h1,h2,h3,h4,h5{font-family:${headingFont},'DM Sans',sans-serif;line-height:1.25;font-weight:700;letter-spacing:-0.02em}
        .container{max-width:1200px;margin:0 auto;padding:0 24px}

        .navbar{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 0;transition:all .4s cubic-bezier(.4,0,.2,1)}
        .navbar.scrolled{background:rgba(255,255,255,.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid var(--border);padding:10px 0;box-shadow:0 2px 30px rgba(0,0,0,.08)}
        .navbar-inner{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;justify-content:space-between;align-items:center}
        .navbar-brand{display:flex;align-items:center;gap:14px;text-decoration:none;color:var(--text);transition:color .3s}
        .navbar:not(.scrolled) .navbar-brand{color:#fff}
        .navbar-logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;box-shadow:0 4px 15px rgba(var(--primary-rgb),.3);flex-shrink:0}
        .navbar-name{font-weight:700;font-size:1.15rem;color:var(--text);white-space:nowrap;transition:color .3s}
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
        .hero-inner{position:relative;z-index:10;max-width:1200px;margin:0 auto;padding:140px 24px 80px;width:100%;display:grid;grid-template-columns:1fr 380px;gap:48px;align-items:center}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);padding:8px 20px;border-radius:100px;color:#fff;font-size:.8rem;font-weight:600;margin-bottom:24px;letter-spacing:.8px;text-transform:uppercase;backdrop-filter:blur(10px)}
        .hero h1{font-size:clamp(2.5rem,5.5vw,4.2rem);font-weight:800;color:#fff;margin-bottom:20px;letter-spacing:-.03em;line-height:1.1}
        .hero h1 em{font-style:normal;color:var(--accent);position:relative}
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
        @media(max-width:900px){.hero-inner{grid-template-columns:1fr;padding:120px 20px 60px}.hero-card{display:none}.hero-actions{flex-direction:column;align-items:stretch}.btn-pri,.btn-sec{justify-content:center}}

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
        .section-dark .section-hdr p{color:rgba(255,255,255,.6)}
        .section-label{display:inline-block;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:var(--primary);margin-bottom:14px}
        .section-dark .section-label{color:var(--accent)}

        .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
        .about-img{border-radius:20px;overflow:hidden;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.12)}
        .about-img img{width:100%;height:420px;object-fit:cover;display:block}
        .about-badge{position:absolute;bottom:-20px;right:28px;background:var(--primary);color:#fff;padding:20px 28px;border-radius:16px;text-align:center;box-shadow:0 12px 32px rgba(var(--primary-rgb),.35)}
        .about-badge-num{font-size:2rem;font-weight:800;line-height:1}
        .about-badge-text{font-size:.72rem;text-transform:uppercase;letter-spacing:1.2px;opacity:.85;margin-top:4px}
        .about-text h2{font-size:clamp(1.55rem,3vw,2.3rem);font-weight:800;margin-bottom:18px;letter-spacing:-.02em}
        .about-text>p{color:var(--text-s);margin-bottom:22px;font-size:1.02rem;line-height:1.8}
        .about-checks{list-style:none;display:grid;gap:14px;margin-bottom:32px}
        .about-checks li{display:flex;align-items:center;gap:12px;font-weight:500;font-size:.97rem}
        .about-checks i{color:var(--primary);flex-shrink:0}
        @media(max-width:768px){.about-grid{grid-template-columns:1fr;gap:44px}.about-img img{height:300px}}

        .stats{padding:64px 0;display:grid;grid-template-columns:repeat(4,1fr);gap:36px;text-align:center;color:#fff}
        .stat-num{font-size:3.2rem;font-weight:800;line-height:1;margin-bottom:10px;font-family:${headingFont}}
        .stat-label{font-size:.82rem;text-transform:uppercase;letter-spacing:1.8px;opacity:.7;font-weight:600}
        @media(max-width:768px){.stats{grid-template-columns:1fr 1fr;padding:44px 24px;gap:28px}}

        .svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
        .svc-card{background:#fff;border:1px solid var(--border);border-radius:18px;padding:36px 28px;transition:all .35s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden}
        .svc-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--primary);transform:scaleX(0);transition:transform .35s;transform-origin:left}
        .svc-card:hover{border-color:var(--primary);box-shadow:0 12px 40px rgba(var(--primary-rgb),.1);transform:translateY(-6px)}
        .svc-card:hover::before{transform:scaleX(1)}
        .svc-icon{width:52px;height:52px;border-radius:14px;background:rgba(var(--primary-rgb),.08);display:flex;align-items:center;justify-content:center;color:var(--primary);margin-bottom:18px}
        .svc-card h3{font-size:1.12rem;font-weight:700;margin-bottom:8px}
        .svc-card p{color:var(--text-s);font-size:.92rem;margin-bottom:16px;line-height:1.6}
        .svc-link{display:inline-flex;align-items:center;gap:6px;color:var(--primary);font-weight:600;font-size:.88rem;text-decoration:none;transition:gap .25s}
        .svc-link:hover{gap:10px}
        @media(max-width:768px){.svc-grid{grid-template-columns:1fr}}

        .why-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
        .why-text h2{font-size:clamp(1.55rem,3vw,2.3rem);font-weight:800;color:#fff;margin-bottom:18px;letter-spacing:-.02em}
        .why-text>p{color:rgba(255,255,255,.65);margin-bottom:36px;font-size:1.02rem;line-height:1.8}
        .why-stats{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .why-stat{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:24px;text-align:center;transition:all .3s}
        .why-stat:hover{background:rgba(255,255,255,.12);transform:translateY(-3px)}
        .why-stat-num{font-size:1.85rem;font-weight:800;color:var(--accent);line-height:1}
        .why-stat-label{font-size:.78rem;color:rgba(255,255,255,.5);margin-top:8px;text-transform:uppercase;letter-spacing:1.2px}
        .why-img{position:relative;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.2)}
        .why-img img{width:100%;height:420px;object-fit:cover;display:block}
        .why-img-badge{position:absolute;bottom:24px;right:24px;background:var(--primary);color:#fff;padding:20px 28px;border-radius:16px;text-align:center;box-shadow:0 12px 32px rgba(0,0,0,.3)}
        .why-img-badge-num{font-size:2.2rem;font-weight:800;line-height:1}
        .why-img-badge-text{font-size:.72rem;text-transform:uppercase;letter-spacing:1.2px;opacity:.85;margin-top:4px}
        @media(max-width:768px){.why-grid{grid-template-columns:1fr;gap:44px}.why-img{order:-1}}

        .guar-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
        .guar-card{text-align:center;padding:32px 18px;border-radius:16px;border:1px solid var(--border);background:#fff;transition:all .35s}
        .guar-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.07)}
        .guar-icon{width:56px;height:56px;border-radius:50%;background:rgba(var(--primary-rgb),.08);display:flex;align-items:center;justify-content:center;color:var(--primary);margin:0 auto 16px}
        .guar-card h3{font-size:.92rem;font-weight:700}
        @media(max-width:768px){.guar-grid{grid-template-columns:1fr 1fr}}

        .gal-grid{display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:260px 260px;gap:12px}
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
        @media(max-width:768px){.test-grid{grid-template-columns:1fr}}

        .proc-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:28px;position:relative}
        .proc-grid::before{content:'';position:absolute;top:36px;left:10%;right:10%;height:2px;background:var(--border)}
        .proc-step{text-align:center;position:relative;z-index:1}
        .proc-num{width:68px;height:68px;border-radius:50%;border:3px solid var(--primary);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.3rem;margin:0 auto 18px;background:var(--bg);font-family:${headingFont};transition:all .3s}
        .proc-step:hover .proc-num{background:var(--primary);color:#fff}
        .proc-step h3{font-size:.98rem;font-weight:700;margin-bottom:8px}
        .proc-step p{font-size:.82rem;color:var(--text-s);line-height:1.6}
        @media(max-width:768px){.proc-grid{grid-template-columns:repeat(3,1fr)}.proc-grid::before{display:none}}

        .cta-banner{background:linear-gradient(135deg,var(--primary),var(--secondary));padding:90px 0;text-align:center;color:#fff;position:relative;overflow:hidden}
        .cta-banner::before{content:'';position:absolute;top:-50%;right:-20%;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,.06)}
        .cta-banner::after{content:'';position:absolute;bottom:-30%;left:-10%;width:400px;height:400px;border-radius:50%;background:rgba(255,255,255,.04)}
        .cta-banner h2{font-size:clamp(1.6rem,3.5vw,2.6rem);font-weight:800;margin-bottom:18px;letter-spacing:-.02em;position:relative;z-index:1}
        .cta-banner p{font-size:1.1rem;opacity:.88;margin-bottom:36px;max-width:520px;margin-left:auto;margin-right:auto;position:relative;z-index:1;line-height:1.7}
        .btn-cta{display:inline-flex;align-items:center;gap:10px;background:#fff;color:var(--primary);padding:18px 40px;border-radius:12px;text-decoration:none;font-weight:700;font-size:1.02rem;transition:all .3s;position:relative;z-index:1;box-shadow:0 4px 20px rgba(0,0,0,.15)}
        .btn-cta:hover{transform:translateY(-2px);box-shadow:0 8px 35px rgba(0,0,0,.2)}

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
        .contact-card-item i{color:var(--accent)}
        .contact-card-item a{color:inherit;text-decoration:none;transition:color .2s}
        .contact-card-item a:hover{color:#fff}
        .contact-map{border-radius:18px;overflow:hidden;border:1px solid var(--border);min-height:280px}
        .contact-map iframe{width:100%;height:100%;min-height:280px;border:none}
        @media(max-width:768px){.contact-wrap{grid-template-columns:1fr}.form-row{grid-template-columns:1fr}}

        footer{background:var(--dark);color:#fff;padding:70px 0 32px}
        .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1.5fr;gap:44px;margin-bottom:44px}
        .footer-brand{font-size:1.25rem;font-weight:800;margin-bottom:12px}
        .footer-desc{font-size:.9rem;color:rgba(255,255,255,.5);line-height:1.8;margin-bottom:20px}
        .footer-social{display:flex;gap:12px}
        .footer-social a{width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;transition:all .25s}
        .footer-social a:hover{background:rgba(255,255,255,.15);transform:translateY(-2px)}
        .footer-col h4{font-size:.82rem;font-weight:700;margin-bottom:18px;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,255,255,.4)}
        .footer-col ul{list-style:none}
        .footer-col li{margin-bottom:10px}
        .footer-col a{color:rgba(255,255,255,.6);text-decoration:none;font-size:.9rem;transition:color .25s}
        .footer-col a:hover{color:#fff}
        .footer-contact-item{display:flex;align-items:center;gap:12px;margin-bottom:12px;color:rgba(255,255,255,.65);font-size:.9rem}
        .footer-contact-item i{color:var(--accent)}
        .footer-bottom{border-top:1px solid rgba(255,255,255,.1);padding-top:24px;text-align:center;font-size:.82rem;color:rgba(255,255,255,.3)}

        .float-urgent{position:fixed;bottom:28px;right:28px;z-index:90;display:inline-flex;align-items:center;gap:10px;background:var(--primary);color:#fff;padding:16px 28px;border-radius:100px;text-decoration:none;font-weight:700;font-size:.92rem;box-shadow:0 8px 35px rgba(var(--primary-rgb),.4);transition:all .3s;animation:pulse-urgent 2.5s infinite}
        .float-urgent:hover{transform:translateY(-3px);box-shadow:0 12px 45px rgba(var(--primary-rgb),.5)}
        @keyframes pulse-urgent{0%,100%{box-shadow:0 8px 35px rgba(var(--primary-rgb),.4)}50%{box-shadow:0 8px 35px rgba(var(--primary-rgb),.6),0 0 0 10px rgba(var(--primary-rgb),.1)}}

        .reveal{opacity:0;transform:translateY(35px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)}
        .reveal.active{opacity:1;transform:translateY(0)}
        .reveal-d1{transition-delay:.12s}.reveal-d2{transition-delay:.24s}.reveal-d3{transition-delay:.36s}
        @media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}}
    </style>
</head>
<body>
    <nav class="navbar" id="navbar">
        <div class="navbar-inner">
            <a href="#" class="navbar-brand">
                <div class="navbar-logo">${logoInfo.initials}</div>
                <span class="navbar-name">${logoInfo.text}</span>
            </a>
            <div class="navbar-links">
                <a href="#about">À propos</a>
                <a href="#services">Services</a>
                <a href="#why">Pourquoi nous</a>
                <a href="#testimonials">Avis</a>
                <a href="#contact">Contact</a>
                ${phone ? `<a href="tel:${cleanPhoneLink}" class="navbar-cta"><i data-lucide="phone" width="16"></i> ${phone}</a>` : ''}
            </div>
            <button class="mobile-toggle" id="mobile-toggle" aria-label="Menu"><i data-lucide="menu" width="24" height="24" style="color:var(--text)"></i></button>
        </div>
        <div class="mobile-menu" id="mobile-menu">
            <a href="#about">À propos</a>
            <a href="#services">Services</a>
            <a href="#why">Pourquoi nous</a>
            <a href="#testimonials">Avis</a>
            <a href="#contact">Contact</a>
            ${phone ? `<a href="tel:${cleanPhoneLink}" style="color:var(--primary);font-weight:700">${phone}</a>` : ''}
        </div>
    </nav>

    <section class="hero" id="hero">
        <img src="${heroImage}" ${imgErr(0)} alt="${companyName}" class="hero-bg">
        <div class="hero-overlay"></div>
        <div class="hero-inner">
            <div>
                <div class="hero-badge"><i data-lucide="${heroBadge.icon}" width="14"></i> ${heroBadge.text}</div>
                <h1>${heroTitle.replace(/\b(\w+)/g, (m: string, w: string, i: number) => i === 0 || i === 2 ? `<em>${w}</em>` : w)}</h1>
                <p class="hero-sub">${heroSubtitle}</p>
                <div class="hero-actions">
                    <a href="#contact" class="btn-pri">${ctaText} <i data-lucide="arrow-right" width="18"></i></a>
                    ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-sec"><i data-lucide="phone" width="18"></i> Appeler Maintenant</a>` : ''}
                </div>
                <div style="display:flex;gap:24px;flex-wrap:wrap">
                    <div class="hero-rating"><div class="hero-stars">${Array(5).fill('<i data-lucide="star" fill="currentColor" width="16"></i>').join('')}</div><span class="hero-rating-text">${rating}/5 — ${reviews} avis Google</span></div>
                </div>
            </div>
            <div class="hero-card">
                <div class="hero-card-title">Horaires & Urgences</div>
                <div class="hero-hours">
                    <div class="hero-hours-row"><span class="hero-hours-day">Lun – Ven</span><span class="hero-hours-time">08h00 – 18h00</span></div>
                    <div class="hero-hours-row"><span class="hero-hours-day">Samedi</span><span class="hero-hours-time">09h00 – 14h00</span></div>
                    <div class="hero-hours-row"><span class="hero-hours-day">Dimanche</span><span class="hero-hours-time" style="color:var(--accent)">Urgences uniquement</span></div>
                </div>
                ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-pri"><i data-lucide="phone" width="16"></i> ${phone}</a>` : ''}
                <div class="hero-card-note">Appel gratuit · Devis immédiat</div>
            </div>
        </div>
    </section>

    <div class="trust-bar">
        <div class="trust-inner">
            <div class="trust-item"><i data-lucide="badge-check" width="16"></i> Artisan Agréé</div>
            <div class="trust-div"></div>
            <div class="trust-item"><i data-lucide="zap" width="16"></i> Intervention Rapide</div>
            <div class="trust-div"></div>
            <div class="trust-item"><i data-lucide="file-text" width="16"></i> Devis Transparent</div>
            <div class="trust-div"></div>
            <div class="trust-item"><i data-lucide="shield-check" width="16"></i> Travaux Garantis</div>
        </div>
    </div>

    <section class="section" id="services">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">Ce que nous faisons</span>
                <h2>Nos Prestations</h2>
                <p>Des interventions professionnelles avec compétence et rigueur.</p>
            </div>
            <div class="svc-grid">
                ${services.map((s, i) => {
                  const serviceIcons = [
                    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
                    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
                    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
                    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
                    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
                    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
                  ];
                return `
                <div class="svc-card reveal reveal-d${(i % 3) + 1}">
                    <div class="svc-icon">${serviceIcons[i%6]}</div>
                    <h3>${s.name}</h3>
                    <p>${s.description}</p>
                    <a href="#contact" class="svc-link">En savoir plus <i data-lucide="arrow-right" width="14"></i></a>
                </div>`}).join('')}
            </div>
        </div>
    </section>

    <section class="section section-alt" id="about">
        <div class="container">
            <div class="about-grid">
                <div class="about-img reveal">
                    <img src="${getImg(1)}" ${imgErr(1)} alt="${companyName}">
                    <div class="about-badge"><div class="about-badge-num">15+</div><div class="about-badge-text">Ans d'expérience</div></div>
                </div>
                <div class="about-text reveal">
                    <span class="section-label">À propos de nous</span>
                    <h2>Artisan de Confiance au Cœur de ${city || 'votre région'}</h2>
                    <p>${aboutText}</p>
                    <ul class="about-checks">
                        <li><i data-lucide="check-circle-2" width="18"></i> Intervention d'urgence 7j/7</li>
                        <li><i data-lucide="check-circle-2" width="18"></i> Devis gratuit, sans engagement</li>
                        <li><i data-lucide="check-circle-2" width="18"></i> Matériaux certifiés et garantis</li>
                        <li><i data-lucide="check-circle-2" width="18"></i> Respect rigoureux des délais</li>
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
                    <span class="section-label">Pourquoi nous choisir ?</span>
                    <h2>La Différence d'un Vrai Professionnel</h2>
                    <p>Nous ne nous contentons pas de réparer — nous conseillons, anticipons et garantissons. Notre approche professionnelle alliée à des équipements modernes permet d'offrir un service sans compromis.</p>
                    <div class="why-stats">
                        <div class="why-stat"><div class="why-stat-num">24h</div><div class="why-stat-label">Service urgence</div></div>
                        <div class="why-stat"><div class="why-stat-num">100%</div><div class="why-stat-label">Devis honnêtes</div></div>
                        <div class="why-stat"><div class="why-stat-num">NF</div><div class="why-stat-label">Normes respectées</div></div>
                        <div class="why-stat"><div class="why-stat-num">0€</div><div class="why-stat-label">Frais de déplacement</div></div>
                    </div>
                </div>
                <div class="why-img reveal">
                    <img src="${getImg(2)}" ${imgErr(2)} alt="${companyName}">
                    <div class="why-img-badge"><div class="why-img-badge-num">98%</div><div class="why-img-badge-text">Satisfaction Client</div></div>
                </div>
            </div>
        </div>
    </section>

    <div class="stats" style="background:var(--primary)">
        <div class="stat-item"><div class="stat-num">${reviews || '100+'}</div><div class="stat-label">Chantiers Réalisés</div></div>
        <div class="stat-item"><div class="stat-num">15+</div><div class="stat-label">Ans d'Expérience</div></div>
        <div class="stat-item"><div class="stat-num">98%</div><div class="stat-label">Clients Satisfaits</div></div>
        <div class="stat-item"><div class="stat-num">30min</div><div class="stat-label">Délai d'Intervention</div></div>
    </div>

    <section class="section section-alt" id="process">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">Comment ça marche</span>
                <h2>Nos Démarches en 5 Étapes</h2>
                <p>Un processus clair et transparent du premier contact à la livraison finale.</p>
            </div>
            <div class="proc-grid">
                <div class="proc-step reveal"><div class="proc-num">01</div><h3>Contact</h3><p>Appelez-nous ou envoyez un message. Nous répondons sous 30 minutes.</p></div>
                <div class="proc-step reveal reveal-d1"><div class="proc-num">02</div><h3>Diagnostic</h3><p>Déplacement gratuit, diagnostic précis et évaluation de l'intervention.</p></div>
                <div class="proc-step reveal reveal-d2"><div class="proc-num">03</div><h3>Devis</h3><p>Devis détaillé, transparent et sans surprise, soumis pour approbation.</p></div>
                <div class="proc-step reveal reveal-d2"><div class="proc-num">04</div><h3>Intervention</h3><p>Réalisation des travaux dans les règles de l'art, avec matériaux de qualité.</p></div>
                <div class="proc-step reveal reveal-d3"><div class="proc-num">05</div><h3>Garantie</h3><p>Réception des travaux et suivi post-intervention avec garantie écrite.</p></div>
            </div>
            <div style="text-align:center;margin-top:40px"><a href="#contact" class="btn-pri">${ctaText} <i data-lucide="arrow-right" width="16"></i></a></div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">Nos réalisations</span>
                <h2>Galerie de Projets</h2>
                <p>Découvrez quelques-unes de nos réalisations récentes — chaque projet reflète notre engagement pour la qualité.</p>
            </div>
            <div class="gal-grid reveal">
                <div class="gal-item gal-main"><img src="${getImg(1)}" ${imgErr(1)} alt="Réalisation ${companyName}" loading="lazy"></div>
                <div class="gal-item"><img src="${getImg(2)}" ${imgErr(2)} alt="Réalisation ${companyName}" loading="lazy"></div>
                <div class="gal-item"><img src="${getImg(3)}" ${imgErr(3)} alt="Réalisation ${companyName}" loading="lazy"></div>
                <div class="gal-item"><img src="${getImg(4)}" ${imgErr(4)} alt="Réalisation ${companyName}" loading="lazy"></div>
                <div class="gal-item"><img src="${getImg(5)}" ${imgErr(5)} alt="Réalisation ${companyName}" loading="lazy"></div>
            </div>
        </div>
    </section>

    <section class="section section-alt" id="testimonials">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">Avis Clients</span>
                <h2>Ce que disent nos clients</h2>
                <p>La satisfaction de nos clients est notre meilleure carte de visite.</p>
            </div>
            <div class="test-grid">
                ${testimonials.slice(0,3).map((t,i) => `
                <div class="test-card reveal reveal-d${i+1}">
                    <div><div class="test-stars">${Array(t.rating).fill('<i data-lucide="star" fill="currentColor" width="15"></i>').join('')}</div><p class="test-text">"${t.text}"</p></div>
                    <div class="test-author"><div class="test-avatar">${t.author.charAt(0)}</div><div><div class="test-name">${t.author}</div>${t.date?`<div class="test-date">${t.date}</div>`:''}</div></div>
                </div>`).join('')}
            </div>
            <div class="test-google reveal"><i data-lucide="star" fill="#f59e0b" width="20" class="test-google-star"></i><div><strong>${rating}/5 sur Google</strong><div style="font-size:.8rem;color:var(--text-s)">Basé sur ${reviews} avis vérifiés</div></div></div>
        </div>
    </section>

    <section class="cta-banner">
        <div class="container reveal">
            <h2>Prêt à démarrer votre projet ?</h2>
            <p>Contactez-nous dès maintenant pour un devis gratuit et sans engagement.</p>
            <a href="#contact" class="btn-cta">${ctaText} <i data-lucide="arrow-right" width="18"></i></a>
        </div>
    </section>

    <section class="section" id="contact">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">Nous contacter</span>
                <h2>Demandez votre Devis Gratuit</h2>
                <p>Remplissez le formulaire ci-dessous ou appelez-nous directement. Réponse sous 30 minutes.</p>
            </div>
            <div class="contact-wrap reveal">
                <div class="contact-form">
                    <h3>Envoyez votre demande</h3>
                    <p>Nous vous répondrons dans les plus brefs délais.</p>
                    <form onsubmit="event.preventDefault();this.querySelector('.form-submit').textContent='Message envoyé ✓';this.querySelector('.form-submit').style.background='#16a34a'">
                        <div class="form-row"><div class="form-group"><label class="form-label">Nom complet *</label><input type="text" class="form-control" placeholder="Votre nom" required></div><div class="form-group"><label class="form-label">Téléphone *</label><input type="tel" class="form-control" placeholder="06 XX XX XX XX" required></div></div>
                        <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" placeholder="votre@email.com"></div>
                        <div class="form-group"><label class="form-label">Décrivez votre besoin *</label><textarea class="form-control" rows="4" placeholder="Décrivez le problème ou les travaux souhaités..." required></textarea></div>
                        <button type="submit" class="form-submit"><i data-lucide="send" width="16"></i> Envoyer ma Demande →</button>
                        <p class="form-note">Réponse garantie sous 30 minutes · Devis gratuit & sans engagement</p>
                    </form>
                </div>
                <div class="contact-sidebar">
                    <div class="contact-hours">
                        <h4><i data-lucide="clock" width="16" style="color:var(--primary)"></i> Horaires d'Ouverture</h4>
                        <div class="hours-row"><span class="hours-day">Lundi – Vendredi</span><span class="hours-time">08h00 – 18h00</span></div>
                        <div class="hours-row"><span class="hours-day">Samedi</span><span class="hours-time">09h00 – 14h00</span></div>
                        <div class="hours-row"><span class="hours-day">Dimanche</span><span class="hours-time" style="color:var(--accent)">Urgences uniquement</span></div>
                    </div>
                    <div class="contact-card">
                        <div class="contact-card-item"><i data-lucide="phone" width="16"></i> ${phone ? `<a href="tel:${cleanPhoneLink}">${phone}</a>` : 'Non renseigné'}</div>
                        <div class="contact-card-item"><i data-lucide="mail" width="16"></i> ${email ? `<a href="mailto:${email}">${email}</a>` : 'Non renseigné'}</div>
                        <div class="contact-card-item"><i data-lucide="map-pin" width="16"></i> ${address}</div>
                        ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-pri" style="margin-top:16px;width:100%;justify-content:center"><i data-lucide="phone" width="16"></i> Appel Urgent 24h/24</a>` : ''}
                    </div>
                </div>
            </div>
            <div class="contact-map reveal" style="margin-top:32px">
                <iframe src="https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
        </div>
    </section>

    <footer>
        <div class="container">
            <div class="footer-grid">
                <div>
                    <div class="footer-brand">${logoInfo.text}</div>
                    <p class="footer-desc">${aboutText.substring(0,120)}...</p>
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
                <div class="footer-col"><h4>Services</h4><ul>${services.slice(0,5).map(s=>`<li><a href="#services">${s.name}</a></li>`).join('')}</ul></div>
                <div class="footer-col"><h4>Navigation</h4><ul><li><a href="#about">À propos</a></li><li><a href="#why">Pourquoi nous</a></li><li><a href="#testimonials">Avis clients</a></li><li><a href="#contact">Contact</a></li></ul></div>
                <div class="footer-col"><h4>Contact Rapide</h4>
                    ${phone?`<div class="footer-contact-item"><i data-lucide="phone" width="14"></i> ${phone}</div>`:''}
                    ${email?`<div class="footer-contact-item"><i data-lucide="mail" width="14"></i> ${email}</div>`:''}
                    ${address?`<div class="footer-contact-item"><i data-lucide="map-pin" width="14"></i> ${address}</div>`:''}
                    ${phone?`<a href="tel:${cleanPhoneLink}" class="btn-pri" style="margin-top:12px;padding:10px 20px;font-size:.85rem;width:fit-content">Appel Urgent 24h/24</a>`:''}
                </div>
            </div>
            <div class="footer-bottom">&copy; ${new Date().getFullYear()} ${companyName}. Tous droits réservés. Créé par Services-Siteup.</div>
        </div>
    </footer>

    ${phone ? `<a href="tel:${cleanPhoneLink}" class="float-urgent"><i data-lucide="phone" width="18"></i> Appel Urgent 24h/24</a>` : ''}

    <script>
        lucide.createIcons();
        window.addEventListener('scroll',()=>{const n=document.getElementById('navbar');if(n)n.classList.toggle('scrolled',window.scrollY>50)});
        const t=document.getElementById('mobile-toggle'),m=document.getElementById('mobile-menu');
        if(t&&m){t.addEventListener('click',()=>m.classList.toggle('open'));m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>m.classList.remove('open')));document.addEventListener('click',e=>{if(!m.contains(e.target)&&!t.contains(e.target))m.classList.remove('open')})}
        if('IntersectionObserver' in window){const r=document.querySelectorAll('.reveal');const o=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('active');o.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -60px 0px'});r.forEach(el=>o.observe(el))}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('active'))}
        document.querySelectorAll('img').forEach(img=>{img.addEventListener('error',function(){this.style.opacity='.5';this.style.objectFit='contain';this.alt=this.alt||'Image non disponible'})});
    </script>
</body>
</html>`;
}
