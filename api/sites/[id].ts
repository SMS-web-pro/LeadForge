import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Safe Supabase init
function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).end();
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).send('Erreur de configuration serveur.');
  }

  try {
    // 1. Chercher le vrai UUID du lead à partir de son prénom formatté (si c'est ce qui est passé dans l'URL)
    // OU si l'ID est directement un UUID.
    let realLeadId = id;
    
    // Si ce n'est pas un UUID valide, on présume que c'est le "firstName" passé dans l'URL
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (!isUUID) {
      // Nous devons trouver l'UUID du lead correspondant pour chercher son fichier .html dans Storage
      const { data: leadData } = await supabase
        .from('leads')
        .select('id')
        // On ancre sur le dernier segment de chemin (/firstName) pour éviter les faux positifs
        .like('site_url', `%/${id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (leadData) realLeadId = leadData.id;
    }

    // 2. Télécharger le HTML depuis le bucket Storage 'websites' via le backend Vercel
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('websites')
      .download(`${realLeadId}.html`);

    if (downloadError || !fileData) {
      return res.status(404).send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site non trouvé</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .box { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
    h1 { color: #e53e3e; margin-bottom: 8px; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="box">
    <h1>404 — Site non trouvé</h1>
    <p>Ce site n'a pas encore été généré ou n'existe pas.</p>
  </div>
</body>
</html>`);
    }

    // 3. Convertir le Blob en texte et le servir
    const htmlText = await fileData.text();
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(htmlText);

  } catch (e) {
    console.error('Erreur proxy site:', e);
    return res.status(500).send('Erreur lors du chargement du site.');
  }
}
