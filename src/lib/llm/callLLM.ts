// ============================================================
// LeadForge AI — LLM API Calls
// ============================================================

import { ApiConfig } from '../types';
import { apiErrorState, detectApiError } from '../api-error-state';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const RATE_LIMIT_DELAY_MS = 2000; // Augmenté à 2s pour éviter 429
const GROQ_TPM_LIMIT = 200000;
const GROQ_TPM_BUFFER = 500;
const RATE_LIMIT_PROVIDER_SKIP_DELAY = 5000; // Attente avant de passer au provider suivant en cas de 429

let lastApiCallTimestamp = 0;
let tokensUsedInMinute = 0;
let tokensResetTimestamp = 0;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

async function enforceRateLimit(promptLength: number = 0): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTimestamp;
  if (now - tokensResetTimestamp > 60000) {
    tokensUsedInMinute = 0;
    tokensResetTimestamp = now;
  }
  const estimatedTokens = estimateTokens(promptLength.toString()) + 500;
  if (tokensUsedInMinute + estimatedTokens > GROQ_TPM_LIMIT - GROQ_TPM_BUFFER) {
    const waitTime = 60000 - (now - tokensResetTimestamp) + 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    tokensUsedInMinute = 0;
    tokensResetTimestamp = Date.now();
  }
  if (timeSinceLastCall < RATE_LIMIT_DELAY_MS) {
    const waitTime = RATE_LIMIT_DELAY_MS - timeSinceLastCall;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  tokensUsedInMinute += estimatedTokens;
  lastApiCallTimestamp = Date.now();
}

function extractRetryDelay(error: any): number | null {
  const message = error?.message || '';
  const match = message.match(/Please try again in ([\d.]+)(s|ms)/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    return unit === 's' ? value * 1000 : value;
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
      if (attempt === maxRetries || !shouldRetry(error)) throw error;
      const suggestedDelay = extractRetryDelay(lastError);
      if (suggestedDelay) {
        const safeDelay = suggestedDelay < 10000
          ? Math.max(suggestedDelay + 1000, 62000 - (Date.now() % 60000))
          : suggestedDelay + 1000;
        await new Promise(resolve => setTimeout(resolve, safeDelay));
        tokensUsedInMinute = 0;
        tokensResetTimestamp = Date.now();
      } else {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

function isRateLimitError(error: any): boolean {
  if (error?.status === 429) return true;
  if (error?.message?.includes('rate_limit')) return true;
  if (error?.code === 'rate_limit_exceeded') return true;
  return false;
}

function buildCallProvider(config: ApiConfig) {
  return async function callProvider(provider: string, apiKey: string, model: string, maxTokens: number): Promise<string> {
    if (!apiKey) return '';
    const truncatedPrompt = '4000';
    await enforceRateLimit(parseInt(truncatedPrompt));
    try {
      return await retryWithBackoff(async () => {
        const res = await fetch('/api/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, apiKey, body: { model, messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: truncatedPrompt }], temperature: 0.7, max_tokens: maxTokens } }),
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
      }, isRateLimitError, 1); // Max 1 retry sur 429
    } catch (err: any) {
      if (isRateLimitError(err)) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_PROVIDER_SKIP_DELAY));
      }
      throw err;
    }
  };
}

export async function callLLM(config: ApiConfig, prompt: string, systemPrompt?: string): Promise<string> {
  const truncatedPrompt = prompt.slice(0, 4000);
  const messages = [
    { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
    { role: 'user', content: truncatedPrompt }
  ];

  const callProvider = async (provider: string, apiKey: string, model: string, maxTokens: number): Promise<string> => {
    if (!apiKey) return '';
    await enforceRateLimit(truncatedPrompt.length);
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
      }, isRateLimitError, 1); // Max 1 retry sur 429
    } catch (err: any) {
      if (isRateLimitError(err)) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_PROVIDER_SKIP_DELAY));
      }
      throw err;
    }
  };

  const defaultLlm = config.defaultLlm || 'groq';
  const providers = [
    { id: 'groq', key: config.groqKey, model: 'llama-3.1-8b-instant', maxTokens: 1024 },
    { id: 'nvidia', key: config.nvidiaKey, model: 'meta/llama-3.1-8b-instruct', maxTokens: 1024 },
    { id: 'gemini', key: config.geminiKey, model: 'gemini-2.0-flash-lite', maxTokens: 1024 },
    { id: 'openrouter', key: config.openrouterKey, model: 'meta-llama/llama-3.1-8b-instruct:free', maxTokens: 1024 },
  ];
  const defaultIdx = providers.findIndex(p => p.id === defaultLlm);
  const ordered = defaultIdx >= 0
    ? [providers[defaultIdx], ...providers.filter((_, i) => i !== defaultIdx)]
    : providers;
  const providerOrder = ordered.filter(p => p.key).map(p => () => callProvider(p.id, p.key, p.model, p.maxTokens));

  for (let i = 0; i < providerOrder.length; i++) {
    try {
      const result = await providerOrder[i]();
      if (result) return result;
    } catch (err: any) {
      const msg = String(err?.message || err).toLowerCase();
      const isTransient = msg.includes('failed to fetch') || msg.includes('cors') || msg.includes('network') || isRateLimitError(err);
      if (!isTransient) throw err;
    }
  }
  return '';
}

export async function callLLMForWebsite(config: ApiConfig, prompt: string, systemPrompt?: string): Promise<string> {
  const truncatedPrompt = prompt.slice(0, 4000);
  const messages = [
    { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
    { role: 'user', content: truncatedPrompt }
  ];

  const callProvider = async (provider: string, apiKey: string, model: string, maxTokens: number): Promise<string> => {
    if (!apiKey) return '';
    await enforceRateLimit(truncatedPrompt.length);
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
      }, isRateLimitError, 1); // Max 1 retry sur 429
    } catch (err: any) {
      if (isRateLimitError(err)) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_PROVIDER_SKIP_DELAY));
      }
      throw err;
    }
  };

  const defaultLlm = config.defaultLlm || 'groq';
  const providerOrder: Array<() => Promise<string>> = [];
  const providers = [
    { id: 'groq', key: config.groqKey, model: 'llama-3.1-8b-instant', maxTokens: 4096 },
    { id: 'nvidia', key: config.nvidiaKey, model: 'meta/llama-3.1-8b-instruct', maxTokens: 4096 },
    { id: 'gemini', key: config.geminiKey, model: 'gemini-2.0-flash-lite', maxTokens: 8192 },
    { id: 'openrouter', key: config.openrouterKey, model: 'meta-llama/llama-3.1-8b-instruct:free', maxTokens: 8192 },
  ];
  const defaultIdx = providers.findIndex(p => p.id === defaultLlm);
  const ordered = defaultIdx >= 0
    ? [providers[defaultIdx], ...providers.filter((_, i) => i !== defaultIdx)]
    : providers;
  for (const p of ordered) {
    if (!p.key) continue;
    providerOrder.push(() => callProvider(p.id, p.key, p.model, p.maxTokens));
  }

  for (let i = 0; i < providerOrder.length; i++) {
    try {
      const result = await providerOrder[i]();
      if (result) return result;
    } catch (err: any) {
      const msg = String(err?.message || err).toLowerCase();
      const isTransient = msg.includes('failed to fetch') || msg.includes('cors') || msg.includes('network') || isRateLimitError(err);
      if (!isTransient) throw err;
    }
  }
  return '';
}
