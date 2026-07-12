// ============================================================
// LeadForge AI — Template Helpers
// Process steps, guarantees, hero badge, gallery, privacy
// ============================================================

function normalizeAccents(str: string): string {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Robust sector matching: handles accents, shorter/longer forms and aliases.
// e.g. 'Plombier' matches 'plomberie', 'électricien' matches 'electricien'.
const SECTOR_ALIASES: Record<string, string[]> = {
  plomberie: ['plomb', 'plumber', 'plomberie', 'sanitaire'],
  electricien: ['electric', 'electricien', 'elec', 'electr'],
  coiffeur: ['coiff', 'coiffeur', 'barb', 'hair', 'salon'],
  restaurant: ['restaurant', 'cuisin', 'food', 'traiteur'],
  garage: ['garage', 'auto', 'mecan', 'vehicule', 'carross'],
  nettoyage: ['nettoy', 'menage', 'clean', 'proprete'],
  jardin: ['jardin', 'paysag', 'garden', 'espace vert'],
  fitness: ['fitness', 'sport', 'coach', 'gym'],
  medical: ['medical', 'sante', 'health', 'medec', 'soin', 'dentiste'],
  avocat: ['avocat', 'juridi', 'legal', 'law'],
};

export function sectorMatches(sector: string, key: string): boolean {
  const s = normalizeAccents(sector);
  const k = normalizeAccents(key);
  if (!s || k === 'default') return false;
  if (s.includes(k) || k.includes(s)) return true;
  const aliases = SECTOR_ALIASES[k] || [k];
  return aliases.some(a => s.includes(normalizeAccents(a)));
}

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
  const frenchCities = ['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes', 'reims', 'toulon', 'saint-Ã©tienne', 'le havre', 'grenoble', 'dijon', 'angers', 'nÃ®mes', 'villeurbanne', 'clermont-ferrand', 'aix-en-provence', 'brest', 'tours', 'limoges', 'amiens', 'perpignan', 'metz', 'pau', 'besanÃ§on'];

  if (englishCities.some(c => city.includes(c))) return 'en';

  const text = `${name} ${desc} ${sector} ${reviews}`;
  const enScore = englishCities.filter(c => text.includes(c)).length + (isEnglishText(text) ? 3 : 0);
  const frScore = frenchCities.filter(c => text.includes(c)).length + (text.includes('Ã  ') || text.includes('de ') || text.includes('le ') || text.includes('la ') ? 2 : 0);

  if (enScore > frScore) return 'en';
  if (frScore > 0) return 'fr';
  return 'fr';
}

export function getProcessSteps(sector: string, lang: 'fr' | 'en' = 'fr'): Array<{ title: string; desc: string }> {
  const s = (sector || '').toLowerCase();
  if (lang === 'en') {
    if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur') || s.includes('boulanger') || s.includes('pÃ¢tissier'))
      return [{ title: 'Reservation', desc: 'Book your table online or by phone.' }, { title: 'Welcome', desc: 'A warm setting and attentive service await you.' }, { title: 'Dining', desc: 'Savor our dishes prepared with fresh, seasonal ingredients.' }, { title: 'Service', desc: 'Our team ensures your comfort throughout your meal.' }, { title: 'Satisfaction', desc: 'A culinary experience you\'ll want to return to.' }];
    if (s.includes('coiff') || s.includes('barb') || s.includes('salon') || s.includes('beautÃ©') || s.includes('esthÃ©tique'))
      return [{ title: 'Booking', desc: 'Schedule your appointment online at your convenience.' }, { title: 'Consultation', desc: 'A personalized hair diagnosis and tailored advice.' }, { title: 'Styling', desc: 'Let our expertise create a look that suits you.' }, { title: 'Advice', desc: 'Recommendations to maintain your style every day.' }, { title: 'Result', desc: 'A look that\'s uniquely yours, for every occasion.' }];
    if (s.includes('garage') || s.includes('mÃ©can') || s.includes('auto') || s.includes('carrosserie'))
      return [{ title: 'Booking', desc: 'Schedule your visit around your timetable.' }, { title: 'Diagnosis', desc: 'A complete vehicle check with modern equipment.' }, { title: 'Quote', desc: 'A clear, detailed estimate before any work.' }, { title: 'Repair', desc: 'Quality work by qualified, certified technicians.' }, { title: 'Delivery', desc: 'Your vehicle returned spotless, ready to drive.' }];
    if (s.includes('avocat') || s.includes('notaire') || s.includes('juridi') || s.includes('droit'))
      return [{ title: 'Contact', desc: 'Tell us about your situation in an initial exchange.' }, { title: 'Consultation', desc: 'A thorough analysis of your case and options.' }, { title: 'Strategy', desc: 'A clear course of action, tailored to your goals.' }, { title: 'Action', desc: 'We defend your interests with rigor and determination.' }, { title: 'Follow-up', desc: 'Ongoing support until your case is resolved.' }];
    if (s.includes('mÃ©dec') || s.includes('clinique') || s.includes('dentiste') || s.includes('santÃ©') || s.includes('kinÃ©'))
      return [{ title: 'Appointment', desc: 'Book your visit in just a few clicks.' }, { title: 'Consultation', desc: 'A careful examination and personalized diagnosis.' }, { title: 'Treatment', desc: 'A care plan tailored to your situation.' }, { title: 'Follow-up', desc: 'Regular monitoring for your well-being.' }, { title: 'Results', desc: 'Rediscover a better quality of life.' }];
    if (s.includes('fitness') || s.includes('sport') || s.includes('coach') || s.includes('gym') || s.includes('salle'))
      return [{ title: 'Assessment', desc: 'A complete fitness evaluation.' }, { title: 'Program', desc: 'A personalized training plan for your goals.' }, { title: 'Training', desc: 'Sessions led by our certified coaches.' }, { title: 'Tracking', desc: 'Regular follow-up to measure your progress.' }, { title: 'Goals', desc: 'Reach your goals and push your limits.' }];
    if (s.includes('nettoyag') || s.includes('propretÃ©') || s.includes('mÃ©nage'))
      return [{ title: 'Quote', desc: 'An accurate estimate tailored to your needs.' }, { title: 'Planning', desc: 'A flexible schedule that fits your constraints.' }, { title: 'Service', desc: 'Our trained teams work with precision.' }, { title: 'Quality Check', desc: 'Systematic quality control after every visit.' }, { title: 'Maintenance', desc: 'Ongoing upkeep for consistently pristine spaces.' }];
    if (s.includes('jardin') || s.includes('paysag') || s.includes('espace vert'))
      return [{ title: 'Visit', desc: 'An on-site meeting to assess your space.' }, { title: 'Design', desc: 'A customized landscape project with plans and visuals.' }, { title: 'Creation', desc: 'Implementation by our team of qualified gardeners.' }, { title: 'Maintenance', desc: 'Seasonal upkeep to preserve your garden\'s beauty.' }, { title: 'Evolution', desc: 'Adjustments through the seasons and your preferences.' }];
    if (s.includes('Ã©lectr') || s.includes('electric'))
      return [{ title: 'Contact', desc: 'Reach out to discuss your electrical needs.' }, { title: 'Diagnosis', desc: 'A full electrical diagnosis with certified equipment.' }, { title: 'Consuel Quote', desc: 'A compliant quote in line with Consuel standards.' }, { title: 'Compliant Work', desc: 'Intervention following NFC 15-100 norms.' }, { title: 'Verification', desc: 'Testing and commissioning before handover.' }];
    if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim'))
      return [{ title: 'Call', desc: 'Contact us to describe your issue.' }, { title: 'On-site Diagnosis', desc: 'A precise diagnosis at your premises.' }, { title: 'Free Quote', desc: 'A transparent quote before any work.' }, { title: 'Intervention', desc: 'Careful work compliant with current standards.' }, { title: 'Guaranteed', desc: 'Quality follow-up after completion.' }];
    return [{ title: 'Contact', desc: 'Reach out to share your needs with us.' }, { title: 'Analysis', desc: 'We study your request and identify the best solution.' }, { title: 'Proposal', desc: 'Receive a clear offer, tailored to your budget.' }, { title: 'Delivery', desc: 'Our team works with care and professionalism.' }, { title: 'Follow-up', desc: 'We ensure quality follow-up for your satisfaction.' }];
  }
  if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur') || s.includes('boulanger') || s.includes('pÃ¢tissier'))
    return [{ title: 'RÃ©servation', desc: 'RÃ©servez votre table en ligne ou par tÃ©lÃ©phone.' }, { title: 'Accueil', desc: 'Un cadre chaleureux et un service attentionnÃ© vous attendent.' }, { title: 'DÃ©gustation', desc: 'Savourez nos plats prÃ©parÃ©s avec des produits frais et de saison.' }, { title: 'Service', desc: 'Notre Ã©quipe veille Ã  votre confort tout au long du repas.' }, { title: 'Satisfait', desc: 'Un moment culinaire dont vous aurez envie de revenir.' }];
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon') || s.includes('beautÃ©') || s.includes('esthÃ©tique'))
    return [{ title: 'RDV', desc: 'Prenez rendez-vous en ligne quand Ã§a vous convient.' }, { title: 'Consultation', desc: 'Un diagnostic capillaire personnalisÃ© et des conseils sur-mesure.' }, { title: 'Coiffage', desc: 'Laissez faire notre expertise pour un rÃ©sultat Ã  votre image.' }, { title: 'Conseils', desc: 'Des recommandations pour entretenir votre style au quotidien.' }, { title: 'RÃ©sultat', desc: 'Un look qui vous ressemble, pour briller Ã  chaque occasion.' }];
  if (s.includes('garage') || s.includes('mÃ©can') || s.includes('auto') || s.includes('carrosserie'))
    return [{ title: 'RDV', desc: 'Planifiez votre passage selon votre emploi du temps.' }, { title: 'Diagnostic', desc: 'Un contrÃ´le complet de votre vÃ©hicule avec Ã©quipement moderne.' }, { title: 'Devis', desc: 'Une estimation claire et dÃ©taillÃ©e avant toute intervention.' }, { title: 'RÃ©paration', desc: 'Un travail soignÃ© par des techniciens qualifiÃ©s et certifiÃ©s.' }, { title: 'Livraison', desc: 'Votre vÃ©hicule vous est restituÃ© impeccable, prÃªt Ã  rouler.' }];
  if (s.includes('avocat') || s.includes('notaire') || s.includes('juridi') || s.includes('droit'))
    return [{ title: 'Contact', desc: 'Exposez-nous votre situation lors d\'un premier Ã©change.' }, { title: 'Consultation', desc: 'Une analyse approfondie de votre dossier et de vos options.' }, { title: 'StratÃ©gie', desc: 'Une ligne de conduite claire, adaptÃ©e Ã  vos objectifs.' }, { title: 'Action', desc: 'Nous dÃ©fendons vos intÃ©rÃªts avec rigueur et dÃ©termination.' }, { title: 'Suivi', desc: 'Un accompagnement continu jusqu\'Ã  la rÃ©solution de votre dossier.' }];
  if (s.includes('mÃ©dec') || s.includes('clinique') || s.includes('dentiste') || s.includes('santÃ©') || s.includes('kinÃ©'))
    return [{ title: 'RDV', desc: 'Prenez rendez-vous en quelques clics.' }, { title: 'Consultation', desc: 'Un examen attentif et un diagnostic personnalisÃ©.' }, { title: 'Traitement', desc: 'Un plan de soins adaptÃ© Ã  votre situation.' }, { title: 'Suivi', desc: 'Un accompagnement rÃ©gulier pour votre bien-Ãªtre.' }, { title: 'RÃ©sultat', desc: 'Retrouvez une meilleure qualitÃ© de vie.' }];
  if (s.includes('fitness') || s.includes('sport') || s.includes('coach') || s.includes('gym') || s.includes('salle'))
    return [{ title: 'Bilan', desc: 'Un assessment complet de votre condition physique.' }, { title: 'Programme', desc: 'Un plan d\'entraÃ®nement sur mesure adaptÃ© Ã  vos objectifs.' }, { title: 'EntraÃ®nement', desc: 'Des sÃ©ances encadrÃ©es par nos coaches diplÃ´mÃ©s.' }, { title: 'Suivi', desc: 'Un suivi rÃ©gulier pour mesurer vos progrÃ¨s.' }, { title: 'Objectif', desc: 'Atteignez vos objectifs et dÃ©passez vos limites.' }];
  if (s.includes('nettoyag') || s.includes('propretÃ©') || s.includes('mÃ©nage'))
    return [{ title: 'Devis', desc: 'Un chiffrage prÃ©cis adaptÃ© Ã  vos besoins.' }, { title: 'Planification', desc: 'Un planning flexible qui s\'adapte Ã  vos contraintes.' }, { title: 'Intervention', desc: 'Nos Ã©quipes formÃ©es interviennent avec rigueur.' }, { title: 'ContrÃ´le', desc: 'Un contrÃ´le qualitÃ© systÃ©matique aprÃ¨s chaque passage.' }, { title: 'RÃ©gulier', desc: 'Un entretien maintenu pour des espaces toujours impeccables.' }];
  if (s.includes('jardin') || s.includes('paysag') || s.includes('espace vert'))
    return [{ title: 'Visite', desc: 'Un rendez-vous sur site pour analyser votre espace.' }, { title: 'Conception', desc: 'Un projet paysager personnalisÃ© avec plans et visualisation.' }, { title: 'RÃ©alisation', desc: 'La mise en Å“uvre par notre Ã©quipe de jardiniers qualifiÃ©s.' }, { title: 'Entretien', desc: 'Un suivi saisonnier pour maintenir la beautÃ© de votre jardin.' }, { title: 'Ã‰volution', desc: 'Des ajustements au fil des saisons et de vos envies.' }];
  if (s.includes('Ã©lectr') || s.includes('electric'))
    return [{ title: 'Prise de contact', desc: 'Ã‰changez avec nous pour exposer votre besoin Ã©lectrique.' }, { title: 'Diagnostic Ã©lectrique', desc: 'Un diagnostic complet de votre installation aux normes.' }, { title: 'Devis conforme Consuel', desc: 'Un devis transparent respectant la norme NFC 15-100.' }, { title: 'Intervention aux normes', desc: 'Des travaux rÃ©alisÃ©s par un Ã©lectricien certifiÃ©.' }, { title: 'VÃ©rification & mise en service', desc: 'ContrÃ´le et mise en service aprÃ¨s intervention.' }];
  if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim'))
    return [{ title: 'Appel', desc: 'Contactez-nous pour dÃ©crire votre problÃ¨me.' }, { title: 'Diagnostic sur place', desc: 'Un diagnostic prÃ©cis rÃ©alisÃ© Ã  votre domicile.' }, { title: 'Devis gratuit', desc: 'Un devis transparent avant tout travail.' }, { title: 'Intervention', desc: 'Une intervention soignÃ©e aux normes en vigueur.' }, { title: 'Garanti', desc: 'Un suivi qualitÃ© aprÃ¨s la rÃ©alisation.' }];
  return [{ title: 'Contact', desc: 'Ã‰changez avec nous pour nous exposer votre besoin.' }, { title: 'Analyse', desc: 'Nous Ã©tudions votre demande et identifions la meilleure solution.' }, { title: 'Proposition', desc: 'Recevez une offre claire, adaptÃ©e Ã  votre budget et vos attentes.' }, { title: 'RÃ©alisation', desc: 'Notre Ã©quipe intervient avec soin et professionnalisme.' }, { title: 'Suivi', desc: 'Nous assurons un suivi qualitÃ© pour votre entiÃ¨re satisfaction.' }];
}

export function getGuarantees(sector: string, lang: 'fr' | 'en' = 'fr', rating: number = 5): Array<{ title: string; icon: string }> {
  const s = (sector || '').toLowerCase();
  const g: Record<string, Array<{ title: string; icon: string; titleEn: string }>> = {
    plomberie: [{ title: 'Garantie DÃ©cennale', icon: 'shield-check', titleEn: '10-Year Warranty' }, { title: 'Intervention < 2h', icon: 'clock', titleEn: 'Response < 2h' }, { title: 'Devis Gratuit', icon: 'file-text', titleEn: 'Free Quote' }, { title: 'Artisan QualifiÃ©', icon: 'badge-check', titleEn: 'Certified Pro' }],
    electricien: [{ title: 'Consuel CertifiÃ©', icon: 'shield-check', titleEn: 'Consuel Certified' }, { title: 'Garantie DÃ©cennale', icon: 'badge-check', titleEn: '10-Year Warranty' }, { title: 'Intervention < 2h', icon: 'clock', titleEn: 'Response < 2h' }, { title: 'Devis Gratuit', icon: 'file-text', titleEn: 'Free Quote' }],
    coiffeur: [{ title: 'Produits Bio', icon: 'leaf', titleEn: 'Organic Products' }, { title: 'StÃ©rilisation Outils', icon: 'sparkles', titleEn: 'Sterilized Tools' }, { title: 'Formation Continue', icon: 'scissors', titleEn: 'Ongoing Training' }, { title: 'Satisfait ou Refait', icon: 'heart', titleEn: 'Satisfaction Guaranteed' }],
    restaurant: [{ title: 'Produits Frais', icon: 'leaf', titleEn: 'Fresh Ingredients' }, { title: 'Service Rapide', icon: 'clock', titleEn: 'Fast Service' }, { title: `Avis ${rating}/5`, icon: 'star', titleEn: `${rating}/5 Rating` }, { title: 'Parking Gratuit', icon: 'car', titleEn: 'Free Parking' }],
    garage: [{ title: 'Devis Gratuit', icon: 'file-text', titleEn: 'Free Quote' }, { title: 'Garantie PiÃ¨ces', icon: 'shield-check', titleEn: 'Parts Warranty' }, { title: 'Ã‰quipe QualifiÃ©e', icon: 'clock', titleEn: 'Qualified Team' }, { title: 'VÃ©hicule de Courtoisie', icon: 'car', titleEn: 'Courtesy Vehicle' }],
    nettoyage: [{ title: 'Produits Ã‰colabels', icon: 'leaf', titleEn: 'Eco-Friendly Products' }, { title: 'Personnel FormÃ©', icon: 'users', titleEn: 'Trained Staff' }, { title: 'Intervention Fiable', icon: 'clock', titleEn: 'Reliable Service' }, { title: 'Assurance RC Pro', icon: 'shield-check', titleEn: 'Professional Insurance' }],
    jardin: [{ title: 'Plantes Garanties', icon: 'sprout', titleEn: 'Plants Guaranteed' }, { title: 'Intervention Propre', icon: 'sparkles', titleEn: 'Clean Work' }, { title: 'Conseils Saisonniers', icon: 'sun', titleEn: 'Seasonal Advice' }, { title: 'Paysagiste QualifiÃ©', icon: 'tree-deciduous', titleEn: 'Qualified Landscaper' }],
    fitness: [{ title: 'Coachs DiplÃ´mÃ©s', icon: 'award', titleEn: 'Certified Coaches' }, { title: 'MatÃ©riel Neuf', icon: 'dumbbell', titleEn: 'New Equipment' }, { title: 'Sans Engagement', icon: 'badge-check', titleEn: 'No Commitment' }, { title: 'AccÃ¨s 6h-23h', icon: 'clock', titleEn: 'Open 6AM-11PM' }],
    medical: [{ title: 'ConventionnÃ©', icon: 'stethoscope', titleEn: 'Insurance Accepted' }, { title: '3Ã¨me Payant', icon: 'credit-card', titleEn: 'Direct Billing' }, { title: 'RDV sous 48h', icon: 'calendar', titleEn: '48h Appointment' }, { title: 'Ã‰quipe Pluridisciplinaire', icon: 'users', titleEn: 'Multidisciplinary Team' }],
    avocat: [{ title: 'Avocat au Barreau', icon: 'scale', titleEn: 'Bar Certified' }, { title: 'Consultation PrivÃ©e', icon: 'shield', titleEn: 'Private Consultation' }, { title: 'DÃ©fense DÃ©terminÃ©e', icon: 'sword', titleEn: 'Determined Defense' }, { title: 'Honoraires Transparent', icon: 'file-text', titleEn: 'Transparent Fees' }],
    default: [{ title: 'Ã‰quipe QualifiÃ©e', icon: 'badge-check', titleEn: 'Qualified Team' }, { title: 'Devis Clair', icon: 'file-text', titleEn: 'Clear Quote' }, { title: 'RÃ©activitÃ©', icon: 'clock', titleEn: 'Responsiveness' }, { title: 'Satisfaction Client', icon: 'heart', titleEn: 'Client Satisfaction' }]
  };
  let matched = g.default;
  for (const [key, val] of Object.entries(g)) {
    if (key !== 'default' && sectorMatches(sector, key)) { matched = val; break; }
  }
  return matched.map(item => ({ title: lang === 'en' ? item.titleEn : item.title, icon: item.icon }));
}

// Points distincts de la section "Ã€ propos" (ne doivent PAS reprendre les garanties)
export function getAboutPoints(sector: string, lang: 'fr' | 'en' = 'fr'): string[] {
  const s = (sector || '').toLowerCase();
  const p: Record<string, { fr: string[]; en: string[] }> = {
    plomberie: { fr: ['Diagnostic complet de votre installation', 'MatÃ©riel professionnel de qualitÃ©', 'Travail soignÃ© et durable'], en: ['Full diagnosis of your installation', 'Quality professional equipment', 'Careful, long-lasting work'] },
    electricien: { fr: ['Diagnostic complet de votre installation', 'Travaux conformes NFC 15-100', 'Conseils pour rÃ©duire votre consommation'], en: ['Full diagnosis of your installation', 'Work compliant with NFC 15-100', 'Tips to lower your energy use'] },
    coiffeur: { fr: ['Analyse personnalisÃ©e de votre morphologie', 'Produits de qualitÃ©, respectueux de vos cheveux', 'Conseils entretien adaptÃ©s Ã  votre vie'], en: ['Personalized analysis of your features', 'Quality products, kind to your hair', 'Care tips suited to your lifestyle'] },
    restaurant: { fr: ['SÃ©lection de produits frais chaque jour', 'Carte Ã©volutive au fil des saisons', 'Accueil chaleureux et service attentionnÃ©'], en: ['Fresh produce selected daily', 'Seasonal menu that evolves', 'Warm welcome and attentive service'] },
    garage: { fr: ['Diagnostic transparent, sans surprise', 'PiÃ¨ces dâ€™origine ou Ã©quivalent qualitÃ©', 'Suivi et conseil aprÃ¨s intervention'], en: ['Transparent diagnosis, no surprises', 'OEM or equivalent-quality parts', 'Follow-up and advice after service'] },
    nettoyage: { fr: ['Produits Ã©cocertifiÃ©s et sans risque', 'Ã‰quipes formÃ©es et discrÃ¨tes', 'ContrÃ´le qualitÃ© aprÃ¨s chaque prestation'], en: ['Eco-certified, safe products', 'Trained, discreet teams', 'Quality check after each job'] },
    jardin: { fr: ['Conception paysagÃ¨re sur mesure', 'Plantes adaptÃ©es Ã  votre climat', 'Entretien raisonnÃ© et durable'], en: ['Bespoke landscape design', 'Plants suited to your climate', 'Sensible, lasting upkeep'] },
    fitness: { fr: ['Bilan personnalisÃ© Ã  lâ€™entrÃ©e', 'Coachs diplÃ´mÃ©s et bienveillants', 'Suivi rÃ©gulier de vos progrÃ¨s'], en: ['Personal assessment on joining', 'Certified, caring coaches', 'Regular progress tracking'] },
    medical: { fr: ['Ã‰coute et diagnostic prÃ©cis', 'Suivi de chaque patient', 'Cadre rassurant et hygiÃ¨ne stricte'], en: ['Listening and accurate diagnosis', 'Follow-up for every patient', 'Reassuring setting, strict hygiene'] },
    avocat: { fr: ['Analyse approfondie de votre dossier', 'StratÃ©gie claire et transparente', 'ConfidentialitÃ© strictement prÃ©servÃ©e'], en: ['In-depth analysis of your case', 'Clear, transparent strategy', 'Strictly preserved confidentiality'] },
    default: { fr: ['ComprÃ©hension fine de vos besoins', 'Solutions claires et adaptÃ©es', 'DisponibilitÃ© avant, pendant et aprÃ¨s'], en: ['A clear understanding of your needs', 'Clear, tailored solutions', 'Available before, during and after'] },
  };
  let matched = p.default;
  for (const [key, val] of Object.entries(p)) {
    if (key !== 'default' && sectorMatches(sector, key)) { matched = val; break; }
  }
  return lang === 'en' ? matched.en : matched.fr;
}

// Points de la carte "Pourquoi" â€” distincts des garanties et des points Ã€ propos
export function getWhyPoints(sector: string, lang: 'fr' | 'en' = 'fr'): string[] {
  const s = (sector || '').toLowerCase();
  const p: Record<string, { fr: string[]; en: string[] }> = {
    plomberie: { fr: ['Ã‰coute de vos besoins rÃ©els', 'Solutions adaptÃ©es Ã  votre budget', 'Un interlocuteur unique de A Ã  Z'], en: ['We listen to your real needs', 'Solutions tailored to your budget', 'One dedicated point of contact'] },
    electricien: { fr: ['Conseils de pro pour votre sÃ©curitÃ©', 'Solutions adaptÃ©es Ã  votre budget', 'Un interlocuteur unique de A Ã  Z'], en: ['Expert advice for your safety', 'Solutions tailored to your budget', 'One dedicated point of contact'] },
    coiffeur: { fr: ['Analyse de votre style', 'Conseils entretien inclus', 'Une relation de confiance'], en: ['Analysis of your style', 'Care tips included', 'A relationship built on trust'] },
    restaurant: { fr: ['Accueil chaleureux', 'Conseils sur la carte', 'Ambiance soignÃ©e'], en: ['Warm welcome', 'Advice on the menu', 'Carefully crafted ambience'] },
    garage: { fr: ['Ã‰coute de vos besoins', 'Solutions adaptÃ©es Ã  votre budget', 'Conseils entretien inclus'], en: ['We listen to your needs', 'Solutions tailored to your budget', 'Maintenance tips included'] },
    nettoyage: { fr: ['Ã‰coute de vos exigences', 'Solutions sur mesure', 'ContrÃ´le qualitÃ© inclus'], en: ['We listen to your requirements', 'Tailor-made solutions', 'Quality check included'] },
    jardin: { fr: ['Ã‰coute de vos envies', 'Conseils saisonniers inclus', 'Suivi rÃ©gulier possible'], en: ['We listen to your wishes', 'Seasonal advice included', 'Regular follow-up available'] },
    fitness: { fr: ['Bilan personnalisÃ©', 'Conseils nutrition inclus', 'Suivi de vos progrÃ¨s'], en: ['Personalised assessment', 'Nutrition tips included', 'We track your progress'] },
    medical: { fr: ['Ã‰coute et prÃ©cision', 'Conseils prÃ©vention inclus', 'Cadre rassurant'], en: ['Listening and precision', 'Prevention tips included', 'Reassuring setting'] },
    avocat: { fr: ['Analyse de votre dossier', 'Conseils stratÃ©giques inclus', 'Ã‰changes confidentiels'], en: ['Analysis of your case', 'Strategic advice included', 'Confidential exchanges'] },
    default: { fr: ['Ã‰coute de vos besoins', 'Solutions sur mesure', 'Suivi personnalisÃ©'], en: ['We listen to your needs', 'Tailor-made solutions', 'Personalised follow-up'] },
  };
  let matched = p.default;
  for (const [key, val] of Object.entries(p)) {
    if (key !== 'default' && sectorMatches(sector, key)) { matched = val; break; }
  }
  return lang === 'en' ? matched.en : matched.fr;
}

export function getHeroBadge(sector: string): { icon: string; text: string } {
  const s = (sector || '').toLowerCase();
  if (s.includes('plomb')) return { icon: 'droplets', text: 'DÃ©pannage rapide garanti' };
  if (s.includes('Ã©lectricien') || s.includes('electric')) return { icon: 'zap', text: 'Ã‰lectricien certifiÃ©' };
  if (s.includes('coiff') || s.includes('barb')) return { icon: 'scissors', text: 'Coiffeur professionnel' };
  if (s.includes('restaurant') || s.includes('cuisin')) return { icon: 'chef-hat', text: 'Chef qualifiÃ©' };
  if (s.includes('garage') || s.includes('mÃ©can')) return { icon: 'wrench', text: 'Garage agrÃ©Ã©' };
  if (s.includes('nettoy') || s.includes('mÃ©nage')) return { icon: 'sparkles', text: 'Service nettoyage pro' };
  if (s.includes('jardin') || s.includes('paysag')) return { icon: 'leaf', text: 'Jardinier expert' };
  if (s.includes('fitness') || s.includes('sport')) return { icon: 'dumbbell', text: 'Coach diplÃ´mÃ©' };
  if (s.includes('mÃ©dec') || s.includes('santÃ©') || s.includes('dentiste')) return { icon: 'stethoscope', text: 'Professionnel de santÃ©' };
  if (s.includes('avocat') || s.includes('juridi')) return { icon: 'scale', text: 'Avocat au barreau' };
  return { icon: 'badge-check', text: 'Professionnel certifiÃ©' };
}

export function getGalleryDesc(sector: string, lang: 'fr' | 'en' = 'fr'): string {
  const s = (sector || '').toLowerCase();
  if (lang === 'en') {
    if (s.includes('restaurant') || s.includes('cuisin')) return 'A glimpse into our kitchen and the dishes we prepare with passion.';
    if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) return 'Our salon, our creations, our universe.';
    if (s.includes('garage') || s.includes('mÃ©can')) return 'Our workshop and the vehicles we service.';
    if (s.includes('jardin') || s.includes('paysag')) return 'Our achievements and the spaces we transform.';
    if (s.includes('fitness') || s.includes('sport')) return 'Our gym and the equipment at your disposal.';
    return 'A glimpse into our world and what we stand for.';
  }
  if (s.includes('restaurant') || s.includes('cuisin')) return 'Un aperÃ§u de notre cuisine et des plats que nous prÃ©parons avec passion.';
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) return 'Notre salon, nos crÃ©ations, notre univers.';
  if (s.includes('garage') || s.includes('mÃ©can')) return 'Notre atelier et les vÃ©hicules que nous entretenons.';
  if (s.includes('jardin') || s.includes('paysag')) return 'Nos rÃ©alisations et les espaces que nous transformons.';
  if (s.includes('fitness') || s.includes('sport')) return 'Notre salle et les Ã©quipements Ã  votre disposition.';
  return 'Quelques moments qui reflÃ¨tent notre univers et notre engagement.';
}

export function getPrivacyContent(lang: 'fr' | 'en', companyName: string, email: string, address: string): string {
  if (lang === 'en') {
    return `<h2>Privacy Policy</h2><p><strong>${companyName}</strong> respects your privacy. This policy describes how we collect, use, and protect your personal data when you use our website and services.</p><h3>Data Collection</h3><p>We may collect the following personal data: name, email address, phone number, and any information you provide through our contact forms.</p><h3>Data Usage</h3><p>Your data is used solely to respond to your inquiries and provide our services. We do not sell or share your data with third parties without your consent.</p><h3>Data Security</h3><p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction.</p><h3>Contact</h3><p>For any questions regarding this policy, contact us at <a href="mailto:${email}">${email}</a>.</p>`;
  }
  return `<h2>Politique de ConfidentialitÃ©</h2><p><strong>${companyName}</strong> respecte votre vie privÃ©e. Cette politique dÃ©crit comment nous collectons, utilisons et protÃ©geons vos donnÃ©es personnelles lorsque vous utilisez notre site web et nos services.</p><h3>Collecte de DonnÃ©es</h3><p>Nous pouvons collecter les donnÃ©es personnelles suivantes : nom, adresse email, numÃ©ro de tÃ©lÃ©phone et toute information que vous fournissez via nos formulaires de contact.</p><h3>Utilisation des DonnÃ©es</h3><p>Vos donnÃ©es sont utilisÃ©es uniquement pour rÃ©pondre Ã  vos demandes et fournir nos services. Nous ne vendons ni ne partageons vos donnÃ©es avec des tiers sans votre consentement.</p><h3>SÃ©curitÃ© des DonnÃ©es</h3><p>Nous mettons en Å“uvre des mesures techniques et organisationnelles appropriÃ©es pour protÃ©ger vos donnÃ©es personnelles contre tout accÃ¨s, modification ou destruction non autorisÃ©s.</p><h3>Contact</h3><p>Pour toute question concernant cette politique, contactez-nous Ã  <a href="mailto:${email}">${email}</a>.</p>`;
}

export function generateFeaturesFromService(name: string, description: string, sector: string): string[] {
  const serviceName = (name || '').toLowerCase();
  const defaultFeatures = ['Service professionnel', 'Intervention garantie', 'Devis gratuit'];
  const featureDictionary: Record<string, string[]> = {
    'urgence': ['Disponible 24h/24', 'Intervention rapide', 'DÃ©placement inclus'],
    'depannage': ['RÃ©paration durable', 'PiÃ¨ces garanties', 'Tarifs transparents'],
    'installation': ['Pose certifiÃ©e', 'ConformitÃ© normes', 'Garantie dÃ©cennale'],
    'mise aux normes': ['ConformitÃ© NFC 15-100', 'Certification Consuel', 'SÃ©curitÃ© garantie'],
    'coupe': ['Visagisme personnalisÃ©', 'Conseil entretien', 'Produits adaptÃ©s'],
    'coloration': ['Coloration vÃ©gÃ©tale', 'Protection cheveux', 'Brillance longue durÃ©e'],
    'barbier': ['Rasage prÃ©cis', 'Soins barbe', 'Ambiance masculine'],
    'menu': ['Produits frais', 'Cuisine maison', 'Accord mets-vins'],
    'moteur': ['Diagnostic prÃ©cis', 'RÃ©paration garantie', "PiÃ¨ces d'origine"],
    'mÃ©nage': ['Produits Ã©cologiques', 'Ã‰quipe formÃ©e', 'Intervention rÃ©guliÃ¨re'],
    'coaching': ['Programme personnalisÃ©', 'Suivi nutrition', 'RÃ©sultats mesurables'],
    'consultation': ["Ã€ l'Ã©coute", 'Diagnostic prÃ©cis', 'DisponibilitÃ© rapide'],
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
    const yearMatch = lead.description.match(/(\d+)\s*ans?\s+d['']exp[eÃ©]rience/i);
    if (yearMatch) years = yearMatch[1];
  }
  return templateText.replace(/depuis plus de 15 ans/gi, `depuis ${years} ans`).replace(/15 ans d['']exp[eÃ©]rience/gi, `${years} ans d'expÃ©rience`);
}

export function capitalizeCity(city: string): string {
  if (!city) return city;
  return city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export function getLogoInfo(name: string, sector: string = 'default') {
  const words = name.split(' ').filter(Boolean);
  const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  let text = name;
  if (words.length === 1) {
    const suffixes: Record<string, string> = { electricien: ' Ã‰lectricitÃ©', plomberie: ' Plomberie', garage: ' Automobile' };
    for (const [key, suffix] of Object.entries(suffixes)) {
      if (sector.toLowerCase().includes(key)) { text = name + suffix; break; }
    }
  }
  return { initials, text };
}

export function iconForService(serviceName: string, sector: string): string | null {
  const n = (serviceName || '').toLowerCase();
  const sec = (sector || '').toLowerCase();
  const has = (...kw: string[]) => kw.some(k => n.includes(k) || sec.includes(k));
  if (has('Ã©lectr', 'electric', 'courant', 'prise', 'disjonct')) return 'zap';
  if (has('norme', 'mise en conform', 'consuel', 'terre')) return 'shield-check';
  if (has('domotique', 'connect', 'smart', 'maison')) return 'cpu';
  if (has('Ã©clairage', 'lumiere', 'lumiÃ¨re', 'led', 'spot')) return 'lightbulb';
  if (has('borne', 'recharge', 'vehicule', 'irve', 'wallbox')) return 'plug';
  if (has('dÃ©pannage', 'depannage', 'panne', 'urgence')) return 'wrench';
  if (has('chauffage', 'chaudiÃ¨re', 'chaudiere', 'clim', 'pompe')) return 'thermometer';
  if (has('fuite', 'fuites', 'eau', 'debouchage', 'dÃ©bouchage')) return 'droplets';
  if (has('salle de bain', 'bain', 'sanitaire', 'robinet', 'evier', 'eviers')) return 'bath';
  if (has('installation', 'pose', 'renovation', 'rÃ©novation')) return 'settings';
  if (has('coaching', 'sport', 'muscu')) return 'dumbbell';
  if (has('jardin', 'tonte', 'plante', 'arbre')) return 'tree-deciduous';
  if (has('nettoyage', 'vitre', 'menage', 'mÃ©nage')) return 'sparkles';
  if (has('avocat', 'droit', 'juridique', 'legal')) return 'scale';
  if (has('santÃ©', 'sante', 'medical', 'soin')) return 'stethoscope';
  if (has('coiff', 'barb', 'cheveux')) return 'scissors';
  if (has('restaurant', 'cuisine', 'repas', 'traiteur')) return 'utensils';
  if (has('garage', 'auto', 'mecan', 'mÃ©can', 'pneu', 'vÃ©hicule', 'vehicule')) return 'car';
  if (has('diagnostic', 'devis', 'consultation', 'rendez')) return 'file-text';
  if (has('securit', 'alarme', 'serrure')) return 'lock';
  return null;
}

export function normalizeReviewDate(date: string | undefined, lang: 'fr' | 'en'): string {
  if (!date) return lang === 'fr' ? 'RÃ©cemment' : 'Recently';
  if (lang === 'en') return date;
  const d = date.trim();
  if (/^il y a /i.test(d) || /^hier$/i.test(d) || /^aujourd'hui$/i.test(d) || /^rÃ©cemment$/i.test(d)) return d;
  const yearAgo = d.match(/^(\d+)\s+years?\s+ago$/i);
  if (yearAgo) {
    const n = parseInt(yearAgo[1], 10);
    return n === 1 ? 'Il y a 1 an' : `Il y a ${n} ans`;
  }
  const monthAgo = d.match(/^(\d+)\s+months?\s+ago$/i);
  if (monthAgo) return `Il y a ${parseInt(monthAgo[1], 10)} mois`;
  const weekAgo = d.match(/^(\d+)\s+weeks?\s+ago$/i);
  if (weekAgo) return `Il y a ${parseInt(weekAgo[1], 10)} semaines`;
  const dayAgo = d.match(/^(\d+)\s+days?\s+ago$/i);
  if (dayAgo) return `Il y a ${parseInt(dayAgo[1], 10)} jours`;
  if (/^yesterday$/i.test(d)) return 'Hier';
  if (/^today$/i.test(d)) return "Aujourd'hui";
  if (/^recently$/i.test(d) || /^recent$/i.test(d)) return 'RÃ©cemment';
  return d;
}

export function getTrustBar(sector: string, lang: 'fr' | 'en', rating: number = 5, reviews: number = 0, city: string = '', years: number | null = null): Array<{ title: string; icon: string }> {
  const cityName = capitalizeCity(city || '');
  const revLabel = lang === 'en' ? `${reviews} client reviews` : `${reviews} avis clients`;
  const locLabel = lang === 'en'
    ? (cityName ? `In ${cityName}` : 'Local business')
    : (cityName ? `Ã€ ${cityName}` : 'Artisan local');
  const expLabel = years && years > 0
    ? (lang === 'en' ? `${years} years experience` : `${years} ans d'expÃ©rience`)
    : (lang === 'en' ? 'Trusted since 2009' : 'Expert depuis 2009');
  if (lang === 'en') {
    return [
      { title: `Google ${rating}/5`, icon: 'star' },
      { title: revLabel, icon: 'thumbs-up' },
      { title: locLabel, icon: 'map-pin' },
      { title: expLabel, icon: 'calendar' },
    ];
  }
  return [
    { title: `Avis Google ${rating}/5`, icon: 'star' },
    { title: revLabel, icon: 'thumbs-up' },
    { title: locLabel, icon: 'map-pin' },
    { title: expLabel, icon: 'calendar' },
  ];
}

export function getWhyContent(sector: string, lang: 'fr' | 'en', city: string, companyName: string): { title: string; text: string } {
  const s = (sector || '').toLowerCase();
  const c = capitalizeCity(city || '');
  const name = companyName || '';

  const fr: Record<string, { title: string; text: string }> = {
    plomberie: {
      title: 'Notre mÃ©thode en 4 Ã©tapes',
      text: `Chaque intervention suit un protocole rigoureux : diagnostic prÃ©cis sur place, devis transparent avant tout travail, intervention soignÃ©e aux normes en vigueur, et suivi qualitÃ© aprÃ¨s rÃ©alisation. Ã€ ${c}, nous privilÃ©gions la rÃ©activitÃ© et la durabilitÃ© de nos rÃ©parations.`,
    },
    electricien: {
      title: 'Une Ã©lectricitÃ© sÃ»re et conforme',
      text: `Nos Ã©lectriciens rÃ©alisent un diagnostic complet de votre installation, vÃ©rifient la conformitÃ© NFC 15-100 et prÃ©parent les dossiers Consuel nÃ©cessaires. Ã€ ${c}, ${name} privilÃ©gie la sÃ©curitÃ©, la transparence des devis et des travaux garantis dÃ©cennale.`,
    },
    coiffeur: {
      title: 'Un savoir-faire au service de votre style',
      text: `Chez ${name}, chaque prestation dÃ©bute par une analyse personnalisÃ©e de votre morphologie et de vos envies. Ã€ ${c}, nos coiffeurs allient techniques modernes et produits de qualitÃ© pour un rÃ©sultat qui vous ressemble, dans un cadre soignÃ©.`,
    },
    restaurant: {
      title: 'Une cuisine pensÃ©e pour vous',
      text: `Chez ${name}, nous sÃ©lectionnons des produits frais et de saison pour composer une carte gÃ©nÃ©reuse et crÃ©ative. Ã€ ${c}, notre Ã©quipe cuisine avec passion pour vous offrir une expÃ©rience conviviale, du dÃ©jeuner rapide au dÃ®ner de fÃªte.`,
    },
    garage: {
      title: 'Votre vÃ©hicule entre de bonnes mains',
      text: `Notre garage pratique un diagnostic transparent avec devis dÃ©taillÃ© avant toute intervention. Ã€ ${c}, ${name} s'appuie sur des mÃ©caniciens certifiÃ©s et des piÃ¨ces de qualitÃ© pour garantir la fiabilitÃ© et la longÃ©vitÃ© de votre vÃ©hicule.`,
    },
    nettoyage: {
      title: 'La propretÃ© selon vos exigences',
      text: `Chez ${name}, nous appliquons une mÃ©thode rigoureuse avec des produits Ã©cocertifiÃ©s et un contrÃ´le qualitÃ© systÃ©matique. Ã€ ${c}, nos Ã©quipes s'adaptent Ã  vos contraintes pour des espaces impeccables, du bureau au domicile.`,
    },
    jardin: {
      title: 'Des espaces verts qui vous ressemblent',
      text: `Notre approche combine crÃ©ation paysagÃ¨re et entretien raisonnÃ©, respectueux du climat local. Ã€ ${c}, ${name} conÃ§oit des jardins harmonieux et durables, pensÃ©s pour Ã©voluer avec les saisons et vos envies.`,
    },
    fitness: {
      title: 'Une mÃ©thode pour vos objectifs',
      text: `Chez ${name}, chaque adhÃ©rent bÃ©nÃ©ficie d'un bilan personnalisÃ© et d'un programme adaptÃ© Ã  son niveau. Ã€ ${c}, nos coachs diplÃ´mÃ©s encadrent vos sÃ©ances et suivent vos progrÃ¨s pour des rÃ©sultats visibles et durables.`,
    },
    medical: {
      title: 'Un soin attentif et humain',
      text: `Notre cabinet privilÃ©gie l'Ã©coute, le diagnostic prÃ©cis et le suivi de chaque patient. Ã€ ${c}, ${name} vous accueille dans un environnement rassurant et met tout en Å“uvre pour des soins clairs, doux et adaptÃ©s Ã  votre situation.`,
    },
    avocat: {
      title: 'Une dÃ©fense sur-mesure',
      text: `Chez ${name}, chaque dossier fait l'objet d'une analyse approfondie et d'une stratÃ©gie claire. Ã€ ${c}, nous dÃ©fendons vos intÃ©rÃªts avec rigueur, dans le respect de la confidentialitÃ© et d'une communication transparente.`,
    },
    default: {
      title: 'Notre approche',
      text: `Chez ${name}, nous plaÃ§ons la relation de confiance au cÅ“ur de notre mÃ©tier. Ã€ ${c}, nous prenons le temps de comprendre vos besoins, proposons des solutions claires et restons Ã  votre Ã©coute avant, pendant et aprÃ¨s chaque prestation.`,
    },
  };

  const en: Record<string, { title: string; text: string }> = {
    plomberie: {
      title: 'Our 4-step method',
      text: `Every job follows a rigorous protocol: precise on-site diagnosis, transparent quote before any work, careful intervention to current standards, and quality follow-up after completion. In ${c}, we prioritize responsiveness and durable repairs.`,
    },
    electricien: {
      title: 'Safe and compliant electrical work',
      text: `Our electricians run a full diagnosis of your installation, check NFC 15-100 compliance and prepare the required Consuel files. In ${c}, ${name} puts safety, transparent quotes and decade-backed work first.`,
    },
    coiffeur: {
      title: 'Expertise at the service of your style',
      text: `At ${name}, every appointment starts with a personalized analysis of your features and wishes. In ${c}, our stylists combine modern techniques and quality products for a result that is uniquely yours, in a refined setting.`,
    },
    restaurant: {
      title: 'A kitchen designed for you',
      text: `${name} selects fresh, seasonal produce to build a generous and creative menu. In ${c}, our team cooks with passion to offer a convivial experience, from a quick lunch to a celebration dinner.`,
    },
    garage: {
      title: 'Your vehicle in good hands',
      text: `Our garage provides a transparent diagnosis with a detailed quote before any work. In ${c}, ${name} relies on certified mechanics and quality parts to guarantee the reliability and longevity of your vehicle.`,
    },
    nettoyage: {
      title: 'Cleanliness to your standards',
      text: `At ${name}, we apply a rigorous method with eco-certified products and systematic quality control. In ${c}, our teams adapt to your constraints for spotless spaces, from offices to homes.`,
    },
    jardin: {
      title: 'Green spaces that look like you',
      text: `Our approach combines landscape design and sensible upkeep, respectful of the local climate. In ${c}, ${name} creates harmonious, sustainable gardens meant to evolve with the seasons and your wishes.`,
    },
    fitness: {
      title: 'A method for your goals',
      text: `At ${name}, every member gets a personalized assessment and a program suited to their level. In ${c}, our certified coaches lead your sessions and track your progress for visible, lasting results.`,
    },
    medical: {
      title: 'Attentive and human care',
      text: `Our practice values listening, accurate diagnosis and follow-up for every patient. In ${c}, ${name} welcomes you in a reassuring environment and works for clear, gentle care adapted to your situation.`,
    },
    avocat: {
      title: 'A tailored defense',
      text: `At ${name}, every case receives an in-depth analysis and a clear strategy. In ${c}, we defend your interests with rigor, respecting confidentiality and transparent communication.`,
    },
    default: {
      title: 'Our approach',
      text: `At ${name}, we put trust at the heart of our work. In ${c}, we take the time to understand your needs, propose clear solutions and stay available before, during and after each engagement.`,
    },
  };

  const pick = lang === 'en' ? en : fr;
  if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim')) return pick.plomberie;
  if (s.includes('Ã©lectr') || s.includes('electric')) return pick.electricien;
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) return pick.coiffeur;
  if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur')) return pick.restaurant;
  if (s.includes('garage') || s.includes('mÃ©can') || s.includes('auto')) return pick.garage;
  if (s.includes('nettoyag') || s.includes('propretÃ©') || s.includes('mÃ©nage')) return pick.nettoyage;
  if (s.includes('jardin') || s.includes('paysag') || s.includes('espace vert')) return pick.jardin;
  if (s.includes('fitness') || s.includes('sport') || s.includes('coach')) return pick.fitness;
  if (s.includes('mÃ©dec') || s.includes('santÃ©') || s.includes('dentiste')) return pick.medical;
  if (s.includes('avocat') || s.includes('juridi') || s.includes('droit')) return pick.avocat;
  return pick.default;
}

export function getFaq(sector: string, lang: 'fr' | 'en', city: string, rating: number, reviews: number): Array<{ q: string; a: string }> {
  const s = (sector || '').toLowerCase();
  const c = capitalizeCity(city || '');

  if (lang === 'en') {
    if (s.includes('Ã©lectr') || s.includes('electric')) {
      return [
        { q: `Do you cover ${c} and surrounding areas?`, a: `Yes, we operate throughout ${c} and nearby towns. Contact us with your address for a precise availability check.` },
        { q: 'How long does a compliance upgrade take?', a: 'Most residential compliance upgrades are completed within 1 to 3 days, depending on the installation size.' },
        { q: 'Are your installations Consuel and NFC 15-100 compliant?', a: 'Absolutely. All our work follows NFC 15-100 and we prepare the Consuel documentation when required.' },
        { q: 'How much does an intervention cost?', a: 'A clear, free quote is provided within 2 hours, and the final price is always confirmed with you before any work begins.' },
        { q: 'Do you install EV charging stations (IRVE)?', a: 'Yes, we supply and install certified IRVE charging points for homes and businesses.' },
        { q: 'Is the work guaranteed?', a: `Yes, all our work is backed by a 10-year warranty. Our ${reviews} Google reviews rated ${rating}/5 speak for themselves.` },
        { q: 'Is the quote free?', a: 'Yes, every quote is free and without obligation.' },
        { q: 'Do you provide 24/7 emergency service?', a: 'Yes, we handle electrical emergencies 24 hours a day, 7 days a week.' },
        { q: 'What are your payment options?', a: 'We accept card, transfer and payment after quote approval. Invoices are detailed and transparent.' },
      ];
    }
    if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim')) {
      return [
        { q: `Do you intervene in ${c} and the surrounding districts?`, a: `Yes, we cover ${c} and neighboring areas. Send us your address and we will confirm availability.` },
        { q: 'What is your intervention delay?', a: 'We aim for an on-site diagnosis within 2 hours for emergencies, same day for standard requests.' },
        { q: 'Are your works compliant with DTU standards?', a: 'Yes, all our interventions follow current DTU standards and building regulations.' },
        { q: 'How much does an intervention cost?', a: 'A free quote is provided under 2 hours, and the final price is always confirmed with you before any work begins.' },
        { q: 'Do you install heating and air conditioning?', a: 'Yes, we install boilers, heat pumps and air conditioning units, all compliant and guaranteed.' },
        { q: 'Is the work guaranteed?', a: `Yes, our work carries a 10-year warranty. Our ${reviews} Google reviews rated ${rating}/5 reflect our reliability.` },
        { q: 'Is the quote free?', a: 'Yes, every quote is free and without obligation.' },
        { q: 'Do you provide 24/7 emergency service?', a: 'Yes, we handle leaks and breakdowns 24 hours a day, 7 days a week.' },
        { q: 'What are your payment options?', a: 'We accept card, transfer and payment after quote approval. Invoices are detailed and transparent.' },
      ];
    }
    return [
      { q: `Do you serve ${c}?`, a: `Yes, we operate in ${c} and the surrounding area. Contact us with your address for availability.` },
      { q: 'How quickly can you intervene?', a: 'We usually schedule an appointment within 24 to 48 hours, and faster for urgent requests.' },
      { q: 'Are your services insured and guaranteed?', a: `Yes, our work is fully insured and guaranteed. Our ${reviews} Google reviews rated ${rating}/5 reflect our commitment.` },
      { q: 'How much does it cost?', a: 'Pricing is transparent with a free quote provided before any work begins.' },
      { q: 'Is the quote free?', a: 'Yes, every quote is free and without obligation.' },
      { q: 'Do you offer emergency service?', a: 'Yes, we handle urgent requests 24 hours a day, 7 days a week.' },
      { q: 'What are your payment options?', a: 'We accept card, transfer and payment after quote approval. Invoices are clear and detailed.' },
      { q: 'Can you adapt to my specific needs?', a: 'Absolutely. We tailor every service to your situation and constraints.' },
    ];
  }

  if (s.includes('Ã©lectr') || s.includes('electric')) {
    return [
      { q: `Intervenez-vous dans ${c} et les environs ?`, a: `Oui, nous couvrons ${c} et les communes limitrophes. Indiquez-nous votre adresse pour confirmer la disponibilitÃ©.` },
      { q: 'Quel est le dÃ©lai pour une mise aux normes ?', a: 'La plupart des mises aux normes rÃ©sidentielles sont rÃ©alisÃ©es en 1 Ã  3 jours, selon l\'ampleur de l\'installation.' },
      { q: 'Vos installations sont-elles conformes Consuel / NFC 15-100 ?', a: 'Tout Ã  fait. Tous nos travaux respectent la norme NFC 15-100 et nous prÃ©parons les dossiers Consuel lorsque nÃ©cessaire.' },
      { q: 'Combien coÃ»te une intervention ?', a: 'Un devis gratuit et clair vous est communiquÃ© sous 2h, et le prix dÃ©finitif est toujours confirmÃ© avant tout travail.' },
      { q: 'Installez-vous des bornes de recharge (IRVE) ?', a: 'Oui, nous fournissons et installons des bornes de recharge IRVE certifiÃ©es pour particuliers et professionnels.' },
      { q: 'Les travaux sont-ils garantis ?', a: `Oui, tous nos travaux bÃ©nÃ©ficient d'une garantie dÃ©cennale. Nos ${reviews} avis Google notÃ©s ${rating}/5 parlent d'eux-mÃªmes.` },
      { q: 'Le devis est-il gratuit ?', a: 'Oui, chaque devis est gratuit et sans engagement.' },
      { q: 'Proposez-vous une urgence 24h/24 ?', a: 'Oui, nous traitons les pannes Ã©lectriques 24h/24 et 7j/7.' },
      { q: 'Quelles sont vos modalitÃ©s de paiement ?', a: 'Nous acceptons carte, virement et paiement aprÃ¨s acceptation du devis. Les factures sont dÃ©taillÃ©es et transparentes.' },
    ];
  }
  if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim')) {
    return [
      { q: `Intervenez-vous dans ${c} et les arrondissements alentour ?`, a: `Oui, nous intervenons Ã  ${c} et dans les communes voisines. Envoyez-nous votre adresse et nous confirmons la disponibilitÃ©.` },
      { q: 'Quel est votre dÃ©lai d\'intervention ?', a: 'Nous visons un diagnostic sur place sous 2h pour les urgences, dans la journÃ©e pour les demandes standards.' },
      { q: 'Vos travaux respectent-ils les normes DTU ?', a: 'Oui, toutes nos interventions suivent les normes DTU en vigueur et la rÃ©glementation du bÃ¢timent.' },
      { q: 'Combien coÃ»te une intervention ?', a: 'Un devis gratuit vous est communiquÃ© sous 2h, et le tarif est toujours confirmÃ© avant tout travail.' },
      { q: 'Installez-vous chauffage et climatisation ?', a: 'Oui, nous posons chaudiÃ¨res, pompes Ã  chaleur et climatiseurs, le tout conforme et garanti.' },
      { q: 'Les travaux sont-ils garantis ?', a: `Oui, nos travaux sont couverts par une garantie dÃ©cennale. Nos ${reviews} avis Google notÃ©s ${rating}/5 reflÃ¨tent notre fiabilitÃ©.` },
      { q: 'Le devis est-il gratuit ?', a: 'Oui, chaque devis est gratuit et sans engagement.' },
      { q: 'Proposez-vous une urgence 24h/24 ?', a: 'Oui, nous traitons fuites et pannes 24h/24 et 7j/7.' },
      { q: 'Quelles sont vos modalitÃ©s de paiement ?', a: 'Nous acceptons carte, virement et paiement aprÃ¨s acceptation du devis. Les factures sont dÃ©taillÃ©es et transparentes.' },
    ];
  }
  return [
    { q: `Intervenez-vous Ã  ${c} ?`, a: `Oui, nous intervenons Ã  ${c} et dans les environs. Contactez-nous avec votre adresse pour vÃ©rifier la disponibilitÃ©.` },
    { q: 'Dans quel dÃ©lai pouvez-vous intervenir ?', a: 'Nous programmons gÃ©nÃ©ralement un rendez-vous sous 24 Ã  48h, plus rapidement pour les demandes urgentes.' },
    { q: 'Vos prestations sont-elles assurÃ©es et garanties ?', a: `Oui, nos prestations sont entiÃ¨rement assurÃ©es et garanties. Nos ${reviews} avis Google notÃ©s ${rating}/5 tÃ©moignent de notre engagement.` },
    { q: 'Combien cela coÃ»te-t-il ?', a: 'Nos tarifs sont transparents, avec un devis gratuit fourni avant tout commencement des travaux.' },
    { q: 'Le devis est-il gratuit ?', a: 'Oui, chaque devis est gratuit et sans engagement.' },
    { q: 'Proposez-vous un service d\'urgence ?', a: 'Oui, nous traitons les demandes urgentes 24h/24 et 7j/7.' },
    { q: 'Quelles sont vos modalitÃ©s de paiement ?', a: 'Nous acceptons carte, virement et paiement aprÃ¨s acceptation du devis. Les factures sont claires et dÃ©taillÃ©es.' },
    { q: 'Pouvez-vous vous adapter Ã  mes besoins spÃ©cifiques ?', a: 'Bien sÃ»r. Nous personnalisons chaque prestation selon votre situation et vos contraintes.' },
  ];
}


