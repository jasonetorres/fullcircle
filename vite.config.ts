import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Only include service worker versioning during production builds
    ...(command === 'build'
      ? [
          {
            name: 'inject-sw-version',
            closeBundle() {
              const swPath = resolve(__dirname, 'dist/service-worker.js');
              if (!existsSync(swPath)) {
                console.warn(
                  'Service worker not found at',
                  swPath,
                  '- skipping version injection.'
                );
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
                console.log(
                  `Service worker versioned with build time: ${buildTime}`
                );
              } catch (err) {
                console.warn('Could not inject service worker version:', err);
              }
            },
          },
        ]
      : []),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
