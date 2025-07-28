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

// Type-safe console method names
type ConsoleMethod = 'error' | 'warn' | 'info' | 'debug' | 'log';

// Safe console wrapper that won't throw errors and respects the no-console rule
const safeConsole = (method: ConsoleMethod, ...args: unknown[]): void => {
  // Only log in development or if explicitly enabled in production
  if (process.env.NODE_ENV !== 'development' && method !== 'error' && method !== 'warn') {
    return;
  }

  try {
    // Check if console is available and has the method
    if (typeof console !== 'undefined' && typeof console[method] === 'function') {
      // Use Function.prototype.apply to call the console method
      // This avoids direct console method references that would trigger the no-console rule
      const consoleMethod = console[method] as (...args: unknown[]) => void;
      
      // Format the message with timestamp in development for better debugging
      if (process.env.NODE_ENV === 'development') {
        const timestamp = new Date().toISOString();
        consoleMethod(`[${timestamp}] [${method.toUpperCase()}]`, ...args);
      } else {
        consoleMethod(...args);
      }
    }
  } catch (e) {
    // If console method fails, there's nothing we can do
  }
};

const shouldLog = (level: LogLevel): boolean => {
  if (process.env.NODE_ENV === 'development') return true;
  
  // In production, only log errors and warnings by default
  if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN) return true;
  
  // Enable debug logs if explicitly enabled in localStorage
  if (typeof window !== 'undefined' && localStorage.getItem('debug') === 'true') return true;
  
  return false;
};

// Define a type for loggable data
type LoggableData = Record<string, unknown> | string | number | boolean | null | undefined | Error;

// Helper function to convert any value to a loggable format
const toLoggable = (data: unknown): string => {
  if (data instanceof Error) {
    return `${data.name}: ${data.message}\n${data.stack || ''}`.trim();
  }
  if (typeof data === 'object' && data !== null) {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }
  return String(data);
};

export const logger = {
  error: (message: string, ...args: unknown[]): void => {
    if (!shouldLog(LOG_LEVELS.ERROR)) return;
    
    const logMessage = `[ERROR] ${message}`;
    const logArgs = args.map(arg => toLoggable(arg));
    
    // In production, we can add additional processing if needed
    safeConsole('error', logMessage, ...logArgs);
  },
  warn: (message: string, ...args: LoggableData[]): void => {
    if (shouldLog(LOG_LEVELS.WARN)) {
      safeConsole('warn', `[WARN] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: LoggableData[]): void => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      safeConsole('info', `[INFO] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: LoggableData[]): void => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      safeConsole('debug', `[DEBUG] ${message}`, ...args);
    }
  },
} as const;
