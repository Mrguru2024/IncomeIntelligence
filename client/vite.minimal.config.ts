import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import themePlugin from '@replit/vite-plugin-shadcn-theme-json';
import path from 'path';

// Plugin to serve minimal.html for the root route
function serveMinimalHtmlPlugin(): Plugin {
  return {
    name: 'serve-minimal-html',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/') {
          req.url = '/minimal.html';
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    themePlugin(),
    serveMinimalHtmlPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, '../attached_assets'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // Specific settings to prevent loading ANY Firebase modules
  optimizeDeps: {
    exclude: [
      'firebase',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      '@firebase/app',
      '@firebase/auth',
      '@firebase/firestore',
    ],
  },
  build: {
    rollupOptions: {
      external: [
        'firebase',
        'firebase/app',
        'firebase/auth', 
        'firebase/firestore',
        '@firebase/app',
        '@firebase/auth',
        '@firebase/firestore',
      ],
    },
  },
});