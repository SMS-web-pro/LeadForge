// ============================================================
// LeadForge AI — API Test System
// Teste les APIs avant le lancement des agents
// ============================================================

import { logger } from './logger';
import { ApiConfig } from './supabase-store';
import { callLLMDirect } from './llm-queue';

export interface ApiTestResult {
  service: string;
  status: 'ok' | 'error' | 'skipped';
  message: string;
  statusCode?: number;
}

export interface ApiTestReport {
  success: boolean;
  results: ApiTestResult[];
  canProceed: boolean;
}

// Test Serper API
async function testSerperApi(config: ApiConfig): Promise<ApiTestResult> {
  if (!config.serperKey) {
    return { service: 'serper', status: 'error', message: 'Clé API Serper non configurée' };
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': config.serperKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: 'test', num: 1 }),
    });

    if (response.ok) {
      return { service: 'serper', status: 'ok', message: 'API Serper fonctionnelle' };
    }

    const errorText = await response.text();
    
    if (errorText.includes('Not enough credits')) {
      return { 
        service: 'serper', 
        status: 'error', 
        message: 'Crédits Serper épuisés - Rechargez votre compte',
        statusCode: 400 
      };
    }

    return { 
      service: 'serper', 
      status: 'error', 
      message: `Erreur API Serper: ${response.status}`,
      statusCode: response.status 
    };
  } catch (error) {
    return { 
      service: 'serper', 
      status: 'error', 
      message: `Erreur réseau: ${(error as Error).message}` 
    };
  }
}

// Config des endpoints LLM — TOUS passent par le proxy /api/llm (évite CORS)
const LLM_ENDPOINTS: Record<string, { model: string }> = {
  groq:      { model: 'llama-3.1-8b-instant' },
  nvidia:    { model: 'nvidia/nemotron-3-super-120b-a12b' },
  gemini:    { model: 'gemini-2.5-flash' },
  openrouter: { model: 'nvidia/nemotron-3-super-120b-a12b:free' },
};

// Test read-only d'un provider LLM — ne modifie PAS l'état global des erreurs
async function testLlmProvider(provider: string, apiKey: string): Promise<ApiTestResult> {
  if (!apiKey) {
    return { service: provider, status: 'error', message: `Clé API ${provider} non configurée` };
  }

  const endpoint = LLM_ENDPOINTS[provider];
  if (!endpoint) {
    return { service: provider, status: 'error', message: `Provider ${provider} inconnu` };
  }

  try {
    // TOUS les providers passent par le proxy /api/llm (évite CORS côté browser)
    const result = await callLLMDirect({
      provider,
      apiKey,
      model: endpoint.model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 10,
    });

    if (result.content) {
      return { service: provider, status: 'ok', message: `API ${provider} fonctionnelle` };
    }
    if (result.status === 404) {
      return { service: provider, status: 'error', message: `Modèle ${endpoint.model} non disponible (404)`, statusCode: 404 };
    }
    if (result.status === 429) {
      return { service: provider, status: 'error', message: `Rate limit ${provider} atteint`, statusCode: 429 };
    }
    if (result.status === 401 || result.status === 403) {
      return { service: provider, status: 'error', message: `Clé API ${provider} invalide`, statusCode: result.status };
    }
    return { service: provider, status: 'error', message: `Erreur API ${provider}: ${result.status} ${(result.error || '').slice(0, 80)}`, statusCode: result.status };
  } catch (error) {
    return { service: provider, status: 'error', message: `Erreur réseau ${provider}: ${(error as Error).message}` };
  }
}

// Test Gmail SMTP
async function testGmailSmtp(config: ApiConfig): Promise<ApiTestResult> {
  if (!config.gmailSmtpUser || !config.gmailSmtpPassword) {
    return { service: 'gmailSmtp', status: 'error', message: 'Configuration SMTP Gmail incomplète' };
  }

  return { 
    service: 'gmailSmtp', 
    status: 'ok', 
    message: 'Configuration SMTP Gmail présente' 
  };
}

// Test toutes les APIs — read-only, ne déclenche PAS d'arrêt d'agents
export async function testAllApis(config: ApiConfig): Promise<ApiTestReport> {
  const results: ApiTestResult[] = [];

  const defaultLlm = config.defaultLlm || 'groq';
  logger.log(`🔧 API Testing: Default LLM is ${defaultLlm}`);

  // Tester Serper + le LLM par défaut en parallèle
  const [serperResult, defaultLlmResult] = await Promise.all([
    testSerperApi(config),
    testLlmProvider(defaultLlm, config[`${defaultLlm}Key` as keyof ApiConfig] as string || ''),
  ]);
  results.push(serperResult, defaultLlmResult);

  // Tester les autres providers configurés en parallèle
  const otherProviders = ['groq', 'nvidia', 'gemini', 'openrouter'].filter(p => p !== defaultLlm);
  const otherTests = otherProviders
    .map(p => ({ key: config[`${p}Key` as keyof ApiConfig] as string || '', provider: p }))
    .filter(t => t.key)
    .map(t => testLlmProvider(t.provider, t.key));
  const otherResults = await Promise.all(otherTests);
  results.push(...otherResults);

  // Gmail SMTP
  const gmailResult = await testGmailSmtp(config);
  results.push(gmailResult);

  const hasWorkingSerper = serperResult.status === 'ok';
  const hasWorkingLlm = defaultLlmResult.status === 'ok';
  const canProceed = hasWorkingSerper;

  if (!canProceed) {
    const failing = results.filter(r => r.status === 'error').map(r => `❌ ${r.service}: ${r.message}`).join('\n');
    logger.warn(`⚠️ Tests API échoués:\n${failing}`);
  }

  return { success: canProceed, results, canProceed };
}

// Fonction pour afficher les résultats de test dans l'UI
export function formatTestResults(report: ApiTestReport): string {
  if (report.canProceed) {
    const workingCount = report.results.filter(r => r.status === 'ok').length;
    return `✅ ${workingCount}/${report.results.length} APIs fonctionnent - Prêt à lancer les agents`;
  }

  const errors = report.results
    .filter(r => r.status === 'error')
    .map(r => `❌ ${r.service}: ${r.message}`)
    .join('\n');

  return `⚠️ Problèmes détectés:\n${errors}`;
}
