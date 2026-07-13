9fb17674 feat(content): sector copy packs + keyword resolver + dentiste fix


==== diff --stat ====

 src/lib/template/helpers.ts       |  15 +
 src/lib/template/sectorContent.ts | 689 ++++++++++++++++++++++++++++++++++++++
 2 files changed, 704 insertions(+)


==== full diff ====

diff --git a/src/lib/template/helpers.ts b/src/lib/template/helpers.ts
index f03e85b1..3efce16c 100644
--- a/src/lib/template/helpers.ts
+++ b/src/lib/template/helpers.ts
@@ -2,8 +2,10 @@
 // LeadForge AI ÔÇö Template Helpers
 // Process steps, guarantees, hero badge, gallery, privacy
 // ============================================================
 
+import { SectorCopy } from './sectorContent';
+
 export function isEnglishText(text: string): boolean {
   if (!text) return false;
   const englishIndicators = ['the ', 'was ', 'very ', 'good ', 'great ', 'excellent ', 'highly ', 'recommend', 'amazing', 'professional', 'quick ', 'fast ', 'efficient', 'friendly', 'helpful', 'courteous', 'reasonable', 'price', 'work ', 'service', 'job '];
   const lowerText = text.toLowerCase();
@@ -226,8 +228,21 @@ export function getStats(
   }
   return stats.slice(0, 4);
 }
 
+export function getServiceDescriptions(pack: SectorCopy, services: { name: string }[], lang: 'fr' | 'en'): { name: string; desc: string }[] {
+  return services.map(s => {
+    const found = pack.services.find(p => p.name.toLowerCase() === s.name.toLowerCase());
+    return { name: s.name, desc: found ? found.desc : `${s.name} : un service professionnel, adapt├® ├á vos besoins.` };
+  });
+}
+
+export function getTrustBadges(lang: 'fr' | 'en'): string[] {
+  return lang === 'fr'
+    ? ['Devis gratuit', 'R├®ponse rapide', 'Garantie satisfaction', '├ëquipe certifi├®e']
+    : ['Free quote', 'Fast response', 'Satisfaction guarantee', 'Certified team'];
+}
+
 export function getLogoInfo(name: string, sector: string = 'default') {
   const words = name.split(' ').filter(Boolean);
   const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
   let text = name;
diff --git a/src/lib/template/sectorContent.ts b/src/lib/template/sectorContent.ts
new file mode 100644
index 00000000..6f446f12
--- /dev/null
+++ b/src/lib/template/sectorContent.ts
@@ -0,0 +1,689 @@
+// ============================================================
+// LeadForge AI ÔÇö Sector Copy Packs
+// Marketing copy (whyUs / services / faq / trust badges) per
+// sector, in French and English. Pure data + a small resolver.
+// No HTML output is produced here (wiring happens in a later task).
+// ============================================================
+
+export interface SectorCopy {
+  whyUs: { title: string; desc: string }[];
+  services: { name: string; desc: string }[];
+  faq: { q: string; a: string }[];
+  bespoke: 'restaurant' | 'coach' | 'medical' | 'artisan' | null;
+  trustBadges: string[];
+}
+
+type Lang = 'fr' | 'en';
+type Pack = { fr: SectorCopy; en: SectorCopy };
+
+// Each service `name` MUST match the canonical `services` name used in
+// SECTOR_ULTIMATE_TEMPLATES (see ultimateTemplate.ts) so the later wiring
+// (getServiceDescriptions) can resolve descriptions 1:1.
+const SECTOR_CONTENT_PACKS: Record<string, Pack> = {
+  electricien: {
+    fr: {
+      bespoke: 'artisan',
+      trustBadges: ['Devis gratuit', 'Intervention < 2h', 'Garantie d├®cennale', 'Consuel certifi├®'],
+      whyUs: [
+        { title: 'S├®curit├® avant tout', desc: 'Votre installation est mise aux normes NFC 15-100 pour prot├®ger votre famille et vos biens.' },
+        { title: 'Intervention en moins de 2h', desc: "En cas de panne, un ├®lectricien se d├®place rapidement pour r├®tablir le courant." },
+        { title: 'Devis transparent', desc: 'Un prix clair et d├®taill├® avant toute intervention, sans frais cach├®s.' },
+        { title: 'Artisan certifi├® Consuel', desc: 'Des travaux conformes et garantis, r├®alis├®s par un professionnel qualifi├®.' }
+      ],
+      services: [
+        { name: 'Mise aux Normes', desc: "Nous remettons votre installation aux normes NFC 15-100 : tableau ├®lectrique neuf, mise ├á la terre et protection diff├®rentielle. Une garantie de s├®curit├® pour votre habitat, conforme ├á la r├®glementation en vigueur." },
+        { name: 'D├®pannage ├ëlectrique', desc: "Pannes, court-circuits ou disjonctions intempestives : nous diagnostiquons la cause et r├®parons durablement. Intervention rapide pour vous ├®viter les coupures r├®p├®t├®es." },
+        { name: 'Installation Compl├¿te', desc: "De la construction ├á la r├®novation, nous r├®alisons le c├óblage complet, les prises, les inters et l'├®clairage. Une installation sur mesure, pens├®e pour votre confort au quotidien." },
+        { name: 'Domotique & Smart Home', desc: "Pilotez vos volets, votre ├®clairage et votre chauffage depuis votre smartphone. Nous installons des solutions connect├®es simples, fiables et ├®volutives." },
+        { name: '├ëclairage LED', desc: "Optez pour un ├®clairage ├®conomique et design : spots encastr├®s, suspensions et ├®clairage ext├®rieur. Moins de consommation, plus de confort visuel." },
+        { name: 'Bornes de Recharge', desc: "Nous installons votre borne de recharge pour v├®hicule ├®lectrique (Wallbox) avec certification IRVE. Rechargez chez vous en toute s├®curit├®, ├á domicile comme en entreprise." }
+      ],
+      faq: [
+        { q: "Faut-il vraiment mettre son installation aux normes ?", a: "Si votre tableau date d'avant 2002 ou pr├®sente des disjonctions fr├®quentes, la mise aux normes NFC 15-100 est recommand├®e pour votre s├®curit├® et peut ├¬tre exig├®e lors d'une vente." },
+        { q: "Combien de temps pour un d├®pannage ?", a: "En g├®n├®ral nous intervenons en moins de 2h pour les urgences et diagnostiquons la panne d├¿s la premi├¿re visite." },
+        { q: "Installez-vous les bornes de recharge pour voiture ├®lectrique ?", a: "Oui, nous posons des Wallbox certifi├®es IRVE pour les particuliers comme pour les entreprises." }
+      ]
+    },
+    en: {
+      bespoke: 'artisan',
+      trustBadges: ['Free quote', 'Response < 2h', '10-Year Warranty', 'Consuel certified'],
+      whyUs: [
+        { title: 'Safety first', desc: 'Your installation is brought up to NFC 15-100 standards to protect your family and property.' },
+        { title: 'Response within 2h', desc: 'In case of breakdown, an electrician is dispatched quickly to restore power.' },
+        { title: 'Transparent quote', desc: 'A clear, detailed price before any work, with no hidden fees.' },
+        { title: 'Consuel-certified pro', desc: 'Compliant, guaranteed work carried out by a qualified professional.' }
+      ],
+      services: [
+        { name: 'Mise aux Normes', desc: "We bring your installation up to NFC 15-100 standards: new consumer unit, grounding, and differential protection. A safety guarantee for your home, fully compliant with current regulations." },
+        { name: 'D├®pannage ├ëlectrique', desc: 'Outages, short circuits, or repeated tripping: we diagnose the cause and repair it for good. Fast response to keep the lights on.' },
+        { name: 'Installation Compl├¿te', desc: 'From new builds to renovations, we handle full wiring, sockets, switches, and lighting. A tailored installation designed around your everyday comfort.' },
+        { name: 'Domotique & Smart Home', desc: 'Control your shutters, lighting, and heating from your phone. We install connected solutions that are simple, reliable, and future-proof.' },
+        { name: '├ëclairage LED', desc: 'Choose economical, stylish lighting: recessed spots, pendants, and outdoor lighting. Less consumption, more visual comfort.' },
+        { name: 'Bornes de Recharge', desc: 'We install your EV charging point (Wallbox) with IRVE certification. Charge safely at home or at your business.' }
+      ],
+      faq: [
+        { q: 'Do I really need to bring my installation up to standard?', a: 'If your consumer unit predates 2002 or trips frequently, bringing it up to NFC 15-100 is recommended for your safety and may be required when selling.' },
+        { q: 'How quickly can you fix a fault?', a: 'We usually respond within 2h for emergencies and diagnose the fault on the first visit.' },
+        { q: 'Do you install EV charging points?', a: 'Yes, we fit IRVE-certified Wallboxes for both homeowners and businesses.' }
+      ]
+    }
+  },
+
+  plombier: {
+    fr: {
+      bespoke: 'artisan',
+      trustBadges: ['Devis gratuit', 'Urgence 24h/24', 'Garantie d├®cennale', 'Artisan local'],
+      whyUs: [
+        { title: "Intervention d'urgence 24h/24", desc: "Une fuite ne pr├®vient pas : nous intervenons 7j/7, souvent en moins de 2h, pour limiter les d├®g├óts." },
+        { title: 'Garantie d├®cennale', desc: 'Tous nos travaux sont couverts par une assurance d├®cennale, pour votre tranquillit├® d\'esprit.' },
+        { title: 'Devis gratuit et d├®taill├®', desc: "Vous connaissez le prix avant le premier coup de cl├®, sans mauvaise surprise." },
+        { title: 'Artisan local de confiance', desc: "Un plombier install├® pr├¿s de chez vous, qui conna├«t vos installations et reste disponible." }
+      ],
+      services: [
+        { name: 'D├®pannage 24h/24', desc: "Fuite, canalisation bouch├®e ou panne : nous intervenons en urgence, 7j/7, pour stopper le sinistre et r├®tablir votre confort rapidement." },
+        { name: 'Installation Sanitaire', desc: "Pose et remplacement de robinetterie, ├®viers, WC et douches. Un travail soign├®, conforme aux normes, r├®alis├® par un artisan exp├®riment├®." },
+        { name: 'Chauffage & Chaudi├¿re', desc: "Installation, d├®pannage et entretien de chaudi├¿res gaz ou fioul, pompes ├á chaleur et radiateurs. Restez au chaud avec une installation fiable." },
+        { name: 'D├®tection de Fuites', desc: "Localisation pr├®cise sans casse gr├óce ├á la cam├®ra thermique et au gaz traceur. Nous colmatons ├á la source pour ├®viter les r├®cidives." },
+        { name: 'R├®novation Salle de Bain', desc: "De la mosa├»que au meuble vasque, nous cr├®ons la salle de bain ├á votre image, cl├® en main, avec un devis d├®taill├®." },
+        { name: 'Entretien Annuel', desc: "Un contr├┤le pr├®ventif de votre chauffage et de vos canalisations prolonge la dur├®e de vie de vos ├®quipements et pr├®vient les pannes." }
+      ],
+      faq: [
+        { q: "Que faire en cas de fuite d'eau ?", a: "Fermez le robinet d'arr├¬t g├®n├®ral, coupez l'├®lectricit├® si l'eau approche d'une prise, puis appelez-nous : nous intervenons en urgence 7j/7." },
+        { q: "Proposez-vous un entretien de chaudi├¿re ?", a: "Oui, notre contrat annuel inclut le contr├┤le du chauffage, le d├®tartrage et la mise aux normes de s├®curit├®." },
+        { q: "Vos travaux sont-ils garantis ?", a: "Oui, l'ensemble de nos interventions est couvert par une garantie d├®cennale et fait l'objet d'un devis ├®crit avant chantier." }
+      ]
+    },
+    en: {
+      bespoke: 'artisan',
+      trustBadges: ['Free quote', '24/7 emergency', '10-Year Warranty', 'Local pro'],
+      whyUs: [
+        { title: '24/7 emergency call-out', desc: 'A leak never warns you: we step in 7 days a week, often within 2h, to limit the damage.' },
+        { title: '10-Year Warranty', desc: 'All our work is covered by a decade-long warranty, for total peace of mind.' },
+        { title: 'Free, detailed quote', desc: 'You know the price before the first wrench turns, with no nasty surprises.' },
+        { title: 'Trusted local plumber', desc: 'A plumber based near you, who knows your setup and stays reachable.' }
+      ],
+      services: [
+        { name: 'D├®pannage 24h/24', desc: 'Leak, blocked pipe, or breakdown: we respond in an emergency, 7 days a week, to stop the damage and restore your comfort fast.' },
+        { name: 'Installation Sanitaire', desc: 'Fitting and replacement of taps, sinks, toilets, and showers. Careful, standards-compliant work by an experienced tradesperson.' },
+        { name: 'Chauffage & Chaudi├¿re', desc: 'Installation, repair, and servicing of gas or oil boilers, heat pumps, and radiators. Stay warm with a reliable system.' },
+        { name: 'D├®tection de Fuites', desc: 'Precise, no-tear detection using thermal cameras and tracer gas. We seal at the source to prevent recurrence.' },
+        { name: 'R├®novation Salle de Bain', desc: 'From tiling to the vanity unit, we build the bathroom you envision, turnkey, with a detailed quote.' },
+        { name: 'Entretien Annuel', desc: 'A preventive check of your heating and pipes extends equipment life and prevents breakdowns.' }
+      ],
+      faq: [
+        { q: 'What should I do in case of a water leak?', a: 'Shut the main stopcock, cut the power if water nears an outlet, then call us: we respond to emergencies 7 days a week.' },
+        { q: 'Do you offer boiler servicing?', a: 'Yes, our annual plan includes a heating check, descaling, and a safety compliance review.' },
+        { q: 'Is your work guaranteed?', a: 'Yes, all our interventions are covered by a 10-year warranty and quoted in writing before any site work.' }
+      ]
+    }
+  },
+
+  coiffeur: {
+    fr: {
+      bespoke: null,
+      trustBadges: ['Conseil gratuit', 'Produits bio', 'Outils st├®rilis├®s', 'Satisfait ou refait'],
+      whyUs: [
+        { title: 'Visagisme personnalis├®', desc: 'Chaque coupe est pens├®e pour votre morphologie et votre style de vie.' },
+        { title: 'Produits respectueux', desc: 'Nous travaillons avec des soins doux et, sur demande, des colorations v├®g├®tales.' },
+        { title: 'Outils st├®rilis├®s', desc: 'Hygi├¿ne rigoureuse : chaque instrument est st├®rilis├® apr├¿s chaque client.' },
+        { title: 'Satisfait ou refait', desc: "Si le r├®sultat ne vous convient pas, nous y rem├®dions gratuitement." }
+      ],
+      services: [
+        { name: 'Coupes & Styles', desc: "Coupe sur-mesure femme et homme avec visagisme personnalis├®. Nos techniques actuelles et nos conseils d'entretien prolongent l'effet entre deux rendez-vous." },
+        { name: 'Barbier Traditionnel', desc: "Rasage ├á l'ancienne, taille de barbe et soins du visage dans un rituel masculin. Un moment de d├®tente autant qu'une finition pr├®cise." },
+        { name: 'Coloration Expert', desc: "Balayages, ombr├®s et couleurs sur mesure, y compris des formules v├®g├®tales respectueuses de la fibre. Une brillance longue dur├®e, sans d├®gradation." },
+        { name: 'Soins Capillaires', desc: "Botox capillaire, k├®ratine et massages cr├óniens pour cheveux ab├«m├®s ou secs. On r├®pare en profondeur tout en vous relaxant." },
+        { name: 'Extensions Volume', desc: "Rajouts de longueur et d'├®paisseur en pose ├á froid ou tape-in, discr├¿te et durable. L'entretien est inclus pour pr├®server le r├®sultat." },
+        { name: 'Chignons & ├ëv├®nements', desc: "Coiffures de c├®r├®monie, mariage et ├®v├®nements, avec option maquillage. Vous ├¬tes sublime, sereine, pour les grands jours." }
+      ],
+      faq: [
+        { q: 'Proposez-vous des colorations sans ammoniaque ?', a: 'Oui, nous utilisons des colorations v├®g├®tales et des techniques respectueuses de la fibre capillaire sur simple demande.' },
+        { q: 'Combien de temps dure une pose d\'extensions ?', a: 'Selon la technique (tape-in ou pose ├á froid), comptez entre 1h30 et 3h, entretien inclus dans le soin.' },
+        { q: 'Que signifie ┬½ satisfait ou refait ┬╗ ?', a: "Si la coupe ne vous convient pas ├á la sortie du salon, nous la reprenons gratuitement lors d'un rendez-vous d├®di├®." }
+      ]
+    },
+    en: {
+      bespoke: null,
+      trustBadges: ['Free consult', 'Organic products', 'Sterilized tools', 'Redo if unhappy'],
+      whyUs: [
+        { title: 'Personalized face-shaping', desc: 'Every cut is designed around your features and lifestyle.' },
+        { title: 'Gentle products', desc: 'We use kind formulations and, on request, plant-based color.' },
+        { title: 'Sterilized tools', desc: 'Strict hygiene: every instrument is sterilized after each client.' },
+        { title: 'Redo if unhappy', desc: "If the result isn't right, we fix it free of charge." }
+      ],
+      services: [
+        { name: 'Coupes & Styles', desc: 'Tailored cuts for men and women with personalized face-shaping. Current techniques and aftercare advice keep the look fresh between visits.' },
+        { name: 'Barbier Traditionnel', desc: "Old-fashioned shave, beard shaping, and facial care in a men's ritual. As relaxing as it is precise." },
+        { name: 'Coloration Expert', desc: 'Balayage, ombre, and custom color, including plant-based formulas that respect the hair. Long-lasting shine without damage.' },
+        { name: 'Soins Capillaires', desc: 'Capillary botox, keratin, and scalp massages for damaged or dry hair. We repair deep down while you unwind.' },
+        { name: 'Extensions Volume', desc: 'Length and volume add-ons in cold or tape-in application, discreet and durable. Aftercare is included to preserve the result.' },
+        { name: 'Chignons & ├ëv├®nements', desc: 'Ceremony, wedding, and event styling, with optional makeup. You look radiant and relaxed on the big day.' }
+      ],
+      faq: [
+        { q: 'Do you offer ammonia-free color?', a: 'Yes, we use plant-based color and hair-friendly techniques on request.' },
+        { q: 'How long does an extension appointment take?', a: 'Depending on the method (tape-in or cold application), allow 1h30 to 3h, with aftercare included.' },
+        { q: 'What does "redo if unhappy" mean?', a: "If the cut isn't right when you leave, we redo it free of charge at a dedicated appointment." }
+      ]
+    }
+  },
+
+  restaurant: {
+    fr: {
+      bespoke: 'restaurant',
+      trustBadges: ['R├®servation en ligne', 'Produits frais', 'Parking gratuit', 'Note 4.8/5'],
+      whyUs: [
+        { title: 'Produits frais du march├®', desc: 'Nos plats sont pr├®par├®s chaque jour ├á partir de produits de saison.' },
+        { title: 'Ambiance chaleureuse', desc: 'Un cadre convivial et un accueil soign├® pour vos moments en famille ou entre amis.' },
+        { title: 'Carte des vins r├®fl├®chie', desc: 'Des accords mets-vins s├®lectionn├®s pour sublimer chaque assiette.' },
+        { title: 'Service jusqu\'├á tard', desc: 'R├®servation facile et service continu pour ne jamais vous faire attendre.' }
+      ],
+      services: [
+        { name: 'Cuisine Maison', desc: "Tous nos plats sont pr├®par├®s sur place, avec des produits locaux et des recettes authentiques. Une cuisine faite minute qui respecte le go├╗t des vrais aliments." },
+        { name: 'Menu du Jour', desc: "Une formule d├®jeuner ├®quilibr├®e entr├®e + plat + dessert, ├á petit prix. Produits frais et cuisson minute pour une pause m├®ridienne r├®ussie." },
+        { name: 'Sp├®cialit├®s', desc: "Nos plats signature : recettes du terroir, grillades et poissons frais. Ce qui fait la r├®putation de la maison, ├á chaque service." },
+        { name: '├ëv├®nements & Groupes', desc: "Repas de famille, anniversaires et s├®minaires dans une salle privative. Un menu sur mesure et un service ├á votre rythme." },
+        { name: 'Service Traiteur', desc: "Plateaux repas, buffets et livraison pour vos r├®ceptions professionnelles. Une cuisine de restaurant, chez vous ou sur votre lieu d'├®v├®nement." },
+        { name: 'Boissons & Vins', desc: "Une carte de vins r├®gionaux, de cocktails maison et de bi├¿res artisanales. L'accord parfait pour accompagner vos plats." }
+      ],
+      faq: [
+        { q: 'Proposez-vous des menus pour groupes ?', a: 'Oui, nous concevons des formules sur mesure pour les ├®v├®nements et les s├®minaires, avec une salle privative selon disponibilit├®.' },
+        { q: 'Y a-t-il des options v├®g├®tariennes ?', a: 'Oui, notre cuisine maison propose syst├®matiquement au moins une option v├®g├®tarienne et peut adapter sur demande.' },
+        { q: 'Comment r├®server une table ?', a: 'Vous pouvez r├®server en ligne ou par t├®l├®phone ; nous confirmons sous peu et gardons votre table en priorit├®.' }
+      ]
+    },
+    en: {
+      bespoke: 'restaurant',
+      trustBadges: ['Book online', 'Fresh produce', 'Free parking', '4.8/5 rating'],
+      whyUs: [
+        { title: 'Fresh market produce', desc: 'Our dishes are prepared daily from seasonal ingredients.' },
+        { title: 'Warm atmosphere', desc: 'A welcoming setting and attentive service for time with family or friends.' },
+        { title: 'Thoughtful wine list', desc: 'Selected food-and-wine pairings to elevate every plate.' },
+        { title: 'Service until late', desc: 'Easy booking and continuous service so you never wait.' }
+      ],
+      services: [
+        { name: 'Cuisine Maison', desc: 'Every dish is prepared on site with local produce and authentic recipes. Cooked to order, respecting the true taste of real food.' },
+        { name: 'Menu du Jour', desc: 'A balanced lunch deal ÔÇö starter, main, dessert ÔÇö at a gentle price. Fresh produce and cooked-to-order for a successful midday break.' },
+        { name: 'Sp├®cialit├®s', desc: 'Our signature dishes: regional recipes, grills, and fresh fish. What built the house\'s reputation, every service.' },
+        { name: '├ëv├®nements & Groupes', desc: 'Family meals, birthdays, and seminars in a private room. A tailored menu and service at your own pace.' },
+        { name: 'Service Traiteur', desc: 'Meal trays, buffets, and delivery for your corporate events. Restaurant-quality food, at home or at your venue.' },
+        { name: 'Boissons & Vins', desc: 'A list of regional wines, house cocktails, and craft beers. The perfect match for your dishes.' }
+      ],
+      faq: [
+        { q: 'Do you offer group menus?', a: 'Yes, we design custom packages for events and seminars, with a private room subject to availability.' },
+        { q: 'Are there vegetarian options?', a: 'Yes, our house kitchen always offers at least one vegetarian option and can adapt on request.' },
+        { q: 'How do I book a table?', a: 'You can book online or by phone; we confirm shortly and keep your table prioritized.' }
+      ]
+    }
+  },
+
+  dentiste: {
+    fr: {
+      bespoke: 'medical',
+      trustBadges: ['Urgence quotidienne', 'Cabinet ├®quip├®', 'Soins indolores', 'St├®rilisation garantie'],
+      whyUs: [
+        { title: 'Soins sans douleur', desc: 'Des techniques modernes et une anesth├®sie ma├«tris├®e pour des soins sereins.' },
+        { title: 'Cabinet ├®quip├®', desc: 'Radiographie num├®rique et st├®rilisation int├®gr├®e pour un diagnostic fiable.' },
+        { title: 'Prise en charge globale', desc: "De la pr├®vention ├á l'esth├®tique, nous suivons votre sant├® bucco-dentaire." },
+        { title: 'Urgences prises rapidement', desc: "Un cr├®neau d'urgence est r├®serv├® chaque jour pour les douleurs aigu├½s." }
+      ],
+      services: [
+        { name: 'Soins dentaires', desc: "D├®tartrage, caries et soins conservateurs r├®alis├®s avec douceur et pr├®cision. Nous privil├®gions la pr├®vention pour garder vos dents saines le plus longtemps possible." },
+        { name: 'Blanchiment', desc: "Un blanchiment professionnel sous contr├┤le dentaire, plus s├╗r et plus durable qu'un kit en libre-service. Un sourire ├®clairci sans ab├«mer l'├®mail." },
+        { name: 'Orthodontie', desc: "Aligneurs transparents ou appareils pour enfants et adultes, suivis r├®guli├¿rement. Un traitement progressif pour un sourire droit et fonctionnel." },
+        { name: 'Urgence dentaire', desc: "Douleur vive, dent fractur├®e ou infection : un cr├®neau d'urgence vous est r├®serv├® chaque jour. Nous calmons la douleur et traitons la cause rapidement." },
+        { name: 'Implantologie', desc: "Remplacement d'une ou plusieurs dents manquantes par implants en titane, ancr├®s dans l'os. Une solution stable et durable qui pr├®serve l'os." },
+        { name: 'Esth├®tique du sourire', desc: "Facettes, couronnes et r├®├®quilibrage gingival pour harmoniser votre sourire. Un r├®sultat naturel, pens├® avec vous lors d'une consultation." }
+      ],
+      faq: [
+        { q: 'Le blanchiment ab├«me-t-il les dents ?', a: 'R├®alis├® sous contr├┤le dentaire, le blanchiment professionnel est s├╗r et n\'alt├¿re pas l\'├®mail ; nous v├®rifions au pr├®alable l\'absence de contre-indications.' },
+        { q: '├Ç quel ├óge commencer l\'orthodontie ?', a: 'Un premier bilan vers 6-7 ans permet de rep├®rer les anomalies ; le traitement actif d├®bute souvent vers 9-12 ans, mais l\'orthodontie adulte est courante.' },
+        { q: 'Que faire en cas de dent fractur├®e ?', a: "Conservez le fragment si possible, rincez ├á l'eau claire et appelez-nous : un cr├®neau d'urgence est r├®serv├® chaque jour." }
+      ]
+    },
+    en: {
+      bespoke: 'medical',
+      trustBadges: ['Daily emergency', 'Equipped clinic', 'Painless care', 'Sterilization guaranteed'],
+      whyUs: [
+        { title: 'Painless care', desc: 'Modern techniques and well-managed anesthesia for stress-free visits.' },
+        { title: 'Equipped clinic', desc: 'Digital X-ray and integrated sterilization for reliable diagnosis.' },
+        { title: 'Whole-mouth care', desc: 'From prevention to aesthetics, we follow your oral health.' },
+        { title: 'Fast emergencies', desc: 'A same-day emergency slot is kept for acute pain.' }
+      ],
+      services: [
+        { name: 'Soins dentaires', desc: 'Scaling, fillings, and conservative care done gently and precisely. We favor prevention to keep your teeth healthy as long as possible.' },
+        { name: 'Blanchiment', desc: 'Professional, dentist-supervised whitening ÔÇö safer and longer-lasting than over-the-counter kits. A brighter smile without harming enamel.' },
+        { name: 'Orthodontie', desc: 'Clear aligners or braces for children and adults, monitored regularly. A gradual treatment for a straight, functional smile.' },
+        { name: 'Urgence dentaire', desc: 'Severe pain, a broken tooth, or infection: a daily emergency slot is reserved for you. We relieve the pain and treat the cause fast.' },
+        { name: 'Implantologie', desc: 'Replacing one or more missing teeth with titanium implants anchored in the bone. A stable, durable solution that preserves bone.' },
+        { name: 'Esth├®tique du sourire', desc: 'Veneers, crowns, and gum recontouring to harmonize your smile. A natural result designed with you in consultation.' }
+      ],
+      faq: [
+        { q: 'Does whitening damage teeth?', a: 'Done under dental supervision, professional whitening is safe and does not alter enamel; we first check there are no contraindications.' },
+        { q: 'At what age should orthodontics start?', a: 'A first check around age 6-7 spots abnormalities; active treatment often begins around 9-12, but adult orthodontics is common.' },
+        { q: 'What if a tooth is broken?', a: "Keep the fragment if possible, rinse with clean water, and call us: a daily emergency slot is reserved." }
+      ]
+    }
+  },
+
+  avocat: {
+    fr: {
+      bespoke: null,
+      trustBadges: ['1er RDV conseil', 'Honoraires transparents', 'Avocat au barreau', 'Confidentialit├®'],
+      whyUs: [
+        { title: 'Avocat inscrit au barreau', desc: 'Une d├®fense assur├®e par un professionnel du droit r├®guli├¿rement form├®.' },
+        { title: 'Strat├®gie sur mesure', desc: 'Chaque dossier est analys├® pour b├ótir l\'approche la plus favorable.' },
+        { title: 'Honoraires transparents', desc: 'Un devis clair d├¿s le premier rendez-vous, sans frais cach├®s.' },
+        { title: 'Confidentialit├® absolue', desc: 'Vos ├®changes restent prot├®g├®s par le secret professionnel.' }
+      ],
+      services: [
+        { name: 'Droit Civil & Famille', desc: "Divorce, succession, bail et r├®gime matrimonial : nous vous guidons dans ces moments sensibles avec fermet├® et humanit├®. Une strat├®gie claire, adapt├®e ├á votre situation familiale." },
+        { name: 'Droit P├®nal', desc: "D├®fense et assistance en garde ├á vue, devant le tribunal correctionnel et pour les victimes. Nous prot├®geons vos droits ├á chaque ├®tape de la proc├®dure." },
+        { name: 'Droit du Travail', desc: "Licenciement, rupture conventionnelle, harc├¿lement et prud'hommes : nous d├®fendons salari├®s comme employeurs. Un accompagnement prudentiel et rigoureux." },
+        { name: 'Droit des Affaires', desc: "Cr├®ation de soci├®t├®, contrats commerciaux et recouvrement : un conseil preventif qui s├®curise votre activit├®. Anticiper vaut mieux que litiger." },
+        { name: 'Immobilier', desc: "Vente, achat, copropri├®t├® et litiges de construction : nous s├®curisons votre transaction et d├®fendons vos int├®r├¬ts patrimoniaux." },
+        { name: 'Droit Routier', desc: "Retrait de permis, exc├¿s de vitesse et infractions : nous d├®fendons votre capacit├® ├á conduire. Une proc├®dure rapide, orient├®e r├®sultat." }
+      ],
+      faq: [
+        { q: 'Combien co├╗te une consultation ?', a: 'Nos honoraires vous sont communiqu├®s d├¿s le premier rendez-vous sous forme de devis clair, avant toute diligence.' },
+        { q: 'Puis-je b├®n├®ficier de l\'aide juridictionnelle ?', a: 'Oui, le cabinet ├®tudie votre ├®ligibilit├® et monte le dossier d\'aide juridictionnelle si vos ressources le permettent.' },
+        { q: 'Mes ├®changes sont-ils confidentiels ?', a: 'Absolument : le secret professionnel lie votre avocat, vos ├®changes ne peuvent ├¬tre divulgu├®s ├á quiconque.' }
+      ]
+    },
+    en: {
+      bespoke: null,
+      trustBadges: ['First consult', 'Transparent fees', 'Bar certified', 'Confidentiality'],
+      whyUs: [
+        { title: 'Bar-certified attorney', desc: 'A defense handled by a legal professional in ongoing training.' },
+        { title: 'Tailored strategy', desc: 'Every case is analyzed to build the most favorable approach.' },
+        { title: 'Transparent fees', desc: 'A clear quote from the first appointment, with no hidden costs.' },
+        { title: 'Absolute confidentiality', desc: 'Your exchanges remain protected by professional privilege.' }
+      ],
+      services: [
+        { name: 'Droit Civil & Famille', desc: 'Divorce, inheritance, leases, and matrimonial regimes: we guide you through sensitive moments with firmness and humanity. A clear strategy suited to your family situation.' },
+        { name: 'Droit P├®nal', desc: 'Defense and assistance in custody, before the criminal court, and for victims. We protect your rights at every stage of the proceedings.' },
+        { name: 'Droit du Travail', desc: 'Dismissal, settlement agreements, harassment, and employment tribunals: we defend employees and employers alike. Prudent, rigorous support.' },
+        { name: 'Droit des Affaires', desc: 'Company formation, commercial contracts, and debt recovery: preventive counsel that secures your activity. Anticipating beats litigating.' },
+        { name: 'Immobilier', desc: 'Sale, purchase, co-ownership, and construction disputes: we secure your transaction and defend your property interests.' },
+        { name: 'Droit Routier', desc: 'License suspension, speeding, and offenses: we defend your ability to drive. A fast, results-oriented process.' }
+      ],
+      faq: [
+        { q: 'How much does a consultation cost?', a: 'Our fees are shared with you as a clear quote at the first appointment, before any action is taken.' },
+        { q: 'Can I get legal aid?', a: 'Yes, the firm reviews your eligibility and files the legal-aid application if your means allow it.' },
+        { q: 'Are my exchanges confidential?', a: 'Absolutely: professional privilege binds your lawyer, and your exchanges cannot be disclosed to anyone.' }
+      ]
+    }
+  },
+
+  nettoyage: {
+    fr: {
+      bespoke: null,
+      trustBadges: ['Devis gratuit', 'Produits ├®colabels', '├ëquipe form├®e', 'Assurance RC Pro'],
+      whyUs: [
+        { title: 'Produits ├®colabels', desc: 'Nous nettoyons avec des produits respectueux de la sant├® et de l\'environnement.' },
+        { title: '├ëquipes form├®es et v├®rifi├®es', desc: 'Des intervenants de confiance, brief├®s sur vos priorit├®s.' },
+        { title: 'Intervention flexible', desc: 'Des plages horaires adapt├®es ├á votre activit├®, de jour comme de nuit.' },
+        { title: 'Assurance responsabilit├® civile', desc: 'Toute notre prestation est couverte en cas de dommage.' }
+      ],
+      services: [
+        { name: 'Nettoyage de Bureaux', desc: "Entretien quotidien de vos locaux : poussi├¿re, sols et vitres, avec des produits ├®colabels. Des horaires flexibles qui respectent votre activit├®." },
+        { name: 'Nettoyage Vitres', desc: "Vitres int├®rieures et ext├®rieures, y compris en acc├¿s difficile (b├ótiments R+10), sans trace garantie. Une transparence parfaite, en toute s├®curit├®." },
+        { name: 'Grand Nettoyage', desc: "Nettoyage en profondeur r├®sidentiel : cuisine d├®graiss├®e, salle de bain d├®sinfect├®e, sol cir├®. Votre logement retrouve son ├®clat." },
+        { name: 'D├®sinfection', desc: "Traitement anti-bact├®rien et virucide certifi├®, avec produits bio et rapport de traitement. Un environnement sain, document├® et rassurant." },
+        { name: 'Nettoyage Industriel', desc: "Entrep├┤ts, usines et ateliers avec monobrosse industrielle et aspirateur eau/poussi├¿re. Intervention de nuit pour ne pas g├¬ner la production." },
+        { name: 'Remise en ├ëtat', desc: "Apr├¿s travaux ou d├®m├®nagement : ├®vacuation des gravats, nettoyage fin et livraison cl├® en main. On vous rend les lieux habitables." }
+      ],
+      faq: [
+        { q: 'Travaillez-vous avec des produits ├®cologiques ?', a: 'Oui, nous utilisons syst├®matiquement des produits ├®colabels et des protocoles respectueux de la sant├®.' },
+        { q: 'Pouvez-vous intervenir le soir ou la nuit ?', a: 'Oui, nos plages horaires sont flexibles, y compris de nuit pour les sites industriels ou les bureaux.' },
+        { q: '├ètes-vous assur├®s ?', a: 'Oui, notre prestation est couverte par une assurance responsabilit├® civile professionnelle.' }
+      ]
+    },
+    en: {
+      bespoke: null,
+      trustBadges: ['Free quote', 'Eco-label products', 'Trained staff', 'Pro insurance'],
+      whyUs: [
+        { title: 'Eco-label products', desc: 'We clean with products that respect health and the environment.' },
+        { title: 'Trained, vetted staff', desc: 'Trustworthy operators briefed on your priorities.' },
+        { title: 'Flexible scheduling', desc: 'Time slots adapted to your activity, day or night.' },
+        { title: 'Liability insurance', desc: 'Every service is covered against damage.' }
+      ],
+      services: [
+        { name: 'Nettoyage de Bureaux', desc: 'Daily upkeep of your premises: dust, floors, and windows, with eco-label products. Flexible hours that respect your activity.' },
+        { name: 'Nettoyage Vitres', desc: 'Interior and exterior windows, including hard-to-reach ones (R+10 buildings), streak-free guaranteed. Perfect clarity, safely.' },
+        { name: 'Grand Nettoyage', desc: 'Deep residential cleaning: degreased kitchen, disinfected bathroom, waxed floor. Your home regains its shine.' },
+        { name: 'D├®sinfection', desc: 'Certified anti-bacterial and virucidal treatment, with bio products and a treatment report. A healthy, documented, reassuring environment.' },
+        { name: 'Nettoyage Industriel', desc: 'Warehouses, factories, and workshops with industrial scrubbers and wet/dry vacuums. Night shifts so production is undisturbed.' },
+        { name: 'Remise en ├ëtat', desc: 'After works or moving: debris removal, fine cleaning, and turnkey handover. We return the premises livable.' }
+      ],
+      faq: [
+        { q: 'Do you use ecological products?', a: 'Yes, we systematically use eco-label products and health-friendly protocols.' },
+        { q: 'Can you work in the evening or at night?', a: 'Yes, our time slots are flexible, including nights for industrial sites or offices.' },
+        { q: 'Are you insured?', a: 'Yes, our service is covered by professional liability insurance.' }
+      ]
+    }
+  },
+
+  jardin: {
+    fr: {
+      bespoke: null,
+      trustBadges: ['Devis gratuit', 'Plantes garanties', 'Conseil saisonnier', 'Paysagiste qualifi├®'],
+      whyUs: [
+        { title: 'Paysagiste ├á l\'├®coute', desc: 'Nous concevons un espace vert qui vous ressemble et respecte votre terrain.' },
+        { title: 'Plantes garanties', desc: 'Nos v├®g├®taux sont s├®lectionn├®s vigoureux et accompagn├®s d\'un suivi.' },
+        { title: 'Entretien saisonnier', desc: 'Taille, tonte et conseils adapt├®s au rythme des saisons.' },
+        { title: 'Travail propre et soign├®', desc: 'Nous laissons votre jardin net, sans d├®chets ni d├®gradation.' }
+      ],
+      services: [
+        { name: 'Cr├®ation de Jardins', desc: "Am├®nagement paysager complet avec plan sur mesure, plantations adapt├®es au sol et gazon en rouleaux. Un jardin pens├® pour durer et vous ressembler." },
+        { name: 'Tonte & Entretien', desc: "Pelouse et massifs entretenus : tonte r├®guli├¿re, taille de haies et d├®sherbage manuel. Un ext├®rieur toujours soign├®, sans effort pour vous." },
+        { name: '├ëlagage & Abattage', desc: "Arbres et arbustes s├®curis├®s par un grimpeur pro, avec ├®lagage raisonn├® et broyage des branches. On pr├®serve la sant├® de votre arboriculture." },
+        { name: 'Terrasses & Cl├┤tures', desc: "Am├®nagement en bois : terrasse pin ou ip├®, cl├┤ture d'occultation et pergolas. Des structures solides qui structurent votre jardin." },
+        { name: 'Arrosage Automatique', desc: "Installation de goutte-├á-goutte, tuy├¿res enterr├®es et programmateur connect├®. Moins de gaspillage, un arrosage r├®gulier m├¬me en votre absence." },
+        { name: 'Potager & Verger', desc: "Cr├®ation et entretien de bacs sur├®lev├®s, compostage et taille de fruitiers. R├®coltez vos propres l├®gumes et fruits, accompagn├® par un pro." }
+      ],
+      faq: [
+        { q: 'Proposez-vous un plan paysager ?', a: 'Oui, nous concevons un plan sur mesure apr├¿s visite, adapt├® ├á votre terrain, votre exposition et votre budget.' },
+        { q: 'Les plantes sont-elles garanties ?', a: 'Oui, nos v├®g├®taux sont s├®lectionn├®s vigoureux et font l\'objet d\'un suivi apr├¿s plantation.' },
+        { q: 'Intervenez-vous en hiver ?', a: 'Oui, la taille et l\'├®lagage se font souvent en p├®riode de repos v├®g├®tatif, id├®al pour la sant├® des arbres.' }
+      ]
+    },
+    en: {
+      bespoke: null,
+      trustBadges: ['Free quote', 'Plants guaranteed', 'Seasonal advice', 'Qualified landscaper'],
+      whyUs: [
+        { title: 'A landscaper who listens', desc: 'We design a green space that reflects you and respects your land.' },
+        { title: 'Guaranteed plants', desc: 'Our plants are selected vigorous and come with follow-up.' },
+        { title: 'Seasonal care', desc: 'Pruning, mowing, and advice paced to the seasons.' },
+        { title: 'Clean, careful work', desc: 'We leave your garden tidy, with no waste or damage.' }
+      ],
+      services: [
+        { name: 'Cr├®ation de Jardins', desc: 'Full landscape design with a custom plan, plantings suited to your soil, and roll-out turf. A garden built to last and to be yours.' },
+        { name: 'Tonte & Entretien', desc: 'Lawn and beds maintained: regular mowing, hedge trimming, and hand weeding. An always-tidy outdoors, effort-free for you.' },
+        { name: '├ëlagage & Abattage', desc: 'Trees and shrubs secured by a pro climber, with reasoned pruning and branch chipping. We protect the health of your trees.' },
+        { name: 'Terrasses & Cl├┤tures', desc: 'Wood work: pine or ipe deck, screening fence, and pergolas. Solid structures that shape your garden.' },
+        { name: 'Arrosage Automatique', desc: 'Drip systems, buried sprinklers, and a connected timer. Less waste, regular watering even when you are away.' },
+        { name: 'Potager & Verger', desc: 'Creation and care of raised beds, composting, and fruit-tree pruning. Harvest your own produce, guided by a pro.' }
+      ],
+      faq: [
+        { q: 'Do you provide a landscape plan?', a: 'Yes, we design a custom plan after a visit, adapted to your land, exposure, and budget.' },
+        { q: 'Are the plants guaranteed?', a: 'Yes, our plants are selected vigorous and come with follow-up after planting.' },
+        { q: 'Do you work in winter?', a: 'Yes, pruning and tree work often happen in the dormant season, ideal for tree health.' }
+      ]
+    }
+  },
+
+  coach: {
+    fr: {
+      bespoke: 'coach',
+      trustBadges: ['Essai offert', 'Coachs dipl├┤m├®s', 'Sans engagement', 'Suivi des r├®sultats'],
+      whyUs: [
+        { title: 'Coachs dipl├┤m├®s d\'├ëtat', desc: 'Un encadrement certifi├® pour progresser en s├®curit├®.' },
+        { title: 'Programme 100% personnalis├®', desc: 'Vos s├®ances s\'adaptent ├á votre niveau, vos objectifs et votre emploi du temps.' },
+        { title: 'Suivi des r├®sultats', desc: 'Nous mesurons vos progr├¿s pour garder la motivation au rendez-vous.' },
+        { title: 'Sans engagement', desc: 'Vous avancez ├á votre rythme, sans ├¬tre bloqu├® par un abonnement longue dur├®e.' }
+      ],
+      services: [
+        { name: 'Coaching Personnel', desc: "Accompagnement individuel sur mesure : bilan morphologique, programme adapt├® et suivi hebdomadaire. Un coach d├®di├® ├á vos objectifs, en salle comme ├á domicile." },
+        { name: 'Cours Collectifs', desc: "Groupes dynamiques et motivants : HIIT, yoga, zumba et musculation guid├®e. L'├®nergie du collectif pour rester r├®gulier." },
+        { name: 'Musculation Libre', desc: "Un espace halt├¿res et machines avec poids libres, machines guid├®es et cage ├á squat. Une progression en force s├╗re et progressive." },
+        { name: 'Cardio Zone', desc: "Tapis connect├®s, v├®los elliptiques et rameurs pour votre endurance. Des sessions qui respectent votre niveau et votre c┼ôur." },
+        { name: 'Pr├®paration Physique', desc: "Pr├®paration ├á la comp├®tition ou remise en forme : tests de performance, plan nutrition et r├®cup├®ration. Une approche globale de la performance." },
+        { name: 'Espace Bien-├¬tre', desc: "Sauna, douche ├á jets et casiers s├®curis├®s pour la d├®tente apr├¿s l'effort. Parce que la r├®cup├®ration fait partie du r├®sultat." }
+      ],
+      faq: [
+        { q: 'Faut-il ├¬tre d├®j├á sportif pour commencer ?', a: 'Non, nos programmes sont adapt├®s ├á chaque niveau, du grand d├®butant ├á l\'athl├¿te confirm├®, avec un bilan initial.' },
+        { q: 'Le premier essai est-il vraiment offert ?', a: 'Oui, nous proposons un essai sans engagement pour d├®couvrir le coaching et l\'ambiance du lieu.' },
+        { q: 'Suivez-vous l\'alimentation ?', a: 'Oui, nos coachs dipl├┤m├®s int├¿grent des conseils nutritionnels simples ├á votre plan de progression.' }
+      ]
+    },
+    en: {
+      bespoke: 'coach',
+      trustBadges: ['Free trial', 'Certified coaches', 'No commitment', 'Results tracked'],
+      whyUs: [
+        { title: 'State-certified coaches', desc: 'Certified supervision to progress safely.' },
+        { title: '100% personalized plan', desc: 'Your sessions adapt to your level, goals, and schedule.' },
+        { title: 'Results tracking', desc: 'We measure your progress to keep motivation high.' },
+        { title: 'No commitment', desc: 'You move at your own pace, not locked into a long contract.' }
+      ],
+      services: [
+        { name: 'Coaching Personnel', desc: 'Tailored one-on-one coaching: body assessment, adapted program, and weekly follow-up. A dedicated coach for your goals, in the gym or at home.' },
+        { name: 'Cours Collectifs', desc: 'Dynamic, motivating groups: HIIT, yoga, zumba, and guided strength. The energy of the group keeps you consistent.' },
+        { name: 'Musculation Libre', desc: 'A free-weights and machines area with dumbbells, guided machines, and a squat rack. Safe, progressive strength gains.' },
+        { name: 'Cardio Zone', desc: 'Connected treadmills, ellipticals, and rowers for your endurance. Sessions that respect your level and your heart.' },
+        { name: 'Pr├®paration Physique', desc: 'Competition prep or getting back in shape: performance tests, nutrition plan, and recovery. A holistic approach to performance.' },
+        { name: 'Espace Bien-├¬tre', desc: 'Sauna, jet shower, and secure lockers to unwind after effort. Because recovery is part of the result.' }
+      ],
+      faq: [
+        { q: 'Do I need to be athletic to start?', a: 'No, our programs fit every level, from complete beginner to seasoned athlete, with an initial assessment.' },
+        { q: 'Is the first trial really free?', a: 'Yes, we offer a no-commitment trial to discover coaching and the atmosphere of the place.' },
+        { q: 'Do you follow nutrition?', a: 'Yes, our certified coaches weave simple nutrition advice into your progression plan.' }
+      ]
+    }
+  },
+
+  garage: {
+    fr: {
+      bespoke: null,
+      trustBadges: ['Devis gratuit', 'Diagnostic pr├®cis', 'V├®hicule de courtoisie', 'Pi├¿ces garanties'],
+      whyUs: [
+        { title: 'Diagnostic pr├®cis', desc: 'Notre valise multimarque identifie la panne sans t├ótonner.' },
+        { title: 'Devis avant r├®paration', desc: 'Vous validez le prix avant tout travail, pi├¿ces et main-d\'┼ôuvre incluses.' },
+        { title: 'V├®hicule de courtoisie', desc: 'Restez mobile pendant l\'intervention quand c\'est possible.' },
+        { title: 'Pi├¿ces garanties', desc: 'Les pi├¿ces et la main-d\'┼ôuvre b├®n├®ficient d\'une garantie.' }
+      ],
+      services: [
+        { name: 'M├®canique G├®n├®rale', desc: "Entretien et r├®paration toutes marques : r├®visions constructeur, courroies et freins. Un travail soign├® pour prolonger la vie de votre v├®hicule." },
+        { name: 'Diagnostic Auto', desc: "Analyse ├®lectronique compl├¿te avec valise multimarque, effacement des d├®fauts et param├®trage. On cerne la panne sans d├®montage inutile." },
+        { name: 'Pneumatiques', desc: "Montage, ├®quilibrage et g├®om├®trie : pneus toutes saisons, run-flat et parall├®lisme. Une tenue de route s├╗re et un usure ma├«tris├®e." },
+        { name: 'Climatisation', desc: "Recharge et r├®paration clim, d├®tection de fuites et remplacement du filtre habitacle. Conduisez au frais, m├¬me en plein ├®t├®." },
+        { name: 'Carrosserie', desc: "D├®bosselage, peinture ├á la nuance et polissage optique. Redonnez ├á votre carrosserie son aspect d'origine." },
+        { name: 'Contr├┤le Technique', desc: "Pr├®-contr├┤le, r├®parations de conformit├® et accompagnement en contre-visite. Vous passez le contr├┤le en toute s├®r├®nit├®." }
+      ],
+      faq: [
+        { q: 'Proposez-vous un v├®hicule de remplacement ?', a: 'Oui, dans la mesure des disponibilit├®s, un v├®hicule de courtoisie vous est pr├¬t├® pendant l\'intervention.' },
+        { q: 'Le devis est-il gratuit ?', a: 'Oui, le diagnostic et le devis sont gratuits et d├®taill├®s avant toute r├®paration accept├®e.' },
+        { q: 'Les pi├¿ces sont-elles garanties ?', a: 'Oui, les pi├¿ces comme la main-d\'┼ôuvre sont couvertes par une garantie sur les interventions r├®alis├®es.' }
+      ]
+    },
+    en: {
+      bespoke: null,
+      trustBadges: ['Free quote', 'Accurate diagnosis', 'Courtesy car', 'Parts guaranteed'],
+      whyUs: [
+        { title: 'Accurate diagnosis', desc: 'Our multi-brand scanner pinpoints the fault without guesswork.' },
+        { title: 'Quote before repair', desc: 'You approve the price before any work, parts and labor included.' },
+        { title: 'Courtesy vehicle', desc: 'Stay mobile during the job whenever possible.' },
+        { title: 'Guaranteed parts', desc: 'Parts and labor come with a warranty.' }
+      ],
+      services: [
+        { name: 'M├®canique G├®n├®rale', desc: 'Servicing and repair for all makes: manufacturer schedules, belts, and brakes. Careful work to extend your vehicle\'s life.' },
+        { name: 'Diagnostic Auto', desc: 'Full electronic analysis with a multi-brand scanner, fault clearing, and tuning. We locate the fault without needless teardown.' },
+        { name: 'Pneumatiques', desc: 'Fitting, balancing, and alignment: all-season tires, run-flats, and tracking. Safe road holding and controlled wear.' },
+        { name: 'Climatisation', desc: 'AC recharge and repair, leak detection, and cabin-filter replacement. Drive cool even in peak summer.' },
+        { name: 'Carrosserie', desc: 'Dent removal, color-matched paint, and headlight polishing. We restore your bodywork to its original look.' },
+        { name: 'Contr├┤le Technique', desc: 'Pre-check, compliance repairs, and counter-inspection support. You pass the inspection with peace of mind.' }
+      ],
+      faq: [
+        { q: 'Do you offer a replacement vehicle?', a: 'Yes, subject to availability, a courtesy car is lent to you during the intervention.' },
+        { q: 'Is the quote free?', a: 'Yes, diagnosis and quote are free and detailed before any accepted repair.' },
+        { q: 'Are parts guaranteed?', a: 'Yes, both parts and labor are covered by a warranty on the work performed.' }
+      ]
+    }
+  },
+
+  medical: {
+    fr: {
+      bespoke: 'medical',
+      trustBadges: ['RDV < 48h', 'Conventionn├®', 'Tiers payant', '├ëquipe pluridisciplinaire'],
+      whyUs: [
+        { title: 'Professionnels de sant├® conventionn├®s', desc: 'Des soins pris en charge, dans le respect du parcours de soins.' },
+        { title: 'RDV sous 48h', desc: 'Un cr├®neau rapide pour ne pas laisser attendre vos sympt├┤mes.' },
+        { title: '├ëquipe pluridisciplinaire', desc: 'M├®decine, kin├®, infirmier et t├®l├®consultation sous un m├¬me toit.' },
+        { title: 'Tiers payant', desc: 'Moins d\'avance de frais gr├óce ├á la dispense d\'avance de paiement.' }
+      ],
+      services: [
+        { name: 'M├®decine G├®n├®rale', desc: "Consultations et suivi de sant├® : bilan annuel, vaccinations et certificats. Un m├®decin r├®f├®rent qui conna├«t votre historique." },
+        { name: 'Kin├®sith├®rapie', desc: "R├®├®ducation et r├®adaptation : massages m├®dicaux, post-op et posturologie. Une r├®cup├®ration progressive, encadr├®e par un pro." },
+        { name: 'Ost├®opathie', desc: "Soins manuels sans m├®dicaments, pour b├®b├®s, femmes enceintes et sportifs. Un ├®quilibre retrouv├® en douceur." },
+        { name: 'Infirmier ├á Domicile', desc: "Soins ├á domicile : injections, pansements et pr├®l├¿vements. La clinique vient ├á vous, en toute discr├®tion." },
+        { name: 'Analyses Biologiques', desc: "Laboratoire sur place : prise de sang, tests rapides et r├®sultats sous 24h. Un diagnostic sans d├®placement inutile." },
+        { name: 'T├®l├®m├®decine', desc: "Consultation vid├®o 7j/7, avec ordonnance ├®lectronique et sans d├®placement. Votre m├®decin ├á port├®e de clic." }
+      ],
+      faq: [
+        { q: 'Le cabinet est-il conventionn├® ?', a: 'Oui, nous sommes conventionn├®s secteur 1, ce qui limite les d├®passements d\'honoraires.' },
+        { q: 'Puis-je ├¬tre vu en moins de 48h ?', a: 'Oui, un cr├®neau de rendez-vous sous 48h est r├®serv├® pour les demandes non programm├®es.' },
+        { q: 'La t├®l├®consultation d├®livre-t-elle une ordonnance ?', a: 'Oui, la consultation vid├®o permet une ordonnance ├®lectronique transmise ├á votre pharmacie.' }
+      ]
+    },
+    en: {
+      bespoke: 'medical',
+      trustBadges: ['Appt < 48h', 'Insurance accepted', 'Direct billing', 'Multidisciplinary team'],
+      whyUs: [
+        { title: 'Contracted health professionals', desc: 'Care covered, within the proper care pathway.' },
+        { title: 'Appointment within 48h', desc: 'A quick slot so your symptoms don\'t wait.' },
+        { title: 'Multidisciplinary team', desc: 'Medicine, physio, nursing, and telehealth under one roof.' },
+        { title: 'Direct billing', desc: 'Less upfront cost thanks to dispensed advance payment.' }
+      ],
+      services: [
+        { name: 'M├®decine G├®n├®rale', desc: 'Consultations and health follow-up: annual check-up, vaccinations, and certificates. A referring doctor who knows your history.' },
+        { name: 'Kin├®sith├®rapie', desc: 'Rehabilitation and readaptation: medical massage, post-op, and posture work. Gradual recovery supervised by a pro.' },
+        { name: 'Ost├®opathie', desc: 'Drug-free manual care for babies, pregnant women, and athletes. Balance restored gently.' },
+        { name: 'Infirmier ├á Domicile', desc: 'Home care: injections, dressings, and blood samples. The clinic comes to you, discreetly.' },
+        { name: 'Analyses Biologiques', desc: 'On-site lab: blood draw, rapid tests, results within 24h. Diagnosis without needless travel.' },
+        { name: 'T├®l├®m├®decine', desc: 'Video consultation 7 days a week, with e-prescription and no travel. Your doctor a click away.' }
+      ],
+      faq: [
+        { q: 'Is the practice contracted?', a: 'Yes, we are contracted sector 1, which limits fee overruns.' },
+        { q: 'Can I be seen within 48h?', a: 'Yes, a same-week appointment slot is reserved for unscheduled requests.' },
+        { q: 'Does telehealth issue a prescription?', a: 'Yes, the video consultation provides an e-prescription sent to your pharmacy.' }
+      ]
+    }
+  },
+
+  // Generic fallback for artisan trades (peintre, r├®novation, chauffage, climÔÇª)
+  artisan: {
+    fr: {
+      bespoke: 'artisan',
+      trustBadges: ['Devis d├®taill├®', 'Travail soign├®', 'Respect des normes', 'Artisan qualifi├®'],
+      whyUs: [
+        { title: 'Artisan multiservices', desc: 'R├®novation, peinture, ├®lectricit├® et plomberie par un m├¬me interlocuteur.' },
+        { title: 'Devis d├®taill├®', desc: 'Chaque poste est chiffr├® clairement avant le d├®marrage du chantier.' },
+        { title: 'Travail soign├®', desc: 'Un savoir-faire artisanal pour des finitions durables.' },
+        { title: 'Respect des normes', desc: 'Nos interventions suivent la r├®glementation en vigueur.' }
+      ],
+      services: [
+        { name: 'R├®novation', desc: "Rafra├«chissement et mise aux normes de vos pi├¿ces, du sol au plafond. Un chantier coordonn├®, propre et dans les d├®lais." },
+        { name: 'Peinture', desc: "Pose de peintures et enduits, int├®rieur comme ext├®rieur, avec pr├®paration soign├®e des supports. Un rendu net et durable." },
+        { name: '├ëlectricit├® & Plomberie', desc: "Petits travaux courants : prises, ├®clairage, robinetterie et fuites. L'essentiel g├®r├® par un artisan de confiance." },
+        { name: 'Am├®nagement', desc: "Cr├®ation de rangements, cloisons et espaces sur mesure. On optimise votre surface selon vos besoins." },
+        { name: 'Isolation', desc: "Isolation des combles et des murs pour r├®duire votre facture ├®nerg├®tique. Un confort gagn├® toute l'ann├®e." },
+        { name: 'Entretien & D├®pannage', desc: "Interventions ponctuelles et maintenance pr├®ventive pour pr├®server vos installations. On anticipe plut├┤t que gu├®rir." }
+      ],
+      faq: [
+        { q: 'Proposez-vous un devis gratuit ?', a: 'Oui, nous ├®tablissons un devis d├®taill├® et gratuit apr├¿s visite, avant tout engagement.' },
+        { q: 'Intervenez-vous en urgence ?', a: 'Oui, nous traitons les d├®pannages courants (fuite, panne l├®g├¿re) dans la mesure du possible rapidement.' },
+        { q: 'Vos travaux respectent-ils les normes ?', a: 'Oui, chaque intervention suit la r├®glementation en vigueur et fait l\'objet d\'un devis ├®crit.' }
+      ]
+    },
+    en: {
+      bespoke: 'artisan',
+      trustBadges: ['Detailed quote', 'Careful work', 'Standards-compliant', 'Qualified tradesperson'],
+      whyUs: [
+        { title: 'Multi-trade artisan', desc: 'Renovation, painting, electrical, and plumbing through one point of contact.' },
+        { title: 'Detailed quote', desc: 'Every line item is priced clearly before work starts.' },
+        { title: 'Careful work', desc: 'Craftsmanship that delivers durable finishes.' },
+        { title: 'Standards-compliant', desc: 'Our work follows current regulations.' }
+      ],
+      services: [
+        { name: 'R├®novation', desc: 'Refreshing and bringing your rooms up to standard, floor to ceiling. A coordinated, clean job delivered on time.' },
+        { name: 'Peinture', desc: 'Paints and renders, interior and exterior, with careful surface prep. A clean, lasting result.' },
+        { name: '├ëlectricit├® & Plomberie', desc: 'Everyday small works: sockets, lighting, fittings, and leaks. The essentials handled by a trusted tradesperson.' },
+        { name: 'Am├®nagement', desc: 'Custom storage, partitions, and bespoke spaces. We optimize your floor area around your needs.' },
+        { name: 'Isolation', desc: 'Loft and wall insulation to cut your energy bill. Comfort gained all year round.' },
+        { name: 'Entretien & D├®pannage', desc: 'One-off interventions and preventive maintenance to preserve your installations. We prevent rather than cure.' }
+      ],
+      faq: [
+        { q: 'Do you offer a free quote?', a: 'Yes, we provide a free, detailed quote after a visit, before any commitment.' },
+        { q: 'Do you handle emergencies?', a: 'Yes, we address common repairs (leaks, minor faults) as quickly as possible.' },
+        { q: 'Is your work compliant?', a: 'Yes, every intervention follows current regulations and comes with a written quote.' }
+      ]
+    }
+  },
+
+  default: {
+    fr: {
+      bespoke: null,
+      trustBadges: ['Devis gratuit', 'R├®ponse rapide', 'Garantie satisfaction', '├ëquipe certifi├®e'],
+      whyUs: [
+        { title: '├ëcoute de vos besoins', desc: 'Nous prenons le temps de comprendre votre demande avant de proposer.' },
+        { title: 'Devis clair', desc: 'Un prix transparent, ├®tabli apr├¿s diagnostic, sans surprise.' },
+        { title: 'R├®activit├®', desc: 'Une r├®ponse rapide et un d├®but de prestation dans des d├®lais ma├«tris├®s.' },
+        { title: 'Satisfaction au c┼ôur', desc: 'Nous ajustons notre prestation jusqu\'├á ce que vous soyez satisfait.' }
+      ],
+      services: [
+        { name: 'Prestation Sur Mesure', desc: "Un service adapt├® ├á vos besoins r├®els, apr├¿s ├®tude personnalis├®e. Nous ├®coutons avant d'agir pour viser juste du premier coup." },
+        { name: 'Service Professionnel', desc: "Un travail soign├® r├®alis├® avec du mat├®riel adapt├® et les techniques actuelles. Le s├®rieux d'un professionnel, ├á chaque ├®tape." },
+        { name: 'Conseil & Accompagnement', desc: "Un accompagnement de A ├á Z : diagnostic complet, solutions pertinentes et suivi personnalis├®. Vous n'├¬tes jamais seul." },
+        { name: 'R├®activit├®', desc: "Une r├®ponse rapide et des horaires flexibles pour nous adapter ├á votre rythme. L'efficacit├® sans la pression." },
+        { name: 'Qualit├® Garantie', desc: "Un engagement sur le r├®sultat : contr├┤le qualit├®, corrections incluses et SAV r├®actif. Votre satisfaction est notre barre." },
+        { name: 'Tarifs Clairs', desc: "Des honoraires transparents avec devis pr├®alable et aucune surprise. Vous savez ce que vous payez, d├¿s le d├®part." }
+      ],
+      faq: [
+        { q: 'Proposez-vous un devis gratuit ?', a: 'Oui, nous ├®tablissons un devis clair et gratuit apr├¿s avoir compris votre besoin.' },
+        { q: 'Dans quels d├®lais intervenez-vous ?', a: 'Nous visons une r├®ponse rapide et un d├®marrage de prestation dans des d├®lais ma├«tris├®s, adapt├®s ├á votre situation.' },
+        { q: 'Que se passe-t-il si je ne suis pas satisfait ?', a: 'Notre garantie satisfaction inclut des corrections : nous ajustons jusqu\'├á ce que le r├®sultat vous convienne.' }
+      ]
+    },
+    en: {
+      bespoke: null,
+      trustBadges: ['Free quote', 'Fast response', 'Satisfaction guarantee', 'Certified team'],
+      whyUs: [
+        { title: 'We listen', desc: 'We take the time to understand your request before proposing.' },
+        { title: 'Clear quote', desc: 'A transparent price, set after diagnosis, with no surprises.' },
+        { title: 'Responsiveness', desc: 'A fast reply and service started within controlled timelines.' },
+        { title: 'Satisfaction first', desc: 'We tune our service until you are satisfied.' }
+      ],
+      services: [
+        { name: 'Tailored Service', desc: 'A service adapted to your real needs, after a personalized study. We listen before acting to hit the mark first time.' },
+        { name: 'Professional Service', desc: 'Careful work done with adapted equipment and current techniques. The seriousness of a pro, at every step.' },
+        { name: 'Consulting & Support', desc: 'End-to-end guidance: full diagnosis, relevant solutions, and personal follow-up. You are never alone.' },
+        { name: 'Responsiveness', desc: 'A fast reply and flexible hours to fit your pace. Efficiency without the pressure.' },
+        { name: 'Quality Guaranteed', desc: 'A commitment to results: quality control, corrections included, and responsive support. Your satisfaction is our bar.' },
+        { name: 'Clear Pricing', desc: 'Transparent fees with a prior quote and no surprises. You know what you pay, from the start.' }
+      ],
+      faq: [
+        { q: 'Do you offer a free quote?', a: 'Yes, we provide a clear, free quote once we understand your need.' },
+        { q: 'How quickly do you start?', a: 'We aim for a fast reply and a controlled start to the service, adapted to your situation.' },
+        { q: 'What if I am not satisfied?', a: 'Our satisfaction guarantee includes corrections: we adjust until the result suits you.' }
+      ]
+    }
+  }
+};
+
+// Keyword fallback rules (case-insensitive substring). Order matters: the
+// first matching rule wins. Exact sector key is tried before these.
+const FALLBACK_RULES: Array<[RegExp, string]> = [
+  [/dentiste|orthodont|blanch/, 'dentiste'],
+  [/avocat|jurid|notaire|huissier/, 'avocat'],
+  [/coach|sport|fitness|muscul|yoga/, 'coach'],
+  [/restaurant|cuisin|traiteur|pizz|brasser/, 'restaurant'],
+  [/nettoy|m├®nage|menage|propret|hygiene/, 'nettoyage'],
+  [/jardin|paysag|arbor|espac|vert/, 'jardin'],
+  [/garage|m├®can|auto|carross|v├®hicul/, 'garage'],
+  [/├®lectric|plomb|renov|r├®nov|peintr|chauffag|clim/, 'artisan'],
+  [/m├®dic|medic|clinique|kin├®|kine|pharmac|optic|infirm|ost├®o|sage/, 'medical']
+];
+
+/**
+ * Resolve sector-specific marketing copy for a given sector and language.
+ * Exact sector key match first (electricien, plombier, coiffeur, restaurant,
+ * dentiste, avocat, nettoyage, jardin, coach, garage, medical, default,
+ * artisan), then keyword fallback, otherwise the default pack.
+ */
+export function resolveSectorContent(sector: string, lang: Lang): SectorCopy {
+  const s = (sector || '').toLowerCase();
+  if (SECTOR_CONTENT_PACKS[s]) return SECTOR_CONTENT_PACKS[s][lang];
+  for (const [re, key] of FALLBACK_RULES) {
+    if (re.test(s)) return SECTOR_CONTENT_PACKS[key][lang];
+  }
+  return SECTOR_CONTENT_PACKS['default'][lang];
+}
