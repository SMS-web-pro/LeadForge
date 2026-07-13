# Task 3 — Site Quality Elevation: Sector Copy Packs + Resolver

**Status:** DONE
**Branch:** feature/site-quality-elevation
**Commit:** 9fb17674708fafabc5de090c0a008e75b05994ff
**Tests:** `template-design.test.ts` 8/8 passing; `npx tsc --noEmit` clean.

## What was built

### New module — `src/lib/template/sectorContent.ts`
- `SectorCopy` interface (`whyUs`, `services`, `faq`, `bespoke`, `trustBadges`).
- `SECTOR_CONTENT_PACKS`: data keyed by sector, each with `{ fr, en }` copies.
- Authored packs for: `electricien`, `plombier`, `coiffeur`, `restaurant`, `dentiste`,
  `avocat`, `nettoyage`, `jardin`, `coach`, `garage`, `medical`, `default` — **plus** an
  `artisan` pack (needed by the resolver fallback for `peintre/rénov/chauffag/clim` etc.,
  which has no dedicated pack in the spec list).
- `resolveSectorContent(sector, lang)`: exact key match → keyword fallback → `default`.

### Service name fidelity
Every `services[].name` matches the canonical `services[].name` from
`SECTOR_ULTIMATE_TEMPLATES` in `ultimateTemplate.ts`:
- `coach` uses the **fitness** template names (Coaching Personnel, Cours Collectifs, …) so
  later wiring resolves 1:1 when a "coach"/"fitness" business resolves to the fitness template.
- `dentiste` is a **dedicated dental pack** (Soins dentaires, Blanchiment, Orthodontie,
  Urgence dentaire, Implantologie, Esthétique du sourire) — NOT the generic medical services.
  `resolveSectorContent('dentiste', …)` returns dental copy; `bespoke: 'medical'`.

### Keyword resolver rules (step 4)
Implemented exactly as specified, first-match-wins:
`dentiste|orthodont|blanch`→dentiste, `avocat|jurid|notaire|huissier`→avocat,
`coach|sport|fitness|muscul|yoga`→coach, `restaurant|cuisin|traiteur|pizz|brasser`→restaurant,
`nettoy|ménage|menage|propret|hygiene`→nettoyage, `jardin|paysag|arbor|espac|vert`→jardin,
`garage|mécan|auto|carross|véhicul`→garage, `électric|plomb|renov|rénov|peintr|chauffag|clim`→artisan,
`médic|medic|clinique|kiné|kine|pharmac|optic|infirm|ostéo|sage`→medical, else `default`.

### Helpers — `src/lib/template/helpers.ts`
- Added `import { SectorCopy } from './sectorContent'`.
- Added `getServiceDescriptions(pack, services, lang)` — maps template service names to pack
  descriptions, with a safe generic fallback.
- Added `getTrustBadges(lang)` — returns the language-specific trust labels.

## Quality / constraints honored
- **No two sectors share an identical `whyUs` list** — each is sector-specific and concrete.
- **No generic filler** default ("Équipe Qualifiée / Devis Clair / Réactivité / Satisfaction
  Client") — avoided; the `default` pack uses distinct, honest copy.
- **Rapport honesty** — copy is generic service marketing, no invented prices/numbers/reviews.
- Single-string-literal model preserved; external API unchanged; no new dependencies; builder
  HTML output **not** modified.

## Concerns
- **`artisan` pack added beyond the 12 listed sectors.** Required because the resolver's keyword
  fallback maps `peintre/rénov/chauffag/clim` → `'artisan'`. The `artisan` pack's service names
  are generic artisan services and do NOT match the electricien template names that
  `getUltimateTemplate` returns for those keywords — so when later wired, `getServiceDescriptions`
  will fall back to the generic sentence for those. Acceptable for a pure-data task, but wiring
  (Task 4+) should decide whether these keywords should resolve to the `electricien`/`plombier`
  packs instead. Flagged for review.
- **`dentiste` `bespoke` is `'medical'`** per spec, yet it carries a dedicated dental pack. When
  the builder is wired, a "dentiste" sector currently resolves to the *medical* template services
  (Médecine Générale, …), so `getServiceDescriptions` would NOT pick up the dental descriptions
  unless the template/keyword resolution is also updated to use dental services. The resolver
  itself correctly returns dental copy; the template-shape mismatch is a later-task concern.
