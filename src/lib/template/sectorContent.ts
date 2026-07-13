// ============================================================
// LeadForge AI — Sector Copy Packs
// Marketing copy (whyUs / services / faq / trust badges) per
// sector, in French and English. Pure data + a small resolver.
// No HTML output is produced here (wiring happens in a later task).
// ============================================================

export interface SectorCopy {
  whyUs: { title: string; desc: string }[];
  services: { name: string; desc: string }[];
  faq: { q: string; a: string }[];
  bespoke: 'restaurant' | 'coach' | 'medical' | 'artisan' | 'coiffeur' | 'avocat' | 'nettoyage' | 'jardin' | 'garage' | null;
  trustBadges: string[];
}

type Lang = 'fr' | 'en';
type Pack = { fr: SectorCopy; en: SectorCopy };

// Each service `name` MUST match the canonical `services` name used in
// SECTOR_ULTIMATE_TEMPLATES (see ultimateTemplate.ts) so the later wiring
// (getServiceDescriptions) can resolve descriptions 1:1.
const SECTOR_CONTENT_PACKS: Record<string, Pack> = {
  electricien: {
    fr: {
      bespoke: 'artisan',
      trustBadges: ['Devis gratuit', 'Intervention < 2h', 'Garantie décennale', 'Consuel certifié'],
      whyUs: [
        { title: 'Sécurité avant tout', desc: 'Votre installation est mise aux normes NFC 15-100 pour protéger votre famille et vos biens.' },
        { title: 'Intervention en moins de 2h', desc: "En cas de panne, un électricien se déplace rapidement pour rétablir le courant." },
        { title: 'Devis transparent', desc: 'Un prix clair et détaillé avant toute intervention, sans frais cachés.' },
        { title: 'Artisan certifié Consuel', desc: 'Des travaux conformes et garantis, réalisés par un professionnel qualifié.' }
      ],
      services: [
        { name: 'Mise aux Normes', desc: "Nous remettons votre installation aux normes NFC 15-100 : tableau électrique neuf, mise à la terre et protection différentielle. Une garantie de sécurité pour votre habitat, conforme à la réglementation en vigueur." },
        { name: 'Dépannage Électrique', desc: "Pannes, court-circuits ou disjonctions intempestives : nous diagnostiquons la cause et réparons durablement. Intervention rapide pour vous éviter les coupures répétées." },
        { name: 'Installation Complète', desc: "De la construction à la rénovation, nous réalisons le câblage complet, les prises, les inters et l'éclairage. Une installation sur mesure, pensée pour votre confort au quotidien." },
        { name: 'Domotique & Smart Home', desc: "Pilotez vos volets, votre éclairage et votre chauffage depuis votre smartphone. Nous installons des solutions connectées simples, fiables et évolutives." },
        { name: 'Éclairage LED', desc: "Optez pour un éclairage économique et design : spots encastrés, suspensions et éclairage extérieur. Moins de consommation, plus de confort visuel." },
        { name: 'Bornes de Recharge', desc: "Nous installons votre borne de recharge pour véhicule électrique (Wallbox) avec certification IRVE. Rechargez chez vous en toute sécurité, à domicile comme en entreprise." }
      ],
      faq: [
        { q: "Faut-il vraiment mettre son installation aux normes ?", a: "Si votre tableau date d'avant 2002 ou présente des disjonctions fréquentes, la mise aux normes NFC 15-100 est recommandée pour votre sécurité et peut être exigée lors d'une vente." },
        { q: "Combien de temps pour un dépannage ?", a: "En général nous intervenons en moins de 2h pour les urgences et diagnostiquons la panne dès la première visite." },
        { q: "Installez-vous les bornes de recharge pour voiture électrique ?", a: "Oui, nous posons des Wallbox certifiées IRVE pour les particuliers comme pour les entreprises." }
      ]
    },
    en: {
      bespoke: 'artisan',
      trustBadges: ['Free quote', 'Response < 2h', '10-Year Warranty', 'Consuel certified'],
      whyUs: [
        { title: 'Safety first', desc: 'Your installation is brought up to NFC 15-100 standards to protect your family and property.' },
        { title: 'Response within 2h', desc: 'In case of breakdown, an electrician is dispatched quickly to restore power.' },
        { title: 'Transparent quote', desc: 'A clear, detailed price before any work, with no hidden fees.' },
        { title: 'Consuel-certified pro', desc: 'Compliant, guaranteed work carried out by a qualified professional.' }
      ],
      services: [
        { name: 'Mise aux Normes', desc: "We bring your installation up to NFC 15-100 standards: new consumer unit, grounding, and differential protection. A safety guarantee for your home, fully compliant with current regulations." },
        { name: 'Dépannage Électrique', desc: 'Outages, short circuits, or repeated tripping: we diagnose the cause and repair it for good. Fast response to keep the lights on.' },
        { name: 'Installation Complète', desc: 'From new builds to renovations, we handle full wiring, sockets, switches, and lighting. A tailored installation designed around your everyday comfort.' },
        { name: 'Domotique & Smart Home', desc: 'Control your shutters, lighting, and heating from your phone. We install connected solutions that are simple, reliable, and future-proof.' },
        { name: 'Éclairage LED', desc: 'Choose economical, stylish lighting: recessed spots, pendants, and outdoor lighting. Less consumption, more visual comfort.' },
        { name: 'Bornes de Recharge', desc: 'We install your EV charging point (Wallbox) with IRVE certification. Charge safely at home or at your business.' }
      ],
      faq: [
        { q: 'Do I really need to bring my installation up to standard?', a: 'If your consumer unit predates 2002 or trips frequently, bringing it up to NFC 15-100 is recommended for your safety and may be required when selling.' },
        { q: 'How quickly can you fix a fault?', a: 'We usually respond within 2h for emergencies and diagnose the fault on the first visit.' },
        { q: 'Do you install EV charging points?', a: 'Yes, we fit IRVE-certified Wallboxes for both homeowners and businesses.' }
      ]
    }
  },

  plombier: {
    fr: {
      bespoke: 'artisan',
      trustBadges: ['Devis gratuit', 'Urgence 24h/24', 'Garantie décennale', 'Artisan local'],
      whyUs: [
        { title: "Intervention d'urgence 24h/24", desc: "Une fuite ne prévient pas : nous intervenons 7j/7, souvent en moins de 2h, pour limiter les dégâts." },
        { title: 'Garantie décennale', desc: 'Tous nos travaux sont couverts par une assurance décennale, pour votre tranquillité d\'esprit.' },
        { title: 'Devis gratuit et détaillé', desc: "Vous connaissez le prix avant le premier coup de clé, sans mauvaise surprise." },
        { title: 'Artisan local de confiance', desc: "Un plombier installé près de chez vous, qui connaît vos installations et reste disponible." }
      ],
      services: [
        { name: 'Dépannage 24h/24', desc: "Fuite, canalisation bouchée ou panne : nous intervenons en urgence, 7j/7, pour stopper le sinistre et rétablir votre confort rapidement." },
        { name: 'Installation Sanitaire', desc: "Pose et remplacement de robinetterie, éviers, WC et douches. Un travail soigné, conforme aux normes, réalisé par un artisan expérimenté." },
        { name: 'Chauffage & Chaudière', desc: "Installation, dépannage et entretien de chaudières gaz ou fioul, pompes à chaleur et radiateurs. Restez au chaud avec une installation fiable." },
        { name: 'Détection de Fuites', desc: "Localisation précise sans casse grâce à la caméra thermique et au gaz traceur. Nous colmatons à la source pour éviter les récidives." },
        { name: 'Rénovation Salle de Bain', desc: "De la mosaïque au meuble vasque, nous créons la salle de bain à votre image, clé en main, avec un devis détaillé." },
        { name: 'Entretien Annuel', desc: "Un contrôle préventif de votre chauffage et de vos canalisations prolonge la durée de vie de vos équipements et prévient les pannes." }
      ],
      faq: [
        { q: "Que faire en cas de fuite d'eau ?", a: "Fermez le robinet d'arrêt général, coupez l'électricité si l'eau approche d'une prise, puis appelez-nous : nous intervenons en urgence 7j/7." },
        { q: "Proposez-vous un entretien de chaudière ?", a: "Oui, notre contrat annuel inclut le contrôle du chauffage, le détartrage et la mise aux normes de sécurité." },
        { q: "Vos travaux sont-ils garantis ?", a: "Oui, l'ensemble de nos interventions est couvert par une garantie décennale et fait l'objet d'un devis écrit avant chantier." }
      ]
    },
    en: {
      bespoke: 'artisan',
      trustBadges: ['Free quote', '24/7 emergency', '10-Year Warranty', 'Local pro'],
      whyUs: [
        { title: '24/7 emergency call-out', desc: 'A leak never warns you: we step in 7 days a week, often within 2h, to limit the damage.' },
        { title: '10-Year Warranty', desc: 'All our work is covered by a decade-long warranty, for total peace of mind.' },
        { title: 'Free, detailed quote', desc: 'You know the price before the first wrench turns, with no nasty surprises.' },
        { title: 'Trusted local plumber', desc: 'A plumber based near you, who knows your setup and stays reachable.' }
      ],
      services: [
        { name: 'Dépannage 24h/24', desc: 'Leak, blocked pipe, or breakdown: we respond in an emergency, 7 days a week, to stop the damage and restore your comfort fast.' },
        { name: 'Installation Sanitaire', desc: 'Fitting and replacement of taps, sinks, toilets, and showers. Careful, standards-compliant work by an experienced tradesperson.' },
        { name: 'Chauffage & Chaudière', desc: 'Installation, repair, and servicing of gas or oil boilers, heat pumps, and radiators. Stay warm with a reliable system.' },
        { name: 'Détection de Fuites', desc: 'Precise, no-tear detection using thermal cameras and tracer gas. We seal at the source to prevent recurrence.' },
        { name: 'Rénovation Salle de Bain', desc: 'From tiling to the vanity unit, we build the bathroom you envision, turnkey, with a detailed quote.' },
        { name: 'Entretien Annuel', desc: 'A preventive check of your heating and pipes extends equipment life and prevents breakdowns.' }
      ],
      faq: [
        { q: 'What should I do in case of a water leak?', a: 'Shut the main stopcock, cut the power if water nears an outlet, then call us: we respond to emergencies 7 days a week.' },
        { q: 'Do you offer boiler servicing?', a: 'Yes, our annual plan includes a heating check, descaling, and a safety compliance review.' },
        { q: 'Is your work guaranteed?', a: 'Yes, all our interventions are covered by a 10-year warranty and quoted in writing before any site work.' }
      ]
    }
  },

  coiffeur: {
    fr: {
      bespoke: 'coiffeur',
      trustBadges: ['Conseil gratuit', 'Produits bio', 'Outils stérilisés', 'Satisfait ou refait'],
      whyUs: [
        { title: 'Visagisme personnalisé', desc: 'Chaque coupe est pensée pour votre morphologie et votre style de vie.' },
        { title: 'Produits respectueux', desc: 'Nous travaillons avec des soins doux et, sur demande, des colorations végétales.' },
        { title: 'Outils stérilisés', desc: 'Hygiène rigoureuse : chaque instrument est stérilisé après chaque client.' },
        { title: 'Satisfait ou refait', desc: "Si le résultat ne vous convient pas, nous y remédions gratuitement." }
      ],
      services: [
        { name: 'Coupes & Styles', desc: "Coupe sur-mesure femme et homme avec visagisme personnalisé. Nos techniques actuelles et nos conseils d'entretien prolongent l'effet entre deux rendez-vous." },
        { name: 'Barbier Traditionnel', desc: "Rasage à l'ancienne, taille de barbe et soins du visage dans un rituel masculin. Un moment de détente autant qu'une finition précise." },
        { name: 'Coloration Expert', desc: "Balayages, ombrés et couleurs sur mesure, y compris des formules végétales respectueuses de la fibre. Une brillance longue durée, sans dégradation." },
        { name: 'Soins Capillaires', desc: "Botox capillaire, kératine et massages crâniens pour cheveux abîmés ou secs. On répare en profondeur tout en vous relaxant." },
        { name: 'Extensions Volume', desc: "Rajouts de longueur et d'épaisseur en pose à froid ou tape-in, discrète et durable. L'entretien est inclus pour préserver le résultat." },
        { name: 'Chignons & Événements', desc: "Coiffures de cérémonie, mariage et événements, avec option maquillage. Vous êtes sublime, sereine, pour les grands jours." }
      ],
      faq: [
        { q: 'Proposez-vous des colorations sans ammoniaque ?', a: 'Oui, nous utilisons des colorations végétales et des techniques respectueuses de la fibre capillaire sur simple demande.' },
        { q: 'Combien de temps dure une pose d\'extensions ?', a: 'Selon la technique (tape-in ou pose à froid), comptez entre 1h30 et 3h, entretien inclus dans le soin.' },
        { q: 'Que signifie « satisfait ou refait » ?', a: "Si la coupe ne vous convient pas à la sortie du salon, nous la reprenons gratuitement lors d'un rendez-vous dédié." }
      ]
    },
    en: {
      bespoke: 'coiffeur',
      trustBadges: ['Free consult', 'Organic products', 'Sterilized tools', 'Redo if unhappy'],
      whyUs: [
        { title: 'Personalized face-shaping', desc: 'Every cut is designed around your features and lifestyle.' },
        { title: 'Gentle products', desc: 'We use kind formulations and, on request, plant-based color.' },
        { title: 'Sterilized tools', desc: 'Strict hygiene: every instrument is sterilized after each client.' },
        { title: 'Redo if unhappy', desc: "If the result isn't right, we fix it free of charge." }
      ],
      services: [
        { name: 'Coupes & Styles', desc: 'Tailored cuts for men and women with personalized face-shaping. Current techniques and aftercare advice keep the look fresh between visits.' },
        { name: 'Barbier Traditionnel', desc: "Old-fashioned shave, beard shaping, and facial care in a men's ritual. As relaxing as it is precise." },
        { name: 'Coloration Expert', desc: 'Balayage, ombre, and custom color, including plant-based formulas that respect the hair. Long-lasting shine without damage.' },
        { name: 'Soins Capillaires', desc: 'Capillary botox, keratin, and scalp massages for damaged or dry hair. We repair deep down while you unwind.' },
        { name: 'Extensions Volume', desc: 'Length and volume add-ons in cold or tape-in application, discreet and durable. Aftercare is included to preserve the result.' },
        { name: 'Chignons & Événements', desc: 'Ceremony, wedding, and event styling, with optional makeup. You look radiant and relaxed on the big day.' }
      ],
      faq: [
        { q: 'Do you offer ammonia-free color?', a: 'Yes, we use plant-based color and hair-friendly techniques on request.' },
        { q: 'How long does an extension appointment take?', a: 'Depending on the method (tape-in or cold application), allow 1h30 to 3h, with aftercare included.' },
        { q: 'What does "redo if unhappy" mean?', a: "If the cut isn't right when you leave, we redo it free of charge at a dedicated appointment." }
      ]
    }
  },

  restaurant: {
    fr: {
      bespoke: 'restaurant',
      trustBadges: ['Réservation en ligne', 'Produits frais', 'Parking gratuit', 'Avis clients'],
      whyUs: [
        { title: 'Produits frais du marché', desc: 'Nos plats sont préparés chaque jour à partir de produits de saison.' },
        { title: 'Ambiance chaleureuse', desc: 'Un cadre convivial et un accueil soigné pour vos moments en famille ou entre amis.' },
        { title: 'Carte des vins réfléchie', desc: 'Des accords mets-vins sélectionnés pour sublimer chaque assiette.' },
        { title: 'Service jusqu\'à tard', desc: 'Réservation facile et service continu pour ne jamais vous faire attendre.' }
      ],
      services: [
        { name: 'Cuisine Maison', desc: "Tous nos plats sont préparés sur place, avec des produits locaux et des recettes authentiques. Une cuisine faite minute qui respecte le goût des vrais aliments." },
        { name: 'Menu du Jour', desc: "Une formule déjeuner équilibrée entrée + plat + dessert, à petit prix. Produits frais et cuisson minute pour une pause méridienne réussie." },
        { name: 'Spécialités', desc: "Nos plats signature : recettes du terroir, grillades et poissons frais. Ce qui fait la réputation de la maison, à chaque service." },
        { name: 'Événements & Groupes', desc: "Repas de famille, anniversaires et séminaires dans une salle privative. Un menu sur mesure et un service à votre rythme." },
        { name: 'Service Traiteur', desc: "Plateaux repas, buffets et livraison pour vos réceptions professionnelles. Une cuisine de restaurant, chez vous ou sur votre lieu d'événement." },
        { name: 'Boissons & Vins', desc: "Une carte de vins régionaux, de cocktails maison et de bières artisanales. L'accord parfait pour accompagner vos plats." }
      ],
      faq: [
        { q: 'Proposez-vous des menus pour groupes ?', a: 'Oui, nous concevons des formules sur mesure pour les événements et les séminaires, avec une salle privative selon disponibilité.' },
        { q: 'Y a-t-il des options végétariennes ?', a: 'Oui, notre cuisine maison propose systématiquement au moins une option végétarienne et peut adapter sur demande.' },
        { q: 'Comment réserver une table ?', a: 'Vous pouvez réserver en ligne ou par téléphone ; nous confirmons sous peu et gardons votre table en priorité.' }
      ]
    },
    en: {
      bespoke: 'restaurant',
      trustBadges: ['Book online', 'Fresh produce', 'Free parking', 'Customer reviews'],
      whyUs: [
        { title: 'Fresh market produce', desc: 'Our dishes are prepared daily from seasonal ingredients.' },
        { title: 'Warm atmosphere', desc: 'A welcoming setting and attentive service for time with family or friends.' },
        { title: 'Thoughtful wine list', desc: 'Selected food-and-wine pairings to elevate every plate.' },
        { title: 'Service until late', desc: 'Easy booking and continuous service so you never wait.' }
      ],
      services: [
        { name: 'Cuisine Maison', desc: 'Every dish is prepared on site with local produce and authentic recipes. Cooked to order, respecting the true taste of real food.' },
        { name: 'Menu du Jour', desc: 'A balanced lunch deal — starter, main, dessert — at a gentle price. Fresh produce and cooked-to-order for a successful midday break.' },
        { name: 'Spécialités', desc: 'Our signature dishes: regional recipes, grills, and fresh fish. What built the house\'s reputation, every service.' },
        { name: 'Événements & Groupes', desc: 'Family meals, birthdays, and seminars in a private room. A tailored menu and service at your own pace.' },
        { name: 'Service Traiteur', desc: 'Meal trays, buffets, and delivery for your corporate events. Restaurant-quality food, at home or at your venue.' },
        { name: 'Boissons & Vins', desc: 'A list of regional wines, house cocktails, and craft beers. The perfect match for your dishes.' }
      ],
      faq: [
        { q: 'Do you offer group menus?', a: 'Yes, we design custom packages for events and seminars, with a private room subject to availability.' },
        { q: 'Are there vegetarian options?', a: 'Yes, our house kitchen always offers at least one vegetarian option and can adapt on request.' },
        { q: 'How do I book a table?', a: 'You can book online or by phone; we confirm shortly and keep your table prioritized.' }
      ]
    }
  },

  dentiste: {
    fr: {
      bespoke: 'medical',
      trustBadges: ['Urgence quotidienne', 'Cabinet équipé', 'Soins indolores', 'Stérilisation garantie'],
      whyUs: [
        { title: 'Soins sans douleur', desc: 'Des techniques modernes et une anesthésie maîtrisée pour des soins sereins.' },
        { title: 'Cabinet équipé', desc: 'Radiographie numérique et stérilisation intégrée pour un diagnostic fiable.' },
        { title: 'Prise en charge globale', desc: "De la prévention à l'esthétique, nous suivons votre santé bucco-dentaire." },
        { title: 'Urgences prises rapidement', desc: "Un créneau d'urgence est réservé chaque jour pour les douleurs aiguës." }
      ],
      services: [
        { name: 'Soins dentaires', desc: "Détartrage, caries et soins conservateurs réalisés avec douceur et précision. Nous privilégions la prévention pour garder vos dents saines le plus longtemps possible." },
        { name: 'Blanchiment', desc: "Un blanchiment professionnel sous contrôle dentaire, plus sûr et plus durable qu'un kit en libre-service. Un sourire éclairci sans abîmer l'émail." },
        { name: 'Orthodontie', desc: "Aligneurs transparents ou appareils pour enfants et adultes, suivis régulièrement. Un traitement progressif pour un sourire droit et fonctionnel." },
        { name: 'Urgence dentaire', desc: "Douleur vive, dent fracturée ou infection : un créneau d'urgence vous est réservé chaque jour. Nous calmons la douleur et traitons la cause rapidement." },
        { name: 'Implantologie', desc: "Remplacement d'une ou plusieurs dents manquantes par implants en titane, ancrés dans l'os. Une solution stable et durable qui préserve l'os." },
        { name: 'Esthétique du sourire', desc: "Facettes, couronnes et rééquilibrage gingival pour harmoniser votre sourire. Un résultat naturel, pensé avec vous lors d'une consultation." }
      ],
      faq: [
        { q: 'Le blanchiment abîme-t-il les dents ?', a: 'Réalisé sous contrôle dentaire, le blanchiment professionnel est sûr et n\'altère pas l\'émail ; nous vérifions au préalable l\'absence de contre-indications.' },
        { q: 'À quel âge commencer l\'orthodontie ?', a: 'Un premier bilan vers 6-7 ans permet de repérer les anomalies ; le traitement actif débute souvent vers 9-12 ans, mais l\'orthodontie adulte est courante.' },
        { q: 'Que faire en cas de dent fracturée ?', a: "Conservez le fragment si possible, rincez à l'eau claire et appelez-nous : un créneau d'urgence est réservé chaque jour." }
      ]
    },
    en: {
      bespoke: 'medical',
      trustBadges: ['Daily emergency', 'Equipped clinic', 'Painless care', 'Sterilization guaranteed'],
      whyUs: [
        { title: 'Painless care', desc: 'Modern techniques and well-managed anesthesia for stress-free visits.' },
        { title: 'Equipped clinic', desc: 'Digital X-ray and integrated sterilization for reliable diagnosis.' },
        { title: 'Whole-mouth care', desc: 'From prevention to aesthetics, we follow your oral health.' },
        { title: 'Fast emergencies', desc: 'A same-day emergency slot is kept for acute pain.' }
      ],
      services: [
        { name: 'Soins dentaires', desc: 'Scaling, fillings, and conservative care done gently and precisely. We favor prevention to keep your teeth healthy as long as possible.' },
        { name: 'Blanchiment', desc: 'Professional, dentist-supervised whitening — safer and longer-lasting than over-the-counter kits. A brighter smile without harming enamel.' },
        { name: 'Orthodontie', desc: 'Clear aligners or braces for children and adults, monitored regularly. A gradual treatment for a straight, functional smile.' },
        { name: 'Urgence dentaire', desc: 'Severe pain, a broken tooth, or infection: a daily emergency slot is reserved for you. We relieve the pain and treat the cause fast.' },
        { name: 'Implantologie', desc: 'Replacing one or more missing teeth with titanium implants anchored in the bone. A stable, durable solution that preserves bone.' },
        { name: 'Esthétique du sourire', desc: 'Veneers, crowns, and gum recontouring to harmonize your smile. A natural result designed with you in consultation.' }
      ],
      faq: [
        { q: 'Does whitening damage teeth?', a: 'Done under dental supervision, professional whitening is safe and does not alter enamel; we first check there are no contraindications.' },
        { q: 'At what age should orthodontics start?', a: 'A first check around age 6-7 spots abnormalities; active treatment often begins around 9-12, but adult orthodontics is common.' },
        { q: 'What if a tooth is broken?', a: "Keep the fragment if possible, rinse with clean water, and call us: a daily emergency slot is reserved." }
      ]
    }
  },

  avocat: {
    fr: {
      bespoke: 'avocat',
      trustBadges: ['1er RDV conseil', 'Honoraires transparents', 'Avocat au barreau', 'Confidentialité'],
      whyUs: [
        { title: 'Avocat inscrit au barreau', desc: 'Une défense assurée par un professionnel du droit régulièrement formé.' },
        { title: 'Stratégie sur mesure', desc: 'Chaque dossier est analysé pour bâtir l\'approche la plus favorable.' },
        { title: 'Honoraires transparents', desc: 'Un devis clair dès le premier rendez-vous, sans frais cachés.' },
        { title: 'Confidentialité absolue', desc: 'Vos échanges restent protégés par le secret professionnel.' }
      ],
      services: [
        { name: 'Droit Civil & Famille', desc: "Divorce, succession, bail et régime matrimonial : nous vous guidons dans ces moments sensibles avec fermeté et humanité. Une stratégie claire, adaptée à votre situation familiale." },
        { name: 'Droit Pénal', desc: "Défense et assistance en garde à vue, devant le tribunal correctionnel et pour les victimes. Nous protégeons vos droits à chaque étape de la procédure." },
        { name: 'Droit du Travail', desc: "Licenciement, rupture conventionnelle, harcèlement et prud'hommes : nous défendons salariés comme employeurs. Un accompagnement prudentiel et rigoureux." },
        { name: 'Droit des Affaires', desc: "Création de société, contrats commerciaux et recouvrement : un conseil preventif qui sécurise votre activité. Anticiper vaut mieux que litiger." },
        { name: 'Immobilier', desc: "Vente, achat, copropriété et litiges de construction : nous sécurisons votre transaction et défendons vos intérêts patrimoniaux." },
        { name: 'Droit Routier', desc: "Retrait de permis, excès de vitesse et infractions : nous défendons votre capacité à conduire. Une procédure rapide, orientée résultat." }
      ],
      faq: [
        { q: 'Combien coûte une consultation ?', a: 'Nos honoraires vous sont communiqués dès le premier rendez-vous sous forme de devis clair, avant toute diligence.' },
        { q: 'Puis-je bénéficier de l\'aide juridictionnelle ?', a: 'Oui, le cabinet étudie votre éligibilité et monte le dossier d\'aide juridictionnelle si vos ressources le permettent.' },
        { q: 'Mes échanges sont-ils confidentiels ?', a: 'Absolument : le secret professionnel lie votre avocat, vos échanges ne peuvent être divulgués à quiconque.' }
      ]
    },
    en: {
      bespoke: 'avocat',
      trustBadges: ['First consult', 'Transparent fees', 'Bar certified', 'Confidentiality'],
      whyUs: [
        { title: 'Bar-certified attorney', desc: 'A defense handled by a legal professional in ongoing training.' },
        { title: 'Tailored strategy', desc: 'Every case is analyzed to build the most favorable approach.' },
        { title: 'Transparent fees', desc: 'A clear quote from the first appointment, with no hidden costs.' },
        { title: 'Absolute confidentiality', desc: 'Your exchanges remain protected by professional privilege.' }
      ],
      services: [
        { name: 'Droit Civil & Famille', desc: 'Divorce, inheritance, leases, and matrimonial regimes: we guide you through sensitive moments with firmness and humanity. A clear strategy suited to your family situation.' },
        { name: 'Droit Pénal', desc: 'Defense and assistance in custody, before the criminal court, and for victims. We protect your rights at every stage of the proceedings.' },
        { name: 'Droit du Travail', desc: 'Dismissal, settlement agreements, harassment, and employment tribunals: we defend employees and employers alike. Prudent, rigorous support.' },
        { name: 'Droit des Affaires', desc: 'Company formation, commercial contracts, and debt recovery: preventive counsel that secures your activity. Anticipating beats litigating.' },
        { name: 'Immobilier', desc: 'Sale, purchase, co-ownership, and construction disputes: we secure your transaction and defend your property interests.' },
        { name: 'Droit Routier', desc: 'License suspension, speeding, and offenses: we defend your ability to drive. A fast, results-oriented process.' }
      ],
      faq: [
        { q: 'How much does a consultation cost?', a: 'Our fees are shared with you as a clear quote at the first appointment, before any action is taken.' },
        { q: 'Can I get legal aid?', a: 'Yes, the firm reviews your eligibility and files the legal-aid application if your means allow it.' },
        { q: 'Are my exchanges confidential?', a: 'Absolutely: professional privilege binds your lawyer, and your exchanges cannot be disclosed to anyone.' }
      ]
    }
  },

  nettoyage: {
    fr: {
      bespoke: 'nettoyage',
      trustBadges: ['Devis gratuit', 'Produits écolabels', 'Équipe formée', 'Assurance RC Pro'],
      whyUs: [
        { title: 'Produits écolabels', desc: 'Nous nettoyons avec des produits respectueux de la santé et de l\'environnement.' },
        { title: 'Équipes formées et vérifiées', desc: 'Des intervenants de confiance, briefés sur vos priorités.' },
        { title: 'Intervention flexible', desc: 'Des plages horaires adaptées à votre activité, de jour comme de nuit.' },
        { title: 'Assurance responsabilité civile', desc: 'Toute notre prestation est couverte en cas de dommage.' }
      ],
      services: [
        { name: 'Nettoyage de Bureaux', desc: "Entretien quotidien de vos locaux : poussière, sols et vitres, avec des produits écolabels. Des horaires flexibles qui respectent votre activité." },
        { name: 'Nettoyage Vitres', desc: "Vitres intérieures et extérieures, y compris en accès difficile (bâtiments R+10), sans trace garantie. Une transparence parfaite, en toute sécurité." },
        { name: 'Grand Nettoyage', desc: "Nettoyage en profondeur résidentiel : cuisine dégraissée, salle de bain désinfectée, sol ciré. Votre logement retrouve son éclat." },
        { name: 'Désinfection', desc: "Traitement anti-bactérien et virucide certifié, avec produits bio et rapport de traitement. Un environnement sain, documenté et rassurant." },
        { name: 'Nettoyage Industriel', desc: "Entrepôts, usines et ateliers avec monobrosse industrielle et aspirateur eau/poussière. Intervention de nuit pour ne pas gêner la production." },
        { name: 'Remise en État', desc: "Après travaux ou déménagement : évacuation des gravats, nettoyage fin et livraison clé en main. On vous rend les lieux habitables." }
      ],
      faq: [
        { q: 'Travaillez-vous avec des produits écologiques ?', a: 'Oui, nous utilisons systématiquement des produits écolabels et des protocoles respectueux de la santé.' },
        { q: 'Pouvez-vous intervenir le soir ou la nuit ?', a: 'Oui, nos plages horaires sont flexibles, y compris de nuit pour les sites industriels ou les bureaux.' },
        { q: 'Êtes-vous assurés ?', a: 'Oui, notre prestation est couverte par une assurance responsabilité civile professionnelle.' }
      ]
    },
    en: {
      bespoke: 'nettoyage',
      trustBadges: ['Free quote', 'Eco-label products', 'Trained staff', 'Pro insurance'],
      whyUs: [
        { title: 'Eco-label products', desc: 'We clean with products that respect health and the environment.' },
        { title: 'Trained, vetted staff', desc: 'Trustworthy operators briefed on your priorities.' },
        { title: 'Flexible scheduling', desc: 'Time slots adapted to your activity, day or night.' },
        { title: 'Liability insurance', desc: 'Every service is covered against damage.' }
      ],
      services: [
        { name: 'Nettoyage de Bureaux', desc: 'Daily upkeep of your premises: dust, floors, and windows, with eco-label products. Flexible hours that respect your activity.' },
        { name: 'Nettoyage Vitres', desc: 'Interior and exterior windows, including hard-to-reach ones (R+10 buildings), streak-free guaranteed. Perfect clarity, safely.' },
        { name: 'Grand Nettoyage', desc: 'Deep residential cleaning: degreased kitchen, disinfected bathroom, waxed floor. Your home regains its shine.' },
        { name: 'Désinfection', desc: 'Certified anti-bacterial and virucidal treatment, with bio products and a treatment report. A healthy, documented, reassuring environment.' },
        { name: 'Nettoyage Industriel', desc: 'Warehouses, factories, and workshops with industrial scrubbers and wet/dry vacuums. Night shifts so production is undisturbed.' },
        { name: 'Remise en État', desc: 'After works or moving: debris removal, fine cleaning, and turnkey handover. We return the premises livable.' }
      ],
      faq: [
        { q: 'Do you use ecological products?', a: 'Yes, we systematically use eco-label products and health-friendly protocols.' },
        { q: 'Can you work in the evening or at night?', a: 'Yes, our time slots are flexible, including nights for industrial sites or offices.' },
        { q: 'Are you insured?', a: 'Yes, our service is covered by professional liability insurance.' }
      ]
    }
  },

  jardin: {
    fr: {
      bespoke: 'jardin',
      trustBadges: ['Devis gratuit', 'Plantes garanties', 'Conseil saisonnier', 'Paysagiste qualifié'],
      whyUs: [
        { title: 'Paysagiste à l\'écoute', desc: 'Nous concevons un espace vert qui vous ressemble et respecte votre terrain.' },
        { title: 'Plantes garanties', desc: 'Nos végétaux sont sélectionnés vigoureux et accompagnés d\'un suivi.' },
        { title: 'Entretien saisonnier', desc: 'Taille, tonte et conseils adaptés au rythme des saisons.' },
        { title: 'Travail propre et soigné', desc: 'Nous laissons votre jardin net, sans déchets ni dégradation.' }
      ],
      services: [
        { name: 'Création de Jardins', desc: "Aménagement paysager complet avec plan sur mesure, plantations adaptées au sol et gazon en rouleaux. Un jardin pensé pour durer et vous ressembler." },
        { name: 'Tonte & Entretien', desc: "Pelouse et massifs entretenus : tonte régulière, taille de haies et désherbage manuel. Un extérieur toujours soigné, sans effort pour vous." },
        { name: 'Élagage & Abattage', desc: "Arbres et arbustes sécurisés par un grimpeur pro, avec élagage raisonné et broyage des branches. On préserve la santé de votre arboriculture." },
        { name: 'Terrasses & Clôtures', desc: "Aménagement en bois : terrasse pin ou ipé, clôture d'occultation et pergolas. Des structures solides qui structurent votre jardin." },
        { name: 'Arrosage Automatique', desc: "Installation de goutte-à-goutte, tuyères enterrées et programmateur connecté. Moins de gaspillage, un arrosage régulier même en votre absence." },
        { name: 'Potager & Verger', desc: "Création et entretien de bacs surélevés, compostage et taille de fruitiers. Récoltez vos propres légumes et fruits, accompagné par un pro." }
      ],
      faq: [
        { q: 'Proposez-vous un plan paysager ?', a: 'Oui, nous concevons un plan sur mesure après visite, adapté à votre terrain, votre exposition et votre budget.' },
        { q: 'Les plantes sont-elles garanties ?', a: 'Oui, nos végétaux sont sélectionnés vigoureux et font l\'objet d\'un suivi après plantation.' },
        { q: 'Intervenez-vous en hiver ?', a: 'Oui, la taille et l\'élagage se font souvent en période de repos végétatif, idéal pour la santé des arbres.' }
      ]
    },
    en: {
      bespoke: 'jardin',
      trustBadges: ['Free quote', 'Plants guaranteed', 'Seasonal advice', 'Qualified landscaper'],
      whyUs: [
        { title: 'A landscaper who listens', desc: 'We design a green space that reflects you and respects your land.' },
        { title: 'Guaranteed plants', desc: 'Our plants are selected vigorous and come with follow-up.' },
        { title: 'Seasonal care', desc: 'Pruning, mowing, and advice paced to the seasons.' },
        { title: 'Clean, careful work', desc: 'We leave your garden tidy, with no waste or damage.' }
      ],
      services: [
        { name: 'Création de Jardins', desc: 'Full landscape design with a custom plan, plantings suited to your soil, and roll-out turf. A garden built to last and to be yours.' },
        { name: 'Tonte & Entretien', desc: 'Lawn and beds maintained: regular mowing, hedge trimming, and hand weeding. An always-tidy outdoors, effort-free for you.' },
        { name: 'Élagage & Abattage', desc: 'Trees and shrubs secured by a pro climber, with reasoned pruning and branch chipping. We protect the health of your trees.' },
        { name: 'Terrasses & Clôtures', desc: 'Wood work: pine or ipe deck, screening fence, and pergolas. Solid structures that shape your garden.' },
        { name: 'Arrosage Automatique', desc: 'Drip systems, buried sprinklers, and a connected timer. Less waste, regular watering even when you are away.' },
        { name: 'Potager & Verger', desc: 'Creation and care of raised beds, composting, and fruit-tree pruning. Harvest your own produce, guided by a pro.' }
      ],
      faq: [
        { q: 'Do you provide a landscape plan?', a: 'Yes, we design a custom plan after a visit, adapted to your land, exposure, and budget.' },
        { q: 'Are the plants guaranteed?', a: 'Yes, our plants are selected vigorous and come with follow-up after planting.' },
        { q: 'Do you work in winter?', a: 'Yes, pruning and tree work often happen in the dormant season, ideal for tree health.' }
      ]
    }
  },

  coach: {
    fr: {
      bespoke: 'coach',
      trustBadges: ['Essai offert', 'Coachs diplômés', 'Sans engagement', 'Suivi des résultats'],
      whyUs: [
        { title: 'Coachs diplômés d\'État', desc: 'Un encadrement certifié pour progresser en sécurité.' },
        { title: 'Programme 100% personnalisé', desc: 'Vos séances s\'adaptent à votre niveau, vos objectifs et votre emploi du temps.' },
        { title: 'Suivi des résultats', desc: 'Nous mesurons vos progrès pour garder la motivation au rendez-vous.' },
        { title: 'Sans engagement', desc: 'Vous avancez à votre rythme, sans être bloqué par un abonnement longue durée.' }
      ],
      services: [
        { name: 'Coaching Personnel', desc: "Accompagnement individuel sur mesure : bilan morphologique, programme adapté et suivi hebdomadaire. Un coach dédié à vos objectifs, en salle comme à domicile." },
        { name: 'Cours Collectifs', desc: "Groupes dynamiques et motivants : HIIT, yoga, zumba et musculation guidée. L'énergie du collectif pour rester régulier." },
        { name: 'Musculation Libre', desc: "Un espace haltères et machines avec poids libres, machines guidées et cage à squat. Une progression en force sûre et progressive." },
        { name: 'Cardio Zone', desc: "Tapis connectés, vélos elliptiques et rameurs pour votre endurance. Des sessions qui respectent votre niveau et votre cœur." },
        { name: 'Préparation Physique', desc: "Préparation à la compétition ou remise en forme : tests de performance, plan nutrition et récupération. Une approche globale de la performance." },
        { name: 'Espace Bien-être', desc: "Sauna, douche à jets et casiers sécurisés pour la détente après l'effort. Parce que la récupération fait partie du résultat." }
      ],
      faq: [
        { q: 'Faut-il être déjà sportif pour commencer ?', a: 'Non, nos programmes sont adaptés à chaque niveau, du grand débutant à l\'athlète confirmé, avec un bilan initial.' },
        { q: 'Le premier essai est-il vraiment offert ?', a: 'Oui, nous proposons un essai sans engagement pour découvrir le coaching et l\'ambiance du lieu.' },
        { q: 'Suivez-vous l\'alimentation ?', a: 'Oui, nos coachs diplômés intègrent des conseils nutritionnels simples à votre plan de progression.' }
      ]
    },
    en: {
      bespoke: 'coach',
      trustBadges: ['Free trial', 'Certified coaches', 'No commitment', 'Results tracked'],
      whyUs: [
        { title: 'State-certified coaches', desc: 'Certified supervision to progress safely.' },
        { title: '100% personalized plan', desc: 'Your sessions adapt to your level, goals, and schedule.' },
        { title: 'Results tracking', desc: 'We measure your progress to keep motivation high.' },
        { title: 'No commitment', desc: 'You move at your own pace, not locked into a long contract.' }
      ],
      services: [
        { name: 'Coaching Personnel', desc: 'Tailored one-on-one coaching: body assessment, adapted program, and weekly follow-up. A dedicated coach for your goals, in the gym or at home.' },
        { name: 'Cours Collectifs', desc: 'Dynamic, motivating groups: HIIT, yoga, zumba, and guided strength. The energy of the group keeps you consistent.' },
        { name: 'Musculation Libre', desc: 'A free-weights and machines area with dumbbells, guided machines, and a squat rack. Safe, progressive strength gains.' },
        { name: 'Cardio Zone', desc: 'Connected treadmills, ellipticals, and rowers for your endurance. Sessions that respect your level and your heart.' },
        { name: 'Préparation Physique', desc: 'Competition prep or getting back in shape: performance tests, nutrition plan, and recovery. A holistic approach to performance.' },
        { name: 'Espace Bien-être', desc: 'Sauna, jet shower, and secure lockers to unwind after effort. Because recovery is part of the result.' }
      ],
      faq: [
        { q: 'Do I need to be athletic to start?', a: 'No, our programs fit every level, from complete beginner to seasoned athlete, with an initial assessment.' },
        { q: 'Is the first trial really free?', a: 'Yes, we offer a no-commitment trial to discover coaching and the atmosphere of the place.' },
        { q: 'Do you follow nutrition?', a: 'Yes, our certified coaches weave simple nutrition advice into your progression plan.' }
      ]
    }
  },

  garage: {
    fr: {
      bespoke: 'garage',
      trustBadges: ['Devis gratuit', 'Diagnostic précis', 'Véhicule de courtoisie', 'Pièces garanties'],
      whyUs: [
        { title: 'Diagnostic précis', desc: 'Notre valise multimarque identifie la panne sans tâtonner.' },
        { title: 'Devis avant réparation', desc: 'Vous validez le prix avant tout travail, pièces et main-d\'œuvre incluses.' },
        { title: 'Véhicule de courtoisie', desc: 'Restez mobile pendant l\'intervention quand c\'est possible.' },
        { title: 'Pièces garanties', desc: 'Les pièces et la main-d\'œuvre bénéficient d\'une garantie.' }
      ],
      services: [
        { name: 'Mécanique Générale', desc: "Entretien et réparation toutes marques : révisions constructeur, courroies et freins. Un travail soigné pour prolonger la vie de votre véhicule." },
        { name: 'Diagnostic Auto', desc: "Analyse électronique complète avec valise multimarque, effacement des défauts et paramétrage. On cerne la panne sans démontage inutile." },
        { name: 'Pneumatiques', desc: "Montage, équilibrage et géométrie : pneus toutes saisons, run-flat et parallélisme. Une tenue de route sûre et un usure maîtrisée." },
        { name: 'Climatisation', desc: "Recharge et réparation clim, détection de fuites et remplacement du filtre habitacle. Conduisez au frais, même en plein été." },
        { name: 'Carrosserie', desc: "Débosselage, peinture à la nuance et polissage optique. Redonnez à votre carrosserie son aspect d'origine." },
        { name: 'Contrôle Technique', desc: "Pré-contrôle, réparations de conformité et accompagnement en contre-visite. Vous passez le contrôle en toute sérénité." }
      ],
      faq: [
        { q: 'Proposez-vous un véhicule de remplacement ?', a: 'Oui, dans la mesure des disponibilités, un véhicule de courtoisie vous est prêté pendant l\'intervention.' },
        { q: 'Le devis est-il gratuit ?', a: 'Oui, le diagnostic et le devis sont gratuits et détaillés avant toute réparation acceptée.' },
        { q: 'Les pièces sont-elles garanties ?', a: 'Oui, les pièces comme la main-d\'œuvre sont couvertes par une garantie sur les interventions réalisées.' }
      ]
    },
    en: {
      bespoke: 'garage',
      trustBadges: ['Free quote', 'Accurate diagnosis', 'Courtesy car', 'Parts guaranteed'],
      whyUs: [
        { title: 'Accurate diagnosis', desc: 'Our multi-brand scanner pinpoints the fault without guesswork.' },
        { title: 'Quote before repair', desc: 'You approve the price before any work, parts and labor included.' },
        { title: 'Courtesy vehicle', desc: 'Stay mobile during the job whenever possible.' },
        { title: 'Guaranteed parts', desc: 'Parts and labor come with a warranty.' }
      ],
      services: [
        { name: 'Mécanique Générale', desc: 'Servicing and repair for all makes: manufacturer schedules, belts, and brakes. Careful work to extend your vehicle\'s life.' },
        { name: 'Diagnostic Auto', desc: 'Full electronic analysis with a multi-brand scanner, fault clearing, and tuning. We locate the fault without needless teardown.' },
        { name: 'Pneumatiques', desc: 'Fitting, balancing, and alignment: all-season tires, run-flats, and tracking. Safe road holding and controlled wear.' },
        { name: 'Climatisation', desc: 'AC recharge and repair, leak detection, and cabin-filter replacement. Drive cool even in peak summer.' },
        { name: 'Carrosserie', desc: 'Dent removal, color-matched paint, and headlight polishing. We restore your bodywork to its original look.' },
        { name: 'Contrôle Technique', desc: 'Pre-check, compliance repairs, and counter-inspection support. You pass the inspection with peace of mind.' }
      ],
      faq: [
        { q: 'Do you offer a replacement vehicle?', a: 'Yes, subject to availability, a courtesy car is lent to you during the intervention.' },
        { q: 'Is the quote free?', a: 'Yes, diagnosis and quote are free and detailed before any accepted repair.' },
        { q: 'Are parts guaranteed?', a: 'Yes, both parts and labor are covered by a warranty on the work performed.' }
      ]
    }
  },

  medical: {
    fr: {
      bespoke: 'medical',
      trustBadges: ['RDV < 48h', 'Conventionné', 'Tiers payant', 'Équipe pluridisciplinaire'],
      whyUs: [
        { title: 'Professionnels de santé conventionnés', desc: 'Des soins pris en charge, dans le respect du parcours de soins.' },
        { title: 'RDV sous 48h', desc: 'Un créneau rapide pour ne pas laisser attendre vos symptômes.' },
        { title: 'Équipe pluridisciplinaire', desc: 'Médecine, kiné, infirmier et téléconsultation sous un même toit.' },
        { title: 'Tiers payant', desc: 'Moins d\'avance de frais grâce à la dispense d\'avance de paiement.' }
      ],
      services: [
        { name: 'Médecine Générale', desc: "Consultations et suivi de santé : bilan annuel, vaccinations et certificats. Un médecin référent qui connaît votre historique." },
        { name: 'Kinésithérapie', desc: "Rééducation et réadaptation : massages médicaux, post-op et posturologie. Une récupération progressive, encadrée par un pro." },
        { name: 'Ostéopathie', desc: "Soins manuels sans médicaments, pour bébés, femmes enceintes et sportifs. Un équilibre retrouvé en douceur." },
        { name: 'Infirmier à Domicile', desc: "Soins à domicile : injections, pansements et prélèvements. La clinique vient à vous, en toute discrétion." },
        { name: 'Analyses Biologiques', desc: "Laboratoire sur place : prise de sang, tests rapides et résultats sous 24h. Un diagnostic sans déplacement inutile." },
        { name: 'Télémédecine', desc: "Consultation vidéo 7j/7, avec ordonnance électronique et sans déplacement. Votre médecin à portée de clic." }
      ],
      faq: [
        { q: 'Le cabinet est-il conventionné ?', a: 'Oui, nous sommes conventionnés secteur 1, ce qui limite les dépassements d\'honoraires.' },
        { q: 'Puis-je être vu en moins de 48h ?', a: 'Oui, un créneau de rendez-vous sous 48h est réservé pour les demandes non programmées.' },
        { q: 'La téléconsultation délivre-t-elle une ordonnance ?', a: 'Oui, la consultation vidéo permet une ordonnance électronique transmise à votre pharmacie.' }
      ]
    },
    en: {
      bespoke: 'medical',
      trustBadges: ['Appt < 48h', 'Insurance accepted', 'Direct billing', 'Multidisciplinary team'],
      whyUs: [
        { title: 'Contracted health professionals', desc: 'Care covered, within the proper care pathway.' },
        { title: 'Appointment within 48h', desc: 'A quick slot so your symptoms don\'t wait.' },
        { title: 'Multidisciplinary team', desc: 'Medicine, physio, nursing, and telehealth under one roof.' },
        { title: 'Direct billing', desc: 'Less upfront cost thanks to dispensed advance payment.' }
      ],
      services: [
        { name: 'Médecine Générale', desc: 'Consultations and health follow-up: annual check-up, vaccinations, and certificates. A referring doctor who knows your history.' },
        { name: 'Kinésithérapie', desc: 'Rehabilitation and readaptation: medical massage, post-op, and posture work. Gradual recovery supervised by a pro.' },
        { name: 'Ostéopathie', desc: 'Drug-free manual care for babies, pregnant women, and athletes. Balance restored gently.' },
        { name: 'Infirmier à Domicile', desc: 'Home care: injections, dressings, and blood samples. The clinic comes to you, discreetly.' },
        { name: 'Analyses Biologiques', desc: 'On-site lab: blood draw, rapid tests, results within 24h. Diagnosis without needless travel.' },
        { name: 'Télémédecine', desc: 'Video consultation 7 days a week, with e-prescription and no travel. Your doctor a click away.' }
      ],
      faq: [
        { q: 'Is the practice contracted?', a: 'Yes, we are contracted sector 1, which limits fee overruns.' },
        { q: 'Can I be seen within 48h?', a: 'Yes, a same-week appointment slot is reserved for unscheduled requests.' },
        { q: 'Does telehealth issue a prescription?', a: 'Yes, the video consultation provides an e-prescription sent to your pharmacy.' }
      ]
    }
  },

  // Generic fallback for artisan trades (peintre, rénovation, chauffage, clim…)
  artisan: {
    fr: {
      bespoke: 'artisan',
      trustBadges: ['Devis détaillé', 'Travail soigné', 'Respect des normes', 'Artisan qualifié'],
      whyUs: [
        { title: 'Artisan multiservices', desc: 'Rénovation, peinture, électricité et plomberie par un même interlocuteur.' },
        { title: 'Devis détaillé', desc: 'Chaque poste est chiffré clairement avant le démarrage du chantier.' },
        { title: 'Travail soigné', desc: 'Un savoir-faire artisanal pour des finitions durables.' },
        { title: 'Respect des normes', desc: 'Nos interventions suivent la réglementation en vigueur.' }
      ],
      services: [
        { name: 'Rénovation', desc: "Rafraîchissement et mise aux normes de vos pièces, du sol au plafond. Un chantier coordonné, propre et dans les délais." },
        { name: 'Peinture', desc: "Pose de peintures et enduits, intérieur comme extérieur, avec préparation soignée des supports. Un rendu net et durable." },
        { name: 'Électricité & Plomberie', desc: "Petits travaux courants : prises, éclairage, robinetterie et fuites. L'essentiel géré par un artisan de confiance." },
        { name: 'Aménagement', desc: "Création de rangements, cloisons et espaces sur mesure. On optimise votre surface selon vos besoins." },
        { name: 'Isolation', desc: "Isolation des combles et des murs pour réduire votre facture énergétique. Un confort gagné toute l'année." },
        { name: 'Entretien & Dépannage', desc: "Interventions ponctuelles et maintenance préventive pour préserver vos installations. On anticipe plutôt que guérir." }
      ],
      faq: [
        { q: 'Proposez-vous un devis gratuit ?', a: 'Oui, nous établissons un devis détaillé et gratuit après visite, avant tout engagement.' },
        { q: 'Intervenez-vous en urgence ?', a: 'Oui, nous traitons les dépannages courants (fuite, panne légère) dans la mesure du possible rapidement.' },
        { q: 'Vos travaux respectent-ils les normes ?', a: 'Oui, chaque intervention suit la réglementation en vigueur et fait l\'objet d\'un devis écrit.' }
      ]
    },
    en: {
      bespoke: 'artisan',
      trustBadges: ['Detailed quote', 'Careful work', 'Standards-compliant', 'Qualified tradesperson'],
      whyUs: [
        { title: 'Multi-trade artisan', desc: 'Renovation, painting, electrical, and plumbing through one point of contact.' },
        { title: 'Detailed quote', desc: 'Every line item is priced clearly before work starts.' },
        { title: 'Careful work', desc: 'Craftsmanship that delivers durable finishes.' },
        { title: 'Standards-compliant', desc: 'Our work follows current regulations.' }
      ],
      services: [
        { name: 'Rénovation', desc: 'Refreshing and bringing your rooms up to standard, floor to ceiling. A coordinated, clean job delivered on time.' },
        { name: 'Peinture', desc: 'Paints and renders, interior and exterior, with careful surface prep. A clean, lasting result.' },
        { name: 'Électricité & Plomberie', desc: 'Everyday small works: sockets, lighting, fittings, and leaks. The essentials handled by a trusted tradesperson.' },
        { name: 'Aménagement', desc: 'Custom storage, partitions, and bespoke spaces. We optimize your floor area around your needs.' },
        { name: 'Isolation', desc: 'Loft and wall insulation to cut your energy bill. Comfort gained all year round.' },
        { name: 'Entretien & Dépannage', desc: 'One-off interventions and preventive maintenance to preserve your installations. We prevent rather than cure.' }
      ],
      faq: [
        { q: 'Do you offer a free quote?', a: 'Yes, we provide a free, detailed quote after a visit, before any commitment.' },
        { q: 'Do you handle emergencies?', a: 'Yes, we address common repairs (leaks, minor faults) as quickly as possible.' },
        { q: 'Is your work compliant?', a: 'Yes, every intervention follows current regulations and comes with a written quote.' }
      ]
    }
  },

  default: {
    fr: {
      bespoke: null,
      trustBadges: ['Devis gratuit', 'Réponse rapide', 'Garantie satisfaction', 'Équipe certifiée'],
      whyUs: [
        { title: 'Écoute de vos besoins', desc: 'Nous prenons le temps de comprendre votre demande avant de proposer.' },
        { title: 'Devis clair', desc: 'Un prix transparent, établi après diagnostic, sans surprise.' },
        { title: 'Réactivité', desc: 'Une réponse rapide et un début de prestation dans des délais maîtrisés.' },
        { title: 'Satisfaction au cœur', desc: 'Nous ajustons notre prestation jusqu\'à ce que vous soyez satisfait.' }
      ],
      services: [
        { name: 'Prestation Sur Mesure', desc: "Un service adapté à vos besoins réels, après étude personnalisée. Nous écoutons avant d'agir pour viser juste du premier coup." },
        { name: 'Service Professionnel', desc: "Un travail soigné réalisé avec du matériel adapté et les techniques actuelles. Le sérieux d'un professionnel, à chaque étape." },
        { name: 'Conseil & Accompagnement', desc: "Un accompagnement de A à Z : diagnostic complet, solutions pertinentes et suivi personnalisé. Vous n'êtes jamais seul." },
        { name: 'Réactivité', desc: "Une réponse rapide et des horaires flexibles pour nous adapter à votre rythme. L'efficacité sans la pression." },
        { name: 'Qualité Garantie', desc: "Un engagement sur le résultat : contrôle qualité, corrections incluses et SAV réactif. Votre satisfaction est notre barre." },
        { name: 'Tarifs Clairs', desc: "Des honoraires transparents avec devis préalable et aucune surprise. Vous savez ce que vous payez, dès le départ." }
      ],
      faq: [
        { q: 'Proposez-vous un devis gratuit ?', a: 'Oui, nous établissons un devis clair et gratuit après avoir compris votre besoin.' },
        { q: 'Dans quels délais intervenez-vous ?', a: 'Nous visons une réponse rapide et un démarrage de prestation dans des délais maîtrisés, adaptés à votre situation.' },
        { q: 'Que se passe-t-il si je ne suis pas satisfait ?', a: 'Notre garantie satisfaction inclut des corrections : nous ajustons jusqu\'à ce que le résultat vous convienne.' }
      ]
    },
    en: {
      bespoke: null,
      trustBadges: ['Free quote', 'Fast response', 'Satisfaction guarantee', 'Certified team'],
      whyUs: [
        { title: 'We listen', desc: 'We take the time to understand your request before proposing.' },
        { title: 'Clear quote', desc: 'A transparent price, set after diagnosis, with no surprises.' },
        { title: 'Responsiveness', desc: 'A fast reply and service started within controlled timelines.' },
        { title: 'Satisfaction first', desc: 'We tune our service until you are satisfied.' }
      ],
      services: [
        { name: 'Tailored Service', desc: 'A service adapted to your real needs, after a personalized study. We listen before acting to hit the mark first time.' },
        { name: 'Professional Service', desc: 'Careful work done with adapted equipment and current techniques. The seriousness of a pro, at every step.' },
        { name: 'Consulting & Support', desc: 'End-to-end guidance: full diagnosis, relevant solutions, and personal follow-up. You are never alone.' },
        { name: 'Responsiveness', desc: 'A fast reply and flexible hours to fit your pace. Efficiency without the pressure.' },
        { name: 'Quality Guaranteed', desc: 'A commitment to results: quality control, corrections included, and responsive support. Your satisfaction is our bar.' },
        { name: 'Clear Pricing', desc: 'Transparent fees with a prior quote and no surprises. You know what you pay, from the start.' }
      ],
      faq: [
        { q: 'Do you offer a free quote?', a: 'Yes, we provide a clear, free quote once we understand your need.' },
        { q: 'How quickly do you start?', a: 'We aim for a fast reply and a controlled start to the service, adapted to your situation.' },
        { q: 'What if I am not satisfied?', a: 'Our satisfaction guarantee includes corrections: we adjust until the result suits you.' }
      ]
    }
  }
};

// Keyword fallback rules (case-insensitive substring). Order matters: the
// first matching rule wins. Exact sector key is tried before these.
const FALLBACK_RULES: Array<[RegExp, string]> = [
  [/dentiste|orthodont|blanch/, 'dentiste'],
  [/avocat|jurid|notaire|huissier/, 'avocat'],
  [/coach|sport|fitness|muscul|yoga/, 'coach'],
  [/restaurant|cuisin|traiteur|pizz|brasser/, 'restaurant'],
  [/nettoy|ménage|menage|propret|hygiene/, 'nettoyage'],
  [/jardin|paysag|arbor|espac|vert/, 'jardin'],
  [/garage|mécan|auto|carross|véhicul/, 'garage'],
  [/électric|plomb|renov|rénov|peintr|chauffag|clim/, 'artisan'],
  [/médic|medic|clinique|kiné|kine|pharmac|optic|infirm|ostéo|sage/, 'medical']
];

/**
 * Resolve sector-specific marketing copy for a given sector and language.
 * Exact sector key match first (electricien, plombier, coiffeur, restaurant,
 * dentiste, avocat, nettoyage, jardin, coach, garage, medical, default,
 * artisan), then keyword fallback, otherwise the default pack.
 */
export function resolveSectorContent(sector: string, lang: Lang): SectorCopy {
  const s = (sector || '').toLowerCase();
  if (SECTOR_CONTENT_PACKS[s]) return SECTOR_CONTENT_PACKS[s][lang];
  for (const [re, key] of FALLBACK_RULES) {
    if (re.test(s)) return SECTOR_CONTENT_PACKS[key][lang];
  }
  return SECTOR_CONTENT_PACKS['default'][lang];
}
