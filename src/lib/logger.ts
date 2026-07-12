// ============================================================
// LeadForge AI — Logger (console.log replacement)
// Logs are silenced in production builds.
// ============================================================

const isDev = import.meta.env?.DEV ?? true;

export const logger = {
  log: (...args: unknown[]) => { if (isDev) console.log(...args); },
  warn: (...args: unknown[]) => { if (isDev) console.warn(...args); },
  error: (...args: unknown[]) => { if (isDev) console.error(...args); },
  info: (...args: unknown[]) => { if (isDev) console.info(...args); },
  debug: (...args: unknown[]) => { if (isDev) console.debug(...args); },
};
