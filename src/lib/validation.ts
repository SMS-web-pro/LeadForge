// Utilitaires de validation pour la sécurité

/**
 * Valide et nettoie une entrée de texte
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  return input
    // Supprime les caractères dangereux
    .replace(/[<>]/g, '')
    // Limite la longueur
    .slice(0, 1000)
    // Supprime les espaces excessifs
    .trim();
}

/**
 * Valide un email (format basique)
 */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Regex RFC 5322 simplifiée — plus stricte que la version basique
 */
const RFC5322_EMAIL_REGEX = /^(?!.*\.\.)[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Domaines jetables / temporaires à bloquer (liste élargie)
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'tempmail.com',
  'throwaway.email', 'tempail.com', 'temp-mail.org', 'temp-mail.io',
  'yopmail.com', 'yopmail.fr', 'fakeinbox.com', 'sharklasers.com',
  'guerrillamailblock.com', 'grr.la', 'dispostable.com', 'maildrop.cc',
  'mailnesia.com', 'trashmail.com', 'trashmail.me', 'trashmail.net',
  'trashmail.org', 'trashmail.ws', 'mailcatch.com', 'tempinbox.com',
  'tempomail.fr', 'jetable.org', 'nospam.ze.tc', 'nobulk.com',
  'cubiclink.com', 'nomail.xl.cx', 'mytemp.email', 'emailondeck.com',
  '10minutemail.com', 'tempr.email', 'discard.email', 'discardmail.com',
  'mailnull.com', 'spamgourmet.com', 'mailexpire.com',
  'mohmal.com', 'burnermail.io', 'harakirimail.com',
]);

/**
 * Domaines d'annuaires / pagesJaunes / tiers à bloquer
 */
const DIRECTORY_DOMAINS = new Set([
  'pagesjaunes.fr', 'societe.com', 'mairie.fr', 'infogreffe.fr',
  'pappers.fr', 'verif.com', 'manageo.fr', 'annuaire-entreprises.data.gouv.fr',
  'google.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'linkedin.com', 'youtube.com', 'wikipedia.org', 'amazon.com',
  'apple.com', 'microsoft.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'live.com', 'msn.com', 'gmail.com', 'yahoo.fr',
  'example.com', 'test.com', 'localhost', 'sentry.io', 'wixpress.com',
  'w3.org', 'schema.org', 'creativecommons.org',
]);

/**
 * Extensions de domaine suspectes (non-exhaustif)
 */
const SUSPICIOUS_TLDS = new Set([
  'tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'work', 'buzz',
  'click', 'link', 'download', 'racing', 'win', 'loan', 'cricket',
]);

/**
 * Valide un email avec filtrage avancé (RFC 5322 + domaines jetables/annuaires)
 * Retourne un objet détaillé au lieu d'un simple boolean
 */
export function validateEmailAdvanced(email: unknown): {
  valid: boolean;
  reason?: string;
  domain?: string;
} {
  if (typeof email !== 'string' || !email) {
    return { valid: false, reason: 'empty' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 254) {
    return { valid: false, reason: 'too_long' };
  }

  if (!RFC5322_EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: 'invalid_format' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, reason: 'invalid_format' };
  }

  const [localPart, domain] = parts;

  if (localPart.length === 0 || localPart.length > 64) {
    return { valid: false, reason: 'local_part_invalid' };
  }

  if (domain.length === 0 || domain.length > 253) {
    return { valid: false, reason: 'domain_invalid' };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: 'disposable_domain', domain };
  }

  if (DIRECTORY_DOMAINS.has(domain)) {
    return { valid: false, reason: 'directory_domain', domain };
  }

  const tld = domain.split('.').pop() || '';
  if (SUSPICIOUS_TLDS.has(tld)) {
    return { valid: false, reason: 'suspicious_tld', domain };
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { valid: false, reason: 'local_part_dots', domain };
  }

  return { valid: true, domain };
}

/**
 * Valide un email et vérifie les enregistrements MX du domaine (async)
 * Utilise une API DNS publique pour la vérification côté client
 */
export async function validateEmailWithMX(email: unknown): Promise<{
  valid: boolean;
  reason?: string;
  domain?: string;
  hasMX?: boolean;
}> {
  const basic = validateEmailAdvanced(email);
  if (!basic.valid) {
    return basic;
  }

  const domain = basic.domain!;

  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const hasMX = data.Answer && Array.isArray(data.Answer) && data.Answer.length > 0;

    if (!hasMX) {
      const resA = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
        { signal: AbortSignal.timeout(5000) }
      );
      const dataA = await resA.json();
      const hasA = dataA.Answer && Array.isArray(dataA.Answer) && dataA.Answer.length > 0;

      if (!hasA) {
        return { valid: false, reason: 'no_mx_or_a_record', domain, hasMX: false };
      }
    }

    return { valid: true, domain, hasMX: hasMX ?? true };
  } catch {
    return { valid: true, domain, hasMX: undefined };
  }
}

/**
 * Valide une URL
 */
export function validateUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Valide une clé API (format général)
 * Accepte une gamme plus large de caractères pour les clés API modernes
 */
export function validateApiKey(key: unknown): boolean {
  if (typeof key !== 'string') return false;
  
  // Doit avoir entre 10 et 500 caractères (plage plus large)
  if (key.length < 10 || key.length > 500) return false;
  
  // Accepte presque tous les caractères sauf ceux dangereux
  // Autorise: lettres, chiffres, underscores, tirets, points, et caractères spéciaux courants
  return true; // On accepte le format tel quel, la validation se fait sur la longueur
}

/**
 * Nettoie une clé API sans validation stricte
 */
export function sanitizeApiKey(key: unknown): string | null {
  if (typeof key !== 'string') return null;
  
  const trimmed = key.trim();
  
  // Longueur minimale raisonnable pour une clé API
  if (trimmed.length < 10) return null;
  
  // Longueur maximale
  if (trimmed.length > 500) return trimmed.slice(0, 500);
  
  return trimmed;
}

/**
 * Nettoie et valide une clé API Serper
 */
export function sanitizeSerperKey(key: unknown): string | null {
  const sanitized = sanitizeApiKey(key);
  return sanitized;
}

/**
 * Nettoie et valide une clé API Groq
 */
export function sanitizeGroqKey(key: unknown): string | null {
  const sanitized = sanitizeApiKey(key);
  
  if (!sanitized) return null;
  
  // Les clés Groq commencent par "gsk_"
  if (!sanitized.startsWith('gsk_')) return null;
  
  return sanitized;
}

/**
 * Nettoie et valide une clé API Resend
 */
export function sanitizeResendKey(key: unknown): string | null {
  const sanitized = sanitizeApiKey(key);
  
  if (!sanitized) return null;
  
  // Les clés Resend commencent par "re_"
  if (!sanitized.startsWith('re_')) return null;
  
  return sanitized;
}

/**
 * Validation XSS - échappe le HTML
 */
export function escapeHtml(unsafe: unknown): string {
  if (typeof unsafe !== 'string') return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validation pour les noms de fichiers
 */
export function validateFileName(fileName: unknown): boolean {
  if (typeof fileName !== 'string') return false;
  
  // Pas de caractères dangereux
  const dangerousChars = /[<>:"|?*\\]/;
  if (dangerousChars.test(fileName)) return false;
  
  // Pas de noms réservés Windows
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  if (reservedNames.test(fileName.split('.')[0])) return false;
  
  return fileName.length > 0 && fileName.length <= 255;
}

/**
 * Rate limiting simple en mémoire
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(private maxRequests: number, private windowMs: number) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Nettoie les anciennes requêtes
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter(100, 60000); // 100 requêtes par minute
