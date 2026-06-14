// API Client for LeadForge Backend
// Base URL: http://localhost:3001/api

const API_BASE_URL = '/api';

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== LEADS API ====================

export interface LeadInput {
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
  source?: string;
  notes?: string;
}

export interface Lead extends LeadInput {
  id: string;
  status: string;
  enriched: boolean;
  score: number;
  site_generated: boolean;
  site_url?: string;
  landing_url?: string;
  email_sent: boolean;
  email_sent_date?: string;
  email_opened: boolean;
  email_clicked: boolean;
  last_contact?: string;
  created_at: string;
  updated_at: string;
}

export const leadsApi = {
  // Get all leads
  async getAll(params?: { status?: string; search?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    
    return fetchApi<{ leads: Lead[]; count: number }>(`/leads?${query}`);
  },

  // Get single lead
  async getById(id: string) {
    return fetchApi<Lead>(`/leads/${id}`);
  },

  // Create lead
  async create(data: LeadInput) {
    return fetchApi<{ id: string; message: string } & LeadInput>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update lead
  async update(id: string, data: Partial<LeadInput>) {
    return fetchApi<{ message: string; id: string }>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete lead
  async delete(id: string) {
    return fetchApi<{ message: string; id: string }>(`/leads/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk create leads
  async createBulk(leads: LeadInput[]) {
    return fetchApi<{ message: string; leads: Array<{ id: string } & LeadInput> }>('/leads', {
      method: 'POST',
      body: JSON.stringify({ leads }),
    });
  },
};

// ==================== CONFIG API ====================

export interface ApiConfigInput {
  groqKey?: string;
  openrouterKey?: string;
  serperKey?: string;
  gmailSmtpHost?: string;
  gmailSmtpPort?: number;
  gmailSmtpUser?: string;
  gmailSmtpPassword?: string;
  gmailSmtpFromName?: string;
  gmailSmtpFromEmail?: string;
  gmailSmtpSecure?: boolean;
}

export interface ApiConfig extends ApiConfigInput {
  gmailSmtpPassword: string; // masked
}

export const configApi = {
  // Get config
  async get() {
    return fetchApi<ApiConfig>('/config');
  },

  // Update config
  async update(data: ApiConfigInput) {
    return fetchApi<{ message: string; config: ApiConfig }>('/config', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Test SMTP connection
  async testSmtp() {
    return fetchApi<{ success: boolean; message: string }>('/config?action=test-smtp', {
      method: 'POST',
    });
  },
};

// ==================== EMAIL API ====================

export interface EmailInput {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  leadId?: string;
}

export interface BatchEmailInput {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  leadId?: string;
}

export const emailApi = {
  // Send single email
  async send(data: EmailInput) {
    return fetchApi<{
      success: boolean;
      message: string;
      messageId: string;
      to: string;
      subject: string;
    }>('/email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Send batch emails
  async sendBatch(emails: BatchEmailInput[], delayMs: number = 2000) {
    return fetchApi<{
      success: boolean;
      summary: { total: number; sent: number; failed: number };
      results: Array<{ to: string; status: string; messageId: string }>;
      errors?: Array<{ to: string; error: string }>;
    }>('/email?action=batch', {
      method: 'POST',
      body: JSON.stringify({ emails, delayMs }),
    });
  },

  // Get email logs
  async getLogs(params?: { leadId?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams();
    query.set('action', 'logs');
    if (params?.leadId) query.set('leadId', params.leadId);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    
    return fetchApi<{ logs: any[]; count: number }>(`/email?${query}`);
  },
};

// ==================== TEMPLATES API ====================

export interface EmailTemplateInput {
  name: string;
  sector: string;
  subject: string;
  body: string;
}

export interface EmailTemplate extends EmailTemplateInput {
  id: string;
  created_at: string;
  updated_at: string;
}

export const templatesApi = {
  // Get all templates
  async getAll(sector?: string) {
    const query = sector ? `?sector=${sector}` : '';
    return fetchApi<{ templates: EmailTemplate[]; count: number }>(`/templates${query}`);
  },

  // Get single template
  async getById(id: string) {
    return fetchApi<EmailTemplate>(`/templates/${id}`);
  },

  // Create template
  async create(data: EmailTemplateInput) {
    return fetchApi<{ id: string; message: string } & EmailTemplateInput>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update template
  async update(id: string, data: Partial<EmailTemplateInput>) {
    return fetchApi<{ message: string; id: string }>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete template
  async delete(id: string) {
    return fetchApi<{ message: string; id: string }>(`/templates/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CAMPAIGNS API ====================

export interface CampaignInput {
  name: string;
  templateId: string;
  leadIds: string[];
}

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed';
  template_id: string;
  leads_count: number;
  sent_count: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export const campaignsApi = {
  // Get all campaigns
  async getAll(status?: string) {
    const query = status ? `?status=${status}` : '';
    return fetchApi<{ campaigns: Campaign[]; count: number }>(`/campaigns${query}`);
  },

  // Get campaign with leads
  async getById(id: string) {
    return fetchApi<{ campaign: Campaign; leads: any[] }>(`/campaigns/${id}`);
  },

  // Create campaign
  async create(data: CampaignInput) {
    return fetchApi<{ id: string; message: string } & CampaignInput>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Start campaign
  async start(id: string) {
    return fetchApi<{ message: string; id: string }>(`/campaigns/${id}?action=start`, {
      method: 'POST',
    });
  },

  // Complete campaign
  async complete(id: string) {
    return fetchApi<{ message: string; id: string }>(`/campaigns/${id}?action=complete`, {
      method: 'POST',
    });
  },

  // Delete campaign
  async delete(id: string) {
    return fetchApi<{ message: string; id: string }>(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== HEALTH CHECK ====================

export const healthApi = {
  async check() {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.json();
  },
};

// Export all APIs
export const api = {
  leads: leadsApi,
  config: configApi,
  email: emailApi,
  templates: templatesApi,
  campaigns: campaignsApi,
  health: healthApi,
};

export default api;
