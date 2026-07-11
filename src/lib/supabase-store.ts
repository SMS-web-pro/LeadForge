// ============================================================
// LeadForge AI — Supabase Store (Cloud persistence)
// ============================================================
import { logger } from './logger';
import { useState, useEffect, useCallback, useRef } from 'react';
import { leadsService, configService, templatesService, campaignsService, Database, supabase } from './supabase';
import { isImageBlocked } from './imageFilters';
import { apiErrorState, detectApiError } from './api-error-state';
import { emailValidationStore } from './email-validation-store';
import { enqueueLLMRequest } from './llm-queue';

// --- SAFE HELPERS (defined once, used everywhere) ---
export function safeStr(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.filter(x => typeof x === 'string').join(', ');
  return '';
}

export function safeNum(v: unknown): number {
  if (typeof v === 'number' && !isNaN(v)) return v;
  if (typeof v === 'string') { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
  return 0;
}

export function safeStrArr(v: unknown): string[] {
  if (!Array.isArray(v)) return typeof v === 'string' && v ? [v] : [];
  return v.map(item => safeStr(item)).filter(Boolean);
}

// --- TYPES ---
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  sector: string;
  city: string;
  address: string;
  website: string;
  googleMapsUrl: string;
  googleRating: number;
  googleReviews: number;
  description: string;
  hours: string;
  tags: string[];
  score: number;
  temperature: 'very_hot' | 'hot' | 'warm' | 'cold' | '';
  stage: 'new' | 'enriched' | 'site_generated' | 'email_sent' | 'interested' | 'converted' | 'lost';
  notes: string;
  images: string[];
  siteGenerated: boolean;
  siteUrl: string;
  siteHtml: string;
  landingUrl: string;
  emailSent: boolean;
  emailSentDate: string;
  emailOpened: boolean;
  emailClicked: boolean;
  siteClicked: boolean;
  paymentDepositClicked: boolean;
  paymentFinalClicked: boolean;
  devisClicked: boolean;
  invoiceDepositClicked: boolean;
  invoiceFinalClicked: boolean;
  lastContact: string;
  followUps: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  googleReviewsData: Array<{ author: string; rating: number; text: string; date: string }>;
  logo: string;
  websiteImages: string[];
  generatedPrompt: string;
  serperSnippets: string[];
  serperType: string;
  serperCid: string;
  serperHours: string;
  campaign: string;
  campaignDate: string;
  source: string;
  // Champs ajoutés pour le workflow Outreach 2026
  devis_url?: string;
  invoice_url?: string;
  admin_url?: string;
  admin_username?: string;
  admin_password?: string;
  documentation_url?: string;
  contactName?: string; // Ajouté pour personnalisation Outreach
  sentSteps: string[];
  emailInvalid?: boolean;
  emailInvalidReason?: string;
}

export type LlmProvider = 'groq' | 'gemini' | 'nvidia' | 'openrouter';

export interface ApiConfig {
  groqKey: string;
  openrouterKey: string;
  geminiKey: string;
  nvidiaKey: string;
  defaultLlm: LlmProvider;
  defaultModel: string;
  serperKey: string;
  unsplashKey: string;
  pexelsKey: string;
  // Gmail SMTP Configuration
  gmailSmtpHost: string;
  gmailSmtpPort: number;
  gmailSmtpUser: string;
  gmailSmtpPassword: string;
  gmailSmtpFromName: string;
  gmailSmtpFromEmail: string;
  gmailSmtpSecure: boolean;
  // Payment Configuration
  whopDepositLink: string; // Lien pour paiement 46$ (dépôt)
  whopFinalPaymentLink: string; // Lien pour paiement 100$ (paiement final)
  web3formsKey?: string; // Clé Web3Forms pour le formulaire de contact
}

export interface ApiStatus {
  [key: string]: 'untested' | 'testing' | 'active' | 'error';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: 'sale' | 'reminder';
}

export interface ScheduledEmail {
  id: string;
  lead_id: string;
  template_id: string;
  scheduled_for: string;
  status: 'pending' | 'sent' | 'sending' | 'error';
  error_message?: string;
}

// --- DEFAULTS ---
export const defaultApiConfig: ApiConfig = {
  groqKey: '', 
  openrouterKey: '',
  geminiKey: '',
  nvidiaKey: '',
  defaultLlm: 'groq' as LlmProvider,
  defaultModel: 'llama-3.1-8b-instant',
  serperKey: '',
  unsplashKey: '',
  pexelsKey: '',
  // Gmail SMTP defaults
  gmailSmtpHost: 'smtp.gmail.com',
  gmailSmtpPort: 587,
  gmailSmtpUser: '',
  gmailSmtpPassword: '',
  gmailSmtpFromName: '',
  gmailSmtpFromEmail: '',
  gmailSmtpSecure: true,
  // Payment defaults
  whopDepositLink: '',
  whopFinalPaymentLink: '',
  // Web3Forms contact form
  web3formsKey: '',
};

export const defaultEmailTemplates: EmailTemplate[] = [
  { 
    id: '1', 
    name: 'Restaurant - Premier contact', 
    subject: 'Un site web professionnel pour {name}',
    category: 'sale',
    htmlContent: '',
    textContent: 'Bonjour,\n\nJe me permets de vous contacter car j\'ai remarqué que {name} à {city} ne dispose pas encore d\'un site web professionnel.\n\nJ\'ai pris l\'initiative de créer une maquette de site web spécialement conçue pour votre restaurant. Vous pouvez la découvrir ici :\n\n{landingUrl}\n\nCe site inclut :\n- Menu en ligne avec photos\n- Réservation en ligne\n- Avis Google intégrés\n- Optimisé pour Google (SEO local)\n\nLe site est prêt à être mis en ligne pour seulement 499€. Si cela vous intéresse, n\'hésitez pas à me répondre.\n\nCordialement',
    variables: ['name', 'city', 'landingUrl']
  },
  { 
    id: '2', 
    name: 'Commerce - Premier contact', 
    subject: 'Votre boutique {name} mérite un site web moderne',
    category: 'sale',
    htmlContent: '',
    textContent: 'Bonjour,\n\nJe vous contacte car j\'ai vu que {name} à {city} n\'a pas de site web.\n\nJ\'ai créé un site web professionnel pour votre commerce :\n\n{landingUrl}\n\n- Catalogue produits\n- Horaires et localisation\n- Visible sur Google\n\nRépondez à cet email pour en discuter.\n\nCordialement',
    variables: ['name', 'city', 'landingUrl']
  },
  { 
    id: '3', 
    name: 'Générique - Premier contact', 
    subject: 'Un site web professionnel pour {name}',
    category: 'sale',
    htmlContent: '',
    textContent: 'Bonjour,\n\nJ\'ai remarqué que {name} à {city} ne dispose pas encore d\'un site web.\n\nJ\'ai créé un site web professionnel spécialement pour vous :\n\n{landingUrl}\n\n- Design moderne et professionnel\n- Optimisé pour mobile\n- Visible sur Google\n\nDécouvrez-le et n\'hésitez pas à me contacter.\n\nCordialement',
    variables: ['name', 'city', 'landingUrl']
  },
];

// --- MAPPING HELPERS ---
function mapSupabaseLeadToLead(supabaseLead: Database['public']['Tables']['leads']['Row'] | any): Lead {
  return {
    id: supabaseLead.id,
    name: supabaseLead.name || '',
    email: supabaseLead.email || '',
    phone: supabaseLead.phone || '',
    sector: supabaseLead.sector || '',
    // Utiliser les noms de colonnes corrects depuis Supabase avec fallback
    siteClicked: (supabaseLead as any).site_clicked || false,
    devisClicked: (supabaseLead as any).devis_clicked || false,
    city: supabaseLead.city || '',
    address: supabaseLead.address || '',
    website: supabaseLead.website || '',
    // NOUVEAUX CHAMPS D'ENRICHISSEMENT - Mappés depuis Supabase
    googleMapsUrl: supabaseLead.google_maps_url || '',
    googleRating: supabaseLead.google_rating || supabaseLead.rating || 0,
    googleReviews: supabaseLead.google_reviews || supabaseLead.reviews_count || 0,
    description: supabaseLead.description || '',
    hours: supabaseLead.serper_hours || '',
    tags: supabaseLead.tags || (supabaseLead.has_website ? [] : ['Sans site']),
    score: supabaseLead.score || 0,
    temperature: (supabaseLead.temperature || ((supabaseLead.score || 0) >= 8 ? 'very_hot' : (supabaseLead.score || 0) >= 6 ? 'hot' : (supabaseLead.score || 0) >= 4 ? 'warm' : (supabaseLead.score || 0) > 0 ? 'cold' : '')) as Lead['temperature'],
    stage: (supabaseLead.status || 'new') as Lead['stage'],
    notes: supabaseLead.notes || '',
    images: supabaseLead.images || [],
    siteGenerated: supabaseLead.site_generated || false,
    siteUrl: supabaseLead.site_url || '',
    siteHtml: (supabaseLead as Record<string, unknown>)['site_html'] as string || '',
    landingUrl: supabaseLead.landing_url || '',
    emailSent: supabaseLead.email_sent || false,
    emailSentDate: supabaseLead.email_sent_date || '',
    emailOpened: supabaseLead.email_opened || false,
    emailClicked: supabaseLead.email_clicked || false,
    paymentDepositClicked: supabaseLead.payment_deposit_clicked || false,
    paymentFinalClicked: supabaseLead.payment_final_clicked || false,
    invoiceDepositClicked: supabaseLead.invoice_deposit_clicked || false,
    invoiceFinalClicked: supabaseLead.invoice_final_clicked || false,
    lastContact: supabaseLead.last_contact || '',
    followUps: supabaseLead.follow_ups || 0,
    revenue: supabaseLead.revenue || 0,
    createdAt: supabaseLead.created_at,
    updatedAt: supabaseLead.updated_at,
    googleReviewsData: supabaseLead.google_reviews_data || [],
    logo: supabaseLead.logo || '',
    websiteImages: supabaseLead.website_images || [],
    generatedPrompt: supabaseLead.generated_prompt || '',
    serperSnippets: supabaseLead.serper_snippets || [],
    serperType: supabaseLead.serper_type || '',
    serperCid: supabaseLead.serper_cid || '',
    serperHours: supabaseLead.serper_hours || '',
    campaign: supabaseLead.campaign || '',
    campaignDate: supabaseLead.campaign_date || '',
    source: supabaseLead.source || '',
    sentSteps: supabaseLead.sent_steps || [],
    emailInvalid: emailValidationStore.isInvalid(supabaseLead.id),
    emailInvalidReason: emailValidationStore.getReason(supabaseLead.id),
  };
}

function mapLeadToSupabaseLead(lead: Lead): Database['public']['Tables']['leads']['Update'] | any {
  const data: any = {
    name: lead.name,
    rating: lead.googleRating || undefined,
    reviews_count: lead.googleReviews || undefined,
    has_website: !!lead.website,
    enriched: lead.stage !== 'new',
    score: lead.score,
    status: lead.stage,
    site_generated: lead.siteGenerated,
    site_clicked: lead.siteClicked,
    devis_clicked: lead.devisClicked,
    email_sent: lead.emailSent,
    email_opened: lead.emailOpened,
    email_clicked: lead.emailClicked,
    payment_deposit_clicked: lead.paymentDepositClicked,
    payment_final_clicked: lead.paymentFinalClicked,
    invoice_deposit_clicked: lead.invoiceDepositClicked,
    invoice_final_clicked: lead.invoiceFinalClicked,
    revenue: lead.revenue || 0,
  };

  // Ajouter les champs uniquement s'ils ont une valeur non-undefined et non-null
  if (lead.email) data.email = lead.email;
  if (lead.phone) data.phone = lead.phone;
  if (lead.sector) data.sector = lead.sector;
  if (lead.city) data.city = lead.city;
  if (lead.address) data.address = lead.address;
  if (lead.website) data.website = lead.website;
  if (lead.notes) data.notes = lead.notes;
  if (lead.siteUrl) data.site_url = lead.siteUrl;
  if (lead.landingUrl) data.landing_url = lead.landingUrl;
  if (lead.emailSentDate) data.email_sent_date = lead.emailSentDate;
  if (lead.lastContact) data.last_contact = lead.lastContact;
  if (lead.campaign) data.campaign = lead.campaign;
  if (lead.campaignDate) data.campaign_date = lead.campaignDate;
  if (lead.source) data.source = lead.source;

  // NOUVEAUX CHAMPS D'ENRICHISSEMENT - Vérifier qu'ils existent bien dans la base
  if (lead.googleRating !== undefined && lead.googleRating !== null) data.google_rating = lead.googleRating;
  if (lead.googleReviews !== undefined && lead.googleReviews !== null) data.google_reviews = lead.googleReviews;
  if (lead.googleMapsUrl) data.google_maps_url = lead.googleMapsUrl;
  if (lead.serperCid) data.serper_cid = lead.serperCid;
  if (lead.serperType) data.serper_type = lead.serperType;
  if (lead.serperHours) data.serper_hours = lead.serperHours;
  if (lead.serperSnippets && lead.serperSnippets.length > 0) data.serper_snippets = lead.serperSnippets;
  if (lead.sentSteps && lead.sentSteps.length > 0) data.sent_steps = lead.sentSteps;
  if (lead.description) data.description = lead.description;
  if (lead.logo) data.logo = lead.logo;
  if (lead.images && lead.images.length > 0) data.images = lead.images;
  if (lead.websiteImages && lead.websiteImages.length > 0) data.website_images = lead.websiteImages;
  if (lead.googleReviewsData && lead.googleReviewsData.length > 0) data.google_reviews_data = lead.googleReviewsData;
  if (lead.temperature) data.temperature = lead.temperature;
  if (lead.tags && lead.tags.length > 0) data.tags = lead.tags;
  if (lead.generatedPrompt) data.generated_prompt = lead.generatedPrompt;
  if (lead.siteHtml) data.site_html = lead.siteHtml;

  // Nettoyer les objets vides et undefined pour éviter les erreurs Supabase
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      // Garder les valeurs définies, les tableaux non vides, et les chaînes non vides
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      
      // Réactiver les champs enrichis - l'erreur 400 est résolue
      return true;
    })
  );

  logger.log('🧹 Cleaned data for Supabase:', cleanData);
  return cleanData;
}

// --- HOOKS ---
export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load leads from Supabase
  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { leads: supabaseLeads } = await leadsService.getAll();
      setLeads(supabaseLeads.map(mapSupabaseLeadToLead));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Souscription Realtime (Pour les clics et ouvertures qui viennent du serveur)
  useEffect(() => {
    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        logger.log('⚡ Changement Realtime détecté:', payload);
        loadLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadLeads]);

  // Écouter les événements de synchronisation locaux (EventBus)
  useEffect(() => {
    // Importer eventBus localement pour éviter les dépendances circulaires
    import('./events').then(({ eventBus, LeadForgeEvents }) => {
      const handleDataChange = () => {
        logger.log('useLeads: Événement reçu, rechargement des données...');
        setRefreshTrigger(prev => prev + 1);
        loadLeads();
      };

      // S'abonner aux événements
      eventBus.on(LeadForgeEvents.LEADS_CHANGED, handleDataChange);
      eventBus.on(LeadForgeEvents.LEAD_ADDED, handleDataChange);
      eventBus.on(LeadForgeEvents.LEAD_DELETED, handleDataChange);
      eventBus.on(LeadForgeEvents.DATA_REFRESH, handleDataChange);

      // Nettoyer les abonnements
      return () => {
        eventBus.off(LeadForgeEvents.LEADS_CHANGED, handleDataChange);
        eventBus.off(LeadForgeEvents.LEAD_ADDED, handleDataChange);
        eventBus.off(LeadForgeEvents.LEAD_DELETED, handleDataChange);
        eventBus.off(LeadForgeEvents.DATA_REFRESH, handleDataChange);
      };
    });
  }, [loadLeads]);

  const addLeads = useCallback(async (newLeads: Partial<Lead>[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const existingLeads = leads;
      const existingEmails = new Set(existingLeads.map(l => l.email.toLowerCase()));
      const existingPhones = new Set(existingLeads.map(l => l.phone));
      const toAdd: Database['public']['Tables']['leads']['Insert'][] = [];
      const duplicates: string[] = [];

      for (const nl of newLeads) {
        const email = (nl.email || '').toLowerCase().trim();
        const phone = (nl.phone || '').trim();
        if (email && existingEmails.has(email)) { duplicates.push(nl.name || email); continue; }
        if (phone && phone.length > 4 && existingPhones.has(phone)) { duplicates.push(nl.name || phone); continue; }

        const supabaseLead: Database['public']['Tables']['leads']['Insert'] = {
          name: safeStr(nl.name),
          email: email || undefined,
          phone: phone || undefined,
          sector: safeStr(nl.sector) || undefined,
          city: safeStr(nl.city) || undefined,
          address: safeStr(nl.address) || undefined,
          website: safeStr(nl.website) || undefined,
          rating: safeNum(nl.googleRating) || undefined,
          reviews_count: safeNum(nl.googleReviews) || undefined,
          has_website: !!safeStr(nl.website),
          enriched: false,
          score: 0,
          status: 'new',
          notes: safeStr(nl.notes) || undefined,
          site_generated: false,
          site_url: undefined,
          landing_url: undefined,
          email_sent: false,
          email_sent_date: undefined,
          email_opened: false,
          email_clicked: false,
          last_contact: undefined,
          campaign: safeStr(nl.campaign) || undefined,
          campaign_date: safeStr(nl.campaignDate) || undefined,
          source: safeStr(nl.source) || undefined,
        };

        if (email) existingEmails.add(email);
        if (phone && phone.length > 4) existingPhones.add(phone);
        toAdd.push(supabaseLead);
      }

      // Add to Supabase en lot pour de meilleures performances
      if (toAdd.length > 0) {
        const { error } = await supabase
          .from('leads')
          .insert(toAdd);
        
        if (error) throw error;
      }

      // Force reload leads to get the new data
      logger.log(`Added ${toAdd.length} leads, reloading...`);
      await loadLeads();
      
      if (duplicates.length > 0) {
        logger.warn('Duplicates skipped:', duplicates);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add leads');
    } finally {
      setLoading(false);
    }
  }, [leads, loadLeads]);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    logger.log('💾 updateLead called:', { id, updates });
    setLoading(true);
    setError(null);
    
    try {
      const currentLead = leads.find(l => l.id === id);
      if (!currentLead) {
        throw new Error(`Lead with id ${id} not found`);
      }
      
      logger.log('💾 Current lead found:', currentLead);
      
      const mergedLead = { ...currentLead, ...updates };
      logger.log('💾 Merged lead for Supabase:', mergedLead);
      
      const supabaseData = mapLeadToSupabaseLead(mergedLead);
      logger.log('💾 Supabase mapped data:', supabaseData);
      
      // Mettre à jour dans Supabase
      const updatedLead = await leadsService.update(id, supabaseData);
      logger.log('� Supabase update successful');
      
      // Mettre à jour le state local avec les données fraîches de Supabase
      setLeads(currentLeads => {
        const index = currentLeads.findIndex(l => l.id === id);
        if (index !== -1) {
          const updatedLeads = [...currentLeads];
          updatedLeads[index] = updatedLead;
          logger.log('� Local state updated via functional setLeads:', updatedLeads[index]);
          return updatedLeads;
        }
        return currentLeads;
      });
      
      // DIAGNOSTIC: Vérifier que les données sont bien dans Supabase
      setTimeout(async () => {
        try {
          logger.log('🔍 DIAGNOSTIC: Vérification des données dans Supabase...');
          const freshData = await leadsService.getById(id);
          logger.log('🔍 Données fraîches depuis Supabase:', freshData);
          logger.log('🔍 google_rating dans Supabase:', freshData?.google_rating);
          logger.log('🔍 google_maps_url dans Supabase:', freshData?.google_maps_url);
          logger.log('🔍 description dans Supabase:', freshData?.description);
          logger.log('🔍 logo dans Supabase:', freshData?.logo);
        } catch (err) {
          logger.error('🔍 Erreur lors de la vérification:', err);
        }
      }, 2000);
      
    } catch (err) {
      logger.error('💾 Update error:', err);
      
      // Ne pas bloquer l'interface utilisateur en cas d'erreur de base de données
      // Mettre à jour le state local même si la base de données échoue
      const currentLead = leads.find(l => l.id === id);
      if (currentLead) {
        const mergedLead = { ...currentLead, ...updates };
        setLeads(currentLeads => {
          const index = currentLeads.findIndex(l => l.id === id);
          if (index !== -1) {
            const updatedLeads = [...currentLeads];
            updatedLeads[index] = mergedLead;
            logger.log('💾 Local state updated despite DB error:', updatedLeads[index]);
            return updatedLeads;
          }
          return currentLeads;
        });
      }
      
      // Afficher l'erreur sans bloquer
      setError(err instanceof Error ? err.message : 'Failed to update lead');
    } finally {
      setLoading(false);
    }
  }, [leads, loadLeads]);

  const deleteLeads = useCallback(async (ids: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      await leadsService.deleteMany(ids);
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete leads');
    } finally {
      setLoading(false);
    }
  }, [loadLeads]);

  return { leads, loading, error, addLeads, updateLead, deleteLeads, loadLeads, refreshLeads: () => setRefreshTrigger(prev => prev + 1) };
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<{ name: string; date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const loadingRef = useRef(false); // Référence pour éviter les rechargements multiples

  const loadCampaigns = useCallback(async () => {
    // Éviter les rechargements multiples avec la référence
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const campaignsData = await leadsService.getCampaigns();
      setCampaigns(campaignsData);
      setInitialized(true);
      logger.log('useCampaigns: Campagnes chargées:', campaignsData.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
      setInitialized(true); // Marquer comme initialisé même en cas d'erreur
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // Pas de dépendances pour stabilité

  // Initial load
  useEffect(() => {
    if (!initialized) {
      loadCampaigns();
    }
  }, [loadCampaigns, initialized, refreshTrigger]);

  // Souscription Realtime (les campagnes dépendent des leads)
  useEffect(() => {
    const channel = supabase
      .channel('campaigns-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        logger.log('⚡ [Campaigns] Realtime change detected in leads:', payload);
        loadCampaigns();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCampaigns]);

  // Écouter les événements de synchronisation
  useEffect(() => {
    // Importer eventBus localement pour éviter les dépendances circulaires
    import('./events').then(({ eventBus, LeadForgeEvents }) => {
      const handleDataChange = () => {
        logger.log('useCampaigns: Événement reçu, rechargement des campagnes...');
        setInitialized(false); // Forcer le rechargement
        setRefreshTrigger(prev => prev + 1); // Déclencher le rechargement via useEffect
      };

      // S'abonner aux événements
      eventBus.on(LeadForgeEvents.CAMPAIGNS_CHANGED, handleDataChange);
      eventBus.on(LeadForgeEvents.CAMPAIGN_ADDED, handleDataChange);
      eventBus.on(LeadForgeEvents.CAMPAIGN_DELETED, handleDataChange);
      eventBus.on(LeadForgeEvents.LEADS_CHANGED, handleDataChange); // Les leads affectent les campagnes
      eventBus.on(LeadForgeEvents.LEAD_ADDED, handleDataChange);
      eventBus.on(LeadForgeEvents.LEAD_DELETED, handleDataChange);
      eventBus.on(LeadForgeEvents.DATA_REFRESH, handleDataChange);

      // Nettoyer les abonnements
      return () => {
        eventBus.off(LeadForgeEvents.CAMPAIGNS_CHANGED, handleDataChange);
        eventBus.off(LeadForgeEvents.CAMPAIGN_ADDED, handleDataChange);
        eventBus.off(LeadForgeEvents.CAMPAIGN_DELETED, handleDataChange);
        eventBus.off(LeadForgeEvents.LEADS_CHANGED, handleDataChange);
        eventBus.off(LeadForgeEvents.LEAD_ADDED, handleDataChange);
        eventBus.off(LeadForgeEvents.LEAD_DELETED, handleDataChange);
        eventBus.off(LeadForgeEvents.DATA_REFRESH, handleDataChange);
      };
    });
  }, []); // Pas de dépendances pour éviter les boucles

  const deleteCampaign = useCallback(async (campaignName: string) => {
    if (loadingRef.current) return; // Éviter les suppressions multiples
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      await leadsService.deleteByCampaign(campaignName);
      logger.log('useCampaigns: Campagne supprimée:', campaignName);
      setRefreshTrigger(prev => prev + 1); // Déclencher le rechargement
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const forceReloadCampaigns = useCallback(() => {
    logger.log('useCampaigns: Force rechargement des campagnes');
    setRefreshTrigger(prev => prev + 1); // Déclenche le rechargement via useEffect
  }, []);

  useEffect(() => {
    if (!initialized) {
      loadCampaigns();
    }
  }, [loadCampaigns, initialized, refreshTrigger]);

  return { campaigns, loading, error, loadCampaigns, deleteCampaign, forceReloadCampaigns };
}

export function useApiConfig() {
  const [config, setConfig] = useState<ApiConfig>(defaultApiConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load config from Supabase
  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logger.log('Loading config from Supabase...');
      const supabaseConfig = await configService.get();
      logger.log('Config loaded:', supabaseConfig);
      setConfig(supabaseConfig);
      // Injecter la clé Pexels dans le module pexelsImages
      if (supabaseConfig.pexelsKey) {
        const { setPexelsApiKey } = await import('./pexelsImages');
        setPexelsApiKey(supabaseConfig.pexelsKey);
      }
    } catch (err) {
      logger.error('Failed to load config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load config');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Souscription Realtime
  useEffect(() => {
    const channel = supabase
      .channel('api-config-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'api_config' }, (payload) => {
        logger.log('⚡ API Config Realtime Change:', payload);
        loadConfig();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadConfig]);

  const updateConfig = useCallback(async (updates: Partial<ApiConfig>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newConfig = { ...config, ...updates };
      await configService.update(newConfig);
      setConfig(newConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update config');
    } finally {
      setLoading(false);
    }
  }, [config]);

  return { config, loading, error, updateConfig };
}

export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultEmailTemplates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load templates from Supabase
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabaseTemplates = await templatesService.getAll();
      if (supabaseTemplates && supabaseTemplates.length > 0) {
        // Helper pour extraire les variables {{variableName}} du template
        const extractVariables = (text: string): string[] => {
          const matches = text.match(/\{\{([a-zA-Z]+)\}\}/g) || [];
          return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
        };

        const mappedTemplates = supabaseTemplates.map(t => ({
          id: t.id,
          name: t.name,
          category: (t.sector === 'reminder' ? 'reminder' : 'sale') as 'sale' | 'reminder',
          subject: t.subject,
          htmlContent: t.body || '',
          textContent: t.body?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || '',
          variables: extractVariables(t.body || ''),
        }));

        setTemplates(mappedTemplates);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Souscription Realtime
  useEffect(() => {
    const channel = supabase
      .channel('templates-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_templates' }, (payload) => {
        logger.log('⚡ Templates Realtime Change:', payload);
        loadTemplates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTemplates]);

  const addTemplate = useCallback(async (template: Omit<EmailTemplate, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convertir EmailTemplate vers le format de la base de données
      const dbTemplate = {
        name: template.name,
        sector: template.category === 'sale' ? 'sale' : 'reminder', // category -> sector
        subject: template.subject,
        body: template.textContent, // textContent -> body
      };
      await templatesService.create(dbTemplate);
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add template');
    } finally {
      setLoading(false);
    }
  }, [loadTemplates]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<EmailTemplate>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mapper les champs vers le format de la base de données
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.sector = updates.category;
      if (updates.subject) dbUpdates.subject = updates.subject;
      if (updates.textContent || updates.htmlContent) {
        dbUpdates.body = updates.textContent || updates.htmlContent;
      }

      await templatesService.update(id, dbUpdates);
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
    } finally {
      setLoading(false);
    }
  }, [loadTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await templatesService.delete(id);
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  }, [loadTemplates]);

  return { templates, loading, error, addTemplate, updateTemplate, deleteTemplate };
}

export function useScheduledEmails() {
  const [scheduled, setScheduled] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(false);

  const loadScheduled = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scheduled_emails')
      .select('*')
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true });
    
    if (!error && data) setScheduled(data as ScheduledEmail[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadScheduled();
    const sub = supabase.channel('scheduled-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scheduled_emails' }, loadScheduled)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [loadScheduled]);

  const cancelEmail = async (id: string) => {
    await supabase.from('scheduled_emails').delete().eq('id', id);
    loadScheduled();
  };

  return { scheduled, loading, cancelEmail, refresh: loadScheduled };
}

// --- RETRY UTILS ---
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1 seconde
const RATE_LIMIT_DELAY_MS = 2000; // Délai minimum entre requêtes (2s) pour éviter 429
const GROQ_TPM_LIMIT = 200000; // compound-beta-mini = No limit (200K buffer)
const GROQ_TPM_BUFFER = 500; // Marge de sécurité
const RATE_LIMIT_PROVIDER_SKIP_DELAY = 10000; // Attente avant de passer au provider suivant en cas de 429 (10s)
const NVIDIA_RPM_LIMIT = 38; // NVIDIA: 40 RPM, on reste en dessous avec marge
const REQUEST_WINDOW_MS = 60000; // Fenêtre d'une minute pour compter les requêtes

// Timestamp du dernier appel API pour le rate limiting
let lastApiCallTimestamp = 0;
// Tokens utilisés dans la dernière minute
let tokensUsedInMinute = 0;
let tokensResetTimestamp = 0;
// Compteur de requêtes dans la dernière minute (pour RPM)
let requestsInMinute = 0;
let requestsResetTimestamp = 0;

// Fonction pour estimer le nombre de tokens (approximatif: 1 token ≈ 4 chars)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Fonction pour attendre le délai minimum entre requêtes avec gestion TPM + RPM
async function enforceRateLimit(promptLength: number = 0, provider?: string): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTimestamp;
  
  // Réinitialiser le compteur de tokens si une minute s'est écoulée
  if (now - tokensResetTimestamp > 60000) {
    tokensUsedInMinute = 0;
    tokensResetTimestamp = now;
  }
  
  // Réinitialiser le compteur de requêtes si une minute s'est écoulée
  if (now - requestsResetTimestamp > REQUEST_WINDOW_MS) {
    requestsInMinute = 0;
    requestsResetTimestamp = now;
  }
  
  // Estimer les tokens pour cette requête
  const estimatedTokens = estimateTokens(promptLength.toString()) + 500; // +500 pour la réponse
  
  // Si on dépasse la limite TPM, attendre la fin de la minute
  if (tokensUsedInMinute + estimatedTokens > GROQ_TPM_LIMIT - GROQ_TPM_BUFFER) {
    const waitTime = 60000 - (now - tokensResetTimestamp) + 1000; // +1s de marge
    logger.log(`⏳ TPM Limit proche (${tokensUsedInMinute}/${GROQ_TPM_LIMIT}), attente de ${waitTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    tokensUsedInMinute = 0;
    tokensResetTimestamp = Date.now();
    requestsInMinute = 0;
    requestsResetTimestamp = Date.now();
  }
  
  // Si NVIDIA ou provider avec RPM limit, vérifier le compteur de requêtes
  if (provider === 'nvidia' || (!provider && requestsInMinute >= NVIDIA_RPM_LIMIT)) {
    if (requestsInMinute >= NVIDIA_RPM_LIMIT) {
      const waitTime = REQUEST_WINDOW_MS - (now - requestsResetTimestamp) + 1000;
      logger.log(`⏳ RPM Limit atteint (${requestsInMinute}/${NVIDIA_RPM_LIMIT}), attente de ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      requestsInMinute = 0;
      requestsResetTimestamp = Date.now();
    }
  }
  
  // Délai minimum entre requêtes
  if (timeSinceLastCall < RATE_LIMIT_DELAY_MS) {
    const waitTime = RATE_LIMIT_DELAY_MS - timeSinceLastCall;
    logger.log(`⏳ Rate limiting: attente de ${waitTime}ms avant la prochaine requête...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  tokensUsedInMinute += estimatedTokens;
  requestsInMinute++;
  lastApiCallTimestamp = Date.now();
}

// Fonction pour extraire le temps d'attente suggéré depuis le message d'erreur Groq
function extractRetryDelay(error: any): number | null {
  const message = error?.message || '';
  // Extrait le temps d'attente du pattern "Please try again in Xs" ou "Please try again in Xms"
  const match = message.match(/Please try again in ([\d.]+)(s|ms)/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    const delayMs = unit === 's' ? value * 1000 : value;
    logger.log(`⏳ Temps d'attente extrait de l'erreur: ${delayMs}ms`);
    return delayMs;
  }
  return null;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: any) => boolean,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      // Extraire le délai suggéré par l'API (ex: "Please try again in 3.27s")
      const suggestedDelay = extractRetryDelay(lastError);
      
      if (suggestedDelay) {
        // Si l'API suggère un délai court (<10s), attendre le reste de la minute pour éviter
        // de frapper la limite à nouveau immédiatement (TPM = tokens par MINUTE entière)
        const safeDelay = suggestedDelay < 10000
          ? Math.max(suggestedDelay + 1000, 62000 - (Date.now() % 60000)) // attendre le reset de la minute
          : suggestedDelay + 1000;
        logger.log(`⏳ Rate limit Groq — attente ${Math.round(safeDelay/1000)}s pour reset TPM (tentative ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, safeDelay));
        // Reset le compteur interne après l'attente
        tokensUsedInMinute = 0;
        tokensResetTimestamp = Date.now();
      } else {
        // Fallback: backoff exponentiel
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        logger.log(`⏳ Retry dans ${delay}ms (tentative ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

function isRateLimitError(error: any): boolean {
  // Vérifie si c'est une erreur 429 ou contient "rate_limit"
  if (error?.status === 429) return true;
  if (error?.message?.includes('rate_limit')) return true;
  if (error?.code === 'rate_limit_exceeded') return true;
  return false;
}

// --- LLM API CALLS ---
export async function callLLM(config: ApiConfig, prompt: string, systemPrompt?: string): Promise<string> {
  logger.log('🧠 callLLM: Starting LLM call');
  const truncatedPrompt = prompt.slice(0, 4000);

  const messages = [
    { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
    { role: 'user', content: truncatedPrompt }
  ];

  const callProvider = async (provider: string, apiKey: string, model: string, maxTokens: number): Promise<string> => {
    if (!apiKey) return '';
    await enforceRateLimit(truncatedPrompt.length, provider);
    try {
      return await retryWithBackoff(async () => {
        const res = await fetch('/api/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, apiKey, body: { model, messages, temperature: 0.7, max_tokens: maxTokens } }),
        });
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) return content;
          throw { status: 500, message: `Empty response from ${provider}` };
        }
        const errorText = await res.text();
        let errorObj: any;
        try { errorObj = JSON.parse(errorText); } catch { errorObj = { message: errorText }; }
        const error = { status: res.status, message: errorObj.error?.message || errorText, code: errorObj.error?.code };
        const apiError = detectApiError(error, provider);
        if (apiError) apiErrorState.recordError(apiError);
        throw error;
      }, isRateLimitError, 1); // Max 1 retry sur 429, passer au provider suivant rapidement
    } catch (err: any) {
      // En cas de 429, attendre avant de passer au provider suivant
      if (isRateLimitError(err)) {
        logger.warn(`⏳ Rate limit sur ${provider}, attente ${RATE_LIMIT_PROVIDER_SKIP_DELAY/1000}s avant provider suivant...`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_PROVIDER_SKIP_DELAY));
      }
      throw err;
    }
  };

  const defaultLlm = config.defaultLlm || 'groq';
  const defaultModel = config.defaultModel || '';
  logger.log('🎯 LLM: Default provider is:', defaultLlm, 'Model:', defaultModel);

  // Utiliser le modèle sélectionné par l'utilisateur pour le provider par défaut
  const getDefaultModel = (providerId: string): string => {
    if (providerId === defaultLlm && defaultModel) return defaultModel;
    // Modèles par défaut pour chaque provider (gratuits vérifiés juillet 2026)
    const defaults: Record<string, string> = {
      groq: 'llama-3.1-8b-instant',
      nvidia: 'nvidia/nemotron-3-super-120b-a12b',
      gemini: 'gemini-2.5-flash',
      openrouter: 'nvidia/nemotron-3-super-120b-a12b:free',
    };
    return defaults[providerId] || 'llama-3.1-8b-instant';
  };

  const providers = [
    { id: 'groq', key: config.groqKey, model: getDefaultModel('groq'), maxTokens: 1024 },
    { id: 'nvidia', key: config.nvidiaKey, model: getDefaultModel('nvidia'), maxTokens: 1024 },
    { id: 'gemini', key: config.geminiKey, model: getDefaultModel('gemini'), maxTokens: 1024 },
    { id: 'openrouter', key: config.openrouterKey, model: getDefaultModel('openrouter'), maxTokens: 1024 },
  ];

  const defaultIdx = providers.findIndex(p => p.id === defaultLlm);
  const ordered = defaultIdx >= 0
    ? [providers[defaultIdx], ...providers.filter((_, i) => i !== defaultIdx)]
    : providers;

  const providerOrder = ordered
    .filter(p => p.key)
    .map(p => () => callProvider(p.id, p.key, p.model, p.maxTokens));

  logger.log(`🔄 LLM: Provider order: ${ordered.filter(p => p.key).map(p => p.id).join(' → ')}`);

  // Exécuter via la file d'attente pour garantir un seul appel à la fois
  return enqueueLLMRequest(async () => {
    for (let i = 0; i < providerOrder.length; i++) {
      try {
        logger.log(`🧪 LLM: Trying provider ${i + 1}/${providerOrder.length}`);
        const result = await providerOrder[i]();
        if (result) {
          logger.log(`✅ LLM: Provider ${i + 1} succeeded`);
          return result;
        }
      } catch (err: any) {
        const msg = String(err?.message || err).toLowerCase();
        const isTransient = msg.includes('failed to fetch') || msg.includes('cors') || msg.includes('network') || isRateLimitError(err) || err?.status === 404 || err?.status === 504;
        if (!isTransient) throw err;
        logger.warn(`⚠️ LLM provider ${i + 1} indisponible (status ${err?.status || 'network'}), essai du suivant...`);
      }
    }

    logger.error('❌ callLLM: No LLM available (configure Gemini, NVIDIA NIM, OpenRouter or Groq)');
    return '';
  });
}

// --- LLM FOR FULL WEBSITE GENERATION (higher token limit) ---
export async function callLLMForWebsite(config: ApiConfig, prompt: string, systemPrompt?: string): Promise<string> {
  const truncatedPrompt = prompt.slice(0, 4000);

  const messages = [
    { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
    { role: 'user', content: truncatedPrompt }
  ];

  // Tous les providers passent par le proxy /api/llm pour éviter CORS
  const callProvider = async (provider: string, apiKey: string, model: string, maxTokens: number): Promise<string> => {
    if (!apiKey) return '';
    await enforceRateLimit(truncatedPrompt.length, provider);
    try {
      return await retryWithBackoff(async () => {
        const res = await fetch('/api/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, apiKey, body: { model, messages, temperature: 0.7, max_tokens: maxTokens } }),
        });
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) return content;
          throw { status: 500, message: `Empty response from ${provider}` };
        }
        const errorText = await res.text();
        let errorObj: any;
        try { errorObj = JSON.parse(errorText); } catch { errorObj = { message: errorText }; }
        const error = { status: res.status, message: errorObj.error?.message || errorText, code: errorObj.error?.code };
        const apiError = detectApiError(error, provider);
        if (apiError) apiErrorState.recordError(apiError);
        throw error;
      }, isRateLimitError, 1); // Max 1 retry sur 429, passer au provider suivant rapidement
    } catch (err: any) {
      // En cas de 429, attendre avant de passer au provider suivant
      if (isRateLimitError(err)) {
        logger.warn(`⏳ Rate limit sur ${provider}, attente ${RATE_LIMIT_PROVIDER_SKIP_DELAY/1000}s avant provider suivant...`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_PROVIDER_SKIP_DELAY));
      }
      throw err;
    }
  };

  const defaultLlm = config.defaultLlm || 'groq';
  const defaultModel = config.defaultModel || '';
  const providerOrder: Array<() => Promise<string>> = [];

  // Utiliser le modèle sélectionné par l'utilisateur pour le provider par défaut
  const getDefaultModelWebsite = (providerId: string): string => {
    if (providerId === defaultLlm && defaultModel) return defaultModel;
    const defaults: Record<string, string> = {
      groq: 'llama-3.1-8b-instant',
      nvidia: 'nvidia/nemotron-3-super-120b-a12b',
      gemini: 'gemini-2.5-flash',
      openrouter: 'nvidia/nemotron-3-super-120b-a12b:free',
    };
    return defaults[providerId] || 'llama-3.1-8b-instant';
  };

  const providers = [
    { id: 'groq', key: config.groqKey, model: getDefaultModelWebsite('groq'), maxTokens: 4096 },
    { id: 'nvidia', key: config.nvidiaKey, model: getDefaultModelWebsite('nvidia'), maxTokens: 4096 },
    { id: 'gemini', key: config.geminiKey, model: getDefaultModelWebsite('gemini'), maxTokens: 8192 },
    { id: 'openrouter', key: config.openrouterKey, model: getDefaultModelWebsite('openrouter'), maxTokens: 8192 },
  ];

  const defaultIdx = providers.findIndex(p => p.id === defaultLlm);
  const ordered = defaultIdx >= 0
    ? [providers[defaultIdx], ...providers.filter((_, i) => i !== defaultIdx)]
    : providers;

  for (const p of ordered) {
    if (!p.key) continue;
    providerOrder.push(() => callProvider(p.id, p.key, p.model, p.maxTokens));
  }

  logger.log(`🎯 callLLMForWebsite: Default=${defaultLlm}, ${providerOrder.length} providers configured`);

  // Exécuter via la file d'attente pour garantir un seul appel à la fois
  return enqueueLLMRequest(async () => {
    for (let i = 0; i < providerOrder.length; i++) {
      try {
        logger.log(`🧪 Website LLM: Trying provider ${i + 1}/${providerOrder.length}`);
        const result = await providerOrder[i]();
        if (result) {
          logger.log(`✅ Website LLM: Provider ${i + 1} succeeded`);
          return result;
        }
      } catch (err: any) {
        const msg = String(err?.message || err).toLowerCase();
        const isTransient = msg.includes('failed to fetch') || msg.includes('cors') || msg.includes('network') || isRateLimitError(err) || err?.status === 404 || err?.status === 504;
        if (!isTransient) throw err;
        logger.warn(`⚠️ Website LLM provider ${i + 1} indisponible (status ${err?.status || 'network'}), essai du suivant...`);
      }
    }

    logger.error('❌ callLLMForWebsite: No LLM available (configurez une clé API)');
    return '';
  });
}

// --- SERPER API ---
async function serperFetch(apiKey: string, endpoint: string, body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  // ... (rest of the code remains the same)
  if (!apiKey) {
    logger.error('❌ serperFetch: No API key provided');
    return null;
  }
  
  // Vérifier si les agents sont arrêtés avant l'appel
  if (apiErrorState.areAgentsStopped()) {
    logger.log('🛑 serperFetch: Agents arrêtés - Annulation de l\'appel');
    return null;
  }
  
  const url = `https://google.serper.dev/${endpoint}`;
  logger.log(`🔍 serperFetch: ${endpoint} - Query:`, body.q || body);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    logger.log(`📡 serperFetch: ${endpoint} - Status: ${res.status} ${res.statusText}`);
    
    if (res.ok) {
      const data = await res.json();
      logger.log(`✅ serperFetch: ${endpoint} - Success, keys:`, Object.keys(data));
      return data;
    } else {
      const errorText = await res.text();
      logger.error(`❌ serperFetch: ${endpoint} - HTTP ${res.status}:`, errorText);
      
      // Détecter et enregistrer l'erreur API
      const error = { status: res.status, message: errorText };
      const apiError = detectApiError(error, 'serper');
      if (apiError) {
        apiErrorState.recordError(apiError);
        // Arrêter immédiatement si crédits épuisés ou rate limit
        if (apiError.type === 'credits_exhausted' || apiError.type === 'rate_limit') {
          logger.log('🛑 serperFetch: Arrêt immédiat -', apiError.type);
          throw new Error(`API Error: ${apiError.type} - ${apiError.message}`);
        }
      }
    }
  } catch (error) {
    logger.error(`❌ serperFetch: ${endpoint} - Exception:`, error);
    
    // Si c'est une erreur de crédits ou rate limit, propager l'erreur
    if (error instanceof Error && (error.message.includes('credits_exhausted') || error.message.includes('rate_limit'))) {
      throw error;
    }
    
    // Détecter et enregistrer l'erreur réseau
    const apiError = detectApiError(error, 'serper');
    if (apiError) {
      apiErrorState.recordError(apiError);
    }
  }
  
  return null;
}

// --- ENRICHMENT WITH SERPER (AMÉLIORÉ) ---
export async function enrichWithSerper(apiKey: string, lead: Lead): Promise<Partial<Lead>> {
  const updates: Partial<Lead> = {};
  const query = `${lead.name} ${lead.city || ''} ${lead.sector || ''}`.trim();

  logger.log(`🔍 Enrichment query: "${query}"`);

  // 1. Places search (prioritaire pour les données locales)
  try {
    const placesResult = await serperFetch(apiKey, 'places', { q: query, gl: 'fr', hl: 'fr' });
    if (placesResult) {
      const places = placesResult.places;
      if (Array.isArray(places) && places.length > 0) {
        const p = places[0];
        if (p && typeof p === 'object') {
          const place = p as Record<string, unknown>;
          
          // Données de base
          if (!lead.address) updates.address = safeStr(place.address);
          if (!lead.phone) updates.phone = safeStr(place.phoneNumber || place.phone);
          if (!lead.website) updates.website = safeStr(place.website || place.websiteUri || place.domain || place.url);
          if (!lead.googleRating) updates.googleRating = safeNum(place.rating);
          if (!lead.googleReviews) updates.googleReviews = safeNum(place.ratingCount || place.reviewCount);
          if (!lead.sector) updates.sector = safeStr(place.category || place.type);
          updates.serperType = safeStr(place.category || place.type);

          // CID et Google Maps
          const cid = safeStr(place.cid);
          if (cid) updates.serperCid = cid;
          
          const mapsLink = safeStr(place.link);
          if (!lead.googleMapsUrl) {
            updates.googleMapsUrl = mapsLink || (cid ? `https://www.google.com/maps?cid=${cid}` : '');
          }

          // Extraction de la ville depuis l'adresse
          if (!lead.city && typeof place.address === 'string') {
            const parts = place.address.split(',').map((s: string) => s.trim());
            if (parts.length >= 2) updates.city = parts[parts.length - 2] || '';
          }

          // Horaires d'ouverture — gère string ET objet {Monday:..., Tuesday:...}
          const rawHours = place.hours || place.openingHours || place.openHours || place.workHours;
          let hoursStr = '';
          if (rawHours && typeof rawHours === 'object' && !Array.isArray(rawHours)) {
            hoursStr = Object.entries(rawHours as Record<string, unknown>)
              .map(([day, val]) => `${day}: ${val}`)
              .join(' | ');
          } else if (Array.isArray(rawHours)) {
            hoursStr = (rawHours as unknown[]).map(h => safeStr(h)).filter(Boolean).join(' | ');
          } else {
            hoursStr = safeStr(rawHours);
          }
          if (hoursStr && hoursStr !== '[object Object]') {
            updates.serperHours = hoursStr;
            if (!lead.hours) updates.hours = hoursStr;
          }

          // Logo et images réelles de Google Maps (Priorité 1)
          const logo = safeStr(place.logoUrl || place.logo);
          if (logo && logo.startsWith('http')) {
            updates.logo = logo;
          }

          // Extraire le tableau d'images réelles de Google Maps
          const rawImages = place.images || place.photos || [];
          const realImgs: string[] = [];
          if (Array.isArray(rawImages)) {
            rawImages.slice(0, 10).forEach(img => {
              const url = typeof img === 'string' ? img : safeStr((img as any).imageUrl || (img as any).link);
              if (url && url.startsWith('http')) realImgs.push(url);
            });
          }

          const thumb = safeStr(place.thumbnailUrl || place.thumbnail);
          if (thumb && thumb.startsWith('http') && !realImgs.includes(thumb)) {
            realImgs.unshift(thumb);
          }

          if (realImgs.length > 0) {
            updates.images = realImgs;
            logger.log(`✅ Photos réelles trouvées sur Google Maps : ${realImgs.length}`);
          }

          logger.log(`✅ Places data extracted: rating=${updates.googleRating}, reviews=${updates.googleReviews}, cid=${cid}`);
        }
      }
    }
  } catch (error) {
    logger.error('❌ Places search failed:', error);
  }

  // 2. Images search (plus agressif)
  try {
    const imageQueries = [
      query,
      `${lead.name} ${lead.city || ''} logo`,
      `${lead.sector || lead.name} ${lead.city || ''} professionnel`
    ];
    
    for (const imageQuery of imageQueries) {
      const imageResult = await serperFetch(apiKey, 'images', { q: imageQuery, gl: 'fr', hl: 'fr', num: 8 });
      if (imageResult) {
        const images = imageResult.images;
        if (Array.isArray(images)) {
          const currentImgs = [...(updates.images || lead.images || [])];
          for (const img of images.slice(0, 4)) {
            if (img && typeof img === 'object') {
              const url = safeStr((img as Record<string, unknown>).imageUrl || (img as Record<string, unknown>).thumbnailUrl);
              if (url && url.startsWith('http') && !currentImgs.includes(url)) {
                currentImgs.push(url);
              }
            }
          }
          if (currentImgs.length > (updates.images || lead.images || []).length) {
            updates.images = currentImgs.slice(0, 12);
          }
        }
      }
    }
  } catch (error) {
    logger.error('❌ Images search failed:', error);
  }

  // 3. Web search pour snippets + knowledge graph
  try {
    const searchResult = await serperFetch(apiKey, 'search', { q: query, gl: 'fr', hl: 'fr' });
    if (searchResult) {
      const kg = searchResult.knowledgeGraph;
      if (kg && typeof kg === 'object') {
        const kgObj = kg as Record<string, unknown>;
        
        // Compléter les données manquantes
        if (!lead.website && !updates.website) updates.website = safeStr(kgObj.website);
        if (!lead.phone && !updates.phone) updates.phone = safeStr(kgObj.phone);
        if (!lead.address && !updates.address) updates.address = safeStr(kgObj.address);
        if (!lead.googleRating && !updates.googleRating) updates.googleRating = safeNum(kgObj.rating);
        if (!lead.googleReviews && !updates.googleReviews) updates.googleReviews = safeNum(kgObj.ratingCount);
        
        // Image du knowledge graph
        const kgImage = safeStr(kgObj.imageUrl);
        if (kgImage && kgImage.startsWith('http')) {
          const imgs = [...(updates.images || lead.images || [])];
          if (!imgs.includes(kgImage)) { 
            imgs.unshift(kgImage); 
            updates.images = imgs.slice(0, 12); 
            if (!updates.logo) updates.logo = kgImage; // Logo par défaut
          }
        }

        // Horaires depuis attributes
        const attrs = kgObj.attributes;
        if (attrs && typeof attrs === 'object') {
          const attrsObj = attrs as Record<string, unknown>;
          const horaires = attrsObj['Horaires'] || attrsObj['Hours'] || attrsObj['Opening hours'] || attrsObj['horaires']
            || attrsObj["Heures d'ouverture"] || attrsObj['Opening Hours'] || attrsObj['Business hours'] || attrsObj['Work hours'];
          if (horaires) {
            const hStr = typeof horaires === 'object' && !Array.isArray(horaires)
              ? Object.entries(horaires as Record<string, unknown>).map(([d, v]) => `${d}: ${v}`).join(' | ')
              : safeStr(horaires);
            if (hStr && hStr !== '[object Object]') {
              updates.serperHours = hStr;
              if (!lead.hours && !updates.hours) updates.hours = hStr;
            }
          }
        }
      }

      // Snippets pour contexte LLM
      const organic = searchResult.organic;
      if (Array.isArray(organic)) {
        const snippets: string[] = [];
        for (const r of organic.slice(0, 6)) {
          if (r && typeof r === 'object') {
            const s = safeStr((r as Record<string, unknown>).snippet);
            if (s && s.length > 20) snippets.push(s);
          }
        }
        if (snippets.length > 0) updates.serperSnippets = snippets;
      }
    }
  } catch (error) {
    logger.error('❌ Web search failed:', error);
  }

  logger.log(`📊 Final updates:`, Object.keys(updates).length, 'fields updated');
  return updates;
}

// --- FETCH GOOGLE REVIEWS ---
export async function fetchSerperReviews(apiKey: string, cid: string): Promise<Lead['googleReviewsData']> {
  if (!apiKey || !cid) return [];
  try {
    const result = await serperFetch(apiKey, 'maps/reviews', { cid, num: 20 });
    if (!result) return [];

    let rawReviews: unknown[] = [];
    if (Array.isArray(result.reviews)) rawReviews = result.reviews;
    else if (result.place && typeof result.place === 'object') {
      const place = result.place as Record<string, unknown>;
      if (Array.isArray(place.reviews)) rawReviews = place.reviews;
    }

    return rawReviews
      .filter((r): r is Record<string, unknown> => r !== null && typeof r === 'object')
      .filter(r => safeNum(r.rating) >= 4)
      .slice(0, 6)
      .map(r => ({
        author: safeStr(r.user || r.author || r.name) || 'Client Google',
        rating: safeNum(r.rating) || 5,
        text: safeStr(r.snippet || r.text || r.review || r.body),
        date: safeStr(r.date || r.time || r.relativeDate),
      }))
      .filter(r => r.text.length > 5);
  } catch { /* ignore */ }
  return [];
}

// --- EXTRACT REVIEWS FROM SEARCH (AMÉLIORÉ) ---
export async function extractReviewsFromSearch(serperKey: string, lead: Lead, apiConfig: ApiConfig): Promise<Lead['googleReviewsData']> {
  logger.log(`🔍 Extracting reviews for: ${lead.name}`);
  
  // 1. Recherche directe avec plusieurs requêtes
  const searchQueries = [
    `"${lead.name}" ${lead.city || ''} avis clients google`,
    `"${lead.name}" ${lead.city || ''} reviews`,
    `"${lead.name}" ${lead.city || ''} témoignages`,
    `"${lead.name}" ${lead.city || ''} opinion`
  ];
  
  let allSnippets: string[] = [];
  
  for (const query of searchQueries) {
    try {
      const result = await serperFetch(serperKey, 'search', { q: query, gl: 'fr', hl: 'fr' });
      if (result && Array.isArray(result.organic)) {
        const snippets = result.organic
          .map((r: unknown) => {
            if (r && typeof r === 'object') {
              const snippet = safeStr((r as Record<string, unknown>).snippet);
              const title = safeStr((r as Record<string, unknown>).title);
              return snippet || title || '';
            }
            return '';
          })
          .filter(s => s.length > 10);
        
        allSnippets.push(...snippets);
      }
    } catch (error) {
      logger.error(`❌ Search failed for query: ${query}`, error);
    }
  }

  // Supprimer les doublons
  const uniqueSnippets = [...new Set(allSnippets)];
  
  if (uniqueSnippets.length < 20) {
    logger.log('❌ Not enough snippets for review extraction');
    return [];
  }

  // 2. Extraction par LLM avec un meilleur prompt
  if (!apiConfig.groqKey) {
    logger.log('❌ No LLM available for review extraction');
    return [];
  }

  const prompt = `Extrais 3 avis de: "${lead.name}" ${lead.city || ''}

Résultats:
${uniqueSnippets.slice(0, 1500).join('\n')}

JSON: [{"author":"","rating":5,"text":""}]`;

  try {
    logger.log('🧠 Sending LLM request for review extraction...');
    logger.log('🧠 Prompt length:', prompt.length);
    logger.log('🧠 Available snippets:', uniqueSnippets.length);
    
    const response = await callLLM(apiConfig, prompt, 'Tu es un expert en extraction d\'avis clients. Retourne UNIQUEMENT du JSON valide.');
    
    logger.log('🧠 Raw LLM response:', response);
    logger.log('🧠 Response length:', response?.length || 0);
    
    if (response && response.trim() && response !== '{}') {
      try {
        const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        logger.log('🧠 Cleaned response:', cleaned);
        
        const reviews = JSON.parse(cleaned);
        if (Array.isArray(reviews)) {
          const validReviews = reviews
            .filter(r => r && typeof r === 'object')
            .filter(r => r.author && r.text && r.rating)
            .filter(r => r.rating >= 4)
            .slice(0, 8)
            .map(r => ({
              author: safeStr(r.author) || 'Client Google',
              rating: Math.min(5, Math.max(1, safeNum(r.rating) || 5)),
              text: safeStr(r.text) || '',
              date: safeStr(r.date) || ''
            }))
            .filter(r => r.text.length > 10);
          
          logger.log(`✅ Extracted ${validReviews.length} valid reviews`);
          return validReviews;
        }
      } catch (parseError) {
        logger.error('❌ Failed to parse LLM response:', parseError);
        logger.log('Raw response:', response);
      }
    } else {
      logger.error('❌ LLM returned empty or invalid response');
    }
  } catch (error) {
    logger.error('❌ LLM extraction failed:', error);
  }

  return [];
}

// --- HELPERS REGEX ---
import { validateEmailAdvanced } from './validation';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'yopmail.fr', 'fakeinbox.com', 'sharklasers.com',
  'dispostable.com', 'maildrop.cc', 'trashmail.com', 'trashmail.net',
  '10minutemail.com', 'discard.email', 'mailexpire.com', 'mailnesia.com',
  'mohmal.com', 'burnermail.io', 'harakirimail.com', 'tempail.com',
  'temp-mail.org', 'temp-mail.io', 'tempinbox.com', 'tempomail.fr',
  'jetable.org', 'mytemp.email', 'emailondeck.com', 'tempr.email',
]);

const DIRECTORY_DOMAINS = new Set([
  'pagesjaunes.fr', 'societe.com', 'mairie.fr', 'infogreffe.fr',
  'pappers.fr', 'verif.com', 'manageo.fr', 'google.com', 'facebook.com',
  'instagram.com', 'twitter.com', 'x.com', 'linkedin.com', 'youtube.com',
  'wikipedia.org', 'example.com', 'test.com', 'localhost',
  'gmail.com', 'yahoo.com', 'yahoo.fr', 'hotmail.com', 'outlook.com',
  'aol.com', 'live.com', 'msn.com', 'sentry.io', 'wixpress.com',
]);

function isEmailDomainValid(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return false;
  if (DIRECTORY_DOMAINS.has(domain)) return false;
  const tld = domain.split('.').pop() || '';
  if (['tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top'].includes(tld)) return false;
  return true;
}

const extractEmail = (text: string): string => {
  const regex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(regex);
  if (!matches) return '';

  for (const match of matches) {
    const candidate = match.toLowerCase();
    const validation = validateEmailAdvanced(candidate);
    if (validation.valid && isEmailDomainValid(candidate)) {
      return candidate;
    }
  }
  return '';
};

const extractPhone = (text: string): string => {
  const match = text.match(/(?:\+33|0033|0)[1-9](?:[\s.\-]?\d{2}){4}/);
  return match ? match[0].replace(/[\s.\-]/g, ' ').trim() : '';
};

const snippetsText = (organic: unknown[] | undefined): string => {
  if (!organic || !Array.isArray(organic)) return '';
  return organic.map((x: unknown) => {
    if (x && typeof x === 'object') {
      const o = x as Record<string, unknown>;
      return `${safeStr(o.snippet)} ${safeStr(o.title)} ${safeStr(o.link)}`;
    }
    return '';
  }).join(' ');
};

// --- SCRAPE WEBSITE CONTACT PAGES ---
export async function scrapeWebsiteForContact(
  serperKey: string,
  website: string,
  leadName: string
): Promise<{ email: string; phone: string; services: string[] }> {
  const result = { email: '', phone: '', services: [] as string[] };
  if (!website) return result;

  const domain = website.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

  // Stratégie A : Fetch HTTP réel du site via endpoint server-side (prioritaire)
  try {
    const baseUrl = website.startsWith('http') ? website : `https://${website}`;
    const res = await fetch('/api/scrape-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: baseUrl, leadName }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.bestEmail) {
        result.email = data.bestEmail;
        logger.log(`✅ [Direct Scraping] Email trouvé: ${data.bestEmail} (${data.pagesScanned} pages scannées)`);
      }
      if (data.phones?.length > 0 && !result.phone) {
        result.phone = data.phones[0];
      }
    }
  } catch (err) {
    logger.warn('[Direct Scraping] Échec:', (err as Error).message);
  }

  // Stratégie B : Serper snippets (fallback si pas encore d'email)
  if (!result.email && serperKey) {
    const allText: string[] = [];

    try {
      const r = await serperFetch(serperKey, 'search', { q: `site:${domain} (contact OR "nous contacter" OR "contactez-nous")`, gl: 'fr', hl: 'fr', num: 5 });
      if (r?.organic && Array.isArray(r.organic)) allText.push(snippetsText(r.organic));
    } catch { /* continue */ }

    try {
      const r = await serperFetch(serperKey, 'search', { q: `site:${domain} ("mentions légales" OR "about" OR "à propos" OR "qui sommes")`, gl: 'fr', hl: 'fr', num: 5 });
      if (r?.organic && Array.isArray(r.organic)) allText.push(snippetsText(r.organic));
    } catch { /* continue */ }

    try {
      const r = await serperFetch(serperKey, 'search', { q: `site:${domain}`, gl: 'fr', hl: 'fr', num: 8 });
      if (r?.organic && Array.isArray(r.organic)) {
        allText.push(snippetsText(r.organic));
        const titles = r.organic.map((x: unknown) => {
          if (x && typeof x === 'object') return safeStr((x as Record<string, unknown>).title);
          return '';
        }).filter((t: string) => t.length > 3 && t.length < 60);
        result.services = titles.slice(0, 5);
      }
    } catch { /* continue */ }

    const fullText = allText.join(' \n ');
    if (!result.email) {
      const extracted = extractEmail(fullText);
      if (extracted) result.email = extracted;
    }
    if (!result.phone) result.phone = extractPhone(fullText);
    (result as any).rawScrapedText = fullText.substring(0, 3000);
  }

  return result;
}

// --- LLM ENRICHISSEMENT UNIFIÉ ---
export async function extractWithLLM(
  apiConfig: ApiConfig,
  lead: Lead,
  context: {
    snippets: string[];
    kgData: Record<string, unknown>;
    reviews: string[];
    websiteContent: string;
  }
): Promise<Partial<Lead>> {
  if (!apiConfig.groqKey && !apiConfig.geminiKey && !apiConfig.nvidiaKey && !apiConfig.openrouterKey) return {};

  const merged = { ...lead };
  const kgStr = Object.keys(context.kgData).length > 0
    ? JSON.stringify(context.kgData, null, 2).substring(0, 800)
    : 'Non disponible';

  const prompt = `Tu es un expert en business intelligence. Analyse ces données sur "${merged.name}" et extrais les informations manquantes.

=== DONNÉES CONNUES ===
Nom: ${merged.name} | Ville: ${merged.city || 'INCONNU'} | Secteur: ${merged.sector || 'INCONNU'}
Site web: ${merged.website || 'AUCUN'} | Téléphone actuel: ${merged.phone || 'MANQUANT'}
Email actuel: ${merged.email || 'MANQUANT'} | Note Google: ${merged.googleRating || 'N/A'}

=== CONTENU WEB (snippets Google) ===
${context.snippets.slice(0, 8).join('\n') || 'Aucun snippet disponible'}

=== KNOWLEDGE GRAPH GOOGLE ===
${kgStr}

=== AVIS CLIENTS ===
${context.reviews.slice(0, 3).join('\n') || 'Aucun avis disponible'}

=== CONTENU SITE WEB ===
${context.websiteContent.substring(0, 600) || 'Non disponible'}

Réponds UNIQUEMENT en JSON valide sans markdown, sans explication :
{
  "email": "email professionnel trouvé dans les données ou NONE",
  "phone": "numéro de téléphone trouvé dans les données ou NONE",
  "description": "description professionnelle 2-3 phrases basée sur les données réelles",
  "sector": "secteur d'activité précis en français",
  "services": ["service1", "service2", "service3"],
  "hours": "horaires d'ouverture si trouvés ou NONE",
  "city": "ville précise si trouvée"
}`;

  try {
    const response = await callLLM(apiConfig, prompt, 'Tu es un expert en extraction de données business. Réponds UNIQUEMENT en JSON valide, jamais en texte libre.');
    if (!response) return {};
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

    logger.log(`[LLM Extract] Response for "${lead.name}":`, cleaned.substring(0, 500));

    const data = JSON.parse(cleaned) as Record<string, unknown>;
    const updates: Partial<Lead> = {};

    if (data.email && typeof data.email === 'string' && !data.email.toUpperCase().includes('NONE') && data.email.includes('@')) {
      const emailCandidate = data.email.toLowerCase();
      const emailValid = validateEmailAdvanced(emailCandidate);
      if (emailValid.valid && isEmailDomainValid(emailCandidate)) {
        updates.email = emailCandidate;
        logger.log(`[LLM Extract] Email accepted for "${lead.name}": ${emailCandidate}`);
      } else {
        logger.log(`[LLM Extract] Email REJECTED for "${lead.name}": ${emailCandidate} — reason: ${emailValid.reason || 'domaine invalide'}`);
      }
    }
    if (data.phone && typeof data.phone === 'string' && !data.phone.toUpperCase().includes('NONE') && data.phone.length > 6)
      updates.phone = data.phone;
    if (data.description && typeof data.description === 'string' && data.description.length > 20)
      updates.description = data.description;
    if (data.sector && typeof data.sector === 'string' && !lead.sector)
      updates.sector = data.sector;
    if (data.services && Array.isArray(data.services) && data.services.length > 0)
      updates.tags = [...new Set([...(lead.tags || []), ...data.services.map(String)])].slice(0, 10);
    if (data.hours && typeof data.hours === 'string' && !data.hours.toUpperCase().includes('NONE') && !lead.hours)
      updates.hours = data.hours;
    if (data.city && typeof data.city === 'string' && !lead.city)
      updates.city = data.city;

    return updates;
  } catch {
    return {};
  }
}

// --- DEEP CONTACT SEARCH (email + téléphone) ---
export async function deepSearchContact(
  serperKey: string,
  lead: Lead,
  apiConfig: ApiConfig
): Promise<{ email: string; phone: string }> {
  const result = { email: '', phone: '' };

  const allSnippets: string[] = [];

  // Strategy 0 : scraping direct du site web (fonctionne sans Serper)
  if (lead.website) {
    const siteContact = await scrapeWebsiteForContact(serperKey, lead.website, lead.name);
    if (siteContact.email) result.email = siteContact.email;
    if (siteContact.phone) result.phone = siteContact.phone;
    if (result.email && result.phone) return result;
  }

  if (!serperKey) return result;

  // Strategy 1 : recherche site:domain generique
  if (lead.website && (!result.email || !result.phone)) {
    try {
      const domain = lead.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const r = await serperFetch(serperKey, 'search', { q: `site:${domain} email contact "@"`, gl: 'fr', hl: 'fr' });
      if (r?.organic && Array.isArray(r.organic)) {
        const text = snippetsText(r.organic);
        allSnippets.push(text);
        if (!result.email) result.email = extractEmail(text);
        if (!result.phone) result.phone = extractPhone(text);
        if (result.email && result.phone) return result;
      }
    } catch { /* continue */ }
  }

  // Strategy 2 : nom + ville + email
  let r2: Record<string, unknown> | null = null;
  try {
    r2 = await serperFetch(serperKey, 'search', { q: `"${lead.name}" "${lead.city || ''}" email contact`, gl: 'fr', hl: 'fr' });
    if (r2) {
      // Knowledge Graph
      if (r2.knowledgeGraph && typeof r2.knowledgeGraph === 'object') {
        const kg = r2.knowledgeGraph as Record<string, unknown>;
        if (!result.email) {
          const e = safeStr(kg.email);
          if (e.includes('@')) {
            const emailCandidate = e.toLowerCase();
            if (validateEmailAdvanced(emailCandidate).valid && isEmailDomainValid(emailCandidate)) {
              result.email = emailCandidate;
            }
          }
        }
        if (!result.phone) { const p = safeStr(kg.phone); if (p.length > 6) result.phone = p; }
      }
      if (r2.organic && Array.isArray(r2.organic)) {
        const text = snippetsText(r2.organic);
        allSnippets.push(text);
        if (!result.email) result.email = extractEmail(text);
        if (!result.phone) result.phone = extractPhone(text);
        if (result.email && result.phone) return result;
      }
    }
  } catch { /* continue */ }

  // Strategy 3 : réseaux sociaux
  let r3: Record<string, unknown> | null = null;
  try {
    r3 = await serperFetch(serperKey, 'search', { q: `"${lead.name}" ${lead.city || ''} (facebook OR instagram OR linkedin) email contact`, gl: 'fr', hl: 'fr' });
    if (r3?.organic && Array.isArray(r3.organic)) {
      const text = snippetsText(r3.organic);
      allSnippets.push(text);
      if (!result.email) result.email = extractEmail(text);
      if (!result.phone) result.phone = extractPhone(text);
      if (result.email && result.phone) return result;
    }
  } catch { /* continue */ }

  // Strategy 4 : LLM sur tous les snippets collectÉS + Texte du site
  if ((!result.email || !result.phone) && (apiConfig.groqKey || apiConfig.geminiKey || apiConfig.nvidiaKey)) {
    const scrapedText = (result as any).rawScrapedText || '';
    const prompt = `Tu es un détective business. Analyse les données de "${lead.name}" (${lead.city || 'France'}). 
    Extrais l'EMAIL PROFESSIONNEL ACTIF et le TÉLÉPHONE.
    
    CONSIGNE STRICTE :
    - Ignore les emails d'annuaires (ex: @pagesjaunes.fr, @societe.com, @mairie.fr).
    - Privilégie l'email trouvé sur le site officiel : ${lead.website || 'N/A'}.
    - Si l'email contient le nom propre "${lead.name.split(' ')[0]}", c'est un excellent signe.
    - Si l'email semble inactif ou générique NONE, réponds "NONE".
    
    RÉPONSES JSON UNIQUEMENT : {"email": "string", "phone": "string"}
    
    --- TEXTE DU SITE WEB ---
    ${scrapedText}
    
    --- RÉSULTATS DE RECHERCHE ---
    ${allSnippets.join('\n').substring(0, 1000)}`;

    try {
      const response = await callLLM(apiConfig, prompt, 'Réponds UNIQUEMENT en JSON valide.');
      if (response) {
        const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        logger.log(`[DeepSearch LLM] Response for "${lead.name}":`, cleaned.substring(0, 300));
        const data = JSON.parse(cleaned);
        if (data.email && data.email.includes('@') && !data.email.toUpperCase().includes('NONE')) {
          const emailCandidate = data.email.toLowerCase();
          if (validateEmailAdvanced(emailCandidate).valid && isEmailDomainValid(emailCandidate)) {
            result.email = emailCandidate;
            logger.log(`[DeepSearch LLM] Email accepted for "${lead.name}": ${result.email}`);
          } else {
            logger.log(`[DeepSearch LLM] Email REJECTED for "${lead.name}": ${emailCandidate}`);
          }
        }
        if (data.phone && data.phone.length > 6 && !data.phone.toUpperCase().includes('NONE')) {
          result.phone = data.phone;
        }
      }
    } catch (err) {
      logger.error('❌ LLM contact extraction failed:', err);
    }
  }

  return result;
}

// --- COMPAT: ancien nom conservé pour éviter les erreurs d'import résiduels ---
export async function deepSearchEmail(serperKey: string, lead: Lead, apiConfig: ApiConfig): Promise<string> {
  const { email } = await deepSearchContact(serperKey, lead, apiConfig);
  return email;
}

// --- SEARCH LEAD IMAGES (Logo + Website) AMÉLIORÉ ---
export async function searchLeadImages(serperKey: string, lead: Lead): Promise<{ logo: string; websiteImages: string[] }> {
  logger.log(`🖼️ Searching images for: ${lead.name}`);
  
  const result = { logo: '', websiteImages: [] as string[] };
  if (!serperKey) return result;

  // 1. Recherche de logo (plusieurs stratégies)
  const logoQueries = [
    `"${lead.name}" ${lead.city || ''} logo officiel`,
    `"${lead.name}" ${lead.city || ''} logo`,
    `${lead.sector || lead.name} ${lead.city || ''} logo professionnel`,
    `"${lead.name}" logo vectoriel`
  ];

  for (const query of logoQueries) {
    try {
      const logoResult = await serperFetch(serperKey, 'images', { q: query, gl: 'fr', hl: 'fr', num: 6 });
      if (logoResult && Array.isArray(logoResult.images)) {
        for (const img of logoResult.images) {
          if (img && typeof img === 'object') {
            const imgObj = img as Record<string, unknown>;
            const url = safeStr(imgObj.imageUrl || imgObj.thumbnailUrl);
            // Toutes les requêtes contiennent "logo" → prendre le premier résultat valide
            if (url && url.startsWith('http') && !result.logo) {
              result.logo = url;
              logger.log(`✅ Logo found: ${url}`);
              break;
            }
          }
        }
        if (result.logo) break;
      }
    } catch (error) {
      logger.error(`❌ Logo search failed for query: ${query}`, error);
    }
  }

  // 2. Images du site web (filtrées avec la blocklist unifiée)
  if (lead.website) {
    try {
      const domain = lead.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      logger.log(`🌐 Searching website images for domain: ${domain}`);
      
      const domainName = domain.replace(/^www\./, '').split('.')[0];
      const imgResult = await serperFetch(serperKey, 'images', { q: `${lead.name} ${domainName}`, gl: 'fr', hl: 'fr', num: 12 });
      if (imgResult && Array.isArray(imgResult.images)) {
        for (const img of imgResult.images) {
          if (img && typeof img === 'object') {
            const imgObj = img as Record<string, unknown>;
            const url = safeStr(imgObj.imageUrl || imgObj.thumbnailUrl);
            const title = safeStr(imgObj.title || '');
            
            if (!url || !url.startsWith('http') || result.websiteImages.includes(url)) continue;
            if (isImageBlocked(url, title, lead.sector)) continue;

            const imgUrl = url.toLowerCase();
            const matchesDomain = domain.split('.')[0].length > 3 && imgUrl.includes(domain.split('.')[0]);
            if (!matchesDomain) continue;

            result.websiteImages.push(url);
          }
        }
        logger.log(`✅ Found ${result.websiteImages.length} website images`);
      }
    } catch (error) {
      logger.error('❌ Website images search failed:', error);
    }
  }

  // 3. [DÉSACTIVÉ] Images professionnelles via Google Images générique
  //    → Source de photos volées à des concurrents + images non pertinentes
  //    → Remplacé par les images Pexels spécifiques par service (imageAgent.ts / pexelsImages.ts)
  //    → Seules les images du site web du lead (étape 2) et les images Pexels sont utilisées
  logger.log(`ℹ️ Étape 3 désactivée: images professionnelles via Google Images générique`);

  // 4. Logo par défaut depuis knowledge graph si pas trouvé
  if (!result.logo && lead.website) {
    try {
      const kgResult = await serperFetch(serperKey, 'search', { q: lead.website, gl: 'fr', hl: 'fr' });
      if (kgResult && kgResult.knowledgeGraph) {
        const kg = kgResult.knowledgeGraph as Record<string, unknown>;
        const kgImage = safeStr(kg.imageUrl);
        if (kgImage && kgImage.startsWith('http')) {
          result.logo = kgImage;
          logger.log(`✅ Knowledge Graph logo: ${kgImage}`);
        }
      }
    } catch (error) {
      logger.error('❌ Knowledge Graph logo search failed:', error);
    }
  }

  logger.log(`📊 Final image results: logo=${!!result.logo}, websiteImages=${result.websiteImages.length}`);
  return result;
}

// --- GENERATE WEBSITE PROMPT ---
export function generateWebsitePrompt(lead: Lead): string {
  const reviews = (lead.googleReviewsData || [])
    .filter(r => r && typeof r.text === 'string')
    .map(r => `  - "${r.text}" — ${safeStr(r.author)} (${safeNum(r.rating)}★${r.date ? `, ${safeStr(r.date)}` : ''})`)
    .join('\n');

  const allImages = [...(lead.images || [])].filter(u => typeof u === 'string' && u.startsWith('http'));
  const imageList = allImages.length > 0
    ? allImages.map((url, i) => `  ${i + 1}. ${url}`).join('\n')
    : '  No images found — use sector-appropriate stock photos';

  const wsImages = (lead.websiteImages || []).filter(u => typeof u === 'string' && u.startsWith('http'));
  const wsImageList = wsImages.length > 0
    ? wsImages.map((url, i) => `  ${i + 1}. ${url}`).join('\n')
    : '';

  return `Create a modern theme website for "${lead.name}" with a premium and stylish design. The website should include a strong hero section with logo, headline, short description, and a "Book Appointment" button, and pages like Home, Services, Gallery, About, and Book Appointment.
Appointments should be booked in two ways: users can either fill a complete booking form with service, date, and contact details, or connect directly with the business through a WhatsApp button.

Now use the following "${lead.name}" details to generate the website:

Business Information:
- Business Name: ${lead.name}
- Sector/Category: ${lead.sector || 'Non spécifié'}
- City: ${lead.city || 'Non spécifiée'}
- Full Address: ${lead.address || 'Non renseignée'}
- Phone: ${lead.phone || 'Non renseigné'}
- Email: ${lead.email || 'Non renseigné'}
- Current Website: ${lead.website || 'No existing website'}
- Google Maps: ${lead.googleMapsUrl || 'Non renseigné'}

Google Presence:
- Rating: ${lead.googleRating > 0 ? `${lead.googleRating}/5` : 'Not rated'}
- Total Reviews: ${lead.googleReviews || 0}
${reviews ? `\nReal Customer Reviews:\n${reviews}` : ''}

Operating Hours: ${lead.hours || lead.serperHours || 'Not specified'}

Business Description:
${lead.description || 'No description available — generate an appropriate one based on the business name, sector, and location.'}

Available Visual Assets:
- Logo: ${lead.logo || 'Not identified — create a text-based logo using the business name'}
- Photos:
${imageList}
${wsImageList ? `- Original Website Images:\n${wsImageList}` : ''}`;
}

// --- IMAGE PROXY ---
export function proxyImage(url: string, w?: number): string {
  if (!url) return '';
  if (!url.startsWith('http')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${w}&q=80&output=webp&default=1`;
}

// Alias pour compatibilité avec le code existant
export const proxyImg = proxyImage;

export function getTemplateType(sector: string): number {
  const s = (sector || '').toLowerCase();
  if (['restaurant', 'boulangerie', 'café', 'cafe', 'traiteur', 'pizzeria'].some(k => s.includes(k))) return 1;
  if (['hôtel', 'hotel', 'riad', 'resort', 'gîte', 'camping'].some(k => s.includes(k))) return 2;
  if (['médecin', 'medecin', 'dentiste', 'clinique', 'pharmacie', 'kiné', 'ostéo'].some(k => s.includes(k))) return 3;
  if (['avocat', 'immobilier', 'commerce', 'banque', 'assurance', 'consultant'].some(k => s.includes(k))) return 4;
  if (['coiffeur', 'salon', 'beauté', 'spa', 'esthétique', 'onglerie', 'barbier'].some(k => s.includes(k))) return 5;
  return 1;
}

// --- SCORING ALGORITHM ---
export function calculateScore(lead: Lead): { score: number; temperature: Lead['temperature'] } {
  let score = 0;
  if (lead.name) score += 5;
  if (lead.email) score += 8;
  if (lead.phone) score += 5;
  if (lead.address) score += 3;
  if (lead.city) score += 3;
  if (lead.sector) score += 3;
  if (lead.description) score += 3;
  if (!lead.website || lead.tags.includes('Sans site')) score += 25;
  else if (lead.tags.includes('Site obsolète')) score += 15;
  if (lead.googleRating >= 4.5) score += 10;
  else if (lead.googleRating >= 4.0) score += 7;
  else if (lead.googleRating >= 3.0) score += 4;
  if (lead.googleReviews >= 50) score += 10;
  else if (lead.googleReviews >= 20) score += 7;
  else if (lead.googleReviews >= 5) score += 4;
  const highValueSectors = ['restaurant', 'hotel', 'riad', 'avocat', 'medecin', 'spa', 'clinique', 'dentiste'];
  const medValueSectors = ['commerce', 'boutique', 'garage', 'artisan', 'boulangerie', 'coiffeur', 'salon'];
  const sl = (lead.sector || lead.name || '').toLowerCase();
  if (highValueSectors.some(s => sl.includes(s))) score += 15;
  else if (medValueSectors.some(s => sl.includes(s))) score += 10;
  else score += 5;
  if (lead.images.length > 0) score += 5;
  if (lead.tags.includes('Prioritaire')) score += 5;
  score = Math.min(100, Math.max(0, score));
  let temperature: Lead['temperature'] = 'cold';
  if (score >= 80) temperature = 'very_hot';
  else if (score >= 60) temperature = 'hot';
  else if (score >= 40) temperature = 'warm';
  return { score, temperature };
}

// --- UTILITY FUNCTIONS ---
export function mapColumns(data: any[], headers: string[]): Partial<Lead>[] {
  if (!headers || !Array.isArray(headers)) {
    logger.error('mapColumns: headers is not an array', headers);
    return [];
  }
  
  const mapped: Partial<Lead>[] = [];
  const headerMap = headers.reduce((acc, h, i) => {
    const key = h.toLowerCase().trim();
    // Noms en français
    if (key.includes('nom') || key.includes('name')) acc.name = i;
    else if (key.includes('email')) acc.email = i;
    else if (key.includes('téléphone') || key.includes('phone') || key.includes('tel')) acc.phone = i;
    else if (key.includes('secteur') || key.includes('sector')) acc.sector = i;
    else if (key.includes('ville') || key.includes('city')) acc.city = i;
    else if (key.includes('adresse') || key.includes('address')) acc.address = i;
    else if (key.includes('site') || key.includes('website') || key.includes('web')) acc.website = i;
    else if (key.includes('notes') || key.includes('note')) acc.notes = i;
    // Noms en anglais spécifiques pour les fichiers Excel
    else if (key.includes('business name')) acc.name = i;
    else if (key.includes('business email')) acc.email = i;
    else if (key.includes('business phone')) acc.phone = i;
    else if (key.includes('business website')) acc.website = i;
    else if (key.includes('business address')) acc.address = i;
    else if (key.includes('location') || key.includes('city')) acc.city = i;
    else if (key.includes('keyword')) acc.sector = i;
    return acc;
  }, {} as Record<string, number>);

  logger.log('Header mapping:', headerMap);

  for (const row of data) {
    const lead: Partial<Lead> = {};
    // Utiliser les noms de colonnes directement
    if (headerMap.name !== undefined) {
      const headerName = headers[headerMap.name];
      lead.name = safeStr(row[headerName]);
    }
    if (headerMap.email !== undefined) {
      const headerName = headers[headerMap.email];
      lead.email = safeStr(row[headerName]);
    }
    if (headerMap.phone !== undefined) {
      const headerName = headers[headerMap.phone];
      lead.phone = safeStr(row[headerName]);
    }
    if (headerMap.sector !== undefined) {
      const headerName = headers[headerMap.sector];
      lead.sector = safeStr(row[headerName]);
    }
    if (headerMap.city !== undefined) {
      const headerName = headers[headerMap.city];
      lead.city = safeStr(row[headerName]);
    }
    if (headerMap.address !== undefined) {
      const headerName = headers[headerMap.address];
      lead.address = safeStr(row[headerName]);
    }
    if (headerMap.website !== undefined) {
      const headerName = headers[headerMap.website];
      lead.website = safeStr(row[headerName]);
    }
    if (headerMap.notes !== undefined) {
      const headerName = headers[headerMap.notes];
      lead.notes = safeStr(row[headerName]);
    }
    
    if (lead.name) {
      mapped.push(lead);
    }
  }
  logger.log('Final mapped leads:', mapped);
  return mapped;
}

export function exportLeadsCSV(leads: Lead[], filename: string = 'leads_export.csv') {
  const headers = ['Nom', 'Email', 'Téléphone', 'Secteur', 'Ville', 'Adresse', 'Site Web', 'Note Google', 'Avis Google', 'Score', 'Température', 'Étape', 'Tags', 'Description', 'Notes'];
  const rows = leads.map(l => [
    l.name, l.email, l.phone, l.sector, l.city, l.address, l.website,
    String(l.googleRating), String(l.googleReviews),
    String(l.score), l.temperature, l.stage, l.tags.join(';'), l.description, l.notes,
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// --- UNSPLASH API ---
export async function searchUnsplash(key: string, query: string): Promise<string[]> {
  const k = (key || '').trim();
  if (!k) return [];
  try {
    const page = Math.floor(Math.random() * 3) + 1;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&page=${page}`;
    let res = await fetch(url, { headers: { 'Authorization': `Client-ID ${k}` } });
    if (res.status === 401) res = await fetch(url, { headers: { 'Authorization': `Bearer ${k}` } });
    if (res.ok) {
      const data = await res.json();
      return (data.results || []).map((r: { urls: { regular: string } }) => safeStr(r?.urls?.regular)).filter(Boolean);
    }
  } catch { /* ignore */ }
  return [];
}

// --- PEXELS API ---
export async function searchPexels(key: string, query: string): Promise<string[]> {
  if (!key) return [];
  try {
    const page = Math.floor(Math.random() * 3) + 1;
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&page=${page}&safesearch=true`, {
      headers: { 'Authorization': key },
    });
    if (res.ok) {
      const data = await res.json();
      return (data.photos || [])
        .filter((p: { alt?: string; src: { medium: string } }) => !isImageBlocked(safeStr(p?.src?.medium), p?.alt))
        .map((p: { src: { medium: string } }) => safeStr(p?.src?.medium)).filter(Boolean);
    }
  } catch { /* ignore */ }
  return [];
}
