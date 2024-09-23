// vite.config.mts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        // nested: resolve(__dirname, 'nested/index.html')
      }
    }
  },
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        process: true,
        buffer: true,
      },
      polyfillBuiltinModules: true,
    }),
  ],
  resolve: {
    alias: {
      // 别名配置
      crypto: 'crypto-browserify',
      https: 'https-browserify',
      http: 'stream-http',
      zlib: 'browserify-zlib',
      process: 'process/browser',
      buffer: 'buffer/',
    },
  },
  define: {
    'process.env': {},
  },
});
