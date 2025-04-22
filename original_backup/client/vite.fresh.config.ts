import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Plugin to serve the fresh.html file instead of the default one
function serveFreshHtmlPlugin(): Plugin {
  return {
    name: 'serve-fresh-html',
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/') {
            req.url = '/fresh.html';
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
    serveFreshHtmlPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@server': path.resolve(__dirname, '../server'),
      '@assets': path.resolve(__dirname, '../attached_assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@pages': path.resolve(__dirname, './src/pages'),
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: ['..'],
    },
  }
});