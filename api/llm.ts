import type { VercelRequest, VercelResponse } from '@vercel/node';

// Proxy sécurisé pour débloquer les erreurs CORS et protéger les clés d'API
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Autoriser uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { provider, apiKey, body } = req.body;

  if (!provider || !apiKey || !body) {
    return res.status(400).json({ error: 'Missing parameters (provider, apiKey, body)' });
  }

  let apiUrl = '';
  let providerHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Configuration des endpoints d'IA
  switch (provider) {
    case 'nvidia':
      apiUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
      providerHeaders['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'groq':
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      providerHeaders['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'gemini':
      apiUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
      providerHeaders['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'openrouter':
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      providerHeaders['Authorization'] = `Bearer ${apiKey}`;
      providerHeaders['HTTP-Referer'] = 'https://services-siteup.online';
      providerHeaders['X-Title'] = 'LeadForge AI';
      break;
    default:
      return res.status(400).json({ error: `Provider ${provider} non supporté ou inconnu.` });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50000); // 50s timeout (Vercel limit = 60s, on laisse 10s de marge)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: providerHeaders,
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));
    
    // Renvoyer le statut d'origine et les données
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error(`❌ Proxy Error (${provider}):`, error);
    return res.status(500).json({ 
      error: 'Proxy Error', 
      message: error.message,
      provider 
    });
  }
}
