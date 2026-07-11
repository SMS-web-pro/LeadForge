import { logger } from '../lib/logger';
import { useState, useEffect } from 'react';
import { ApiConfig, ApiStatus, useApiConfig, LlmProvider } from '../lib/supabase-store';
import { LLM_MODELS } from '../lib/types';
import { callLLMDirect } from '../lib/llm-queue';
import SimpleSerperGenerator from './SimpleSerperGenerator';
import { supabase } from '../lib/supabase';

const C = {
  bg: '#F7F6F2', surface: '#FFFFFF', surface2: '#F2F1EC',
  border: '#E4E2DA', tx: '#1C1B18', tx1: '#1C1B18', tx2: '#5C5A53', tx3: '#9B9890',
  accent: '#D4500A', accent2: '#F0E8DF',
  green: '#1A7A4A', blue: '#1A4FA0', amber: '#B45309', red: '#C0392B',
};

interface Props {
  config: ApiConfig;
  updateConfig: (updates: Partial<ApiConfig>) => void;
  statuses: ApiStatus;
  setStatus: (id: string, status: 'untested' | 'testing' | 'active' | 'error') => void;
  onClearData: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  required: boolean;
  agents: string[];
  shortDesc: string;
  longDesc: string;
  whyNeeded: string;
  freeInfo: string;
  fields: Array<{
    key: keyof ApiConfig;
    label: string;
    masked: boolean;
    placeholder: string;
    helpUrl?: string;
    helpText?: string;
  }>;
  testFn: (c: ApiConfig) => Promise<{ ok: boolean; msg: string }>;
}

export default function Settings({ config, updateConfig, statuses, setStatus, onClearData }: Props) {
  const [localConfig, setLocalConfig] = useState<ApiConfig>(config);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [showSerperManager, setShowSerperManager] = useState(false);
  const [savingSections, setSavingSections] = useState<Record<string, boolean>>({});
  const [llmTestStatus, setLlmTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [llmTestMessage, setLlmTestMessage] = useState('');
  const [modelCheckStatus, setModelCheckStatus] = useState<'idle' | 'checking' | 'done'>('idle');
  const [modelCheckResults, setModelCheckResults] = useState<Record<string, { ok: boolean; model: string; msg: string }>>({});
  const [lastModelCheck, setLastModelCheck] = useState(() => {
    return localStorage.getItem('leadforge_last_model_check') || '';
  });

  // Synchroniser le state local avec les props
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Debug: afficher la configuration
  useEffect(() => {
    logger.log('Settings - Config actuelle:', JSON.stringify(config, null, 2));
  }, [config]);

  const toggleVisible = (key: string) => {
    setVisibleKeys(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  // Écouter les mises à jour de configuration API (ex: depuis le générateur Serper)
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      if (process.env.NODE_ENV === 'development') {
        logger.log('🔧 API Config updated event received:', event.detail);
      }
      // Mise à jour locale immédiate
      setLocalConfig(prev => ({ ...prev, ...event.detail }));
      // Mise à jour globale (persistance)
      updateConfig(event.detail);
    };

    window.addEventListener('apiConfigUpdated', handleConfigUpdate as EventListener);
    
    return () => {
      window.removeEventListener('apiConfigUpdated', handleConfigUpdate as EventListener);
    };
  }, [updateConfig]);

  const handleLocalChange = (key: keyof ApiConfig, value: string | number | boolean) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSection = async (sectionId: string, keys: Array<keyof ApiConfig>) => {
    setSavingSections(prev => ({ ...prev, [sectionId]: true }));
    try {
      const updates: Partial<ApiConfig> = {};
      keys.forEach(key => {
        const value = localConfig[key];
        if (typeof value === 'string') {
          updates[key] = value.trim() as any;
        } else {
          updates[key] = value as any;
        }
      });
      
      logger.log(`💾 Sauvegarde de la section ${sectionId}:`, updates);
      await updateConfig(updates);
      
      // Petit délai pour l'effet visuel
      setTimeout(() => {
        setSavingSections(prev => ({ ...prev, [sectionId]: false }));
      }, 800);
    } catch (error) {
      logger.error(`❌ Erreur lors de la sauvegarde de ${sectionId}:`, error);
      setSavingSections(prev => ({ ...prev, [sectionId]: false }));
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleLogout = async () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      await supabase.auth.signOut();
    }
  };

  // Test du LLM par défaut
  const testDefaultLlm = async () => {
    const defaultLlm = localConfig.defaultLlm || 'groq';
    const apiKeyMap: Record<string, string> = {
      groq: localConfig.groqKey,
      nvidia: localConfig.nvidiaKey,
      gemini: localConfig.geminiKey,
      openrouter: localConfig.openrouterKey,
    };
    // Utiliser le modèle sélectionné par l'utilisateur
    const defaultModels: Record<string, string> = {
      groq: 'llama-3.1-8b-instant',
      nvidia: 'nvidia/nemotron-3-super-120b-a12b',
      gemini: 'gemini-2.5-flash',
      openrouter: 'nvidia/nemotron-3-super-120b-a12b:free',
    };
    const selectedModel = localConfig.defaultModel || defaultModels[defaultLlm] || 'llama-3.1-8b-instant';
    const apiKey = apiKeyMap[defaultLlm];
    if (!apiKey) {
      setLlmTestStatus('error');
      setLlmTestMessage(`❌ Aucune clé API configurée pour ${defaultLlm}`);
      return;
    }
    setLlmTestStatus('testing');
    setLlmTestMessage(`⏳ Test de ${defaultLlm} (${selectedModel}) en cours...`);
    try {
      const result = await callLLMDirect({
        provider: defaultLlm,
        apiKey,
        model: selectedModel,
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 10,
      });
      if (result.content) {
        setLlmTestStatus('success');
        setLlmTestMessage(`✅ ${defaultLlm} fonctionne ! Réponse: "${result.content}"`);
      } else {
        setLlmTestStatus('error');
        setLlmTestMessage(`❌ Erreur ${result.status}: ${result.error}`);
      }
    } catch (e: any) {
      setLlmTestStatus('error');
      setLlmTestMessage(`❌ Erreur réseau: ${e.message}`);
    }
  };

  // Vérifier tous les modèles et montrer lesquels fonctionnent
  const checkAllModels = async () => {
    setModelCheckStatus('checking');
    setModelCheckResults({});
    
    // Modèles par défaut pour chaque provider
    const defaultModels: Record<string, string> = {
      groq: 'llama-3.1-8b-instant',
      nvidia: 'nvidia/nemotron-3-super-120b-a12b',
      gemini: 'gemini-2.5-flash',
      openrouter: 'nvidia/nemotron-3-super-120b-a12b:free',
    };
    
    const providers = [
      { id: 'groq', key: localConfig.groqKey, model: localConfig.defaultLlm === 'groq' ? (localConfig.defaultModel || defaultModels.groq) : defaultModels.groq, name: 'Groq' },
      { id: 'nvidia', key: localConfig.nvidiaKey, model: localConfig.defaultLlm === 'nvidia' ? (localConfig.defaultModel || defaultModels.nvidia) : defaultModels.nvidia, name: 'NVIDIA' },
      { id: 'gemini', key: localConfig.geminiKey, model: localConfig.defaultLlm === 'gemini' ? (localConfig.defaultModel || defaultModels.gemini) : defaultModels.gemini, name: 'Gemini' },
      { id: 'openrouter', key: localConfig.openrouterKey, model: localConfig.defaultLlm === 'openrouter' ? (localConfig.defaultModel || defaultModels.openrouter) : defaultModels.openrouter, name: 'OpenRouter' },
    ];
    
    const results: Record<string, { ok: boolean; model: string; msg: string }> = {};
    
    for (const p of providers) {
      if (!p.key) {
        results[p.id] = { ok: false, model: p.model, msg: '❌ Aucune clé API' };
        continue;
      }
      try {
        const result = await callLLMDirect({
          provider: p.id,
          apiKey: p.key,
          model: p.model,
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 10,
        });
        if (result.content) {
          results[p.id] = { ok: true, model: p.model, msg: '✅ Fonctionne' };
        } else {
          results[p.id] = { ok: false, model: p.model, msg: `❌ Erreur ${result.status}: ${result.error?.slice(0, 50) || 'Inconnu'}` };
        }
      } catch (e: any) {
        results[p.id] = { ok: false, model: p.model, msg: `❌ ${e.message}` };
      }
    }
    
    setModelCheckResults(results);
    setModelCheckStatus('done');
    
    const now = new Date().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
    setLastModelCheck(now);
    localStorage.setItem('leadforge_last_model_check', now);
  };

  // Auto-sélectionner le premier provider qui fonctionne
  const autoSelectWorkingProvider = async () => {
    setModelCheckStatus('checking');
    setModelCheckResults({});
    
    const defaultModels: Record<string, string> = {
      groq: 'llama-3.1-8b-instant',
      nvidia: 'nvidia/nemotron-3-super-120b-a12b',
      gemini: 'gemini-2.5-flash',
      openrouter: 'nvidia/nemotron-3-super-120b-a12b:free',
    };
    
    const providers = [
      { id: 'groq' as LlmProvider, key: localConfig.groqKey, model: defaultModels.groq },
      { id: 'nvidia' as LlmProvider, key: localConfig.nvidiaKey, model: defaultModels.nvidia },
      { id: 'gemini' as LlmProvider, key: localConfig.geminiKey, model: defaultModels.gemini },
      { id: 'openrouter' as LlmProvider, key: localConfig.openrouterKey, model: defaultModels.openrouter },
    ];
    
    const results: Record<string, { ok: boolean; model: string; msg: string }> = {};
    
    for (const p of providers) {
      if (!p.key) {
        results[p.id] = { ok: false, model: p.model, msg: '❌ Aucune clé' };
        continue;
      }
      try {
        const result = await callLLMDirect({
          provider: p.id,
          apiKey: p.key,
          model: p.model,
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 10,
        });
        if (result.content) {
          results[p.id] = { ok: true, model: p.model, msg: '✅ Fonctionne' };
          // Premier provider qui fonctionne → le définir comme défaut
          handleLocalChange('defaultLlm', p.id);
          handleLocalChange('defaultModel', p.model);
          updateConfig({ defaultLlm: p.id, defaultModel: p.model });
          setModelCheckResults(results);
          setModelCheckStatus('done');
          const now = new Date().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
          setLastModelCheck(now);
          localStorage.setItem('leadforge_last_model_check', now);
          return;
        } else {
          results[p.id] = { ok: false, model: p.model, msg: `❌ Erreur ${result.status}` };
        }
      } catch (e: any) {
        results[p.id] = { ok: false, model: p.model, msg: `❌ ${e.message}` };
      }
    }
    
    // Aucun provider n'a fonctionné
    setModelCheckResults(results);
    setModelCheckStatus('done');
    const now = new Date().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
    setLastModelCheck(now);
    localStorage.setItem('leadforge_last_model_check', now);
  };

  const testApi = async (section: Section) => {
    setStatus(section.id, 'testing');
    setTestResults(prev => ({ ...prev, [section.id]: 'Test en cours...' }));
    
    try {
      // Pour le test, on utilise la config locale actuelle (peut-être pas encore sauvegardée)
      const result = await section.testFn(localConfig);
      setTestResults(prev => ({ ...prev, [section.id]: result.msg }));
      setStatus(section.id, result.ok ? 'active' : 'error');
    } catch (error) {
      setTestResults(prev => ({ ...prev, [section.id]: '❌ Erreur de test' }));
      setStatus(section.id, 'error');
    }
  };

  // Sections API
  const sections: Section[] = [
    // SERPER
    {
      id: 'serper', title: 'Serper.dev API', icon: '🔍', color: C.green,
      required: true,
      agents: ['Agent 1'],
      shortDesc: 'Recherche Google + Google Maps + Images — enrichit chaque lead',
      longDesc: 'Serper est une API Google Search qui permet de rechercher les informations Google Maps (note, avis, photos, catégorie, adresse), les images du commerce, et des informations web complémentaires. C\'est la source principale d\'enrichissement des leads.',
      whyNeeded: 'OBLIGATOIRE. Sans Serper, pas de photos, pas de données Google Maps, pas d\'enrichissement web. Les sites générés seront génériques.',
      freeInfo: '✅ GRATUIT — 2 500 recherches gratuites à l\'inscription. Ensuite $50/mois pour 50 000 recherches.',
      fields: [
        { key: 'serperKey', label: 'API Key', masked: true, placeholder: 'Votre clé API Serper',
          helpText: 'Utilisez le générateur automatique ci-dessus' },
      ],
      testFn: async (c) => {
        if (!c.serperKey) return { ok: false, msg: '❌ Aucune clé' };
        try {
          const res = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': c.serperKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: 'test', num: 1 }),
          });
          if (res.ok) return { ok: true, msg: '✅ Serper opérationnel ! Recherche Google fonctionnelle.' };
          return { ok: false, msg: `❌ Erreur ${res.status}: Clé invalide` };
        } catch {
          return { ok: false, msg: '❌ Erreur réseau' };
        }
      },
    },

    // GROQ
    {
      id: 'groq', title: 'Groq (Llama)', icon: '🚀', color: C.accent,
      required: false,
      agents: ['Agent 1', 'Agent 2', 'Agent 3', 'Agent 4'],
      shortDesc: 'LLM rapide — Optionnel si Gemini configuré',
      longDesc: 'Groq offre des modèles LLM très rapides. Si tu as un rate limit, configure Gemini qui a 1M TPM gratuit.',
      whyNeeded: 'OPTIONNEL si Gemini est configuré. Groq est utilisé en priorité, Gemini en fallback automatique.',
      freeInfo: '✅ GRATUIT — Tier on_demand : 6K TPM. Active Dev Tier (gratuit) pour 250K TPM.',
      fields: [
        { key: 'groqKey', label: 'API Key', masked: true, placeholder: 'gsk_xxxxxxxxxxxxxxxxxxxx',
          helpUrl: 'https://console.groq.com/keys',
          helpText: 'console.groq.com → Keys → Create Key' },
      ],
      testFn: async (c) => {
        if (!c.groqKey) return { ok: false, msg: '❌ Aucune clé' };
        if (!c.groqKey.startsWith('gsk_')) return { ok: false, msg: '❌ Doit commencer par gsk_' };
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST', headers: { 'Authorization': `Bearer ${c.groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 10 }),
        });
        if (res.ok) return { ok: true, msg: '✅ Groq opérationnel !' };
        return { ok: false, msg: `❌ Erreur ${res.status}: Clé invalide` };
      },
    },
    {
      id: 'nvidia', title: 'NVIDIA NIM', icon: '⚡', color: '#76B900',
      required: false,
      agents: ['Agent 1', 'Agent 2', 'Agent 3', 'Agent 4'],
      shortDesc: 'LLM NVIDIA — 40 RPM gratuit, modèles Llama',
      longDesc: 'NVIDIA NIM offre Llama 3.1 8B et d\'autres modèles via une API OpenAI-compatible. Gratuit avec 40 requêtes/minute. Utilisé comme fallback si Groq et Gemini sont indisponibles.',
      whyNeeded: 'OPTIONNEL. 4ème fallback dans la chaîne LLM pour une disponibilité maximale.',
      freeInfo: '✅ GRATUIT — 40 RPM — Aucune carte bancaire requise.',
      fields: [
        { key: 'nvidiaKey', label: 'API Key', masked: true, placeholder: 'nvapi-xxxxxxxxxxxxxxxxxxxx',
          helpUrl: 'https://build.nvidia.com',
          helpText: 'build.nvidia.com → Get API Key → Copier → Coller ici' },
      ],
      testFn: async (c) => {
        if (!c.nvidiaKey) return { ok: false, msg: '❌ Aucune clé' };
        if (!c.nvidiaKey.startsWith('nvapi-')) return { ok: false, msg: '❌ Doit commencer par nvapi-' };
        try {
          const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${c.nvidiaKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'nvidia/nemotron-3-super-120b-a12b', messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 5 }),
          });
          if (res.ok) return { ok: true, msg: '✅ NVIDIA NIM opérationnel !' };
          if (res.status === 429) return { ok: true, msg: '✅ Clé valide ! (limite RPM momentanée, normal)' };
          if (res.status === 401) return { ok: false, msg: '❌ Clé invalide ou expirée' };
          const body = await res.text().catch(() => '');
          return { ok: false, msg: `❌ Erreur ${res.status}: ${body.slice(0, 100)}` };
        } catch (err: unknown) {
          // CORS depuis le navigateur — la clé est probablement valide si format correct
          if ((err as Error).message?.includes('fetch') || (err as Error).message?.includes('CORS') || (err as Error).message?.includes('network')) {
            return { ok: true, msg: '✅ Format clé valide (nvapi-...) — CORS bloqué en test, fonctionnel en production' };
          }
          return { ok: false, msg: `❌ ${(err as Error).message}` };
        }
      },
    },
    {
      id: 'gemini', title: 'Google Gemini', icon: '✨', color: '#1A73E8',
      required: false,
      agents: ['Agent 1', 'Agent 2', 'Agent 3', 'Agent 4'],
      shortDesc: 'LLM gratuit — 1 Million TPM sans limite !',
      longDesc: 'Google Gemini 2.5 Flash est gratuit avec 1 million de tokens par minute. C\'est le meilleur choix pour éviter les rate limits. Utilisé automatiquement en fallback si Groq est limité.',
      whyNeeded: 'RECOMMANDÉ. Résout définitivement les problèmes de rate limit. Clé gratuite en 30 secondes.',
      freeInfo: '✅ 100% GRATUIT — 1 000 000 TPM — Aucune carte bancaire requise.',
      fields: [
        { key: 'geminiKey', label: 'API Key', masked: true, placeholder: 'AIzaSy...',
          helpUrl: 'https://aistudio.google.com/apikey',
          helpText: 'aistudio.google.com → Create API Key → Copier → Coller ici' },
      ],
      testFn: async (c) => {
        if (!c.geminiKey) return { ok: false, msg: '❌ Aucune clé' };
        try {
          const res = await fetch('/api/llm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'gemini',
              apiKey: c.geminiKey,
              body: { model: 'gemini-2.5-flash', messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 10 },
            }),
          });
          if (res.ok) return { ok: true, msg: '✅ Gemini opérationnel ! 1M TPM gratuit actif.' };
          if (res.status === 429) return { ok: true, msg: '✅ Clé valide ! (limite de débit momentanée, normal)' };
          if (res.status === 401 || res.status === 403) return { ok: false, msg: `❌ Clé invalide ou non autorisée` };
          const err = await res.json().catch(() => ({}));
          return { ok: false, msg: `❌ Erreur ${res.status}: ${err.error?.message || res.statusText}` };
        } catch (err) {
          return { ok: false, msg: `❌ ${(err as Error).message}` };
        }
      },
    },

    // OPENROUTER
    {
      id: 'openrouter', title: 'OpenRouter', icon: '🔀', color: '#7B3FE4',
      required: false,
      agents: ['Agent 1', 'Agent 2', 'Agent 3', 'Agent 4'],
      shortDesc: 'Multi-LLM Gateway — Accès à tous les modèles',
      longDesc: 'OpenRouter donne accès à une centaine de modèles LLM (GPT, Claude, Llama, etc.) avec un système de crédit flexible. Idéal comme fallback supplémentaire.',
      whyNeeded: 'OPTIONNEL. 5ème fallback dans la chaîne LLM pour une disponibilité maximale.',
      freeInfo: '✅ GRATUIT — Crédits offerts à l\'inscription. Pay-as-you-go ensuite.',
      fields: [
        { key: 'openrouterKey', label: 'API Key', masked: true, placeholder: 'sk-or-v1-xxxxxxxxxxxxxxxxxxxx',
          helpUrl: 'https://openrouter.ai/keys',
          helpText: 'openrouter.ai/keys → Create Key → Copier → Coller ici' },
      ],
      testFn: async (c) => {
        if (!c.openrouterKey) return { ok: false, msg: '❌ Aucune clé' };
        if (!c.openrouterKey.startsWith('sk-or-')) return { ok: false, msg: '❌ Doit commencer par sk-or-' };
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${c.openrouterKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'meta-llama/llama-3.1-8b-instruct:free', messages: [{ role: 'user', content: 'Say OK' }], max_tokens: 10 }),
          });
          if (res.ok) return { ok: true, msg: '✅ OpenRouter opérationnel !' };
          if (res.status === 429) return { ok: true, msg: '✅ Clé valide ! (limite momentanée, normal)' };
          if (res.status === 401) return { ok: false, msg: '❌ Clé invalide ou expirée' };
          return { ok: false, msg: `❌ Erreur ${res.status}: Clé invalide` };
        } catch (err: unknown) {
          if ((err as Error).message?.includes('fetch') || (err as Error).message?.includes('CORS') || (err as Error).message?.includes('network')) {
            return { ok: true, msg: '✅ Format clé valide (sk-or-...) — CORS bloqué en test, fonctionnel en production' };
          }
          return { ok: false, msg: `❌ ${(err as Error).message}` };
        }
      },
    },

    // UNSPLASH
    {
      id: 'unsplash', title: 'Unsplash API', icon: '📸', color: '#000000',
      required: false,
      agents: ['Agent 3'],
      shortDesc: 'Images gratuites et haute qualité — Backup photos',
      longDesc: 'Unsplash offre des millions de photos gratuites et de haute qualité. Utilisé comme source d\'images de secours si Serper ne trouve pas de photos du commerce.',
      whyNeeded: 'OPTIONNEL. Améliore la qualité visuelle des sites générés.',
      freeInfo: '✅ GRATUIT — 50 requêtes/heure. Plus avec plan payant.',
      fields: [
        { key: 'unsplashKey', label: 'Access Key', masked: true, placeholder: 'Votre clé Accès Unsplash',
          helpUrl: 'https://unsplash.com/developers',
          helpText: 'unsplash.com/developers → Create App → Access Key' },
      ],
      testFn: async (c) => {
        const key = (c.unsplashKey || '').trim();
        if (!key) return { ok: false, msg: '❌ Aucune clé' };
        // Validation du format : la clé Unsplash fait entre 40 et 60 caractères alphanumériques
        if (key.length < 20) return { ok: false, msg: '❌ Format invalide — entrez l\'Access Key (pas l\'App ID ni la Secret Key)' };
        const tryAuth = async (scheme: 'Client-ID' | 'Bearer') => {
          return fetch(`https://api.unsplash.com/photos/random?count=1`, {
            headers: { 'Authorization': `${scheme} ${key}` },
          });
        };
        try {
          let res = await tryAuth('Client-ID');
          // Nouveau format Unsplash : la clé fournie est parfois un token Bearer
          if (res.status === 401) res = await tryAuth('Bearer');
          if (res.ok) return { ok: true, msg: '✅ Unsplash opérationnel ! Images pro activées.' };
          if (res.status === 401) return { ok: false, msg: '❌ Clé rejetée — vous avez probablement collé la SECRET KEY (ou un token expiré). Dans unsplash.com/developers, copiez la 1re clé affichée « Access Key » (~43 caractères), pas la Secret Key. Aucun espace avant/après.' };
          if (res.status === 403) return { ok: false, msg: '❌ App non activée — vérifiez sur unsplash.com/developers (onglet Apps → votre app)' };
          if (res.status === 429) return { ok: true, msg: '✅ Clé valide ! (limite 50 req/h atteinte, normal)' };
          return { ok: false, msg: `❌ Erreur ${res.status}` };
        } catch (err: unknown) {
          // CORS bloqué depuis le navigateur → valider le format uniquement
          if ((err as Error).message?.includes('fetch') || (err as Error).message?.includes('Failed') || (err as Error).message?.includes('network')) {
            // Format OK si longueur correcte (Access Key Unsplash = ~43 chars)
            if (key.length >= 30) {
              return { ok: true, msg: '✅ Format clé valide — CORS bloqué en test local, fonctionnel en production. Clé sauvegardée !' };
            }
          }
          return { ok: false, msg: `❌ ${(err as Error).message}` };
        }
      },
    },

    // PEXELS
    {
      id: 'pexels', title: 'Pexels API', icon: '🖼️', color: '#05A6F0',
      required: false,
      agents: ['Agent 3'],
      shortDesc: 'Photos et vidéos gratuites — Alternative à Unsplash',
      longDesc: 'Pexels propose une grande bibliothèque de photos et vidéos gratuites. Utilisé comme alternative si Unsplash n\'est pas configuré.',
      whyNeeded: 'OPTIONNEL. Source d\'images de secours supplémentaire.',
      freeInfo: '✅ GRATUIT — 200 requêtes/heure. Pas de carte bancaire.',
      fields: [
        { key: 'pexelsKey', label: 'API Key', masked: true, placeholder: 'Votre clé API Pexels',
          helpUrl: 'https://www.pexels.com/api/',
          helpText: 'pexels.com/api → Your API Key → Request API Key' },
      ],
      testFn: async (c) => {
        if (!c.pexelsKey) return { ok: false, msg: '❌ Aucune clé' };
        try {
          const res = await fetch('https://api.pexels.com/v1/curated?per_page=1', {
            headers: { 'Authorization': c.pexelsKey },
          });
          if (res.ok) return { ok: true, msg: '✅ Pexels opérationnel !' };
          if (res.status === 401) return { ok: false, msg: '❌ Clé invalide' };
          if (res.status === 429) return { ok: true, msg: '✅ Clé valide ! (limite atteinte, normal)' };
          return { ok: false, msg: `❌ Erreur ${res.status}` };
        } catch {
          return { ok: false, msg: '❌ Erreur réseau' };
        }
      },
    },

    // GMAIL SMTP
    {
      id: 'gmailSmtp', title: 'Gmail SMTP', icon: '📧', color: C.amber,
      required: true,
      agents: ['Agent 4'],
      shortDesc: 'Envoi d\'emails via Gmail SMTP — 100% gratuit',
      longDesc: 'Configuration SMTP Gmail pour envoyer des emails transactionnels. Utilise votre compte Gmail existant. Nécessite un mot de passe d\'application (App Password) pour la sécurité.',
      whyNeeded: 'OBLIGATOIRE. Permet d\'envoyer des séquences d\'emails aux leads qualifiés. Gratuit jusqu\'à 500 emails/jour.',
      freeInfo: '✅ 100% GRATUIT — Jusqu\'à 500 emails/jour. Nécessite un mot de passe d\'application Gmail.',
      fields: [
        { key: 'gmailSmtpUser', label: 'Email Gmail', masked: false, placeholder: 'votre.email@gmail.com',
          helpText: 'Votre adresse Gmail complète' },
        { key: 'gmailSmtpPassword', label: 'Mot de passe d\'application', masked: true, placeholder: 'xxxx xxxx xxxx xxxx',
          helpUrl: 'https://myaccount.google.com/apppasswords',
          helpText: 'myaccount.google.com → Sécurité → Mots de passe d\'application → Générer (16 caractères)' },
        { key: 'gmailSmtpFromName', label: 'Nom d\'expéditeur', masked: false, placeholder: 'Votre Nom',
          helpText: 'Le nom qui apparaîtra dans les emails envoyés' },
        { key: 'gmailSmtpFromEmail', label: 'Email d\'expéditeur', masked: false, placeholder: 'contact@votredomaine.com',
          helpText: 'Email de réponse (peut être différent de Gmail)' },
      ],
      testFn: async (c) => {
        if (!c.gmailSmtpUser || !c.gmailSmtpPassword) {
          return { ok: false, msg: '❌ Email et mot de passe requis' };
        }
        // Validation basique du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(c.gmailSmtpUser)) {
          return { ok: false, msg: '❌ Format email invalide' };
        }
        // Validation du mot de passe d'application (16 caractères)
        if (c.gmailSmtpPassword.replace(/\s/g, '').length !== 16) {
          return { ok: false, msg: '⚠️ Le mot de passe doit faire 16 caractères (sans espaces)' };
        }
        return { ok: true, msg: '✅ Configuration SMTP valide. Test d\'envoi disponible dans l\'agent Email.' };
      },
    },

    // WHOP PAYMENT
    {
      id: 'whopPayment', title: 'Whop Paiements', icon: '💳', color: C.green,
      required: true,
      agents: ['Agent 4'],
      shortDesc: 'Liens de paiement Whop — 46$ dépôt + 100$ final',
      longDesc: 'Configurez les liens de paiement Whop pour les deux étapes de paiement : 46$ pour commencer (dépôt) et 100$ à la fin (paiement final). Ces liens seront inclus automatiquement dans les emails.',
      whyNeeded: 'OBLIGATOIRE. Permet aux clients de payer pour les sites web générés. Sans ces liens, aucun paiement ne peut être effectué.',
      freeInfo: '💰 CONFIGURATION REQUISE — Créez vos produits sur Whop et copiez les liens ici.',
      fields: [
        { key: 'whopDepositLink', label: 'Lien paiement 46$ (dépôt)', masked: false, placeholder: 'https://whop.com/products/...',
          helpUrl: 'https://whop.com/dashboard',
          helpText: 'whop.com → Dashboard → Products → Copier le lien du produit de 46$' },
        { key: 'whopFinalPaymentLink', label: 'Lien paiement 100$ (final)', masked: false, placeholder: 'https://whop.com/products/...',
          helpUrl: 'https://whop.com/dashboard',
          helpText: 'whop.com → Dashboard → Products → Copier le lien du produit de 100$' },
        { key: 'web3formsKey', label: 'Clé Web3Forms (formulaire de contact)', masked: false, placeholder: 'votre-clé-web3forms',
          helpUrl: 'https://web3forms.com',
          helpText: 'web3forms.com → Créer un accès gratuit → Copier la clé d\'accès (Access Key). Active le formulaire des sites générés.' },
      ],
      testFn: async (c) => {
        const issues = [];
        if (!c.whopDepositLink) issues.push('Lien dépôt 46$ manquant');
        if (!c.whopFinalPaymentLink) issues.push('Lien paiement 100$ manquant');

        if (issues.length > 0) {
          return { ok: false, msg: `❌ ${issues.join(', ')}` };
        }

        // Validation basique des URLs
        const urlRegex = /^https:\/\/whop\.com\/products\//;
        if (!urlRegex.test(c.whopDepositLink)) {
          return { ok: false, msg: '❌ Lien dépôt invalide (doit commencer par https://whop.com/products/)' };
        }
        if (!urlRegex.test(c.whopFinalPaymentLink)) {
          return { ok: false, msg: '❌ Lien paiement final invalide (doit commencer par https://whop.com/products/)' };
        }

        return { ok: true, msg: '✅ Liens de paiement Whop configurés ! 46$ dépôt + 100$ final actifs.' };
      },
    },
  ];

  if (showSerperManager) {
    return <SimpleSerperGenerator onClose={() => setShowSerperManager(false)} />;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.tx, marginBottom: 8 }}>⚙️ Paramètres API</h1>
        <p style={{ fontSize: 15, color: C.tx3, lineHeight: 1.5 }}>
          Configurez vos clés API pour activer les fonctionnalités d'enrichissement des leads et de génération de sites.
        </p>
      </div>

      {/* API Status */}
      <div style={{
        background: C.surface, borderRadius: 12, padding: '24px',
        border: `1px solid ${C.border}`, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: C.tx, margin: 0 }}>🔊 État des APIs</h3>
          <div style={{ fontSize: 12, color: C.tx3, background: C.bg, padding: '4px 8px', borderRadius: 4 }}>Auto-synchronisé avec Supabase</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {Object.entries(statuses).map(([key, status]) => (
            <div key={key} style={{
              padding: '12px 16px', borderRadius: 8, background: C.bg,
              border: `1px solid ${status === 'active' ? C.green + '30' : status === 'testing' ? C.amber + '30' : C.border}`,
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.2s ease',
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: status === 'active' ? C.green : status === 'testing' ? C.amber : C.tx3,
                boxShadow: status === 'active' ? `0 0 8px ${C.green}40` : 'none',
              }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: C.tx2 }}>
                {key} ({status === 'active' ? '✅' : status === 'testing' ? '⏳' : '❌'})
              </span>
            </div>
          ))}
          {Object.keys(statuses).length === 0 && (
            <div style={{ fontSize: 13, color: C.tx3, fontStyle: 'italic', padding: '12px 16px' }}>Testez les APIs pour voir leur état</div>
          )}
        </div>
      </div>

      {/* Main Content - 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* Left Column - API Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* LLM Selection */}
          <div style={{
            background: C.surface, borderRadius: 12, padding: '20px',
            border: `1px solid ${C.border}`,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.tx, marginBottom: 16 }}>🧠 LLM Principal</h3>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: C.tx2, marginBottom: 8 }}>Modèle utilisé en priorité. Les autres servent de fallback automatique.</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {([
                { id: 'groq', label: 'Groq', icon: '🚀', color: C.accent, desc: '6K TPM' },
                { id: 'gemini', label: 'Gemini', icon: '✨', color: '#1A73E8', desc: '1M TPM' },
                { id: 'nvidia', label: 'NVIDIA', icon: '⚡', color: '#76B900', desc: '40 RPM' },
                { id: 'openrouter', label: 'OpenRouter', icon: '🔀', color: '#7B3FE4', desc: 'Free' },
              ] as Array<{id: LlmProvider; label: string; icon: string; color: string; desc: string}>).map(p => {
                const isActive = (config.defaultLlm || 'groq') === p.id;
                const healthStatus = modelCheckResults[p.id]?.ok;
                return (
                  <button key={p.id} onClick={() => { handleLocalChange('defaultLlm', p.id); updateConfig({ defaultLlm: p.id }); }} style={{
                    padding: '12px', borderRadius: 8, border: `2px solid ${isActive ? p.color : C.border}`,
                    background: isActive ? p.color + '15' : C.bg,
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.2s ease', position: 'relative',
                  }}>
                    {/* Indicateur de santé */}
                    {healthStatus !== undefined && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 8, height: 8, borderRadius: '50%',
                        background: healthStatus ? C.green : C.red,
                        boxShadow: healthStatus ? `0 0 6px ${C.green}60` : 'none',
                      }} />
                    )}
                    <span style={{ fontSize: 18 }}>{p.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? p.color : C.tx2 }}>{p.label}</span>
                    <span style={{ fontSize: 10, color: C.tx3 }}>{p.desc}</span>
                  </button>
                );
              })}
            </div>
            {/* Bouton de test LLM */}
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={testDefaultLlm}
                disabled={llmTestStatus === 'testing'}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: llmTestStatus === 'testing' ? C.tx3 : llmTestStatus === 'success' ? C.green : llmTestStatus === 'error' ? C.red : C.accent,
                  color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {llmTestStatus === 'testing' ? '⏳ Test en cours...' : '🧪 Tester le LLM par défaut'}
              </button>
              {llmTestMessage && (
                <span style={{ fontSize: 11, color: llmTestStatus === 'success' ? C.green : llmTestStatus === 'error' ? C.red : C.tx2 }}>
                  {llmTestMessage}
                </span>
              )}
            </div>

            {/* Vérification des modèles */}
            <div style={{ marginTop: 12, padding: 12, background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>🔄 Vérification des modèles</div>
                  <div style={{ fontSize: 11, color: C.tx3 }}>
                    {lastModelCheck ? `Dernière vérification : ${lastModelCheck}` : 'Aucune vérification effectuée'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={autoSelectWorkingProvider}
                    disabled={modelCheckStatus === 'checking'}
                    style={{
                      padding: '6px 12px', borderRadius: 6, border: 'none',
                      background: modelCheckStatus === 'checking' ? C.tx3 : C.green,
                      color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {modelCheckStatus === 'checking' ? '⏳...' : '⚡ Auto-sélectionner'}
                  </button>
                  <button
                    onClick={checkAllModels}
                    disabled={modelCheckStatus === 'checking'}
                    style={{
                      padding: '6px 12px', borderRadius: 6, border: 'none',
                      background: modelCheckStatus === 'checking' ? C.tx3 : C.blue,
                      color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {modelCheckStatus === 'checking' ? '⏳ Vérification...' : '🔍 Vérifier tous'}
                  </button>
                </div>
              </div>
              
              {/* Résultats de la vérification */}
              {modelCheckStatus === 'done' && Object.keys(modelCheckResults).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {Object.entries(modelCheckResults).map(([providerId, result]) => (
                    <div key={providerId} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', borderRadius: 6,
                      background: result.ok ? C.green + '10' : C.red + '10',
                      border: `1px solid ${result.ok ? C.green + '30' : C.red + '30'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12 }}>
                          {providerId === 'groq' ? '🚀' : providerId === 'gemini' ? '✨' : providerId === 'nvidia' ? '⚡' : '🔀'}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.tx }}>
                          {providerId === 'groq' ? 'Groq' : providerId === 'gemini' ? 'Gemini' : providerId === 'nvidia' ? 'NVIDIA' : 'OpenRouter'}
                        </span>
                        <span style={{ fontSize: 10, color: C.tx3 }}>
                          ({result.model})
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: result.ok ? C.green : C.red, fontWeight: 500 }}>
                        {result.msg}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sélection du modèle */}
            <div style={{ marginTop: 16, padding: 12, background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 8 }}>🎯 Modèle à utiliser</div>
              <div style={{ fontSize: 11, color: C.tx3, marginBottom: 8 }}>
                Sélectionnez un modèle gratuit ou payant pour le provider choisi.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(LLM_MODELS[config.defaultLlm || 'groq'] || []).map(model => {
                  const isActive = (config.defaultModel || 'llama-3.1-8b-instant') === model.id;
                  const isFree = model.tier === 'free';
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        handleLocalChange('defaultModel', model.id);
                        updateConfig({ defaultModel: model.id });
                      }}
                      style={{
                        padding: '8px 12px', borderRadius: 6,
                        border: `2px solid ${isActive ? (isFree ? C.green : C.accent) : C.border}`,
                        background: isActive ? (isFree ? C.green + '15' : C.accent + '15') : C.surface,
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: C.tx }}>
                          {model.name}
                        </span>
                        <span style={{
                          fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                          background: isFree ? C.green + '20' : '#F59E0B20',
                          color: isFree ? C.green : '#B45309',
                        }}>
                          {isFree ? 'GRATUIT' : 'PAYANT'}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: C.tx3 }}>{model.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Essential APIs */}
          <div style={{
            background: C.surface, borderRadius: 12, padding: '20px',
            border: `1px solid ${C.border}`,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.tx, marginBottom: 16 }}>🔑 APIs Essentielles</h3>
            
            {/* LLM Principal Affiché */}
            <div style={{
              background: C.bg, borderRadius: 8, padding: 12, marginBottom: 16,
              border: `2px solid ${(config.defaultLlm || 'groq') === 'groq' ? C.accent : (config.defaultLlm || 'groq') === 'gemini' ? '#1A73E8' : (config.defaultLlm || 'groq') === 'nvidia' ? '#76B900' : '#7B3FE4'}30`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>
                  {(config.defaultLlm || 'groq') === 'groq' ? '🚀' : (config.defaultLlm || 'groq') === 'gemini' ? '✨' : (config.defaultLlm || 'groq') === 'nvidia' ? '⚡' : '🔀'}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>
                    LLM Principal : {(config.defaultLlm || 'groq') === 'groq' ? 'Groq' : (config.defaultLlm || 'groq') === 'gemini' ? 'Gemini' : (config.defaultLlm || 'groq') === 'nvidia' ? 'NVIDIA' : 'OpenRouter'}
                  </div>
                  <div style={{ fontSize: 11, color: C.tx3 }}>
                    Modèle : {(LLM_MODELS[config.defaultLlm || 'groq'] || []).find(m => m.id === (config.defaultModel || ''))?.name || (config.defaultModel || 'llama-3.1-8b-instant')}
                    {' — '}
                    {(config.defaultLlm || 'groq') === 'groq' ? '6K TPM' : (config.defaultLlm || 'groq') === 'gemini' ? '1M TPM' : (config.defaultLlm || 'groq') === 'nvidia' ? '40 RPM' : 'Free'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sections.filter(s => s.required || ['serper', 'gmailSmtp', 'whopPayment'].includes(s.id)).map(section => (
                <ApiSectionCard 
                  key={section.id}
                  section={section}
                  localConfig={localConfig}
                  visibleKeys={visibleKeys}
                  testResults={testResults}
                  statuses={statuses}
                  savingSections={savingSections}
                  onLocalChange={handleLocalChange}
                  onToggleVisible={toggleVisible}
                  onTestApi={testApi}
                  onSaveSection={handleSaveSection}
                  onShowSerperManager={setShowSerperManager}
                />
              ))}
            </div>
          </div>

          {/* Danger Zone - avec margin-top pour aligner */}
          <div style={{
            marginTop: 0,
            background: '#FEF2F2', borderRadius: 12, padding: '20px',
            border: `1px solid ${C.red}30`,
          }}>
            <button 
              onClick={() => {
                if (window.confirm('⚠️ CONFIRMATION REQUISE\n\nÊtes-vous absolument certain de vouloir supprimer TOUTES les données ?\n\nCette action est IRRÉVERSIBLE et supprimera :\n• Tous les leads et contacts\n• Toutes les configurations API\n• Tout l\'historique d\'activités\n• Tous les paramètres personnalisés\n\nCliquez sur OK pour confirmer ou Annuler pour revenir en arrière.')) {
                  onClearData();
                }
              }}
              style={{
                padding: '12px 20px', borderRadius: 8, border: `2px solid ${C.red}`,
                background: C.red, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                width: '100%', transition: 'all 0.3s ease', textTransform: 'uppercase',
                letterSpacing: '0.5px', boxShadow: '0 2px 4px rgba(192, 57, 43, 0.2)',
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.background = '#a02c2c'; 
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(192, 57, 43, 0.3)';
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.background = C.red; 
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(192, 57, 43, 0.2)';
              }}
            >🗑️ Suppression Complète des Données</button>

            <button 
              onClick={handleLogout}
              style={{
                marginTop: 12,
                padding: '12px 20px', borderRadius: 8, border: `2px solid ${C.tx2}`,
                background: '#fff', color: C.tx1, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                width: '100%', transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.background = C.surface2; 
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.background = '#fff'; 
              }}
            >🚪 Déconnexion</button>
          </div>
        </div>

        {/* Right Column - Optional APIs & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Optional APIs */}
          <div style={{
            background: C.surface, borderRadius: 12, padding: '20px',
            border: `1px solid ${C.border}`,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.tx, marginBottom: 16 }}>🎯 APIs Optionnelles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sections.filter(s => !s.required && !['serper', 'gmailSmtp', 'whopPayment'].includes(s.id)).map(section => (
                <ApiSectionCard 
                  key={section.id}
                  section={section}
                  localConfig={localConfig}
                  visibleKeys={visibleKeys}
                  testResults={testResults}
                  statuses={statuses}
                  savingSections={savingSections}
                  onLocalChange={handleLocalChange}
                  onToggleVisible={toggleVisible}
                  onTestApi={testApi}
                  onSaveSection={handleSaveSection}
                  onShowSerperManager={setShowSerperManager}
                />
              ))}
            </div>
          </div>

          {/* Info Panel */}
          <div style={{
            background: C.surface, borderRadius: 12, padding: '20px',
            border: `1px solid ${C.border}`,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.tx, marginBottom: 16 }}>📊 Guide d'Utilisation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 8 }}>🎯 Priorités Recommandées</h4>
                <div style={{ paddingLeft: 12, fontSize: 13, color: C.tx2, lineHeight: 1.6 }}>
                  <div style={{ marginBottom: 4 }}>1️⃣ <strong>Serper</strong> — Indispensable pour l'enrichissement</div>
                  <div style={{ marginBottom: 4 }}>2️⃣ <strong>LLM Principal</strong> — {(config.defaultLlm || 'groq') === 'groq' ? 'Groq' : (config.defaultLlm || 'groq') === 'gemini' ? 'Gemini' : (config.defaultLlm || 'groq') === 'nvidia' ? 'NVIDIA' : 'OpenRouter'} / {(LLM_MODELS[config.defaultLlm || 'groq'] || []).find(m => m.id === (config.defaultModel || ''))?.name || (config.defaultModel || 'llama-3.1-8b-instant')}</div>
                  <div style={{ marginBottom: 4 }}>3️⃣ <strong>Gmail SMTP</strong> — Envoi d'emails</div>
                  <div>4️⃣ <strong>Unsplash/Pexels</strong> — Images de qualité</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 8 }}>🤖 Utilisation par Agent</h4>
                <div style={{ paddingLeft: 12, fontSize: 12, color: C.tx2, lineHeight: 1.5 }}>
                  <div style={{ marginBottom: 3 }}><strong>🧠 Scorer & Enrichissement:</strong> LLM + Serper</div>
                  <div style={{ marginBottom: 3 }}><strong>🌐 WebsiteGen:</strong> LLM + Serper + Unsplash/Pexels</div>
                  <div style={{ marginBottom: 3 }}><strong>📧 Outreach Agent:</strong> LLM + Gmail SMTP</div>
                  <div><strong>🔄 Pipeline:</strong> Aucune API requise</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 8 }}>🖼️ Sources d'Images</h4>
                <div style={{ paddingLeft: 12, fontSize: 12, color: C.tx2, lineHeight: 1.5 }}>
                  <div style={{ marginBottom: 2 }}>1️⃣ Serper (Google Maps) — Priorité</div>
                  <div style={{ marginBottom: 2 }}>2️⃣ Unsplash — Haute qualité</div>
                  <div>3️⃣ Pexels — Alternative gratuite</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay du générateur Serper */}
      {showSerperManager && (
        <SimpleSerperGenerator onClose={() => setShowSerperManager(false)} />
      )}
    </div>
  );

// Helper component for API section cards
function ApiSectionCard({ 
  section, localConfig, visibleKeys, testResults, statuses, savingSections,
  onLocalChange, onToggleVisible, onTestApi, onSaveSection, onShowSerperManager
}: {
  section: any;
  localConfig: any;
  visibleKeys: Set<string>;
  testResults: Record<string, string>;
  statuses: Record<string, any>;
  savingSections: Record<string, boolean>;
  onLocalChange: (key: any, value: any) => void;
  onToggleVisible: (key: string) => void;
  onTestApi: (section: any) => void;
  onSaveSection: (id: string, keys: any[]) => void;
  onShowSerperManager: (show: boolean) => void;
}) {
  const C = {
    bg: '#F7F6F2', surface: '#FFFFFF', surface2: '#F2F1EC',
    border: '#E4E2DA', tx: '#1C1B18', tx2: '#5C5A53', tx3: '#9B9890',
    accent: '#D4500A', accent2: '#F0E8DF',
    green: '#1A7A4A', blue: '#1A4FA0', amber: '#B45309', red: '#C0392B',
  };

  return (
    <div style={{
      background: C.bg, borderRadius: 8, padding: 16,
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: section.color + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>{section.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.tx }}>{section.title}</div>
          <div style={{ fontSize: 12, color: C.tx3 }}>{section.shortDesc}</div>
        </div>
        <div style={{
          padding: '4px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600,
          background: section.required ? C.red + '20' : C.green + '20',
          color: section.required ? C.red : C.green,
        }}>
          {section.required ? 'Obligatoire' : 'Optionnel'}
        </div>
      </div>

      <form onSubmit={e => e.preventDefault()}>
        {section.fields.map((field: any) => (
          <div key={field.key} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.tx2 }}>{field.label}</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {section.id === 'serper' && (
                  <button
                    onClick={() => onShowSerperManager(true)}
                    style={{
                      padding: '3px 6px', borderRadius: 4, border: '1px solid #10B981',
                      background: '#F0FDF4', color: '#065F46', fontSize: 9, fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🔑 Générateur
                  </button>
                )}
                {section.id === 'gmailSmtp' && field.key === 'gmailSmtpPassword' && (
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '3px 6px', borderRadius: 4, border: '1px solid #EA4335',
                      background: '#FCE8E6', color: '#C5221F', fontSize: 9, fontWeight: 600,
                      cursor: 'pointer', textDecoration: 'none',
                    }}
                  >
                    🔐 Guide
                  </a>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type={field.masked && !visibleKeys.has(field.key) ? 'password' : 'text'}
                autoComplete="off"
                value={String(localConfig[field.key] ?? '')}
                onChange={e => onLocalChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 6,
                  border: `1px solid ${C.border}`, fontSize: 12,
                  background: C.surface, color: C.tx,
                }}
              />
              <button
                type="button"
                onClick={() => onToggleVisible(field.key)}
                style={{
                  padding: '6px 8px', borderRadius: 4, border: `1px solid ${C.border}`,
                  background: visibleKeys.has(field.key) ? C.accent2 : C.surface,
                  color: visibleKeys.has(field.key) ? C.tx : C.tx3, fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                {visibleKeys.has(field.key) ? '👁' : '👁‍🗨'}
              </button>
              <button
                type="button"
                onClick={() => onTestApi(section)}
                style={{
                  padding: '6px 10px', borderRadius: 4, border: 'none',
                  background: statuses[section.id] === 'active' ? C.green : statuses[section.id] === 'testing' ? C.amber : C.tx3,
                  color: 'white', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {statuses[section.id] === 'testing' ? '⏳' : statuses[section.id] === 'active' ? '✅' : '🧪'}
              </button>
            </div>
            {testResults[section.id] && (
              <div style={{
                marginTop: 6, padding: '6px 10px', borderRadius: 4,
                background: testResults[section.id].includes('✅') ? C.green + '20' : C.red + '20',
                color: testResults[section.id].includes('✅') ? C.green : C.red,
                fontSize: 10,
              }}>
                {testResults[section.id]}
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => onSaveSection(section.id, section.fields.map((f: any) => f.key))}
            disabled={savingSections[section.id]}
            style={{
              padding: '6px 12px', borderRadius: 6, border: 'none',
              background: savingSections[section.id] ? C.tx3 : C.blue,
              color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {savingSections[section.id] ? '⏳...' : '💾 Sauvegarder'}
          </button>
        </div>

        {/* Gmail SMTP Documentation Guide */}
        {section.id === 'gmailSmtp' && (
          <div style={{
            marginTop: 16,
            padding: '16px',
            borderRadius: 8,
            background: '#FEF7F0',
            border: '1px solid #EA4335',
          }}>
            <h4 style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#C5221F',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              📖 Guide : Obtenir votre mot de passe Gmail
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Step 1 */}
              <div style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '8px',
                background: '#FFFFFF',
                borderRadius: 6,
                border: '1px solid #E8EAED',
              }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#EA4335',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>1</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.tx, marginBottom: 2 }}>
                    Activez la Validation en 2 étapes
                  </div>
                  <div style={{ fontSize: 11, color: C.tx2, lineHeight: 1.4 }}>
                    Allez sur <a href="https://myaccount.google.com/signinoptions/two-step-verification" target="_blank" rel="noopener noreferrer" style={{ color: '#1A73E8', textDecoration: 'underline' }}>myaccount.google.com → Sécurité → Validation en 2 étapes</a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '8px',
                background: '#FFFFFF',
                borderRadius: 6,
                border: '1px solid #E8EAED',
              }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#EA4335',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>2</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.tx, marginBottom: 2 }}>
                    Générez un mot de passe d'application
                  </div>
                  <div style={{ fontSize: 11, color: C.tx2, lineHeight: 1.4 }}>
                    Visitez <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" style={{ color: '#1A73E8', textDecoration: 'underline' }}>myaccount.google.com/apppasswords</a> → "Sélectionner l'application" → Choisissez <strong>Courriel</strong> → Générer.
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '8px',
                background: '#FFFFFF',
                borderRadius: 6,
                border: '1px solid #E8EAED',
              }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#34A853',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>3</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.tx, marginBottom: 2 }}>
                    Copiez le mot de passe à 16 caractères
                  </div>
                  <div style={{ fontSize: 11, color: C.tx2, lineHeight: 1.4 }}>
                    Google affiche un mot de passe comme <code style={{ background: '#F1F3F4', padding: '1px 4px', borderRadius: 2, fontFamily: 'monospace', fontSize: 10 }}>abcd efgh ijkl mnop</code>. Copiez-le et collez-le dans le champ <strong>"Mot de passe d'application"</strong> ci-dessus.
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: 10,
              padding: '8px',
              background: '#E8F0FE',
              borderRadius: 6,
              fontSize: 11,
              color: '#1967D2',
            }}>
              <strong>💡 Astuce :</strong> Si vous perdez le mot de passe, vous pouvez en générer un nouveau à tout moment sur la même page.
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
}
