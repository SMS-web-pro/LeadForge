# TODO - Métamorphoser le design (premium CRO)

- [ ] 1) Mettre à jour CSS dans `src/lib/ultimateTemplate.ts` (neutres premiums + ombres multicouches + styles cards)
- [x] 2) Supprimer la redondance : enlever le bloc `Garanties & Assurances` et ne conserver que `Nos garanties` (template.guarantees)

- [x] 3) Corriger la typo : `plombber` -> `plomber` dans `getHeroBadge`
- [x] 4) Sécuriser la Hero image en async : ajouter `isGoodHeroImage(url)` et filtrer avant de sélectionner `heroImage`


- [x] 5) Rendre la grille Services asymétrique (service phare span 2)

- [x] 6) Mettre à jour/adapter le CSS minimal nécessaire (`services-container` / styles associés)


- [ ] 7) Vérifier rapidement via génération/test (ouvrir un site HTML généré ou lancer tests)


