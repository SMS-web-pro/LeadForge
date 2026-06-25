// ============================================================
// LeadForge AI — Email Validation Store (localStorage)
// Persistance locale sans migration DB
// ============================================================

const STORAGE_KEY = 'leadforge_email_validation';

interface EmailValidationRecord {
  leadId: string;
  invalid: boolean;
  reason: string;
  timestamp: string;
}

function getAll(): Record<string, EmailValidationRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, EmailValidationRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn('[EmailValidation] Failed to save to localStorage');
  }
}

export const emailValidationStore = {
  markInvalid(leadId: string, reason: string): void {
    const all = getAll();
    all[leadId] = {
      leadId,
      invalid: true,
      reason,
      timestamp: new Date().toISOString(),
    };
    saveAll(all);
  },

  markValid(leadId: string): void {
    const all = getAll();
    delete all[leadId];
    saveAll(all);
  },

  isInvalid(leadId: string): boolean {
    return !!getAll()[leadId]?.invalid;
  },

  getReason(leadId: string): string {
    return getAll()[leadId]?.reason || '';
  },

  getInvalidLeads(): string[] {
    const all = getAll();
    return Object.keys(all).filter(k => all[k].invalid);
  },

  getAllRecords(): EmailValidationRecord[] {
    return Object.values(getAll());
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  loadIntoLeads(leads: Array<{ id: string; emailInvalid?: boolean; emailInvalidReason?: string }>): void {
    const all = getAll();
    for (const lead of leads) {
      const record = all[lead.id];
      if (record) {
        lead.emailInvalid = record.invalid;
        lead.emailInvalidReason = record.reason;
      }
    }
  },
};
