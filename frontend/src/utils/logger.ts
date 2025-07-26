/**
 * Centralized logging utility
 * In production, only log errors and warnings unless explicitly enabled
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

const shouldLog = (level: LogLevel): boolean => {
  if (process.env.NODE_ENV === 'development') return true;
  
  // In production, only log errors and warnings by default
  if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN) return true;
  
  // Enable debug logs if explicitly enabled in localStorage
  if (localStorage.getItem('debug') === 'true') return true;
  
  return false;
};

// Define a type for loggable data
type LoggableData = Record<string, unknown> | string | number | boolean | null | undefined;

export const logger = {
  error: (message: string, ...args: LoggableData[]) => {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      // Use a try-catch to ensure logging never breaks the app
      try {
        console.error(`[ERROR] ${message}`, ...args);
      } catch (e) {
        // If console.error fails, there's not much we can do
      }
    }
  },
  warn: (message: string, ...args: LoggableData[]) => {
    if (shouldLog(LOG_LEVELS.WARN)) {
      try {
        console.warn(`[WARN] ${message}`, ...args);
      } catch (e) {
        // Ignore
      }
    }
  },
  info: (message: string, ...args: LoggableData[]) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      try {
        console.info(`[INFO] ${message}`, ...args);
      } catch (e) {
        // Ignore
      }
    }
  },
  debug: (message: string, ...args: LoggableData[]) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      try {
        console.debug(`[DEBUG] ${message}`, ...args);
      } catch (e) {
        // Ignore
      }
    }
  },
} as const;
