import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[LeadForge] Variables d\'environnement manquantes : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requises.\n' +
    'Ajoutez-les dans votre fichier .env.local (développement) ou dans Vercel Dashboard → Settings → Environment Variables (production).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les tables Supabase
export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          name: string;
          email?: string;
          phone?: string;
          website?: string;
          address?: string;
          city?: string;
          sector?: string;
          rating?: number;
          reviews_count?: number;
          has_website?: boolean;
          enriched?: boolean;
          score?: number;
          status?: string;
          source?: string;
          notes?: string;
          site_generated?: boolean;
          site_url?: string;
          landing_url?: string;
          email_sent?: boolean;
          email_sent_date?: string;
          email_opened?: boolean;
          email_clicked?: boolean;
          last_contact?: string;
          campaign?: string;
          campaign_date?: string;
          // NOUVEAUX CHAMPS D'ENRICHISSEMENT
          google_rating?: number;
          google_reviews?: number;
          google_maps_url?: string;
          serper_cid?: string;
          serper_type?: string;
          serper_hours?: string;
          serper_snippets?: string[];
          description?: string;
          logo?: string;
          images?: string[];
          website_images?: string[];
          google_reviews_data?: any;
          temperature?: string;
          tags?: string[];
          generated_prompt?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      api_config: {
        Row: {
          id: number;
          groq_key?: string;
          openrouter_key?: string;
          serper_key?: string;
          unsplash_key?: string;
          pexels_key?: string;
          gmail_smtp_host?: string;
          gmail_smtp_port?: number;
          gmail_smtp_user?: string;
          gmail_smtp_password?: string;
          gmail_smtp_from_name?: string;
          gmail_smtp_from_email?: string;
          gmail_smtp_secure?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['api_config']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['api_config']['Insert']>;
      };
      email_templates: {
        Row: {
          id: string;
          name: string;
          sector: string;
          subject: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['email_templates']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['email_templates']['Insert']>;
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          status: string;
          template_id?: string;
          leads_count?: number;
          sent_count?: number;
          created_at: string;
          started_at?: string;
          completed_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>;
      };
    };
  };
}

// Service pour les leads
export const leadsService = {
  async getAll(params?: { status?: string; search?: string; limit?: number; offset?: number }) {
    let query = supabase
      .from('leads')
      .select('*');

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,city.ilike.%${params.search}%`);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 100) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { leads: data || [], count: data?.length || 0 };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(lead: Database['public']['Tables']['leads']['Insert']) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['leads']['Update']) {
    console.log('🔧 Supabase update attempt for ID:', id);

    // Nettoyer explicitement les valeurs "undefined" avant l'envoi pour éviter tout problème avec Supabase
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('leads')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase update error:', error);
      throw error;
    }

    console.log('✅ Supabase update successful:', data);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteMany(ids: string[]) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', ids);

    if (error) throw error;
  },

  async deleteByCampaign(campaignName: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('campaign', campaignName);

    if (error) throw error;
  },

  async getCampaigns() {
    const { data, error } = await supabase
      .from('leads')
      .select('campaign, campaign_date, created_at')
      .order('campaign_date', { ascending: false });

    if (error) throw error;

    // Debug seulement en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('All leads for campaigns:', data);
    }

    // Grouper par campagne et compter les leads
    const campaigns: Record<string, { name: string; date: string; count: number }> = {};

    data?.forEach(lead => {
      let campaignName = lead.campaign;
      let campaignDate = lead.campaign_date || lead.created_at;

      // Si pas de campagne, créer une campagne par défaut
      if (!campaignName) {
        campaignName = 'Importation sans nom';
        campaignDate = lead.created_at;
      }

      if (!campaigns[campaignName]) {
        campaigns[campaignName] = {
          name: campaignName,
          date: campaignDate,
          count: 0
        };
      }
      campaigns[campaignName].count++;
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Campaigns grouped:', campaigns);
    }

    return Object.values(campaigns);
  }
};

// Service pour la configuration API
export const configService = {
  async get() {
    const { data, error } = await supabase
      .from('api_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      // Return default config if none exists
      return {
        groqKey: '',
        openrouterKey: '',
        geminiKey: '',
        nvidiaKey: '',
        defaultLlm: 'groq' as import('./supabase-store').LlmProvider,
        serperKey: '',
        unsplashKey: '',
        pexelsKey: '',
        gmailSmtpHost: 'smtp.gmail.com',
        gmailSmtpPort: 587,
        gmailSmtpUser: '',
        gmailSmtpPassword: '',
        gmailSmtpFromName: '',
        gmailSmtpFromEmail: '',
        gmailSmtpSecure: false,
        whopDepositLink: '',
        whopFinalPaymentLink: ''
      };
    }

    return {
      groqKey: data.groq_key || '',
      openrouterKey: data.openrouter_key || '',
      geminiKey: data.gemini_key || '',
      nvidiaKey: data.nvidia_key || '',
      defaultLlm: (data.default_llm || 'groq') as import('./supabase-store').LlmProvider,
      serperKey: data.serper_key || '',
      unsplashKey: data.unsplash_key || '',
      pexelsKey: data.pexels_key || '',
      gmailSmtpHost: data.gmail_smtp_host || 'smtp.gmail.com',
      gmailSmtpPort: data.gmail_smtp_port || 587,
      gmailSmtpUser: data.gmail_smtp_user || '',
      gmailSmtpPassword: data.gmail_smtp_password || '',
      gmailSmtpFromName: data.gmail_smtp_from_name || '',
      gmailSmtpFromEmail: data.gmail_smtp_from_email || '',
      gmailSmtpSecure: data.gmail_smtp_secure || false,
      whopDepositLink: data.whop_deposit_link || '',
      whopFinalPaymentLink: data.whop_final_payment_link || ''
    };
  },

  async update(config: any) {
    const row: any = {
      groq_key: config.groqKey || null,
      openrouter_key: config.openrouterKey || null,
      gemini_key: config.geminiKey || null,
      nvidia_key: config.nvidiaKey || null,
      default_llm: config.defaultLlm || 'groq',
      serper_key: config.serperKey || null,
      gmail_smtp_host: config.gmailSmtpHost || 'smtp.gmail.com',
      gmail_smtp_port: Number(config.gmailSmtpPort) || 587,
      gmail_smtp_user: config.gmailSmtpUser || null,
      gmail_smtp_password: config.gmailSmtpPassword || null,
      gmail_smtp_from_name: config.gmailSmtpFromName || null,
      gmail_smtp_from_email: config.gmailSmtpFromEmail || null,
      gmail_smtp_secure: Boolean(config.gmailSmtpSecure),
      whop_deposit_link: config.whopDepositLink || null,
      whop_final_payment_link: config.whopFinalPaymentLink || null,
      unsplash_key: config.unsplashKey || null,
      pexels_key: config.pexelsKey || null,
    };

    console.log('🚀 Updating api_config (id=1):', row);

    const { error } = await supabase
      .from('api_config')
      .update(row)
      .eq('id', 1);

    if (error) {
      console.error('❌ Supabase Update Error:', error);
      throw error;
    }
    return { message: 'Configuration saved successfully' };
  }
};

// Service pour les templates email
export const templatesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(template: Database['public']['Tables']['email_templates']['Insert']) {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['email_templates']['Update']) {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Service pour les campagnes
export const campaignsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(campaign: Database['public']['Tables']['campaigns']['Insert']) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaign])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Database['public']['Tables']['campaigns']['Update']) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
