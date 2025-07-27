/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Environment variables type definitions
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_BASE_URL: string;
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend the Window interface if needed
declare interface Window {
  // Add any global window properties here
}

// Add any custom type declarations below this line
