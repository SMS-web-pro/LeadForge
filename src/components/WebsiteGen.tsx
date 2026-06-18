import { useState, useMemo, useRef, useEffect } from 'react';
import { Lead, ApiConfig, callLLM, callLLMForWebsite, generateWebsitePrompt, safeStr, proxyImg } from '../lib/supabase-store';
import { generateUltimateSite, generateUltimateSiteAsync } from '../lib/ultimateTemplate';
import { useWebsiteGenState, websiteGenState } from '../lib/websitegen-state';
import { supabase } from '../lib/supabase';

const getCssVar = (name: string, fallback: string) => {
  const val = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
  return val || fallback;
};

// Simple contrast helper (WCAG >= 4.5:1)
const contrastColor = (bg: string, fg: string) => {
  const luminance = (hex: string) => {
    const rgb = hex.replace('#', '').match(/.{2}/g)!.map(v => parseInt(v, 16) / 255);
    const a = rgb.map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };
  const bgLum = luminance(bg);
  const fgLum = luminance(fg);
  const contrast = (Math.max(bgLum, fgLum) + 0.05) / (Math.min(bgLum, fgLum) + 0.05);
  // FIX: Si contraste insuffisant, renvoyer du noir sur fond clair et du blanc sur fond sombre
  if (contrast < 4.5) {
    return bgLum > 0.5 ? '#1C1B18' : '#FFFFFF';
  }
  return fg;
};

// 🎨 SYSTÈME DE COULEURS PROFESSIONNEL (RÈGLE 60/30/10)
const C = {
  // 60% - Couleurs claires (fond)
  bg: getCssVar('bg', '#F7F6F2'),      // Blanc cassé
  surface: getCssVar('surface', '#FFFFFF'),   // Blanc pur
  surface2: getCssVar('surface2', '#F2F1EC'), // Gris très clair
  
  // 30% - Couleurs secondaires (texte, footer)
  tx: getCssVar('text', '#1C1B18'),       // Gris foncé principal
  tx2: getCssVar('text2', '#4A4943'),     // Gris moyen
  tx3: getCssVar('text3', '#6B6960'),     // Gris clair
  border: getCssVar('border', '#E4E2DA'),   // Gris très clair
  
  // 10% - Couleurs d'accentuation (CTA, icônes)
  accent: getCssVar('primary', '#D4500A'),   // Orange LeadForge (confiance)
  accent2: getCssVar('secondary', '#F0E8DF'), // Beige clair
  
  // Couleurs sémantiques (statut, feedback)
  green: getCssVar('success', '#1A7A4A'),   // Vert (succès, validé)
  blue: getCssVar('info', '#1A4FA0'),       // Bleu (information)
  amber: getCssVar('warning', '#B45309'),    // Ambre (attention)
  red: getCssVar('error', '#C0392B'),        // Rouge (erreur, urgence)
};

interface Props {
  leads: Lead[];
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  apiConfig: ApiConfig;
  loadLeads: () => Promise<void>; // Ajout de loadLeads
}

interface ChatMessage { role: 'user' | 'assistant'; text: string; }

const SECTOR_PALETTES: Record<string, { p: string; p2: string; dk: string; lt: string; font: string }> = {
  restaurant: { p: '#E8590C', p2: '#FB923C', dk: '#1c1917', lt: '#FFF7ED', font: 'Playfair Display' },
  coiffeur: { p: '#7C3AED', p2: '#A78BFA', dk: '#1e1040', lt: '#F5F3FF', font: 'Cormorant Garamond' },
  salon: { p: '#DB2777', p2: '#F472B6', dk: '#2d0a20', lt: '#FDF2F8', font: 'Cormorant Garamond' },
  spa: { p: '#0D9488', p2: '#2DD4BF', dk: '#042f2e', lt: '#F0FDFA', font: 'Tenor Sans' },
  médecin: { p: '#2563EB', p2: '#60A5FA', dk: '#172554', lt: '#EFF6FF', font: 'Inter' },
  dentiste: { p: '#0891B2', p2: '#22D3EE', dk: '#0c4a6e', lt: '#ECFEFF', font: 'Inter' },
  avocat: { p: '#1e3a5f', p2: '#3b82f6', dk: '#0f172a', lt: '#F1F5F9', font: 'Libre Baskerville' },
  hôtel: { p: '#B45309', p2: '#F59E0B', dk: '#1c1917', lt: '#FFFBEB', font: 'Cormorant Garamond' },
  default: { p: '#D4500A', p2: '#F97316', dk: '#1c1917', lt: '#FFF7ED', font: 'Plus Jakarta Sans' },
};

function getSectorPalette(sector: string) {
  const s = (sector || '').toLowerCase();
  for (const [k, v] of Object.entries(SECTOR_PALETTES)) { if (s.includes(k)) return v; }
  return SECTOR_PALETTES.default;
}

export default function WebsiteGen({ leads, updateLead, apiConfig, loadLeads }: Props) {
  // Utiliser l'état local de processing pour WebsiteGen
  const { isProcessing, isPaused, progress, startProcessing, updateProgress, stopProcessing, pauseProcessing, resumeProcessing } = useWebsiteGenState();
  
  const [batchDelay, setBatchDelay] = useState(8000);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showEditor, setShowEditor] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const hasLLM = !!(apiConfig.groqKey || apiConfig.geminiKey || apiConfig.nvidiaKey || apiConfig.openrouterKey);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Calculer les listes sans dépendre de refreshKey pour éviter les boucles
  const enriched = useMemo(() => leads.filter(l => l.score > 0 && !l.siteGenerated), [leads]);
  const generated = useMemo(() => leads.filter(l => l.siteGenerated), [leads]);
  const previewLead = useMemo(() => leads.find(l => l.id === previewId) || null, [leads, previewId]);

  // Référence mutante pour que la boucle asynchrone voie les nouveaux leads !
  const leadsRef = useRef(leads);
  useEffect(() => {
    leadsRef.current = leads;
  }, [leads]);

  // Debug pour comprendre pourquoi la génération ne marche pas
  console.log('🔍 WebsiteGen Debug:');
  console.log('🔍 Total leads:', leads.length);
  console.log('🔍 Leads with score > 0:', leads.filter(l => l.score > 0).length);
  console.log('🔍 Leads not generated:', leads.filter(l => !l.siteGenerated).length);
  console.log('🔍 Enriched (score > 0 && !siteGenerated):', enriched.length);
  console.log('🔍 Generated:', generated.length);
  console.log('🔍 Has LLM:', hasLLM);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, chatLoading]);

  // PROPOSITION 4: Stabilisation Lifecycle
  // Cleanup retiré temporairement pour éviter l'interruption des générations en React Strict Mode
  useEffect(() => {
    return () => {
      console.log('🛑 WebsiteGen unmounted.');
      // stopProcessing() retiré car causait l'arrêt immédiat lors des re-renders !
    }
  }, []);

  // ── SHORTER, MORE EFFECTIVE AI PROMPT ──
  const buildShortPrompt = (lead: Lead, styleHint?: string): { prompt: string; system: string } => {
    const pal = getSectorPalette(lead.sector);
    const n = safeStr(lead.name);
    const sector = safeStr(lead.sector) || 'Professionnel';
    const city = safeStr(lead.city);
    const ph = safeStr(lead.phone);
    const em = safeStr(lead.email);
    const addr = safeStr(lead.address);
    const wa = ph.replace(/[^0-9+]/g, '');
    const hrs = safeStr(lead.hours || lead.serperHours);
    const rating = lead.googleRating;
    const reviews = lead.googleReviews;

    // ── IMAGES RÉELLES DU LEAD UNIQUEMENT (pour prompt IA) ──
    // Les images Pexels sont gérées dynamiquement par generateUltimateSiteAsync
    const BLOCKED_KEYWORDS = ['food', 'fruit', 'legume', 'carrot', 'salmon', 'kitchen', 'cooking'];
    const allImgs = [...(lead.images || []), ...(lead.websiteImages || [])]
      .filter(img => {
        if (!img || typeof img !== 'string') return false;
        if (!img.startsWith('https://')) return false;
        const low = img.toLowerCase();
        if (BLOCKED_KEYWORDS.some(kw => low.includes(kw))) return false;
        return true;
      }).slice(0, 6);

    const revTexts = (lead.googleReviewsData || []).filter(r => r && safeStr(r.text).length > 5).slice(0, 4)
      .map(r => `"${safeStr(r.text)}" — ${safeStr(r.author)} (${r.rating}★)`).join('\n');

    const styles = ['elegant classic with full-screen hero overlay', 'split-screen modern with side-by-side hero', 'dark bold premium with dark background and neon accents', 'minimal zen with maximum whitespace and centered text', 'colorful modern with rounded corners and floating cards', 'magazine editorial with asymmetric grid layout'];

    const system = `Tu es un expert en développement web et design UI/UX. Crée des sites web MODERNES, PROFESSIONNELS et UNIQUES.

PRINCIPES:
- Design épuré et moderne
- Structure HTML5 sémantique
- CSS responsive et animations fluides
- Contenu personnalisé selon le secteur
- Performance optimisée

RÈGLES STRICTES:
- JAMAIS de vidéos ou iframes
- JAMAIS de contenu externe (Pappers, etc.)
- UNiquement HTML/CSS/JavaScript vanilla
- Images statiques uniquement
- Structure complète avec nav, sections, footer

Directives:
- Utiliser les couleurs et polices fournies
- Intégrer les images harmonieusement
- Créer un design unique pour chaque entreprise
- Assurer une parfaite responsivité
- HTML valide et bien structuré

Retourne UNIQUEMENT le code HTML complet, sans markdown.`;

    const prompt = `Crée un site web PROFESSIONNEL pour "${n}" (${sector} à ${city || 'France'}).

STYLE: Design moderne, épuré et unique
PALETTE: ${pal.p} (primaire), ${pal.p2} (secondaire), ${pal.dk} (sombre), ${pal.lt} (clair)
POLICES: titres=${pal.font}, corps=Plus Jakarta Sans

INFOS CLIENT:
- Entreprise: ${n}
- Secteur: ${sector} 
- Localisation: ${city || 'France'}, ${addr || ''}
- Contact: ${ph || 'Non renseigné'}, ${em || 'Non renseigné'}
- Rating: ${rating > 0 ? rating + '/5 (' + reviews + ' avis)' : 'Non noté'}
${revTexts ? '\nAVIS CLIENTS:\n' + revTexts : ''}

IMAGES OBLIGATOIRES (UTILISER EXACTEMENT CES URLS, AUCUNE AUTRE IMAGE AUTORISÉE):
${allImgs.slice(0, 6).map((u, i) => `${i + 1}. ${u}`).join('\n')}

⚠️ RÈGLE ABSOLUE : Tu dois utiliser UNIQUEMENT les 6 images ci-dessus. Tu ne dois PAS chercher d'autres images sur internet ou utiliser des images de substitution comme des fruits, des légumes, ou des photos sans rapport avec le métier. Si le secteur est "plombier", utilise uniquement des images de plomberie.

SECTIONS OBLIGATOIRES:
1. Hero avec titre, sous-titre, boutons CTA
2. Navigation fixe responsive
3. Services (6-8 cartes)
4. Portfolio/Galerie
5. Témoignages
6. Contact avec formulaire
7. Footer

EXIGENCES:
- Design unique et professionnel
- 100% responsive
- Animations fluides
- HTML sémantique
- Min 5000 caractères
- PAS DE VIDÉOS, PAS D'IFRAMES
- UNIQUEMENT HTML/CSS/JS VANILLA

Retourne UNIQUEMENT le HTML complet.`;

    return { prompt, system };
  };

  const extractHtml = (response: string): string | null => {
    if (!response) return null;
    let html = response.replace(/```html?\s*/gi, '').replace(/```\s*/g, '').trim();
    
    // VALIDATIONS STRICTES
    const invalidPatterns = [
      /<video/i,
      /<iframe.*youtube/i,
      /<iframe.*vimeo/i,
      /pappers/i,
      /<script.*src.*video/i,
      /data:video/i,
      /\.mp4/i,
      /\.webm/i,
      /\.avi/i
    ];
    
    // Rejeter si contenu invalide détecté
    for (const pattern of invalidPatterns) {
      if (pattern.test(html)) {
        // Log uniquement en développement
        if (process.env.NODE_ENV === 'development') {
          console.warn('Contenu invalide détecté, rejet du HTML');
        }
        return null;
      }
    }
    
    // Doit contenir les éléments de base d'un site professionnel
    const requiredElements = [
      /<head/i,
      /<body/i,
      /<nav/i,
      /<section/i,
      /<footer/i
    ];
    
    const hasRequiredElements = requiredElements.every(pattern => pattern.test(html));
    if (!hasRequiredElements) {
      // Log uniquement en développement
      if (process.env.NODE_ENV === 'development') {
        console.warn('Structure HTML incomplète');
      }
      return null;
    }
    
    const doctypeMatch = html.match(/<!DOCTYPE\s+html[\s\S]*<\/html>/i);
    if (doctypeMatch) return doctypeMatch[0];
    const htmlMatch = html.match(/<html[\s\S]*<\/html>/i);
    if (htmlMatch) return `<!DOCTYPE html>\n${htmlMatch[0]}`;
    if (html.startsWith('<!DOCTYPE') || html.startsWith('<html')) {
      if (!html.includes('</html>')) html += '\n</html>';
      return html;
    }
    return null;
  };

  const validateHtml = (html: string): boolean => {
    if (!html || html.length < 3000) return false;
    const checks = [
      html.includes('<head'), 
      html.includes('<body'), 
      html.includes('<style'), 
      html.includes('</html>'),
      html.includes('section') || html.includes('main'),
      html.includes('nav') || html.includes('header')
    ];
    return checks.filter(Boolean).length >= 3;
  };

  // ── FORCED FALLBACK IF AI GENERATES BAD CONTENT ──
  const shouldForceFallback = (html: string | null): boolean => {
    if (!html) return true;
    
    // Force fallback si contenu suspect
    const suspiciousPatterns = [
      /<video/i,
      /<iframe/i,
      /pappers/i,
      /data:video/i,
      /youtube\.com/i,
      /vimeo\.com/i,
      /\.mp4/i,
      /\.webm/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(html));
  };

  // ── GENERATE CONTENT FOR FALLBACK TEMPLATE ──
  const generateContent = async (lead: Lead) => {
    type SC = {
      heroTitle: string; heroSubtitle: string; aboutText: string;
      services: Array<{ name: string; description: string; icon?: string }>;
      cta: string; testimonials: Array<{ author: string; text: string; rating: number; date: string }>;
      galleryTitle?: string; aboutTitle?: string; servicesTitle?: string; contactTitle?: string;
      whyChooseUs?: string[];
      // 🎨 NOUVEAUX CHAMPS POUR VARIATIONS
      heroStyle?: string; layoutStyle?: string; colorScheme?: string; fontStyle?: string;
    };

    const sector = (lead.sector || '').toLowerCase();
    const sectorServices: Record<string, string[]> = {
      restaurant: ['Cuisine gastronomique', 'Service traiteur', 'Événements privés', 'Menu dégustation', 'Vins et boissons', 'Brunch dominical'],
      coiffeur: ['Coupe moderne', 'Coloration professionnelle', 'Soin capillaire', 'Extension cheveux', 'Coiffure homme', 'Soins barbe'],
      plomberie: ['Dépannage urgence', 'Installation sanitaire', 'Chauffage', 'Plomberie générale', 'Diagnostic fuite', 'Rénovation salle de bain'],
      garage: ['Diagnostic moteur', 'Révision complète', 'Pneumatique', 'Carrosserie', 'Vidange', 'Contrôle technique'],
      hôtel: ['Chambres premium', 'Service petit-déjeuner', 'Salle de réunion', 'Navette aéroport', 'Concierge', 'Restaurant gastronomique'],
      default: ['Consultation', 'Service standard', 'Solution premium', 'Support client', 'Maintenance', 'Formation']
    };

    const getServices = () => {
      for (const [key, services] of Object.entries(sectorServices)) {
        if (sector.includes(key)) return services;
      }
      return sectorServices.default;
    };

    // 🎯 VARIATIONS DE CONTENU BASÉES SUR LE PROSPECT
    const seed = lead.name + (lead.city || '') + (lead.sector || '');
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const heroStyles = [
      'hero-split-screen', 'hero-fullscreen-overlay', 'hero-minimal-center', 
      'hero-bold-left', 'hero-gradient-right', 'hero-image-background'
    ];
    const layoutStyles = [
      'layout-modern-grid', 'layout-classic-centered', 'layout-asymmetric',
      'layout-magazine', 'layout-cards', 'layout-minimal'
    ];
    
    const content: SC = {
      heroTitle: lead.name,
      heroSubtitle: lead.description || `Artisan ${lead.sector || 'professionnel'} qualifié à ${lead.city || 'votre région'}. Intervention rapide et travail garanti.`,
      aboutText: lead.description || `${lead.name} est votre ${lead.sector || 'partenaire professionnel'} de confiance${lead.city ? ` à ${lead.city}` : ''}. Plus de 15 ans d'expérience dans le secteur.`,
      services: getServices().map((name, i) => ({ 
        name, 
        description: `Intervention ${name.toLowerCase()} professionnelle et rapide.`,
        icon: ['⚡', '🔧', '🏆', '💎', '🛡️', '📞'][i] 
      })),
      cta: 'Appelez maintenant',
      testimonials: (lead.googleReviewsData || []).map(r => ({ author: safeStr(r.author), text: safeStr(r.text), rating: r.rating || 5, date: safeStr(r.date) })),
      galleryTitle: 'Nos Travaux',
      aboutTitle: 'Qui sommes-nous',
      servicesTitle: 'Nos Services',
      contactTitle: 'Contact',
      whyChooseUs: [
        'Artisan qualifié et expérimenté',
        'Devis gratuit avant intervention',
        'Intervention sous 24h',
        'Garantie de satisfaction'
      ],
      // 🎨 VARIATIONS UNIQUES
      heroStyle: heroStyles[hash % heroStyles.length],
      layoutStyle: layoutStyles[(hash + 1) % layoutStyles.length],
      colorScheme: `scheme-${(hash % 8) + 1}`,
      fontStyle: `font-${(hash % 6) + 1}`
    };

    if (hasLLM) {
      try {
        const basePrompt = lead.generatedPrompt || generateWebsitePrompt(lead);
        const prompt = `Génère du contenu RICHE et SPÉCIFIQUE pour "${lead.name}" (${lead.sector || 'professionnel'} à ${lead.city || 'France'}).

Contexte: ${basePrompt.substring(0, 1500)}

Retourne UNIQUEMENT du JSON avec ces champs:
- heroTitle: titre accrocheur avec le nom "${lead.name}" (max 8 mots)
- heroSubtitle: sous-titre 2-3 phrases captivantes
- aboutText: paragraphe narratif de 5+ phrases (pas corporate)
- servicesTitle: titre créatif pour la section services
- aboutTitle: titre créatif pour la section à propos
- services: array de 6 objets {name, description (2-3 phrases), icon (emoji)}
- whyChooseUs: array de 4 raisons spécifiques au secteur
- cta: texte du bouton CTA
Tout en français. Spécifique au secteur "${lead.sector || 'professionnel'}".`;

        const response = await callLLM(apiConfig, prompt, 'Copywriter web expert français. Retourne UNIQUEMENT du JSON valide sans markdown.');
        if (response) {
          const jsonStr = response.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
          const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            let cleanJsonStr = jsonMatch[0];
            // PROPOSITION 2: Réparateur JSON Intelligent (Self-Healing AI)
            cleanJsonStr = cleanJsonStr.replace(/,\s*([}\]])/g, '$1'); // Réparer les trailing commas
            cleanJsonStr = cleanJsonStr.replace(/[\x00-\x1F\x7F-\x9F]/g, ""); // Retirer les caractères de contrôle invisibles
            
            let data;
            try {
              data = JSON.parse(cleanJsonStr);
            } catch (parseError) {
              console.warn('⚠️ JSON Parse failed. Tentative de Self-Correction...', parseError);
              const repairPrompt = `Corrige ce JSON invalide pour qu'il soit parfaitement parsable. Ne renvoie QUE le JSON:\n${cleanJsonStr.substring(0, 1000)}`;
              const repairResponse = await callLLM(apiConfig, repairPrompt, 'Expert JSON. Renvoie UNIQUEMENT le JSON réparé.');
              const repairedMatch = (repairResponse || '').match(/\{[\s\S]*\}/);
              if (repairedMatch) {
                data = JSON.parse(repairedMatch[0].replace(/,\s*([}\]])/g, '$1').replace(/[\x00-\x1F\x7F-\x9F]/g, ""));
              } else {
                throw new Error('Échec de la réparation du JSON');
              }
            }

            if (data.heroTitle) content.heroTitle = safeStr(data.heroTitle);
            if (data.heroSubtitle) content.heroSubtitle = safeStr(data.heroSubtitle);
            if (data.aboutText) content.aboutText = safeStr(data.aboutText);
            if (data.servicesTitle) content.servicesTitle = safeStr(data.servicesTitle);
            if (data.aboutTitle) content.aboutTitle = safeStr(data.aboutTitle);
            if (data.cta) content.cta = safeStr(data.cta);
            if (Array.isArray(data.services) && data.services.length >= 3) {
              content.services = data.services.slice(0, 6).map((s: Record<string, unknown>) => ({
                name: safeStr(s.name) || 'Service', description: safeStr(s.description) || '', icon: safeStr(s.icon) || '✦',
              }));
            }
            if (Array.isArray(data.whyChooseUs)) content.whyChooseUs = data.whyChooseUs.map((w: unknown) => safeStr(w)).filter(Boolean);
          }
        }
      } catch (e) { console.error('💥 Erreur finale generateContent:', e); }
    }
    return content;
  };

  // ── GENERATE SITE — TEMPLATE PREMIUM PROFESSIONNEL ──
  const generateSite = async (lead: Lead): Promise<string> => {
    console.log(`🔧 generateSite called for: ${lead.name}`);
    updateProgress({ step: '📝 Génération du contenu...' });
    
    try {
      console.log(`🔧 Starting content generation for ${lead.name}`);
      // Contenu riche puis template premium (hero image, secteur, galerie, WhatsApp)
      const content = await generateContent(lead);
      console.log(`✅ Content generated for ${lead.name}`);
      
      updateProgress({ step: '🖼️ API Pexels + Storage...' });
      
      // Les images sont maintenant gérées par generateUltimateSiteAsync
      // PRIORITÉ 1: Images réelles du lead
      // PRIORITÉ 2: API Pexels dynamique → Supabase Storage
      
      updateProgress({ step: '🎨 Génération du site ULTIMATE...' });
      const html = await generateUltimateSiteAsync(lead, content);
      console.log(`✅ HTML generated for ${lead.name}`);
      
      updateProgress({ step: '☁️ Hébergement Cloud (Storage)...' });
      const fileName = `${lead.id}.html`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('websites')
        .upload(fileName, html, {
          contentType: 'text/html',
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw new Error(`Erreur d'hébergement: ${uploadError.message}`);
      }

      // Obtenir l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from('websites')
        .getPublicUrl(fileName);
        
      const siteUrl = publicUrlData.publicUrl;
      console.log(`✅ Site hébergé avec succès: ${siteUrl}`);
      
      const baseUrl = 'https://www.services-siteup.online';
      const cleanUrl = `${baseUrl}/api/sites/${lead.id}`;
      
      console.log(`🔧 Updating lead ${lead.id} in Supabase...`);
      // Mettre à jour le lead avec les données du site (sans gonfler la colonne siteHtml)
      await updateLead(lead.id, {
        siteGenerated: true, 
        siteHtml: '', // On vide siteHtml pour ne pas alourdir la DB
        siteUrl: cleanUrl,
        landingUrl: cleanUrl,
        stage: lead.stage === 'new' || lead.stage === 'enriched' ? 'site_generated' : lead.stage,
      });
      
      console.log(`✅ Site généré avec succès pour: ${lead.name}`);
      
      return html; // Retourner le code HTML
      
    } catch (e) {
      console.error(`❌ Erreur lors de la génération du site pour ${lead.name}:`, e);
      updateProgress({ step: '🔄 Fallback template...' });
      
      try {
        console.log(`🔄 Using fallback template for ${lead.name}`);
        const emergencyHtml = await generateUltimateSiteAsync(lead);
        updateProgress({ step: '☁️ Hébergement Cloud (Storage)...' });
        
        const fileName = `${lead.id}.html`;
        await supabase.storage.from('websites').upload(fileName, emergencyHtml, { contentType: 'text/html', cacheControl: '3600', upsert: true });
        const { data: publicUrlData } = supabase.storage.from('websites').getPublicUrl(fileName);
        const siteUrl = publicUrlData.publicUrl;
        
        return emergencyHtml; // Retourner le code HTML de fallback
        const baseUrl = 'https://www.services-siteup.online';
        const cleanUrl = `${baseUrl}/api/sites/${lead.id}`;
        
        await updateLead(lead.id, {
          siteGenerated: true, 
          siteHtml: '',
          siteUrl: cleanUrl,
          landingUrl: cleanUrl,
          stage: lead.stage === 'new' || lead.stage === 'enriched' ? 'site_generated' : lead.stage,
        });
        
        console.log(`🔄 Site fallback généré pour: ${lead.name}`);
      } catch (fallbackError) {
        console.error(`❌ Erreur critique - même le fallback a échoué pour ${lead.name}:`, fallbackError);
        // Marquer quand même comme traité pour éviter les boucles infinies
        await updateLead(lead.id, {
          siteGenerated: true,
          stage: 'site_generated',
        });
      }
    }
    
    // Retour par défaut en cas d'erreur
    return await generateUltimateSiteAsync(lead);
  };

  // ── EMERGENCY TEMPLATE (100% FOOLPROOF) ──
  const generateEmergencySite = (lead: Lead): string => {
    const n = safeStr(lead.name);
    const sec = safeStr(lead.sector) || 'Professionnel';
    const city = safeStr(lead.city);
    const ph = safeStr(lead.phone);
    const em = safeStr(lead.email);
    const addr = safeStr(lead.address);
    const desc = safeStr(lead.description) || `Professionnel ${sec} de confiance${city ? ' à ' + city : ''}.`;
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${n} - ${sec}${city ? ' à ' + city : ''}</title>
    <meta name="description" content="${desc.substring(0, 160)}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; color: #333; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; text-align: center; }
        .hero h1 { font-size: 3rem; font-weight: 700; margin-bottom: 20px; }
        .hero p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
        .btn-primary { background: #ff6b6b; border: none; padding: 15px 30px; border-radius: 50px; font-weight: 600; text-decoration: none; display: inline-block; transition: all 0.3s; }
        .btn-primary:hover { background: #ff5252; transform: translateY(-2px); }
        .section { padding: 80px 0; }
        .info-card { background: #f8f9fa; border-radius: 15px; padding: 30px; margin: 20px 0; border: 1px solid #e9ecef; }
        .contact-info { background: #ffffff; border-radius: 15px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .footer { background: #2d3436; color: white; padding: 40px 0; text-align: center; }
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <h1>${n}</h1>
            <p>${desc}</p>
            <a href="#contact" class="btn-primary">Contactez-nous</a>
        </div>
    </section>

    <!-- About Section -->
    <section class="section">
        <div class="container">
            <div class="row">
                <div class="col-lg-6">
                    <div class="info-card">
                        <h2>Notre Expertise</h2>
                        <p>${sec} professionnel avec années d'expérience${city ? ' à ' + city : ''}. Nous garantissons un service de qualité.</p>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="info-card">
                        <h2>Nos Services</h2>
                        <ul>
                            <li>Service professionnel</li>
                            <li>Intervention rapide</li>
                            <li>Devis gratuit</li>
                            <li>Garantie satisfaction</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="section" id="contact">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="contact-info">
                        <h2 class="text-center mb-4">Contactez-nous</h2>
                        <div class="row">
                            ${ph ? `<div class="col-md-6 mb-3"><strong>Téléphone:</strong><br><a href="tel:${ph}">${ph}</a></div>` : ''}
                            ${em ? `<div class="col-md-6 mb-3"><strong>Email:</strong><br><a href="mailto:${em}">${em}</a></div>` : ''}
                            ${addr ? `<div class="col-12 mb-3"><strong>Adresse:</strong><br>${addr}</div>` : ''}
                        </div>
                        <div class="text-center mt-4">
                            <a href="tel:${ph || '#'}" class="btn-primary">Appeler maintenant</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${n}. Tous droits réservés.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  };

  const generateBatch = async () => {
    console.log('🚀 generateBatch called!');
    console.log('🚀 enriched.length:', enriched.length);
    console.log('🚀 isProcessing:', isProcessing);
    
    if (enriched.length === 0) {
      console.log('❌ No enriched leads to process');
      return;
    }
    
    console.log('✅ Starting batch generation...');
    startProcessing('website-generation', 'websitegen-batch');
    
    let processedCount = 0;
    const processedLeadIds = new Set<string>();
    let noNewLeadsCount = 0; // Compteur pour éviter les boucles infinies
    
    try {
      // Boucle intelligente avec détection robuste
      while (noNewLeadsCount < 3) { // Max 3 vérifications sans nouveaux leads
        // Attendre un peu pour laisser le state se mettre à jour
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Recharger les données depuis Supabase
        console.log('🔄 Checking for new leads...');
        await loadLeads();
        
        // Attendre encore un peu pour la synchronisation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Filtrer les leads à traiter en utilisant leadsRef.current (données fraîches non gelées !)
        const currentLeads = leadsRef.current.filter(l => l.score > 0 && !l.siteGenerated);
        const newLeadsToProcess = currentLeads.filter(l => !processedLeadIds.has(l.id));
        
        console.log(`📊 Status: Total leads=${leadsRef.current.length}, Score>0=${leadsRef.current.filter(l => l.score > 0).length}, Enriched=${currentLeads.length}, New to process=${newLeadsToProcess.length}`);
        console.log(`📋 Processed IDs: ${Array.from(processedLeadIds).slice(0, 3)}...`);
        console.log(`🔄 No new leads count: ${noNewLeadsCount}/3`);
        
        if (newLeadsToProcess.length === 0) {
          noNewLeadsCount++;
          console.log(`⏱️ No new leads found (${noNewLeadsCount}/3), waiting 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        } else {
          noNewLeadsCount = 0; // Reset counter si on trouve des leads
        }
        
        // Traiter les nouveaux leads
        for (const currentLead of newLeadsToProcess) {
          if (!websiteGenState.getState().isProcessing) {
            console.log('⏹️ Processing stopped, exiting loop');
            break;
          }
          
          processedLeadIds.add(currentLead.id);
          processedCount++;
          
          console.log(`🔄 Processing lead ${processedCount}: ${currentLead.name}`);
          
          // Vérifier si la génération est en pause dynamiquement !
          while (websiteGenState.getState().isPaused) {
            console.log('⏸️ Generation paused, waiting...');
            updateProgress({ step: '⏸️ En pause', current: processedCount, total: processedLeadIds.size, name: currentLead.name });
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!websiteGenState.getState().isProcessing) {
              console.log('⏹️ Processing stopped during pause');
              return;
            }
          }
          
          updateProgress({ 
            current: processedCount, 
            total: processedLeadIds.size,
            name: currentLead.name, 
            step: '🤖 Génération...' 
          });
          
          try {
            // Re-vérifier l'état (Stop / Cancel) juste avant de générer
            if (!websiteGenState.getState().isProcessing) return;
            
            await generateSite(currentLead);
            console.log(`✅ Lead ${currentLead.name} traité avec succès`);
            
            // Recharger pour voir le déplacement de la table en direct
            await loadLeads();
            
          } catch (error) {
            console.error(`❌ Erreur lors du traitement de ${currentLead.name}:`, error);
          }
          
          // Délai réactif entre les sites : permet l'arrêt instantané via bouton !
          console.log(`⏱️ Waiting ${batchDelay}ms before next lead...`);
          let waited = 0;
          while (waited < batchDelay) {
            if (!websiteGenState.getState().isProcessing) {
              console.log('⏹️ Processing stopped during delay interval');
              return;
            }
            await new Promise(r => setTimeout(r, 500));
            waited += 500;
          }
        }
      }
      
      console.log('✅ Maximum no-new-leads count reached or no more leads to process');
    } catch (error) {
      console.error('💥 Error in generateBatch loop:', error);
    } finally {
      console.log(`🏁 Batch generation completed. Total processed: ${processedCount}`);
      stopProcessing();
    }
  };

  // ── AI CHAT EDITOR ──
  // ── AI CHAT EDITOR ──
  const handleChatSend = async () => {
    if (!chatInput.trim() || !previewLead || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);

    try {
      // PROPOSITION 1 : Révolution du Chat (Architecture JSON-First pour la sécurité des LLMs)
      // Régénérer rapidement le contenu actuel pour utiliser comme base (ultra-rapide)
      updateProgress({ step: "🤖 Réflexion de l'IA..." });
      let currentContent = await generateContent(previewLead);

      const sysPrompt = "Tu es un expert JSON. L'utilisateur veut modifier le contenu de son site.\nVoici le contenu actuel (JSON):\n" + JSON.stringify(currentContent) + "\n\nINSTRUCTIONS:\n1. Modifie ce JSON pour intégrer cette demande: \"" + msg + "\"\n2. Garde EXACTEMENT la même structure et les mêmes clés.\n3. Retourne UNIQUEMENT le JSON modifié, rien d'autre.";
      
      const response = await callLLM(apiConfig, sysPrompt, "Expert data. Retourne UNIQUEMENT le JSON valide sans markdown.");
      
      let newContent = currentContent;
      if (response) {
        const jsonMatch = response.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim().match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let cleanStr = jsonMatch[0].replace(/,\s*([}\]])/g, '$1').replace(/[\x00-\x1F\x7F-\x9F]/g, "");
          try {
            newContent = { ...currentContent, ...JSON.parse(cleanStr) };
          } catch(e) {
            console.error('Chat AI parse error. Utilisation du contenu de base.', e);
          }
        }
      }

      // Re-générer instantanément le HTML localement. Le Design n'est jamais cassé !
      const newHtml = await generateUltimateSiteAsync(previewLead, newContent);
      await updateLead(previewLead.id, { siteHtml: newHtml });
      
      setChatMessages(prev => [...prev, { role: 'assistant', text: "✅ J'ai méticuleusement appliqué tes modifications: \"" + msg + "\". Mon design Premium est préservé ! ❤️" }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "❌ Erreur de réseau ou problème d'API." }]);
    }
    setChatLoading(false);
  };

  const openPreview = (id: string) => { setPreviewId(id); setChatMessages([]); setShowEditor(false); };

  // ── TÉLÉCHARGER LE CODE HTML DU SITE ──
  const downloadSiteCode = async (lead: Lead) => {
    try {
      startProcessing('download-code', 'websitegen-download');
      updateProgress({ current: 1, total: 1, name: lead.name, step: '📥 Génération du code HTML...' });
      
      // Récupérer le code HTML généré
      const htmlContent = await generateSite(lead);
      
      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([htmlContent as string], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${lead.name.replace(/[^a-zA-Z0-9]/g, '_')}_site.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      updateProgress({ step: '✅ Code téléchargé avec succès' });
    } catch (error) {
      console.error('Erreur lors du téléchargement du code:', error);
      updateProgress({ step: '❌ Erreur lors du téléchargement' });
    } finally {
      stopProcessing();
    }
  };

  // ── CHANGER PALETTE DE COULEURS ──
  const changePalette = async () => {
    if (!previewLead) return;
    startProcessing('palette-change', 'websitegen-palette');
    updateProgress({ current: 1, total: 1, name: previewLead.name, step: '🎨 Changement de palette...' });
    
    try {
      const content = await generateContent(previewLead);
      const html = await generateUltimateSiteAsync(previewLead, content);
      
      const fileName = `${previewLead.id}.html`;
      await supabase.storage.from('websites').upload(fileName, html, { contentType: 'text/html', cacheControl: '3600', upsert: true });
      const { data: publicUrlData } = supabase.storage.from('websites').getPublicUrl(fileName);
      const siteUrl = publicUrlData.publicUrl;
      const baseUrl = 'https://www.services-siteup.online';
      const cleanUrl = `${baseUrl}/api/sites/${previewLead.id}`;
      
      updateLead(previewLead.id, { 
        siteHtml: '',
        siteUrl: cleanUrl,
        landingUrl: cleanUrl,
      });
      
      setTimeout(() => {
        setPreviewId(null);
        setTimeout(() => setPreviewId(previewLead.id), 100);
      }, 500);
    } catch (error) {
      console.error('Erreur lors du changement de palette:', error);
      updateProgress({ step: '❌ Erreur lors du changement de palette' });
    } finally {
      stopProcessing();
    }
  };

  return (
    <div className="animate-fade" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 28,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: C.bg,
        padding: '20px 0',
        borderBottom: `1px solid ${C.border}`
      }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: C.tx, marginBottom: 4 }}>Website Generator</h1>
          <p style={{ color: C.tx3, fontSize: 14 }}>
            Template premium (hero image, galerie, avis, WhatsApp) + contenu IA
            {hasLLM ? ' ✅ IA active' : ' — ⚠️ Ajoutez une clé LLM'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: C.tx3 }}>⏱ Délai entre sites :</span>
            {[2, 3, 5, 8].map(s => (
              <button key={s} onClick={() => setBatchDelay(s * 1000)} disabled={isProcessing} style={{
                padding: '4px 10px', borderRadius: 4, border: `1px solid ${batchDelay === s * 1000 ? C.blue : C.border}`,
                background: batchDelay === s * 1000 ? C.blue + '22' : C.surface,
                color: batchDelay === s * 1000 ? C.blue : C.tx2,
                fontSize: 12, fontWeight: batchDelay === s * 1000 ? 700 : 400,
                cursor: isProcessing ? 'default' : 'pointer',
              }}>{s}s</button>
            ))}
          </div>
          <button onClick={generateBatch} disabled={isProcessing || enriched.length === 0} style={{
            padding: '10px 20px', borderRadius: 6, border: 'none',
            background: isProcessing ? C.tx3 : C.blue, color: '#fff',
            fontWeight: 600, fontSize: 14, cursor: isProcessing ? 'default' : 'pointer',
          }}>
            {isProcessing ? `Génération ${progress.current}/${progress.total}...` : `🌐 Générer ${enriched.length} sites`}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Sites Générés', value: generated.length, color: C.green, icon: '✅' },
          { label: 'En Attente', value: enriched.length, color: C.amber, icon: '⏳' },
          { label: 'Avec IA', value: leads.filter(l => l.siteGenerated).length, color: C.blue, icon: '🤖' },
          { label: 'Total Leads', value: leads.length, color: C.accent, icon: '📊' },
        ].map((s, i) => (
          <div key={i} style={{
            background: C.surface, borderRadius: 8, padding: '20px 22px',
            borderLeft: `3px solid ${s.color}`, boxShadow: '0 1px 3px rgba(28,27,24,0.06)',
          }}>
            <div style={{ fontSize: 12, color: C.tx3, fontWeight: 500, marginBottom: 6 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.tx }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div style={{
        background: '#eff6ff', borderRadius: 8, padding: '14px 18px', marginBottom: 20,
        border: '1px solid #bfdbfe', borderLeft: `4px solid ${C.blue}`,
        fontSize: 13, color: '#1e40af', lineHeight: 1.6,
      }}>
        <strong>🎨 Site professionnel :</strong> Chaque site utilise le template premium (hero avec image, couleurs par secteur, galerie, témoignages Google, bouton WhatsApp, formulaire de contact). Le contenu (titres, services, à propos) est généré par l’IA quand une clé LLM est configurée. <strong>Éditeur IA</strong> intégré pour modifier le site après génération.
      </div>

      {/* Progress */}
      {isProcessing && (
        <div style={{ background: C.surface, borderRadius: 8, padding: '16px 20px', border: `1px solid ${C.border}`, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>🌐 {progress.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: C.tx3, fontFamily: "'DM Mono', monospace" }}>{progress.current}/{progress.total}</span>
              {/* Boutons Pause/Reprise */}
              <div style={{ display: 'flex', gap: 4 }}>
                {isPaused ? (
                  <button
                    onClick={resumeProcessing}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: 'none',
                      background: C.green,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Reprendre la génération"
                  >
                    ▶️ Reprendre
                  </button>
                ) : (
                  <button
                    onClick={pauseProcessing}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: 'none',
                      background: C.amber,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title="Mettre en pause la génération"
                  >
                    ⏸️ Pause
                  </button>
                )}
                <button
                  onClick={stopProcessing}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: 'none',
                    background: C.red,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title="Arrêter la génération"
                >
                  ⏹️ Arrêter
                </button>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: isPaused ? C.amber : C.blue, marginBottom: 8 }}>
            {isPaused ? '⏸️ En pause' : progress.step}
          </div>
          <div style={{ height: 6, borderRadius: 3, background: C.surface2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3, background: isPaused ? C.amber : `linear-gradient(90deg, ${C.blue}, ${C.accent})`,
              width: `${(progress.current / progress.total) * 100}%`, transition: 'width 500ms ease',
            }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Generated */}
        <div style={{ background: C.surface, borderRadius: 8, padding: '20px', border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: C.green }}>✅ Sites Générés ({generated.length})</h3>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {generated.map(l => (
              <div key={l.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px', borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {l.logo && <img src={l.logo} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: C.tx3, marginTop: 2 }}>{l.sector || 'Professionnel'} · {l.city || '—'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openPreview(l.id)} style={{
                    padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
                    background: C.surface, fontSize: 12, cursor: 'pointer', color: C.blue, fontWeight: 500,
                  }}>👁️ Voir</button>
                  <button onClick={() => {
                    startProcessing('single-regeneration', 'websitegen-single');
                    updateProgress({ current: 1, total: 1, name: l.name, step: '🔄 Régénération...' });
                    generateSite(l).then(() => {
                      stopProcessing();
                      // Forcer le rafraîchissement si c'est le lead en preview
                      if (previewId === l.id) {
                        setTimeout(() => {
                          setPreviewId(null);
                          setTimeout(() => setPreviewId(l.id), 100);
                        }, 500);
                      }
                    });
                  }} disabled={isProcessing} style={{
                    padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
                    background: isProcessing ? C.tx3 : C.surface, fontSize: 12, cursor: isProcessing ? 'default' : 'pointer', color: isProcessing ? C.tx2 : C.amber,
                    opacity: isProcessing ? 0.6 : 1,
                  }}>🔄</button>
                  <button onClick={() => {
                    window.open(l.siteUrl, '_blank');
                  }} style={{
                    padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.green}`,
                    background: '#f0fdf4', fontSize: 12, cursor: 'pointer', color: C.green,
                  }}>↓</button>
                </div>
              </div>
            ))}
            {generated.length === 0 && <p style={{ color: C.tx3, fontSize: 13, textAlign: 'center', padding: 20 }}>Aucun site généré</p>}
          </div>
        </div>

        {/* Pending */}
        <div style={{ background: C.surface, borderRadius: 8, padding: '20px', border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: C.amber }}>⏳ En Attente ({enriched.length})</h3>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {enriched.map(l => (
              <div key={l.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px', borderBottom: `1px solid ${C.border}`,
              }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: C.tx3, marginTop: 2 }}>Score: {l.score} — {l.sector || 'Secteur inconnu'}</div>
                </div>
                <button onClick={() => generateSite(l)} style={{
                  padding: '4px 12px', borderRadius: 4, border: 'none',
                  background: C.blue, color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
                }}>Générer</button>
              </div>
            ))}
            {enriched.length === 0 && <p style={{ color: C.tx3, fontSize: 13, textAlign: 'center', padding: 20 }}>Tous les leads enrichis ont un site</p>}
          </div>
        </div>
      </div>

      {/* ═══ PREVIEW MODAL ═══ */}
      {previewLead && (
        <>
          <div onClick={() => setPreviewId(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 99, backdropFilter: 'blur(4px)',
          }} />
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: C.surface, zIndex: 100,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          }}>
            {/* Top bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 20px', borderBottom: `1px solid ${C.border}`, background: C.surface2, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: '#ff5f57' }} />
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: '#febc2e' }} />
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: '#28c840' }} />
                </div>
                <div style={{
                  padding: '6px 16px', borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`,
                  fontSize: 12, color: C.tx3, fontFamily: "'DM Mono', monospace",
                }}>🔒 {previewLead.siteUrl}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => setPreviewMode('desktop')} style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  border: `1px solid ${previewMode === 'desktop' ? C.blue : C.border}`,
                  background: previewMode === 'desktop' ? '#dbeafe' : C.surface,
                  color: previewMode === 'desktop' ? C.blue : C.tx3,
                }}>🖥️</button>
                <button onClick={() => setPreviewMode('mobile')} style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  border: `1px solid ${previewMode === 'mobile' ? C.blue : C.border}`,
                  background: previewMode === 'mobile' ? '#dbeafe' : C.surface,
                  color: previewMode === 'mobile' ? C.blue : C.tx3,
                }}>📱</button>
                <div style={{ width: 1, height: 20, background: C.border }} />
                <button onClick={() => {
                  downloadSiteCode(previewLead);
                }} style={{
                  padding: '5px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  border: `1px solid ${C.green}`, background: '#f0fdf4', color: C.green, fontWeight: 500,
                }}>↓ Télécharger</button>
                <button onClick={() => {
                  window.open(previewLead.siteUrl, '_blank');
                }} style={{
                  padding: '5px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  border: `1px solid ${C.blue}`, background: '#dbeafe', color: C.blue, fontWeight: 500,
                }}>🌐 Ouvrir</button>
                <button onClick={() => setPreviewId(null)} style={{
                  width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`,
                  background: C.surface, fontSize: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <div style={{
                flex: 1, display: 'flex', justifyContent: 'center',
                background: '#e5e7eb', padding: previewMode === 'mobile' ? '20px' : '0',
              }}>
                <iframe
                  src={previewLead.siteUrl}
                  style={{
                    border: 'none', width: previewMode === 'mobile' ? 390 : '100%', height: '100%', background: '#fff',
                    ...(previewMode === 'mobile' ? { borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' } : {}),
                  }}
                  title="Preview"
                />
              </div>

              {/* AI Editor Panel */}
              {showEditor && (
                <div style={{
                  width: 380, borderLeft: `1px solid ${C.border}`, display: 'flex',
                  flexDirection: 'column', background: C.surface, flexShrink: 0,
                }}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, background: C.accent2 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.accent, marginBottom: 4 }}>✏️ Éditeur IA</div>
                    <div style={{ fontSize: 12, color: C.tx3, lineHeight: 1.5 }}>L&apos;IA régénère le site avec vos modifications.</div>
                  </div>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {['Change le titre du hero', 'Palette bleu et or', 'Ajoute plus de services', 'Redesign complet', 'Design plus luxueux', 'Style minimaliste'].map((s, i) => (
                      <button key={i} onClick={() => setChatInput(s)} style={{
                        fontSize: 11, padding: '4px 10px', borderRadius: 12,
                        border: `1px solid ${C.border}`, background: C.surface2, cursor: 'pointer', color: C.tx2,
                      }}>{s}</button>
                    ))}
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {chatMessages.length === 0 && (
                      <div style={{ textAlign: 'center', color: C.tx3, fontSize: 13, padding: '40px 20px' }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                        <strong>Éditeur IA</strong>
                        <p style={{ marginTop: 8, lineHeight: 1.6 }}>
                          Décrivez les modifications souhaitées.<br />
                          &quot;Change les couleurs en violet&quot;<br />
                          &quot;Refais le design entièrement&quot;
                        </p>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '88%', padding: '10px 14px', borderRadius: 14,
                        background: msg.role === 'user' ? `linear-gradient(135deg, ${C.accent}, ${C.amber})` : C.surface2,
                        color: msg.role === 'user' ? '#fff' : C.tx, fontSize: 13, lineHeight: 1.6,
                        borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
                        borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 14,
                      }}>{msg.text}</div>
                    ))}
                    {chatLoading && (
                      <div style={{ alignSelf: 'flex-start', padding: '10px 18px', borderRadius: 14, background: C.surface2, display: 'flex', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.tx3, animation: 'pulse 1.4s infinite' }} />
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.tx3, animation: 'pulse 1.4s infinite 0.2s' }} />
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.tx3, animation: 'pulse 1.4s infinite 0.4s' }} />
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleChatSend(); }}
                      placeholder="Décrivez votre modification..."
                      style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                    />
                    <button onClick={handleChatSend} disabled={chatLoading} style={{
                      width: 38, height: 38, borderRadius: '50%', border: 'none',
                      background: chatLoading ? C.tx3 : C.accent, color: '#fff',
                      fontSize: 16, cursor: chatLoading ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>➤</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
