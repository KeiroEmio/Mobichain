// vite.config.mts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsPublicPath: './',
  },
  base: './',
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
  server: {
    host: true,
    port: 3001,
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
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
