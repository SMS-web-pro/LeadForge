// ============================================================
// LeadForge AI — API Test System
// Teste les APIs avant le lancement des agents
// ============================================================

import { ApiConfig } from './supabase-store';

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

// Config des endpoints LLM
const LLM_ENDPOINTS: Record<string, { url: string; model: string; needsProxy: boolean }> = {
  groq:      { url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.1-8b-instant', needsProxy: false },
  nvidia:    { url: '/api/llm', model: 'meta/llama-3.1-8b-instruct', needsProxy: true },
  gemini:    { url: '/api/llm', model: 'gemini-2.0-flash-lite', needsProxy: true },
  openrouter: { url: '/api/llm', model: 'meta-llama/llama-3.1-8b-instruct:free', needsProxy: true },
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
    const fetchOptions: RequestInit = endpoint.needsProxy
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            apiKey,
            body: { model: endpoint.model, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 10 },
          }),
        }
      : {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: endpoint.model,
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 10,
          }),
        };

    const response = await fetch(endpoint.url, fetchOptions);

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      const hasContent = !!data.choices?.[0]?.message?.content;
      return { service: provider, status: 'ok', message: `API ${provider} fonctionnelle${hasContent ? '' : ' (réponse vide)'}` };
    }

    // 404 = proxy non déployé, pas une erreur du provider lui-même
    if (response.status === 404) {
      return { service: provider, status: 'error', message: `Proxy /api/llm non disponible (404)`, statusCode: 404 };
    }

    if (response.status === 429) {
      return { service: provider, status: 'error', message: `Rate limit ${provider} atteint`, statusCode: 429 };
    }

    return { service: provider, status: 'error', message: `Erreur API ${provider}: ${response.status}`, statusCode: response.status };
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
  console.log(`🔧 API Testing: Default LLM is ${defaultLlm}`);

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
    console.warn(`⚠️ Tests API échoués:\n${failing}`);
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
