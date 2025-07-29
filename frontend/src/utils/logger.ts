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
    // In a real app, you would send logs to a logging service here
    // For example: sendToLoggingService(method, ...args);
    
    // For local development, we'll use the console but disable the ESLint rule temporarily
    // This is the only place where we'll disable the no-console rule
    // eslint-disable-next-line no-console
    const consoleMethod = console[method] as (...args: unknown[]) => void;
    
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const message = args.length > 0 
        ? `[${timestamp}] [${method.toUpperCase()}] ${String(args[0])}`
        : `[${timestamp}] [${method.toUpperCase()}]`;
      
      const logArgs = [message, ...args.slice(1)];
      consoleMethod(...logArgs);
    } else if (method === 'error' || method === 'warn') {
      // In production, only log errors and warnings
      consoleMethod(...args);
    }
  } catch (e) {
    // If logging fails, there's nothing we can do
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
