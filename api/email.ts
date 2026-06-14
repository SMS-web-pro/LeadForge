import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createTransport } from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Safe Supabase init — returns error JSON if env vars missing
function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ error: 'Server misconfigured', message: 'SUPABASE_URL / SUPABASE_ANON_KEY missing in Vercel env vars' });
    }

    const action = req.query.action as string | undefined;

    // GET /api/email?action=logs
    if (req.method === 'GET' && action === 'logs') {
      const { leadId, limit = '50', offset = '0' } = req.query;
      let query = supabase.from('email_logs').select('*').order('sent_at', { ascending: false })
        .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);
      if (leadId) query = query.eq('lead_id', leadId as string);
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ logs: data, count: data?.length ?? 0 });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const body = req.body as Record<string, unknown>;

    // POST /api/email?action=batch
    if (action === 'batch') {
      const emails = body.emails as unknown[];
      const delayMs = (body.delayMs as number) ?? 2000;
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ error: 'Invalid emails array' });
      }

      const { data: config, error: configErr } = await supabase.from('api_config').select('*').eq('id', 1).single();
      if (configErr || !config?.gmail_smtp_user || !config?.gmail_smtp_password) {
        return res.status(400).json({ error: 'SMTP not configured', message: 'Please configure Gmail SMTP in Settings' });
      }

      const port = config.gmail_smtp_port || 587;
      const transporter = createTransport({
        host: config.gmail_smtp_host || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: { user: config.gmail_smtp_user, pass: config.gmail_smtp_password.replace(/\s/g, '') },
        tls: { rejectUnauthorized: false }
      });

      try { await transporter.verify(); } catch (e: unknown) {
        return res.status(500).json({ error: 'SMTP verification failed', message: (e as Error).message });
      }

      const fromName = config.gmail_smtp_from_name || 'LeadForge AI';
      const fromEmail = config.gmail_smtp_from_email || config.gmail_smtp_user;
      const results: unknown[] = [];
      const errors: unknown[] = [];

      for (let i = 0; i < emails.length; i++) {
        const emailData = emails[i] as Record<string, unknown>;
        try {
          const { to, toName, subject, html, leadId } = emailData;
          const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: `"${(toName as string) || (to as string)}" <${to as string}>`,
            subject: subject as string,
            html: html as string,
            text: (html as string).replace(/<[^>]*>/g, '')
          });

          await supabase.from('email_logs').insert([{
            lead_id: leadId || null, to_email: to, subject, status: 'sent', sent_at: new Date().toISOString()
          }]);

          if (leadId) {
            await supabase.from('leads').update({
              email_sent: true, email_sent_date: new Date().toISOString(), last_contact: new Date().toISOString()
            }).eq('id', leadId as string);
          }

          results.push({ to, status: 'sent', messageId: (info as { messageId: string }).messageId });

          if (i < emails.length - 1) {
            await new Promise(r => setTimeout(r, delayMs));
          }
        } catch (err: unknown) {
          errors.push({ to: emailData.to, error: (err as Error).message });
        }
      }

      return res.json({
        success: true,
        summary: { total: emails.length, sent: results.length, failed: errors.length },
        results,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    // POST /api/email — send single
    const { to, toName, subject, html, text, leadId } = body as {
      to?: string; toName?: string; subject?: string; html?: string; text?: string; leadId?: string;
    };
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'to, subject, html are required' });
    }

    const { data: config, error: configErr } = await supabase.from('api_config').select('*').eq('id', 1).single();
    if (configErr || !config?.gmail_smtp_user || !config?.gmail_smtp_password) {
      return res.status(400).json({
        error: 'SMTP not configured',
        message: 'Please configure Gmail SMTP in Settings (gmailSmtpUser + gmailSmtpPassword required)'
      });
    }

    const port = config.gmail_smtp_port || 587;
    const transporter = createTransport({
      host: config.gmail_smtp_host || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user: config.gmail_smtp_user, pass: config.gmail_smtp_password.replace(/\s/g, '') },
      tls: { rejectUnauthorized: false }
    });

    await transporter.verify();

    const fromName = config.gmail_smtp_from_name || 'LeadForge AI';
    const fromEmail = config.gmail_smtp_from_email || config.gmail_smtp_user;

    // Déterminer l'URL de base pour le tracking
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'leadforge.ai';
    const baseUrl = `${protocol}://${host}`;

    // Injection du pixel de tracking d'ouverture avec timestamp
    let trackedHtml = html;
    if (leadId) {
      const timestamp = Date.now();
      const trackingPixel = `<img src="${baseUrl}/api/track?id=${leadId}&type=email_opened&ts=${timestamp}" width="1" height="1" style="display:none !important;" onload="setTimeout(() => this.src='${baseUrl}/api/track?id=${leadId}&type=email_opened&ts=${timestamp + 3000}', 3000)" />`;
      if (trackedHtml.includes('</body>')) {
        trackedHtml = trackedHtml.replace('</body>', `${trackingPixel}</body>`);
      } else {
        trackedHtml += trackingPixel;
      }
    }

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: `"${toName || to}" <${to}>`,
      subject,
      html: trackedHtml,
      text: text || trackedHtml.replace(/<[^>]*>/g, '')
    });

    await supabase.from('email_logs').insert([{
      lead_id: leadId || null, to_email: to, subject, body: html,
      status: 'sent', sent_at: new Date().toISOString()
    }]);

    if (leadId) {
      await supabase.from('leads').update({
        email_sent: true, email_sent_date: new Date().toISOString(), last_contact: new Date().toISOString()
      }).eq('id', leadId);
    }

    return res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: (info as { messageId: string }).messageId,
      to,
      subject
    });

  } catch (err: unknown) {
    console.error('[api/email] Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error', message: (err as Error).message });
  }
}
