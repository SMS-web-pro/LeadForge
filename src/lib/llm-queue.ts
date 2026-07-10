// ============================================================
// LeadForge AI — LLM Request Queue
// File d'attente séquentielle pour éviter les erreurs 429/404
// Un seul appel LLM à la fois, avec delays entre chaque requête
// ============================================================

import { logger } from './logger';

interface QueuedRequest {
  id: string;
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

// File d'attente globale
const queue: QueuedRequest[] = [];
let isProcessing = false;
let lastRequestTime = 0;

// Délai minimum entre chaque requête LLM (3 secondes)
const MIN_DELAY_MS = 3000;

// Délai après un 429 avant de reprendre (15 secondes)
const RATE_LIMIT_PAUSE_MS = 15000;

// Délai après un 404 avant de reprendre (10 secondes)  
const NOT_FOUND_PAUSE_MS = 10000;

let globalPauseUntil = 0;

let requestCounter = 0;

function generateId(): string {
  return `llm_${Date.now()}_${++requestCounter}`;
}

async function processQueue(): Promise<void> {
  if (isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  
  while (queue.length > 0) {
    // Vérifier si on est en pause globale
    const now = Date.now();
    if (now < globalPauseUntil) {
      const waitMs = globalPauseUntil - now;
      logger.log(`⏸️ LLM Queue: Pause globale pendant ${Math.round(waitMs/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
    
    // Délai minimum entre requêtes
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    if (timeSinceLastRequest < MIN_DELAY_MS && lastRequestTime > 0) {
      const waitMs = MIN_DELAY_MS - timeSinceLastRequest;
      logger.log(`⏳ LLM Queue: Attente ${waitMs}ms entre les requêtes...`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
    
    const request = queue.shift();
    if (!request) break;
    
    const age = Date.now() - request.timestamp;
    if (age > 60000) {
      // Requête trop vieille (> 1 minute), on la rejette
      logger.warn(`🗑️ LLM Queue: Requête ${request.id} expirée (${Math.round(age/1000)}s)`);
      request.reject(new Error('Request expired in queue'));
      continue;
    }
    
    logger.log(`🚀 LLM Queue: Exécution de ${request.id} (${queue.length} en attente)`);
    lastRequestTime = Date.now();
    
    try {
      const result = await request.fn();
      request.resolve(result);
    } catch (error: any) {
      // Si 429, mettre en pause globale
      if (error?.status === 429) {
        logger.warn(`🚫 LLM Queue: 429 reçu, pause de ${RATE_LIMIT_PAUSE_MS/1000}s`);
        globalPauseUntil = Date.now() + RATE_LIMIT_PAUSE_MS;
      }
      // Si 404, pause courte
      if (error?.status === 404) {
        logger.warn(`⚠️ LLM Queue: 404 reçu, pause de ${NOT_FOUND_PAUSE_MS/1000}s`);
        globalPauseUntil = Date.now() + NOT_FOUND_PAUSE_MS;
      }
      request.reject(error);
    }
  }
  
  isProcessing = false;
}

export function enqueueLLMRequest<T>(
  fn: () => Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = generateId();
    const request: QueuedRequest = {
      id,
      fn,
      resolve,
      reject,
      timestamp: Date.now(),
    };
    
    queue.push(request);
    logger.log(`📥 LLM Queue: Requête ${id} ajoutée (${queue.length} total)`);
    
    // Lancer le traitement (sera no-op si déjà en cours)
    processQueue();
  });
}

export function getQueueSize(): number {
  return queue.length;
}

export function isQueueProcessing(): boolean {
  return isProcessing;
}
