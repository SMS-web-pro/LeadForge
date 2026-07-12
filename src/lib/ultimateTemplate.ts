// ── PREMIUM LOCAL BUSINESS TEMPLATE ──
// Design épuré, luxe, professionnel. Zero gimmicks, zero popups agressifs.

import { getSectorImages, getSectorImagesAsync, getServiceImageQuery, fetchSectorImagesFromAPI, fetchServiceImages, getPexelsApiKey, setPexelsApiKey } from './pexelsImages';
import { getImagesForLead } from './pexelsApi';
import { isImageBlocked, filterImages, isStockImage } from './imageFilters';
import { getSectorConfig } from './sectorConfig';
import { UI } from './template/ui';
import { getProcessSteps, getGuarantees, getHeroBadge, getGalleryDesc, getPrivacyContent, generateFeaturesFromService, generateAboutText, capitalizeCity, getLogoInfo, detectLanguage, isEnglishText } from './template/helpers';
export { detectLanguage };

// ── AVIS FALLBACK SECTORIELS ──
const SECTOR_FALLBACK_REVIEWS: Record<string, Array<{ author: string; text: string; rating: number; date: string }>> = {
  plomberie: [
    { author: 'M. Dupont', text: "Fuite d'eau en pleine nuit, j'ai appelé à 2h du matin et le plombier est arrivé en 45 minutes. Il a utilisé sa caméra pour localiser la fuite sans casser le carrelage, puis a réparé le joint en 30 minutes. Facture très détaillée, tarif honnête. Je recommande vivement.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Mme Martin', text: "Ma chaudière Viessmann était en panne depuis 3 jours et il faisait 8°C dans l'appartement. Le technicien est arrivé avec les pièces nécessaires, a diagnostiqué un défaut d'allumage et l'a réparé en 1h. Il m'a aussi expliqué comment entretenir la chaudière moi-même pour éviter les pannes. Service impeccable.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Pierre L.', text: "Rénovation complète de ma salle de bain : plomberie, carrelage, douche à l'italienne. Le chantier a duré exactement le temps prévu, les artisans étaient ponctuels et soigneux. Le résultat est magnifique, les photos avant/après sont impressionnantes.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Sophie R.', text: "Détection de fuite invisible dans les murs grâce à la caméra thermique FLIR. Sans cette technologie, il aurait fallu casser tout le mur du salon. Localisation précise à 10cm, colmatage sans destruction. Un vrai soulagement, je n'avais même pas imaginé que c'était possible.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Jean-Claude B.', text: "Entretien annuel de ma chaudière Atlantic effectué à l'heure prévue. Le technicien a vérifié la combustion, détartré les radiateurs et m'a expliqué les réglages pour réduire ma facture de gaz de 15%. Document de conformité remis en fin d'intervention. Très satisfait.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Marie T.', text: "Canalisation bouchée avec remontée des eaux dans la cuisine un dimanche matin. J'ai appelé à 8h et le plombier était là à 9h15. Débouchage haute pression en 20 minutes, tout est remis en place. Le genre de problème qui vous met le coeur au creux de la main quand c'est résolu.", rating: 5, date: 'Il y a 2 mois' }
  ],
  electricien: [
    { author: 'Sylvie M.', text: "Mise aux normes complète de ma maison ancienne de 1960 : tableau Legrand Cellini neuf, câblage en gaine ICTA, passage en norme NF C 15-100. Le chantier a duré 2 jours, l'artisan était très soigneux et a tout nettoyé après lui. Le Consuel a validé du premier coup.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Marc D.', text: "Installation de ma borne de recharge Wallbox pour ma voiture électrique. Le technicien a vérifié la capacité de mon tableau, créé un circuit dédié, et la borne fonctionne parfaitement. Le chantier a duré 2h, tout était prévu et respecté. Je recommande.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Nathalie P.', text: "Maison connectée entièrement installée : volets Somfy, éclairage Philips Hue, thermostat Netatmo. Le professionnel a tout paramétré sur mon smartphone et m'a fait une démonstration complète de chaque fonction. C'est devenu un vrai confort au quotidien, je ne peux plus m'en passer.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Philippe R.', text: "Court-circuit dans le garage qui faisait sauter le disjoncteur. L'électricien est arrivé avec son multimètre Fluke, a localisé le problème en 15 minutes : un fil abîmé dans un plafond. Réparation propre et rapide avec remplacement du fil défectueux. Très professionnel.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Isabelle G.', text: "Remplacement complet de l'éclairage de mon commerce par des LED Philips. Réduction de facture visible dès le premier mois, l'éclairage est beaucoup plus agréable et uniforme. Le technicien a fait une étude luminothéchnique avant l'installation, c'est très sérieux.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'François L.', text: "Diagnostic complet avant achat immobilier : vérification de toute l'installation, photos du tableau, rapport écrit détaillé avec les non-conformités. Ça m'a permis de négocier le prix de vente car il y avait 4000€ de travaux à prévoir. Un investissement qui a largement valu le coup.", rating: 5, date: 'Il y a 2 mois' }
  ],
  coiffeur: [
    { author: 'Sophie L.', text: "Le coiffeur a pris le temps de faire un diagnostic capillaire avant ma coloration, m'a expliqué les différentes options selon ma texture. Le balayage est naturel, les mèches sont parfaitement fondues. Des compliments tous les jours depuis, mes amies veulent toutes connaître le salon.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Thomas H.', text: "Barbier au top, rasage au rasoir ouvert avec mousse Taylor of Old Bond Street. L'ambiance est relaxante, le fauteuil vintage est très confortable et le résultat est impeccable. La barbe est parfaitement délimitée, je repars comme neuf à chaque fois.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Camille D.', text: "Après 3 ans de colorations ratées ailleurs, j'ai enfin trouvé un salon qui utilise l'Olaplex pour protéger les cheveux. Le coiffeur a analysé la texture de mes cheveux et a trouvé la bonne nuance de châtain. Le résultat est magnifique, les cheveux sont brillants et souples.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Laura M.', text: "Soin kératine pour mes cheveux frisés et abîmés par les colorations précédentes. Le coiffeur a utilisé la gamme Cadiveu, un vrai soin sans formol. Résultat spectaculaire : mes cheveux sont lisses, brillants et faciles à coiffer au quotidien. Ça dure vraiment 3 mois.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Emma B.', text: "Chignon de mariage exceptionnel, le coiffeur a fait un essai gratuit la semaine précédente pour valider le style. Le chignon a tenu toute la journée et la nuit de bal, même sous la pluie. Toutes mes amies mariées ont pris note du salon.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Nicolas P.', text: "Extensions capillaires en cheveux indiens, pose à froid micro-link. Le résultat est tellement naturel que personne ne voit la différence. Le coiffeur m'a bien expliqué l'entretien à domicile et les rendez-vous de maintenance. Travail remarquable.", rating: 5, date: 'Il y a 2 mois' }
  ],
  restaurant: [
    { author: 'Julie M.', text: "Menu dégustation à 45€, une explosion de saveurs à chaque plat. Le chef a utilisé des produits du marché du jour : Saint-Jacques fraîches, légumes de la ferme. L'accord mets-vins avec le côtes du rhône du sommelier était parfait. Une adresse que nous garderons précieusement.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Antoine D.', text: "Service impeccable et cadre magnifique sur la terrasse avec vue sur les toits. Nous étions venus pour un anniversaire, le restaurant nous a offert un dessert avec bougies. Les produits sont vraiment frais, on sent la différence avec les chaînes. À refaire absolument.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Sarah K.', text: "Cuisine créative et produits locaux, une vraie découverte. Le chef cuisine avec des légumes du potager bio d'Orgon, la viande vient de la boucherie du quartier. La carte change selon les arrivages, ce qui rend chaque visite différente. Le poisson livré de la criée du port était exceptionnel.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'David L.', text: "Brunch de qualité le dimanche : oeufs brouillés truffés, saumon fumé maison, pastries fraîches du four. Les produits sont copieux et vraiment faits maison, on ne sent aucun produit industriel. Le service est attentionné sans être envahissant. On reviendra chaque semaine.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Claire P.', text: "Accueil chaleureux comme à la maison, le chef est venu nous parler de la carte et nous expliquer l'origine des produits. Les plats sont généreux et bien assaisonnés, les épices sont dosées à la perfection. L'addition est très raisonnable pour la qualité servie.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Romain G.', text: "Carte des vins excellente avec plus de 100 références de vignerons locaux. Le sommelier nous a proposé un accord parfait pour notre plateau de fromages. Les fromages viennent d'un affineur local, on sent le savoir-faire dans chaque bouchée. Soirée parfaite pour un anniversaire de mariage.", rating: 5, date: 'Il y a 2 mois' }
  ],
  garage: [
    { author: 'Stéphane B.', text: "Réparation moteur complexe sur ma BMW, le mécanicien a utilisé la valise Autel MaxiSys pour diagnostiquer le problème en 20 minutes. Pièces d'origine BMW commandées et posées en 2 jours. Le rapport photo m'a été envoyé pendant le chantier. Très sérieux et transparent.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Aurélie M.', text: "Changement de 4 pneus Michelin et géométrie 3D. Le garage avait le stock nécessaire, le montage a duré 45 minutes. Le mécanicien m'a expliqué l'usure de mes anciens pneus et m'a donné des conseils pour les faire durer. Prix très compétitif par rapport au concessionnaire.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Christophe L.', text: "Diagnostic électronique sur mon Renault qui affichait le voyant moteur. La valise Autel a identifié le défaut en 5 minutes : sonde lambda défaillante. Réparation rapide avec pièce d'origine. Enfin un garage honnête qui ne propose pas de travaux inutiles.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Marie-Jeanne T.', text: "Rayure profonde sur ma carrosserie, le carrossier a fait un débosselage sans peinture (PDR) en 2h. La rayure a complètement disparu, on ne voit plus rien. Le polissage 3M a rendu la peinture comme neuille. Très satisfaite du résultat et du tarif.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Pierre D.', text: "Révision complète de mon véhicule avec vidange huile Castrol, filtres Mann-Filter et contrôle des freins Brembo. Le mécanicien m'a montré les pièces usées et les nouvelles, tout était transparent. Carnet d'entretien mis à jour, pas de travaux inutiles proposés.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Sandrine H.', text: "Recharge climatisation R134a et remplacement du filtre habitacle antibactérien. Le technicien a fait un test de température avant/après, la clim souffle maintenant à 6°C. Le tarif était inférieur à celui du concessionnaire pour un travail identique.", rating: 5, date: 'Il y a 2 mois' }
  ],
  nettoyage: [
    { author: 'Mme Bernard', text: "Nettoyage complet après déménagement : gravats, poussière, taches sur les murs. L'équipe est arrivée avec du matériel Kärcher professionnel et des produits écolabels Ecolab. L'appartement est rendu impeccable, les propriétaires ont rendu la caution sans problème.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'M. Leroy', text: "Bureaux de notre entreprise nettoyés tous les soirs depuis 2 ans. L'équipe est ponctuelle, discrète et efficace. Le contrôle qualité photo envoyé après chaque passage nous rassure sur la propreté. Les produits Ecolabel n'ont aucune odeur chimique, c'est appréciable.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Famille Dubois', text: "Nettoyage après travaux de rénovation : poussière partout, débris de carrelage, taches de ciment. L'équipe a tout enlevé en une journée, y compris les gravats. Le sol en parquet a été lavé à la monobrosse et ciré. Résultat impeccable, on ne voit plus les traces de travaux.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Mme Petit', text: "Nettoyage à domicile de canapés et moquettes avec un aspirateur eau/poussière numatic. Les taches de café et de vin ont complètement disparu, les moquettes ont retrouvé leur couleur d'origine. Odeur fraîche sans produits agressifs. Très professionnel.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'M. Moreau', text: "Nettoyage de vitres en hauteur pour notre immeuble de 4 étages. L'équipe est intervenue avec un système WFP (Water Fed Pole) pour des vitres sans traces. Le travail a été fait en 3h sans perturber les locataires. Résultat parfait.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Mme Roux', text: "Désinfection complète de notre cabinet médical avec nébulisation de produit biocide homologué. Le traitement a couvert toutes les surfaces et l'air ambiant. Le rapport de désinfection nous a été remis en fin d'intervention. Rassurant et conforme aux normes.", rating: 5, date: 'Il y a 2 mois' }
  ],
  jardin: [
    { author: 'M. Fontaine', text: "Création complète de mon jardin : plan 3D avant chantier, plantation de haies de cupressus, massifs de lavande et gazon en rouleau. Le paysagiste a analysé mon sol argileux et a choisi des espèces parfaitement adaptées. Le jardin est devenu un vrai havre de paix.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Mme Chevalier', text: "Taille de haies de thuya sur 20 mètres de long, le jardinier est intervenu avec une nacelle et un cutter STIHL professionnel. La taille est précise et géométrique, les branches ont été broyées sur place pour le paillage. Rangement impeccable du terrain après le chantier.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'M. Lambert', text: "Rénovation complète de ma terrasse en bois ipé, les lames ont été remplacées et traitées avec une huile de protection. Le jardinier a vérifié l'état des lattages en dessous et a remplacé les pièces abîmées. Protégée pour au moins 10 ans, le résultat est magnifique.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Mme Simon', text: "Création d'un massif fleuri de A à Z : analyse du sol, choix des plantes selon l'exposition (plein soleil, mi-ombre), plantation et paillage. Le jardinier a utilisé des vivaces pour un entretien minimal. Le massif fleurit du printemps à l'automne, c'est exactement ce que je voulais.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'M. Roussel', text: "Installation d'un système d'arrosage automatique Hunter avec programmateur wifi. Le jardinier a enterré les tuyères et positionné les arroseurs pour couvrir toute la pelouse. Economie d'eau estimée à 60% par rapport à l'arrosage manuel. Zéro entretien, c'est le rêve.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Mme Garnier', text: "Élagage d'un grand chêne de 15m qui menaçait la maison. Le jardinier est intervenu avec une nacelle et un tronçonneur STIHL, en toute sécurité. Les branches ont été broyées sur place et le compost sera utilisé pour les massifs. Travail dangereux fait avec professionnalisme.", rating: 5, date: 'Il y a 2 mois' }
  ],
  fitness: [
    { author: 'Nicolas V.', text: "Programme de perte de poids sur mesure : -8kg en 3 mois avec un coach certifié BPJEPS. Les séances sont variées (musculation, cardio, HIIT), le coach ajuste la difficulté chaque semaine. L'analyse InBody montre une vraie progression. Je recommande à 100%.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Caroline M.', text: "Remise en forme post-grossesse avec un coach spécialisé. Les exercices étaient adaptés à ma condition (périnée, abdominaux), sans rush. Le coach a été patient et motivant. Après 3 mois, je me sens plus forte qu'avant la grossesse. Merci pour ce suivi personnalisé.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Alexandre K.', text: "Préparation marathon avec programme de coach personnel. Le coach a analyisé ma condition avec des tests de performance, a adapté les séances de footing et de renforcement. J'ai atteint mon temps visé (3h45) grâce au suivi hebdomadaire et aux conseils nutritionnels.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Émilie R.', text: "Cours collectifs dynamiques, maximum 15 personnes pour un vrai suivi. Les coachs connaissent notre nom et nos objectifs. L'espace bien-être (sauna, hammam) est inclus dans l'adhésion, idéal pour la récupération. Ambiance top et sans pression.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Julien B.', text: "Bilan nutritionnel avec analyse InBody + programme d'entraînement personnalisé. Le coach a identifié mes erreurs alimentaires et m'a donné des repas concrets à préparer. Résultat : -5kg de gras et +3kg de muscle en 4 mois. L'approche est sérieuse et scientifique.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Sophie G.', text: "Musculation sans blessure grâce aux conseils techniques du coach. J'étais débutante et j'avais peur de me faire mal. Le coach m'a appris les gestes sûrs, la respiration, la progressivité. Après 6 mois, je suis plus confiante et je progresse à chaque séance.", rating: 5, date: 'Il y a 2 mois' }
  ],
  medical: [
    { author: 'M. Durand', text: "Consultation à l'écoute avec le Dr Martin : bilan complet en 30 minutes, prise de tension, auscultation, bilan sanguin prescrit. Le médecin a pris le temps de m'expliquer les résultats et de me rassurer. Enfin un médecin disponible et vraiment attentif à ses patients.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Mme Lefebvre', text: "Kinésithérapie pour rééducation du genou après opération. Le kiné utilise une table hydraulique, des ultrasons et des exercices ciblés. Après 10 séances, j'ai retrouvé une mobilité complète. Le suivi était rigoureux avec des exercices à faire chez soi.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'M. Michel', text: "Soins chez le dentiste avec peur panique depuis l'enfance. Le praticien a été d'une douceur incroyable, il m'a expliqué chaque étape avant de commencer. Injections presque indolores, résultat esthétique parfait. Ma phobie a été vaincue grâce à cette équipe.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Mme Fournier', text: "Infirmière à domicile pour les pansements de mon père. Passage régulier 3 fois par semaine, toujours à l'heure, toujours souriante. Les pansements sont impeccables, la désinfection est rigoureuse. Mon père a retrouvé confiance grâce à ce suivi régulier.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'M. Girard', text: "Pédicure pour diabétique, le soin était extrêmement précautionneux. L'infirmière a vérifié la sensibilité de mes pieds, taillé les ongles avec précision et appliqué un soin hydratant spécifique. Régulièrement disponible et toujours ponctuelle.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Mme Bonnet', text: "Kinésithérapie pour des maux de dos chroniques depuis 10 ans. Le kiné a identifié un problème de posture avec un bilan postural complet. Après 15 séances de rééducation + exercices quotidiens, la douleur a diminué de 80%. Je dors enfin correctement.", rating: 5, date: 'Il y a 2 mois' }
  ],
  avocat: [
    { author: 'M. Lemaire', text: "Divorce compliqué avec deux enfants, l'avocat a négocié un accord à l'amiable qui protège mes droits de garde et mes intérêts financiers. L'échange a été constructif, sans agressivité. Le dossier a été traité en 3 mois au lieu de 18. Merci pour ce professionnalisme.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Mme Duval', text: "Licenciement abusif après 8 ans d'ancienneté, j'ai gagné aux prud'hommes. L'avocat a constitué un dossier solide avec les emails, les témoignages et les bulletins de salaire. Indemnités de 12 000€ obtenues. Défense exemplaire et suivi hebdomadaire.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'M. Bernard', text: "Rédaction de statuts pour ma nouvelle SAS. L'avocat a vérifié chaque clause, m'a conseillé sur le régime fiscal optimal et a rédigé un pacte d'associés clair. Tout était prêt pour le dépôt au greffe. Un vrai accompagnement de A à Z pour un entrepreneur.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Mme Morin', text: "Succession familiale compliquée après le décès de mon père, avec des biens immobiliers et des comptes à l'étranger. L'avocat a débloqué la situation en 6 mois, a négocié entre les héritiers et a optimisé la fiscalité. Les conflits familiaux ont été apaisés grâce à sa médiation.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'M. Petit', text: "Conseil fiscal pour la création de mon entreprise. L'avocat a analysé mon statut (micro-entreprise vs SAS), m'a expliqué les avantages de chaque option et m'a fait économiser 3 000€ de charges le premier an. Les honoraires étaient communiqués par écrit, sans surprise.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Mme Giraud', text: "Accusée à tort de harcèlement moral au travail, l'avocat a constitué ma défense avec les preuves de mon innocence. Acquittement obtenu au tribunal correctionnel. La confidentialité et le soutien psychologique tout au long de la procédure m'ont été précieux.", rating: 5, date: 'Il y a 2 mois' }
  ],
  default: [
    { author: 'Emma L.', text: "Intervention rapide et professionnelle, le technicien a diagnosé le problème en 15 minutes et l'a résolu proprement. Facture claire et tarif honnête. Je recommande vivement pour la qualité du service et la réactivité.", rating: 5, date: 'Il y a 1 semaine' },
    { author: 'Arthur D.', text: "Devis détaillé et transparent reçu le jour même, intervention planifiée dans la semaine. Le travail a été fait soigneusement, sans aucun dégât collatéral. L'équipe était ponctuelle et sympathique. Très satisfait du résultat.", rating: 5, date: 'Il y a 2 semaines' },
    { author: 'Sophie M.', text: "J'avais besoin d'un professionnel fiable pour un dossier urgent. L'équipe a répondu rapidement, a pris le temps d'analyser ma situation et m'a proposé une solution adaptée. Le suivi était régulier, je n'ai jamais eu à me poser de questions.", rating: 5, date: 'Il y a 3 semaines' },
    { author: 'Lucas P.', text: "Travail impeccable du début à la fin : analyse du besoin, proposition technique, exécution soignée et contrôle qualité en fin de chantier. Les photos avant/après m'ont été envoyées le soir même. Un vrai professionnalisme à chaque étape.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Marie B.', text: "Service client irréprochable, réactivité exceptionnelle pour une intervention en urgence. Le technicien est arrivé en 45 minutes, avait tout le matériel nécessaire et a résolu mon problème rapidement. Tarif très raisonnable pour la qualité rendue.", rating: 5, date: 'Il y a 1 mois' },
    { author: 'Thomas R.', text: "Excellence et qualité au rendez-vous, c'est rare de trouver un aussi bon rapport qualité-prix. L'équipe est compétente, les matériaux utilisés sont de marque reconnue et le résultat est durable. Je recommande sans hésitation.", rating: 5, date: 'Il y a 2 mois' }
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
      { name: 'Dépannage Urgence', description: "Fuite de canalisation, chaudière en panne, canalisation bouchée ? Nous intervenons sous 90 minutes avec une caméra investigatrice pour localiser le problème sans casser vos murs ni vos carrelages.", features: ['Caméra endoscopique', 'Détection sans casse', 'Arrivée sous 90min'] },
      { name: 'Installation Sanitaire', description: "Pose complète de salle de bain avec Robinetterie Grohe/Hansgrohe, WC suspendus Geberit, meubles Vasco. Nous travaillons avec les fournisseurs du commerce de détail pour vous garantir les meilleurs prix.", features: ['Robinetterie Grohe', 'WC Geberit', 'Meubles Vasco'] },
      { name: 'Chauffage & Chaudière', description: "Installation et entretien de chaudières gaz Viessmann, Vaillant et Atlantic. Nous sommes certifiés RGE pour les pompes à chaleur air/eau et air/air. Vérification annuelle obligatoire pour votre sécurité.", features: ['Viessmann/Vaillant', 'Certifié RGE', 'PAC air/eau'] },
      { name: 'Détection de Fuites', description: "Fuite invisible ? Notre gaz traceur et caméra thermique FLIR localisent la fuite à 10cm près. Colmatage sans destruction, facture claire avant toute intervention.", features: ['Caméra FLIR', 'Gaz traceur', 'Localisation ±10cm'] },
      { name: 'Rénovation Salle de Bain', description: "Rénovation complète clé en main : carrelage, plomberie, chauffage au sol, douche à l'italienne. Devis détaillé avec plans 3D, délai garanti, sans mauvaise surprise.", features: ['Plans 3D', 'Douce à l\'italienne', 'Clé en main'] },
      { name: 'Entretien Chaudière', description: "Contrôle annuel obligatoire pour votre garantie constructeur. Détartrage complet, vérification des joints, test de combustion. Nous fournissons le certificat de conformité.", features: ['Certificat fourni', 'Détartrage inclus', 'Norme NF'] }
    ],
    guarantees: [
      { title: 'Garantie Décennale', icon: 'shield-check' },
      { title: 'Arrivée sous 90min', icon: 'clock' },
      { title: 'Devis Gratuit', icon: 'file-text' },
      { title: 'Artisan RGE', icon: 'badge-check' }
    ],
    heroTitle: 'Plombier Chauffagiste Certifié', heroTitleEn: 'Certified Heating & Plumbing Expert',
    heroSubtitle: "Fuite urgente, panne de chaudière ou rénovation de salle de bain — nous intervenons 7j/7 avec caméra investigatrice et devis gratuit avant toute intervention.", heroSubtitleEn: 'Emergency leaks, boiler breakdowns or bathroom renovation — we respond 7 days a week with inspection camera and free quote before any work.',
    aboutText: "Artisan plombier chauffagiste certifié RGE depuis 15 ans, nous maîtrisons l'installation sanitaire, le dépannage d'urgence et la rénovation complète. Nos véhicules sont équipés de caméras investigatrices FLIR, de outils de soudure pour tuyauterie cuivre et PER, et de tout le matériel nécessaire pour une intervention rapide et propre. Chaque chantier est suivi avec un rapport photo que nous vous transmettons en fin de journée.", aboutTextEn: 'Certified RGE plumber and heating engineer for 15 years, we master sanitary installation, emergency repair and complete renovation. Our vehicles are equipped with FLIR inspection cameras, soldering tools for copper and PER piping, and all the equipment needed for a fast, clean intervention. Every job is tracked with a photo report sent to you at end of day.',
    ctaText: 'Demander un devis gratuit', ctaTextEn: 'Get a Free Quote'
  },
  electricien: {
    primary: '#1e40af', secondary: '#1e3a8a', accent: '#2563eb', background: '#f8fafc',
    services: [
      { name: 'Mise aux Normes', description: "Votre installation a plus de 15 ans ? La norme NFC 15-100 impose une mise à conformité. Nous remplaçons votre tableau ancien par un tableau Legrand Cellini, câblage en fil rigide rouge/bleu/noir conforme, et passage en TT ou TNS selon votre réseau.", features: ['Tableau Legrand', 'Norme NFC 15-100', 'Certificat Consuel'] },
      { name: 'Dépannage Électrique', description: "Disjoncteur qui saute, court-circuit, prise qui chauffe ? Notre multimètre Fluke localize la panne en quelques minutes. Nous remplaçons les composants défectueux par du matériel Legrand ou Schneider, avec facture détaillée.", features: ['Multimètre Fluke', 'Diagnostic 15min', 'Pièces Legrand'] },
      { name: 'Installation Complète', description: "Construction neuve ou rénovationtotale : plan électrique validé par le Consuel, câblage complet en gaine ICTA, pose de points lumineux, prises RJ45 et interrupteurs connectés si souhaité.", features: ['Plan Consuel', 'Gaine ICTA', 'Points lumineux'] },
      { name: 'Domotique', description: "Maison connectée avec volets roulants Somfy, éclairage piloté par KNX ou Tuya, thermostat Netatmo. Programmation complète depuis votre smartphone, avec démonstration sur site.", features: ['Somfy/KNX', 'Pilotage smartphone', 'Démo incluse'] },
      { name: 'Éclairage LED', description: "Réduction de 80% sur votre facture. Spots LED encastrés Philips, bandes lumineuses pour kitchen LED, éclairage extérieur solaire Ip65. Étude luminothéchnique incluse pour un résultat optimal.", features: ['Philips/Schneider', 'Étude lumino', '-80% facture'] },
      { name: 'Borne de Recharge', description: "Installation de bornes Wallbox ou NauticUp pour véhicule électrique. Certification IRVE obligatoire, raccordement au tableau existant ou création d'un dédié. TVA réduite à 10% pour les particuliers.", features: ['Wallbox/NauticUp', 'Certif. IRVE', 'TVA 10%'] }
    ],
    guarantees: [
      { title: 'Consuel Certifié', icon: 'shield-check' },
      { title: 'Garantie 10 ans', icon: 'badge-check' },
      { title: 'Diagnostic 15min', icon: 'clock' },
      { title: 'Devis Gratuit', icon: 'file-text' }
    ],
    heroTitle: 'Électricien Certifié Consuel', heroTitleEn: 'Consuel-Certified Electrician',
    heroSubtitle: "Installation, dépannage et mise aux normes NFC 15-100 — nous sécurisons votre habitat avec du matériel Legrand/Schneider et un diagnostic rapide au multimètre Fluke.", heroSubtitleEn: 'Installation, repair and NFC 15-100 compliance — we secure your home with Legrand/Schneider equipment and fast Fluke multimeter diagnostics.',
    aboutText: "Électricien certifié Consuel depuis 15 ans, nous sécurisons les habitations et commerces avec du matériel professionnel Legrand, Schneider et Hager. Nos véhicules de service sont équipés de multimètres Fluke, de caméras thermiques et de tout le nécessaire pour un diagnostic en 15 minutes. Chaque intervention fait l'objet d'un rapport de conformité que nous remettons en fin de chantier.", aboutTextEn: 'Consuel-certified electrician for 15 years, we secure homes and businesses with professional Legrand, Schneider and Hager equipment. Our service vehicles are equipped with Fluke multimeters, thermal cameras and everything needed for a 15-minute diagnosis. Every intervention comes with a compliance report delivered at end of job.',
    ctaText: 'Demander un devis', ctaTextEn: 'Request a Quote'
  },
  coiffeur: {
    primary: '#6b21a8', secondary: '#581c87', accent: '#7c3aed', background: '#faf5ff',
    services: [
      { name: 'Coupe & Conseil', description: "Avant toute coupe, diagnostic capillaire avec analyse de la texture (épaisse, fine, crépue, lisse) et du visage. Coupe femme ou homme avec les techniques les plus récentes : dégradé effilé, coupe au carré asymétrique, undercut moderne. Conseils personnalisés pour l'entretien à domicile.", features: ['Diagnostic capillaire', 'Techniques 2024', 'Conseil à domicile'] },
      { name: 'Barbier Traditionnel', description: "Rasage au rasoir ouverte avec mousse savonnette Taylor of Old Bond Street, après-rasage balm Proraso. Taille de barbe au fer à chauffer, délimitation au fil. Soins de la barbe avec huile argan et baume à la cire d'abeille.", features: ['Rasoir ouvert', 'Savon Taylor', 'Huile argan'] },
      { name: 'Coloration & Balayage', description: "Coloration L'Oréal Professionnel Majirel, balayage手工 (fait main) pour un rendu naturel, mèches sur mesure avec papillons. Nous utilisons la gamme Olaplex pour protéger la fibre capillaire pendant la coloration.", features: ['L\'Oréal Majirel', 'Olaplex protection', 'Balayage main'] },
      { name: 'Soin Kératine', description: "Traitement profond à la kératine brésilienne pour cheveux frisés ou abîmés. Redoux semi-permanent jusqu'à 3 mois, lissage sans formol avec la gamme Cadiveu. Application de masque réparateur à l'huile de coco avant le soin.", features: ['Kératine Cadiveu', 'Sans formol', 'Résultat 3 mois'] },
      { name: 'Extensions', description: "Extensions capillaires 100% cheveux indiens : pose à froid micro-link, tissage africain, ou keratin bond. Large choix de longueurs (30 à 80cm) et de couleurs. Entretien toutes les 3 semaines inclus la première pose.", features: ['Cheveux indiens', 'Pose à froid', 'Entretien inclus'] },
      { name: 'Coiffure Événement', description: "Mariage, baptême, soirée de gala : coiffure sur mesure avec essai gratuit la semaine précédente. Chignon élégant, tresse bohème, ou lâché bouclé. Maquillage léger inclus si souhaité.", features: ['Essai gratuit', 'Maquillage inclus', 'Sur mesure'] }
    ],
    guarantees: [
      { title: 'Produits Bio', icon: 'leaf' },
      { title: 'Stérilisation Auto', icon: 'sparkles' },
      { title: 'Formation Continue', icon: 'scissors' },
      { title: 'Satisfait ou Refait', icon: 'heart' }
    ],
    heroTitle: 'Salon de Coiffure & Barbier', heroTitleEn: 'Hair Salon & Barber',
    heroSubtitle: "Coupe, coloration, soins et barbier traditionnel — notre équipe de 3 coiffeurs certifiés vous accueille du mardi au samedi avec rendez-vous en ligne.", heroSubtitleEn: 'Cut, coloring, treatments and traditional barber — our team of 3 certified stylists welcomes you Tuesday to Saturday with online booking.',
    aboutText: "Salon de coiffure et barbier depuis 15 ans, notre équipe de 3 coiffeurs certifiés travaille avec les gammes L'Oréal Professionnel, Kérastase et Olaplex. Nous avons investi dans des stations de lavage ergonomiques, des fauteuils hydrauliques Takara Belmont et un espace barbier séparé avec fauteuil vintage. Chaque client bénéficie d'un diagnostic capillaire personnalisé avant toute prestation.", aboutTextEn: 'Hair salon and barber for 15 years, our team of 3 certified stylists works with L\'Oréal Professionnel, Kérastase and Olaplex ranges. We have invested in ergonomic washing stations, Takara Belmont hydraulic chairs and a separate barber space with vintage chair. Every client receives a personalized hair diagnosis before any service.',
    ctaText: 'Prendre rendez-vous', ctaTextEn: 'Book Appointment'
  },
  restaurant: {
    primary: '#c2410c', secondary: '#9a3412', accent: '#ea580c', background: '#fff7ed',
    services: [
      { name: 'Cuisine de Marché', description: "Notre carte évolue chaque semaine selon les arrivages du marché de la Halle. Légumes de saison du marché d'Orgon, viande de la boucherie Traiteur Saint-Martin, poissons livrés chaque matin par la criée de la Pointe. Tout est cuisiné sur place, aucune pièce industrielle.", features: ['Marché d\'Orgon', 'Criée du jour', 'Cuisson sur place'] },
      { name: 'Menu Dégustation', description: "5 temps de cuisine à 45€ : amuse-bouche, entrée, poisson, viande, fromage affineur puis dessert du glacier artisanal. Accord mets et vins par notre sommelier avec des cuvées de la région (Côtes du Rhône, Bandol, Cassis).", features: ['5 temps à 45€', 'Accord vin', 'Fromage affineur'] },
      { name: 'Terrasse & Jardin', description: "120 places sur notre terrasse ombragée avec vue sur les toits de la ville. Espace enfants sécurisé, brumisateur pour les forte chaleur, chauffage d'ambiance en hiver. Réservation en ligne pour la terrasse.", features: ['120 places', 'Vue panoramique', 'Espace enfants'] },
      { name: 'Événements Privés', description: "Salle privative de 40 personnes pour mariages, anniversaires et séminaires. Menu sur mesure, buffet cocktail, traiteur dépanneuse. Nous avons accueilli plus de 200 événements en 10 ans.", features: ['40 personnes', 'Menu sur mesure', '200+ événements'] },
      { name: 'Service Traiteur', description: "Plateaux repas professionnels pour vos séminaires (à partir de 18€/personne). Buffets de fête, livraison en van isotherme. Capacité jusqu'à 150 couverts.", features: ['Dès 18€/pers', 'Van isotherme', '150 couverts'] },
      { name: 'Carte des Vins', description: "Notre cave reference plus de 120 références de vignerons locaux et de grandes domaines. Dégustation le vendredi soir avec l'accord du chef. Vente à la bouteille et en libre-service.", features: ['120 références', 'Vignerons locaux', 'Dégustation vendredi'] }
    ],
    guarantees: [
      { title: 'Produits du Marché', icon: 'leaf' },
      { title: 'Ouvert 7j/7', icon: 'clock' },
      { title: 'Note 4.8/5 Google', icon: 'star' },
      { title: 'Terrasse Ombragée', icon: 'car' }
    ],
    heroTitle: 'Restaurant de Marché', heroTitleEn: 'Farm-to-Table Restaurant',
    heroSubtitle: "Cuisine de marché avec des produits fraîchement livrés chaque matin — notre carte change selon les arrivages, nos vins viennent des domaines voisins.", heroSubtitleEn: 'Farm-to-table dining with fresh daily deliveries — our menu changes with the season, our wines come from neighboring estates.',
    aboutText: "Restaurant familial depuis 2009, notre chef cuisine avec des produits du marché livrés chaque matin : légumes du potager bio d'Orgon, viande de la boucherie traiteur Saint-Martin, poissons de la criée du port. Notre cave reference plus de 120 vignerons de la région. Nous avons reçu le prix de la meilleure table de la ville en 2023 et 2024. Ouvert du mardi au dimanche, terrasse de 120 places avec vue panoramique.", aboutTextEn: 'Family restaurant since 2009, our chef cooks with daily market produce: vegetables from the Orgon organic farm, meat from Saint-Martin butcher, fish from the port auction. Our cellar references over 120 regional winemakers. We won best restaurant in 2023 and 2024. Open Tuesday to Sunday, 120-seat terrace with panoramic views.',
    ctaText: 'Réserver une table', ctaTextEn: 'Reserve a Table'
  },
  garage: {
    primary: '#166534', secondary: '#14532d', accent: '#059669', background: '#f0fdf4',
    services: [
      { name: 'Diagnostic Électronique', description: "Valise multimarque Autel MaxiSys pour lecture des codes défauts sur toutes les marques (BMW, Mercedes, Peugeot, Renault, Toyota...). Rapport PDF détaillé envoyé par email avec les pièces à changer et les coûts estimés.", features: ['Autel MaxiSys', 'Rapport PDF', 'Toutes marques'] },
      { name: 'Révision Complète', description: "Révision constructeur avec vidange huile Castrol/Mobil, remplacement filtres Mann-Filter, contrôle freins Brembo, test batterie. Carnet d'entretien mis à jour pour préserver la valeur de revente.", features: ['Huile Castrol', 'Filtres Mann', 'Carnet à jour'] },
      { name: 'Pneumatiques', description: "Montage, équilibrage et géométrie 3D sur pneus Michelin, Continental, Goodyear et Bridgestone. Stock de 400 pneus sur place, montage en 45 minutes. Vérification pression et usure des 4 roues.", features: ['Michelin/Bosch', 'Géométrie 3D', 'Stock 400 pneus'] },
      { name: 'Freins & Disques', description: "Remplacement plaquettes Brembo, disques perforés, étriers neufs. Test d'usure gratuit à chaque passage. Nous utilisons uniquement des pièces certifiées ECE R90 pour votre sécurité.", features: ['Brembo/EBC', 'Test gratuit', 'Certif. ECE R90'] },
      { name: 'Climatisation Auto', description: "Recharge gaz R134a ou R1234yf selon votre véhicule, détection fuite UV, remplacement filtre habitacle antibactérien. Test de température avant/après avec thermomètre digital.", features: ['R134a/R1234yf', 'Test UV', 'Filtre anti-bact'] },
      { name: 'Carrosserie & Peinture', description: "Débosselage sans peinture (PDR), retouche à la pince à douille, polissage optique 3M. Pour les dommages plus importants, remise en peinture à la nuance constructeur avec séchoir infrarouge.", features: ['PDR sans peinture', '3M polissage', 'Nuance exacte'] }
    ],
    guarantees: [
      { title: 'Devis Avant Travaux', icon: 'file-text' },
      { title: 'Pièces Certifiées', icon: 'shield-check' },
      { title: 'Diagnostic Gratuit', icon: 'clock' },
      { title: 'Véhicule de Prêt', icon: 'car' }
    ],
    heroTitle: 'Garage Mécanicien Expert', heroTitleEn: 'Expert Auto Mechanic',
    heroSubtitle: "Diagnostic électronique Autel, pièces Brembo/Michelin, révision constructeur — votre véhicule entre de bonnes mains avec un devis gratuit avant toute intervention.", heroSubtitleEn: 'Autel electronic diagnostics, Brembo/Michelin parts, manufacturer service — your vehicle is in good hands with a free quote before any work.',
    aboutText: "Garage mécanique indépendant depuis 15 ans, nous entretenons et réparons toutes les marques avec des équipements professionnels : valise Autel MaxiSys, pont élévateur Norauto, outils de géométrie 3D. Nos pièces de rechange proviennent de distributeurs agréés (Pixparts, Oscaro) pour un rapport qualité-prix optimal. Nous avons accueilli plus de 3000 véhicules l'an dernier et garantissons chaque réparation 12 mois.", aboutTextEn: 'Independent auto repair shop for 15 years, we service and repair all brands with professional equipment: Autel MaxiSys scanner, Norauto lift, 3D geometry tools. Our parts come from authorized distributors (Pixparts, Oscaro) for optimal value. We serviced over 3,000 vehicles last year and guarantee every repair for 12 months.',
    ctaText: 'Demander un devis gratuit', ctaTextEn: 'Get a Free Quote'
  },
  nettoyage: {
    primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#f0fdf4',
    services: [
      { name: 'Nettoyage Bureaux', description: "Entretien quotidien ou hebdomadaire de vos locaux : aspirateur Kärcher professionnel, serpillière humide microfibre, produits écolabels Ecolab. Chaque passage fait l'objet d'un contrôle qualité avec photo envoyée par WhatsApp.", features: ['Kärcher pro', 'Écolabel Ecolab', 'Photo contrôle'] },
      { name: 'Vitres & Façades', description: "Nettoyage de vitres en hauteur jusqu'au 10ème étage avec nacelle ou échafaudage. Systeme WFP (Water Fed Pole) pour des vitres sans traces. Traitement anti-pluie pour une protection longue durée.", features: ['WFP système', 'Anti-pluie', 'Jusqu\'au R+10'] },
      { name: 'Nettoyage Industriel', description: "Entrepôts, ateliers et usines : monobrosse industrielle Taski, aspirateur eau/poussérie numatic, nettoyage haute pression Kärcher HD. Intervention de nuit pour ne pas perturber votre activité.", features: ['Taski/Numatic', 'HP Kärcher', 'Nuit possible'] },
      { name: 'Grand Nettoyage', description: "Nettoyage en profondeur après travaux ou déménagement. Dégraissage cuisine professionnelle au détergent industriel, désinfection salle de bain à l'eau de javel stabilisée, lavage sols à la monobrosse.", features: ['Dégraissage pro', 'Désinfection', 'Monobrosse'] },
      { name: 'Désinfection', description: "Traitement virucide et bactéricide certifié COVID-19. Nébulisation de produit biocide homologué par le Ministère de la Santé. Idéal pour cabinets médicaux, écoles et ERP.", features: ['Certifié COVID', 'Nébulisation', 'Ministère validé'] },
      { name: 'Remise en État', description: "Nettoyage fin de finition après travaux : enlèvement de gravats, lavage des murs au chiffon humide, dépoussiérage plafonds et luminaires, lavage de sols. Livraison clé en main avec inventaire.", features: ['Clé en main', 'Inventaire', 'Gravats inclus'] }
    ],
    guarantees: [
      { title: 'Produits Écolabels', icon: 'leaf' },
      { title: 'Personnel Certifié', icon: 'users' },
      { title: 'Contrôle Qualité', icon: 'clock' },
      { title: 'Assurance RC Pro', icon: 'shield-check' }
    ],
    heroTitle: 'Enterprise de Nettoyage Pro', heroTitleEn: 'Professional Cleaning Company',
    heroSubtitle: "Bureaux, commerces et industriels — nos équipes certifiées interviennent avec du matériel Kärcher/Taski et des produits écolabels Ecolab.", heroSubtitleEn: 'Offices, retail and industrial — our certified teams use Kärcher/Taski equipment and Ecolab eco-certified products.',
    aboutText: "Entreprise de nettoyage certifiée ISO 9001 depuis 15 ans, nous intervenons sur les bureaux, commerces, industries et ERP avec du matériel professionnel Kärcher, Taski et Numatic. Nos produits sont tous écolabels Ecolab et sans danger pour les occupants. Nous avons développé un système de contrôle qualité photo envoyé après chaque intervention, et un planning flexible incluant les nuits et week-ends.", aboutTextEn: 'ISO 9001 certified cleaning company for 15 years, we service offices, retail, industrial buildings and public facilities with professional Kärcher, Taski and Numatic equipment. All our products are Ecolab eco-certified and safe for occupants. We developed a photo quality control system sent after every intervention, and a flexible schedule including nights and weekends.',
    ctaText: 'Demander un devis', ctaTextEn: 'Request a Quote'
  },
  jardin: {
    primary: '#14532d', secondary: '#166534', accent: '#15803d', background: '#f0fdf4',
    services: [
      { name: 'Création de Jardin', description: "Conception et réalisation de jardins paysagers avec plans 3D avant chantier. Plantation d'arbres fruitiers, haies persistantes, massifs fleuris et gazon en rouleau. Conseil sur les espèces adaptées à votre sol argileux ou sableux.", features: ['Plans 3D', 'Sol analysé', 'Espèces locales'] },
      { name: 'Tonte & Entretien', description: "Tonte régulière avec tondeuse professionnelle Honda, taille de haies au cutter STIHL, désherbage manuel sans produit chimique. Nous utilisons de l'engrais organique生物 pour préserver la vie du sol.", features: ['Honda/STIHL', 'Sans chimique', 'Engrais organique'] },
      { name: 'Élagage Professionnel', description: "Élagage d'arbres jusqu'à 15m avec nacelle, coupe au tronçonneur STIHL et broyage des branches sur place. Nous fournissons le certificat d'élagage conforme à la réglementation environnementale.", features: ['Nacelle 15m', 'STIHL pro', 'Certificat fourni'] },
      { name: 'Arrosage Auto', description: "Système d'irrigation goutte-à-goutte Hunter avec programmateur connecté. Réduction de 60% de la consommation d'eau par rapport au arrosage manuel. Installation enterrée invisible.", features: ['Hunter/Rain Bird', '-60% eau', 'Programmateur wifi'] },
      { name: 'Terrasse & Clôtures', description: "Construction de terrasse en bois ipé ou pin traité, clôtures occultation bois composite, pergolas bioclimatiques. Devis détaillé avec plan de chantier et délais garantis.", features: ['Ipé/composite', 'Pergola bioclim', 'Plan garanti'] },
      { name: 'Potager & Verger', description: "Création de potager surélevé en bois, taille fruitiers (pommiers, cerisiers, vignes), semis de saison. Nous installons un paillage BRF pour limiter l'arrosage et enrichir le sol.", features: ['Bacs surélevés', 'Taille fruitiers', 'Paillage BRF'] }
    ],
    guarantees: [
      { title: 'Plantes Garanties 1an', icon: 'sprout' },
      { title: 'Matériel STIHL', icon: 'sparkles' },
      { title: 'Conseils Saisonniers', icon: 'sun' },
      { title: 'Paysagiste DPLG', icon: 'tree-deciduous' }
    ],
    heroTitle: 'Jardinier Paysagiste DPLG', heroTitleEn: 'DPLG Landscape Gardener',
    heroSubtitle: "Création, entretien et rénovation de jardins avec du matériel STIHL/Honda — analyse de sol incluse pour des plantations adaptées à votre terrain.", heroSubtitleEn: 'Garden creation, maintenance and renovation with STIHL/Honda equipment — soil analysis included for plantings adapted to your land.',
    aboutText: "Jardinier paysagiste DPLG depuis 15 ans, nous concevons et entretenons des espaces verts avec du matériel professionnel STIHL, Honda et Hunter. Notre véhicule emporte une tondeuse autoportée Kubota, un broyeur, un tronçonneur et tout le nécessaire pour une intervention sans retard. Nous analysons votre sol avant chaque plantation pour garantir l'adhésion des espèces.", aboutTextEn: 'DPLG landscape gardener for 15 years, we design and maintain green spaces with professional STIHL, Honda and Hunter equipment. Our vehicle carries a Kubota ride-on mower, a shredder, a chainsaw and everything needed for prompt intervention. We analyze your soil before every planting to ensure species thrive.',
    ctaText: 'Demander un devis gratuit', ctaTextEn: 'Get a Free Quote'
  },
  fitness: {
    primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', background: '#fef2f2',
    services: [
      { name: 'Coach Personnel', description: "Programme d'entraînement sur mesure basé sur un bilan morphologique complet : mesure IMC, test cardio, analyse de la posture. Séances 1 à 1 avec coach certifié BPJEPS, suivi hebdomadaire et ajustement du programme.", features: ['Bilan complet', 'Certifié BPJEPS', 'Suivi hebdo'] },
      { name: 'Musculation Libre', description: "Espace de 200m² avec matériel Eleiko (barres olympiques), dumbbells jusqu'à 50kg, cages à squat, leg press Cybex. Ouvert de 6h à 23h, accès par code personnel.", features: ['Eleiko/Cybex', '200m²', '6h-23h'] },
      { name: 'Cours Collectifs', description: "HIIT (30min intense), Yoga Vinyasa, Zumba, Body Pump avec barres à 1,2kg. Maximum 15 personnes par cours pour un suivi personnalisé. Programmes rotatifs chaque semaine.", features: ['Max 15 pers', '6 cours/semaine', 'Personnalisé'] },
      { name: 'Cardio Training', description: "Tapis connectés Technogym Skillmill (sans moteur), vélos Wattbike pour mesure de puissance, rameurs Concept2. Suivi fréquence cardiaque en temps réel avec écrans individuels.", features: ['Technogym', 'Wattbike', 'Écrans live'] },
      { name: 'Espace Bien-Être', description: "Sauna finlandais à 80°C, hammam, douche à jets et casiers sécurisés à code. Accès inclus dans toute adhésion. Idéal pour la récupération post-effort.", features: ['Sauna/Hammam', 'Gratuit', 'Récupération'] },
      { name: 'Nutrition & Suivi', description: "Bilan nutritionnel avec InBody (analyse de la composition corporelle), plan alimentaire personnalisé, ajustement mensuel. Partenariat avec un diététicien du quartier pour les cas spécifiques.", features: ['InBody 570', 'Plan sur mesure', 'Diététicien'] }
    ],
    guarantees: [
      { title: 'Coachs BPJEPS', icon: 'award' },
      { title: 'Matériel Eleiko', icon: 'dumbbell' },
      { title: 'Sans Engagement', icon: 'badge-check' },
      { title: '6h-23h 7j/7', icon: 'clock' }
    ],
    heroTitle: 'Salle de Sport & Coach', heroTitleEn: 'Gym & Personal Training',
    heroSubtitle: "Coach certifié BPJEPS, matériel Eleiko et Technogym, analyses InBody — votre programme sur mesure commence ici avec un essai gratuit.", heroSubtitleEn: 'BPJEPS certified coach, Eleiko and Technogym equipment, InBody analysis — your custom program starts here with a free trial.',
    aboutText: "Salle de sport indépendante depuis 15 ans, nous avons investi dans du matériel haut de gamme : Eleiko pour la musculation, Technogym pour le cardio, InBody pour l'analyse corporelle. Nos 5 coachs sont tous certifiés BPJEPS avec spécialités (préparation physique, remise en forme post-grossesse, nutrition sportive). Pas d'engagement, résiliation en 30 jours. Essai gratuit sans engagement.", aboutTextEn: 'Independent gym for 15 years, we invested in premium equipment: Eleiko for weight training, Technogym for cardio, InBody for body composition. Our 5 coaches are all BPJEPS certified with specializations (athletic conditioning, post-pregnancy fitness, sports nutrition). No commitment, 30-day cancellation. Free trial with no obligation.',
    ctaText: 'Essai gratuit', ctaTextEn: 'Free Trial'
  },
  medical: {
    primary: '#1e40af', secondary: '#1e3a8a', accent: '#2563eb', background: '#eff6ff',
    services: [
      { name: 'Consultation Générale', description: "Bilan de santé complet avec auscultation, prise de tension, vérification du poids et des constantes. Dossier médical informatisé avec historique complet. Ordonnances électroniques directement transmises à votre pharmacie.", features: ['Dossier électronique', 'Ordonnance e-处方', 'Prise de tension'] },
      { name: 'Kinésithérapie', description: "Rééducation articulaire et musculaire avec équipements de dernière génération : table de kinésithérapie auto-lock, electrothérapie TENS, ultrasons. Spécialités : kinésithérapie du sport, périnéale, respiratoire.", features: ['Table auto-lock', 'TENS/Ultrasons', 'Spécialités'] },
      { name: 'Analyses Biologiques', description: "Prise de sang sur place avec résultats en 24h pour les analyses courantes (NFS, glycémie, cholestérol, bilan hépatique). Partenariat avec le laboratoire Biogroup pour les analyses spécialisées.", features: ['Résultats 24h', 'Biogroup', 'Prise sur place'] },
      { name: 'Vaccination', description: "Vaccination grippe saisonnière, COVID-19, HPV, typhoïde et voyages. Chambre froide +2°/+8° conforme aux normes HAS. Certificats de vaccination délivrés sur place.", features: ['Chambre froide HAS', 'Vaccins voyage', 'Certificat'] },
      { name: 'Télémédecine', description: "Consultation vidéo par Doctolib ou en plateforme propriétaire. Ordonnance électronique envoyée directement. Disponible le soir et le week-end pour les urgences non vitales.", features: ['Doctolib', 'Ordonnance e', 'Soir/WE'] },
      { name: 'Suivi Médical', description: "Suivi des patients chroniques (diabète, hypertension, asthme) avec rendez-vous programmés. Carnet de santé numérique partagé avec votre médecin traitant et votre pharmacie.", features: ['Patients chroniques', 'Rendez-vous programmés', 'Carnet numérique'] }
    ],
    guarantees: [
      { title: 'Conventionné Secteur 1', icon: 'stethoscope' },
      { title: 'Tiers Payant', icon: 'credit-card' },
      { title: 'RDV sous 48h', icon: 'calendar' },
      { title: 'Équipe Pluridisciplinaire', icon: 'users' }
    ],
    heroTitle: 'Cabinet Médical Polyvalent', heroTitleEn: 'General Medical Practice',
    heroSubtitle: "Médecin généraliste, kinésithérapeute et analyses biologiques sous le même toit — prise de RDV en ligne et tiers payant accepté.", heroSubtitleEn: 'General practitioner, physiotherapist and biological analyses under one roof — online booking and direct billing accepted.',
    aboutText: "Cabinet médical pluridisciplinaire depuis 15 ans, nous accueillons médecins généralistes, kinésithérapeutes et infirmiers à domicile. Le cabinet est équipé d'un electrocardiographe Schiller, d'un spiromètre et d'une chambre froide pour les vaccins conformes aux normes HAS. Le dossier patient est entièrement dématérialisé avec transmission électronique des ordonnances à votre pharmacie.", aboutTextEn: 'Multidisciplinary medical practice for 15 years, we welcome general practitioners, physiotherapists and home nurses. The practice is equipped with a Schiller electrocardiograph, spirometer and compliant vaccine cold room. Patient records are fully digitized with electronic prescription transmission to your pharmacy.',
    ctaText: 'Prendre rendez-vous', ctaTextEn: 'Book Appointment'
  },
  avocat: {
    primary: '#1e3a8a', secondary: '#172554', accent: '#2563eb', background: '#f8fafc',
    services: [
      { name: 'Droit de la Famille', description: "Divorce amiable ou contentieux, garde d'enfants, pension alimentaire, prestation compensatoire. Nous négocions en priorité une solution amiable pour préserver l'intérêt supérieur de l'enfant.", features: ['Divorce amiable', 'Garde enfant', 'Négociation'] },
      { name: 'Droit du Travail', description: "Licenciement abusif, harcèlement moral ou sexuel, rupture conventionnelle, prud'hommes. Nous calculons vos indemnités avec le logiciel специализированный et constituons votre dossier avec les preuves solides.", features: ['Prud\'hommes', 'Indemnités', 'Preuves solides'] },
      { name: 'Droit Pénal', description: "Défense pénale à toutes les étapes : garde à vue, comparution immédiate, tribunal correctionnel. Nous assurons votre défense avec rigueur et confidentialité absolue.", features: ['Garde à vue', 'Comparution immédiate', 'Confidentialité'] },
      { name: 'Droit des Affaires', description: "Création de société (SARL, SAS, SARL unipersonnelle), rédaction de statuts, pacte d'associés, fusion-acquisition. Accompagnement juridique complet pour les entrepreneurs.", features: ['Statuts SAS/SARL', 'Pacte associés', 'Fusion-acquisition'] },
      { name: 'Droit Immobilier', description: "Vente, achat, copropriété, bail commercial, litiges constructeurs. Nous vérifions les diagnostics immobiliers et négocions les clauses du compromis de vente.", features: ['Compromis', 'Copropriété', 'Diagnostic juridique'] },
      { name: 'Médiation', description: "Médiation familiale ou civile pour résoudre les conflits sans passer par le tribunal. Nous facilitions le dialogue entre les parties pour trouver un accord durable et équilibré.", features: ['Médiation familiale', 'Accord durable', 'Hors tribunal'] }
    ],
    guarantees: [
      { title: 'Inscrit au Barreau', icon: 'scale' },
      { title: 'Consultation Privée', icon: 'shield' },
      { title: 'Défense Déterminée', icon: 'sword' },
      { title: 'Honoraires Clairs', icon: 'file-text' }
    ],
    heroTitle: 'Cabinet d\'Avocats', heroTitleEn: 'Law Office',
    heroSubtitle: "Droit de la famille, du travail, pénal et des affaires — consultation privée avec devis d'honoraires transparent avant toute procédure.", heroSubtitleEn: 'Family, employment, criminal and business law — private consultation with transparent fee estimate before any proceedings.',
    aboutText: "Cabinet d'avocats inscrit au Barreau depuis 15 ans, nous défendons les particuliers et les entreprises dans les domaines du droit de la famille, du travail, pénal et des affaires. Nous avons obtenu plus de 85% de succès aux prud'hommes l'année dernière. Chaque dossier est suivi par un avocat dédié avec mise à jour hebdomadaire. Les honoraires sont communiqués par écrit avant chaque étape.", aboutTextEn: 'Law office registered at the Bar for 15 years, we represent individuals and businesses in family, employment, criminal and business law. We achieved over 85% success rate at employment tribunals last year. Each case is managed by a dedicated attorney with weekly updates. Fees are communicated in writing before each step.',
    ctaText: 'Demander une consultation', ctaTextEn: 'Request a Consultation'
  },
  default: {
    primary: '#1e293b', secondary: '#334155', accent: '#475569', background: '#f8fafc',
    services: [
      { name: 'Service Principal', description: "Notre expertise au service de vos projets. Nous analysons votre besoin, proposons une solution adaptée et exécutons les travaux avec un suivi qualité rigoureux.", features: ['Analyse besoin', 'Solution adaptée', 'Suivi qualité'] },
      { name: 'Conseil & Devis', description: "Étude personnalisée de votre demande avec visite sur site si nécessaire. Devis détaillé et transparent, sans frais cachés, valable 30 jours.", features: ['Visite sur site', 'Devis détaillé', 'Valable 30 jours'] },
      { name: 'Intervention Rapide', description: "Équipe dédiée pour les urgences. Nous garantissons un retour sous 24h et une intervention dans les meilleurs délais.", features: ['Retour 24h', 'Équipe dédiée', 'Délai garanti'] },
      { name: 'Suivi & Maintenance', description: "Contrôle qualité systématique après chaque intervention. Contrat de maintenance possible pour un entretien régulier.", features: ['Contrôle qualité', 'Maintenance', 'Régulier'] },
      { name: 'Matériel Professionnel', description: "Nous utilisons du matériel de marque reconnu pour garantir la durabilité de nos interventions. Formation continue de nos équipes.", features: ['Marques reconnues', 'Formation continue', 'Durabilité'] },
      { name: 'Garantie Satisfaction', description: "Chaque prestation est garantie. Si le résultat ne vous satisfait pas, nous intervenons gratuitement jusqu'à votre entière satisfaction.", features: ['Garantie travaux', 'Intervention gratuite', 'Satisfaction'] }
    ],
    guarantees: [
      { title: 'Équipe Certifiée', icon: 'badge-check' },
      { title: 'Devis Transparent', icon: 'file-text' },
      { title: 'Intervention Rapide', icon: 'clock' },
      { title: 'Satisfaction Garantie', icon: 'heart' }
    ],
    heroTitle: 'Votre Partenaire de Confiance', heroTitleEn: 'Your Trusted Partner',
    heroSubtitle: "Un service professionnel, fiable et de qualité — nous répondons à vos besoins avec expertise et transparence.", heroSubtitleEn: 'Professional, reliable and quality service — we meet your needs with expertise and transparency.',
    aboutText: "Professionnel certifié depuis 15 ans, nous mettons notre expertise au service de vos projets avec du matériel professionnel et une équipe formée. Chaque intervention suit un protocole qualité documenté.", aboutTextEn: 'Certified professional for 15 years, we bring our expertise to your projects with professional equipment and a trained team. Every intervention follows a documented quality protocol.',
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
  const description = generateAboutText(aiContent?.aboutText || lead.description || (lang === 'en' ? template.aboutTextEn : template.aboutText), lead);
  const heroTitle = aiContent?.heroTitle || (lang === 'en' ? template.heroTitleEn : template.heroTitle);
  const heroSubtitle = aiContent?.heroSubtitle || `${lang === 'en' ? template.heroSubtitleEn : template.heroSubtitle}${city ? (lang === 'en' ? ' in ' : ' à ') + city : ''}`;
  let ctaText = aiContent?.cta || (lang === 'en' ? template.ctaTextEn : template.ctaText) || (lang === 'en' ? 'Contact Us' : 'Contactez-nous');
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
    socialLinks, accentOnDark, hours: lead.hours || lead.serperHours || '', establishedYear: lead.establishedYear
  };

  return buildUltimateHTML(content, template, allImages, combinedHash % 4);
}

function buildUltimateHTML(content: UltimateContent, template: any, combinedImages: string[] = [], layoutVariant: number = 0): string {
  const { companyName, heroTitle, heroSubtitle, aboutText, services, serviceImages, galleryImages, realPhotos, testimonials, phone, email, address, website, city, ctaText, rating, reviews, slogan, heroImage, allImages, galleryTitle, aboutTitle, servicesTitle, accentOnDark, hours: leadHours, establishedYear } = content;
  const lang = content.lang || 'fr';
  const ui = UI[lang];
  const sector = content.sector || '';
  const sectorCfg = getSectorConfig(sector);
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
            <div class="info-bar-item"><i data-lucide="clock" width="14"></i> ${lang === 'en' ? 'Mon-Fri 8am-6pm · Sat 9am-2pm' : 'Lun-Ven 08h-18h · Sam 09h-14h'}</div>
            ${rating ? `<div class="info-bar-item"><i data-lucide="star" width="14" fill="currentColor"></i> ${rating}/5 ${ui.testGoogle} (${reviews} ${ui.testAvis})</div>` : ''}
            ${phone ? `<div class="info-bar-item"><i data-lucide="phone" width="14"></i> <a href="tel:${cleanPhoneLink}">${phone}</a></div>` : ''}
            ${email ? `<div class="info-bar-item"><i data-lucide="mail" width="14"></i> <a href="mailto:${email}">${email}</a></div>` : ''}
            ${address ? `<div class="info-bar-item"><i data-lucide="map-pin" width="14"></i> ${address}${city ? ', ' + city : ''}</div>` : ''}
            <div class="info-bar-item"><i data-lucide="clock" width="14"></i> ${lang === 'en' ? 'Mon-Fri 8am-6pm · Sat 9am-2pm' : 'Lun-Ven 08h-18h · Sam 09h-14h'}</div>
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
            ${getGuarantees(content.sector, lang).map((g: { title: string; icon: string }, i: number) => `
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
                <span class="section-label">${servicesTitle || sectorCfg.ui.svcTitle[lang]}</span>
                <h2>${sectorCfg.ui.svcTitle[lang]}</h2>
                <p>${sectorCfg.ui.svcDesc[lang]}</p>
            </div>
            <div class="svc-grid">
                ${services.map((s, i) => {
                  const iconName = sectorCfg.serviceIcons[i % sectorCfg.serviceIcons.length] || 'check-circle';
                return `
                <div class="svc-card reveal reveal-d${(i % 3) + 1}">
                    <img src="${proxiedImg(serviceImages[i] || heroImage)}" class="svc-card-img" alt="${s.name}" loading="lazy">
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
                    <img src="${proxiedImg(getImg(1))}" ${imgErr(1)} alt="${companyName} — ${content.sector}" loading="lazy">
                    <div class="about-badge"><div class="about-badge-num">${establishedYear ? (new Date().getFullYear() - establishedYear) + '+' : sectorCfg.aboutBadge.value}</div><div class="about-badge-text">${establishedYear ? (lang === 'en' ? 'Years Experience' : 'Ans d\'expérience') : sectorCfg.aboutBadge.label[lang]}</div></div>
                </div>
                <div class="about-text reveal">
                    <span class="section-label">${aboutTitle || ui.aboutLabel}</span>
                    <h2>${content.aboutTitle || ui.aboutTitle || template.heroTitle} — ${city || companyName}</h2>
                    <p>${aboutText}</p>
                    <ul class="about-checks">
                        ${sectorCfg.stats.slice(0, 3).map((st: { value: string; label: { fr: string; en: string } }) => `
                        <li><i data-lucide="check-circle-2" width="18"></i> <strong>${st.value}</strong> — ${st.label[lang]}</li>
                        `).join('')}
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
                    <h2>${content.aboutTitle || (lang === 'en' ? 'Our Approach' : 'Notre Approche')}</h2>
                    <p>${(() => {
                        const s = (content.sector || '').toLowerCase();
                        const cityStr = city ? (lang === 'en' ? ` in ${city}` : ` à ${city}`) : '';
                        if (lang === 'en') {
                            if (s.includes('plomb')) return `Every intervention begins with a thorough diagnosis using thermal imaging cameras and leak detectors. We use copper and PEX piping systems, certified Valiant/Buderus boilers, and apply NF C 15-100 standards. Emergency response within 90 minutes, 7 days a week.`;
                            if (s.includes('électri') || s.includes('electric')) return `We use professional Fluke/Schneider multimeters, Legrand wiring systems, and strictly follow NFC 15-100 standards. Every installation includes Consuel certification, with thermal imaging diagnostics and complete traceability of your electrical panel.`;
                            if (s.includes('coiff')) return `We work with L'Oréal Professionnel, Kérastase, and Olaplex ranges. Every cut is preceded by a face-shape diagnosis and hair texture analysis. Colorings are mixed on-site for a custom result, with regular training on the latest trends.`;
                            if (s.includes('restaurant')) return `Our menu changes with the seasons, sourced from local producers within 50km. We work with daily-delivered market vegetables, artisanal meats, and fish from the morning catch. Every dish is prepared on-site, without frozen products.`;
                            if (s.includes('garage') || s.includes('mécan')) return `We use Launch and Autel multi-brand diagnostic scanners, Michelin/Continental tires, and genuine OEM parts. Every vehicle receives a 50-point checklist before delivery, with photo report of completed work.`;
                            if (s.includes('médec') || s.includes('dent')) return `Our equipment meets the latest hospital standards: digital X-rays, autoclave Class B sterilization, and paperless patient records. Consultations run on time, with real-time appointment booking online.`;
                            if (s.includes('avocat')) return `We handle each case with a dedicated strategy file, secure digital document management, and transparent billing. Every client gets a single point of contact, with weekly case updates and clear, jargon-free explanations.`;
                            if (s.includes('nettoy')) return `We use Kärcher professional machines, eco-certified Ecolab products, and microfiber systems that reduce chemical use by 80%. Every intervention includes a photo quality report, with flexible scheduling including nights and weekends.`;
                            if (s.includes('jardin')) return `We use Husqvarna/STIHL professional tools, adapted plant selections for your climate zone, and drip irrigation systems. Every garden gets a seasonal maintenance plan, with before/after photo follow-up.`;
                            if (s.includes('fitness')) return `We use Eleiko competition-grade equipment, Polar heart rate monitoring, and InBody composition analysis. Every member gets a personalized program with weekly progress tracking and nutrition guidance.`;
                            return `We combine professional-grade equipment, certified techniques, and ongoing team training to deliver consistent, measurable results. Every project follows a documented process with clear milestones and transparent communication.`;
                        }
                        if (s.includes('plomb')) return `Chaque intervention commence par un diagnostic approfici avec caméra thermique et détecteur de fuites. Nous utilisons des systèmes de tuyauterie cuivre et PEX, des chaudières Valiant/Buderus certifiées, et appliquons les normes NF C 15-100. Déplacement d'urgence sous 90 minutes, 7j/7.`;
                        if (s.includes('électri') || s.includes('electric')) return `Nous travaillons avec des multimètres Fluke/Schneider, du câblage Legrand, en suivant strictement les normes NFC 15-100. Chaque installation comprend une certification Consuel, un diagnostic thermographique et une traçabilité complète de votre tableau électrique.`;
                        if (s.includes('coiff')) return `Nous travaillons avec les gammes L'Oréal Professionnel, Kérastase et Olaplex. Chaque coupe est précédée d'un diagnostic visage et analyse de la texture capillaire. Les colorations sont mélangées sur place pour un résultat personnalisé, avec formation continue sur les dernières tendances.`;
                        if (s.includes('restaurant')) return `Notre carte évolue au rythme des saisons, approvisionnée par des producteurs locaux dans un rayon de 50km. Nous travaillons avec des légumes du marché livrés quotidiennement, des viandes artisanales et du poisson de la pêche du matin. Chaque plat est préparé sur place, sans produits surgelés.`;
                        if (s.includes('garage') || s.includes('mécan')) return `Nous utilisons des valises diagnostiques Launch et Autel multimarques, des pneus Michelin/Continental et des pièces d'origine constructeur. Chaque véhicule reçoit un contrôle de 50 points avant restitution, avec rapport photo des travaux effectués.`;
                        if (s.includes('médec') || s.includes('dent')) return `Nos équipements répondent aux normes hospitalières les plus récentes : radios numériques, autoclave de stérilisation classe B et dossier patient dématérialisé. Les consultations sont ponctuelles, avec prise de RDV en ligne en temps réel.`;
                        if (s.includes('avocat')) return `Nous traitons chaque dossier avec une stratégie dédiée, une gestion numérique sécurisée des documents et une facturation transparente. Chaque client bénéficie d'un interlocuteur unique, avec des mises à jour hebdomadaires et des explications claires sans jargon juridique.`;
                        if (s.includes('nettoy')) return `Nous travaillons avec des machines professionnelles Kärcher, des produits écolabels Ecolab et des systèmes en microfibre réduisant de 80% l'usage de produits chimiques. Chaque intervention comprend un rapport qualité photo, avec planning flexible incluant nuits et week-ends.`;
                        if (s.includes('jardin')) return `Nous utilisons du matériel professionnel Husqvarna/STIHL, des végétaux adaptés à votre zone climatique et des systèmes d'irrigation goutte-à-goutte. Chaque jardin bénéficie d'un plan d'entretien saisonnier, avec suivi photo avant/après.`;
                        if (s.includes('fitness')) return `Nous disposons de matériel Eleiko de compétition, de suivi cardiaque Polar et d'analyses de composition corporelle InBody. Chaque membre bénéficie d'un programme personnalisé avec suivi hebdomadaire et conseils nutritionnels.`;
                        return `Nous combinons du matériel professionnel, des techniques certifiées et une formation continue de nos équipes pour des résultats constants et mesurables. Chaque projet suit un processus documenté avec des jalons clairs et une communication transparente.`;
                    })()}</p>
                    <div class="why-stats">
                        ${sectorCfg.stats.slice(0, 4).map(s => `<div class="why-stat"><div class="why-stat-num">${s.value}</div><div class="why-stat-label">${s.label[lang]}</div></div>`).join('')}
                    </div>
                </div>
                <div class="why-img reveal">
                    <img src="${proxiedImg(getImg(2))}" ${imgErr(2)} alt="${companyName} — ${lang === 'en' ? 'our approach' : 'notre approche'}" loading="lazy">
                    <div class="why-img-badge"><div class="why-img-badge-num">98%</div><div class="why-img-badge-text">${ui.whySatisfaction}</div></div>
                </div>
            </div>
        </div>
    </section>

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
        </div>
    </section>

    ${(realPhotos && realPhotos.length > 0) ? `
    <section class="section" id="gallery">
        <div class="container" style="position:relative">
            <div class="section-hdr reveal">
                <span class="section-label">${lang === 'en' ? 'Gallery' : 'Galerie'}</span>
                <h2>${lang === 'en' ? 'Our Work in Pictures' : 'Nos Réalisations en Images'}</h2>
                <p>${getGalleryDesc(content.sector, lang)}</p>
            </div>
            <div class="gal-grid reveal">
                <div class="gal-item gal-main"><img src="${proxiedImg(realPhotos[0])}" ${imgErr(1)} alt="${companyName} — ${lang === 'en' ? 'realization' : 'réalisation'} 1" loading="lazy"></div>
                <div class="gal-item"><img src="${proxiedImg(realPhotos[1] || realPhotos[0])}" ${imgErr(2)} alt="${companyName} — ${lang === 'en' ? 'realization' : 'réalisation'} 2" loading="lazy"></div>
                <div class="gal-item"><img src="${proxiedImg(realPhotos[2] || realPhotos[0])}" ${imgErr(3)} alt="${companyName} — ${lang === 'en' ? 'realization' : 'réalisation'} 3" loading="lazy"></div>
                <div class="gal-item"><img src="${proxiedImg(realPhotos[3] || realPhotos[0])}" ${imgErr(4)} alt="${companyName} — ${lang === 'en' ? 'realization' : 'réalisation'} 4" loading="lazy"></div>
                <div class="gal-item"><img src="${proxiedImg(realPhotos[4] || realPhotos[0])}" ${imgErr(5)} alt="${companyName} — ${lang === 'en' ? 'realization' : 'réalisation'} 5" loading="lazy"></div>
            </div>
        </div>
    </section>` : ''}

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
                ${(() => {
                  const s = (content.sector || '').toLowerCase();
                  const cityMention = city ? (lang === 'en' ? ` in ${city}` : ` à ${city}`) : '';
                  const faqs: Array<{ q: string; a: string }> = [];
                  if (lang === 'en') {
                    faqs.push({ q: `Do you serve ${city || 'my area'}?`, a: `Yes, ${companyName} serves ${city ? `${city} and surrounding areas` : 'your area'}. Contact us to confirm availability for your location.` });
                    if (s.includes('plomb') || s.includes('électri') || s.includes('electric') || s.includes('garage') || s.includes('mécan')) {
                      faqs.push({ q: 'Do you handle emergencies?', a: `Yes. For ${s.includes('plomb') ? 'leaks, bursts, and heating failures' : s.includes('garage') ? 'breakdowns and flat tires' : 'electrical faults and outages'}, we offer rapid intervention with arrival under 90 minutes. Call us directly for immediate assistance.` });
                      faqs.push({ q: 'What brands/equipment do you work with?', a: s.includes('plomb') ? 'We use Valiant, Buderus, and Atlantic boilers, copper and PEX piping systems, and Fluke diagnostic tools. All materials meet current French standards.' : s.includes('garage') ? 'We work with Michelin, Continental, and Bosch parts, using Launch and Autel multi-brand diagnostic scanners for accurate troubleshooting.' : 'We use Legrand, Schneider Electric, and Hager systems. Every installation follows NFC 15-100 standards with Consuel certification.' });
                    } else if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) {
                      faqs.push({ q: 'How do I book an appointment?', a: `You can book online through our contact form or call us directly at ${phone || 'our number'}. Walk-ins are welcome subject to availability.` });
                      faqs.push({ q: 'What products do you use?', a: 'We exclusively use L\'Oréal Professionnel, Kérastase, and Olaplex ranges — professional-grade products that protect and enhance your hair.' });
                    } else if (s.includes('restaurant') || s.includes('cuisin')) {
                      faqs.push({ q: 'Do you take reservations?', a: `Yes, you can reserve by phone or through our contact form. For groups of 8+, we recommend booking at least 48 hours in advance.` });
                      faqs.push({ q: 'Do you accommodate dietary restrictions?', a: 'Absolutely. We offer gluten-free, vegetarian, and vegan options. Inform us of any allergies when booking and we\'ll adapt our menu.' });
                    } else if (s.includes('médec') || s.includes('dent') || s.includes('sant')) {
                      faqs.push({ q: 'How quickly can I get an appointment?', a: 'We typically offer appointments within 48 hours. For urgent matters, contact us directly and we\'ll do our best to accommodate you.' });
                      faqs.push({ q: 'Do you accept health insurance?', a: 'Yes, we work with all major French health insurance providers. Third-party payment is available for covered services.' });
                    } else if (s.includes('avocat') || s.includes('juridi')) {
                      faqs.push({ q: 'How does the initial consultation work?', a: 'The first consultation allows us to understand your situation, review relevant documents, and outline your legal options. Billed at a fixed rate with no surprises.' });
                      faqs.push({ q: 'Do you handle cases across France?', a: 'Yes, we represent clients throughout France, with hearings in local courts as needed. Remote consultations available via video conference.' });
                    } else if (s.includes('nettoy')) {
                      faqs.push({ q: 'What areas do you cover?', a: `We serve ${city ? `${city} and a 30km radius` : 'the greater metropolitan area'}. Industrial and commercial clients can arrange recurring contracts.` });
                      faqs.push({ q: 'Are your products eco-friendly?', a: 'Yes, we exclusively use Ecolab eco-certified products and microfiber systems that reduce chemical usage by 80%. Safe for children and pets.' });
                    } else if (s.includes('jardin') || s.includes('paysag')) {
                      faqs.push({ q: 'When is the best season to start?', a: 'Spring and autumn are ideal for major projects. Maintenance can begin year-round. Contact us for a free on-site assessment.' });
                      faqs.push({ q: 'Do you provide maintenance contracts?', a: 'Yes, we offer seasonal maintenance plans including mowing, pruning, fertilization, and irrigation system checks.' });
                    } else if (s.includes('fitness') || s.includes('sport')) {
                      faqs.push({ q: 'Can I try before committing?', a: 'Yes, we offer a free trial session so you can experience our equipment, meet our coaches, and find the right program for your goals.' });
                      faqs.push({ q: 'Do I need experience?', a: 'Not at all. Our coaches adapt programs to every level, from complete beginners to advanced athletes. Your starting point is our baseline.' });
                    } else {
                      faqs.push({ q: 'Do you provide free quotes?', a: 'Yes, we always provide detailed, transparent quotes with no obligation. Contact us with your project details and we\'ll respond within 24 hours.' });
                      faqs.push({ q: 'Are you insured and certified?', a: 'Absolutely. We carry full professional liability insurance and all work is guaranteed. Certifications available on request.' });
                    }
                    faqs.push({ q: 'What are your working hours?', a: leadHours ? `Our hours: ${leadHours}. Emergency services available outside regular hours for urgent situations.` : 'We respond quickly to all inquiries, including evenings and weekends for urgent situations.' });
                  } else {
                    faqs.push({ q: `Intervenez-vous${cityMention} ?`, a: `Oui, ${companyName} intervient${city ? ` à ${city} et ses alentours` : ' dans votre zone'}. Contactez-nous pour confirmer la disponibilité dans votre secteur.` });
                    if (s.includes('plomb') || s.includes('électri') || s.includes('electric') || s.includes('garage') || s.includes('mécan')) {
                      faqs.push({ q: 'Prenez-vous les urgences ?', a: `Oui. Pour ${s.includes('plomb') ? 'les fuites, les canalisations gelées et les pannes de chauffage' : s.includes('garage') ? 'les pannes, les crevaisons et les problèmes moteur' : 'les pannes électriques et les court-circuits'}, nous proposons une intervention rapide avec arrivée sous 90 minutes. Appelez-nous directement.` });
                      faqs.push({ q: 'Quelles marques/utilisez-vous ?', a: s.includes('plomb') ? 'Nous travaillons avec les chaudières Valiant, Buderus et Atlantic, des tuyauteries cuivre et PEX, et des outils de diagnostic Fluke. Tous les matériaux sont conformes aux normes françaises.' : s.includes('garage') ? 'Nous utilisons des pièces Michelin, Continental et Bosch, avec des valises diagnostiques Launch et Autel multimarques pour un diagnostic précis.' : 'Nous travaillons avec les systèmes Legrand, Schneider Electric et Hager. Chaque installation suit les normes NFC 15-100 avec certification Consuel.' });
                    } else if (s.includes('coiff') || s.includes('barb') || s.includes('salon')) {
                      faqs.push({ q: 'Comment prendre rendez-vous ?', a: `Vous pouvez réserver en ligne via notre formulaire ou nous appeler au ${phone || 'notre numéro'}. Les passages sans RDV sont possibles sous réserve de disponibilité.` });
                      faqs.push({ q: 'Quelles marques utilisez-vous ?', a: 'Nous travaillons exclusivement avec les gammes L\'Oréal Professionnel, Kérastase et Olaplex — des produits professionnels qui protègent et subliment vos cheveux.' });
                    } else if (s.includes('restaurant') || s.includes('cuisin')) {
                      faqs.push({ q: 'Acceptez-vous les réservations ?', a: 'Oui, vous pouvez réserver par téléphone ou via notre formulaire. Pour les groupes de 8+, nous recommandons de réserver au moins 48h à l\'avance.' });
                      faqs.push({ q: 'Adapté-vous aux régimes alimentaires ?', a: 'Absolument. Nous proposons des options sans gluten, végétariennes et véganes. Informez-nous de vos allergies lors de la réservation.' });
                    } else if (s.includes('médec') || s.includes('dent') || s.includes('sant')) {
                      faqs.push({ q: 'Quel est le délai pour un rendez-vous ?', a: 'Nous proposons généralement des rendez-vous sous 48h. Pour les situations urgentes, contactez-nous et nous ferons notre possible pour vous accueillir.' });
                      faqs.push({ q: 'Travaillez-vous avec la Sécurité sociale ?', a: 'Oui, nous travaillons avec toutes les mutuelles et assurances santé. Le tiers payant est disponible pour les prestations couvertes.' });
                    } else if (s.includes('avocat') || s.includes('juridi')) {
                      faqs.push({ q: 'Comment se déroule la première consultation ?', a: 'La première consultation permet d\'analyser votre situation, examiner les documents et définir vos options juridiques. Forfaitaire, sans surprise.' });
                      faqs.push({ q: 'Intervenez-vous sur toute la France ?', a: 'Oui, nous défendons nos clients sur tout le territoire, avec des audiences dans les tribunaux locaux. Consultations à distance par visioconférence.' });
                    } else if (s.includes('nettoy')) {
                      faqs.push({ q: 'Quelles zones couvrez-vous ?', a: `Nous intervenons${city ? ` à ${city} et dans un rayon de 30km` : ' dans toute la métropole'}. Contrats récurrents disponibles pour les clients professionnels et industriels.` });
                      faqs.push({ q: 'Vos produits sont-ils écologiques ?', a: 'Oui, nous utilisons exclusivement des produits écolabels Ecolab et des systèmes en microfibre réduisant de 80% l\'usage de produits chimiques. Sans danger pour enfants et animaux.' });
                    } else if (s.includes('jardin') || s.includes('paysag')) {
                      faqs.push({ q: 'Quelle est la meilleure saison pour démarrer ?', a: 'Le printemps et l\'automne sont idéaux pour les projets importants. L\'entretien peut commencer toute l\'année. Contactez-nous pour une visite gratuite.' });
                      faqs.push({ q: 'Proposez-vous des contrats d\'entretien ?', a: 'Oui, nous proposons des formules saisonnières comprenant tonte, taille, fertilisation et vérification du système d\'irrigation.' });
                    } else if (s.includes('fitness') || s.includes('sport')) {
                      faqs.push({ q: 'Puis-je essayer avant de m\'engager ?', a: 'Oui, nous proposons une séance d\'essai gratuite pour découvrir notre matériel, rencontrer nos coaches et trouver le programme adapté à vos objectifs.' });
                      faqs.push({ q: 'Faut-il déjà avoir de l\'expérience ?', a: 'Pas du tout. Nos coaches adaptent les programmes à tous les niveaux, du débutant complet à l\'athlète confirmé. Votre point de départ est notre base.' });
                    } else {
                      faqs.push({ q: 'Proposez-vous des devis gratuits ?', a: 'Oui, nous établissons systématiquement un devis détaillé et transparent, sans engagement. Contactez-nous avec les détails de votre projet et nous répondons sous 24h.' });
                      faqs.push({ q: 'Êtes-vous assurés et certifiés ?', a: 'Absolument. Nous disposons d\'une assurance responsabilité civile professionnelle complète et tous nos travaux sont garantis. Certificats disponibles sur demande.' });
                    }
                    faqs.push({ q: 'Quels sont vos horaires ?', a: leadHours ? `Nos horaires : ${leadHours}. Services d\'urgence disponibles en dehors des heures d\'ouverture.` : 'Nous répondons rapidement à toutes les demandes, y compris le soir et le week-end pour les urgences.' });
                  }
                  return faqs.map(f => `
                <details class="faq-item">
                    <summary class="faq-q">${f.q} <i data-lucide="chevron-down" width="18"></i></summary>
                    <div class="faq-a">${f.a}</div>
                </details>`).join('');
                })()}
            </div>
        </div>
    </section>

    <section class="cta-banner">
        <div class="container reveal">
            <h2>${(() => {
              const s = (content.sector || '').toLowerCase();
              if (lang === 'en') {
                if (s.includes('plomb')) return `${companyName} — Your Emergency Plumbing Partner`;
                if (s.includes('coiff')) return `${companyName} — Book Your Transformation`;
                if (s.includes('restaurant')) return `${companyName} — Reserve Your Table Tonight`;
                if (s.includes('garage') || s.includes('mécan')) return `${companyName} — Your Vehicle Deserves the Best`;
                if (s.includes('médec') || s.includes('dent')) return `${companyName} — Your Health, Our Priority`;
                if (s.includes('avocat')) return `${companyName} — Protect Your Rights`;
                if (s.includes('nettoy')) return `${companyName} — Spotless Spaces, Guaranteed`;
                if (s.includes('jardin')) return `${companyName} — Your Dream Garden Starts Here`;
                if (s.includes('fitness')) return `${companyName} — Start Your Transformation Today`;
                return ui.ctaTitle;
              }
              if (s.includes('plomb')) return `${companyName} — Votre Plombier de Confiance`;
              if (s.includes('coiff')) return `${companyName} — Réservez Votre Transformation`;
              if (s.includes('restaurant')) return `${companyName} — Réservez Votre Table ce Soir`;
              if (s.includes('garage') || s.includes('mécan')) return `${companyName} — Votre Véhicule Mérite le Mejor`;
              if (s.includes('médec') || s.includes('dent')) return `${companyName} — Votre Santé, Notre Priorité`;
              if (s.includes('avocat')) return `${companyName} — Défendez Vos Droits`;
              if (s.includes('nettoy')) return `${companyName} — Des Espaces Impeccables, Garantis`;
              if (s.includes('jardin')) return `${companyName} — Votre Jardin Rêve Commence Ici`;
              if (s.includes('fitness')) return `${companyName} — Lancez Votre Transformation`;
              return ui.ctaTitle;
            })()}</h2>
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
    </section>
    </main>

    <footer>
        <div class="container">
            <div class="footer-grid">
                <div>
                    <div class="footer-brand"><div class="footer-brand-logo"><i data-lucide="${heroBadge.icon}" width="18" height="18"></i></div><span class="footer-brand-text">${logoInfo.text}</span></div>
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
