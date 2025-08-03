// @ts-check
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Base configuration
  return {
    // Base public path when served in development or production
    base: '/',  // Update this if your app is served from a subdirectory
    
    // Environment variables exposed to your client
    define: {
      'import.meta.env.VITE_APP_DOMAIN': JSON.stringify(env.VITE_APP_DOMAIN || 'localhost'),
      'import.meta.env.VITE_APP_URL': JSON.stringify(
        env.VITE_APP_URL || 
        (mode === 'development' ? 'http://localhost:5173' : 'https://yourdomain.com')
      ),
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL || 
        (mode === 'development' ? 'http://localhost:3001/api' : '/api')
      ),
      'import.meta.env.VITE_TWITTER_HANDLE': JSON.stringify(env.VITE_TWITTER_HANDLE || '@yourtwitter'),
      'import.meta.env.VITE_ENABLE_ANALYTICS': env.VITE_ENABLE_ANALYTICS === 'true',
    },
    
    // Plugins
    plugins: [
      // React plugin with Fast Refresh (enabled by default)
      react({
        // Babel configuration
        babel: {
          plugins: [
            // Add any Babel plugins here
          ],
        },
      }),
      
      // Enable HTTPS in development
      mode === 'development' && basicSsl(),
      
      // Image optimization
      ViteImageOptimizer({
        // Test if the file is an image
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        
        // Image optimization options
        png: { quality: parseInt(env.VITE_IMAGE_OPTIMIZATION_QUALITY || '80') },
        jpeg: { quality: parseInt(env.VITE_IMAGE_OPTIMIZATION_QUALITY || '80') },
        jpg: { quality: parseInt(env.VITE_IMAGE_OPTIMIZATION_QUALITY || '80') },
        webp: { 
          quality: parseInt(env.VITE_IMAGE_OPTIMIZATION_QUALITY || '80'),
          effort: 6 // 0-6, higher means more optimization but slower
        },
        avif: { 
          quality: parseInt(env.VITE_IMAGE_OPTIMIZATION_QUALITY || '70'),
          effort: 6 // 0-9, higher means more optimization but slower
        },
        
        // Include public directory for optimization
        includePublic: true,
        
        // Log optimization details
        logStats: mode === 'development',
      }),
      
      // Bundle analyzer (only in analyze mode)
      mode === 'analyze' && visualizer({
        open: true,
        filename: 'bundle-analyzer-report.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // or 'sunburst', 'network', 'raw-data', 'table'
      })
    ].filter(Boolean),
    
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production', // Disable sourcemaps in production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('@radix-ui')) {
                return 'vendor-ui';
              }
              return 'vendor';
            }
            return undefined;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
        },
      },
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: false,
      cssCodeSplit: true,
      brotliSize: true,
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      open: true,
    },
    
    // CSS configuration
    css: {
      devSourcemap: false,
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/styles/variables.scss";'
        }
      }
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      force: true,
    },
    
    // ESBuild configuration
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    }
  };
});
