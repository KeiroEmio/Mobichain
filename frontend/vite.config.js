// vite.config.mts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  build: {
    // outDir: 'dist', // 输出目录
    // sourcemap: true, // 生成Source Map
    rollupOptions: {
      input: {
        // main: resolve(__dirname, 'public/index.html'),
        main: resolve(__dirname,'src/index.jsx'),
        nested: resolve(__dirname, 'public/index.html')
      }
    }
  },
  // base: './',
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
