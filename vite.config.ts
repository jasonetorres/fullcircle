import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function injectServiceWorkerVersion(): Plugin {
  let isBuild = false;
  return {
    name: 'inject-sw-version',
    apply: 'build',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    closeBundle() {
      if (!isBuild) return;
      const swPath = resolve(__dirname, 'dist/service-worker.js');
      if (!existsSync(swPath)) {
        console.warn('Service worker not found at', swPath, '— skipping version injection.');
        return;
      }
      try {
        let swContent = readFileSync(swPath, 'utf-8');
        const buildTime = Date.now();
        swContent = swContent.replace(
          /const CACHE_NAME = ['"]fullcircle-v\d+['"];/,
          `const CACHE_NAME = 'fullcircle-v${buildTime}';`
        );
        writeFileSync(swPath, swContent);
        console.log(`Service worker versioned with build time: ${buildTime}`);
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
});
