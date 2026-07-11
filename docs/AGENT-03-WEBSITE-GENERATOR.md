# Agent 03 — Website Generator : fonctionnement détaillé

## Vue d’ensemble

L’**Agent 03 (Website Generator)** ne génère **pas** de HTML via l’IA pour la génération principale. Il :

1. **Construit un objet “contenu”** (titres, services, témoignages, CTA) — avec appel optionnel à un **LLM** si une clé API est configurée.
2. **Injecte ce contenu dans un template HTML fixe** (`generatePremiumSiteHtml`) : Bootstrap 5, couleurs par secteur, images lead ou Unsplash.

Aucune API ne génère la **structure** du site : c’est toujours le même template, rempli avec les données du lead et le contenu (défaut ou LLM).

---

## Flux exact pas à pas

### 1. Déclenchement

- Clic sur **« Générer »** (un lead) ou **« Générer X sites »** (lot).
- Appel à `generateSite(lead)` dans `src/components/WebsiteGen.tsx`.

### 2. Étape « Contenu » — `generateContent(lead)`

**Rôle :** Produire un objet `content` (heroTitle, heroSubtitle, aboutText, services, testimonials, cta, whyChooseUs, etc.) utilisé ensuite par le template.

**Sans clé LLM (Groq / Gemini / OpenRouter) :**

- Tout est **défini en dur** à partir du lead :
  - `heroTitle` = `lead.name`
  - `heroSubtitle` = `lead.description` ou texte générique du type « Expert [secteur] à [ville]… »
  - `aboutText` = description ou phrase générique
  - `services` = liste fixe par secteur (ex. restaurant : « Cuisine gastronomique », « Service traiteur », etc.) avec descriptions génériques
  - `testimonials` = `lead.googleReviewsData` (déjà renseigné par l’enrichissement, souvent via Serper)
  - `cta` = « Demander un devis », `whyChooseUs` = 4 phrases types

**Avec clé LLM configurée :**

- Un **seul** appel API LLM est fait : `callLLM(apiConfig, prompt, systemPrompt)`.
- **Prompt :** demande de JSON avec `heroTitle`, `heroSubtitle`, `aboutText`, `servicesTitle`, `aboutTitle`, `services` (tableau), `whyChooseUs`, `cta`, le tout en français et spécifique au secteur.
- **Contexte fourni :** les 1500 premiers caractères de `generateWebsitePrompt(lead)` (fiche entreprise, avis, images disponibles, etc.).
- **System :** « Copywriter web expert français. Retourne UNIQUEMENT du JSON valide sans markdown. »
- Si la réponse contient du JSON valide, il **remplace** les champs par défaut (heroTitle, heroSubtitle, aboutText, services, etc.). Sinon on garde les valeurs par défaut.

**APIs utilisées à cette étape :**

| API        | Utilisation                          | Fichier   |
|-----------|--------------------------------------|-----------|
| **Groq**  | `callLLM` → génération du JSON contenu | `store.ts` |
| **Gemini**| Idem (fallback si pas de Groq)       | `store.ts` |
| **OpenRouter** | Idem (dernier fallback)          | `store.ts` |

Aucune autre API (Serper, Resend, etc.) n’est appelée dans `generateContent`.

### 3. Étape « HTML » — `generatePremiumSiteHtml(lead, content)`

**Rôle :** Produire la page HTML complète. **Aucun appel réseau** : tout est calculé en local dans `src/lib/siteTemplate.ts`.

- **Entrées :** `lead` (nom, secteur, ville, téléphone, email, adresse, logo, images, websiteImages, googleRating, googleReviews, etc.) et `content` (sortie de `generateContent`).
- **Couleurs / thème :** `getScheme(lead.sector)` — palettes prédéfinies par secteur (restaurant, coiffeur, spa, médecin, garage, avocat, hôtel, etc.).
- **Images :**
  - `getImgs(lead)` = fusion de `lead.images` et `lead.websiteImages` (URLs déjà récupérées par l’**Agent 02** via Serper), passées par `proxyImg()` si besoin.
  - Si moins de 12 images : complément avec des URLs **Unsplash** en dur (liste `CURATED` par secteur dans `siteTemplate.ts`). Aucune requête à Unsplash au moment de la génération, uniquement des URLs dans le HTML.
- **Logo :** si `lead.logo` existe, affiché ; sinon initiales du nom dans un bloc coloré.
- **Ressources externes (chargées par le navigateur, pas par l’app) :**
  - Bootstrap 5, Bootstrap Icons, Animate.css, Google Fonts (Playfair Display, Plus Jakarta Sans) via CDN.
  - Images : URLs Unsplash ou `https://wsrv.nl/...` (proxy) pour les images lead.

**APIs utilisées à cette étape :** **aucune**. Template 100 % local.

### 4. Résultat

- Le HTML retourné par `generatePremiumSiteHtml` est enregistré dans `lead.siteHtml`.
- `lead.siteGenerated = true`, `siteUrl` / `landingUrl` sont mis à jour.

### 5. En cas d’erreur (fallback)

- Si une exception est levée (ex. dans `generateContent` ou avant), `generateProfessionalSite(lead)` est appelé (`src/lib/professionalTemplate.ts`).
- Template plus simple, toujours sans appel API.

---

## Éditeur IA (modifications après génération)

Quand l’utilisateur ouvre la prévisualisation et utilise l’**Éditeur IA** pour modifier le site :

- On construit un prompt avec `buildShortPrompt(previewLead, styleHint)` (données du lead + style éventuel).
- **Un** appel **`callLLMForWebsite(apiConfig, fullPrompt, system)`** est fait pour demander un **HTML complet** modifié.
- **APIs :** même chaîne que pour le contenu, mais avec une limite de tokens plus haute (Groq 32k, Gemini 65k, OpenRouter 16k) :
  - **Groq** : `llama-3.3-70b-versatile`
  - **Gemini** : `gemini-2.5-flash`
  - **OpenRouter** : `meta-llama/llama-4-scout:free`
- Si la réponse est du HTML valide (vérifié par `extractHtml` / `validateHtml`), elle remplace `lead.siteHtml`. Sinon, fallback : régénération avec `generateContent` + `generatePremiumSiteHtml`.

Donc l’**IA ne génère du HTML complet** que dans ce mode « modification », pas lors de la génération initiale.

---

## Récapitulatif des APIs utilisées par l’Agent 03

| API / service      | Utilisation dans l’Agent 03                    | Obligatoire ? |
|--------------------|------------------------------------------------|----------------|
| **Groq**           | Contenu JSON (titres, services, etc.) ; Éditeur IA (HTML) | Non (optionnel) |
| **Gemini**         | Idem (si pas de Groq)                          | Non (optionnel) |
| **OpenRouter**     | Idem (si pas Groq ni Gemini)                   | Non (optionnel) |
| **Serper**         | Pas utilisé par l’Agent 03 ; les images/avis viennent du lead (enrichi par l’Agent 02) | Non |
| **Unsplash**       | Pas d’appel API ; uniquement des URLs en dur dans le template | Non |
| **wsrv.nl**        | Utilisé comme URL de proxy pour images (retournée par `proxyImg`) ; requête faite par le navigateur | Non (optionnel, pour CORS) |
| **Bootstrap / Google Fonts / Animate.css** | URLs dans le HTML ; chargement par le navigateur | Non (CDN publics) |

---

## Pourquoi le site peut paraître « non professionnel »

1. **Un seul template** : même structure pour tous les secteurs (hero, services, galerie, témoignages, contact). Différences = couleurs + texte + images, pas de vraie variété de mise en page.
2. **Contenu par défaut** : sans clé LLM, les textes sont très génériques (« Solution professionnelle X adaptée à vos besoins », « Demander un devis », etc.).
3. **Images** : si le lead n’a pas été bien enrichi (Agent 02), peu ou pas d’images réelles ; le template complète avec des photos Unsplash par secteur, ce qui peut donner un rendu « stock ».
4. **Pas de génération de maquette par l’IA** : l’IA ne produit pas le design ni la structure HTML en génération initiale ; elle ne fait qu’enrichir le contenu texte (et éventuellement le HTML en mode Éditeur IA).

---

## Fichiers principaux

| Fichier | Rôle |
|---------|------|
| `src/components/WebsiteGen.tsx` | UI, `generateSite`, `generateContent`, Éditeur IA, prévisualisation |
| `src/lib/store.ts` | `callLLM`, `callLLMForWebsite`, `generateWebsitePrompt`, `proxyImg` |
| `src/lib/siteTemplate.ts` | `generatePremiumSiteHtml`, schémas de couleurs, images Unsplash, template Bootstrap |
| `src/lib/professionalTemplate.ts` | Template de secours si erreur |

---

## En résumé

- **Fonctionnement :** Contenu (défaut ou LLM) → injection dans un template HTML fixe (premium ou professionnel).
- **APIs réellement utilisées par l’Agent 03 :** uniquement les **LLM** (Groq, Gemini, OpenRouter) pour le contenu JSON et, en mode Éditeur IA, pour du HTML modifié. Aucune API de recherche, d’images ou d’email dans le flux de génération de site.
