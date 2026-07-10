-- ============================================================
-- LeadForge AI - Migration: Ajout colonne default_model
-- Permet la sélection de modèle LLM (gratuit vs payant)
-- ============================================================

ALTER TABLE api_config
  ADD COLUMN IF NOT EXISTS default_model TEXT DEFAULT 'llama-3.1-8b-instant';

COMMENT ON COLUMN api_config.default_model IS 'ID du modèle LLM sélectionné pour le provider par défaut (gratuit ou payant)';

SELECT 'Migration terminée : Colonne default_model ajoutée à api_config.' as status;
