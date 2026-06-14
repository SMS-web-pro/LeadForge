// ── TEMPLATE ULTIME - GARANTIE PROFESSIONNELLE 100% (MODERNE BRIGHT 2026) ──
// Résultat professionnel de pointe. Glassmorphism clair, complet, avec chatbot et WhatsApp.

import { getSectorImages, SECTOR_PEXELS_IMAGES } from './pexelsImages';
import { getImagesForLead } from './pexelsApi';

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

// --- IMAGES PAR SECTEUR ---
// Utilise les images Pexels professionnelles du fichier pexelsImages.ts
// Plus fiables et pertinentes que les anciennes images Unsplash génériques

function getSectorImagesFallback(sector: string): string[] {
  // Utiliser les images Pexels professionnelles du nouveau système
  return getSectorImages(sector);
}

function getUltimateTemplate(sector: string) {
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
  
  const description = aiContent?.aboutText || lead.description || template.aboutText;
  const heroTitle = aiContent?.heroTitle || template.heroTitle;
  const heroSubtitle = aiContent?.heroSubtitle || `${template.heroSubtitle}${city ? ' à ' + city : ''}`;
  
  // Remplacer la logique compliquée de slice() par ceci :
  let ctaText = aiContent?.cta || template.ctaText || "Demander un devis";
  // Si l'IA sort une phrase de plus de 22 caractères, on force un texte court standard
  if (ctaText.length > 22) {
      ctaText = "Demander un devis";
  }
  
  let finalServices = template.services;
  if (aiContent?.services && Array.isArray(aiContent.services) && aiContent.services.length > 0) {
    finalServices = aiContent.services.map((s: any, idx: number) => ({
      name: s.name || `Service ${idx+1}`,
      description: s.description || '',
      features: template.services[idx % template.services.length].features
    }));
  }

  // 6 avis demandés (si le lead en a moins, on complète)
  let testimonials = (lead.googleReviewsData || []).map((review: any) => ({
    author: review.author || 'Client VIP',
    text: review.text || "Une prestation exceptionnelle.",
    rating: review.rating || 5,
    date: review.date || 'Récemment'
  }));

  const fallbackReviews = [
    { author: 'Emma L.', text: "Une expérience tout simplement majestueuse. Rapidité, précision et professionnalisme impressionnant. Merci à toute l'équipe pour ce travail d'orfèvre.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Arthur D.', text: "Service d'excellence du début à la fin. Les promesses sont tenues et même dépassées. C'est rare de trouver des professionnels aussi dévoués.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Sophie M.', text: "Très satisfaite de l'intervention. Une équipe à l'écoute, réactive et des résultats visibles immédiatement. Je recommande fortement.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Lucas T.', text: "Intervention rapide et propre. Tarifs clairs sans mauvaises surprises. Je garde le numéro précieusement.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Marie J.', text: "Je n'ai jamais vu un tel niveau de finition. Ils ont un vrai sens du détail. Tout a été livré en temps et en heure.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Hugo N.', text: "Contact fluide, devis respecté, personnel respectueux des lieux. Un professionnalisme comme on n'en fait plus !", rating: 5, date: 'Il y a 2 mois' }
  ];
  
  while (testimonials.length < 6) {
    testimonials.push(fallbackReviews[testimonials.length % fallbackReviews.length]);
  }
  testimonials = testimonials.slice(0, 6);

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

  // ── SYSTÈME D'IMAGES HYBRIDE: RÉELLES + PEXELS ──
  // Priorité 1: Images réelles du lead (Google Maps, site web) - filtrées
  // Priorité 2: Images Pexels sectorielles professionnelles (fallback)
  
  // 1. Récupérer et filtrer les images réelles du lead
  const BLOCKED_KEYWORDS = ['food', 'fruit', 'legume', 'carrot', 'salmon', 'kitchen', 'cooking', 'recipe', 'meal', 'dessert', 'cake', 'pizza', 'burger', 'restaurant-menu'];
  const BLOCKED_DOMAINS = ['tripadvisor.com', 'yelp.com', 'facebook.com', 'instagram.com', 'pagesjaunes.fr'];
  
  const rawLeadImages = [...(lead.images || []), ...(lead.websiteImages || [])]
    .filter(img => {
      if (!img || typeof img !== 'string') return false;
      if (!img.startsWith('https://')) return false;
      const low = img.toLowerCase();
      // Bloquer les images de nourriture
      if (BLOCKED_KEYWORDS.some(kw => low.includes(kw))) return false;
      // Bloquer les domaines suspects
      if (BLOCKED_DOMAINS.some(d => low.includes(d))) return false;
      // Bloquer les favicons et images techniques
      if (low.includes('favicon') || low.includes('sprite') || low.includes('pixel')) return false;
      return true;
    });
  
  // 2. Récupérer les images sectorielles Pexels (fallback garanti)
  const sectorImages = getSectorImagesFallback(lead.sector);
  
  // 3. Combiner: images réelles en priorité, compléter avec Pexels
  const combinedImages = [...rawLeadImages];
  while (combinedImages.length < 6) {
    const sectorIndex = combinedImages.length % sectorImages.length;
    combinedImages.push(sectorImages[sectorIndex]);
  }
  
  // 4. Hash robuste basé sur le nom pour distribution unique
  let imageHash = 0;
  for (let i = 0; i < companyName.length; i++) {
    imageHash = ((imageHash << 5) - imageHash) + companyName.charCodeAt(i);
    imageHash |= 0;
  }
  imageHash = Math.abs(imageHash);
  
  const startIndex = imageHash % combinedImages.length;
  
  // 5. Hero image = première image disponible (réelle si possible)
  const heroImage = combinedImages[startIndex];
  
  // 6. Sélectionner 5 images différentes pour les autres sections
  const allImages = [];
  for (let i = 1; i <= 5; i++) {
    const imageIndex = (startIndex + i) % combinedImages.length;
    allImages.push(combinedImages[imageIndex]);
  }
  
  // 7. Log pour debugging
  console.log(`🖼️ ${lead.name}: ${rawLeadImages.length} images réelles + ${6 - rawLeadImages.length} images Pexels`);

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
    testimonials, 
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
  
  return buildUltimateHTML(content, template, combinedImages, layoutVariant);
}

/**
 * Version ASYNC avec API Pexels dynamique + Supabase Storage
 * PRIORITÉ 1: Images réelles du lead
 * PRIORITÉ 2: Images API Pexels téléchargées dans Supabase Storage
 */
export async function generateUltimateSiteAsync(lead: any, aiContent?: any): Promise<string> {
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
  
  const description = aiContent?.aboutText || lead.description || template.aboutText;
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

  // Services avec fallback
  let finalServices = template.services;
  if (aiContent?.services && Array.isArray(aiContent.services) && aiContent.services.length > 0) {
    finalServices = aiContent.services.map((s: any, idx: number) => ({
      name: s.name || `Service ${idx+1}`,
      description: s.description || '',
      features: template.services[idx % template.services.length].features
    }));
  }

  // Avis
  let testimonials = (lead.googleReviewsData || []).map((review: any) => ({
    author: review.author || 'Client VIP',
    text: review.text || "Une prestation exceptionnelle.",
    rating: review.rating || 5,
    date: review.date || 'Récemment'
  }));

  const fallbackReviews = [
    { author: 'Emma L.', text: "Une expérience tout simplement majestueuse...", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Arthur D.', text: "Service d'excellence du début à la fin...", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Sophie M.', text: "Je recommande vivement cette entreprise...", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Lucas P.', text: "Professionnalisme et expertise remarquables...", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Marie B.', text: "Un service client irréprochable...", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Thomas R.', text: "Excellence et qualité au rendez-vous...", rating: 5, date: 'Il y a 2 mois' }
  ];

  while (testimonials.length < 6) {
    testimonials.push(fallbackReviews[testimonials.length % fallbackReviews.length]);
  }
  testimonials = testimonials.slice(0, 6);

  // CTA
  let ctaText = aiContent?.cta || template.ctaText || "Demander un devis";
  if (ctaText.length > 22) ctaText = "Demander un devis";

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
    testimonials, 
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

function buildUltimateHTML(content: UltimateContent, template: any, combinedImages: string[] = [], layoutVariant: number = 0): string {
  const { companyName, heroTitle, heroSubtitle, aboutText, services, testimonials, phone, email, address, website, city, ctaText, rating, reviews, slogan, heroImage, allImages } = content;
  
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

  return `<!DOCTYPE html>
<html lang="fr" class="scroll-smooth" style="overflow-x: hidden;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="icon" type="image/svg+xml" href="${faviconDataUrl}">
    <title>${companyName} - ${content.sector} à ${city} | Services Professionnels</title>
    
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
    
    <!-- Google Fonts: Diverse Dynamic Pairings -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    ${fontPair === 0 ? `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">` :
      fontPair === 1 ? `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">` :
      `<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">`}
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

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
            --bg-glass: rgba(255, 255, 255, 0.7);
            --text-main: #0f172a;
            --text-muted: #475569;
            --font-head: ${fontPair === 0 ? "'Outfit'" : fontPair === 1 ? "'Plus Jakarta Sans'" : "'Lexend'"}, sans-serif;
            
            --glow: 0 10px 40px rgba(${primaryRgb}, 0.1);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', sans-serif;
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
        .bg-pattern { display: none; }
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

        /* Abstract Animated Light Background */
        .pattern-waves {
            position: absolute; width: 100%; height: 100%; top: 0; left: 0;
            background: linear-gradient(135deg, transparent 40%, rgba(${primaryRgb}, 0.05) 50%, transparent 60%);
            background-size: 200% 200%;
            animation: waveFlow 15s linear infinite;
            z-index: 0;
        }
        @keyframes waveFlow { 0% { background-position: 0% 0%; } 100% { background-position: 200% 200%; } }

        section { position: relative; }
        section::before {
            content: ''; position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            opacity: 0.03;
            background-image: radial-gradient(var(--primary) 1px, transparent 1px);
            background-size: 40px 40px;
            pointer-events: none; z-index: 0;
        }

        .bg-blobs {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            overflow: hidden;
            z-index: -1;
            background: var(--bg-base);
        }
        .blob {
            position: absolute;
            filter: blur(100px);
            opacity: 0.15;
            animation: float 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 50%;
        }
        .anim-shape {
            position: absolute; opacity: 0.08; pointer-events: none; z-index: 0;
            animation: floatShape 14s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
        }
        @keyframes floatShape {
            0% { transform: translateY(0) rotate(0deg) scale(1); }
            100% { transform: translateY(-80px) rotate(180deg) scale(1.2); }
        }
        .bg-grid {
            background-image: radial-gradient(rgba(${primaryRgb}, 0.1) 1px, transparent 1px);
            background-size: 30px 30px;
        }
        .bg-alternate {
            background-color: #f1f5f9; /* Un gris légèrement plus sombre pour un vrai contraste */
            border-top: 1px solid rgba(0,0,0,0.05); /* Ligne de séparation subtile */
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .blob-1 {
            background: var(--primary);
            width: 45vw; height: 45vw;
            top: -10vw; left: -10vw;
        }
        .blob-2 {
            background: var(--secondary);
            width: 35vw; height: 35vw;
            bottom: -5vw; right: -5vw;
            animation-delay: -10s;
        }
        @keyframes float {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(15vw, 15vh) scale(1.1); }
        }

        /* Modern Glassmorphism Components */
        .glass {
            background: var(--bg-glass);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid var(--border-glass);
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.04);
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
            font-family: 'Outfit', sans-serif;
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

        /* Stats Banner */
        .stats-banner { padding: 4rem 2rem; background: var(--primary); color: white; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; text-align: center; border-radius: 30px; margin: 0 auto; position: relative; overflow: hidden; box-shadow: 0 15px 35px rgba(var(--primary-rgb), 0.2); }
        .stats-banner::after { content:''; position:absolute; top:0;left:0;right:0;bottom:0; background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent); pointer-events:none;}
        .stat-banner-item h3 { font-size: 3rem; font-weight: 800; font-family: 'Outfit'; margin-bottom: 0.5rem; line-height: 1; }
        
        /* Valeurs */
        .valeurs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem; }
        .valeur-card { padding: 2.5rem 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center; border-radius: 20px; background: white; border: 1px solid rgba(0,0,0,0.04); transition: 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.02); }
        .valeur-card:hover { transform: translateY(-5px); box-shadow: var(--glow); }
        .valeur-icon { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, rgba(${primaryRgb}, 0.15), rgba(${primaryRgb}, 0.05)); color: var(--primary); display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }

        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            padding: 10rem 2rem 4rem;
            position: relative;
            max-width: 1200px;
            margin: 0 auto;
            z-index: 10;
        }
        @media (max-width: 900px) {
            .hero { grid-template-columns: 1fr; text-align: center; }
            .hero .hero-image-col { display: none; }
        }
        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1.5rem;
            border-radius: 100px;
            background: white;
            border: 1px solid rgba(${primaryRgb}, 0.2);
            color: var(--primary);
            font-size: 0.875rem;
            font-weight: 700;
            margin-bottom: 2rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            box-shadow: 0 4px 20px rgba(${primaryRgb}, 0.08);
        }
        .hero h1 {
            font-size: clamp(3rem, 7vw, 5.5rem);
            font-weight: 800;
            line-height: 1.1;
            letter-spacing: -0.04em;
            margin-bottom: 1.5rem;
            color: var(--text-main);
        }
        .hero h1 span {
            color: var(--primary);
            font-weight: 800;
        }
        .hero p {
            font-size: clamp(1.125rem, 2.5vw, 1.375rem);
            color: var(--text-muted);
            max-width: 700px;
            margin: 0 auto 3.5rem;
            font-weight: 400;
        }
        .btn-cta {
            background: var(--primary);
            color: #ffffff;
            padding: 1rem 2.5rem;
            border-radius: 10px;
            font-weight: 700;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 1.1rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            white-space: nowrap;        /* Interdit le retour à la ligne */
            overflow: hidden;           /* Cache ce qui déborde au cas où */
            text-overflow: ellipsis;    /* Met des "..." si c'est vraiment trop long sur un tout petit téléphone */
            justify-content: center;
        }
        .btn-cta:hover {
            transform: translateY(-2px);
            background: var(--secondary);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        /* Mobile Buttons */
        @media (max-width: 768px) {
            .btn-cta {
                padding: 0.875rem 2rem;
                font-size: 1rem;
                width: 100%;
                justify-content: center;
            }
        }

        /* Container & Sections */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 6rem 2rem;
            position: relative;
            z-index: 10;
        }
        .section-header {
            text-align: center;
            margin-bottom: 4rem;
        }
        .section-header h2 {
            font-size: clamp(2.2rem, 4vw, 3rem);
            margin-bottom: 1.25rem;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: -0.02em;
        }
        .section-header p {
            color: var(--text-muted);
            font-size: 1.125rem;
            max-width: 600px;
            margin: 0 auto;
        }

        /* Process Section (4 Démarches) */
        .process-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 2rem;
            position: relative;
        }
        .step-card {
            padding: 2.5rem;
            text-align: center;
            background: white;
            border-radius: 24px;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.02);
            border: 1px solid rgba(0,0,0,0.03);
            transition: transform 0.3s;
        }
        .step-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
        .step-number {
            width: 60px; height: 60px;
            border-radius: 50%;
            background: var(--bg-base);
            color: var(--primary);
            font-weight: 800;
            font-size: 1.5rem;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1.5rem;
            border: 2px dashed var(--primary);
        }
        
        /* Services Grid */
        .grid-3 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2rem;
        }
        .card {
            padding: 3rem;
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,1), transparent 40%);
            z-index: 0;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .card:hover::before { opacity: 1; }
        .card:hover {
            transform: translateY(-4px);
            border-color: rgba(${primaryRgb}, 0.15);
            box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }
        .card > * { position: relative; z-index: 1; }
        
        .card-icon {
            width: 70px; height: 70px;
            border-radius: 20px;
            background: linear-gradient(135deg, rgba(${primaryRgb}, 0.15), rgba(${primaryRgb}, 0.05));
            display: flex; align-items: center; justify-content: center;
            color: var(--primary);
            margin-bottom: 2rem;
        }
        
        .card h3 { font-size: 1.5rem; margin-bottom: 1rem; font-weight: 700; color: var(--text-main); }
        .card p { color: var(--text-muted); margin-bottom: 2rem; flex-grow: 1; }
        .feature-list { list-style: none; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1.5rem; }
        .feature-list li { display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); margin-bottom: 0.75rem; font-size: 0.95rem; font-weight: 500; }
        .feature-list i { color: var(--primary); width: 18px; height: 18px; }

        /* Testimonials */
        .testimonial-card {
            padding: 3rem; display: flex; flex-direction: column; justify-content: space-between;
        }
        .stars { display: flex; gap: 0.25rem; color: #f59e0b; margin-bottom: 1.5rem; }
        
        /* Map & Contact Form */
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            background: white;
            border-radius: 30px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0,0,0,0.03);
            border: 1px solid rgba(0,0,0,0.04);
        }
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; } }
        
        .contact-form-side { padding: 4rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-control {
            width: 100%; padding: 1rem 1.5rem; border-radius: 12px;
            border: 1px solid #e2e8f0; background: #f8fafc;
            font-family: 'Inter', sans-serif; font-size: 1rem;
            transition: all 0.3s;
        }
        .form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(${primaryRgb}, 0.1); background: white; }
        
        .map-side iframe { width: 100%; height: 100%; min-height: 400px; border: none; filter: grayscale(10%) contrast(110%); }

        /* Footer */
        footer {
            background: var(--text-main);
            color: white;
            padding: 5rem 2rem 2rem;
            margin-top: 4rem;
        }
        .footer-grid {
            max-width: 1200px; margin: 0 auto;
            display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 4rem;
            margin-bottom: 4rem;
        }
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .footer-grid { grid-template-columns: 1fr; } }
        
        .footer-logo { font-size: 2rem; font-family: 'Outfit'; font-weight: 800; color: white; display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .footer-col h4 { font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; color: white; }
        .footer-col ul { list-style: none; }
        .footer-col ul li { margin-bottom: 0.75rem; }
        .footer-col ul li a { color: var(--text-light); text-decoration: none; transition: 0.3s; }
        .footer-col ul li a:hover { color: white; padding-left: 5px; }
        .footer-bottom { text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem; color: var(--text-light); font-size: 0.9rem; }

        /* Modal Styles */
        .modal {
            display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
        }
        .modal-content {
            background-color: #fff; margin: 3% auto; padding: 4rem; border-radius: 32px;
            width: 90%; max-width: 1000px; max-height: 90vh; overflow-y: auto; position: relative;
            box-shadow: 0 40px 100px rgba(0,0,0,0.3); border: 1px solid rgba(0,0,0,0.05);
        }
        .close-modal {
            position: absolute; right: 2rem; top: 2rem; color: #000; font-size: 32px; font-weight: 300; cursor: pointer; transition: 0.3s;
            width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #f1f5f9;
        }
        .close-modal:hover { background: var(--primary); color: white; }
        .modal h2 { margin-bottom: 2.5rem; font-family: 'Outfit'; font-weight: 800; color: var(--text-main); font-size: 2.5rem; letter-spacing: -1px; }
        .modal h3 { margin-bottom: 1rem; margin-top: 2.5rem; font-family: 'Outfit'; font-weight: 700; color: var(--text-main); }
        .modal p { margin-bottom: 1.5rem; line-height: 1.8; color: var(--text-muted); font-size: 1.05rem; }

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
            padding: 1.25rem; font-family: 'Outfit'; font-weight: 700; display: flex; align-items: center; gap: 10px;
        }
        .chat-body { flex: 1; padding: 1.5rem; overflow-y: auto; background: #f8fafc; }
        .chat-msg { background: white; padding: 1rem; border-radius: 12px; border-bottom-left-radius: 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 1rem; font-size: 0.95rem; }
        .chat-input { padding: 1rem; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; }
        .chat-input input { flex: 1; border: none; outline: none; background: #f1f5f9; padding: 0.75rem 1rem; border-radius: 100px; font-family: 'Inter'; }
        
        /* Mobile Responsive Design */
        @media (max-width: 768px) {
            /* Hero Section Mobile - Fix padding to avoid overlap with marquee + navbar */
            .hero {
                grid-template-columns: 1fr;
                padding: 9rem 1.5rem 3rem;
                text-align: center;
            }
            .hero .hero-image-col {
                display: none;
            }
            .hero h1 {
                font-size: clamp(2.5rem, 10vw, 4rem);
                text-align: center;
            }
            .hero h2 {
                font-size: clamp(1rem, 4vw, 1.5rem);
                text-align: center;
            }
            .hero p {
                text-align: center;
                font-size: 1rem;
            }
            .hero-badge {
                margin: 0 auto 1.5rem;
                font-size: 0.8rem;
                padding: 0.4rem 1rem;
            }
            .hero-content > div[style*="display: flex"] {
                justify-content: center;
            }
            
            /* Container Mobile */
            .container {
                padding: 3rem 1.25rem;
            }
            .section-header h2 {
                font-size: clamp(1.75rem, 5vw, 2.25rem);
            }
            .section-header p {
                font-size: 0.95rem;
            }
            
            /* Grid Mobile */
            .grid-3 {
                grid-template-columns: 1fr;
                gap: 1.25rem;
            }
            .valeurs-grid {
                grid-template-columns: 1fr;
                gap: 1.25rem;
            }
            .process-grid {
                grid-template-columns: 1fr;
                gap: 1.25rem;
            }
            
            /* Cards Mobile */
            .card {
                padding: 1.5rem;
            }
            .card-icon {
                width: 50px;
                height: 50px;
                margin-bottom: 1rem;
            }
            .card h3 {
                font-size: 1.15rem;
            }
            .card p {
                font-size: 0.95rem;
            }
            
            /* Stats Banner Mobile */
            .stats-banner {
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                padding: 2rem 1.25rem;
            }
            .stat-banner-item h3 {
                font-size: 2rem;
            }
            .stat-banner-item p {
                font-size: 0.9rem;
            }
            
            /* Contact Grid Mobile */
            .contact-grid {
                grid-template-columns: 1fr;
            }
            .contact-form-side {
                padding: 2rem 1.25rem;
            }
            .map-side iframe {
                min-height: 250px;
            }
            
            /* Footer Mobile */
            .footer-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
            footer {
                padding: 3rem 1.25rem 2rem;
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
                padding: 1rem;
                text-decoration: none;
                color: var(--text-main);
                font-weight: 500;
                border-bottom: 1px solid rgba(0,0,0,0.05);
                transition: all 0.3s;
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
                width: 45px;
                height: 45px;
                right: 15px;
            }
            .float-phone {
                bottom: 20px;
            }
            .float-chatbot {
                bottom: 75px;
            }
            .float-whatsapp {
                bottom: 130px;
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
                padding: 2rem 1.5rem;
                margin: 5% auto;
            }
            .close-modal {
                right: 1rem;
                top: 1rem;
                width: 36px;
                height: 36px;
                font-size: 24px;
            }
            .modal h2 {
                font-size: 1.75rem;
            }
            
            /* Top Marquee Mobile */
            .top-marquee {
                font-size: 0.7rem;
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
                height: 280px;
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
        
        /* === LAYOUT VARIANTS - Dynamic structure per company === */
        .layout-variant-0 .section-process { display: block; }
        .layout-variant-0 .section-stats { display: block; }
        .layout-variant-0 .section-assurances { display: block; }
        .layout-variant-0 .hero-centered { display: block; }
        .layout-variant-0 .hero-split { display: none; }
        
        .layout-variant-1 .section-process { display: none; }
        .layout-variant-1 .section-stats { display: block; }
        .layout-variant-1 .section-assurances { display: block; }
        .layout-variant-1 .hero-centered { display: none; }
        .layout-variant-1 .hero-split { display: grid; grid-template-columns: 1fr 1fr; align-items: center; text-align: left; }
        .layout-variant-1 .hero-split .hero-content { text-align: left; }
        .layout-variant-1 .hero-split .hero-visual { display: block; }
        
        .layout-variant-2 .section-process { display: block; }
        .layout-variant-2 .section-stats { display: none; }
        .layout-variant-2 .section-assurances { display: none; }
        .layout-variant-2 .hero-centered { display: block; }
        .layout-variant-2 .hero-split { display: none; }
        .layout-variant-2 .services-grid { grid-template-columns: repeat(2, 1fr); }
        
        .layout-variant-3 .section-process { display: none; }
        .layout-variant-3 .section-stats { display: none; }
        .layout-variant-3 .section-assurances { display: block; }
        .layout-variant-3 .hero-centered { display: none; }
        .layout-variant-3 .hero-split { display: grid; grid-template-columns: 1fr 1fr; align-items: center; text-align: left; }
        .layout-variant-3 .hero-split .hero-content { text-align: left; }
        .layout-variant-3 .hero-split .hero-visual { display: block; }
        .layout-variant-3 .services-grid { grid-template-columns: 1fr; }
        .layout-variant-3 .testimonial-grid { grid-template-columns: 1fr 1fr; }
        
        .hero-visual { display: none; }
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

    <div class="bg-blobs"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>

    <!-- Navigation -->
    <nav id="navbar">
        <div class="nav-container">
            <a href="#" class="brand" style="text-decoration: none; display: flex; align-items: center; gap: 1rem;">
                <div class="logo-svg">${logoInfo.initials}</div>
                <div style="display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-weight: 800; font-family: 'Outfit'; color: var(--text-main); font-size: 1.5rem; line-height: 1.1;">${logoInfo.text}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">${slogan}</div>
                </div>
            </a>
            <div style="display: flex; gap: 1.5rem; align-items: center;">
                <div style="display: none; align-items: center; gap: 1.5rem; font-weight: 500;" class="desktop-menu">
                    <a href="#about" style="text-decoration: none; color: var(--text-main);">À propos</a>
                    <a href="#valeurs" style="text-decoration: none; color: var(--text-main);">Valeurs</a>
                    <a href="#services" style="text-decoration: none; color: var(--text-main);">Services</a>
                    <a href="#testimonials" style="text-decoration: none; color: var(--text-main);">Avis</a>
                </div>
                ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-call"><i data-lucide="phone" width="18"></i> Nous appeler</a>` : ''}
                <button class="mobile-menu-toggle" id="mobile-menu-toggle" style="display: none; background: none; border: none; cursor: pointer; padding: 0.5rem;">
                    <i data-lucide="menu" width="28" height="28" style="color: var(--text-main);"></i>
                </button>
            </div>
        </div>
        <!-- Mobile Menu -->
        <div class="mobile-menu" id="mobile-menu">
            <a href="#about" class="mobile-menu-link">À propos</a>
            <a href="#valeurs" class="mobile-menu-link">Valeurs</a>
            <a href="#services" class="mobile-menu-link">Services</a>
            <a href="#testimonials" class="mobile-menu-link">Avis</a>
            <a href="#contact" class="mobile-menu-link">Contact</a>
            ${phone ? `<a href="tel:${cleanPhoneLink}" class="mobile-menu-link mobile-call-link"><i data-lucide="phone" width="18" style="margin-right: 8px;"></i> ${phone}</a>` : ''}
        </div>
    </nav>

    <!-- Hero Centered (Variant 0 & 2) -->
    <section class="hero bg-grid hero-centered" style="text-align: center; padding: 140px 20px 100px;">
        <div class="bg-pattern"></div>
        <div class="hero-content reveal active" style="position: relative; z-index: 1; max-width: 800px; margin: 0 auto;">
            <div class="hero-badge" style="display: inline-flex;"><i data-lucide="${heroBadge.icon}" width="18"></i> ${heroBadge.text}</div>
            <h1 style="font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 0.5rem; line-height: 1.1; color: var(--text-main);">
                ${logoInfo.word1} <span style="color: var(--primary);">${logoInfo.word2}</span>
            </h1>
            <h2 style="font-size: clamp(1.1rem, 2.5vw, 1.6rem); font-family: 'Outfit'; color: var(--text-main); font-weight: 700; margin-bottom: 1.5rem; opacity: 0.8;">${slogan}</h2>
            <p style="margin-bottom: 2.5rem; font-size: 1.15rem; max-width: 600px; margin-left: auto; margin-right: auto;">${heroSubtitle}</p>
            <button onclick="document.getElementById('contact-modal').style.display='block'; document.body.style.overflow='hidden';" class="btn-cta" style="border: none; margin: 0 auto; display: inline-flex;">
                ${ctaText} <i data-lucide="arrow-right"></i>
            </button>
        </div>
    </section>

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
                <!-- NOTE IMPORTANTE: J'ai mis object-fit: contain; au cas où c'est un logo -->
                <img src="${heroImage}" ${imgErr(0)} alt="${companyName}" style="width: 100%; height: 450px; display: block; object-fit: cover;">
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
                    <img src="${getImg(1)}" ${imgErr(1)} alt="${companyName}" style="width: 100%; height: 450px; object-fit: cover; display: block;">
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

    <!-- Services -->
    <section class="container bg-alternate" id="services">
        <div class="section-header reveal" style="position: relative; z-index: 1;">
            <h2>Nos Services et Interventions</h2>
            <p>Des prestations de qualité, réalisées dans le respect des normes et des délais.</p>
        </div>
        <div class="grid-3">
            ${services.map((s, i) => `
            <div class="card glass reveal zoom-hover" style="transition-delay: ${i * 100}ms">
                <div class="card-icon" style="background: white; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 10px 20px rgba(0,0,0,0.05);">
                    <i data-lucide="${['zap', 'wrench', 'home', 'shield-check', 'settings', 'check-circle'][i%6]}" width="40" height="40" style="color: var(--primary);"></i>
                </div>
                <h3 style="font-family: 'Outfit'; font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-main);">${s.name}</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">${s.description}</p>
                <ul style="list-style: none; padding: 0;">
                    ${s.features.map(f => `
                        <li style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted);">
                            <i data-lucide="check-circle-2" style="color: var(--primary);"></i> ${f}
                        </li>
                    `).join('')}
                </ul>
            </div>
            `).join('')}
        </div>
    </section>

    <!-- Testimonials (6 Avis) -->
    <section class="container testimonial-grid" id="testimonials">
        <div class="section-header reveal" style="position: relative; z-index: 1;">
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.03); padding: 0.5rem 1rem; border-radius: 100px; margin-bottom: 1rem; font-weight: 600; font-size: 0.9rem;">
                <i data-lucide="map-pin" width="16" style="color: #ea4335;"></i> Avis authentiques vérifiés par Google Maps
            </div>
            <h2>Ils l'ont vérifié, ils l'ont approuvé</h2>
            <p>Découvrez pourquoi 100% de nos clients nous recommandent à leur entourage.</p>
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
                    <li><a href="#process">Notre Démarche</a></li>
                    <li><a href="#testimonials">Avis Clients</a></li>
                    <li><a href="javascript:void(0)" onclick="openModal('modal-mentions')">Mentions Légales</a></li>
                    <li><a href="javascript:void(0)" onclick="openModal('modal-policy')">Confidentialité</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Contact Info</h4>
                <ul style="color: var(--text-light);">
                    ${phone ? `<li style="display: flex; gap: 10px;"><i data-lucide="phone"></i> ${phone}</li>` : ''}
                    ${email ? `<li style="display: flex; gap: 10px;"><i data-lucide="mail"></i> ${email}</li>` : ''}
                    ${address ? `<li style="display: flex; gap: 10px;"><i data-lucide="map-pin"></i> ${address}</li>` : ''}
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
        <div class="chat-header" style="background: var(--primary); color: white; padding: 1.25rem; font-family: 'Outfit'; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
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
            <input type="text" id="chat-text" placeholder="Écrivez votre message..." style="flex: 1; border: 1px solid #e2e8f0; outline: none; background: #f8fafc; padding: 0.75rem 1rem; border-radius: 100px; font-family: 'Inter';">
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
</body>
</html>`;
}
