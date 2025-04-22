import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from 'fs';
import bannedModulesPlugin from './banned-modules-plugin.js';

/**
 * Plugin to serve the Firebase-free HTML file instead of the default one
 */
function serveFirebaseFreeHtmlPlugin(): Plugin {
  return {
    name: 'serve-firebase-free-html',
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/') {
            // Serve the Firebase-free HTML instead of index.html
            const firebaseFreeHtml = fs.readFileSync(
              path.resolve(__dirname, 'firebase-free.html'), 
              'utf-8'
            );
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(firebaseFreeHtml);
            return;
          }
          next();
        });
      };
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    bannedModulesPlugin(),
    serveFirebaseFreeHtmlPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, '../attached_assets')
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});