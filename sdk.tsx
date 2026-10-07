import { defineConfig } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

export default defineConfig({
  server: {
    proxy: {
      '/auth': {
        target: 'https://stage-3-seller.sogaz.ru',
        changeOrigin: true,
        secure: false,

        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes: IncomingMessage) => {
            const location = proxyRes.headers.location;

            if (!location) {
              return;
            }

            console.log('AUTH REDIRECT:', location);

            if (location.includes('stage-2-seller.sogaz.ru')) {
              proxyRes.headers.location = location.replace(
                'https://stage-2-seller.sogaz.ru',
                'http://localhost:3000',
              );
            }
          });
        },
      },
    },
  },
});