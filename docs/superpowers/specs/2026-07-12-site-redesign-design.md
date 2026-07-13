# Design Spec — LeadForge AI Site "Soft Evolution System" Redesign

**Date:** 2026-07-12
**Status:** Approved (design)
**Author:** opencode (with user)
**Related:** `src/lib/ultimateTemplate.ts`, `src/lib/template/helpers.ts`, `src/lib/sectorConfig.ts`, `src/lib/template/ui.ts`

## 1. Context
LeadForge AI generates professional, dynamic, sector-adaptable websites from a lead's
business data. The content/structure layer was already corrected (Rapport de corrections:
phone consistency, placeholder cleanup, map pin, CTA dedupe, honest stats, no fake reviews,
GDPR, footer distinctness, hero CTA contrast). The visual/UX layer now needs elevation to
an AWARDS-minimal, "Soft UI Evolution" feel that stays safe for all sectors, mobile, SEO,
and accessibility.

Methodology applied: 6-Level build (L1 structure+theme, L2 visual style, L3 UI/UX Pro +
hero + soft color transitions, L4 interactive components + subtle animation, L5 hero visual,
L6 "Vibe" model). User-defined "Vibe" = the **UI/UX Pro Max** skill
(https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), whose principles are baked in —
notably its **Home Services** industry rule set, its **"Soft UI Evolution"** style (#19), and
its strict **anti-pattern list**.

## 2. Objectives
- Deliver a coherent, premium, minimal aesthetic ("Soft UI Evolution").
- Keep the template fully dynamic per sector (no hardcoded sector copy).
- Stay professional + mobile/SEO/accessibility-safe across all sectors.
- Implement the "Vibe" interactive layer in a **Subtil & gardé** way: scroll reveals, hover
  micro-interactions, and a light custom-cursor dot — all auto-disabled on touch / <768px /
  `prefers-reduced-motion`.

## 3. Scope
**In:** Design-token layer, color/theme enforcement, typography scale, hero restructure,
section component elevation, subtle interactions, a11y/perf/seo hardening.
**Out:** Rebuilding the architecture, per-sector bespoke layouts, heavy JS (magnetic buttons,
particle backgrounds, scroll-progress bars), new external dependencies.

## 4. Approach — A: Soft Evolution System
One coherent CSS design-token layer on top of the existing template. Minimal new JS
(IntersectionObserver reveal + optional light cursor). Zero external deps.

## 5. Design Tokens (global `:root`)
- Radius: `--r-sm 10px / --r 16px / --r-lg 24px / --r-xl 32px`
- Shadows (layered soft): `--sh-1` (resting card), `--sh-2` (hover lift), `--sh-glow` (CTA/hero)
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px
- Surface: `#ffffff` cards on soft `#f6f8fb` page bg (or accent-tinted 4%)
- Type scale: display `clamp(2.4rem, 5vw, 3.6rem)`; h2 `clamp(1.8rem, 3.5vw, 2.4rem)`;
  h3; body `1.0625rem / 1.7`; small. System/Inter stack (no web-font fetch).
- Motion: `--ease: cubic-bezier(.22,1,.36,1)`; `--dur: 220ms`.

## 6. Color & Theme (dynamic per sector)
Keep `sectorConfig` `primary/secondary/accent`. Enforce rules:
- Text-on-accent contrast ≥ 4.5:1.
- Soft-tint backgrounds via `color-mix`/`rgba` from accent (≈4% tint).
- No neon, no AI purple-pink gradients.
- New tokens: `--accent-soft`, `--accent-rgb` (for tints/glows).
- Default palette trustworthy professional (deep blue/teal for services).

## 7. Typography
System/Inter stack for performance. Tighter letter-spacing on display, relaxed line-height
on body. Editorial "eyebrow" labels (small uppercase accent text) above section headings.

## 8. Layout / Structure
Keep current inventory: nav, hero, services, about, why, stats, testimonials (conditional),
contact, footer. **Restructure hero** to 2-col (text + soft visual) on desktop, single-col
mobile, with CSS-only gradient-mesh background (radial-gradients, no JS/particles).

## 9. Component Elevation
- **Nav:** glassy sticky bar, lucide icon logo, soft pill CTA.
- **Hero:** mesh bg, eyebrow, display headline, sub, primary+secondary CTA (contrast-safe),
  trust chips (rating / response time).
- **Services:** responsive grid, icon-top cards, hover lift + border glow, specific alt text.
- **About:** image + real rating badge, no CTA, clean prose.
- **Why:** icon list, soft cards.
- **Stats:** `getStats` honest band, count-up (guarded).
- **Testimonials:** only when real reviews; else elegant "Avis en attente" placeholder.
- **Contact:** Web3Forms + GDPR checkbox, lucide field icons, focus rings.
- **Footer:** `footerDesc`, link columns, map.

## 10. Interactions / Vibe (Subtil & gardé)
- IntersectionObserver scroll reveal (fade + translate, staggered) — disabled under
  `prefers-reduced-motion`.
- Hover micro-interactions 150–300ms (lift, shadow, color) on all clickables;
  `cursor:pointer` guaranteed on every interactive element.
- Light custom-cursor dot (subtle follower) — auto-off on touch / <768px / reduced-motion.
- Visible `:focus-visible` rings. Lucide icons only — **no emoji icons**.

## 11. Accessibility / Perf / SEO
Contrast ≥4.5:1, reduced-motion safe, responsive at 375/768/1024/1440, semantic landmarks,
lazy images, single `<h1>`, https canonical, no layout shift from cursor/reveal.

## 12. Dynamic Requirement
All visual decisions read from `sectorConfig` + `content`. One template, infinite sectors.
No hardcoded sector copy.

## 13. Anti-patterns (UI/UX Pro) explicitly avoided
Bright neon colors; harsh/flashy animation; dark-mode-only; AI purple-pink gradients; emoji
as icons; missing `cursor:pointer`; no hover/focus states; low contrast; ignoring
reduced-motion; non-responsive at 375px.

## 14. Success Criteria
- `tsc` passes; regenerated test sites (plombier, electricien) render elevated design.
- Hero shows mesh bg + 2-col on desktop, single-col on mobile.
- All interactive elements have hover + focus states; cursor:pointer verified.
- Scroll reveal works on desktop, disabled under reduced-motion.
- Custom cursor off on mobile/touch/reduced-motion.
- Contrast ≥4.5:1 on accent/CTA; no emoji icons; single `<h1>`.
- No new external dependencies; no layout shift.

## 15. Planned File Changes
- `src/lib/ultimateTemplate.ts`: add `:root` token block; restructure hero HTML/CSS;
  elevate section CSS; add reveal + cursor JS (guarded); mesh bg; focus rings.
- `src/lib/template/helpers.ts`: token/accent helpers if needed (e.g., `colorTint`).
- `src/lib/sectorConfig.ts`: ensure palette meets contrast; add `--accent-soft`/rgb derivable.
- `src/lib/template/ui.ts`: eyebrow/section label strings (FR/EN).
- `test-site-gen.mts`: regenerate both test sites for verification.
