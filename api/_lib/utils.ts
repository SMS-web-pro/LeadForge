import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const getBaseUrl = () => {
  // Use localhost for development, production domain for production
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5174';
  }
  return 'https://www.services-siteup.online';
};

const LOGO_SVG = `<svg width="220" height="50" viewBox="0 0 280 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="5" width="50" height="50" rx="14" fill="#D4500A" />
  <text x="25" y="41" font-family="Arial" font-weight="900" font-size="28" fill="white" text-anchor="middle">ST</text>
  <text x="62" y="32" font-family="Arial" font-weight="bold" font-size="24" fill="#1a202c">Services-Siteup</text>
  <text x="62" y="50" font-family="Arial" font-size="11" fill="#718096" font-style="italic">Propulsez votre présence en ligne</text>
</svg>`;

const DOC_STYLE = `
    <style>
      * { box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 0; margin: 0; color: #1a202c; background-color: #f0f4f8; }
      .container { width: 95%; max-width: 750px; margin: 20px auto; background: white; padding: 25px 40px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative; overflow: hidden; }
      .print-btn { position: absolute; top: 10px; right: 40px; background: #D4500A; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 10px; z-index: 10; }
      @media print { .print-btn { display: none; } .container { box-shadow: none; margin: 0; width: 100%; padding: 15px; } body { background: white; } }
      .header { display: flex; justify-content: space-between; border-bottom: 2px solid #edf2f7; padding-bottom: 10px; margin-bottom: 15px; align-items: flex-start; }
      .client-info { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #edf2f7; font-size: 12px; }
      .section-title { background: #f1f5f9; color: #D4500A; padding: 5px 10px; font-size: 12px; font-weight: bold; border-radius: 4px; margin-top: 15px; border-left: 4px solid #D4500A; }
      table.pro-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
      table.pro-table td { padding: 8px 12px; border-bottom: 1px solid #f7fafc; font-size: 13px; line-height: 1.4; vertical-align: top; }
      .total-box { background: #f8fafc; color: #1a202c; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #edf2f7; border-left: 5px solid #28a745; text-align: right; }
      .status-badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 5px 12px; border-radius: 20px; font-weight: bold; font-size: 11px; text-transform: uppercase; margin-top: 5px; }
    </style>
`;

export async function generateAndSaveDevis(lead: any, price: string = '146'): Promise<string> {
  const devisNumber = `DEV-${lead.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
  const today = new Date().toLocaleDateString('fr-FR');

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
    <title>Devis ${devisNumber}</title>
    ${DOC_STYLE}
  </head><body>
    <div class="container">
      <button class="print-btn" onclick="window.print()">📥 IMPRIMER / PDF</button>
      <div class="header">
        ${LOGO_SVG}
        <div style="text-align:right; flex-shrink: 0;">
          <h2 style="margin:0; font-size:24px; font-weight:900;">DEVIS</h2>
          <p style="margin:0; color:#718096; font-size:11px;">N° ${devisNumber}<br>Date : ${today}</p>
        </div>
      </div>
      <div class="client-info">
        <div style="flex: 1;"><strong>Services-Siteup</strong><br>siteup.services@gmail.com</div>
        <div style="text-align:right; flex: 1;"><strong>${lead.name}</strong><br>${lead.city || ''}</div>
      </div>

      <div class="section-title">🌐 SITE WEB PROFESSIONNEL COMPLET</div>
      <table class="pro-table">
        <tr><td style="color:#D4500A; width:20px;">•</td><td><strong>Design sur mesure</strong> : Création unique adaptée à votre image et votre secteur d''activité</td></tr>
        <tr><td style="color:#D4500A;">•</td><td><strong>Responsive design</strong> : Affichage parfait sur ordinateur, tablette et smartphone</td></tr>
        <tr><td style="color:#D4500A;">•</td><td><strong>Pages essentielles</strong> : Accueil, Présentation, Services, Contact...</td></tr>
        <tr><td style="color:#D4500A;">•</td><td><strong>Formulaire de contact & WhatsApp</strong> : Vos clients peuvent vous contacter directement</td></tr>
        <tr><td style="color:#D4500A;">•</td><td><strong>Chatbot intelligent</strong> : Assistant 24/7 pour répondre aux questions</td></tr>
      </table>

      <div class="section-title">🚀 OPTIMISATION ET PERFORMANCE</div>
      <table class="pro-table">
        <tr><td style="color:#D4500A; width:20px;">•</td><td><strong>SEO optimisé</strong> : Référencement naturel pour apparaître sur Google</td></tr>
        <tr><td style="color:#D4500A;">•</td><td><strong>Performance & Sécurité</strong> : Chargement optimisé et Certificat SSL inclus</td></tr>
      </table>

      <div class="section-title">🏆 AVANTAGES & GARANTIES</div>
      <table class="pro-table">
        <tr><td style="color:#D4500A; width:20px;">•</td><td><strong>Garantie satisfaction</strong> : Remboursement complet si non satisfait sous 15j</td></tr>
        <tr><td style="color:#D4500A;">•</td><td><strong>Livraison Express</strong> : Site web prêt en 2 jours ouvrés</td></tr>
        <tr><td style="color:#D4500A;">•</td><td><strong>Propriété totale</strong> : Vous êtes 100% propriétaire de votre site et domaine</td></tr>
      </table>

      <div class="price-box" style="background:#f8fafc; color:#1a202c; padding:15px; border-radius:8px; margin-top:20px; border:1px solid #edf2f7; border-left:5px solid #1a202c;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="margin:0; font-size:20px;">INVESTISSEMENT : ${price} €</h3>
            <p style="margin:2px 0 0 0; font-size:11px; opacity:0.8;">Hébergement et domaine inclus la 1ère année.</p>
          </div>
          <div style="text-align:right">
            <span style="border:1px solid #D4500A; color:#D4500A; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:11px;">PACK TOUT INCLUS</span>
          </div>
        </div>
      </div>

      <div class="modalities" style="background: #f0fff4; border: 1px solid #c6f6d5; padding: 12px; border-radius: 8px; margin-top: 15px; color: #22543d; border-left: 5px solid #48bb78;">
        <p style="margin:0; font-size:13px; line-height:1.4;">
          <strong>✅ Modalités :</strong> Acompte de démarrage de <strong>46€</strong>. Solde de <strong>100€</strong> à la livraison.
        </p>
      </div>

      <div style="margin-top:20px; padding-top:10px; border-top:1px solid #edf2f7;">
        <p style="font-size:11px; color:#718096; margin:0;">Signature Prestataire</p>
        <div style="font-weight:bold; font-size:15px; color:#D4500A;">Services-Siteup</div>
      </div>
    </div>
  </body></html>`;

  const fileName = `devis-${lead.id}-${Date.now()}.html`;
  const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, Buffer.from(html, 'utf-8'), { 
    contentType: 'text/html; charset=utf-8', 
    upsert: true 
  });
  if (uploadError) throw uploadError;

  const publicUrl = `${getBaseUrl()}/docs/${fileName}`;
  await supabase.from('leads').update({ devis_url: publicUrl }).eq('id', lead.id);
  return publicUrl;
}

export async function generateAndSaveInvoice(lead: any, price: string = '146', type: 'deposit' | 'final' = 'deposit'): Promise<string> {
  const invNumber = `INV-${lead.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
  const amount = type === 'deposit' ? '46' : '100';
  const today = new Date().toLocaleDateString('fr-FR');

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
    <title>Facture ${invNumber}</title>
    ${DOC_STYLE}
  </head><body>
    <div class="container">
      <button class="print-btn" onclick="window.print()">📥 IMPRIMER / PDF</button>
      <div class="header">
        ${LOGO_SVG}
        <div style="text-align:right; flex-shrink: 0;">
          <h2 style="margin:0; font-size:24px; font-weight:900;">FACTURE</h2>
          <p style="margin:0; color:#718096; font-size:11px;">N° ${invNumber}<br>Date : ${today}</p>
          <div class="status-badge">PAYÉE</div>
        </div>
      </div>
      <div class="client-info">
        <div style="flex: 1;"><strong>Services-Siteup</strong><br>siteup.services@gmail.com</div>
        <div style="text-align:right; flex: 1;"><strong>${lead.name}</strong><br>${lead.city || ''}</div>
      </div>

      <div class="section-title">DÉTAIL DE LA PRESTATION</div>
      <table class="pro-table" style="width:100%;">
        <tr style="border-bottom: 2px solid #edf2f7; font-weight: bold; font-size: 11px; text-transform: uppercase; color: #718096;">
          <td style="padding: 10px;">Designation</td>
          <td style="padding: 10px; text-align: right;">Montant</td>
        </tr>
        <tr>
          <td style="padding: 15px 10px;">
            <strong>Prestation Digitale Services-Siteup</strong><br>
            <span style="font-size: 12px; color: #718096;">
              ${type === 'deposit' ? 'Acompte de démarrage - Lancement de la production' : 'Solde final - Livraison et validation du site web'}
            </span>
          </td>
          <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 16px;">${amount} €</td>
        </tr>
      </table>

      <div class="total-box">
        <p style="margin:0; font-size:13px; color:#718096;">Total perçu le ${today}</p>
        <p style="margin:5px 0 0 0; font-size:28px; font-weight: 900; color: #28a745;">${amount} €</p>
      </div>

      <div style="margin-top:40px; padding-top:20px; border-top:1px solid #edf2f7; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <p style="font-size:11px; color:#718096; margin:0;">Signature Prestataire</p>
          <div style="font-weight:bold; font-size:15px; color:#D4500A;">Services-Siteup</div>
        </div>
        <div style="font-size:10px; color:#cbd5e0;">Facture acquittée numériquement</div>
      </div>
    </div>
  </body></html>`;

  const fileName = `inv-${type}-${lead.id}-${Date.now()}.html`;
  const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, Buffer.from(html, 'utf-8'), { 
    contentType: 'text/html; charset=utf-8', 
    upsert: true 
  });
  if (uploadError) throw uploadError;

  const publicUrl = `${getBaseUrl()}/docs/${fileName}`;
  await supabase.from('leads').update({ invoice_url: publicUrl }).eq('id', lead.id);
  return publicUrl;
}
