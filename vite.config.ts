import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function injectServiceWorkerVersion(): Plugin {
  return {
    name: 'inject-sw-version',
    closeBundle() {
      const swPath = resolve(__dirname, 'dist/service-worker.js');
      try {
        let swContent = readFileSync(swPath, 'utf-8');
        const buildTime = Date.now();
        swContent = swContent.replace(
          /const CACHE_NAME = ['"]fullcircle-v\d+['"];/,
          `const CACHE_NAME = 'fullcircle-v${buildTime}';`
        );
        writeFileSync(swPath, swContent);
        console.log(`✓ Service worker versioned with build time: ${buildTime}`);
      } catch (err) {
        console.warn('Could not inject service worker version:', err);
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), injectServiceWorkerVersion()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
