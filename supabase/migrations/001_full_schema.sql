-- ============================================================
-- LeadForge AI — Schéma complet pour nouveau projet Supabase
-- Exécuter dans SQL Editor du Dashboard Supabase
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- TABLE: leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  sector TEXT,
  rating NUMERIC,
  reviews_count INTEGER DEFAULT 0,
  has_website BOOLEAN DEFAULT FALSE,
  enriched BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new',
  source TEXT,
  notes TEXT,
  site_generated BOOLEAN DEFAULT FALSE,
  site_url TEXT,
  landing_url TEXT,
  site_html TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_date TEXT,
  email_opened BOOLEAN DEFAULT FALSE,
  email_clicked BOOLEAN DEFAULT FALSE,
  last_contact TEXT,
  campaign TEXT,
  campaign_date TEXT,
  google_rating NUMERIC,
  google_reviews INTEGER,
  google_maps_url TEXT,
  serper_cid TEXT,
  serper_type TEXT,
  serper_hours TEXT,
  serper_snippets TEXT[],
  description TEXT,
  logo TEXT,
  images TEXT[],
  website_images TEXT[],
  google_reviews_data JSONB,
  temperature TEXT,
  tags TEXT[],
  generated_prompt TEXT,
  devis_url TEXT,
  invoice_url TEXT,
  site_clicked BOOLEAN DEFAULT FALSE,
  payment_clicked BOOLEAN DEFAULT FALSE,
  devis_clicked BOOLEAN DEFAULT FALSE,
  invoice_clicked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: api_config
CREATE TABLE IF NOT EXISTS api_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  groq_key TEXT,
  openrouter_key TEXT,
  gemini_key TEXT,
  nvidia_key TEXT,
  default_llm TEXT DEFAULT 'groq',
  serper_key TEXT,
  unsplash_key TEXT,
  pexels_key TEXT,
  gmail_smtp_host TEXT DEFAULT 'smtp.gmail.com',
  gmail_smtp_port INTEGER DEFAULT 587,
  gmail_smtp_user TEXT,
  gmail_smtp_password TEXT,
  gmail_smtp_from_name TEXT,
  gmail_smtp_from_email TEXT,
  gmail_smtp_secure BOOLEAN DEFAULT TRUE,
  whop_deposit_link TEXT,
  whop_final_payment_link TEXT,
  whop_deposit_link_en TEXT DEFAULT '',
  whop_final_payment_link_en TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer la config par défaut
INSERT INTO api_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- TABLE: email_templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT,
  subject TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: scheduled_emails
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  template_id UUID,
  scheduled_for TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: email_logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  to_email TEXT,
  to_name TEXT,
  subject TEXT,
  template_id UUID,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('websites', 'websites', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. RLS POLICIES
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policies leads
DROP POLICY IF EXISTS "Allow all for anon" ON leads;
CREATE POLICY "Allow all for anon" ON leads FOR ALL USING (true) WITH CHECK (true);

-- Policies api_config
DROP POLICY IF EXISTS "Allow all for anon" ON api_config;
CREATE POLICY "Allow all for anon" ON api_config FOR ALL USING (true) WITH CHECK (true);

-- Policies email_templates
DROP POLICY IF EXISTS "Allow all for anon" ON email_templates;
CREATE POLICY "Allow all for anon" ON email_templates FOR ALL USING (true) WITH CHECK (true);

-- Policies scheduled_emails
DROP POLICY IF EXISTS "Allow all for anon" ON scheduled_emails;
CREATE POLICY "Allow all for anon" ON scheduled_emails FOR ALL USING (true) WITH CHECK (true);

-- Policies email_logs
DROP POLICY IF EXISTS "Allow all for anon" ON email_logs;
CREATE POLICY "Allow all for anon" ON email_logs FOR ALL USING (true) WITH CHECK (true);

-- Policies campaigns
DROP POLICY IF EXISTS "Allow all for anon" ON campaigns;
CREATE POLICY "Allow all for anon" ON campaigns FOR ALL USING (true) WITH CHECK (true);

-- Policies storage
DROP POLICY IF EXISTS "Allow all for anon" ON storage.objects;
CREATE POLICY "Allow all for anon" ON storage.objects FOR ALL USING (bucket_id IN ('websites', 'documents'));

-- ============================================================
-- 4. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_sector ON leads(sector);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_enriched ON leads(enriched);
CREATE INDEX IF NOT EXISTS idx_leads_site_generated ON leads(site_generated);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_lead_id ON scheduled_emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status ON scheduled_emails(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_scheduled_for ON scheduled_emails(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- ============================================================
-- 5. REALTIME (pour les mises à jour en temps réel)
-- ============================================================

-- Activer le realtime sur les tables importantes
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE scheduled_emails;

-- ============================================================
-- 6. FONCTIONS UTILES
-- ============================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_api_config_updated_at ON api_config;
CREATE TRIGGER update_api_config_updated_at BEFORE UPDATE ON api_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. EXTENSIONS
-- ============================================================

-- Extension pour les UUIDs (si pas déjà installée)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TERMINÉ ! Toutes les tables, colonnes, storage, RLS, indexes,
-- realtime et triggers sont en place.
-- ============================================================
