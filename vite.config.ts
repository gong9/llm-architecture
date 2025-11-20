import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/qianwen': {
            target: 'https://dashscope.aliyuncs.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/qianwen/, ''),
            configure: (proxy, _options) => {
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                const apiKey = req.headers['x-api-key'];
                if (apiKey) {
                  proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
                }
              });
            }
          }
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
