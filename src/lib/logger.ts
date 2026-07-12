// ============================================================
// LeadForge AI — Logger (console.log replacement)
// Logs are silenced in production builds.
// ============================================================

const isDev = import.meta.env?.DEV ?? true;

export const logger = {
  log: (...args: unknown[]) => { if (isDev) logger.log(...args); },
  warn: (...args: unknown[]) => { if (isDev) logger.warn(...args); },
  error: (...args: unknown[]) => { if (isDev) logger.error(...args); },
  info: (...args: unknown[]) => { if (isDev) logger.info(...args); },
  debug: (...args: unknown[]) => { if (isDev) console.debug(...args); },
};
