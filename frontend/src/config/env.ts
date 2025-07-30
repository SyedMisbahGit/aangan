/**
 * Environment configuration
 * 
 * This file provides type-safe access to environment variables.
 * All environment variables should be accessed through this file.
 */

// Import environment variables with Vite's import.meta.env
const env = {
  // Environment
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  // App Info
  APP_NAME: import.meta.env.VITE_APP_NAME || 'WhisperVerse',
  APP_DOMAIN: import.meta.env.VITE_APP_DOMAIN || 'localhost',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || '/api',
  API_VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  
  // Auth
  AUTH_TOKEN_KEY: import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token',
  REFRESH_TOKEN_KEY: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token',
  TOKEN_EXPIRY: parseInt(import.meta.env.VITE_TOKEN_EXPIRY || '3600'),
  
  // Social Media
  TWITTER_HANDLE: import.meta.env.VITE_TWITTER_HANDLE || '@yourtwitter',
  FACEBOOK_APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID || '',
  
  // Analytics
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  
  // Feature Flags
  ENABLE_OFFLINE: import.meta.env.VITE_ENABLE_OFFLINE === 'true',
  
  // Testing
  IS_TEST: import.meta.env.MODE === 'test',
} as const;

// Export the environment variables
export default env;

// Export types for better type checking
export type EnvConfig = typeof env;
