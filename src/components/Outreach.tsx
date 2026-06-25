import { useState, useEffect } from 'react';
import { Lead, ApiConfig, EmailTemplate, callLLM, useScheduledEmails, ScheduledEmail } from '../lib/supabase-store';
import { supabase } from '../lib/supabase';
import { salesTemplates, reminderTemplates, salesTemplatesEn, reminderTemplatesEn, getTemplateById, getLocalizedSalesTemplates, getLocalizedReminderTemplates, getLocalizedTemplateById, getLocalizedAllTemplates } from '../templates/outreach-templates-final';
import { detectLanguage } from '../lib/ultimateTemplate';
import { validateEmailAdvanced } from '../lib/validation';
import { emailValidationStore } from '../lib/email-validation-store';

const C = {
  bg: '#F7F6F2', surface: '#FFFFFF', surface2: '#F2F1EC',
  border: '#E4E2DA', tx: '#1C1B18', tx2: '#4A4943', tx3: '#6B6960',
  accent: '#D4500A', accent2: '#F0E8DF',
  green: '#1A7A4A', blue: '#1A4FA0', amber: '#B45309', red: '#C0392B',
};

const API_BASE = '/api';

interface Props {
  leads: Lead[];
  updateLead: (id: string, updates: Partial<Lead>) => void;
  apiConfig: ApiConfig;
  templates: EmailTemplate[];
}

async function sendEmailViaApi(payload: {
  to: string; toName?: string; subject: string; html: string; leadId?: string;
}): Promise<{ success: boolean; message: string; emailInvalid?: boolean; reason?: string }> {
  try {
    const res = await fetch(`${API_BASE}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.email_invalid && payload.leadId) {
        emailValidationStore.markInvalid(payload.leadId, data.reason || 'invalid_format');
      }
      return { success: false, message: data.message || data.error || 'Erreur serveur', emailInvalid: data.email_invalid, reason: data.reason };
    }
    return { success: true, message: data.message || 'Email envoyé' };
  } catch (err: unknown) {
    return { success: false, message: (err as Error).message };
  }
}

export default function Outreach({ leads, updateLead, apiConfig, templates }: Props) {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, name: '' });
  const [emailDelay, setEmailDelay] = useState(8000);
  const [logs, setLogs] = useState<string[]>([]);
  const [previewEmail, setPreviewEmail] = useState<{ lead: Lead; subject: string; body: string } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(salesTemplates[0]?.id || '');
  const [emailLang, setEmailLang] = useState<'fr' | 'en'>('fr');

  const currentSalesTemplates = emailLang === 'en' ? salesTemplatesEn : salesTemplates;
  const currentReminderTemplates = emailLang === 'en' ? reminderTemplatesEn : reminderTemplates;

  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testEmailSending, setTestEmailSending] = useState(false);

  // Nouveaux états pour workflow et paiement
  const [workflowMode, setWorkflowMode] = useState<'manual' | 'automated'>('manual');
  const [selectedWorkflowTemplate, setSelectedWorkflowTemplate] = useState('step-1-start');
  const [paymentLinks, setPaymentLinks] = useState<Record<string, { link: string; amount: number; created: string }>>({});
  const [devisLinks, setDevisLinks] = useState<Record<string, string>>({});
  const [invoiceLinks, setInvoiceLinks] = useState<Record<string, string>>({});
  const { scheduled, cancelEmail } = useScheduledEmails();
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // États pour la pagination et le filtrage
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage, setLeadsPerPage] = useState(3);
  const [filterStatus, setFilterStatus] = useState<'all' | 'opened' | 'converted' | 'not-converted'>('all');

  // États pour l'email test
  const [testEmail, setTestEmail] = useState('');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailError, setTestEmailError] = useState('');
  const [testEmailSuccess, setTestEmailSuccess] = useState('');

  // États pour l'édition de template
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedVariables, setEditedVariables] = useState<string[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // États pour l'éditeur avancé
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'html'>('wysiwyg');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  // États pour le moteur de recherche de variables
  const [variableSearch, setVariableSearch] = useState('');
  const [allVariables, setAllVariables] = useState<string[]>([]);
  const [filteredVariables, setFilteredVariables] = useState<string[]>([]);
  const [showVariableSuggestions, setShowVariableSuggestions] = useState(false);

  // États pour le preview mobile
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [mobileEditMode, setMobileEditMode] = useState(false);

  const hasGmailSmtp = !!(apiConfig.gmailSmtpUser && apiConfig.gmailSmtpPassword);
  const hasLLM = !!(apiConfig.groqKey || apiConfig.geminiKey || apiConfig.nvidiaKey || apiConfig.openrouterKey);

  // LOG DIAGNOSTIC
  console.log('🔍 Outreach Dashboard:', {
    leadsCount: leads.length,
    scheduledCount: scheduled.length,
    hasSmtp: hasGmailSmtp
  });

  const ready = leads.filter(l => l.siteGenerated && !l.emailSent && l.email && !l.emailInvalid);
  const sent = leads.filter(l => l.emailSent);

  // Logique de filtrage
  const filteredSent = sent.filter(lead => {
    switch (filterStatus) {
      case 'opened':
        return lead.emailOpened;
      case 'converted':
        return lead.stage === 'converted';
      case 'not-converted':
        return lead.stage !== 'converted';
      default:
        return true;
    }
  });

  // Logique de pagination
  const totalPages = Math.ceil(filteredSent.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
  const paginatedSent = filteredSent.slice(startIndex, endIndex);

  // Réinitialiser la page si le filtre change
  const handleFilterChange = (newFilter: typeof filterStatus) => {
    setFilterStatus(newFilter);
    setCurrentPage(1);
  };

  // Fonction de salutation professionnelle B2B
  const getSalutation = (lead: { name: string; contactName?: string }): string => {
    if (lead.contactName && lead.contactName.trim()) {
      return lead.contactName.trim();
    }
    return lead.name;
  };

  // Fonction de personnalisation partagée et robuste
  const personalizeTemplateContent = (template: EmailTemplate, lead: Lead, config: ApiConfig) => {
    // Détecter le domaine actuel pour le tracking
    const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://leadforge.ai';
    const trackBase = `${baseUrl}/api/track?id=${lead.id}`;

    // Helper pour wrapper un lien avec le tracker
    const wrapLink = (url: string, type: string) => {
      if (!url || url === '#' || !lead.id) return url;
      return `${trackBase}&type=${type}&url=${encodeURIComponent(url)}`;
    };

    // 1. Définir toutes les variables de remplacement
    const firstName = (lead.contactName || lead.name || '').split(' ')[0];
    // trackBase est déjà déclaré à la ligne 76

    const replacements: Record<string, string> = {
      '{{name}}': lead.name || '',
      '{{firstName}}': firstName,
      '{{companyName}}': lead.name || '',
      '{{city}}': lead.city || 'votre ville',
      '{{sector}}': lead.sector || 'votre secteur',
      
      // Boutons traçables
      '{{websiteLink}}': `${trackBase}&type=site_clicked`,
      '{{startProjectLink}}': `${trackBase}&type=start_clicked`,
      '{{landingUrl}}': `${trackBase}&type=site_clicked`,
      '{{paymentLink}}': `${trackBase}&type=payment_clicked`,
      '{{finalPaymentLink}}': `${trackBase}&type=payment_clicked&final=true`,
      '{{devisLink}}': `${trackBase}&type=devis_clicked&url=${encodeURIComponent(lead.devis_url || '#')}`,
      '{{invoiceLink}}': `${trackBase}&type=invoice_clicked&url=${encodeURIComponent(lead.invoice_url || '#')}`,
      '{{finalInvoiceLink}}': `${trackBase}&type=invoice_clicked&final=true&url=${encodeURIComponent(lead.invoice_url || '#')}`,
      
      // Infos de Livraison (Email 6)
      '{{adminLink}}': lead.admin_url || `${lead.siteUrl || lead.website || ''}/admin`,
      '{{adminUsername}}': lead.admin_username || lead.name?.toLowerCase().replace(/\s+/g, '') || 'admin',
      '{{adminPassword}}': lead.admin_password || '********',
      '{{documentationLink}}': lead.documentation_url || '#',

      // Infos Agent
      '{{agentName}}': config.gmailSmtpFromName || 'Solutions Web',
      '{{agentEmail}}': config.gmailSmtpFromEmail || 'contact@leadforge.ai',
      
      // Données dynamiques
      '{{price}}': '146',
      '{{amount}}': '146',
      '{{validityDays}}': '7',
      '{{deliveryDate}}': new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      '{{expiryDate}}': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
    };

    let subject = template.subject || '';
    // Priorité au HTML pour la structure pro, fallback sur le texte
    let body = template.htmlContent || template.textContent || ''; 

    // 2. Remplacement massif et sécurisé
    for (const [key, val] of Object.entries(replacements)) {
      subject = subject.split(key).join(val);
      body = body.split(key).join(val);
    }

    return { subject, body };
  };

  const generateEmailContent = async (lead: Lead): Promise<{ subject: string; body: string }> => {
    // UNIFICATION : On donne la priorité aux templates de la BASE DE DONNÉES
    const allTemplates = [...templates, ...currentSalesTemplates, ...currentReminderTemplates];
    const template = allTemplates.find((t: EmailTemplate) => t.id === selectedTemplate) || allTemplates[0];
    
    const base = personalizeTemplateContent(template, lead, apiConfig);

    if (hasLLM) {
      try {
        const isEn = emailLang === 'en';
        const prompt = isEn
          ? `Personalize this B2B prospecting email. Keep the same HTML format and all links intact (landing, quote, payment). Reply ONLY in JSON.
Lead: ${lead.name}, ${lead.sector || 'unknown sector'}, ${lead.city || 'unknown city'}
Template: ${template.name}

Base email:
Subject: ${base.subject}
Body: ${base.body}

JSON: {"subject": "personalized subject", "body": "personalized body with links unchanged"}`

          : `Personnalise cet email de prospection B2B. Garde le même format HTML et tous les liens intacts (landing, devis, paiement). Réponds UNIQUEMENT en JSON.
Lead: ${lead.name}, ${lead.sector || 'secteur inconnu'}, ${lead.city || 'ville inconnue'}
Template: ${template.name}

Email de base:
Sujet: ${base.subject}
Corps: ${base.body}

JSON: {"subject": "sujet personnalisé", "body": "corps personnalisé avec les liens inchangés"}`;

        const response = await callLLM(apiConfig, prompt, isEn ? 'You personalize B2B prospecting emails. NEVER modify HTML tags or href links. Reply in JSON.' : 'Tu personnalises des emails de prospection pro. Tu ne modifies JAMAIS les balises HTML ou les liens href. Réponds en JSON.');
        if (response) {
          try {
            const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleaned);
            if (data.subject && data.body) return data;
          } catch { /* fallback base */ }
        }
      } catch { /* fallback base */ }
    }

    return base;
  };

  const previewForLead = async (lead: Lead) => {
    const { subject, body } = await generateEmailContent(lead);
    setPreviewEmail({ lead, subject, body });
  };

  const sendWorkflowEmail = async (lead: Lead, templateId: string) => {
    if (!hasGmailSmtp) { alert('Configurez Gmail SMTP dans les Paramètres'); return; }
    if (!lead.email) { alert("Ce lead n'a pas d'email"); return; }

    const emailCheck = validateEmailAdvanced(lead.email);
    if (!emailCheck.valid) {
      alert(`Email invalide pour ${lead.name}: ${emailCheck.reason}`);
      emailValidationStore.markInvalid(lead.id, emailCheck.reason || 'invalid');
      updateLead(lead.id, { emailInvalid: true, emailInvalidReason: emailCheck.reason });
      return;
    }
    if (lead.emailInvalid) {
      alert(`Email de ${lead.name} marqué invalide (${lead.emailInvalidReason}). Corrigez l'email avant de renvoyer.`);
      return;
    }

    // UNIFICATION : On cherche d'abord dans les templates de la DB (prop templates)
    const allTemplates = [...templates, ...currentSalesTemplates, ...currentReminderTemplates];
    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;

    // SÉCURITÉ : Extraire le contenu (body si DB, htmlContent si Local)
    const rawContent = (template as any).body || template.htmlContent;
    const { subject, body } = personalizeTemplateContent({ ...template, htmlContent: rawContent }, lead, apiConfig);
    
    const result = await sendEmailViaApi({
      to: lead.email,
      toName: lead.name,
      subject,
      html: body, // Plus de replace br ici !
      leadId: lead.id,
    });

    if (result.success) {
      updateLead(lead.id, {
        emailSent: true,
        emailSentDate: new Date().toISOString(),
        stage: 'email_sent',
        lastContact: new Date().toISOString(),
        sentSteps: Array.from(new Set([...(lead.sentSteps || []), templateId]))
      });
      setLogs(prev => [...prev, `✅ ${template.name} envoyé à ${lead.name}`]);
      
      // --- LOGIQUE DE RAPPEL AUTOMATIQUE J+1 ---
      let nextReminderId = '';
      if (templateId === 'step-1-start') nextReminderId = 'reminder1_after_email1';
      if (templateId === 'step-2-devis') nextReminderId = 'reminder2_after_devis';
      if (templateId === 'step-4-paiement') nextReminderId = 'reminder3_final_payment';

      if (nextReminderId) {
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 1); // <--- PASSAGE À J+1
        
        supabase.from('scheduled_emails').insert([{
          lead_id: lead.id,
          template_id: nextReminderId,
          scheduled_for: scheduledDate.toISOString(),
          status: 'pending'
        }]).then(({ error }) => {
          const reminderNum = nextReminderId.includes('reminder1') ? '1' : 
                             nextReminderId.includes('reminder2') ? '2' : '3';
          if (!error) setLogs(prev => [...prev, `📅 Rappel ${reminderNum} programmé pour DEMAIN`]);
        });
      }
    } else {
      setLogs(prev => [...prev, `❌ Échec ${templateId} : ${result.message}`]);
    }
  };

  const confirmDeposit = async (lead: Lead) => {
    // 1. Annuler toutes les relances (reminders) programmées car le client a payé l'acompte
    await supabase.from('scheduled_emails').delete().eq('lead_id', lead.id).eq('status', 'pending');
    
    // 2. Envoyer immédiatement l'Email 3 (Confirmation Dépôt)
    await sendWorkflowEmail(lead, 'step-3-depot');
    
    // 3. Programmer le solde final (Email 4) dans 2 jours (Production Express)
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 2); // <--- PASSAGE À J+2
    
    await supabase.from('scheduled_emails').insert([{
      lead_id: lead.id,
      template_id: 'step-4-paiement',
      scheduled_for: scheduledDate.toISOString(),
      status: 'pending'
    }]);

    setLogs(prev => [...prev, `💵 Acompte validé pour ${lead.name}. Email 3 envoyé et Email 4 programmé.`]);
  };

  const confirmFinalPayment = async (lead: Lead) => {
    // 1. Annuler toutes les relances programmées
    await supabase.from('scheduled_emails').delete().eq('lead_id', lead.id).eq('status', 'pending');
    
    // 2. Envoyer l'Email 5 (Confirmation Solde Final)
    await sendWorkflowEmail(lead, 'step-5-confirmation');
    
    // 3. Programmer l'Email 6 (Livraison) pour dans 1 heure
    const deliveryDate = new Date();
    deliveryDate.setHours(deliveryDate.getHours() + 1);
    
    await supabase.from('scheduled_emails').insert([{
      lead_id: lead.id,
      template_id: 'step-6-livraison',
      scheduled_for: deliveryDate.toISOString(),
      status: 'pending'
    }]);

    // 4. Update groupé pour éviter la race condition entre sendWorkflowEmail et l'update du stage
    // On force l'ajout de step-5-confirmation dans sentSteps au cas où l'update interne de sendWorkflowEmail soit écrasé
    updateLead(lead.id, {
      stage: 'converted',
      revenue: 146,
      sentSteps: Array.from(new Set([...(lead.sentSteps || []), 'step-5-confirmation']))
    });

    setLogs(prev => [...prev, `🏆 Solde final validé pour ${lead.name}. Email 5 envoyé et Livraison (E6) programmée.`]);
  };

  const sendOne = async (lead: Lead) => {
    if (!hasGmailSmtp) { alert('Configurez Gmail SMTP dans les Paramètres'); return; }
    if (!lead.email) { alert("Ce lead n'a pas d'email"); return; }

    const emailCheck = validateEmailAdvanced(lead.email);
    if (!emailCheck.valid) {
      alert(`Email invalide pour ${lead.name}: ${emailCheck.reason}`);
      emailValidationStore.markInvalid(lead.id, emailCheck.reason || 'invalid');
      updateLead(lead.id, { emailInvalid: true, emailInvalidReason: emailCheck.reason });
      return;
    }
    if (lead.emailInvalid) {
      alert(`Email de ${lead.name} marqué invalide (${lead.emailInvalidReason}). Corrigez l'email avant de renvoyer.`);
      return;
    }

    const { subject, body } = await generateEmailContent(lead);
    const result = await sendEmailViaApi({
      to: lead.email,
      toName: lead.name,
      subject,
      html: body, // On envoie le HTML pur sans altération
      leadId: lead.id,
    });

    if (result.success) {
      updateLead(lead.id, {
        emailSent: true,
        emailSentDate: new Date().toISOString(),
        stage: 'email_sent',
        lastContact: new Date().toISOString(),
        sentSteps: Array.from(new Set([...(lead.sentSteps || []), selectedTemplate]))
      });
      setLogs(prev => [...prev, `✅ Email envoyé à ${lead.name}`]);
    } else {
      setLogs(prev => [...prev, `❌ Échec d'envoi à ${lead.name}: ${result.message}`]);
    }
  };

  const sendBatch = async () => {
    if (!hasGmailSmtp) { alert('Configurez Gmail SMTP dans les Paramètres'); return; }
    if (ready.length === 0) return;

    const invalidLeads = ready.filter(l => {
      const check = validateEmailAdvanced(l.email);
      return !check.valid || l.emailInvalid;
    });

    if (invalidLeads.length > 0) {
      const proceed = confirm(
        `${invalidLeads.length} lead(s) ont des emails invalides et seront ignorés :\n` +
        invalidLeads.map(l => `- ${l.name}: ${l.emailInvalidReason || 'format invalide'}`).join('\n') +
        `\n\nContinuer avec ${ready.length - invalidLeads.length} emails valides ?`
      );
      if (!proceed) return;
    }

    const validLeads = ready.filter(l => {
      const check = validateEmailAdvanced(l.email);
      return check.valid && !l.emailInvalid;
    });

    setSending(true);
    setProgress({ current: 0, total: validLeads.length, name: '' });
    setLogs(prev => [...prev, `🚀 Début de l'envoi de ${validLeads.length} emails valides (${invalidLeads.length} ignorés)...`]);

    for (let i = 0; i < validLeads.length; i++) {
      const lead = validLeads[i];
      setProgress({ current: i + 1, total: validLeads.length, name: lead.name });

      const { subject, body } = await generateEmailContent(lead);
      const result = await sendEmailViaApi({
        to: lead.email!,
        toName: lead.name,
        subject,
        html: body,
        leadId: lead.id,
      });

      if (result.success) {
        updateLead(lead.id, {
          emailSent: true,
          emailSentDate: new Date().toISOString(),
          stage: 'email_sent',
          lastContact: new Date().toISOString(),
          sentSteps: Array.from(new Set([...(lead.sentSteps || []), selectedTemplate]))
        });
        setLogs(prev => [...prev, `✅ ${lead.name} — envoyé`]);
      } else {
        if (result.emailInvalid) {
          emailValidationStore.markInvalid(lead.id, result.reason || 'invalid');
          updateLead(lead.id, { emailInvalid: true, emailInvalidReason: result.reason });
        }
        setLogs(prev => [...prev, `❌ ${lead.name} — ${result.message}`]);
      }

      if (i < ready.length - 1) await new Promise(r => setTimeout(r, emailDelay));
    }

    setLogs(prev => [...prev, `🏁 Envoi terminé.`]);
    setSending(false);
  };

  const sendTestEmail = async () => {
    if (!hasGmailSmtp) {
      setTestEmailError('Configurez Gmail SMTP dans les Paramètres');
      return;
    }
    if (!testEmail || !testEmail.includes('@')) {
      setTestEmailError('Veuillez entrer une adresse email valide');
      return;
    }
    const emailCheck = validateEmailAdvanced(testEmail);
    if (!emailCheck.valid) {
      setTestEmailError(`Email invalide: ${emailCheck.reason}`);
      return;
    }

    setTestEmailLoading(true);
    setTestEmailError('');
    setTestEmailSuccess('');
    setLogs(prev => [...prev, `Envoi d'email test à ${testEmail}...`]);

    try {
      const allTemplates = [...currentSalesTemplates, ...currentReminderTemplates];
      const template = allTemplates.find((t: EmailTemplate) => t.id === selectedTemplate) || allTemplates[0];
      const testLead: Lead = {
        id: 'test', name: 'Test Prospect', email: testEmail,
        sector: 'Commerce', city: 'Ville Test',
        landingUrl: 'https://example.com',
      } as Lead;

      const { subject, body } = personalizeTemplateContent(template, testLead, apiConfig);
      const result = await sendEmailViaApi({
        to: testEmail,
        toName: 'Test',
        subject,
        html: body.replace(/\n/g, '<br/>'),
      });

      if (result.success) {
        setTestEmailSuccess(`Email test envoyé avec succès à ${testEmail}`);
        setLogs(prev => [...prev, `Email test envoyé à ${testEmail}`]);
      } else {
        setTestEmailError(`Échec de l'envoi: ${result.message}`);
        setLogs(prev => [...prev, `Échec envoi test: ${result.message}`]);
      }
    } catch (error) {
      setTestEmailError('Erreur lors de l\'envoi de l\'email test');
      setLogs(prev => [...prev, `Erreur envoi test: ${error}`]);
    } finally {
      setTestEmailLoading(false);
    }
  };

  // Fonctions pour la barre d'outils d'édition
  const insertText = (text: string, before: string = '', after: string = '') => {
    const textarea = document.getElementById('template-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = before + selectedText + after;
    const newContent = editedContent.substring(0, start) + newText + editedContent.substring(end);
    
    setEditedContent(newContent);
    
    // Restaurer le curseur
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertVariable = (variable: string) => {
    insertText(`{{${variable}}}`);
  };

  const formatText = (tag: string) => {
    insertText('', `<${tag}>`, `</${tag}>`);
  };

  const insertLink = () => {
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      insertText(url, '<a href="', '"></a>');
    }
  };

  const insertImage = () => {
    const url = prompt('Entrez l\'URL de l\'image:');
    if (url) {
      insertText(url, '<img src="', '" alt="" style="max-width: 100%; height: auto;">');
    }
  };

  const insertButton = () => {
    const text = prompt('Entrez le texte du bouton:');
    const url = prompt('Entrez l\'URL du bouton:');
    if (text && url) {
      insertText(text, `<a href="${url}" style="display: inline-block; padding: 12px 24px; background: #D4500A; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">`, `</a>`);
    }
  };

  const insertLineBreak = () => {
    insertText('<br>');
  };

  const insertHorizontalRule = () => {
    insertText('<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">');
  };

  // Fonctions pour le moteur de recherche de variables
  const scanAllVariables = () => {
    // Scanner tous les templates pour extraire toutes les variables
    const allTemplates = [...templates, ...salesTemplates, ...reminderTemplates, ...salesTemplatesEn, ...reminderTemplatesEn];
    const allVars = new Set<string>();
    
    allTemplates.forEach(template => {
      const content = template.htmlContent || (template as any).body || template.textContent || '';
      const variableRegex = /\{\{(\w+)\}\}/g;
      const matches = content.match(variableRegex) || [];
      matches.forEach((match: any) => {
        const varName = match.replace(/[{}]/g, '');
        allVars.add(varName);
      });
    });

    // Ajouter les variables communes prédéfinies
    const commonVariables = [
      'firstName', 'lastName', 'companyName', 'websiteLink', 'price', 
      'agentName', 'agentEmail', 'agentPhone', 'sector', 'city', 
      'country', 'address', 'phone', 'email', 'date', 'time'
    ];
    
    commonVariables.forEach(v => allVars.add(v));
    
    const variables = Array.from(allVars).sort();
    setAllVariables(variables);
    setFilteredVariables(variables);
  };

  const handleVariableSearch = (searchTerm: string) => {
    setVariableSearch(searchTerm);
    
    if (searchTerm.trim() === '') {
      setFilteredVariables(allVariables);
    } else {
      const filtered = allVariables.filter(variable => 
        variable.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVariables(filtered);
    }
  };

  const insertVariableFromSearch = (variable: string) => {
    insertVariable(variable);
    setVariableSearch('');
    setShowVariableSuggestions(false);
  };

  // Scanner les variables au montage du composant
  useEffect(() => {
    scanAllVariables();
  }, [templates, salesTemplates, reminderTemplates, salesTemplatesEn, reminderTemplatesEn]);

  // Fonctions pour l'édition de template
  const startEditingTemplate = (template: any) => {
    setIsEditingTemplate(true);
    setEditingTemplate(template);
    setEditedSubject(template.subject || '');
    setEditedContent(template.htmlContent || template.textContent || '');
    setEditedVariables(template.variables || []);
    setSaveError('');
    setSaveSuccess('');
    setEditorMode('wysiwyg');
    setShowPreview(false);
  };

  const cancelEditing = () => {
    setIsEditingTemplate(false);
    setEditingTemplate(null);
    setEditedSubject('');
    setEditedContent('');
    setEditedVariables([]);
    setSaveError('');
    setSaveSuccess('');
  };

  const saveTemplate = async () => {
    if (!editingTemplate) return;

    setSavingTemplate(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      // Extraire les variables du contenu édité
      const variableRegex = /\{\{(\w+)\}\}/g;
      const matches = editedContent.match(variableRegex) || [];
      const extractedVariables = [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];

      // Mettre à jour le template dans Supabase avec gestion d'erreur pour la colonne variables
      let updateData: any = {
        subject: editedSubject,
        body: editedContent, // Utiliser 'body' au lieu de 'htmlContent'
        updated_at: new Date().toISOString()
      };

      // Essayer d'inclure les variables seulement si la colonne existe
      try {
        updateData.variables = extractedVariables;
      } catch (e) {
        console.log('Colonne variables non disponible, sauvegarde sans variables');
      }

      const { error } = await supabase
        .from('email_templates')
        .update(updateData)
        .eq('id', editingTemplate.id);

      if (error) {
        // Si l'erreur concerne la colonne variables, réessayer sans
        if (error.message?.includes('variables') || error.code === 'PGRST204') {
          console.log('Erreur colonne variables, sauvegarde sans cette colonne');
          const { error: retryError } = await supabase
            .from('email_templates')
            .update({
              subject: editedSubject,
              body: editedContent,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingTemplate.id);
          
          if (retryError) {
            throw retryError;
          }
        } else {
          throw error;
        }
      }

      // Note: Les templates sont importés statiquement, pas besoin de mise à jour locale
      // La mise à jour dans Supabase suffit pour la persistance

      setSaveSuccess(`Template "${editingTemplate.name}" sauvegardé avec succès !`);
      setLogs(prev => [...prev, `Template "${editingTemplate.name}" mis à jour dans Supabase`]);
      
      // Fermer le mode édition après 2 secondes
      setTimeout(() => {
        cancelEditing();
      }, 2000);

    } catch (error: any) {
      console.error('Erreur sauvegarde template:', error);
      setSaveError(`Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`);
      setLogs(prev => [...prev, `Erreur sauvegarde template: ${error.message}`]);
    } finally {
      setSavingTemplate(false);
    }
  };

  // Wrappers pour le workflow (utilisés dans le JSX)
  const sendEmail1Demo = (lead: Lead) => sendWorkflowEmail(lead, 'step-1-start');
  const sendEmail2WithPayment = (lead: Lead) => sendWorkflowEmail(lead, 'step-2-devis');
  const sendEmail3Confirmation = (lead: Lead) => sendWorkflowEmail(lead, 'step-3-depot');

  return (
    <div className="animate-fade" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 28, position: 'sticky', top: 0, zIndex: 10,
        background: C.bg, padding: '20px 0', borderBottom: `1px solid ${C.border}`
      }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: C.tx, marginBottom: 4 }}>
            Outreach Agent
          </h1>
          <p style={{ color: C.tx3, fontSize: 14 }}>
            Envoyez des emails personnalisés via Gmail SMTP
            {hasGmailSmtp ? ' — Gmail SMTP ✅' : ' — ⚠️ Configurez Gmail SMTP dans les Paramètres'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: C.tx3 }}>⏱ Délai entre emails :</span>
            {[2, 3, 5, 8].map(s => (
              <button key={s} onClick={() => setEmailDelay(s * 1000)} disabled={sending} style={{
                padding: '4px 10px', borderRadius: 4, border: `1px solid ${emailDelay === s * 1000 ? C.amber : C.border}`,
                background: emailDelay === s * 1000 ? C.amber + '22' : C.surface,
                color: emailDelay === s * 1000 ? C.amber : C.tx2,
                fontSize: 12, fontWeight: emailDelay === s * 1000 ? 700 : 400,
                cursor: sending ? 'default' : 'pointer',
              }}>{s}s</button>
            ))}
          </div>
          <button onClick={sendBatch} disabled={sending || ready.length === 0 || !hasGmailSmtp} style={{
            padding: '10px 20px', borderRadius: 6, border: 'none',
            background: sending || !hasGmailSmtp ? C.tx3 : C.amber, color: '#fff',
            fontWeight: 600, fontSize: 14, cursor: sending || !hasGmailSmtp ? 'default' : 'pointer',
          }}>
            {sending ? `Envoi ${progress.current}/${progress.total}...` : `📧 Envoyer ${ready.length} emails`}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Prêts à Envoyer', value: ready.length, color: C.amber },
          { label: 'Emails Envoyés', value: sent.length, color: C.green },
          { label: 'Ouverts', value: leads.filter(l => l.emailOpened).length, color: C.blue },
          { label: 'Lien Site Cliqués', value: leads.filter(l => l.siteClicked).length, color: '#17a2b8' },
          { label: 'Acompte $46 Cliqué', value: leads.filter(l => l.paymentDepositClicked).length, color: '#28a745' },
          { label: 'Solde $100 Cliqué', value: leads.filter(l => l.paymentFinalClicked).length, color: '#2ecc71' },
          { label: 'Devis Cliqués', value: leads.filter(l => l.devisClicked).length, color: '#ffc107' },
          { label: 'Facture Acomp', value: leads.filter(l => l.invoiceDepositClicked).length, color: '#dc3545' },
          { label: 'Facture Solde', value: leads.filter(l => l.invoiceFinalClicked).length, color: '#e74c3c' },
          { label: 'Total CA ($)', value: `${leads.filter(l => l.stage === 'converted').reduce((s, l) => s + (l.revenue || 0), 0)}$`, color: C.tx },
        ].map((s, i) => (
          <div key={i} style={{
            background: C.surface, borderRadius: 8, padding: '12px 8px',
            borderLeft: `3px solid ${s.color}`, boxShadow: '0 1px 3px rgba(28,27,24,0.06)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
            <div style={{ fontSize: 8.5, color: C.tx3, fontWeight: 800, marginBottom: 4, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.tx }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Vue "File d'attente" (AMÉLIORÉE AVEC SCROLL) */}
      {scheduled.length > 0 && (
        <div style={{ background: C.surface, borderRadius: 8, padding: '20px', border: `1px solid ${C.border}`, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
             <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
               ⏳ File d'attente ({scheduled.length})
             </h3>
             <span style={{ fontSize: 11, color: C.tx3, background: C.bg, padding: '2px 8px', borderRadius: 4 }}>
               Mise à jour en direct ⚡
             </span>
          </div>
          <div style={{ 
            display: 'flex', flexDirection: 'column', gap: 8, 
            maxHeight: '320px', overflowY: 'auto', paddingRight: '8px'
          }}>
            {scheduled.map((job: ScheduledEmail) => {
              const lead = leads.find(l => l.id === job.lead_id);
              return (
                <div key={job.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.tx }}>{lead?.name || 'Lead inconnu'}</div>
                    <div style={{ fontSize: 11, color: C.tx3 }}>{job.template_id} • Prévu le {new Date(job.scheduled_for).toLocaleString()}</div>
                  </div>
                  <button 
                    onClick={() => cancelEmail(job.id)}
                    style={{ 
                      padding: '6px 12px', borderRadius: 4, background: '#fee2e2', color: '#dc2626', 
                      fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' 
                    }}
                  >Annuler</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress */}
      {sending && (
        <div style={{ background: C.surface, borderRadius: 8, padding: '16px 20px', border: `1px solid ${C.border}`, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>📧 Envoi: {progress.name}</span>
            <span style={{ fontSize: 12, color: C.tx3, fontFamily: "'DM Mono', monospace" }}>{progress.current}/{progress.total}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: C.surface2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3, background: C.amber,
              width: `${(progress.current / progress.total) * 100}%`,
              transition: 'width 300ms',
            }} />
          </div>
        </div>
      )}
      {/* Templates d'email - Section professionnelle réorganisée */}
      <div style={{ 
        background: C.surface, 
        borderRadius: 12, 
        padding: '24px', 
        border: `1px solid ${C.border}`, 
        marginBottom: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
      }}>
        
        {/* Header principal avec actions globales */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: `2px solid ${C.bg}`
        }}>
          <div>
            <h3 style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              margin: '0 0 4px 0', 
              color: C.tx,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>📧</span>
              Templates d'email
            </h3>
            <p style={{ 
              fontSize: 12, 
              color: C.tx3, 
              margin: 0,
              fontStyle: 'italic'
            }}>
              Gérez vos templates de vente et rappels
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <button 
              onClick={() => setShowEmailPreview(true)}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #D4500A',
                background: '#D4500A',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>👁️</span>
              Visualiser HTML
            </button>
          </div>
        </div>

        {/* Section Test Email */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: 8, 
          padding: '16px', 
          marginBottom: 24,
          border: `1px solid ${C.border}`
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 8 
          }}>
            <h4 style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              margin: 0, 
              color: C.accent,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>🧪</span>
              Test Email
            </h4>
            <span style={{ 
              fontSize: 10, 
              color: C.tx3, 
              background: C.surface, 
              padding: '2px 8px', 
              borderRadius: 12 
            }}>
              {selectedTemplate ? 'Template sélectionné' : 'Aucun template'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              placeholder="Entrez l'email de test..."
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                fontSize: 11,
                background: C.surface,
                color: C.tx,
                fontFamily: "'DM Mono', monospace"
              }}
            />
            <button
              onClick={sendTestEmail}
              disabled={!testEmail || !selectedTemplate}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                background: (testEmail && selectedTemplate) ? C.accent : C.surface2,
                color: (testEmail && selectedTemplate) ? '#fff' : C.tx3,
                fontSize: 11,
                fontWeight: 600,
                cursor: (testEmail && selectedTemplate) ? 'pointer' : 'default',
                minWidth: '80px'
              }}
            >
              {testEmailLoading ? 'Envoi...' : 'Envoyer Test'}
            </button>
          </div>
          
          {/* Messages de feedback */}
          {testEmailError && (
            <div style={{ 
              marginTop: 8, 
              padding: '6px 10px', 
              background: C.red + '15', 
              border: `1px solid ${C.red}40`, 
              borderRadius: 4, 
              fontSize: 10, 
              color: C.red
            }}>
              {testEmailError}
            </div>
          )}
          
          {testEmailSuccess && (
            <div style={{ 
              marginTop: 8, 
              padding: '6px 10px', 
              background: C.green + '15', 
              border: `1px solid ${C.green}40`, 
              borderRadius: 4, 
              fontSize: 10, 
              color: C.green
            }}>
              {testEmailSuccess}
            </div>
          )}
        </div>

        {/* Section Templates de VENTE */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 16 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h4 style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                margin: 0, 
                color: C.green,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
              <span>💰</span>
              Templates de VENTE
              <span style={{ 
                fontSize: 11, 
                color: C.tx3, 
                background: C.bg, 
                padding: '2px 8px', 
                borderRadius: 12,
                fontWeight: 400
              }}>
                {currentSalesTemplates.length} templates
              </span>
            </h4>
              <div style={{ display: 'flex', gap: 4, background: C.bg, borderRadius: 8, padding: 2 }}>
                <button onClick={() => setEmailLang('fr')} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: emailLang === 'fr' ? 700 : 400, border: 'none', cursor: 'pointer', background: emailLang === 'fr' ? C.green : 'transparent', color: emailLang === 'fr' ? '#fff' : C.tx2 }}>🇫🇷 FR</button>
                <button onClick={() => setEmailLang('en')} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: emailLang === 'en' ? 700 : 400, border: 'none', cursor: 'pointer', background: emailLang === 'en' ? C.green : 'transparent', color: emailLang === 'en' ? '#fff' : C.tx2 }}>🇬🇧 EN</button>
              </div>
            </div>
            <div style={{ 
              fontSize: 10, 
              color: C.tx3, 
              fontStyle: 'italic',
              textAlign: 'right'
            }}>
              Workflow: 6 étapes de vente
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            marginBottom: 12,
            overflowX: 'auto',
            padding: '4px 0'
          }}>
            {currentSalesTemplates.map(t => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)} style={{
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 11,
                cursor: 'pointer',
                border: `2px solid ${selectedTemplate === t.id ? C.green : C.border}`,
                background: selectedTemplate === t.id ? C.green + '15' : C.surface,
                color: selectedTemplate === t.id ? C.green : C.tx2,
                fontWeight: 500,
                textAlign: 'left',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                minWidth: '140px',
                flexShrink: 0
              }}>
                <span style={{ fontSize: 14 }}>{t.category === 'sale' ? '💰' : '📧'}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, marginBottom: 1, fontSize: 11 }}>
                    {t.name.split(' - ')[1]}
                  </div>
                  <div style={{ fontSize: 9, color: C.tx3 }}>
                    Étape {t.name.split(' - ')[0]}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div style={{ 
            fontSize: 11, 
            color: C.tx3, 
            background: C.bg, 
            padding: '8px 12px', 
            borderRadius: 6,
            border: `1px solid ${C.border}`
          }}>
            <strong>🔄 Workflow de vente:</strong> Présentation → Devis/Paiement → Confirmation Dépôt → Paiement Final → Confirmation Final → Livraison
          </div>
        </div>

        {/* Section Templates de RAPPEL */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 16 
          }}>
            <h4 style={{ 
              fontSize: 16, 
              fontWeight: 600, 
              margin: 0, 
              color: C.blue,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>⏰</span>
              Templates de RAPPEL
              <span style={{ 
                fontSize: 11, 
                color: C.tx3, 
                background: C.bg, 
                padding: '2px 8px', 
                borderRadius: 12,
                fontWeight: 400
              }}>
                {currentReminderTemplates.length} templates
              </span>
            </h4>
            <div style={{ 
              fontSize: 10, 
              color: C.tx3, 
              fontStyle: 'italic',
              textAlign: 'right'
            }}>
              Automatisation: 3 rappels
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            marginBottom: 12,
            overflowX: 'auto',
            padding: '4px 0'
          }}>
            {currentReminderTemplates.map(t => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)} style={{
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 11,
                cursor: 'pointer',
                border: `2px solid ${selectedTemplate === t.id ? C.blue : C.border}`,
                background: selectedTemplate === t.id ? C.blue + '15' : C.surface,
                color: selectedTemplate === t.id ? C.blue : C.tx2,
                fontWeight: 500,
                textAlign: 'left',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                minWidth: '140px',
                flexShrink: 0
              }}>
                <span style={{ fontSize: 14 }}>⏰</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, marginBottom: 1, fontSize: 11 }}>
                    {t.name.split(' - ')[1]}
                  </div>
                  <div style={{ fontSize: 9, color: C.tx3 }}>
                    {t.name.split(' - ')[0]}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div style={{ 
            fontSize: 11, 
            color: C.tx3, 
            background: C.bg, 
            padding: '8px 12px', 
            borderRadius: 6,
            border: `1px solid ${C.border}`
          }}>
            <strong>⏰ Automatisation des rappels:</strong> Rappel 1 (1j après Email 1) → Rappel 2 (1j après Email 2) → Rappel 3 (1j après Email 4)
          </div>
        </div>

        {/* Éditeur de template professionnel */}
        {(() => {
          const allTemplates = [...templates, ...currentSalesTemplates, ...currentReminderTemplates];
          const selected = allTemplates.find(t => t.id === selectedTemplate);
          if (!selected) return null;
          
          // Si on est en mode édition pour ce template
          if (isEditingTemplate && editingTemplate?.id === selected.id) {
            return (
              <div style={{ 
                marginTop: 14, 
                background: C.bg, 
                borderRadius: 12, 
                border: `2px solid ${C.accent}`,
                fontSize: 13,
                overflow: 'hidden'
              }}>
                {/* Header de l'éditeur professionnel */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  padding: '16px 20px',
                  borderBottom: `1px solid ${C.border}`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: C.accent, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Editor</span>
                        <span style={{ fontSize: 12, color: C.tx3, background: C.bg, padding: '2px 8px', borderRadius: 12 }}>
                          {selected.name}
                        </span>
                      </h4>
                      <p style={{ fontSize: 11, color: C.tx3, margin: '4px 0 0 0' }}>
                        Éditeur professionnel d'email template
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 4,
                          border: `1px solid ${C.border}`,
                          background: showPreview ? C.accent + '15' : C.surface,
                          color: showPreview ? C.accent : C.tx3,
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        {showPreview ? 'Masquer' : 'Aperçu'}
                      </button>
                      <button
                        onClick={cancelEditing}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 4,
                          border: `1px solid ${C.border}`,
                          background: C.surface,
                          color: C.tx3,
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={saveTemplate}
                        disabled={savingTemplate}
                        style={{
                          padding: '6px 16px',
                          borderRadius: 4,
                          border: 'none',
                          background: savingTemplate ? C.surface2 : C.accent,
                          color: savingTemplate ? C.tx3 : '#fff',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: savingTemplate ? 'default' : 'pointer'
                        }}
                      >
                        {savingTemplate ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages de feedback */}
                {saveError && (
                  <div style={{ 
                    margin: '12px 20px', 
                    padding: '8px 12px', 
                    background: C.red + '15', 
                    border: `1px solid ${C.red}40`, 
                    borderRadius: 4, 
                    fontSize: 11, 
                    color: C.red
                  }}>
                    {saveError}
                  </div>
                )}
                
                {saveSuccess && (
                  <div style={{ 
                    margin: '12px 20px', 
                    padding: '8px 12px', 
                    background: C.green + '15', 
                    border: `1px solid ${C.green}40`, 
                    borderRadius: 4, 
                    fontSize: 11, 
                    color: C.green
                  }}>
                    {saveSuccess}
                  </div>
                )}

                {/* Champ d'édition du sujet */}
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: 11, 
                    fontWeight: 600, 
                    color: C.tx2, 
                    marginBottom: 8 
                  }}>
                    Sujet de l'email:
                  </label>
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      fontSize: 13,
                      background: C.surface,
                      color: C.tx,
                      fontFamily: "'DM Mono', monospace",
                      minHeight: '48px'
                    }}
                    placeholder="Entrez le sujet de l'email..."
                  />
                </div>

                {/* Barre d'outils d'édition professionnelle */}
                <div style={{ 
                  background: '#f8f9fa',
                  padding: '12px 20px',
                  borderBottom: `1px solid ${C.border}`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.tx3 }}>MODE:</span>
                      <button
                        onClick={() => setEditorMode('wysiwyg')}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${editorMode === 'wysiwyg' ? C.accent : C.border}`,
                          background: editorMode === 'wysiwyg' ? C.accent + '15' : C.surface,
                          color: editorMode === 'wysiwyg' ? C.accent : C.tx3,
                          fontSize: 10,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        WYSIWYG
                      </button>
                      <button
                        onClick={() => setEditorMode('html')}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${editorMode === 'html' ? C.accent : C.border}`,
                          background: editorMode === 'html' ? C.accent + '15' : C.surface,
                          color: editorMode === 'html' ? C.accent : C.tx3,
                          fontSize: 10,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        HTML
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 4 }}>
                      {/* Formatage texte */}
                      <button
                        onClick={() => formatText('strong')}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${C.border}`,
                          background: C.surface,
                          color: C.tx2,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Gras"
                      >
                        B
                      </button>
                      <button
                        onClick={() => formatText('em')}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${C.border}`,
                          background: C.surface,
                          color: C.tx2,
                          fontSize: 11,
                          fontStyle: 'italic',
                          cursor: 'pointer'
                        }}
                        title="Italique"
                      >
                        I
                      </button>
                      <button
                        onClick={() => formatText('u')}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${C.border}`,
                          background: C.surface,
                          color: C.tx2,
                          fontSize: 11,
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                        title="Souligné"
                      >
                        U
                      </button>
                      
                      <div style={{ width: 1, height: 20, background: C.border, margin: '0 4px' }} />
                      
                      {/* Éléments */}
                      <button
                        onClick={insertLink}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${C.border}`,
                          background: C.surface,
                          color: C.blue,
                          fontSize: 10,
                          cursor: 'pointer'
                        }}
                        title="Lien"
                      >
                        Lien
                      </button>
                      <button
                        onClick={insertImage}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${C.border}`,
                          background: C.surface,
                          color: C.green,
                          fontSize: 10,
                          cursor: 'pointer'
                        }}
                        title="Image"
                      >
                        Image
                      </button>
                      <button
                        onClick={insertButton}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${C.border}`,
                          background: C.surface,
                          color: C.accent,
                          fontSize: 10,
                          cursor: 'pointer'
                        }}
                        title="Bouton"
                      >
                        Bouton
                      </button>
                      
                      <div style={{ width: 1, height: 20, background: C.border, margin: '0 4px' }} />
                      
                      {/* Autres */}
                      <button
                        onClick={insertLineBreak}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${C.border}`,
                          background: C.surface,
                          color: C.tx2,
                          fontSize: 10,
                          cursor: 'pointer'
                        }}
                        title="Saut de ligne"
                      >
                        BR
                      </button>
                      <button
                        onClick={insertHorizontalRule}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${C.border}`,
                          background: C.surface,
                          color: C.tx2,
                          fontSize: 10,
                          cursor: 'pointer'
                        }}
                        title="Ligne horizontale"
                      >
                        HR
                      </button>
                    </div>
                  </div>
                  
                  {/* Moteur de recherche de variables */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.tx3 }}>RECHERCHE VARIABLES:</span>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="text"
                          value={variableSearch}
                          onChange={(e) => {
                            handleVariableSearch(e.target.value);
                            setShowVariableSuggestions(true);
                          }}
                          onFocus={() => setShowVariableSuggestions(true)}
                          placeholder="Rechercher une variable..."
                          style={{
                            width: '100%',
                            padding: '4px 8px',
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            fontSize: 9,
                            background: C.surface,
                            color: C.tx,
                            fontFamily: "'DM Mono', monospace"
                          }}
                        />
                        
                        {/* Suggestions de variables */}
                        {showVariableSuggestions && filteredVariables.length > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            marginTop: 2,
                            maxHeight: '120px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            {filteredVariables.slice(0, 8).map(variable => (
                              <button
                                key={variable}
                                onClick={() => insertVariableFromSearch(variable)}
                                style={{
                                  width: '100%',
                                  padding: '4px 8px',
                                  border: 'none',
                                  background: 'transparent',
                                  color: C.tx2,
                                  fontSize: 9,
                                  fontFamily: "'DM Mono', monospace",
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  borderBottom: `1px solid ${C.border}`,
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = C.bg;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                {`{{${variable}}}`}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Variables récemment utilisées */}
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9, fontWeight: 600, color: C.tx3 }}>RAPIDES:</span>
                      {['firstName', 'companyName', 'websiteLink', 'price'].slice(0, 4).map(variable => (
                        <button
                          key={variable}
                          onClick={() => insertVariable(variable)}
                          style={{
                            padding: '2px 6px',
                            borderRadius: 3,
                            border: `1px solid ${C.border}`,
                            background: C.bg,
                            color: C.tx2,
                            fontSize: 9,
                            fontFamily: "'DM Mono', monospace",
                            cursor: 'pointer'
                          }}
                        >
                          {`{{${variable}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Zone d'édition et preview */}
                <div style={{ display: showPreview ? 'grid' : 'block', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: 0 }}>
                  {/* Éditeur */}
                  <div style={{ padding: '20px', borderRight: showPreview ? `1px solid ${C.border}` : 'none' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: 11, 
                      fontWeight: 600, 
                      color: C.tx2, 
                      marginBottom: 8 
                    }}>
                      {editorMode === 'wysiwyg' ? 'Contenu (WYSIWYG)' : 'Contenu (HTML)'}:
                    </label>
                    <textarea
                      id="template-editor"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      style={{
                        width: '100%',
                        height: '400px',
                        padding: '12px 14px',
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        fontSize: 11,
                        background: C.surface,
                        color: C.tx,
                        fontFamily: editorMode === 'html' ? "'DM Mono', monospace" : "'Inter', sans-serif",
                        lineHeight: 1.5,
                        resize: 'vertical'
                      }}
                      placeholder={editorMode === 'wysiwyg' ? "Entrez le contenu de l'email..." : "Entrez le code HTML..."}
                    />
                    <div style={{ marginTop: 8, fontSize: 10, color: C.tx3 }}>
                      {editorMode === 'wysiwyg' 
                        ? 'Utilisez la barre d\'outils pour formater le texte' 
                        : 'Mode HTML - insérez directement les balises HTML'
                      }
                    </div>
                  </div>
                  
                  {/* Preview */}
                  {showPreview && (
                    <div style={{ padding: '20px', background: '#fff' }}>
                      {/* Header du preview avec switch desktop/mobile et mode édition */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: 12
                      }}>
                        <label style={{ 
                          fontSize: 11, 
                          fontWeight: 600, 
                          color: C.tx2,
                          margin: 0
                        }}>
                          {previewMode === 'mobile' && mobileEditMode ? 'Édition Mobile:' : 'Aperçu en temps réel:'}
                        </label>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: C.tx3 }}>MODE:</span>
                          <button
                            onClick={() => setPreviewMode('desktop')}
                            style={{
                              padding: '3px 6px',
                              borderRadius: 3,
                              border: `1px solid ${previewMode === 'desktop' ? C.accent : C.border}`,
                              background: previewMode === 'desktop' ? C.accent + '15' : C.surface,
                              color: previewMode === 'desktop' ? C.accent : C.tx3,
                              fontSize: 9,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            🖥️ Desktop
                          </button>
                          <button
                            onClick={() => setPreviewMode('mobile')}
                            style={{
                              padding: '3px 6px',
                              borderRadius: 3,
                              border: `1px solid ${previewMode === 'mobile' ? C.accent : C.border}`,
                              background: previewMode === 'mobile' ? C.accent + '15' : C.surface,
                              color: previewMode === 'mobile' ? C.accent : C.tx3,
                              fontSize: 9,
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            📱 Mobile
                          </button>
                          {previewMode === 'mobile' && (
                            <>
                              <div style={{ width: 1, height: 16, background: C.border, margin: '0 8px' }} />
                              <button
                                onClick={() => setMobileEditMode(!mobileEditMode)}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: 3,
                                  border: `1px solid ${mobileEditMode ? C.green : C.border}`,
                                  background: mobileEditMode ? C.green + '15' : C.surface,
                                  color: mobileEditMode ? C.green : C.tx3,
                                  fontSize: 9,
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                {mobileEditMode ? '✏️ Édition' : '👁️ Aperçu'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Contenu du preview */}
                      <div style={{
                        height: '400px',
                        border: `1px solid ${C.border}`,
                        borderRadius: 6,
                        background: '#fff',
                        overflow: 'auto',
                        fontSize: 12,
                        lineHeight: 1.5
                      }}>
                        {previewMode === 'desktop' ? (
                          // Mode Desktop
                          <div style={{
                            padding: '16px',
                            width: '100%',
                            height: '100%'
                          }}
                            dangerouslySetInnerHTML={{ __html: editedContent }}
                          />
                        ) : (
                          // Mode Mobile - simulation d'écran mobile
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            padding: '20px 10px',
                            height: '100%',
                            background: '#f5f5f5'
                          }}>
                            <div style={{
                              width: '375px', // Largeur iPhone
                              height: '667px', // Hauteur iPhone
                              background: '#fff',
                              border: `2px solid ${C.border}`,
                              borderRadius: 20,
                              overflow: 'auto',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                              position: 'relative'
                            }}>
                              {/* Barre de statut mobile */}
                              <div style={{
                                position: 'sticky',
                                top: 0,
                                background: '#000',
                                color: '#fff',
                                padding: '4px 12px',
                                fontSize: 8,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                zIndex: 10
                              }}>
                                <span>9:41</span>
                                <div style={{ display: 'flex', gap: 2 }}>
                                  <span>📶</span>
                                  <span>📶</span>
                                  <span>🔋</span>
                                </div>
                              </div>
                              
                              {/* Contenu de l'email en mode mobile */}
                              {mobileEditMode ? (
                                <textarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  style={{
                                    width: '100%',
                                    height: '580px',
                                    padding: '12px',
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 6,
                                    fontSize: 11,
                                    background: C.surface,
                                    color: C.tx,
                                    fontFamily: "'DM Mono', monospace",
                                    lineHeight: 1.4,
                                    resize: 'none',
                                    outline: 'none'
                                  }}
                                  placeholder="Éditez le contenu de l'email pour mobile..."
                                />
                              ) : (
                                <div style={{
                                  padding: '12px',
                                  fontSize: 11,
                                  lineHeight: 1.4
                                }}
                                dangerouslySetInnerHTML={{ __html: editedContent }}
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Info de responsive */}
                      <div style={{ 
                        marginTop: 8, 
                        fontSize: 9, 
                        color: C.tx3, 
                        textAlign: 'center',
                        fontStyle: 'italic'
                      }}>
                        {previewMode === 'mobile' 
                          ? '📱 Mode Mobile - Test de la responsivité sur écran 375x667px (iPhone)'
                          : '🖥️ Mode Desktop - Affichage standard'
                        }
                      </div>
                    </div>
                  )}
                </div>

                {/* Variables détectées */}
                <div style={{ 
                  padding: '16px 20px', 
                  background: '#f8f9fa',
                  borderTop: `1px solid ${C.border}`
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.tx3, marginBottom: 8 }}>
                    Variables détectées dans le contenu:
                  </div>
                  <div style={{ fontSize: 10, color: C.tx2, fontFamily: "'DM Mono', monospace" }}>
                    {(() => {
                      const variableRegex = /\{\{(\w+)\}\}/g;
                      const matches = editedContent.match(variableRegex) || [];
                      const extractedVariables = [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
                      
                      if (extractedVariables.length === 0) {
                        return 'Aucune variable détectée';
                      }
                      
                      return extractedVariables.map(v => `{{${v}}}`).join(', ');
                    })()}
                  </div>
                </div>
              </div>
            );
          }
          
          // Mode affichage normal
          return (
            <div style={{ marginTop: 14, padding: '14px', background: C.bg, borderRadius: 6, fontSize: 13 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 10 
              }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  Sujet: {selected.subject}
                </div>
                <button
                  onClick={() => startEditingTemplate(selected)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: `1px solid ${C.accent}`,
                    background: C.accent + '15',
                    color: C.accent,
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>Éditer</span>
                </button>
              </div>
              
              {/* Template HTML - Affichage complet du contenu texte */}
              {selected.htmlContent ? (
                <div>
                  <div style={{ marginBottom: 8, fontSize: 11, color: C.tx3 }}>
                    Template HTML moderne avec design professionnel
                  </div>
                  <div style={{ 
                    background: '#fff', 
                    padding: '12px', 
                    borderRadius: 6, 
                    border: '1px solid #e9ecef',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    <pre style={{ 
                      fontFamily: "'DM Mono', monospace", 
                      fontSize: 11, 
                      color: C.tx2, 
                      whiteSpace: 'pre-wrap', 
                      lineHeight: 1.4,
                      margin: 0
                    }}>
                      {selected.htmlContent.replace(/<[^>]*>/g, '\n').replace(/\n\s*\n/g, '\n').trim()}
                    </pre>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 10, color: C.tx3 }}>
                    Contenu HTML complet (balises retirées pour la lisibilité)
                  </div>
                </div>
              ) : (
                /* Template texte classique */
                <pre style={{ 
                  fontFamily: "'DM Mono', monospace", 
                  fontSize: 12, 
                  color: C.tx2, 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: 1.5,
                  background: '#fff',
                  padding: '12px',
                  borderRadius: 6,
                  border: '1px solid #e9ecef'
                }}>
                  {selected.textContent}
                </pre>
              )}
              
              {/* Variables du template */}
              {selected.variables && selected.variables.length > 0 && (
                <div style={{ marginTop: 12, padding: '8px', background: '#f8f9fa', borderRadius: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.tx3, marginBottom: 4 }}>
                    Variables utilisées:
                  </div>
                  <div style={{ fontSize: 10, color: C.tx2, fontFamily: "'DM Mono', monospace" }}>
                    {selected.variables.map((v: string) => `{{${v}}}`).join(', ')}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Ready / Sent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: C.surface, borderRadius: 8, padding: '20px', border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: C.amber }}>📬 Prêts à envoyer ({ready.length})</h3>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {ready.map(lead => (
              <div key={lead.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderBottom: `1px solid ${C.border}`,
              }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{lead.name}</div>
                  <div style={{ fontSize: 11, color: C.tx3, fontFamily: "'DM Mono', monospace" }}>{lead.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => previewForLead(lead)} style={{
                    padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
                    background: C.surface, fontSize: 12, cursor: 'pointer', color: C.blue,
                  }}>👁️</button>
                  {workflowMode === 'automated' ? (
                    <>
                      <button onClick={() => sendWorkflowEmail(lead, 'email1_presentation')} disabled={!hasGmailSmtp} style={{
                        padding: '4px 10px', borderRadius: 4, border: 'none',
                        background: hasGmailSmtp ? C.blue : C.tx3, color: '#fff',
                        fontSize: 12, cursor: hasGmailSmtp ? 'pointer' : 'default',
                      }}>📧</button>
                      <button onClick={() => sendEmail2WithPayment(lead)} disabled={!hasGmailSmtp} style={{
                        padding: '4px 10px', borderRadius: 4, border: 'none',
                        background: hasGmailSmtp ? C.green : C.tx3, color: '#fff',
                        fontSize: 12, cursor: hasGmailSmtp ? 'pointer' : 'default',
                      }}>💳</button>
                      <button onClick={() => sendEmail3Confirmation(lead)} disabled={!hasGmailSmtp} style={{
                        padding: '4px 10px', borderRadius: 4, border: 'none',
                        background: hasGmailSmtp ? C.accent : C.tx3, color: '#fff',
                        fontSize: 12, cursor: hasGmailSmtp ? 'pointer' : 'default',
                      }}>🎉</button>
                    </>
                  ) : (
                    <button onClick={() => sendOne(lead)} disabled={!hasGmailSmtp} style={{
                      padding: '4px 10px', borderRadius: 4, border: 'none',
                      background: hasGmailSmtp ? C.amber : C.tx3, color: '#fff',
                      fontSize: 12, cursor: hasGmailSmtp ? 'pointer' : 'default',
                    }}>Envoyer</button>
                  )}
                </div>
              </div>
            ))}
            {ready.length === 0 && <p style={{ color: C.tx3, fontSize: 13, textAlign: 'center', padding: 20 }}>Aucun lead prêt à recevoir un email</p>}
          </div>
        </div>

        <div style={{ background: C.surface, borderRadius: 12, padding: '18px', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {/* Header avec filtre */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 10, borderBottom: `2px solid ${C.bg}` }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: C.green, display: 'flex', alignItems: 'center', gap: 8 }}>
                ✅ Emails Envoyés
                <span style={{ fontSize: 12, fontWeight: 500, color: C.tx3, background: C.bg, padding: '3px 8px', borderRadius: 12 }}>
                  {filteredSent.length}
                </span>
              </h3>
              <p style={{ fontSize: 11, color: C.tx3, margin: '4px 0 0 0' }}>Détails complets des campagnes d'emailing</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              {/* Filtres */}
              <div style={{ display: 'flex', gap: 4, fontSize: 9 }}>
                <button
                  onClick={() => handleFilterChange('all')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: `1px solid ${filterStatus === 'all' ? C.green : C.border}`,
                    background: filterStatus === 'all' ? C.green + '15' : C.bg,
                    color: filterStatus === 'all' ? C.green : C.tx3,
                    fontSize: 9,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📧 Tous ({sent.length})
                </button>
                <button
                  onClick={() => handleFilterChange('opened')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: `1px solid ${filterStatus === 'opened' ? C.blue : C.border}`,
                    background: filterStatus === 'opened' ? C.blue + '15' : C.bg,
                    color: filterStatus === 'opened' ? C.blue : C.tx3,
                    fontSize: 9,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📧 Ouverts ({sent.filter(l => l.emailOpened).length})
                </button>
                <button
                  onClick={() => handleFilterChange('converted')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: `1px solid ${filterStatus === 'converted' ? C.green : C.border}`,
                    background: filterStatus === 'converted' ? C.green + '15' : C.bg,
                    color: filterStatus === 'converted' ? C.green : C.tx3,
                    fontSize: 9,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🏆 Convertis ({leads.filter(l => l.stage === 'converted').length})
                </button>
                <button
                  onClick={() => handleFilterChange('not-converted')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: `1px solid ${filterStatus === 'not-converted' ? C.amber : C.border}`,
                    background: filterStatus === 'not-converted' ? C.amber + '15' : C.bg,
                    color: filterStatus === 'not-converted' ? C.amber : C.tx3,
                    fontSize: 9,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ⏳ En cours ({sent.filter(l => l.stage !== 'converted').length})
                </button>
              </div>
              
                          </div>
          </div>

          {/* Vue détaillée mais compacte avec pagination */}
          <div style={{ maxHeight: 650, overflowY: 'auto', paddingRight: 4 }}>
            {paginatedSent.map(lead => {
              const isConverted = lead.stage === 'converted';
              const progressPercent = ((lead.sentSteps || []).length / 8) * 100;
              
              return (
                <div key={lead.id} style={{
                  background: C.bg,
                  borderRadius: 8,
                  padding: '14px 16px',
                  marginBottom: 8,
                  border: `1px solid ${C.border}`,
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}>
                  {/* En-tête avec infos principales */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ 
                          width: 8, height: 8, borderRadius: '50%', 
                          background: isConverted ? C.green : lead.emailOpened ? C.blue : C.tx3,
                          boxShadow: isConverted ? `0 0 0 3px ${C.green}20` : lead.emailOpened ? `0 0 0 3px ${C.blue}20` : 'none'
                        }} />
                        <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: C.tx }}>
                          {lead.name}
                        </h4>
                        {isConverted && (
                          <span style={{ 
                            fontSize: 9, padding: '2px 6px', borderRadius: 8, 
                            background: C.green + '15', color: C.green, fontWeight: 600,
                            border: `1px solid ${C.green}40`
                          }}>
                            ✅ Converti ({lead.revenue || 0}€)
                          </span>
                        )}
                        {lead.emailOpened && !isConverted && (
                          <span style={{ 
                            fontSize: 9, padding: '2px 6px', borderRadius: 8, 
                            background: C.blue + '15', color: C.blue, fontWeight: 600,
                            border: `1px solid ${C.blue}40`
                          }}>
                            📧 Ouvert
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: 16, fontSize: 10, color: C.tx3, fontFamily: "'DM Mono', monospace" }}>
                        <span>📧 {lead.email}</span>
                        <span>📅 {lead.emailSentDate ? new Date(lead.emailSentDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</span>
                        <span>🏢 {lead.sector || 'N/A'}</span>
                        <span>🌍 {lead.city || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informations détaillées sur les emails */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: C.tx2, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      📧 Détails des emails envoyés
                      <span style={{ fontSize: 9, color: C.tx3, fontWeight: 400 }}>
                        ({(lead.sentSteps || []).length}/8 étapes)
                      </span>
                    </div>
                    
                    {/* Grille d'étapes détaillées sur une ligne */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2 }}>
                      {[
                        { id: 'step-1-start', label: 'Présentation', icon: '📧', desc: 'Email initial de présentation' },
                        { id: 'step-2-devis', label: 'Devis', icon: '📄', desc: 'Devis et lien de paiement' },
                        { id: 'reminder1_after_email1', label: 'Rappel 1', icon: '⏰', desc: 'Rappel 3j après présentation' },
                        { id: 'reminder2_after_devis', label: 'Rappel 2', icon: '⏰', desc: 'Rappel 2j avant expiration' },
                        { id: 'step-3-depot', label: 'Acompte', icon: '💰', desc: 'Confirmation acompte 46€' },
                        { id: 'reminder3_final_payment', label: 'Rappel 3', icon: '⏰', desc: 'Rappel 3j après paiement final' },
                        { id: 'step-5-confirmation', label: 'Solde', icon: '🏆', desc: 'Confirmation solde 100€' },
                        { id: 'step-6-livraison', label: 'Livraison', icon: '📦', desc: 'Livraison du site web' }
                      ].map(step => {
                        const isSent = (lead.sentSteps || []).includes(step.id);
                        const isPending = scheduled.some(s => s.lead_id === lead.id && s.template_id === step.id);
                        
                        return (
                          <div key={step.id} style={{ 
                            fontSize: 8, fontWeight: 600, padding: '6px 4px', borderRadius: 4,
                            background: isSent ? C.green + '15' : isPending ? C.amber + '15' : '#ffffff',
                            color: isSent ? C.green : isPending ? C.amber : C.tx3,
                            border: `1px solid ${isSent ? C.green + '40' : isPending ? C.amber + '40' : C.border}`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          title={step.desc}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <span style={{ fontSize: 10 }}>{isSent ? '✅' : isPending ? '⏳' : '⚪'}</span>
                              <span>{step.icon}</span>
                            </div>
                            <span>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Statistiques sur une seule ligne forcée */}
                  <div style={{ 
                    display: 'flex', 
                    gap: 6, 
                    marginBottom: 10, 
                    fontSize: 9, 
                    color: C.tx3, 
                    alignItems: 'center', 
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    flexWrap: 'nowrap'
                  }}>
                    <span style={{ flexShrink: 0, display: 'inline-block' }}>📈 Progression: {(() => {
                      const salesSteps = ['step-1-start', 'step-2-devis', 'step-3-depot', 'step-5-confirmation', 'step-6-livraison'];
                      const sentSalesSteps = (lead.sentSteps || []).filter(step => salesSteps.includes(step));
                      return Math.round((sentSalesSteps.length / salesSteps.length) * 100);
                    })()}%</span>
                    {lead.siteClicked && <span style={{ flexShrink: 0, display: 'inline-block' }}>🔗 Site cliqué</span>}
                    {lead.paymentDepositClicked && <span style={{ flexShrink: 0, display: 'inline-block' }}>💳 Acompte cliqué</span>}
                    {lead.paymentFinalClicked && <span style={{ flexShrink: 0, display: 'inline-block' }}>💳 Solde cliqué</span>}
                    {lead.devisClicked && <span style={{ flexShrink: 0, display: 'inline-block' }}>📄 Devis cliqué</span>}
                    {lead.invoiceDepositClicked && <span style={{ flexShrink: 0, display: 'inline-block' }}>🧾 Facture acompte cliquée</span>}
                    {lead.invoiceFinalClicked && <span style={{ flexShrink: 0, display: 'inline-block' }}>🧾 Facture solde cliquée</span>}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                    <button 
                      onClick={() => previewForLead(lead)} 
                      style={{
                        padding: '6px 12px', borderRadius: 6, border: `1px solid ${C.border}`,
                        background: C.surface, fontSize: 10, cursor: 'pointer', color: C.blue,
                        fontWeight: 500, transition: 'all 0.2s ease'
                      }}
                    >
                      👁️ Aperçu
                    </button>
                    
                    {!isConverted && (
                      <>
                        <button 
                          onClick={() => confirmDeposit(lead)} 
                          style={{
                            padding: '6px 12px', borderRadius: 6, border: 'none',
                            background: C.green, color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(26, 122, 74, 0.2)'
                          }}
                        >
                          💰 Valider Acompte
                        </button>
                        <button 
                          onClick={() => confirmFinalPayment(lead)} 
                          style={{
                            padding: '6px 12px', borderRadius: 6, border: 'none',
                            background: C.amber, color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(212, 80, 10, 0.2)'
                          }}
                        >
                          🏆 Valider Solde
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            
            {paginatedSent.length === 0 && filteredSent.length > 0 && (
              <div style={{ 
                textAlign: 'center', padding: '30px 20px', 
                background: C.bg, borderRadius: 10, border: `2px dashed ${C.border}`
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>🔍</div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: C.tx2, margin: '0 0 6px 0' }}>
                  Aucun lead trouvé pour ce filtre
                </h4>
                <p style={{ fontSize: 11, color: C.tx3, margin: 0 }}>
                  Essayez un autre filtre pour voir les leads correspondants
                </p>
              </div>
            )}

            {sent.length === 0 && (
              <div style={{ 
                textAlign: 'center', padding: '40px 20px', 
                background: C.bg, borderRadius: 10, border: `2px dashed ${C.border}`
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: C.tx2, margin: '0 0 8px 0' }}>
                  Aucun email envoyé
                </h4>
                <p style={{ fontSize: 12, color: C.tx3, margin: 0 }}>
                  Commencez par envoyer des emails aux leads prêts dans la section "Prêts à envoyer"
                </p>
              </div>
            )}

            {/* Contrôles de pagination */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: 8, 
                marginTop: 16,
                paddingTop: 12,
                borderTop: `1px solid ${C.border}`
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    background: currentPage === 1 ? C.bg : C.surface,
                    color: currentPage === 1 ? C.tx3 : C.tx,
                    fontSize: 10,
                    fontWeight: 500,
                    cursor: currentPage === 1 ? 'default' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ← Précédent
                </button>

                {/* Numéros de page */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: `1px solid ${pageNum === currentPage ? C.green : C.border}`,
                          background: pageNum === currentPage ? C.green + '15' : C.bg,
                          color: pageNum === currentPage ? C.green : C.tx3,
                          fontSize: 9,
                          fontWeight: pageNum === currentPage ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          minWidth: '24px'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    background: currentPage === totalPages ? C.bg : C.surface,
                    color: currentPage === totalPages ? C.tx3 : C.tx,
                    fontSize: 10,
                    fontWeight: 500,
                    cursor: currentPage === totalPages ? 'default' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Suivant →
                </button>
              </div>
            )}

            {/* Info de pagination */}
            {totalPages > 1 && (
              <div style={{ 
                textAlign: 'center', 
                fontSize: 9, 
                color: C.tx3, 
                marginTop: 8 
              }}>
                Page {currentPage} sur {totalPages} • {filteredSent.length} leads au total
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div style={{ background: C.surface, borderRadius: 8, padding: '16px 20px', border: `1px solid ${C.border}`, marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Journal d'envoi</h3>
            <button onClick={() => setLogs([])} style={{
              padding: '3px 10px', borderRadius: 4, border: `1px solid ${C.border}`,
              background: C.surface, fontSize: 11, cursor: 'pointer', color: C.tx3,
            }}>Effacer</button>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
            {logs.map((log, i) => (
              <div key={i} style={{ padding: '3px 0', color: log.startsWith('✅') ? C.green : log.startsWith('❌') ? C.red : C.tx2 }}>{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Links Status */}
      {Object.keys(paymentLinks).length > 0 && (
        <div style={{ background: C.surface, borderRadius: 8, padding: '16px 20px', border: `1px solid ${C.border}`, marginTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>💳 Liens de paiement actifs</h3>
          <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
            {Object.entries(paymentLinks).map(([leadId, data]) => {
              const lead = leads.find(l => l.id === leadId);
              return (
                <div key={leadId} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{lead?.name || leadId}</div>
                  <div style={{ color: C.tx2, fontSize: 11 }}>
                    Montant: {data.amount}€ | Créé: {new Date(data.created).toLocaleDateString('fr-FR')}
                  </div>
                  <div style={{ color: C.blue, fontSize: 10, wordBreak: 'break-all' }}>
                    {data.link}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewEmail && (
        <>
          <div onClick={() => setPreviewEmail(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)', zIndex: 99,
          }} />
          <div style={{
            position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
            width: 600, maxHeight: '80%', background: C.surface, borderRadius: 12,
            zIndex: 100, padding: 28, overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20 }}>Aperçu de l'email</h2>
              <button onClick={() => setPreviewEmail(null)} style={{
                width: 28, height: 28, borderRadius: 4, border: `1px solid ${C.border}`,
                background: C.surface, fontSize: 14, cursor: 'pointer',
              }}>✕</button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: C.tx3 }}>À :</span>
              <span style={{ fontSize: 13, marginLeft: 8, fontFamily: "'DM Mono', monospace" }}>{previewEmail.lead.email}</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: C.tx3 }}>Sujet :</span>
              <span style={{ fontSize: 14, marginLeft: 8, fontWeight: 600 }}>{previewEmail.subject}</span>
            </div>
            <div 
              style={{ 
                padding: 20, background: '#F7F6F2', borderRadius: 8, 
                fontSize: 14, lineHeight: 1.7, fontFamily: "'Bricolage Grotesque', sans-serif",
                maxHeight: 400, overflow: 'auto'
              }}
              dangerouslySetInnerHTML={{ __html: previewEmail.body }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => { sendOne(previewEmail.lead); setPreviewEmail(null); }} disabled={!hasGmailSmtp} style={{
                flex: 1, padding: '11px 0', borderRadius: 6, border: 'none',
                background: hasGmailSmtp ? C.amber : C.tx3, color: '#fff',
                fontWeight: 600, fontSize: 14, cursor: hasGmailSmtp ? 'pointer' : 'default',
              }}>📧 Envoyer maintenant</button>
              <button onClick={() => setPreviewEmail(null)} style={{
                padding: '11px 20px', borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.surface, color: C.tx2, fontWeight: 500, fontSize: 14, cursor: 'pointer',
              }}>Fermer</button>
            </div>
          </div>
        </>
      )}

      {/* HTML Email Preview Modal */}
      {showEmailPreview && (() => {
        const allTemplates = [...templates, ...currentSalesTemplates, ...currentReminderTemplates];
        const selected = allTemplates.find(t => t.id === selectedTemplate);
        if (!selected || !selected.htmlContent) return null;

        return (
          <>
            <div onClick={() => setShowEmailPreview(false)} style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', zIndex: 199,
            }} />
            <div style={{
              position: 'fixed', top: '5%', left: '5%', right: '5%', bottom: '5%',
              background: '#fff', borderRadius: 12,
              zIndex: 200, overflow: 'hidden',
              boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
            }}>
              {/* Header */}
              <div style={{
                background: '#f8f9fa', padding: '16px 20px',
                borderBottom: '1px solid #dee2e6',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#495057' }}>
                    👁️ Visualisation Email HTML
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#6c757d' }}>
                    {selected.name} - {selected.subject}
                  </p>
                </div>
                <button onClick={() => setShowEmailPreview(false)} style={{
                  width: 32, height: 32, borderRadius: 6, border: '1px solid #dee2e6',
                  background: '#fff', fontSize: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>✕</button>
              </div>

              {/* Email Content */}
              <div style={{
                height: 'calc(100% - 60px)', overflow: 'auto',
                background: '#f4f4f4'
              }}>
                <div dangerouslySetInnerHTML={{ __html: selected.htmlContent }} />
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
