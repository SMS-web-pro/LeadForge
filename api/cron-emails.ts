import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const EMAIL_REGEX = /^(?!.*\.\.)[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'yopmail.fr', 'fakeinbox.com', 'sharklasers.com',
  'dispostable.com', 'maildrop.cc', 'trashmail.com', 'trashmail.net',
  '10minutemail.com', 'discard.email', 'mailexpire.com', 'mailnesia.com',
]);

const DIRECTORY_DOMAINS = new Set([
  'pagesjaunes.fr', 'societe.com', 'mairie.fr', 'infogreffe.fr',
  'pappers.fr', 'verif.com', 'google.com', 'facebook.com',
  'instagram.com', 'twitter.com', 'x.com', 'linkedin.com',
  'gmail.com', 'yahoo.com', 'yahoo.fr', 'hotmail.com', 'outlook.com',
]);

function isValidEmailForSending(email: string): { valid: boolean; reason?: string } {
  if (!email || typeof email !== 'string') return { valid: false, reason: 'empty' };
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 254) return { valid: false, reason: 'too_long' };
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, reason: 'invalid_format' };
  const domain = trimmed.split('@')[1];
  if (!domain) return { valid: false, reason: 'no_domain' };
  if (DISPOSABLE_DOMAINS.has(domain)) return { valid: false, reason: 'disposable' };
  if (DIRECTORY_DOMAINS.has(domain)) return { valid: false, reason: 'directory' };
  return { valid: true };
}

function isBounceError(errMessage: string): boolean {
  const lower = errMessage.toLowerCase();
  return lower.includes('mailbox') ||
    lower.includes('does not exist') ||
    lower.includes('no such user') ||
    lower.includes('user unknown') ||
    lower.includes('invalid recipient') ||
    lower.includes('recipient rejected') ||
    lower.includes('undeliverable') ||
    lower.includes('bounced') ||
    lower.includes('not found') ||
    lower.includes('address rejected') ||
    lower.includes('over quota');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Config Supabase manquante sur Vercel' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Récupérer la config SMTP
    const { data: config, error: configError } = await supabase
      .from('api_config')
      .select('*')
      .limit(1)
      .single();

    if (configError || !config) throw new Error('Configuration SMTP manquante');

    // 2. Récupérer les emails en attente
    const { data: scheduledEmails, error: fetchError } = await supabase
      .from('scheduled_emails')
      .select('*, leads(*)')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString());

    if (fetchError) throw fetchError;
    if (!scheduledEmails || scheduledEmails.length === 0) {
      return res.json({ success: true, message: 'Aucun email à envoyer pour le moment.' });
    }

    // 3. Récupérer TOUS les templates de la DB d'un coup pour plus d'efficacité
    const { data: dbTemplates } = await supabase.from('email_templates').select('*');

    const transporter = nodemailer.createTransport({
      host: config.gmail_smtp_host || 'smtp.gmail.com',
      port: Number(config.gmail_smtp_port) || 587,
      secure: Number(config.gmail_smtp_port) === 465,
      auth: {
        user: config.gmail_smtp_user,
        pass: config.gmail_smtp_password,
      },
      tls: { rejectUnauthorized: false }
    });

    const fromName = config.gmail_smtp_from_name || 'Services Siteup';
    const fromEmail = config.gmail_smtp_from_email || config.gmail_smtp_user;
    const results = [];

    for (const job of scheduledEmails) {
      try {
        const lead = job.leads;
        if (!lead || !lead.email) throw new Error('Lead invalide');

        const emailCheck = isValidEmailForSending(lead.email);
        if (!emailCheck.valid) {
          console.log(`[Cron] Skip ${lead.name} — email invalide (${emailCheck.reason})`);
          await supabase.from('scheduled_emails').update({
            status: 'skipped',
            error_message: `Email invalide: ${emailCheck.reason}`,
            updated_at: new Date().toISOString()
          }).eq('id', job.id);
          results.push({ job_id: job.id, status: 'skipped', reason: emailCheck.reason });
          continue;
        }

        // CHERCHER LE TEMPLATE DANS LA BASE DE DONNÉES
        const template = dbTemplates?.find(t => t.id === job.template_id);
        if (!template) throw new Error(`Template ID "${job.template_id}" introuvable en base de données`);

        console.log(`[Cron] Préparation email ${job.template_id} pour ${lead.name}. InvoiceURL: ${lead.invoice_url || 'VIDE'}`);

        let subject = template.subject || 'Votre projet web';
        let body = template.body || ''; // Dans la DB, c'est la colonne 'body'

        // Injection des variables standardisées (Tunnel complet)
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host || 'www.services-siteup.online';
        const baseUrl = `${protocol}://${host}/api/track`;
        const timestamp = Date.now();

        const replacements: Record<string, string> = {
          '{{firstName}}': lead.name?.split(' ')[0] || lead.name || 'Client',
          '{{companyName}}': lead.name || 'votre entreprise',
          '{{websiteLink}}': `${baseUrl}?id=${lead.id}&type=site_clicked&ts=${timestamp}`,
          '{{startProjectLink}}': `${baseUrl}?id=${lead.id}&type=start_clicked&ts=${timestamp}`,
          '{{devisLink}}': `${baseUrl}?id=${lead.id}&type=devis_clicked&url=${encodeURIComponent(lead.devis_url || '#')}&ts=${timestamp}`,
          '{{paymentLink}}': `${baseUrl}?id=${lead.id}&type=payment_clicked&ts=${timestamp}`,
          '{{finalPaymentLink}}': `${baseUrl}?id=${lead.id}&type=payment_clicked&final=true&ts=${timestamp}`,
          '{{invoiceLink}}': `${baseUrl}?id=${lead.id}&type=invoice_clicked&url=${encodeURIComponent(lead.invoice_url || '#')}&ts=${timestamp}`,
          '{{finalInvoiceLink}}': `${baseUrl}?id=${lead.id}&type=invoice_clicked&final=true&url=${encodeURIComponent(lead.invoice_url || '#')}&ts=${timestamp}`,
          '{{agentName}}': fromName,
          '{{agentEmail}}': fromEmail,
          '{{price}}': '146', // Prix standard
          '{{amount}}': '146',
          '{{validityDays}}': '7',
          '{{deliveryDate}}': new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
          '{{expiryDate}}': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
          '{{city}}': lead.city || '',
          '{{sector}}': lead.sector || '',
          // Accès Admin (Email 6)
          '{{adminLink}}': lead.admin_url || '#',
          '{{adminUsername}}': lead.admin_username || lead.name?.toLowerCase().replace(/\s+/g, '') || 'admin',
          '{{adminPassword}}': lead.admin_password || '********',
          '{{documentationLink}}': lead.documentation_url || '#'
        };

        for (const [key, val] of Object.entries(replacements)) {
          subject = subject.split(key).join(val);
          body = body.split(key).join(val);
        }

        const trackingPixel = `<img src="${baseUrl}?id=${lead.id}&type=email_opened&ts=${timestamp}" width="1" height="1" style="display:none;" onload="setTimeout(() => this.src='${baseUrl}?id=${lead.id}&type=email_opened&ts=${timestamp + 3000}', 3000)" />`;
        const html = body.includes('</body>') ? body.replace('</body>', `${trackingPixel}</body>`) : body + trackingPixel;

        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: `"${lead.name}" <${lead.email}>`,
          subject,
          html,
          text: body.replace(/<[^>]*>/g, '') // Version texte simplifiée
        });

        // MISE À JOUR DE L'HISTORIQUE DES ÉTAPES (sent_steps)
        const currentSteps = lead.sent_steps || [];
        if (!currentSteps.includes(job.template_id)) {
          await supabase.from('leads').update({
            sent_steps: [...currentSteps, job.template_id],
            email_sent: true,
            email_sent_date: new Date().toISOString(),
            last_contact: new Date().toISOString()
          }).eq('id', lead.id);
        }

        await supabase.from('scheduled_emails').update({ 
          status: 'sent', 
          updated_at: new Date().toISOString() 
        }).eq('id', job.id);

        results.push({ job_id: job.id, status: 'success' });

      } catch (err: any) {
        console.error(`[Cron] Erreur job ${job.id}:`, err.message);

        if (isBounceError(err.message)) {
          await supabase.from('email_logs').insert([{
            lead_id: job.leads?.id || null, to_email: job.leads?.email,
            subject: `Cron: ${job.template_id}`, status: 'bounced',
            error_message: err.message, sent_at: new Date().toISOString()
          }]);
        }

        await supabase.from('scheduled_emails').update({
          status: 'failed',
          error_message: err.message,
          updated_at: new Date().toISOString()
        }).eq('id', job.id);
        results.push({ job_id: job.id, status: 'failed', error: err.message });
      }
    }

    return res.json({ success: true, processed: scheduledEmails.length, results });

  } catch (err: any) {
    console.error('[Cron Error]', err);
    return res.status(500).json({ error: 'Internal Error', message: err.message });
  }
}


