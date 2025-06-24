import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa';
import manifest from './public/manifest.json';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'icons/icon-192.png',
        'icons/icon-256.png',
        'icons/icon-384.png',
        'icons/icon-512.png'
      ],
      manifest: manifest as Partial<ManifestOptions>,
      workbox: {
        navigateFallback: '/offline.html',
      },
      devOptions: {
        enabled: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
