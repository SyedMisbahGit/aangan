import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'node:path';
import manifest from './public/manifest.json';

// PWA display modes
type Display = 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true
      }
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-toast'
          ],
          utils: ['axios', 'date-fns', 'clsx', 'framer-motion'],
          reactQuery: ['@tanstack/react-query'],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    cssCodeSplit: true,
    // Enable brotli size compression
    brotliSize: true,
  },
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
    }),
    // Bundle visualization (only in report mode)
    process.env.REPORT === 'true' && visualizer({
      open: true,
      filename: 'dist/report.html',
      gzipSize: true,
      brotliSize: true,
    }) as PluginOption,
    // Gzip compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      disable: process.env.NODE_ENV === 'development',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'icons/icon-192.png',
        'icons/icon-256.png',
        'icons/icon-384.png',
        'icons/icon-512.png',
        'icons/maskable_icon.png'
      ],
      manifest: {
        ...manifest as ManifestOptions,
        // Ensure required PWA properties are set
        name: manifest.name || 'College Whisper',
        short_name: manifest.short_name || 'CW',
        theme_color: manifest.theme_color || '#ffffff',
        background_color: manifest.background_color || '#ffffff',
        display: (manifest.display as Display) || 'standalone',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/maskable_icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/localhost:3001\/api/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            },
          },
          {
            urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|avif|woff2?|eot|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
      },
      devOptions: {
        enabled: process.env.NODE_ENV === 'development',
        type: 'module',
        navigateFallback: 'index.html',
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
    }),
    viteCompression(),
    createHtmlPlugin({
      minify: true,
      inject: {
        // Optionally inline critical CSS or meta tags
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@lib": path.resolve(__dirname, "lib"),
      "@theme": path.resolve(__dirname, "theme/theme.ts"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./frontend/src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
}));
