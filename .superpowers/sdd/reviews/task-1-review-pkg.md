3bb6046c refactor(template): extract section builder helpers (output-identical)


==== diff --stat ====

 src/lib/ultimateTemplate.ts | 352 ++++++++++++++++++++++++--------------------
 1 file changed, 190 insertions(+), 162 deletions(-)


==== full diff ====

diff --git a/src/lib/ultimateTemplate.ts b/src/lib/ultimateTemplate.ts
index a438c270..8cd08137 100644
--- a/src/lib/ultimateTemplate.ts
+++ b/src/lib/ultimateTemplate.ts
@@ -714,16 +714,200 @@ const secondaryRgb = hexToRgb(secondaryColor);
   const headingFont = fontPair === 0 ? "'DM Sans'" : fontPair === 1 ? "'Plus Jakarta Sans'" : fontPair === 2 ? "'Playfair Display'" : "'Cormorant Garamond'";
 
   const leadVariant = combinedHash % 5;
   const decoRotation = (combinedHash * 7) % 360;
   const decoScale = 0.8 + ((combinedHash * 3) % 40) / 100;
   const accentOpacity = 0.04 + ((combinedHash * 11) % 6) / 100;
   const sectionShape = combinedHash % 3;
 
+  function buildHero(content: UltimateContent, template: any, lang: 'fr' | 'en'): string {
+    return `    <section class="hero" id="hero">
+        <img src="${proxiedImg(heroImage)}" ${heroImgErr} alt="${companyName}" class="hero-bg">
+        <div class="hero-mesh"></div>
+        <div class="hero-overlay"></div>
+        <div class="hero-inner">
+            <div>
+                <div class="hero-badge"><i data-lucide="${heroBadge.icon}" width="14"></i> ${heroBadge.text}</div>
+                <h1>${heroTitle.replace(/\b(\w+)/g, (m: string, w: string, i: number) => i === 0 || i === 2 ? `<em>${w}</em>` : w)}</h1>
+                <p class="hero-sub">${heroSubtitle}</p>
+                <div class="hero-actions">
+                    <a href="#contact" class="btn-pri">${ctaText} <i data-lucide="arrow-right" width="18"></i></a>
+                    ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-sec"><i data-lucide="phone" width="18"></i> ${ui.heroCall}</a>` : ''}
+                </div>
+                <div style="display:flex;gap:24px;flex-wrap:wrap">
+                    ${hasRealRating && rating ? `<div class="hero-rating"><div class="hero-stars">${Array(Math.round(rating)).fill('<i data-lucide="star" fill="currentColor" width="16"></i>').join('')}</div><span class="hero-rating-text">${rating}/5 ÔÇö ${reviews} ${ui.testGoogle}</span></div>` : ''}
+                </div>
+            </div>
+            <div class="hero-card">
+                <div class="hero-card-title">${ui.heroHours}</div>
+                <div class="hero-hours">
+                    ${leadHours ? `
+                    <div class="hero-hours-row"><span class="hero-hours-day">${leadHours}</span></div>
+                    ` : `
+                    <div class="hero-hours-row"><span class="hero-hours-day">${ui.monLunVen}</span><span class="hero-hours-time">${sectorCfg.defaultHours.weekdays}</span></div>
+                    <div class="hero-hours-row"><span class="hero-hours-day">${ui.monSam}</span><span class="hero-hours-time">${sectorCfg.defaultHours.saturday}</span></div>
+                    <div class="hero-hours-row"><span class="hero-hours-day">${ui.monDim}</span><span class="hero-hours-time" style="color:var(--accent-dark)">${sectorCfg.defaultHours.sunday}</span></div>
+                    `}
+                </div>
+                ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-pri"><i data-lucide="phone" width="16"></i> ${phone}</a>` : ''}
+                <div class="hero-card-note">${ui.heroNote}</div>
+            </div>
+        </div>
+    </section>`;
+  }
+
+  function buildServices(content: UltimateContent, lang: 'fr' | 'en', serviceDescs: any[]): string {
+    return `    <section class="section" id="services">
+        <div class="container" style="position:relative">
+            <div class="section-deco deco-circle" style="width:200px;height:200px;top:-60px;right:${leadVariant % 2 === 0 ? '-80px' : 'auto'};left:${leadVariant % 2 !== 0 ? '-80px' : 'auto'};animation-delay:${leadVariant}s"></div>
+            ${leadVariant % 2 === 0 ? '<div class="section-deco deco-line" style="width:180px;top:40%;left:-40px;animation-delay:2s"></div>' : ''}
+            <div class="section-hdr reveal">
+                <span class="section-label">${ui.eyebrowServices}</span>
+                <h2>${sectorCfg.ui.svcTitle[lang]}</h2>
+                <p>${sectorCfg.ui.svcDesc[lang]}</p>
+            </div>
+            <div class="svc-grid">
+                ${services.map((s, i) => {
+                  const iconName = sectorCfg.serviceIcons[i % sectorCfg.serviceIcons.length] || 'check-circle';
+                return `
+                <div class="svc-card reveal reveal-d${(i % 3) + 1}">
+                    <img src="${proxiedImg(serviceImages[i] || heroImage)}" class="svc-card-img" alt="${s.name} ├á ${city}" loading="lazy">
+                    <div class="svc-card-body">
+                        <div class="svc-icon"><i data-lucide="${iconName}" width="22" height="22"></i></div>
+                        <h3>${s.name}</h3>
+                        <p>${s.description}</p>
+                        <a href="#contact" class="svc-link">${ui.svcLink} <i data-lucide="arrow-right" width="14"></i></a>
+                    </div>
+                </div>`}).join('')}
+            </div>
+        </div>
+    </section>`;
+  }
+
+  function buildWhyUs(content: UltimateContent, whyItems: any[]): string {
+    return `    <section class="section" id="pourquoi">
+        <div class="container" style="position:relative">
+            ${leadVariant % 2 === 0 ? '<div class="section-deco deco-line" style="width:200px;bottom:20%;right:-60px;animation-delay:3s"></div>' : ''}
+            <div class="section-deco deco-dot" style="top:10%;${leadVariant % 2 === 0 ? 'left:5%' : 'right:5%'};animation-delay:${leadVariant}s"></div>
+            <div class="section-hdr reveal">
+                <span class="section-label">${ui.eyebrowGuarantees}</span>
+                <h2>${lang === 'en' ? 'Why Choose Us' : 'Pourquoi nous choisir'}</h2>
+                <p>${lang === 'en' ? 'The concrete reasons our clients trust us, sector after sector.' : 'Les raisons concr├¿tes pour lesquelles nos clients nous confient leurs projets, dans votre secteur comme les autres.'}</p>
+            </div>
+            <div class="guar-grid reveal">
+                ${getGuarantees(content.sector, lang).map((g: any, i: number) => `
+                <div class="guar-card reveal-d${Math.min(i, 3)}">
+                    <div class="guar-icon"><i data-lucide="${g.icon}" width="24" height="24"></i></div>
+                    <h3>${g.title}</h3>
+                    <p class="guar-desc">${ADV_DESC[g.icon]?.[lang] || (lang === 'en' ? 'A commitment we stand behind' : 'Un engagement que nous honorons')}</p>
+                </div>`).join('')}
+            </div>
+            ${buildGallery(content)}
+        </div>
+    </section>`;
+  }
+
+  function buildGallery(content: UltimateContent): string {
+    return `${(realPhotos && realPhotos.length > 0) ? `
+            <div class="gal-grid reveal" style="margin-top:44px">
+                <div class="gal-item gal-main"><img src="${proxiedImg(realPhotos[0])}" ${imgErr(1)} alt="${companyName}" loading="lazy"></div>
+                <div class="gal-item"><img src="${proxiedImg(realPhotos[1] || realPhotos[0])}" ${imgErr(2)} alt="${companyName}" loading="lazy"></div>
+                <div class="gal-item"><img src="${proxiedImg(realPhotos[2] || realPhotos[0])}" ${imgErr(3)} alt="${companyName}" loading="lazy"></div>
+                <div class="gal-item"><img src="${proxiedImg(realPhotos[3] || realPhotos[0])}" ${imgErr(4)} alt="${companyName}" loading="lazy"></div>
+                <div class="gal-item"><img src="${proxiedImg(realPhotos[4] || realPhotos[0])}" ${imgErr(5)} alt="${companyName}" loading="lazy"></div>
+            </div>` : ''}`;
+  }
+
+  function buildTrust(content: UltimateContent, lang: 'fr' | 'en'): string {
+    return `    <section class="section section-alt" id="testimonials">
+        <div class="container">
+            <div class="section-hdr reveal">
+                <span class="section-label">${ui.eyebrowTestimonials}</span>
+                <h2>${ui.testTitle}</h2>
+                <p>${ui.testDesc}</p>
+            </div>
+            ${hasRealReviews && testimonials.length > 0 ? `
+            <div class="test-grid">
+                ${testimonials.slice(0,6).map((t,i) => `
+                <div class="test-card reveal reveal-d${(i % 3) + 1}">
+                    <div><div class="test-stars">${Array(t.rating).fill('<i data-lucide="star" fill="currentColor" width="15"></i>').join('')}</div><p class="test-text">"${t.text}"</p></div>
+                    <div class="test-author"><div class="test-avatar">${t.author.charAt(0)}</div><div><div class="test-name">${t.author}</div>${t.date?`<div class="test-date">${t.date}</div>`:''}</div></div>
+                </div>`).join('')}
+            </div>
+            ${hasRealRating ? `<div class="test-google reveal"><i data-lucide="star" fill="#f59e0b" width="20" class="test-google-star"></i><div><strong>${rating}/5 ${ui.testGoogle}</strong><div style="font-size:.8rem;color:var(--text-s)">${ui.testBas├®} ${reviews} ${ui.testAvis}</div></div></div>` : ''}
+            ` : `
+            <div class="test-empty reveal">
+                <i data-lucide="message-square" width="28"></i>
+                <p>${ui.testEmpty}</p>
+            </div>`}
+        </div>
+    </section>`;
+  }
+
+  function buildContact(content: UltimateContent, lang: 'fr' | 'en'): string {
+    return `    <section class="section" id="contact">
+        <div class="container">
+            <div class="section-hdr reveal">
+                <span class="section-label">${ui.eyebrowContact}</span>
+                <h2>${ui.contactTitle}</h2>
+                <p>${ui.contactDesc}</p>
+            </div>
+            <div class="contact-wrap reveal">
+                <div class="contact-form">
+                    <h3>${sectorCfg.ui.contactTitle[lang]}</h3>
+                    <p>${ui.formDesc}</p>
+                    <form action="javascript:void(0)" onsubmit="event.preventDefault();this.querySelector('.form-submit').textContent='${lang === 'en' ? 'Message sent Ô£ô' : 'Message envoy├® Ô£ô'}';this.querySelector('.form-submit').style.background='#16a34a'">
+                        ${sectorCfg.formFields.map(field => {
+                          if (field.type === 'textarea') {
+                            return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><textarea class="form-control" name="${field.name}" rows="4" placeholder="${field.placeholder[lang]}" ${field.required ? 'required' : ''}></textarea></div>`;
+                          }
+                          if (field.type === 'select' && field.options) {
+                            return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><select class="form-control" name="${field.name}" ${field.required ? 'required' : ''}><option value="">${field.placeholder[lang]}</option>${field.options.map(opt => `<option value="${opt.fr}">${opt[lang]}</option>`).join('')}</select></div>`;
+                          }
+                          return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><input type="${field.type}" class="form-control" name="${field.name}" placeholder="${field.placeholder[lang]}" ${field.required ? 'required' : ''}></div>`;
+                        }).join('')}
+                        <div class="form-check">
+                            <input type="checkbox" id="consent" name="consent" required>
+                            <label for="consent">${ui.formConsent}<a href="#" onclick="event.preventDefault();document.getElementById('privacy-modal').classList.add('open')">${ui.privacyLink}</a>.</label>
+                        </div>
+                        <button type="submit" class="form-submit"><i data-lucide="send" width="16"></i> ${ui.formSubmit}</button>
+                        <p class="form-note">${ui.formNote}</p>
+                    </form>
+                </div>
+                <div class="contact-sidebar">
+                    <div class="contact-hours">
+                        <h4><i data-lucide="clock" width="16" style="color:var(--primary)"></i> ${ui.hoursTitle}</h4>
+                        ${leadHours ? `
+                        <div class="hours-row"><span class="hours-day">${leadHours}</span></div>
+                        ` : `
+                        <div class="hours-row"><span class="hours-day">${ui.hoursLunVen}</span><span class="hours-time">${sectorCfg.defaultHours.weekdays}</span></div>
+                        <div class="hours-row"><span class="hours-day">${ui.hoursSam}</span><span class="hours-time">${sectorCfg.defaultHours.saturday}</span></div>
+                        <div class="hours-row"><span class="hours-day">${ui.hoursDim}</span><span class="hours-time" style="color:var(--accent)">${sectorCfg.defaultHours.sunday}</span></div>
+                        `}
+                    </div>
+                    <div class="contact-card">
+                        <div class="contact-card-item"><i data-lucide="phone" width="16"></i> ${phone ? `<a href="tel:${cleanPhoneLink}">${phone}</a>` : 'Non renseign├®'}</div>
+                        <div class="contact-card-item"><i data-lucide="mail" width="16"></i> ${email ? `<a href="mailto:${email}">${email}</a>` : 'Non renseign├®'}</div>
+                        <div class="contact-card-item"><i data-lucide="map-pin" width="16"></i> ${address}</div>
+                        ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-pri" style="margin-top:16px;width:100%;justify-content:center"><i data-lucide="phone" width="16"></i> ${ui.contactCall}</a>` : ''}
+                    </div>
+                </div>
+            </div>
+            <div class="contact-map reveal" style="margin-top:32px">
+                <iframe src="https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
+            </div>
+        </div>
+    </section>`;
+  }
+
+  function buildBespoke(content: UltimateContent, template: any, lang: 'fr' | 'en'): string {
+    return '';
+  }
+
   return `<!DOCTYPE html>
 <html lang="${ui.lang}">
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
     <link rel="icon" type="image/svg+xml" href="${faviconDataUrl}">
     <title>${companyName} - ${content.sector} ├á ${city}</title>
     <meta name="description" content="${heroSubtitle}">
@@ -1132,85 +1316,29 @@ const secondaryRgb = hexToRgb(secondaryColor);
             <button class="mobile-toggle" id="mobile-toggle" aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu"><i data-lucide="menu" width="24" height="24" style="color:var(--text)"></i></button>
         </div>
         <div class="mobile-menu" id="mobile-menu" role="navigation" aria-label="${lang === 'en' ? 'Mobile menu' : 'Menu mobile'}">
             ${sectorCfg.navItems.map(item => `<a href="${item.href}">${item.label[lang]}</a>`).join('')}
             ${phone ? `<a href="tel:${cleanPhoneLink}" style="color:var(--primary);font-weight:700">${phone}</a>` : ''}
         </div>
     </nav>
 
-    <section class="hero" id="hero">
-        <img src="${proxiedImg(heroImage)}" ${heroImgErr} alt="${companyName}" class="hero-bg">
-        <div class="hero-mesh"></div>
-        <div class="hero-overlay"></div>
-        <div class="hero-inner">
-            <div>
-                <div class="hero-badge"><i data-lucide="${heroBadge.icon}" width="14"></i> ${heroBadge.text}</div>
-                <h1>${heroTitle.replace(/\b(\w+)/g, (m: string, w: string, i: number) => i === 0 || i === 2 ? `<em>${w}</em>` : w)}</h1>
-                <p class="hero-sub">${heroSubtitle}</p>
-                <div class="hero-actions">
-                    <a href="#contact" class="btn-pri">${ctaText} <i data-lucide="arrow-right" width="18"></i></a>
-                    ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-sec"><i data-lucide="phone" width="18"></i> ${ui.heroCall}</a>` : ''}
-                </div>
-                <div style="display:flex;gap:24px;flex-wrap:wrap">
-                    ${hasRealRating && rating ? `<div class="hero-rating"><div class="hero-stars">${Array(Math.round(rating)).fill('<i data-lucide="star" fill="currentColor" width="16"></i>').join('')}</div><span class="hero-rating-text">${rating}/5 ÔÇö ${reviews} ${ui.testGoogle}</span></div>` : ''}
-                </div>
-            </div>
-            <div class="hero-card">
-                <div class="hero-card-title">${ui.heroHours}</div>
-                <div class="hero-hours">
-                    ${leadHours ? `
-                    <div class="hero-hours-row"><span class="hero-hours-day">${leadHours}</span></div>
-                    ` : `
-                    <div class="hero-hours-row"><span class="hero-hours-day">${ui.monLunVen}</span><span class="hero-hours-time">${sectorCfg.defaultHours.weekdays}</span></div>
-                    <div class="hero-hours-row"><span class="hero-hours-day">${ui.monSam}</span><span class="hero-hours-time">${sectorCfg.defaultHours.saturday}</span></div>
-                    <div class="hero-hours-row"><span class="hero-hours-day">${ui.monDim}</span><span class="hero-hours-time" style="color:var(--accent-dark)">${sectorCfg.defaultHours.sunday}</span></div>
-                    `}
-                </div>
-                ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-pri"><i data-lucide="phone" width="16"></i> ${phone}</a>` : ''}
-                <div class="hero-card-note">${ui.heroNote}</div>
-            </div>
-        </div>
-    </section>
+${buildHero(content, template, lang)}
 
-    <main id="main-content">
+    <main id="main-content">${buildBespoke(content, template, lang)}
     <div class="trust-bar">
         <div class="trust-inner">
             ${getGuarantees(content.sector, lang).map((g: { title: string; icon: string }, i: number) => `
             <div class="trust-item"><i data-lucide="${g.icon}" width="16"></i> ${g.title}</div>
             ${i < 3 ? '<div class="trust-div"></div>' : ''}
             `).join('')}
         </div>
     </div>
 
-    <section class="section" id="services">
-        <div class="container" style="position:relative">
-            <div class="section-deco deco-circle" style="width:200px;height:200px;top:-60px;right:${leadVariant % 2 === 0 ? '-80px' : 'auto'};left:${leadVariant % 2 !== 0 ? '-80px' : 'auto'};animation-delay:${leadVariant}s"></div>
-            ${leadVariant % 2 === 0 ? '<div class="section-deco deco-line" style="width:180px;top:40%;left:-40px;animation-delay:2s"></div>' : ''}
-            <div class="section-hdr reveal">
-                <span class="section-label">${ui.eyebrowServices}</span>
-                <h2>${sectorCfg.ui.svcTitle[lang]}</h2>
-                <p>${sectorCfg.ui.svcDesc[lang]}</p>
-            </div>
-            <div class="svc-grid">
-                ${services.map((s, i) => {
-                  const iconName = sectorCfg.serviceIcons[i % sectorCfg.serviceIcons.length] || 'check-circle';
-                return `
-                <div class="svc-card reveal reveal-d${(i % 3) + 1}">
-                    <img src="${proxiedImg(serviceImages[i] || heroImage)}" class="svc-card-img" alt="${s.name} ├á ${city}" loading="lazy">
-                    <div class="svc-card-body">
-                        <div class="svc-icon"><i data-lucide="${iconName}" width="22" height="22"></i></div>
-                        <h3>${s.name}</h3>
-                        <p>${s.description}</p>
-                        <a href="#contact" class="svc-link">${ui.svcLink} <i data-lucide="arrow-right" width="14"></i></a>
-                    </div>
-                </div>`}).join('')}
-            </div>
-        </div>
-    </section>
+${buildServices(content, lang, [])}
 
     <section class="section section-alt" id="about">
         <div class="container" style="position:relative">
             <div class="section-deco deco-diamond" style="top:-40px;${leadVariant % 3 === 0 ? 'left:-30px' : leadVariant % 3 === 1 ? 'right:-30px' : 'left:50%;margin-left:-60px'};animation-delay:${leadVariant * 2}s"></div>
             ${leadVariant > 1 ? '<div class="section-deco deco-dot" style="top:20%;right:10%;animation-delay:1.5s"></div>' : ''}
             <div class="about-grid">
                 <div class="about-img reveal">
                     <img src="${proxiedImg(getImg(1))}" ${imgErr(1)} alt="${companyName}" loading="lazy">
@@ -1249,67 +1377,19 @@ const secondaryRgb = hexToRgb(secondaryColor);
             </div>
         </div>
     </section>
 
     <div class="stats" style="background:var(--primary)">
         ${getStats(content.sector, lang, rating, reviews, establishedYear, hasRealRating ?? false, hasRealReviews ?? false).map(s => `<div class="stat-item"><div class="stat-num">${s.num}</div><div class="stat-label">${s.label}</div></div>`).join('')}
     </div>
 
-    <section class="section" id="pourquoi">
-        <div class="container" style="position:relative">
-            ${leadVariant % 2 === 0 ? '<div class="section-deco deco-line" style="width:200px;bottom:20%;right:-60px;animation-delay:3s"></div>' : ''}
-            <div class="section-deco deco-dot" style="top:10%;${leadVariant % 2 === 0 ? 'left:5%' : 'right:5%'};animation-delay:${leadVariant}s"></div>
-            <div class="section-hdr reveal">
-                <span class="section-label">${ui.eyebrowGuarantees}</span>
-                <h2>${lang === 'en' ? 'Why Choose Us' : 'Pourquoi nous choisir'}</h2>
-                <p>${lang === 'en' ? 'The concrete reasons our clients trust us, sector after sector.' : 'Les raisons concr├¿tes pour lesquelles nos clients nous confient leurs projets, dans votre secteur comme les autres.'}</p>
-            </div>
-            <div class="guar-grid reveal">
-                ${getGuarantees(content.sector, lang).map((g: any, i: number) => `
-                <div class="guar-card reveal-d${Math.min(i, 3)}">
-                    <div class="guar-icon"><i data-lucide="${g.icon}" width="24" height="24"></i></div>
-                    <h3>${g.title}</h3>
-                    <p class="guar-desc">${ADV_DESC[g.icon]?.[lang] || (lang === 'en' ? 'A commitment we stand behind' : 'Un engagement que nous honorons')}</p>
-                </div>`).join('')}
-            </div>
-            ${(realPhotos && realPhotos.length > 0) ? `
-            <div class="gal-grid reveal" style="margin-top:44px">
-                <div class="gal-item gal-main"><img src="${proxiedImg(realPhotos[0])}" ${imgErr(1)} alt="${companyName}" loading="lazy"></div>
-                <div class="gal-item"><img src="${proxiedImg(realPhotos[1] || realPhotos[0])}" ${imgErr(2)} alt="${companyName}" loading="lazy"></div>
-                <div class="gal-item"><img src="${proxiedImg(realPhotos[2] || realPhotos[0])}" ${imgErr(3)} alt="${companyName}" loading="lazy"></div>
-                <div class="gal-item"><img src="${proxiedImg(realPhotos[3] || realPhotos[0])}" ${imgErr(4)} alt="${companyName}" loading="lazy"></div>
-                <div class="gal-item"><img src="${proxiedImg(realPhotos[4] || realPhotos[0])}" ${imgErr(5)} alt="${companyName}" loading="lazy"></div>
-            </div>` : ''}
-        </div>
-    </section>
+${buildWhyUs(content, [])}
 
-    <section class="section section-alt" id="testimonials">
-        <div class="container">
-            <div class="section-hdr reveal">
-                <span class="section-label">${ui.eyebrowTestimonials}</span>
-                <h2>${ui.testTitle}</h2>
-                <p>${ui.testDesc}</p>
-            </div>
-            ${hasRealReviews && testimonials.length > 0 ? `
-            <div class="test-grid">
-                ${testimonials.slice(0,6).map((t,i) => `
-                <div class="test-card reveal reveal-d${(i % 3) + 1}">
-                    <div><div class="test-stars">${Array(t.rating).fill('<i data-lucide="star" fill="currentColor" width="15"></i>').join('')}</div><p class="test-text">"${t.text}"</p></div>
-                    <div class="test-author"><div class="test-avatar">${t.author.charAt(0)}</div><div><div class="test-name">${t.author}</div>${t.date?`<div class="test-date">${t.date}</div>`:''}</div></div>
-                </div>`).join('')}
-            </div>
-            ${hasRealRating ? `<div class="test-google reveal"><i data-lucide="star" fill="#f59e0b" width="20" class="test-google-star"></i><div><strong>${rating}/5 ${ui.testGoogle}</strong><div style="font-size:.8rem;color:var(--text-s)">${ui.testBas├®} ${reviews} ${ui.testAvis}</div></div></div>` : ''}
-            ` : `
-            <div class="test-empty reveal">
-                <i data-lucide="message-square" width="28"></i>
-                <p>${ui.testEmpty}</p>
-            </div>`}
-        </div>
-    </section>
+${buildTrust(content, lang)}
 
     <section class="section section-alt" id="faq">
         <div class="container">
             <div class="section-hdr reveal">
                 <span class="section-label">FAQ</span>
                 <h2>${lang === 'en' ? 'Frequently Asked Questions' : 'Questions fr├®quentes'}</h2>
                 <p>${lang === 'en' ? `Everything you need to know before calling ${companyName}.` : `Tout ce qu'il faut savoir avant de faire appel ├á ${companyName}.`}</p>
             </div>
@@ -1323,69 +1403,17 @@ const secondaryRgb = hexToRgb(secondaryColor);
                 <details class="faq-item">
                     <summary class="faq-q">${f.q} <i data-lucide="chevron-down" width="18"></i></summary>
                     <div class="faq-a">${f.a}</div>
                 </details>`).join('')}
             </div>
         </div>
     </section>
 
-    <section class="section" id="contact">
-        <div class="container">
-            <div class="section-hdr reveal">
-                <span class="section-label">${ui.eyebrowContact}</span>
-                <h2>${ui.contactTitle}</h2>
-                <p>${ui.contactDesc}</p>
-            </div>
-            <div class="contact-wrap reveal">
-                <div class="contact-form">
-                    <h3>${sectorCfg.ui.contactTitle[lang]}</h3>
-                    <p>${ui.formDesc}</p>
-                    <form action="javascript:void(0)" onsubmit="event.preventDefault();this.querySelector('.form-submit').textContent='${lang === 'en' ? 'Message sent Ô£ô' : 'Message envoy├® Ô£ô'}';this.querySelector('.form-submit').style.background='#16a34a'">
-                        ${sectorCfg.formFields.map(field => {
-                          if (field.type === 'textarea') {
-                            return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><textarea class="form-control" name="${field.name}" rows="4" placeholder="${field.placeholder[lang]}" ${field.required ? 'required' : ''}></textarea></div>`;
-                          }
-                          if (field.type === 'select' && field.options) {
-                            return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><select class="form-control" name="${field.name}" ${field.required ? 'required' : ''}><option value="">${field.placeholder[lang]}</option>${field.options.map(opt => `<option value="${opt.fr}">${opt[lang]}</option>`).join('')}</select></div>`;
-                          }
-                          return `<div class="form-group"><label class="form-label">${field.placeholder[lang]}</label><input type="${field.type}" class="form-control" name="${field.name}" placeholder="${field.placeholder[lang]}" ${field.required ? 'required' : ''}></div>`;
-                        }).join('')}
-                        <div class="form-check">
-                            <input type="checkbox" id="consent" name="consent" required>
-                            <label for="consent">${ui.formConsent}<a href="#" onclick="event.preventDefault();document.getElementById('privacy-modal').classList.add('open')">${ui.privacyLink}</a>.</label>
-                        </div>
-                        <button type="submit" class="form-submit"><i data-lucide="send" width="16"></i> ${ui.formSubmit}</button>
-                        <p class="form-note">${ui.formNote}</p>
-                    </form>
-                </div>
-                <div class="contact-sidebar">
-                    <div class="contact-hours">
-                        <h4><i data-lucide="clock" width="16" style="color:var(--primary)"></i> ${ui.hoursTitle}</h4>
-                        ${leadHours ? `
-                        <div class="hours-row"><span class="hours-day">${leadHours}</span></div>
-                        ` : `
-                        <div class="hours-row"><span class="hours-day">${ui.hoursLunVen}</span><span class="hours-time">${sectorCfg.defaultHours.weekdays}</span></div>
-                        <div class="hours-row"><span class="hours-day">${ui.hoursSam}</span><span class="hours-time">${sectorCfg.defaultHours.saturday}</span></div>
-                        <div class="hours-row"><span class="hours-day">${ui.hoursDim}</span><span class="hours-time" style="color:var(--accent)">${sectorCfg.defaultHours.sunday}</span></div>
-                        `}
-                    </div>
-                    <div class="contact-card">
-                        <div class="contact-card-item"><i data-lucide="phone" width="16"></i> ${phone ? `<a href="tel:${cleanPhoneLink}">${phone}</a>` : 'Non renseign├®'}</div>
-                        <div class="contact-card-item"><i data-lucide="mail" width="16"></i> ${email ? `<a href="mailto:${email}">${email}</a>` : 'Non renseign├®'}</div>
-                        <div class="contact-card-item"><i data-lucide="map-pin" width="16"></i> ${address}</div>
-                        ${phone ? `<a href="tel:${cleanPhoneLink}" class="btn-pri" style="margin-top:16px;width:100%;justify-content:center"><i data-lucide="phone" width="16"></i> ${ui.contactCall}</a>` : ''}
-                    </div>
-                </div>
-            </div>
-            <div class="contact-map reveal" style="margin-top:32px">
-                <iframe src="https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
-            </div>
-        </div>
-    </section>
+${buildContact(content, lang)}
     </main>
 
     <footer>
         <div class="container">
             <div class="footer-grid">
                 <div>
                     <div class="footer-brand"><div class="footer-brand-logo"><i data-lucide="${heroBadge.icon}" width="18" height="18"></i></div><span class="footer-brand-text">${logoInfo.text}</span></div>
                     <p class="footer-desc">${footerDesc || (lang === 'en' ? `Your trusted ${content.sector} ÔÇö ${companyName}.` : `Votre ${content.sector} de confiance ÔÇö ${companyName}.`)}</p>
