import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Clean configuration that serves the clean.html file and 
 * ensures Firebase modules are completely excluded
 */
function serveCleanHtmlPlugin(): Plugin {
  return {
    name: 'serve-clean-html',
    configureServer(server) {
      // Intercept requests to the root and serve clean.html instead
      server.middlewares.use((req, res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          req.url = '/clean.html';
        }
        next();
      });
    }
  };
}

// A simple plugin to block any Firebase imports
function blockFirebasePlugin(): Plugin {
  return {
    name: 'block-firebase-imports',
    enforce: 'pre' as const,
    resolveId(id) {
      // Block any imports that contain 'firebase'
      if (id.includes('firebase')) {
        console.log('[CLEAN] Blocking Firebase import:', id);
        // Return a path to a mock module
        return path.resolve(__dirname, './src/mock-modules/empty-module.js');
      }
      return null;
    }
  };
}

// Create an empty module for blocked imports
const emptyModulePath = path.resolve(__dirname, './src/mock-modules/empty-module.js');
import fs from 'fs';
if (!fs.existsSync(path.dirname(emptyModulePath))) {
  fs.mkdirSync(path.dirname(emptyModulePath), { recursive: true });
}
fs.writeFileSync(emptyModulePath, `
// Empty module for blocked imports
export default {};
export const getAuth = () => ({});
export const initializeApp = () => ({});
export const setPersistence = () => Promise.resolve();
export const browserLocalPersistence = {};
export const browserSessionPersistence = {};
`);

export default defineConfig({
  plugins: [
    react(),
    serveCleanHtmlPlugin(),
    blockFirebasePlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@assets': path.resolve(__dirname, '../attached_assets'),
      
      // Alias all Firebase imports to our empty module
      'firebase': emptyModulePath,
      'firebase/app': emptyModulePath,
      'firebase/auth': emptyModulePath,
      'firebase/firestore': emptyModulePath,
      '@firebase/app': emptyModulePath,
      '@firebase/auth': emptyModulePath,
      '@firebase/firestore': emptyModulePath,
    }
  },
  
  // Define placeholder environment variables
  define: {
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify('placeholder-project-id'),
    'import.meta.env.VITE_SANITY_PROJECT_ID': JSON.stringify('placeholder-sanity-project-id'),
  }
});