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
      return [{ title: 'Reservation', desc: 'Book your table online or by phone, we prepare your seating.' }, { title: 'Welcome', desc: 'A warm setting with tableware and seasonal decor awaiting you.' }, { title: 'Dining', desc: 'Savor our dishes crafted with market-fresh ingredients and a 120-reference wine list.' }, { title: 'Service', desc: 'Our team ensures your comfort throughout your meal with attentive, unhurried care.' }, { title: 'Satisfaction', desc: 'A culinary experience to remember — and to return for.' }];
    if (s.includes('coiff') || s.includes('barb') || s.includes('salon') || s.includes('beauté') || s.includes('esthétique'))
      return [{ title: 'Booking', desc: 'Schedule your appointment online at your convenience.' }, { title: 'Consultation', desc: 'A personalized hair diagnosis using L\'Oréal Professionnel analysis tools.' }, { title: 'Styling', desc: 'Expert cutting and coloring with Kérastase and Olaplex treatments.' }, { title: 'Advice', desc: 'Recommendations with specific products to maintain your style at home.' }, { title: 'Result', desc: 'A look that\'s uniquely yours, crafted by certified colorists.' }];
    if (s.includes('garage') || s.includes('mécan') || s.includes('auto') || s.includes('carrosserie'))
      return [{ title: 'Booking', desc: 'Schedule your visit around your timetable.' }, { title: 'Diagnosis', desc: 'Complete vehicle check with Autel MaxiSys diagnostic equipment.' }, { title: 'Quote', desc: 'A clear, detailed estimate with OEM parts reference numbers.' }, { title: 'Repair', desc: 'Quality work with Brembo, Michelin, Mann-Filter parts and a 50-point checklist.' }, { title: 'Delivery', desc: 'Your vehicle returned spotless, with documented service history.' }];
    if (s.includes('avocat') || s.includes('notaire') || s.includes('juridi') || s.includes('droit'))
      return [{ title: 'Contact', desc: 'Tell us about your situation in a confidential initial exchange.' }, { title: 'Consultation', desc: 'A thorough analysis of your case with relevant case law review.' }, { title: 'Strategy', desc: 'A clear course of action with written fee schedule, no surprises.' }, { title: 'Action', desc: 'We defend your interests with rigor and 85% success rate at prud\'hommes.' }, { title: 'Follow-up', desc: 'Weekly case updates until resolution.' }];
    if (s.includes('médec') || s.includes('clinique') || s.includes('dentiste') || s.includes('santé') || s.includes('kiné'))
      return [{ title: 'Appointment', desc: 'Book your visit in just a few clicks.' }, { title: 'Consultation', desc: 'Careful examination with Schiller ECG and modern diagnostic tools.' }, { title: 'Treatment', desc: 'A care plan using electronic prescriptions and HAS-compliant protocols.' }, { title: 'Follow-up', desc: 'Regular monitoring with lab results from Biogroup network.' }, { title: 'Results', desc: 'Rediscover a better quality of life with evidence-based care.' }];
    if (s.includes('fitness') || s.includes('sport') || s.includes('coach') || s.includes('gym') || s.includes('salle'))
      return [{ title: 'Assessment', desc: 'Complete fitness evaluation with InBody 570 body composition analysis.' }, { title: 'Program', desc: 'A personalized training plan using Eleiko bars and Technogym Skillmill.' }, { title: 'Training', desc: 'Sessions led by BPJEPS-certified coaches with Wattbike performance tracking.' }, { title: 'Tracking', desc: 'Monthly InBody measurements and training log review.' }, { title: 'Goals', desc: 'Reach your goals with progressive overload and periodized programming.' }];
    if (s.includes('nettoyag') || s.includes('propreté') || s.includes('ménage'))
      return [{ title: 'Quote', desc: 'An accurate estimate with Kärcher and Taski equipment specifications.' }, { title: 'Planning', desc: 'A flexible schedule that fits your constraints.' }, { title: 'Service', desc: 'Our trained teams work with Ecolab products and WFP window systems.' }, { title: 'Quality Check', desc: 'ISO 9001 quality control with photo documentation after every visit.' }, { title: 'Maintenance', desc: 'Ongoing upkeep with eco-label certified products.' }];
    if (s.includes('jardin') || s.includes('paysag') || s.includes('espace vert'))
      return [{ title: 'Visit', desc: 'An on-site meeting to assess your soil, exposure, and existing plants.' }, { title: 'Design', desc: 'A customized landscape project with DPLG-certified plans and 3D visuals.' }, { title: 'Creation', desc: 'Implementation with STIHL/Honda equipment and Hunter irrigation systems.' }, { title: 'Maintenance', desc: 'Seasonal upkeep with BRF mulching and organic treatments.' }, { title: 'Evolution', desc: 'Adjustments through the seasons and your preferences.' }];
    return [{ title: 'Contact', desc: 'Reach out to share your needs with us.' }, { title: 'Analysis', desc: 'We study your request and identify the best solution.' }, { title: 'Proposal', desc: 'Receive a clear offer, tailored to your budget.' }, { title: 'Delivery', desc: 'Our team works with care and professionalism.' }, { title: 'Follow-up', desc: 'We ensure quality follow-up for your satisfaction.' }];
  }
  if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur') || s.includes('boulanger') || s.includes('pâtissier'))
    return [{ title: 'Réservation', desc: 'Réservez votre table en ligne ou par téléphone, nous préparons votre coin.' }, { title: 'Accueil', desc: 'Un cadre chaleureux avec vaisselle de saison et décoration soignée.' }, { title: 'Dégustation', desc: 'Savourez nos plats cuisinés avec des produits frais du marché et une cave de 120 références.' }, { title: 'Service', desc: 'Notre équipe veille à votre confort sans pression, avec attention constante.' }, { title: 'Satisfait', desc: 'Un moment culinaire mémorable — dont vous aurez envie de revenir.' }];
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon') || s.includes('beauté') || s.includes('esthétique'))
    return [{ title: 'RDV', desc: 'Prenez rendez-vous en ligne quand ça vous convient.' }, { title: 'Consultation', desc: 'Diagnostic capillaire personnalisé avec les outils d\'analyse L\'Oréal Professionnel.' }, { title: 'Coiffage', desc: 'Coupe et coloration expertes avec soins Kérastase et Olaplex.' }, { title: 'Conseils', desc: 'Recommandations de produits spécifiques pour entretenir votre style chez vous.' }, { title: 'Résultat', desc: 'Un look qui vous ressemble, réalisé par des coloristes certifiés.' }];
  if (s.includes('garage') || s.includes('mécan') || s.includes('auto') || s.includes('carrosserie'))
    return [{ title: 'RDV', desc: 'Planifiez votre passage selon votre emploi du temps.' }, { title: 'Diagnostic', desc: 'Contrôle complet avec équipement Autel MaxiSys et valise diagnostic.' }, { title: 'Devis', desc: 'Estimation claire et détaillée avec numéros de références pièces OEM.' }, { title: 'Réparation', desc: 'Travail soigné avec pièces Brembo, Michelin, Mann-Filter et checklist 50 points.' }, { title: 'Livraison', desc: 'Votre véhicule restitué impeccable, historique d\'entretien documenté.' }];
  if (s.includes('avocat') || s.includes('notaire') || s.includes('juridi') || s.includes('droit'))
    return [{ title: 'Contact', desc: 'Échangez avec nous pour nous exposer votre besoin en toute confidentialité.' }, { title: 'Consultation', desc: 'Analyse approfondie de votre dossier avec revue de la jurisprudence applicable.' }, { title: 'Stratégie', desc: 'Ligne de conduite claire avec grille d\'honoraires écrite, pas de surprise.' }, { title: 'Action', desc: 'Défense de vos intérêts avec rigueur et 85% de réussite aux prud\'hommes.' }, { title: 'Suivi', desc: 'Mises à jour hebdomadaires de l\'avancement de votre dossier.' }];
  if (s.includes('médec') || s.includes('clinique') || s.includes('dentiste') || s.includes('santé') || s.includes('kiné'))
    return [{ title: 'RDV', desc: 'Prenez rendez-vous en quelques clics.' }, { title: 'Consultation', desc: 'Examen attentif avec ECG Schiller et outils de diagnostic modernes.' }, { title: 'Traitement', desc: 'Plan de soins avec prescriptions électroniques et protocoles conformes aux HAS.' }, { title: 'Suivi', desc: 'Surveillance régulière avec résultats de laboratoire du réseau Biogroup.' }, { title: 'Résultat', desc: 'Retrouvez une meilleure qualité de vie grâce à une médecine fondée sur les preuves.' }];
  if (s.includes('fitness') || s.includes('sport') || s.includes('coach') || s.includes('gym') || s.includes('salle'))
    return [{ title: 'Bilan', desc: 'Évaluation complète avec analyse de composition corporelle InBody 570.' }, { title: 'Programme', desc: 'Plan d\'entraînement sur mesure avec barres Eleiko et Technogym Skillmill.' }, { title: 'Entraînement', desc: 'Séances encadrées par coaches certifiés BPJEPS avec Wattbike et cardio.' }, { title: 'Suivi', desc: 'Mesures InBody mensuelles et revue du journal d\'entraînement.' }, { title: 'Objectif', desc: 'Atteignez vos objectifs grâce à la surcharge progressive et la périodisation.' }];
  if (s.includes('nettoyag') || s.includes('propreté') || s.includes('ménage'))
    return [{ title: 'Devis', desc: 'Chiffrage précis avec spécifications équipements Kärcher et Taski.' }, { title: 'Planification', desc: 'Planning flexible qui s\'adapte à vos contraintes.' }, { title: 'Intervention', desc: 'Nos équipes formées travaillent avec produits Ecolabel et systèmes WFP vitres.' }, { title: 'Contrôle', desc: 'Contrôle qualité ISO 9001 avec documentation photo après chaque passage.' }, { title: 'Régulier', desc: 'Entretien maintenu avec produits certifiés écolabel.' }];
  if (s.includes('jardin') || s.includes('paysag') || s.includes('espace vert'))
    return [{ title: 'Visite', desc: 'Rendez-vous sur site pour analyser votre sol, exposition et végétation existante.' }, { title: 'Conception', desc: 'Projet paysager personnalisé avec plans certifiés DPLG et visualisation 3D.' }, { title: 'Réalisation', desc: 'Mise en œuvre avec équipements STIHL/Honda et arrosage Hunter.' }, { title: 'Entretien', desc: 'Suivi saisonnier avec paillage BRF et traitements biologiques.' }, { title: 'Évolution', desc: 'Ajustements au fil des saisons et de vos envies.' }];
  return [{ title: 'Contact', desc: 'Échangez avec nous pour nous exposer votre besoin.' }, { title: 'Analyse', desc: 'Nous étudions votre demande et identifions la meilleure solution.' }, { title: 'Proposition', desc: 'Recevez une offre claire, adaptée à votre budget et vos attentes.' }, { title: 'Réalisation', desc: 'Notre équipe intervient avec soin et professionnalisme.' }, { title: 'Suivi', desc: 'Nous assurons un suivi qualité pour votre entière satisfaction.' }];
}

export function getGuarantees(sector: string, lang: 'fr' | 'en' = 'fr'): Array<{ title: string; icon: string }> {
  const s = (sector || '').toLowerCase();
  const g: Record<string, Array<{ title: string; icon: string; titleEn: string }>> = {
    plomberie: [{ title: 'Garantie Décennale Assurée', icon: 'shield-check', titleEn: '10-Year Decennial Warranty' }, { title: 'Dépannage < 2h', icon: 'clock', titleEn: 'Response < 2h' }, { title: 'Devis Gratuit Sans Engagement', icon: 'file-text', titleEn: 'Free No-Obligation Quote' }, { title: 'Artisan RGE & Qualibat', icon: 'badge-check', titleEn: 'RGE & Qualibat Certified' }],
    electricien: [{ title: 'Certifié Consuel', icon: 'shield-check', titleEn: 'Consuel Certified' }, { title: 'Garantie Décennale', icon: 'badge-check', titleEn: '10-Year Decennial Warranty' }, { title: 'Conformité NFC 15-100', icon: 'zap', titleEn: 'NFC 15-100 Compliant' }, { title: 'Devis Gratuit < 24h', icon: 'file-text', titleEn: 'Free Quote < 24h' }],
    coiffeur: [{ title: 'Produits L\'Oréal & Kérastase', icon: 'sparkles', titleEn: 'L\'Oréal & Kérastase Products' }, { title: 'Outils Stérilisés Autoclave', icon: 'shield-check', titleEn: 'Autoclave Sterilized Tools' }, { title: 'Coloristes Certifiés', icon: 'award', titleEn: 'Certified Colorists' }, { title: 'Satisfait ou Refait Offert', icon: 'heart', titleEn: 'Satisfaction or Free Redo' }],
    restaurant: [{ title: 'Produits Frais du Marché', icon: 'leaf', titleEn: 'Fresh Market Ingredients' }, { title: 'Carte 120 Vins', icon: 'wine', titleEn: '120-Wine List' }, { title: 'Terrasse 120 Couverts', icon: 'sun', titleEn: '120-Seat Terrace' }, { title: 'Service Sans Pression', icon: 'clock', titleEn: 'No-Pressure Service' }],
    garage: [{ title: 'Garantie 12 Mois Pièces', icon: 'shield-check', titleEn: '12-Month Parts Warranty' }, { title: 'Diagnostic Autel MaxiSys', icon: 'scan', titleEn: 'Autel MaxiSys Diagnosis' }, { title: 'Checklist 50 Points', icon: 'clipboard-check', titleEn: '50-Point Checklist' }, { title: 'Véhicule de Courtoisie', icon: 'car', titleEn: 'Courtesy Vehicle' }],
    nettoyage: [{ title: 'Produits Écolabel Ecolab', icon: 'leaf', titleEn: 'Ecolab Eco-Label Products' }, { title: 'Certifié ISO 9001', icon: 'shield-check', titleEn: 'ISO 9001 Certified' }, { title: 'Système WFP Sans Traces', icon: 'droplets', titleEn: 'WFP Streak-Free System' }, { title: 'Assurance RC Pro', icon: 'badge-check', titleEn: 'Professional Liability Insurance' }],
    jardin: [{ title: 'Paysagiste DPLG Certifié', icon: 'award', titleEn: 'DPLG Certified Landscaper' }, { title: 'Matériel STIHL/Honda', icon: 'tree-deciduous', titleEn: 'STIHL/Honda Equipment' }, { title: 'Arrosage Hunter', icon: 'sprout', titleEn: 'Hunter Irrigation System' }, { title: 'Plantes Garanties 1 An', icon: 'sprout', titleEn: '1-Year Plant Guarantee' }],
    fitness: [{ title: 'Coaches BPJEPS Diplômés', icon: 'award', titleEn: 'BPJEPS-Certified Coaches' }, { title: 'Matériel Eleiko & Technogym', icon: 'dumbbell', titleEn: 'Eleiko & Technogym Equipment' }, { title: 'Analyse InBody 570', icon: 'activity', titleEn: 'InBody 570 Analysis' }, { title: 'Sans Engagement', icon: 'badge-check', titleEn: 'No Commitment' }],
    medical: [{ title: 'Conventionné Sécurité Sociale', icon: 'stethoscope', titleEn: 'Insurance Accepted' }, { title: '3ème Payant', icon: 'credit-card', titleEn: 'Direct Billing' }, { title: 'Équipements Schiller & HAS', icon: 'shield-check', titleEn: 'Schiller & HAS Equipment' }, { title: 'Laboratoire Biogroup', icon: 'flask-conical', titleEn: 'Biogroup Lab Network' }],
    avocat: [{ title: 'Avocat Inscrit au Barreau', icon: 'scale', titleEn: 'Bar-Certified Lawyer' }, { title: 'Honoraires Grille Écrite', icon: 'file-text', titleEn: 'Written Fee Schedule' }, { title: 'Confidentialité Absolue', icon: 'shield', titleEn: 'Absolute Confidentiality' }, { title: '85% Réussite Prud\'hommes', icon: 'trophy', titleEn: '85% Prud\'homme Win Rate' }],
    default: [{ title: 'Équipe Certifiée', icon: 'badge-check', titleEn: 'Certified Team' }, { title: 'Devis Clair & Détaillé', icon: 'file-text', titleEn: 'Clear Detailed Quote' }, { title: 'Intervention < 48h', icon: 'clock', titleEn: 'Response < 48h' }, { title: 'Satisfaction Garantie', icon: 'heart', titleEn: 'Satisfaction Guaranteed' }]
  };
  let matched = g.default;
  for (const [key, val] of Object.entries(g)) {
    if (key !== 'default' && s.includes(key)) { matched = val; break; }
  }
  return matched.map(item => ({ title: lang === 'en' ? item.titleEn : item.title, icon: item.icon }));
}

export function getHeroBadge(sector: string): { icon: string; text: string } {
  const s = (sector || '').toLowerCase();
  if (s.includes('plomb')) return { icon: 'droplets', text: 'Plombier RGE Qualibat' };
  if (s.includes('électricien') || s.includes('electric')) return { icon: 'zap', text: 'Électricien Certifié Consuel' };
  if (s.includes('coiff') || s.includes('barb')) return { icon: 'scissors', text: 'Coloriste Certifié L\'Oréal' };
  if (s.includes('restaurant') || s.includes('cuisin')) return { icon: 'chef-hat', text: 'Chef — Produits Frais du Marché' };
  if (s.includes('garage') || s.includes('mécan')) return { icon: 'wrench', text: 'Garage Autel MaxiSys' };
  if (s.includes('nettoy') || s.includes('ménage')) return { icon: 'sparkles', text: 'Nettoyage Certifié ISO 9001' };
  if (s.includes('jardin') || s.includes('paysag')) return { icon: 'leaf', text: 'Paysagiste DPLG Certifié' };
  if (s.includes('fitness') || s.includes('sport')) return { icon: 'dumbbell', text: 'Coach BPJEPS Diplômé' };
  if (s.includes('médec') || s.includes('santé') || s.includes('dentiste')) return { icon: 'stethoscope', text: 'Conventionné Sécurité Sociale' };
  if (s.includes('avocat') || s.includes('juridi')) return { icon: 'scale', text: 'Avocat Inscrit au Barreau' };
  return { icon: 'badge-check', text: 'Professionnel Certifié' };
}

export function getGalleryDesc(sector: string, lang: 'fr' | 'en' = 'fr'): string {
  const s = (sector || '').toLowerCase();
  if (lang === 'en') {
    if (s.includes('restaurant') || s.includes('cuisin')) return 'A glimpse into our kitchen, our seasonal dishes, and the market-fresh ingredients we work with.';
    if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) return 'Our salon, the L\'Oréal and Kérastase products we use, and the looks we create.';
    if (s.includes('garage') || s.includes('mécan')) return 'Our workshop equipped with Autel MaxiSys, Brembo parts, and the vehicles we service.';
    if (s.includes('jardin') || s.includes('paysag')) return 'Our STIHL and Honda equipment, Hunter irrigation systems, and the gardens we transform.';
    if (s.includes('fitness') || s.includes('sport')) return 'Our Eleiko bars, Technogym Skillmill, Wattbike bikes, and InBody 570 station.';
    if (s.includes('nettoyag') || s.includes('propreté')) return 'Our Kärcher and Taski equipment, Ecolab eco-label products, and the spaces we transform.';
    if (s.includes('médec') || s.includes('santé')) return 'Our Schiller ECG equipment, modern consultation rooms, and our patient-centered approach.';
    if (s.includes('avocat') || s.includes('juridi')) return 'Our consultation rooms, our case files, and our commitment to defending your interests.';
    return 'A glimpse into our world, our tools, and what we stand for.';
  }
  if (s.includes('restaurant') || s.includes('cuisin')) return 'Un aperçu de notre cuisine, nos plats de saison et les produits frais du marché que nous travaillons.';
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) return 'Notre salon, les produits L\'Oréal et Kérastase que nous utilisons, et les looks que nous créons.';
  if (s.includes('garage') || s.includes('mécan')) return 'Notre atelier équipé Autel MaxiSys, nos pièces Brembo, et les véhicules que nous entretenons.';
  if (s.includes('jardin') || s.includes('paysag')) return 'Nos équipements STIHL et Honda, nos systèmes Hunter, et les jardins que nous transformons.';
  if (s.includes('fitness') || s.includes('sport')) return 'Nos barres Eleiko, Technogym Skillmill, vélos Wattbike, et notre station InBody 570.';
  if (s.includes('nettoyag') || s.includes('propreté')) return 'Nos équipements Kärcher et Taski, produits écolabels Ecolab, et les espaces que nous transformons.';
  if (s.includes('médec') || s.includes('santé')) return 'Nos équipements Schiller ECG, nos salles de consultation modernes, et notre approche centrée patient.';
  if (s.includes('avocat') || s.includes('juridi')) return 'Nos salles de consultation, nos dossiers, et notre engagement à défendre vos intérêts.';
  return 'Quelques moments qui reflètent notre univers, nos outils et notre engagement.';
}

export function getPrivacyContent(lang: 'fr' | 'en', companyName: string, email: string, address: string): string {
  if (lang === 'en') {
    return `<h2>Privacy Policy</h2><p><strong>${companyName}</strong> respects your privacy. This policy describes how we collect, use, and protect your personal data when you use our website and services.</p><h3>Data Collection</h3><p>We may collect the following personal data: name, email address, phone number, and any information you provide through our contact forms.</p><h3>Data Usage</h3><p>Your data is used solely to respond to your inquiries and provide our services. We do not sell or share your data with third parties without your consent.</p><h3>Data Security</h3><p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction.</p><h3>Contact</h3><p>For any questions regarding this policy, contact us at <a href="mailto:${email}">${email}</a>.</p>`;
  }
  return `<h2>Politique de Confidentialité</h2><p><strong>${companyName}</strong> respecte votre vie privée. Cette politique décrit comment nous collectons, utilisons et protégeons vos données personnelles lorsque vous utilisez notre site web et nos services.</p><h3>Collecte de Données</h3><p>Nous pouvons collecter les données personnelles suivantes : nom, adresse email, numéro de téléphone et toute information que vous fournissez via nos formulaires de contact.</p><h3>Utilisation des Données</h3><p>Vos données sont utilisées uniquement pour répondre à vos demandes et fournir nos services. Nous ne vendons ni ne partageons vos données avec des tiers sans votre consentement.</p><h3>Sécurité des Données</h3><p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès, modification ou destruction non autorisés.</p><h3>Contact</h3><p>Pour toute question concernant cette politique, contactez-nous à <a href="mailto:${email}">${email}</a>.</p>`;
}

export function generateFeaturesFromService(name: string, description: string, sector: string): string[] {
  const serviceName = (name || '').toLowerCase();
  const serviceDesc = (description || '').toLowerCase();
  const s = (sector || '').toLowerCase();
  const all = `${serviceName} ${serviceDesc}`;

  const defaultFeatures = ['Service professionnel', 'Intervention garantie', 'Devis gratuit'];

  const sectorFeatures: Record<string, string[]> = {
    plomberie: ['Détection fuite caméra thermique FLIR', 'Chaudière Vaillant/Valiant', 'Conformité NF C 15-100', 'Robinetterie Grohe/Hansgrohe'],
    electricien: ['Diagnostic Fluke multicompteur', 'Tableau Legrand/Schneider/Hager', 'Conformité NFC 15-100 Consuel', 'Domotique Somfy/KNX', 'IRVE certifié borne recharge'],
    coiffeur: ['Gamme L\'Oréal Kérastase Olaplex', 'Fauteuil Takara Belmont', 'Kératine Cadiveu sans formol', 'Rasoir Taylor of Old Bond Street'],
    restaurant: ['Produits frais marché du jour', 'Carte 120 références vins', 'Menu dégustation 5 services 45€', 'Terrasse 120 couverts'],
    garage: ['Valise Autel MaxiSys diagnostic', 'Pièces Brembo Michelin Mann-Filter', 'Checklist entretien 50 points', 'Garantie 12 mois pièces'],
    nettoyage: ['Aspirateur Kärcher/Taski/Numatic', 'Produits écolabels Ecolab', 'Norme ISO 9001 qualité', 'Système WFP sans traces vitres'],
    jardin: ['Matériel STIHL/Honda professionnel', 'Arrosage Hunter programmable', 'Certification DPLG paysagiste', 'Paillage BRF broyage'],
    fitness: ['Barres Eleiko compétition', 'Tapis Technogym Skillmill', 'Vélo Wattbike performance', 'Analyse corporelle InBody 570'],
    medical: ['ECG Schiller diagnostics', 'Chaine du froid conforme HAS', 'Prescriptions électroniques', 'Laboratoire Biogroup analyses'],
    avocat: ['85% réussite prud\'hommes', 'Mises à jour dossier hebdo', 'Grille honoraires écrite', 'Confidentialité renforcée'],
  };

  const featureDictionary: Record<string, string[]> = {
    'urgence': ['Disponible 24h/24', 'Déplacement < 2h', 'Dépanneur certifié'],
    'depannage': ['Réparation durable garantie', 'Pièces d\'origine', 'Tarifs transparents'],
    'installation': ['Pose certifiée RGE', 'Conformité normes NF', 'Garantie décennale'],
    'mise aux normes': ['Conformité NFC 15-100', 'Certificat Consuel', 'Sécurité garantie'],
    'coupe': ['Visagisme personnalisé', 'Conseil entretien maison', 'Produits L\'Oréal/Kérastase'],
    'coloration': ['Coloration sans ammoniaque', 'Protocole Olaplex', 'Brillance longue durée'],
    'barbier': ['Rasoir ouvert Taylor', 'Mousse savon artisanal', 'Ambiance vintage'],
    'menu': ['Produits frais marché', 'Cuisine maison 100%', 'Accord mets-vins sommelier'],
    'moteur': ['Diagnostic Autel MaxiSys', 'Réparation garantie 12 mois', 'Pièces OEM d\'origine'],
    'ménage': ['Produits écolabels Ecolab', 'Équipe certifiée ISO 9001', 'Contrôle qualité photo'],
    'coaching': ['Programme InBody 570', 'Nutrition sur mesure', 'Résultats mesurables'],
    'consultation': ['Diagnostic précis', 'Protocole HAS', 'Disponibilité sous 48h'],
  };

  if (s in sectorFeatures) {
    return sectorFeatures[s];
  }

  for (const [keyword, features] of Object.entries(featureDictionary)) {
    if (all.includes(keyword)) return features;
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
