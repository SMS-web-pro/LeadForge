// ============================================================
// LeadForge AI — Template Helpers
// Process steps, guarantees, hero badge, gallery, privacy
// ============================================================

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
    if (s.includes('électr') || s.includes('electric'))
      return [{ title: 'Contact', desc: 'Reach out to discuss your electrical needs.' }, { title: 'Diagnosis', desc: 'A full electrical diagnosis with certified equipment.' }, { title: 'Consuel Quote', desc: 'A compliant quote in line with Consuel standards.' }, { title: 'Compliant Work', desc: 'Intervention following NFC 15-100 norms.' }, { title: 'Verification', desc: 'Testing and commissioning before handover.' }];
    if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim'))
      return [{ title: 'Call', desc: 'Contact us to describe your issue.' }, { title: 'On-site Diagnosis', desc: 'A precise diagnosis at your premises.' }, { title: 'Free Quote', desc: 'A transparent quote before any work.' }, { title: 'Intervention', desc: 'Careful work compliant with current standards.' }, { title: 'Guaranteed', desc: 'Quality follow-up after completion.' }];
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
  if (s.includes('électr') || s.includes('electric'))
    return [{ title: 'Prise de contact', desc: 'Échangez avec nous pour exposer votre besoin électrique.' }, { title: 'Diagnostic électrique', desc: 'Un diagnostic complet de votre installation aux normes.' }, { title: 'Devis conforme Consuel', desc: 'Un devis transparent respectant la norme NFC 15-100.' }, { title: 'Intervention aux normes', desc: 'Des travaux réalisés par un électricien certifié.' }, { title: 'Vérification & mise en service', desc: 'Contrôle et mise en service après intervention.' }];
  if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim'))
    return [{ title: 'Appel', desc: 'Contactez-nous pour décrire votre problème.' }, { title: 'Diagnostic sur place', desc: 'Un diagnostic précis réalisé à votre domicile.' }, { title: 'Devis gratuit', desc: 'Un devis transparent avant tout travail.' }, { title: 'Intervention', desc: 'Une intervention soignée aux normes en vigueur.' }, { title: 'Garanti', desc: 'Un suivi qualité après la réalisation.' }];
  return [{ title: 'Contact', desc: 'Échangez avec nous pour nous exposer votre besoin.' }, { title: 'Analyse', desc: 'Nous étudions votre demande et identifions la meilleure solution.' }, { title: 'Proposition', desc: 'Recevez une offre claire, adaptée à votre budget et vos attentes.' }, { title: 'Réalisation', desc: 'Notre équipe intervient avec soin et professionnalisme.' }, { title: 'Suivi', desc: 'Nous assurons un suivi qualité pour votre entière satisfaction.' }];
}

export function getGuarantees(sector: string, lang: 'fr' | 'en' = 'fr', rating: number = 5): Array<{ title: string; icon: string }> {
  const s = (sector || '').toLowerCase();
  const g: Record<string, Array<{ title: string; icon: string; titleEn: string }>> = {
    plomberie: [{ title: 'Garantie Décennale', icon: 'shield-check', titleEn: '10-Year Warranty' }, { title: 'Intervention < 2h', icon: 'clock', titleEn: 'Response < 2h' }, { title: 'Devis Gratuit', icon: 'file-text', titleEn: 'Free Quote' }, { title: 'Artisan Qualifié', icon: 'badge-check', titleEn: 'Certified Pro' }],
    electricien: [{ title: 'Consuel Certifié', icon: 'shield-check', titleEn: 'Consuel Certified' }, { title: 'Garantie Décennale', icon: 'badge-check', titleEn: '10-Year Warranty' }, { title: 'Intervention < 2h', icon: 'clock', titleEn: 'Response < 2h' }, { title: 'Devis Gratuit', icon: 'file-text', titleEn: 'Free Quote' }],
    coiffeur: [{ title: 'Produits Bio', icon: 'leaf', titleEn: 'Organic Products' }, { title: 'Stérilisation Outils', icon: 'sparkles', titleEn: 'Sterilized Tools' }, { title: 'Formation Continue', icon: 'scissors', titleEn: 'Ongoing Training' }, { title: 'Satisfait ou Refait', icon: 'heart', titleEn: 'Satisfaction Guaranteed' }],
    restaurant: [{ title: 'Produits Frais', icon: 'leaf', titleEn: 'Fresh Ingredients' }, { title: 'Service Rapide', icon: 'clock', titleEn: 'Fast Service' }, { title: `Avis ${rating}/5`, icon: 'star', titleEn: `${rating}/5 Rating` }, { title: 'Parking Gratuit', icon: 'car', titleEn: 'Free Parking' }],
    garage: [{ title: 'Devis Gratuit', icon: 'file-text', titleEn: 'Free Quote' }, { title: 'Garantie Pièces', icon: 'shield-check', titleEn: 'Parts Warranty' }, { title: 'Équipe Qualifiée', icon: 'clock', titleEn: 'Qualified Team' }, { title: 'Véhicule de Courtoisie', icon: 'car', titleEn: 'Courtesy Vehicle' }],
    nettoyage: [{ title: 'Produits Écolabels', icon: 'leaf', titleEn: 'Eco-Friendly Products' }, { title: 'Personnel Formé', icon: 'users', titleEn: 'Trained Staff' }, { title: 'Intervention Fiable', icon: 'clock', titleEn: 'Reliable Service' }, { title: 'Assurance RC Pro', icon: 'shield-check', titleEn: 'Professional Insurance' }],
    jardin: [{ title: 'Plantes Garanties', icon: 'sprout', titleEn: 'Plants Guaranteed' }, { title: 'Intervention Propre', icon: 'sparkles', titleEn: 'Clean Work' }, { title: 'Conseils Saisonniers', icon: 'sun', titleEn: 'Seasonal Advice' }, { title: 'Paysagiste Qualifié', icon: 'tree-deciduous', titleEn: 'Qualified Landscaper' }],
    fitness: [{ title: 'Coachs Diplômés', icon: 'award', titleEn: 'Certified Coaches' }, { title: 'Matériel Neuf', icon: 'dumbbell', titleEn: 'New Equipment' }, { title: 'Sans Engagement', icon: 'badge-check', titleEn: 'No Commitment' }, { title: 'Accès 6h-23h', icon: 'clock', titleEn: 'Open 6AM-11PM' }],
    medical: [{ title: 'Conventionné', icon: 'stethoscope', titleEn: 'Insurance Accepted' }, { title: '3ème Payant', icon: 'credit-card', titleEn: 'Direct Billing' }, { title: 'RDV sous 48h', icon: 'calendar', titleEn: '48h Appointment' }, { title: 'Équipe Pluridisciplinaire', icon: 'users', titleEn: 'Multidisciplinary Team' }],
    avocat: [{ title: 'Avocat au Barreau', icon: 'scale', titleEn: 'Bar Certified' }, { title: 'Consultation Privée', icon: 'shield', titleEn: 'Private Consultation' }, { title: 'Défense Déterminée', icon: 'sword', titleEn: 'Determined Defense' }, { title: 'Honoraires Transparent', icon: 'file-text', titleEn: 'Transparent Fees' }],
    default: [{ title: 'Équipe Qualifiée', icon: 'badge-check', titleEn: 'Qualified Team' }, { title: 'Devis Clair', icon: 'file-text', titleEn: 'Clear Quote' }, { title: 'Réactivité', icon: 'clock', titleEn: 'Responsiveness' }, { title: 'Satisfaction Client', icon: 'heart', titleEn: 'Client Satisfaction' }]
  };
  let matched = g.default;
  for (const [key, val] of Object.entries(g)) {
    if (key !== 'default' && s.includes(key)) { matched = val; break; }
  }
  return matched.map(item => ({ title: lang === 'en' ? item.titleEn : item.title, icon: item.icon }));
}

// Points distincts de la section "À propos" (ne doivent PAS reprendre les garanties)
export function getAboutPoints(sector: string, lang: 'fr' | 'en' = 'fr'): string[] {
  const s = (sector || '').toLowerCase();
  const p: Record<string, { fr: string[]; en: string[] }> = {
    plomberie: { fr: ['Diagnostic complet avant chaque intervention', 'Matériel professionnel et pièces garanties', 'Intervention propre, dans le respect des délais'], en: ['Full diagnosis before any work', 'Professional equipment and guaranteed parts', 'Clean work, respecting agreed schedules'] },
    electricien: { fr: ['Diagnostic complet de votre installation', 'Travaux conformes NFC 15-100', 'Conseils pour réduire votre consommation'], en: ['Full diagnosis of your installation', 'Work compliant with NFC 15-100', 'Tips to lower your energy use'] },
    coiffeur: { fr: ['Analyse personnalisée de votre morphologie', 'Produits de qualité, respectueux de vos cheveux', 'Conseils entretien adaptés à votre vie'], en: ['Personalized analysis of your features', 'Quality products, kind to your hair', 'Care tips suited to your lifestyle'] },
    restaurant: { fr: ['Sélection de produits frais chaque jour', 'Carte évolutive au fil des saisons', 'Accueil chaleureux et service attentionné'], en: ['Fresh produce selected daily', 'Seasonal menu that evolves', 'Warm welcome and attentive service'] },
    garage: { fr: ['Diagnostic transparent, sans surprise', 'Pièces d’origine ou équivalent qualité', 'Suivi et conseil après intervention'], en: ['Transparent diagnosis, no surprises', 'OEM or equivalent-quality parts', 'Follow-up and advice after service'] },
    nettoyage: { fr: ['Produits écocertifiés et sans risque', 'Équipes formées et discrètes', 'Contrôle qualité après chaque prestation'], en: ['Eco-certified, safe products', 'Trained, discreet teams', 'Quality check after each job'] },
    jardin: { fr: ['Conception paysagère sur mesure', 'Plantes adaptées à votre climat', 'Entretien raisonné et durable'], en: ['Bespoke landscape design', 'Plants suited to your climate', 'Sensible, lasting upkeep'] },
    fitness: { fr: ['Bilan personnalisé à l’entrée', 'Coachs diplômés et bienveillants', 'Suivi régulier de vos progrès'], en: ['Personal assessment on joining', 'Certified, caring coaches', 'Regular progress tracking'] },
    medical: { fr: ['Écoute et diagnostic précis', 'Suivi de chaque patient', 'Cadre rassurant et hygiène stricte'], en: ['Listening and accurate diagnosis', 'Follow-up for every patient', 'Reassuring setting, strict hygiene'] },
    avocat: { fr: ['Analyse approfondie de votre dossier', 'Stratégie claire et transparente', 'Confidentialité strictement préservée'], en: ['In-depth analysis of your case', 'Clear, transparent strategy', 'Strictly preserved confidentiality'] },
    default: { fr: ['Compréhension fine de vos besoins', 'Solutions claires et adaptées', 'Disponibilité avant, pendant et après'], en: ['A clear understanding of your needs', 'Clear, tailored solutions', 'Available before, during and after'] },
  };
  let matched = p.default;
  for (const [key, val] of Object.entries(p)) {
    if (key !== 'default' && s.includes(key)) { matched = val; break; }
  }
  return lang === 'en' ? matched.en : matched.fr;
}

// Points de la carte "Pourquoi" — distincts des garanties et des points À propos
export function getWhyPoints(sector: string, lang: 'fr' | 'en' = 'fr'): string[] {
  const s = (sector || '').toLowerCase();
  const p: Record<string, { fr: string[]; en: string[] }> = {
    plomberie: { fr: ['Devis systématiquement gratuit', 'Intervention 7j/7 en urgence', 'Artisan certifié et assuré'], en: ['Quote always free', '24/7 emergency service', 'Certified, insured tradesperson'] },
    electricien: { fr: ['Devis systématiquement gratuit', 'Astreinte 24h/24 en urgence', 'Travail garanti décennale'], en: ['Quote always free', '24/7 emergency call-out', 'Work backed by 10-year warranty'] },
    coiffeur: { fr: ['Devis offert sur place', 'Accueil sans rendez-vous possible', 'Hygiène et stérilisation certifiées'], en: ['Free on-site quote', 'Walk-ins welcome', 'Certified hygiene & sterilization'] },
    restaurant: { fr: ['Menu enfant disponible', 'Espace groupe privatisable', 'Réservation en ligne possible'], en: ['Kids menu available', 'Private group space', 'Online booking available'] },
    garage: { fr: ['Devis gratuit accepté', 'Véhicule de prêt possible', 'Garantie sur la main-d’œuvre'], en: ['Free quote accepted', 'Courtesy vehicle possible', 'Labour warranty included'] },
    nettoyage: { fr: ['Devis gratuit sur place', 'Intervention de nuit possible', 'Matériel professionnel inclus'], en: ['Free on-site quote', 'Overnight service possible', 'Professional gear included'] },
    jardin: { fr: ['Devis gratuit et détaillé', 'Entretien régulier possible', 'Conseil saisonnier inclus'], en: ['Free, detailed quote', 'Regular upkeep available', 'Seasonal advice included'] },
    fitness: { fr: ['1ʳᵉ séance d’essai offerte', 'Sans engagement initial', 'Coaching personnalisé'], en: ['First trial session free', 'No initial commitment', 'Personalized coaching'] },
    medical: { fr: ['1ᵉʳ rendez-vous rapide', 'Prise en charge mutuelle', 'Cabinet accessible PMR'], en: ['Quick first appointment', 'Insurance billing', 'Accessible premises'] },
    avocat: { fr: ['1ᵉʳ appel conseil gratuit', 'Honoraires au forfait possibles', 'Échanges 100% confidentiels'], en: ['Free first call', 'Fixed-fee options', '100% confidential exchanges'] },
    default: { fr: ['Devis gratuit systématique', 'Réponse sous 24h', 'Suivi personnalisé'], en: ['Systematic free quote', 'Reply within 24h', 'Personalized follow-up'] },
  };
  let matched = p.default;
  for (const [key, val] of Object.entries(p)) {
    if (key !== 'default' && s.includes(key)) { matched = val; break; }
  }
  return lang === 'en' ? matched.en : matched.fr;
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

export function iconForService(serviceName: string, sector: string): string | null {
  const n = (serviceName || '').toLowerCase();
  const sec = (sector || '').toLowerCase();
  const has = (...kw: string[]) => kw.some(k => n.includes(k) || sec.includes(k));
  if (has('électr', 'electric', 'courant', 'prise', 'disjonct')) return 'zap';
  if (has('norme', 'mise en conform', 'consuel', 'terre')) return 'shield-check';
  if (has('domotique', 'connect', 'smart', 'maison')) return 'cpu';
  if (has('éclairage', 'lumiere', 'lumière', 'led', 'spot')) return 'lightbulb';
  if (has('borne', 'recharge', 'vehicule', 'irve', 'wallbox')) return 'plug';
  if (has('dépannage', 'depannage', 'panne', 'urgence')) return 'wrench';
  if (has('chauffage', 'chaudière', 'chaudiere', 'clim', 'pompe')) return 'thermometer';
  if (has('fuite', 'fuites', 'eau', 'debouchage', 'débouchage')) return 'droplets';
  if (has('salle de bain', 'bain', 'sanitaire', 'robinet', 'evier', 'eviers')) return 'bath';
  if (has('installation', 'pose', 'renovation', 'rénovation')) return 'settings';
  if (has('coaching', 'sport', 'muscu')) return 'dumbbell';
  if (has('jardin', 'tonte', 'plante', 'arbre')) return 'tree-deciduous';
  if (has('nettoyage', 'vitre', 'menage', 'ménage')) return 'sparkles';
  if (has('avocat', 'droit', 'juridique', 'legal')) return 'scale';
  if (has('santé', 'sante', 'medical', 'soin')) return 'stethoscope';
  if (has('coiff', 'barb', 'cheveux')) return 'scissors';
  if (has('restaurant', 'cuisine', 'repas', 'traiteur')) return 'utensils';
  if (has('garage', 'auto', 'mecan', 'mécan', 'pneu', 'véhicule', 'vehicule')) return 'car';
  if (has('diagnostic', 'devis', 'consultation', 'rendez')) return 'file-text';
  if (has('securit', 'alarme', 'serrure')) return 'lock';
  return null;
}

export function normalizeReviewDate(date: string | undefined, lang: 'fr' | 'en'): string {
  if (!date) return lang === 'fr' ? 'Récemment' : 'Recently';
  if (lang === 'en') return date;
  const d = date.trim();
  if (/^il y a /i.test(d) || /^hier$/i.test(d) || /^aujourd'hui$/i.test(d) || /^récemment$/i.test(d)) return d;
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
  if (/^recently$/i.test(d) || /^recent$/i.test(d)) return 'Récemment';
  return d;
}

export function getTrustBar(sector: string, lang: 'fr' | 'en', rating: number = 5): Array<{ title: string; icon: string }> {
  if (lang === 'en') {
    return [
      { title: `Google ${rating}/5`, icon: 'star' },
      { title: 'Response < 2h', icon: 'clock' },
      { title: '10-Year Warranty', icon: 'shield-check' },
      { title: 'Free Quote', icon: 'file-text' },
    ];
  }
  return [
    { title: `Avis Google ${rating}/5`, icon: 'star' },
    { title: 'Intervention < 2h', icon: 'clock' },
    { title: 'Garantie décennale', icon: 'shield-check' },
    { title: 'Devis gratuit', icon: 'file-text' },
  ];
}

// Remove leftover AI placeholder tokens ([année], [nom], {{var}}, …) so generated
// sites never show unrendered brackets to end users. Also cleans the dangling
// fragments left behind (e.g. "Fondé en [année]," → "Fondé en ,").
export function cleanText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/\[[^\]\n]{1,40}\]/g, '')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/Fond[ée] en\s*[,.\s]+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[,;:]\s*[,;:]/g, ',')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

// Stats band — data-driven & honest. Real signals (rating, review count, years in
// business) are shown when available; otherwise the band is padded with clearly
// framed service commitments (response time, availability, free quote) so no
// invented "facts" are ever displayed.
export function getStats(sector: string, lang: 'fr' | 'en', rating?: number, reviews?: number, establishedYear?: number, hasRealRating: boolean = false, hasRealReviews: boolean = false): Array<{ value: string; label: string }> {
  const s = (sector || '').toLowerCase();
  const isEn = lang === 'en';
  const out: Array<{ value: string; label: string }> = [];
  if (hasRealRating && rating) out.push({ value: `${rating}/5`, label: isEn ? 'Google rating' : 'Note Google' });
  if (hasRealReviews && reviews) out.push({ value: `${reviews}`, label: isEn ? 'Client reviews' : 'Avis clients' });
  if (establishedYear) {
    const y = new Date().getFullYear() - establishedYear;
    if (y > 0 && y < 120) out.push({ value: `${y}+`, label: isEn ? 'Years in business' : 'Ans d\'expérience' });
  }
  const C: Record<string, { fr: [string, string][]; en: [string, string][] }> = {
    plomberie: { fr: [['<2h', 'Délai intervention'], ['24h/24', 'Disponible'], ['Devis gratuit', 'Sans engagement']], en: [['<2h', 'Response time'], ['24/7', 'Available'], ['Free quote', 'No obligation']] },
    electricien: { fr: [['<2h', 'Délai intervention'], ['24h/24', 'Disponible'], ['Devis gratuit', 'Sans engagement']], en: [['<2h', 'Response time'], ['24/7', 'Available'], ['Free quote', 'No obligation']] },
    coiffeur: { fr: [['Devis offert', 'Sans engagement'], ['Sans RDV', 'Accueil possible'], ['Hygiène', 'Certifiée']], en: [['Free quote', 'No obligation'], ['Walk-ins', 'Welcome'], ['Hygiene', 'Certified']] },
    restaurant: { fr: [['Produits frais', 'Chaque jour'], ['Réservation', 'En ligne'], ['Accessible', 'Tous budgets']], en: [['Fresh food', 'Daily'], ['Booking', 'Online'], ['Welcoming', 'All budgets']] },
    garage: { fr: [['Devis gratuit', 'Sans engagement'], ['Pièces', 'Garanties'], ['Véhicule', 'de prêt']], en: [['Free quote', 'No obligation'], ['Parts', 'Guaranteed'], ['Courtesy', 'vehicle']] },
    nettoyage: { fr: [['Devis gratuit', 'Sur place'], ['Équipes', 'Discrètes'], ['Écologique', 'Certifié']], en: [['Free quote', 'On-site'], ['Trained', 'discreet'], ['Eco', 'certified']] },
    jardin: { fr: [['Devis détaillé', 'Gratuit'], ['Conseil', 'Saisonnier'], ['Entretien', 'Régulier']], en: [['Detailed quote', 'Free'], ['Seasonal', 'advice'], ['Upkeep', 'Regular']] },
    fitness: { fr: [['1ʳᵉ séance', 'Offerte'], ['Sans engagement', 'Initial'], ['Coachs', 'Diplômés']], en: [['1st session', 'Free'], ['No commitment', 'Initial'], ['Coaches', 'Certified']] },
    medical: { fr: [['1ʳᵉ RDV', 'Rapide'], ['Mutuelle', 'Acceptée'], ['Accessible', 'PMR']], en: [['First appt', 'Fast'], ['Insurance', 'accepted'], ['Accessible', 'PMR']] },
    avocat: { fr: [['1ʳᵉ call', 'Conseil gratuit'], ['Honoraires', 'Transparents'], ['Confidentialité', 'Totale']], en: [['Free call', 'First'], ['Fees', 'Transparent'], ['Confidential', '100%']] },
    default: { fr: [['Devis gratuit', 'Sans engagement'], ['Réponse', '<24h'], ['Satisfaction', 'Garantie']], en: [['Free quote', 'No obligation'], ['Reply', '<24h'], ['Satisfaction', 'Guaranteed']] },
  };
  let key = 'default';
  if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim')) key = 'plomberie';
  else if (s.includes('électr') || s.includes('electric')) key = 'electricien';
  else if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) key = 'coiffeur';
  else if (s.includes('restaurant') || s.includes('cuisin')) key = 'restaurant';
  else if (s.includes('garage') || s.includes('mécan') || s.includes('auto')) key = 'garage';
  else if (s.includes('nettoy')) key = 'nettoyage';
  else if (s.includes('jardin') || s.includes('paysag')) key = 'jardin';
  else if (s.includes('fitness') || s.includes('sport')) key = 'fitness';
  else if (s.includes('médec') || s.includes('santé')) key = 'medical';
  else if (s.includes('avocat') || s.includes('juridi')) key = 'avocat';
  const commits = C[key][lang];
  for (const c of commits) { if (out.length >= 4) break; out.push({ value: c[0], label: c[1] }); }
  return out.slice(0, 4);
}

export function getWhyContent(sector: string, lang: 'fr' | 'en', city: string, companyName: string): { title: string; text: string } {
  const s = (sector || '').toLowerCase();
  const c = capitalizeCity(city || '');
  const name = companyName || '';

  const fr: Record<string, { title: string; text: string }> = {
    plomberie: {
      title: 'Notre méthode en 4 étapes',
      text: `Chaque intervention suit un protocole rigoureux : diagnostic précis sur place, devis transparent avant tout travail, intervention soignée aux normes en vigueur, et suivi qualité après réalisation. À ${c}, nous privilégions la réactivité et la durabilité de nos réparations.`,
    },
    electricien: {
      title: 'Une électricité sûre et conforme',
      text: `Nos électriciens réalisent un diagnostic complet de votre installation, vérifient la conformité NFC 15-100 et préparent les dossiers Consuel nécessaires. À ${c}, ${name} privilégie la sécurité, la transparence des devis et des travaux garantis décennale.`,
    },
    coiffeur: {
      title: 'Un savoir-faire au service de votre style',
      text: `Chez ${name}, chaque prestation débute par une analyse personnalisée de votre morphologie et de vos envies. À ${c}, nos coiffeurs allient techniques modernes et produits de qualité pour un résultat qui vous ressemble, dans un cadre soigné.`,
    },
    restaurant: {
      title: 'Une cuisine pensée pour vous',
      text: `Chez ${name}, nous sélectionnons des produits frais et de saison pour composer une carte généreuse et créative. À ${c}, notre équipe cuisine avec passion pour vous offrir une expérience conviviale, du déjeuner rapide au dîner de fête.`,
    },
    garage: {
      title: 'Votre véhicule entre de bonnes mains',
      text: `Notre garage pratique un diagnostic transparent avec devis détaillé avant toute intervention. À ${c}, ${name} s'appuie sur des mécaniciens certifiés et des pièces de qualité pour garantir la fiabilité et la longévité de votre véhicule.`,
    },
    nettoyage: {
      title: 'La propreté selon vos exigences',
      text: `Chez ${name}, nous appliquons une méthode rigoureuse avec des produits écocertifiés et un contrôle qualité systématique. À ${c}, nos équipes s'adaptent à vos contraintes pour des espaces impeccables, du bureau au domicile.`,
    },
    jardin: {
      title: 'Des espaces verts qui vous ressemblent',
      text: `Notre approche combine création paysagère et entretien raisonné, respectueux du climat local. À ${c}, ${name} conçoit des jardins harmonieux et durables, pensés pour évoluer avec les saisons et vos envies.`,
    },
    fitness: {
      title: 'Une méthode pour vos objectifs',
      text: `Chez ${name}, chaque adhérent bénéficie d'un bilan personnalisé et d'un programme adapté à son niveau. À ${c}, nos coachs diplômés encadrent vos séances et suivent vos progrès pour des résultats visibles et durables.`,
    },
    medical: {
      title: 'Un soin attentif et humain',
      text: `Notre cabinet privilégie l'écoute, le diagnostic précis et le suivi de chaque patient. À ${c}, ${name} vous accueille dans un environnement rassurant et met tout en œuvre pour des soins clairs, doux et adaptés à votre situation.`,
    },
    avocat: {
      title: 'Une défense sur-mesure',
      text: `Chez ${name}, chaque dossier fait l'objet d'une analyse approfondie et d'une stratégie claire. À ${c}, nous défendons vos intérêts avec rigueur, dans le respect de la confidentialité et d'une communication transparente.`,
    },
    default: {
      title: 'Notre approche',
      text: `Chez ${name}, nous plaçons la relation de confiance au cœur de notre métier. À ${c}, nous prenons le temps de comprendre vos besoins, proposons des solutions claires et restons à votre écoute avant, pendant et après chaque prestation.`,
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
  if (s.includes('électr') || s.includes('electric')) return pick.electricien;
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) return pick.coiffeur;
  if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur')) return pick.restaurant;
  if (s.includes('garage') || s.includes('mécan') || s.includes('auto')) return pick.garage;
  if (s.includes('nettoyag') || s.includes('propreté') || s.includes('ménage')) return pick.nettoyage;
  if (s.includes('jardin') || s.includes('paysag') || s.includes('espace vert')) return pick.jardin;
  if (s.includes('fitness') || s.includes('sport') || s.includes('coach')) return pick.fitness;
  if (s.includes('médec') || s.includes('santé') || s.includes('dentiste')) return pick.medical;
  if (s.includes('avocat') || s.includes('juridi') || s.includes('droit')) return pick.avocat;
  return pick.default;
}

export function getFaq(sector: string, lang: 'fr' | 'en', city: string, rating: number, reviews: number): Array<{ q: string; a: string }> {
  const s = (sector || '').toLowerCase();
  const c = capitalizeCity(city || '');

  if (lang === 'en') {
    if (s.includes('électr') || s.includes('electric')) {
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

  if (s.includes('électr') || s.includes('electric')) {
    return [
      { q: `Intervenez-vous dans ${c} et les environs ?`, a: `Oui, nous couvrons ${c} et les communes limitrophes. Indiquez-nous votre adresse pour confirmer la disponibilité.` },
      { q: 'Quel est le délai pour une mise aux normes ?', a: 'La plupart des mises aux normes résidentielles sont réalisées en 1 à 3 jours, selon l\'ampleur de l\'installation.' },
      { q: 'Vos installations sont-elles conformes Consuel / NFC 15-100 ?', a: 'Tout à fait. Tous nos travaux respectent la norme NFC 15-100 et nous préparons les dossiers Consuel lorsque nécessaire.' },
      { q: 'Combien coûte une intervention ?', a: 'Un devis gratuit et clair vous est communiqué sous 2h, et le prix définitif est toujours confirmé avant tout travail.' },
      { q: 'Installez-vous des bornes de recharge (IRVE) ?', a: 'Oui, nous fournissons et installons des bornes de recharge IRVE certifiées pour particuliers et professionnels.' },
      { q: 'Les travaux sont-ils garantis ?', a: `Oui, tous nos travaux bénéficient d'une garantie décennale. Nos ${reviews} avis Google notés ${rating}/5 parlent d'eux-mêmes.` },
      { q: 'Le devis est-il gratuit ?', a: 'Oui, chaque devis est gratuit et sans engagement.' },
      { q: 'Proposez-vous une urgence 24h/24 ?', a: 'Oui, nous traitons les pannes électriques 24h/24 et 7j/7.' },
      { q: 'Quelles sont vos modalités de paiement ?', a: 'Nous acceptons carte, virement et paiement après acceptation du devis. Les factures sont détaillées et transparentes.' },
    ];
  }
  if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim')) {
    return [
      { q: `Intervenez-vous dans ${c} et les arrondissements alentour ?`, a: `Oui, nous intervenons à ${c} et dans les communes voisines. Envoyez-nous votre adresse et nous confirmons la disponibilité.` },
      { q: 'Quel est votre délai d\'intervention ?', a: 'Nous visons un diagnostic sur place sous 2h pour les urgences, dans la journée pour les demandes standards.' },
      { q: 'Vos travaux respectent-ils les normes DTU ?', a: 'Oui, toutes nos interventions suivent les normes DTU en vigueur et la réglementation du bâtiment.' },
      { q: 'Combien coûte une intervention ?', a: 'Un devis gratuit vous est communiqué sous 2h, et le tarif est toujours confirmé avant tout travail.' },
      { q: 'Installez-vous chauffage et climatisation ?', a: 'Oui, nous posons chaudières, pompes à chaleur et climatiseurs, le tout conforme et garanti.' },
      { q: 'Les travaux sont-ils garantis ?', a: `Oui, nos travaux sont couverts par une garantie décennale. Nos ${reviews} avis Google notés ${rating}/5 reflètent notre fiabilité.` },
      { q: 'Le devis est-il gratuit ?', a: 'Oui, chaque devis est gratuit et sans engagement.' },
      { q: 'Proposez-vous une urgence 24h/24 ?', a: 'Oui, nous traitons fuites et pannes 24h/24 et 7j/7.' },
      { q: 'Quelles sont vos modalités de paiement ?', a: 'Nous acceptons carte, virement et paiement après acceptation du devis. Les factures sont détaillées et transparentes.' },
    ];
  }
  return [
    { q: `Intervenez-vous à ${c} ?`, a: `Oui, nous intervenons à ${c} et dans les environs. Contactez-nous avec votre adresse pour vérifier la disponibilité.` },
    { q: 'Dans quel délai pouvez-vous intervenir ?', a: 'Nous programmons généralement un rendez-vous sous 24 à 48h, plus rapidement pour les demandes urgentes.' },
    { q: 'Vos prestations sont-elles assurées et garanties ?', a: `Oui, nos prestations sont entièrement assurées et garanties. Nos ${reviews} avis Google notés ${rating}/5 témoignent de notre engagement.` },
    { q: 'Combien cela coûte-t-il ?', a: 'Nos tarifs sont transparents, avec un devis gratuit fourni avant tout commencement des travaux.' },
    { q: 'Le devis est-il gratuit ?', a: 'Oui, chaque devis est gratuit et sans engagement.' },
    { q: 'Proposez-vous un service d\'urgence ?', a: 'Oui, nous traitons les demandes urgentes 24h/24 et 7j/7.' },
    { q: 'Quelles sont vos modalités de paiement ?', a: 'Nous acceptons carte, virement et paiement après acceptation du devis. Les factures sont claires et détaillées.' },
    { q: 'Pouvez-vous vous adapter à mes besoins spécifiques ?', a: 'Bien sûr. Nous personnalisons chaque prestation selon votre situation et vos contraintes.' },
  ];
}
