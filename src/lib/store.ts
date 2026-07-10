// ============================================================
// LeadForge AI — Store Barrel Export
// Re-exports everything from supabase-store for backward compatibility.
// New code should import directly from the specific modules.
// ============================================================

// Types
export type { Lead, LlmProvider, ApiConfig, ApiStatus, EmailTemplate, ScheduledEmail } from './types';
export { defaultApiConfig, defaultEmailTemplates } from './types';

// Utils
export { safeStr, safeNum, safeStrArr, proxyImage, proxyImg, getTemplateType, mapColumns, exportLeadsCSV, isEnglishText, extractEmail, extractPhone, snippetsText, isEmailDomainValid } from './utils';

// LLM
export { generateWebsitePrompt } from './llm/prompts';

// Scoring
export { calculateScore } from './api/scoring';
