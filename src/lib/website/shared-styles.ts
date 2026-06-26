export const SHARED_STYLES = `
.gallery-masonry { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 2rem 0; }
.gallery-item { position: relative; overflow: hidden; border-radius: 12px; cursor: pointer; aspect-ratio: 4/3; }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
.gallery-item:hover img { transform: scale(1.08); }
.gallery-item .overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.3s; display: flex; align-items: center; justify-content: center; }
.gallery-item:hover .overlay { opacity: 1; }
.gallery-item .overlay span { color: white; font-size: 2rem; }

.faq-item { border-bottom: 1px solid var(--border, #e2e8f0); padding: 0; }
.faq-question { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 0; background: none; border: none; cursor: pointer; font-size: 1.05rem; font-weight: 600; color: var(--text, #1f2937); text-align: left; }
.faq-question .icon { width: 24px; height: 24px; position: relative; flex-shrink: 0; margin-left: 1rem; }
.faq-question .icon::before, .faq-question .icon::after { content: ''; position: absolute; background: var(--primary, #2563eb); border-radius: 2px; transition: transform 0.3s; }
.faq-question .icon::before { width: 2px; height: 16px; top: 4px; left: 11px; }
.faq-question .icon::after { width: 16px; height: 2px; top: 11px; left: 4px; }
.faq-item.open .faq-question .icon::before { transform: rotate(90deg); }
.faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; padding: 0; color: var(--text-muted, #6b7280); line-height: 1.7; }
.faq-item.open .faq-answer { max-height: 300px; padding: 0 0 1.25rem 0; }

.hours-table { width: 100%; max-width: 400px; margin: 0 auto; border-collapse: collapse; }
.hours-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border, #e2e8f0); }
.hours-table td:first-child { font-weight: 600; }
.hours-table .closed { color: #ef4444; font-weight: 500; }
.hours-table .open { color: #22c55e; font-weight: 500; }
.hours-table .today { background: rgba(37,99,235,0.05); }

.whatsapp-float { position: fixed; bottom: 24px; right: 24px; z-index: 9999; width: 56px; height: 56px; background: #25D366; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(37,211,102,0.4); color: white; text-decoration: none; animation: whatsappPulse 2s infinite; transition: transform 0.3s; }
.whatsapp-float:hover { transform: scale(1.1); }
.whatsapp-float svg { width: 28px; height: 28px; fill: white; }
@keyframes whatsappPulse { 0% { box-shadow: 0 4px 16px rgba(37,211,102,0.4); } 50% { box-shadow: 0 4px 24px rgba(37,211,102,0.7); } 100% { box-shadow: 0 4px 16px rgba(37,211,102,0.4); } }

.sticky-cta { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9998; background: white; padding: 0.75rem 1rem; box-shadow: 0 -4px 16px rgba(0,0,0,0.1); }
.sticky-cta .cta-row { display: flex; gap: 0.75rem; }
.sticky-cta .cta-row a { flex: 1; padding: 0.75rem; border-radius: 8px; text-align: center; text-decoration: none; font-weight: 600; font-size: 0.95rem; }
.sticky-cta .cta-call { background: var(--primary, #2563eb); color: white; }
.sticky-cta .cta-whatsapp { background: #25D366; color: white; }
@media (max-width: 768px) { .sticky-cta { display: block; } body { padding-bottom: 72px; } }

.testimonials-track { display: flex; gap: 1.5rem; overflow-x: auto; scroll-snap-type: x mandatory; padding: 1rem 0; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.testimonials-track::-webkit-scrollbar { display: none; }
.testimonial-slide { min-width: 320px; flex-shrink: 0; scroll-snap-align: start; background: var(--surface, white); padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.testimonial-slide .text { font-style: italic; line-height: 1.7; margin-bottom: 1rem; color: var(--text-muted, #6b7280); }
.testimonial-slide .author { font-weight: 600; color: var(--text, #1f2937); }
.testimonial-slide .rating { color: #f59e0b; font-size: 0.85rem; }
.testimonial-slide .date { color: var(--text-muted, #94a3b8); font-size: 0.8rem; }
.testimonials-auto { overflow: hidden; }
.testimonials-auto .track-inner { display: flex; animation: scrollTestimonials 30s linear infinite; }
.testimonials-auto .track-inner:hover { animation-play-state: paused; }
@keyframes scrollTestimonials { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 2rem; text-align: center; }
.stat-item .stat-icon { font-size: 2rem; margin-bottom: 0.5rem; }
.stat-item .stat-number { font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, var(--primary, #2563eb), var(--accent, #f59e0b)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.stat-item .stat-label { font-size: 0.9rem; color: var(--text-muted, #6b7280); margin-top: 0.25rem; }

.trust-bar { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; margin: 2rem 0; }
.trust-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--surface, white); border-radius: 50px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); font-size: 0.85rem; color: var(--text-muted, #6b7280); }
.trust-badge .trust-icon { font-size: 1.2rem; }

.contact-map-container { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
.contact-details { display: flex; flex-direction: column; gap: 1rem; }
.contact-detail-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--surface, white); border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.contact-detail-card .icon { font-size: 1.5rem; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: var(--bg, #f8fafc); border-radius: 10px; }
.contact-detail-card .info { font-size: 0.9rem; }
.contact-detail-card .info strong { display: block; font-size: 0.8rem; color: var(--text-muted, #6b7280); margin-bottom: 0.2rem; }
.contact-detail-card .info a { color: var(--primary, #2563eb); text-decoration: none; }
.contact-map { border-radius: 12px; overflow: hidden; height: 300px; }
.contact-map iframe { width: 100%; height: 100%; border: none; }
@media (max-width: 768px) { .contact-map-container { grid-template-columns: 1fr; } }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes fadeInRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

.hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; background: none; border: none; }
.hamburger span { display: block; width: 24px; height: 2px; background: var(--text, #1f2937); border-radius: 2px; transition: all 0.3s; }
.hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.hamburger.active span:nth-child(2) { opacity: 0; }
.hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
.mobile-menu { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; }
.mobile-menu.open { display: block; }
.mobile-menu-inner { background: white; width: 80%; max-width: 320px; height: 100%; padding: 2rem; box-shadow: 2px 0 16px rgba(0,0,0,0.1); }
.mobile-menu-inner a { display: block; padding: 1rem 0; color: var(--text, #1f2937); text-decoration: none; font-weight: 500; border-bottom: 1px solid var(--border, #e2e8f0); }
.mobile-menu-close { position: absolute; top: 1rem; right: 1rem; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; }
@media (max-width: 768px) { .hamburger { display: flex; } .nav-links { display: none !important; } }

.glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.06); }
`;
