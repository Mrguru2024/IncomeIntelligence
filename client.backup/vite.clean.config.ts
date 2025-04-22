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
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/') {
            req.url = '/clean.html';
          }
          next();
        });
      };
    }
  };
}

// Define a very aggressive blocking plugin for Firebase/Firestore
function blockFirebasePlugin(): Plugin {
  return {
    name: 'block-firebase-modules',
    enforce: 'pre' as const,
    resolveId(id) {
      // Block all firebase imports at resolve time
      if (id.includes('firebase') || id.includes('firestore')) {
        console.log(`[BLOCK] Blocking import of: ${id}`);
        
        // Return a virtual module ID
        return '\0blocked:' + id;
      }
      return null;
    },
    load(id) {
      // Replace blocked modules with empty mocks
      if (id.startsWith('\0blocked:')) {
        console.log(`[MOCK] Loading mock for: ${id.slice(9)}`);
        return `
    // Mock replacement for banned modules
    console.log('[MOCK] Using mock module instead of banned dependency');
    
    // Mock necessary exports
    export const initializeApp = () => ({ 
      name: 'mock-app',
      options: { projectId: 'mock-project' },
      projectId: 'mock-project'
    });
    export const getAuth = () => ({
      currentUser: null,
      onAuthStateChanged: (cb) => { cb(null); return () => {}; },
      signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
      createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
      signOut: () => Promise.resolve()
    });
    export const getFirestore = () => ({});
    export const collection = () => ({});
    export const doc = () => ({});
    export const getDoc = () => Promise.resolve({});
    export const setDoc = () => Promise.resolve();
    export const updateDoc = () => Promise.resolve();
    export const deleteDoc = () => Promise.resolve();
    export const query = () => ({});
    export const where = () => ({});
    export const orderBy = () => ({});
    export const limit = () => ({});
    export const startAfter = () => ({});
    export const getDocs = () => Promise.resolve({ docs: [] });
    export const onSnapshot = () => () => {};
    
    // Default export for mocking modules that use default imports
    export default {
      initializeApp,
      getAuth,
      getFirestore,
      collection,
      doc,
      getDoc,
      setDoc,
      updateDoc,
      deleteDoc,
      query,
      where,
      orderBy,
      limit,
      startAfter,
      getDocs,
      onSnapshot
    };
    `;
      }
      return null;
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    blockFirebasePlugin(),
    serveCleanHtmlPlugin(),
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@assets': path.resolve(__dirname, '../attached_assets'),
    },
  },
  server: {
    port: 5173,
    strictPort: true
  }
});