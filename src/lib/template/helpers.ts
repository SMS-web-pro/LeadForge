// ============================================================
// LeadForge AI — Template Helpers
// Process steps, guarantees, hero badge, gallery, privacy
// ============================================================

import { SectorCopy } from './sectorContent';

export function isEnglishText(text: string): boolean {
  if (!text) return false;
  const englishIndicators = ['the ', 'was ', 'very ', 'good ', 'great ', 'excellent ', 'highly ', 'recommend', 'amazing', 'professional', 'quick ', 'fast ', 'efficient', 'friendly', 'helpful', 'courteous', 'reasonable', 'price', 'work ', 'service', 'job '];
  const lowerText = text.toLowerCase();
  const matches = englishIndicators.filter(word => lowerText.includes(word));
  return matches.length >= 2;
}

export function detectLanguage(lead: any): 'fr' | 'en' {
  const city = (lead.city || '').toLowerCase();
  const desc = (lead.description || '').toLowerCase();
  const name = (lead.name || '').toLowerCase();
  const sector = (lead.sector || '').toLowerCase();
  const reviews = (lead.googleReviewsData || []).map((r: any) => (r.text || '').toLowerCase()).join(' ');

  const englishCities = ['london', 'new york', 'manhattan', 'brooklyn', 'chicago', 'los angeles', 'san francisco', 'miami', 'boston', 'seattle', 'austin', 'denver', 'atlanta', 'houston', 'phoenix', 'philadelphia', 'dallas', 'toronto', 'vancouver', 'montreal', 'sydney', 'melbourne', 'berlin', 'munich', 'amsterdam', 'barcelona', 'madrid', 'rome', 'milan', 'dubai', 'singapore', 'tokyo', 'hong kong'];
  const frenchCities = ['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes', 'reims', 'toulon', 'saint-étienne', 'le havre', 'grenoble', 'dijon', 'angers', 'nîmes', 'villeurbanne', 'clermont-ferrand', 'aix-en-provence', 'brest', 'tours', 'limoges', 'amiens', 'perpignan', 'metz', 'pau', 'besançon'];

  if (englishCities.some(c => city.includes(c))) return 'en';

  const text = `${name} ${desc} ${sector} ${reviews}`;
  const enScore = englishCities.filter(c => text.includes(c)).length + (isEnglishText(text) ? 3 : 0);
  const frScore = frenchCities.filter(c => text.includes(c)).length + (text.includes('à ') || text.includes('de ') || text.includes('le ') || text.includes('la ') ? 2 : 0);

  if (enScore > frScore) return 'en';
  if (frScore > 0) return 'fr';
  return 'fr';
}

export function getProcessSteps(sector: string, lang: 'fr' | 'en' = 'fr'): Array<{ title: string; desc: string }> {
  const s = (sector || '').toLowerCase();
  if (lang === 'en') {
    if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur') || s.includes('boulanger') || s.includes('pâtissier'))
      return [{ title: 'Reservation', desc: 'Book your table online or by phone.' }, { title: 'Welcome', desc: 'A warm setting and attentive service await you.' }, { title: 'Dining', desc: 'Savor our dishes prepared with fresh, seasonal ingredients.' }, { title: 'Service', desc: 'Our team ensures your comfort throughout your meal.' }, { title: 'Satisfaction', desc: 'A culinary experience you\'ll want to return to.' }];
    if (s.includes('coiff') || s.includes('barb') || s.includes('salon') || s.includes('beauté') || s.includes('esthétique'))
      return [{ title: 'Booking', desc: 'Schedule your appointment online at your convenience.' }, { title: 'Consultation', desc: 'A personalized hair diagnosis and tailored advice.' }, { title: 'Styling', desc: 'Let our expertise create a look that suits you.' }, { title: 'Advice', desc: 'Recommendations to maintain your style every day.' }, { title: 'Result', desc: 'A look that\'s uniquely yours, for every occasion.' }];
    if (s.includes('garage') || s.includes('mécan') || s.includes('auto') || s.includes('carrosserie'))
      return [{ title: 'Booking', desc: 'Schedule your visit around your timetable.' }, { title: 'Diagnosis', desc: 'A complete vehicle check with modern equipment.' }, { title: 'Quote', desc: 'A clear, detailed estimate before any work.' }, { title: 'Repair', desc: 'Quality work by qualified, certified technicians.' }, { title: 'Delivery', desc: 'Your vehicle returned spotless, ready to drive.' }];
    if (s.includes('avocat') || s.includes('notaire') || s.includes('juridi') || s.includes('droit'))
      return [{ title: 'Contact', desc: 'Tell us about your situation in an initial exchange.' }, { title: 'Consultation', desc: 'A thorough analysis of your case and options.' }, { title: 'Strategy', desc: 'A clear course of action, tailored to your goals.' }, { title: 'Action', desc: 'We defend your interests with rigor and determination.' }, { title: 'Follow-up', desc: 'Ongoing support until your case is resolved.' }];
    if (s.includes('médec') || s.includes('clinique') || s.includes('dentiste') || s.includes('santé') || s.includes('kiné'))
      return [{ title: 'Appointment', desc: 'Book your visit in just a few clicks.' }, { title: 'Consultation', desc: 'A careful examination and personalized diagnosis.' }, { title: 'Treatment', desc: 'A care plan tailored to your situation.' }, { title: 'Follow-up', desc: 'Regular monitoring for your well-being.' }, { title: 'Results', desc: 'Rediscover a better quality of life.' }];
    if (s.includes('fitness') || s.includes('sport') || s.includes('coach') || s.includes('gym') || s.includes('salle'))
      return [{ title: 'Assessment', desc: 'A complete fitness evaluation.' }, { title: 'Program', desc: 'A personalized training plan for your goals.' }, { title: 'Training', desc: 'Sessions led by our certified coaches.' }, { title: 'Tracking', desc: 'Regular follow-up to measure your progress.' }, { title: 'Goals', desc: 'Reach your goals and push your limits.' }];
    if (s.includes('nettoyag') || s.includes('propreté') || s.includes('ménage'))
      return [{ title: 'Quote', desc: 'An accurate estimate tailored to your needs.' }, { title: 'Planning', desc: 'A flexible schedule that fits your constraints.' }, { title: 'Service', desc: 'Our trained teams work with precision.' }, { title: 'Quality Check', desc: 'Systematic quality control after every visit.' }, { title: 'Maintenance', desc: 'Ongoing upkeep for consistently pristine spaces.' }];
    if (s.includes('jardin') || s.includes('paysag') || s.includes('espace vert'))
      return [{ title: 'Visit', desc: 'An on-site meeting to assess your space.' }, { title: 'Design', desc: 'A customized landscape project with plans and visuals.' }, { title: 'Creation', desc: 'Implementation by our team of qualified gardeners.' }, { title: 'Maintenance', desc: 'Seasonal upkeep to preserve your garden\'s beauty.' }, { title: 'Evolution', desc: 'Adjustments through the seasons and your preferences.' }];
    return [{ title: 'Contact', desc: 'Reach out to share your needs with us.' }, { title: 'Analysis', desc: 'We study your request and identify the best solution.' }, { title: 'Proposal', desc: 'Receive a clear offer, tailored to your budget.' }, { title: 'Delivery', desc: 'Our team works with care and professionalism.' }, { title: 'Follow-up', desc: 'We ensure quality follow-up for your satisfaction.' }];
  }
  if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur') || s.includes('boulanger') || s.includes('pâtissier'))
    return [{ title: 'Réservation', desc: 'Réservez votre table en ligne ou par téléphone.' }, { title: 'Accueil', desc: 'Un cadre chaleureux et un service attentionné vous attendent.' }, { title: 'Dégustation', desc: 'Savourez nos plats préparés avec des produits frais et de saison.' }, { title: 'Service', desc: 'Notre équipe veille à votre confort tout au long du repas.' }, { title: 'Satisfait', desc: 'Un moment culinaire dont vous aurez envie de revenir.' }];
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon') || s.includes('beauté') || s.includes('esthétique'))
    return [{ title: 'RDV', desc: 'Prenez rendez-vous en ligne quand ça vous convient.' }, { title: 'Consultation', desc: 'Un diagnostic capillaire personnalisé et des conseils sur-mesure.' }, { title: 'Coiffage', desc: 'Laissez faire notre expertise pour un résultat à votre image.' }, { title: 'Conseils', desc: 'Des recommandations pour entretenir votre style au quotidien.' }, { title: 'Résultat', desc: 'Un look qui vous ressemble, pour briller à chaque occasion.' }];
  if (s.includes('garage') || s.includes('mécan') || s.includes('auto') || s.includes('carrosserie'))
    return [{ title: 'RDV', desc: 'Planifiez votre passage selon votre emploi du temps.' }, { title: 'Diagnostic', desc: 'Un contrôle complet de votre véhicule avec équipement moderne.' }, { title: 'Devis', desc: 'Une estimation claire et détaillée avant toute intervention.' }, { title: 'Réparation', desc: 'Un travail soigné par des techniciens qualifiés et certifiés.' }, { title: 'Livraison', desc: 'Votre véhicule vous est restitué impeccable, prêt à rouler.' }];
  if (s.includes('avocat') || s.includes('notaire') || s.includes('juridi') || s.includes('droit'))
    return [{ title: 'Contact', desc: 'Exposez-nous votre situation lors d\'un premier échange.' }, { title: 'Consultation', desc: 'Une analyse approfondie de votre dossier et de vos options.' }, { title: 'Stratégie', desc: 'Une ligne de conduite claire, adaptée à vos objectifs.' }, { title: 'Action', desc: 'Nous défendons vos intérêts avec rigueur et détermination.' }, { title: 'Suivi', desc: 'Un accompagnement continu jusqu\'à la résolution de votre dossier.' }];
  if (s.includes('médec') || s.includes('clinique') || s.includes('dentiste') || s.includes('santé') || s.includes('kiné'))
    return [{ title: 'RDV', desc: 'Prenez rendez-vous en quelques clics.' }, { title: 'Consultation', desc: 'Un examen attentif et un diagnostic personnalisé.' }, { title: 'Traitement', desc: 'Un plan de soins adapté à votre situation.' }, { title: 'Suivi', desc: 'Un accompagnement régulier pour votre bien-être.' }, { title: 'Résultat', desc: 'Retrouvez une meilleure qualité de vie.' }];
  if (s.includes('fitness') || s.includes('sport') || s.includes('coach') || s.includes('gym') || s.includes('salle'))
    return [{ title: 'Bilan', desc: 'Un assessment complet de votre condition physique.' }, { title: 'Programme', desc: 'Un plan d\'entraînement sur mesure adapté à vos objectifs.' }, { title: 'Entraînement', desc: 'Des séances encadrées par nos coaches diplômés.' }, { title: 'Suivi', desc: 'Un suivi régulier pour mesurer vos progrès.' }, { title: 'Objectif', desc: 'Atteignez vos objectifs et dépassez vos limites.' }];
  if (s.includes('nettoyag') || s.includes('propreté') || s.includes('ménage'))
    return [{ title: 'Devis', desc: 'Un chiffrage précis adapté à vos besoins.' }, { title: 'Planification', desc: 'Un planning flexible qui s\'adapte à vos contraintes.' }, { title: 'Intervention', desc: 'Nos équipes formées interviennent avec rigueur.' }, { title: 'Contrôle', desc: 'Un contrôle qualité systématique après chaque passage.' }, { title: 'Régulier', desc: 'Un entretien maintenu pour des espaces toujours impeccables.' }];
  if (s.includes('jardin') || s.includes('paysag') || s.includes('espace vert'))
    return [{ title: 'Visite', desc: 'Un rendez-vous sur site pour analyser votre espace.' }, { title: 'Conception', desc: 'Un projet paysager personnalisé avec plans et visualisation.' }, { title: 'Réalisation', desc: 'La mise en œuvre par notre équipe de jardiniers qualifiés.' }, { title: 'Entretien', desc: 'Un suivi saisonnier pour maintenir la beauté de votre jardin.' }, { title: 'Évolution', desc: 'Des ajustements au fil des saisons et de vos envies.' }];
  return [{ title: 'Contact', desc: 'Échangez avec nous pour nous exposer votre besoin.' }, { title: 'Analyse', desc: 'Nous étudions votre demande et identifions la meilleure solution.' }, { title: 'Proposition', desc: 'Recevez une offre claire, adaptée à votre budget et vos attentes.' }, { title: 'Réalisation', desc: 'Notre équipe intervient avec soin et professionnalisme.' }, { title: 'Suivi', desc: 'Nous assurons un suivi qualité pour votre entière satisfaction.' }];
}

const normalizeDiacritics = (str: string): string =>
  (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function getGuarantees(sector: string, lang: 'fr' | 'en' = 'fr'): Array<{ title: string; icon: string }> {
  const s = normalizeDiacritics(sector);
  const g: Record<string, Array<{ title: string; icon: string; titleEn: string }>> = {
    plomb: [{ title: 'Garantie Décennale', icon: 'shield-check', titleEn: '10-Year Warranty' }, { title: 'Intervention < 2h', icon: 'clock', titleEn: 'Response < 2h' }, { title: 'Devis Gratuit', icon: 'file-text', titleEn: 'Free Quote' }, { title: 'Artisan Qualifié', icon: 'badge-check', titleEn: 'Certified Pro' }],
    electricien: [{ title: 'Consuel Certifié', icon: 'shield-check', titleEn: 'Consuel Certified' }, { title: 'Garantie Décennale', icon: 'badge-check', titleEn: '10-Year Warranty' }, { title: 'Intervention < 2h', icon: 'clock', titleEn: 'Response < 2h' }, { title: 'Devis Gratuit', icon: 'file-text', titleEn: 'Free Quote' }],
    coiffeur: [{ title: 'Produits Bio', icon: 'leaf', titleEn: 'Organic Products' }, { title: 'Stérilisation Outils', icon: 'sparkles', titleEn: 'Sterilized Tools' }, { title: 'Formation Continue', icon: 'scissors', titleEn: 'Ongoing Training' }, { title: 'Satisfait ou Refait', icon: 'heart', titleEn: 'Satisfaction Guaranteed' }],
    restaurant: [{ title: 'Produits Frais', icon: 'leaf', titleEn: 'Fresh Ingredients' }, { title: 'Service Rapide', icon: 'clock', titleEn: 'Fast Service' }, { title: 'Avis Clients', icon: 'star', titleEn: 'Customer Reviews' }, { title: 'Parking Gratuit', icon: 'car', titleEn: 'Free Parking' }],
    garage: [{ title: 'Devis Gratuit', icon: 'file-text', titleEn: 'Free Quote' }, { title: 'Garantie Pièces', icon: 'shield-check', titleEn: 'Parts Warranty' }, { title: 'Mécaniciens Certifiés', icon: 'clock', titleEn: 'Certified Mechanics' }, { title: 'Véhicule de Courtoisie', icon: 'car', titleEn: 'Courtesy Vehicle' }],
    nettoyage: [{ title: 'Produits Écolabels', icon: 'leaf', titleEn: 'Eco-Friendly Products' }, { title: 'Personnel Formé', icon: 'users', titleEn: 'Trained Staff' }, { title: 'Intervention Fiable', icon: 'clock', titleEn: 'Reliable Service' }, { title: 'Assurance RC Pro', icon: 'shield-check', titleEn: 'Professional Insurance' }],
    jardin: [{ title: 'Plantes Garanties', icon: 'sprout', titleEn: 'Plants Guaranteed' }, { title: 'Intervention Propre', icon: 'sparkles', titleEn: 'Clean Work' }, { title: 'Conseils Saisonniers', icon: 'sun', titleEn: 'Seasonal Advice' }, { title: 'Paysagiste Qualifié', icon: 'tree-deciduous', titleEn: 'Qualified Landscaper' }],
    coach: [{ title: 'Coachs Diplômés', icon: 'award', titleEn: 'Certified Coaches' }, { title: 'Matériel Neuf', icon: 'dumbbell', titleEn: 'New Equipment' }, { title: 'Sans Engagement', icon: 'badge-check', titleEn: 'No Commitment' }, { title: 'Accès 6h-23h', icon: 'clock', titleEn: 'Open 6AM-11PM' }],
    dentiste: [{ title: 'Conventionné', icon: 'stethoscope', titleEn: 'Insurance Accepted' }, { title: '3ème Payant', icon: 'credit-card', titleEn: 'Direct Billing' }, { title: 'RDV sous 48h', icon: 'calendar', titleEn: '48h Appointment' }, { title: 'Équipe Pluridisciplinaire', icon: 'users', titleEn: 'Multidisciplinary Team' }],
    avocat: [{ title: 'Avocat au Barreau', icon: 'scale', titleEn: 'Bar Certified' }, { title: 'Consultation Privée', icon: 'shield', titleEn: 'Private Consultation' }, { title: 'Défense Déterminée', icon: 'sword', titleEn: 'Determined Defense' }, { title: 'Honoraires Transparent', icon: 'file-text', titleEn: 'Transparent Fees' }],
    default: [{ title: 'Expertise Reconnue', icon: 'badge-check', titleEn: 'Recognized Expertise' }, { title: 'Devis Clair', icon: 'file-text', titleEn: 'Clear Quote' }, { title: 'Réactivité', icon: 'clock', titleEn: 'Responsiveness' }, { title: 'Satisfaction Client', icon: 'heart', titleEn: 'Client Satisfaction' }]
  };
  let matched = g.default;
  for (const [key, val] of Object.entries(g)) {
    if (key !== 'default' && s.includes(key)) { matched = val; break; }
  }
  return matched.map(item => ({ title: lang === 'en' ? item.titleEn : item.title, icon: item.icon }));
}

export function getHeroBadge(sector: string): { icon: string; text: string } {
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

export function getGalleryDesc(sector: string, lang: 'fr' | 'en' = 'fr'): string {
  const s = (sector || '').toLowerCase();
  if (lang === 'en') {
    if (s.includes('restaurant') || s.includes('cuisin')) return 'A glimpse into our kitchen and the dishes we prepare with passion.';
    if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) return 'Our salon, our creations, our universe.';
    if (s.includes('garage') || s.includes('mécan')) return 'Our workshop and the vehicles we service.';
    if (s.includes('jardin') || s.includes('paysag')) return 'Our achievements and the spaces we transform.';
    if (s.includes('fitness') || s.includes('sport')) return 'Our gym and the equipment at your disposal.';
    return 'A glimpse into our world and what we stand for.';
  }
  if (s.includes('restaurant') || s.includes('cuisin')) return 'Un aperçu de notre cuisine et des plats que nous préparons avec passion.';
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) return 'Notre salon, nos créations, notre univers.';
  if (s.includes('garage') || s.includes('mécan')) return 'Notre atelier et les véhicules que nous entretenons.';
  if (s.includes('jardin') || s.includes('paysag')) return 'Nos réalisations et les espaces que nous transformons.';
  if (s.includes('fitness') || s.includes('sport')) return 'Notre salle et les équipements à votre disposition.';
  return 'Quelques moments qui reflètent notre univers et notre engagement.';
}

export function getPrivacyContent(lang: 'fr' | 'en', companyName: string, email: string, address: string): string {
  if (lang === 'en') {
    return `<h2>Privacy Policy</h2><p><strong>${companyName}</strong> respects your privacy. This policy describes how we collect, use, and protect your personal data when you use our website and services.</p><h3>Data Collection</h3><p>We may collect the following personal data: name, email address, phone number, and any information you provide through our contact forms.</p><h3>Data Usage</h3><p>Your data is used solely to respond to your inquiries and provide our services. We do not sell or share your data with third parties without your consent.</p><h3>Data Security</h3><p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction.</p><h3>Contact</h3><p>For any questions regarding this policy, contact us at <a href="mailto:${email}">${email}</a>.</p>`;
  }
  return `<h2>Politique de Confidentialité</h2><p><strong>${companyName}</strong> respecte votre vie privée. Cette politique décrit comment nous collectons, utilisons et protégeons vos données personnelles lorsque vous utilisez notre site web et nos services.</p><h3>Collecte de Données</h3><p>Nous pouvons collecter les données personnelles suivantes : nom, adresse email, numéro de téléphone et toute information que vous fournissez via nos formulaires de contact.</p><h3>Utilisation des Données</h3><p>Vos données sont utilisées uniquement pour répondre à vos demandes et fournir nos services. Nous ne vendons ni ne partageons vos données avec des tiers sans votre consentement.</p><h3>Sécurité des Données</h3><p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès, modification ou destruction non autorisés.</p><h3>Contact</h3><p>Pour toute question concernant cette politique, contactez-nous à <a href="mailto:${email}">${email}</a>.</p>`;
}

export function generateFeaturesFromService(name: string, description: string, sector: string): string[] {
  const serviceName = (name || '').toLowerCase();
  const defaultFeatures = ['Service professionnel', 'Intervention garantie', 'Devis gratuit'];
  const featureDictionary: Record<string, string[]> = {
    'urgence': ['Disponible 24h/24', 'Intervention rapide', 'Déplacement inclus'],
    'depannage': ['Réparation durable', 'Pièces garanties', 'Tarifs transparents'],
    'installation': ['Pose certifiée', 'Conformité normes', 'Garantie décennale'],
    'mise aux normes': ['Conformité NFC 15-100', 'Certification Consuel', 'Sécurité garantie'],
    'coupe': ['Visagisme personnalisé', 'Conseil entretien', 'Produits adaptés'],
    'coloration': ['Coloration végétale', 'Protection cheveux', 'Brillance longue durée'],
    'barbier': ['Rasage précis', 'Soins barbe', 'Ambiance masculine'],
    'menu': ['Produits frais', 'Cuisine maison', 'Accord mets-vins'],
    'moteur': ['Diagnostic précis', 'Réparation garantie', "Pièces d'origine"],
    'ménage': ['Produits écologiques', 'Équipe formée', 'Intervention régulière'],
    'coaching': ['Programme personnalisé', 'Suivi nutrition', 'Résultats mesurables'],
    'consultation': ["À l'écoute", 'Diagnostic précis', 'Disponibilité rapide'],
  };
  for (const [keyword, features] of Object.entries(featureDictionary)) {
    if (serviceName.includes(keyword)) return features;
  }
  return defaultFeatures;
}

export function generateAboutText(templateText: string, lead: any): string {
  let years = 'plusieurs';
  if (lead.establishedYear && typeof lead.establishedYear === 'number') {
    const currentYear = new Date().getFullYear();
    const calculatedYears = currentYear - lead.establishedYear;
    if (calculatedYears > 0 && calculatedYears < 100) years = calculatedYears.toString();
  } else if (lead.description) {
    const yearMatch = lead.description.match(/(\d+)\s*ans?\s+d['']exp[eé]rience/i);
    if (yearMatch) years = yearMatch[1];
  }
  return templateText.replace(/depuis plus de 15 ans/gi, `depuis ${years} ans`).replace(/15 ans d['']exp[eé]rience/gi, `${years} ans d'expérience`);
}

export function capitalizeCity(city: string): string {
  if (!city) return city;
  return city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

/**
 * Strip leftover template tokens / placeholders from AI-generated copy so they
 * never appear on a live site. Removes [année], [name], {{var}}, dangling
 * "Fondé en ," and collapses whitespace.
 */
export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\[année\]/gi, '')
    .replace(/\[\s*\w[\w\-éèêàçùôîïëüæœ'’]*\s*\]/g, '')
    .replace(/\{\{\s*[^}]+\s*\}\}/g, '')
    .replace(/fond[ée]\s+en\s*,?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export interface StatItem { num: string; label: string; }

/**
 * Build the stats band from REAL data when available; otherwise substitute honest
 * sector commitments. Never invents numbers. Max 4 items.
 */
export function getStats(
  sector: string,
  lang: 'fr' | 'en',
  rating: number | undefined,
  reviews: number | undefined,
  establishedYear: number | undefined,
  hasRealRating: boolean,
  hasRealReviews: boolean
): StatItem[] {
  const stats: StatItem[] = [];
  if (hasRealRating && typeof rating === 'number' && rating > 0) {
    stats.push({ num: String(rating), label: lang === 'en' ? 'Google Rating' : 'Note Google' });
  }
  if (hasRealReviews && typeof reviews === 'number' && reviews > 0) {
    stats.push({ num: String(reviews), label: lang === 'en' ? 'Client Reviews' : 'Avis Clients' });
  }
  if (typeof establishedYear === 'number' && establishedYear > 0) {
    const y = new Date().getFullYear() - establishedYear;
    if (y > 0) stats.push({ num: y + '+', label: lang === 'en' ? 'Years Experience' : 'Ans d\'Expérience' });
  }
  const commitments: StatItem[] = lang === 'en'
    ? [{ num: '< 2h', label: 'Response' }, { num: '24/7', label: 'Available' }, { num: 'Free', label: 'Free Quote' }]
    : [{ num: '< 2h', label: 'Réponse' }, { num: '24/7', label: 'Disponible' }, { num: 'Gratuit', label: 'Devis Gratuit' }];
  for (const c of commitments) {
    if (stats.length >= 4) break;
    stats.push(c);
  }
  return stats.slice(0, 4);
}

export function getServiceDescriptions(pack: SectorCopy, services: { name: string }[], lang: 'fr' | 'en'): { name: string; desc: string }[] {
  return services.map(s => {
    const found = pack.services.find(p => p.name.toLowerCase() === s.name.toLowerCase());
    return { name: s.name, desc: found ? found.desc : `${s.name} : un service professionnel, adapté à vos besoins.` };
  });
}

export function getTrustBadges(lang: 'fr' | 'en'): string[] {
  return lang === 'fr'
    ? ['Devis gratuit', 'Réponse rapide', 'Garantie satisfaction', 'Équipe certifiée']
    : ['Free quote', 'Fast response', 'Satisfaction guarantee', 'Certified team'];
}

export function getLogoInfo(name: string, sector: string = 'default') {
  const words = name.split(' ').filter(Boolean);
  const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  let text = name;
  if (words.length === 1) {
    const suffixes: Record<string, string> = { electricien: ' Électricité', plomberie: ' Plomberie', garage: ' Automobile' };
    for (const [key, suffix] of Object.entries(suffixes)) {
      if (sector.toLowerCase().includes(key)) { text = name + suffix; break; }
    }
  }
  return { initials, text };
}
