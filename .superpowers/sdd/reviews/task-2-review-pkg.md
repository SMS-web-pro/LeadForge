f082b130 feat(template): elevate visual system (editorial scale, glassy nav, trust strip)


==== diff --stat ====

 src/lib/ultimateTemplate.ts | 34 ++++++++++++++++++++--------------
 1 file changed, 20 insertions(+), 14 deletions(-)


==== full diff ====

diff --git a/src/lib/ultimateTemplate.ts b/src/lib/ultimateTemplate.ts
index 8cd08137..c2dbe724 100644
--- a/src/lib/ultimateTemplate.ts
+++ b/src/lib/ultimateTemplate.ts
@@ -926,41 +926,47 @@ const secondaryRgb = hexToRgb(secondaryColor);
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet">
     <script src="https://unpkg.com/lucide@latest"></script>
     <link rel="alternate" hreflang="${ui.hreflang}" href="${website || '#'}">
     <script type="application/ld+json">{"@context":"https://schema.org","@type":"${sectorCfg.schemaOrg}","name":"${companyName}","description":"${heroSubtitle}","image":"${heroImage}","telephone":"${phone}","email":"${email}","address":{"@type":"PostalAddress","streetAddress":"${address}","addressLocality":"${city}","addressCountry":"FR"},"aggregateRating":{"@type":"AggregateRating","ratingValue":"${rating || 5}","reviewCount":"${reviews || 42}"}}}</script>
     <style>
-        :root{--primary:${primaryColor};--primary-rgb:${primaryRgb};--secondary:${secondaryColor};--accent:${accentColor};--accent-dark:${accentOnDark};--accent-rgb:${accentRgb};--secondary-rgb:${secondaryRgb};--bg:#f7f8fb;--surface:#fff;--text:#161a2b;--text-s:#51566e;--text-t:#868aa3;--border:#e6e8f0;--border-l:#f1f2f7;--dark:#16203c;--dark-rgb:22,32,60;--deco-rotation:${decoRotation}deg;--deco-scale:${decoScale};--accent-opacity:${accentOpacity};--section-shape:${sectionShape};--r-sm:10px;--r:16px;--r-lg:24px;--r-xl:32px;--sh-1:0 1px 2px rgba(16,24,40,.04),0 6px 20px rgba(16,24,40,.06);--sh-2:0 8px 24px rgba(16,24,40,.10),0 18px 48px rgba(16,24,40,.10);--sh-glow:0 14px 44px rgba(var(--primary-rgb),.28);--accent-soft:color-mix(in srgb,var(--accent) 9%,#fff);--ease:cubic-bezier(.22,1,.36,1);--dur:220ms}
+        :root{--primary:${primaryColor};--primary-rgb:${primaryRgb};--secondary:${secondaryColor};--accent:${accentColor};--accent-dark:${accentOnDark};--accent-rgb:${accentRgb};--secondary-rgb:${secondaryRgb};--bg:#f7f8fb;--surface:#fff;--text:#161a2b;--text-s:#51566e;--text-t:#868aa3;--border:#e6e8f0;--border-l:#f1f2f7;--dark:#16203c;--dark-rgb:22,32,60;--deco-rotation:${decoRotation}deg;--deco-scale:${decoScale};--accent-opacity:${accentOpacity};--section-shape:${sectionShape};--r-sm:10px;--r:16px;--r-lg:24px;--r-xl:32px;--sh-1:0 1px 2px rgba(16,24,40,.04),0 6px 20px rgba(16,24,40,.06);--sh-2:0 8px 24px rgba(16,24,40,.10),0 18px 48px rgba(16,24,40,.10);--sh-glow:0 14px 44px rgba(var(--primary-rgb),.28);--accent-soft:color-mix(in srgb,var(--accent) 9%,#fff);--ease:cubic-bezier(.22,1,.36,1);--dur:220ms;--fs-display:clamp(2.4rem,5vw,4rem);--fs-h2:clamp(1.7rem,3.2vw,2.4rem);--fs-h3:1.15rem;--lh-body:1.7;--section-py:clamp(64px,9vw,120px);--trust-bg:color-mix(in srgb,var(--accent) 6%,#fff);--hairline:color-mix(in srgb,var(--accent) 14%,var(--border));--maxw:1140px}
         *{margin:0;padding:0;box-sizing:border-box}
         html{scroll-behavior:smooth;font-size:16px}
         body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);line-height:1.75;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden}
         img{max-width:100%;height:auto;display:block}
         h1,h2,h3,h4,h5{font-family:${headingFont},'DM Sans',sans-serif;line-height:1.25;font-weight:700;letter-spacing:-0.02em}
         a,button,[role="button"]{cursor:pointer}
         :focus-visible{outline:2px solid var(--primary);outline-offset:3px;border-radius:4px}
         ::selection{background:color-mix(in srgb,var(--accent) 22%,#fff);color:var(--text)}
-        .container{max-width:1400px;margin:0 auto;padding:0 32px}
+        .container{max-width:var(--maxw);margin:0 auto;padding:0 24px}
         @media(max-width:768px){.container{padding:0 20px}}
 
-        .navbar{position:fixed;top:36px;left:0;right:0;z-index:100;padding:12px 0;transition:all .4s cubic-bezier(.4,0,.2,1)}
+        .navbar{position:sticky;top:0;z-index:80;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);background:color-mix(in srgb,var(--surface) 82%,transparent);border-bottom:1px solid var(--hairline);padding:12px 0;transition:all .4s cubic-bezier(.4,0,.2,1)}
         .navbar.scrolled{background:rgba(255,255,255,.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid var(--border);padding:10px 0;box-shadow:0 2px 30px rgba(0,0,0,.08)}
         .navbar-inner{max-width:1400px;margin:0 auto;padding:0 32px;display:flex;justify-content:space-between;align-items:center}
         .navbar-brand{display:flex;align-items:center;gap:14px;text-decoration:none;color:var(--text);transition:color .3s}
-        .navbar:not(.scrolled) .navbar-brand{color:#fff}
+        .navbar:not(.scrolled) .navbar-brand{color:var(--text)}
         .navbar-logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;box-shadow:0 4px 15px rgba(var(--primary-rgb),.3);flex-shrink:0}
         .navbar-name{font-weight:700;font-size:1.05rem;color:var(--text);line-height:1.15;max-width:300px;transition:color .3s}
-        .navbar:not(.scrolled) .navbar-name{color:#fff}
+        .navbar:not(.scrolled) .navbar-name{color:var(--text)}
         .navbar-links{display:flex;align-items:center;gap:32px}
         .navbar-links a{text-decoration:none;color:var(--text-s);font-size:.9rem;font-weight:500;transition:color .25s;position:relative}
-        .navbar:not(.scrolled) .navbar-links a{color:rgba(255,255,255,.85)}
-        .navbar:not(.scrolled) .navbar-links a:hover{color:#fff}
+        .navbar:not(.scrolled) .navbar-links a{color:var(--text-s)}
+        .navbar:not(.scrolled) .navbar-links a:hover{color:var(--primary)}
         .navbar-links a:hover{color:var(--primary)}
         .navbar-cta{display:inline-flex;align-items:center;gap:8px;background:var(--primary);color:#fff!important;padding:11px 24px;border-radius:10px;font-weight:600;font-size:.9rem;transition:all .25s;box-shadow:0 4px 15px rgba(var(--primary-rgb),.25)}
         .navbar-cta:hover{opacity:.92;transform:translateY(-1px);box-shadow:0 6px 20px rgba(var(--primary-rgb),.35)}
+        h1{font-size:var(--fs-display);line-height:1.05;letter-spacing:-.02em;font-weight:800}
+        h2{font-size:var(--fs-h2);line-height:1.1;letter-spacing:-.02em;font-weight:800}
+        .trust-strip{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:28px}
+        .trust-badge{display:inline-flex;align-items:center;gap:8px;background:var(--trust-bg);border:1px solid var(--hairline);color:var(--text);padding:10px 16px;border-radius:999px;font-size:.9rem;font-weight:600}
+        .trust-badge i{color:var(--accent)}
+        @media(max-width:768px){.trust-strip{gap:8px}}
         .mobile-toggle{display:none;background:none;border:none;cursor:pointer;padding:8px;border-radius:8px;transition:background .2s}
-        .navbar:not(.scrolled) .mobile-toggle i{color:#fff}
+        .navbar:not(.scrolled) .mobile-toggle i{color:var(--text)}
         .mobile-toggle:hover{background:rgba(0,0,0,.05)}
         .mobile-menu{display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border-bottom:1px solid var(--border);padding:16px 24px;box-shadow:0 12px 40px rgba(0,0,0,.1)}
         .mobile-menu.open{display:block}
         .mobile-menu a{display:block;padding:14px 0;text-decoration:none;color:var(--text);font-weight:500;border-bottom:1px solid var(--border-l);font-size:.95rem}
         .mobile-menu a:last-child{border:none}
         @media(max-width:768px){.navbar-links{display:none!important}.mobile-toggle{display:block}}
@@ -972,13 +978,13 @@ const secondaryRgb = hexToRgb(secondaryColor);
           radial-gradient(70% 80% at 75% 90%,rgba(var(--secondary-rgb,80,90,140),.28) 0%,transparent 60%);
           filter:saturate(1.05);opacity:.95;transition:opacity .6s}
         .hero-bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.45;z-index:0;transition:opacity .6s}
         .hero-overlay{position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(var(--dark-rgb),.72) 0%,rgba(var(--dark-rgb),.55) 45%,rgba(var(--dark-rgb),.82) 100%)}
         .hero-inner{position:relative;z-index:10;max-width:1400px;margin:0 auto;padding:130px 32px 80px;width:100%;display:grid;grid-template-columns:1.1fr 360px;gap:56px;align-items:center}
         .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.20);padding:9px 20px;border-radius:100px;color:#fff;font-size:.78rem;font-weight:600;margin-bottom:24px;letter-spacing:.6px;text-transform:uppercase;backdrop-filter:blur(10px)}
-        .hero h1{font-size:clamp(2.4rem,5vw,3.7rem);font-weight:800;color:#fff;margin-bottom:20px;letter-spacing:-.03em;line-height:1.08;text-shadow:0 2px 24px rgba(0,0,0,.25)}
+        .hero h1{font-size:var(--fs-display);font-weight:800;color:#fff;margin-bottom:20px;letter-spacing:-.03em;line-height:1.08;text-shadow:0 2px 24px rgba(0,0,0,.25)}
         .hero h1 em{font-style:normal;color:var(--accent-dark);position:relative}
         .hero-sub{font-size:1.12rem;color:rgba(255,255,255,.86);max-width:540px;margin-bottom:36px;line-height:1.8;text-shadow:0 1px 12px rgba(0,0,0,.2)}
         .hero-actions{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:40px}
         .btn-pri{display:inline-flex;align-items:center;gap:10px;background:var(--primary);color:#fff;padding:16px 32px;border-radius:14px;text-decoration:none;font-weight:700;font-size:.95rem;transition:all var(--dur) var(--ease);border:none;cursor:pointer;box-shadow:var(--sh-glow),0 0 0 1px rgba(255,255,255,.08) inset}
         .btn-pri:hover{transform:translateY(-2px);box-shadow:0 20px 50px rgba(var(--primary-rgb),.42)}
         .btn-sec{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.26);color:#fff;padding:16px 32px;border-radius:14px;text-decoration:none;font-weight:600;font-size:.95rem;transition:all var(--dur) var(--ease);backdrop-filter:blur(8px)}
@@ -1002,17 +1008,17 @@ const secondaryRgb = hexToRgb(secondaryColor);
         .trust-inner{display:flex;justify-content:center;align-items:center;gap:48px;flex-wrap:wrap}
         .trust-item{display:flex;align-items:center;gap:10px;font-size:.9rem;color:var(--text-s);font-weight:500}
         .trust-item i{color:var(--primary)}
         .trust-div{width:1px;height:24px;background:var(--border)}
         @media(max-width:768px){.trust-inner{gap:16px}.trust-div{display:none}}
 
-        .section{padding:110px 0}
+        .section{padding:var(--section-py) 0}
         .section-alt{background:#fff}
-        .section-dark{background:var(--dark);color:#fff;padding:110px 0}
+        .section-dark{background:var(--dark);color:#fff;padding:var(--section-py) 0}
         .section-hdr{text-align:center;margin-bottom:72px}
-        .section-hdr h2{font-size:clamp(1.8rem,4vw,2.85rem);font-weight:800;margin-bottom:18px;letter-spacing:-.03em}
+        .section-hdr h2{font-size:var(--fs-h2);font-weight:800;margin-bottom:18px;letter-spacing:-.03em}
         .section-hdr p{font-size:1.1rem;color:var(--text-s);max-width:580px;margin:0 auto;line-height:1.7}
         .section-dark .section-hdr h2{color:#fff}
         .section-dark .section-hdr p{color:rgba(255,255,255,.75)}
         .section-label{display:inline-block;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:var(--primary);margin-bottom:14px}
         .section-dark .section-label{color:var(--accent-dark)}
         @media(max-width:768px){.section{padding:60px 0}.section-dark{padding:60px 0}.section-hdr{margin-bottom:40px}.section-hdr p{font-size:1rem}}
@@ -1020,13 +1026,13 @@ const secondaryRgb = hexToRgb(secondaryColor);
         .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
         .about-img{border-radius:20px;overflow:hidden;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.12)}
         .about-img img{width:100%;height:480px;object-fit:cover;display:block}
         .about-badge{position:absolute;bottom:24px;right:24px;background:var(--primary);color:#fff;padding:20px 28px;border-radius:16px;text-align:center;box-shadow:0 12px 32px rgba(var(--primary-rgb),.35)}
         .about-badge-num{font-size:2rem;font-weight:800;line-height:1}
         .about-badge-text{font-size:.72rem;text-transform:uppercase;letter-spacing:1.2px;opacity:.85;margin-top:4px}
-        .about-text h2{font-size:clamp(1.55rem,3vw,2.3rem);font-weight:800;margin-bottom:18px;letter-spacing:-.02em}
+        .about-text h2{font-size:var(--fs-h2);font-weight:800;margin-bottom:18px;letter-spacing:-.02em}
         .about-text>p{color:var(--text-s);margin-bottom:22px;font-size:1.02rem;line-height:1.8}
         .about-checks{list-style:none;display:grid;gap:14px;margin-bottom:32px}
         .about-checks li{display:flex;align-items:center;gap:12px;font-weight:500;font-size:.97rem}
         .about-checks i{color:var(--primary);flex-shrink:0}
         @media(max-width:768px){.about-grid{grid-template-columns:1fr;gap:44px}.about-img img{height:300px}.about-badge{bottom:16px;right:16px;padding:16px 22px}.about-badge-num{font-size:1.6rem}}
 
@@ -1072,13 +1078,13 @@ const secondaryRgb = hexToRgb(secondaryColor);
         .about-img{border-radius:var(--r-lg);box-shadow:var(--sh-2)}
         .why-stat{border-radius:var(--r);transition:transform var(--dur) var(--ease),background var(--dur) var(--ease)}
         .why-stat:hover{transform:translateY(-3px)}
         @media(max-width:768px){.svc-grid{grid-template-columns:1fr}.svc-card-img{height:200px}}
 
         .why-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
-        .why-text h2{font-size:clamp(1.55rem,3vw,2.3rem);font-weight:800;color:#fff;margin-bottom:18px;letter-spacing:-.02em}
+        .why-text h2{font-size:var(--fs-h2);font-weight:800;color:#fff;margin-bottom:18px;letter-spacing:-.02em}
         .why-text>p{color:rgba(255,255,255,.75);margin-bottom:36px;font-size:1.02rem;line-height:1.8}
         .why-stats{display:grid;grid-template-columns:1fr 1fr;gap:18px}
         .why-stat{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:24px;text-align:center;transition:all .3s}
         .why-stat:hover{background:rgba(255,255,255,.12);transform:translateY(-3px)}
         .why-stat-num{font-size:1.85rem;font-weight:800;color:var(--accent);line-height:1}
         .why-stat-label{font-size:.78rem;color:rgba(255,255,255,.5);margin-top:8px;text-transform:uppercase;letter-spacing:1.2px}
