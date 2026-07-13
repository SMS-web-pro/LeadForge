# Task 2 — Hero "Soft Evolution" mesh + refined CTAs

**Source:** docs/superpowers/plans/2026-07-12-soft-evolution-redesign.md (Task 2)

## Files
- Modify: `src/lib/ultimateTemplate.ts` — replace the `.hero` CSS block (currently lines ~870-897).
- Modify: `src/lib/ultimateTemplate.ts` — replace the hero HTML opening (currently lines ~1220-1222: `<section class="hero" id="hero">` + the two following lines).

## Interfaces
- Consumes (already defined in Task 1): `--primary`, `--primary-rgb`, `--secondary`, `--accent`, `--accent-dark`, `--dark`, `--dark-rgb`, `--accent-soft`, `--sh-glow`, `--sh-2`, `--r`, `--r-lg`, `--ease`, `--dur`.
- Produces: `.hero-mesh` layer + contrast-safe `.hero .btn-pri`/`.btn-sec` used by all pages.

## Steps

### Step1: Replace the entire `.hero` CSS block
Find the block that starts with `.hero{position:relative;min-height:100vh;...` and ends with the `@media(max-width:480px){.hero h1...}` hero rule. Replace the WHOLE block with exactly this (preserve every other CSS rule in the file — only this hero block changes):

```css
.hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:var(--dark);padding-top:36px}
.hero-mesh{position:absolute;inset:0;z-index:1;background:
  radial-gradient(60% 70% at 18% 20%,rgba(var(--primary-rgb),.35) 0%,transparent 60%),
  radial-gradient(50% 60% at 85% 15%,rgba(var(--accent-rgb,120,120,160),.30) 0%,transparent 55%),
  radial-gradient(70% 80% at 75% 90%,rgba(var(--secondary-rgb,80,90,140),.28) 0%,transparent 60%);
  filter:saturate(1.05);opacity:.95;transition:opacity .6s}
.hero-bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.45;z-index:0;transition:opacity .6s}
.hero-overlay{position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(var(--dark-rgb),.72) 0%,rgba(var(--dark-rgb),.55) 45%,rgba(var(--dark-rgb),.82) 100%)}
.hero-inner{position:relative;z-index:10;max-width:1400px;margin:0 auto;padding:130px 32px 80px;width:100%;display:grid;grid-template-columns:1.1fr 360px;gap:56px;align-items:center}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.20);padding:9px 20px;border-radius:100px;color:#fff;font-size:.78rem;font-weight:600;margin-bottom:24px;letter-spacing:.6px;text-transform:uppercase;backdrop-filter:blur(10px)}
.hero h1{font-size:clamp(2.4rem,5vw,3.7rem);font-weight:800;color:#fff;margin-bottom:20px;letter-spacing:-.03em;line-height:1.08;text-shadow:0 2px 24px rgba(0,0,0,.25)}
.hero h1 em{font-style:normal;color:var(--accent-dark);position:relative}
.hero-sub{font-size:1.12rem;color:rgba(255,255,255,.86);max-width:540px;margin-bottom:36px;line-height:1.8;text-shadow:0 1px 12px rgba(0,0,0,.2)}
.hero-actions{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:40px}
.btn-pri{display:inline-flex;align-items:center;gap:10px;background:var(--primary);color:#fff;padding:16px 32px;border-radius:14px;text-decoration:none;font-weight:700;font-size:.95rem;transition:all var(--dur) var(--ease);border:none;cursor:pointer;box-shadow:var(--sh-glow),0 0 0 1px rgba(255,255,255,.08) inset}
.btn-pri:hover{transform:translateY(-2px);box-shadow:0 20px 50px rgba(var(--primary-rgb),.42)}
.btn-sec{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.26);color:#fff;padding:16px 32px;border-radius:14px;text-decoration:none;font-weight:600;font-size:.95rem;transition:all var(--dur) var(--ease);backdrop-filter:blur(8px)}
.btn-sec:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.4)}
.hero-rating{display:flex;align-items:center;gap:10px}
.hero-stars{display:flex;gap:2px;color:#fbbf24}
.hero-rating-text{font-size:.88rem;color:rgba(255,255,255,.72)}
.hero-card{background:rgba(255,255,255,.10);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.16);border-radius:var(--r-lg);padding:36px;color:#fff;box-shadow:var(--sh-2)}
.hero-card-title{font-size:.74rem;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:rgba(255,255,255,.5);margin-bottom:24px}
.hero-hours{margin-bottom:28px}
.hero-hours-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);font-size:.92rem}
.hero-hours-row:last-child{border:none}
.hero-hours-day{color:rgba(255,255,255,.7)}
.hero-hours-time{font-weight:600}
.hero-card .btn-pri{width:100%;justify-content:center;margin-top:18px}
.hero-card-note{text-align:center;font-size:.78rem;color:rgba(255,255,255,.45);margin-top:12px}
@media(max-width:900px){.hero-inner{grid-template-columns:1fr;padding:110px 20px 60px}.hero-card{display:none}.hero-actions{flex-direction:column;align-items:stretch}.btn-pri,.btn-sec{justify-content:center}}
@media(max-width:480px){.hero h1{font-size:2rem}.hero-sub{font-size:1rem}.hero-badge{font-size:.7rem;padding:6px 16px}.hero-rating-text{font-size:.8rem}.hero-inner{padding:100px 16px 40px}}
```

### Step2: Add the mesh layer to hero HTML
Find the lines:
```html
    <section class="hero" id="hero">
        <img src="${proxiedImg(heroImage)}" ${heroImgErr} alt="${companyName}" class="hero-bg">
        <div class="hero-overlay"></div>
```
Replace with (insert the `<div class="hero-mesh"></div>` between the image and the overlay):
```html
    <section class="hero" id="hero">
        <img src="${proxiedImg(heroImage)}" ${heroImgErr} alt="${companyName}" class="hero-bg">
        <div class="hero-mesh"></div>
        <div class="hero-overlay"></div>
```

### Step3: Typecheck
Run: `npx tsc --noEmit` (from repo root). Expected: 0 errors.

### Step4: Commit
```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): Soft Evolution hero mesh + contrast-safe CTAs"
```

## Global Constraints (binding)
- Single `<h1>` per page (hero only) — do NOT add/remove any `<h1>`.
- All interactive elements: `cursor:pointer`, visible `:focus-visible` ring, hover transition 150–300ms.
- No emoji icons — lucide (`data-lucide`) only.
- Light-mode contrast ≥4.5:1; no neon; no AI purple-pink gradients.
- Responsive 375/768/1024/1440.
- Custom cursor + reveals auto-disabled under reduced-motion / coarse pointer / <768px (later tasks).
- Zero new external dependencies.
- `tsc` must pass.
