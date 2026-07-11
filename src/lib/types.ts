// ============================================================
// LeadForge AI — Types & Defaults
// ============================================================

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
  devis_url?: string;
  invoice_url?: string;
  admin_url?: string;
  admin_username?: string;
  admin_password?: string;
  documentation_url?: string;
  contactName?: string;
  sentSteps: string[];
  emailInvalid?: boolean;
  emailInvalidReason?: string;
}

export type LlmProvider = 'groq' | 'gemini' | 'nvidia' | 'openrouter';

export type LlmModelTier = 'free' | 'paid';

export interface LlmModel {
  id: string;
  name: string;
  tier: LlmModelTier;
  maxTokens: number;
  description: string;
}

export const LLM_MODELS: Record<LlmProvider, LlmModel[]> = {
  groq: [
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', tier: 'free', maxTokens: 131072, description: 'Rapide, 250K TPM gratuit' },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', tier: 'free', maxTokens: 32768, description: 'Puissant, 300K TPM gratuit' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', tier: 'free', maxTokens: 32768, description: 'MoE, long context gratuit' },
    { id: 'qwen-qwq-32b', name: 'Qwen QwQ 32B', tier: 'free', maxTokens: 131072, description: 'Raisonnement, gratuit' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B', tier: 'free', maxTokens: 8192, description: 'Google, petit et rapide' },
  ],
  nvidia: [
    { id: 'nvidia/nemotron-3-super-120b-a12b', name: 'Nemotron 3 Super 120B', tier: 'free', maxTokens: 1000000, description: 'MoE 12B actifs, 1M ctx, gratuit' },
    { id: 'deepseek-ai/deepseek-v4-flash', name: 'DeepSeek V4 Flash', tier: 'free', maxTokens: 1000000, description: '284B MoE, 1M ctx, gratuit' },
    { id: 'qwen/qwen3.5-122b-a10b', name: 'Qwen 3.5 122B', tier: 'free', maxTokens: 262144, description: 'Alibaba, 262K ctx, gratuit' },
    { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', tier: 'paid', maxTokens: 131072, description: 'Meta, payant' },
  ],
  gemini: [
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', tier: 'free', maxTokens: 1048576, description: '1M ctx, gratuit, le plus rapide' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tier: 'free', maxTokens: 1048576, description: '1M ctx, gratuit, plus intelligent' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', tier: 'paid', maxTokens: 1048576, description: 'Dernier modèle, payant' },
    { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', tier: 'paid', maxTokens: 1048576, description: 'Le plus puissant, payant' },
  ],
  openrouter: [
    { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'Nemotron 3 Ultra 550B (Free)', tier: 'free', maxTokens: 1000000, description: 'MoE 55B actifs, 1M ctx' },
    { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B (Free)', tier: 'free', maxTokens: 1000000, description: 'MoE 12B actifs, 1M ctx' },
    { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder (Free)', tier: 'free', maxTokens: 1048576, description: '480B MoE, coding, 1M ctx' },
    { id: 'openai/gpt-oss-120b:free', name: 'GPT-OSS 120B (Free)', tier: 'free', maxTokens: 131072, description: 'OpenAI open-weight, gratuit' },
    { id: 'openai/gpt-oss-20b:free', name: 'GPT-OSS 20B (Free)', tier: 'free', maxTokens: 131072, description: 'OpenAI open-weight, rapide' },
    { id: 'poolside/laguna-m.1:free', name: 'Laguna M.1 (Free)', tier: 'free', maxTokens: 262144, description: 'Poolside coding, gratuit' },
  ],
};

export interface ApiConfig {
  groqKey: string;
  openrouterKey: string;
  geminiKey: string;
  nvidiaKey: string;
  defaultLlm: LlmProvider;
  defaultModel: string; // Model ID for the default provider
  serperKey: string;
  unsplashKey: string;
  pexelsKey: string;
  gmailSmtpHost: string;
  gmailSmtpPort: number;
  gmailSmtpUser: string;
  gmailSmtpPassword: string;
  gmailSmtpFromName: string;
  gmailSmtpFromEmail: string;
  gmailSmtpSecure: boolean;
  whopDepositLink: string;
  whopFinalPaymentLink: string;
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
  gmailSmtpHost: 'smtp.gmail.com',
  gmailSmtpPort: 587,
  gmailSmtpUser: '',
  gmailSmtpPassword: '',
  gmailSmtpFromName: '',
  gmailSmtpFromEmail: '',
  gmailSmtpSecure: true,
  whopDepositLink: '',
  whopFinalPaymentLink: '',
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
