import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

/**
 * Clean configuration that serves the clean.html file and 
 * ensures Firebase modules are completely excluded
 */
function serveCleanHtmlPlugin(): Plugin {
  return {
    name: 'serve-clean-html-plugin',
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

function blockFirebasePlugin(): Plugin {
  return {
    name: 'block-firebase-plugin',
    resolveId(id) {
      if (id.includes('firebase')) {
        console.log(`Blocked import of Firebase module: ${id}`);
        // Return a virtual module ID to serve a mock
        return '\0firebase-mock';
      }
      return null;
    },
    load(id) {
      if (id === '\0firebase-mock') {
        console.log('Loading Firebase mock...');
        // Return mock implementation
        return `
          console.log('Firebase mock loaded');
          export function initializeApp() {
            console.log('Firebase mock: initializeApp called');
            return {};
          }
          export function auth() {
            return {
              onAuthStateChanged: (cb) => {
                console.log('Firebase mock: onAuthStateChanged called');
                cb(null);
                return () => {};
              },
              signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase auth not available')),
              createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase auth not available')),
              signOut: () => Promise.resolve(),
              setPersistence: () => Promise.resolve(),
            };
          }
          export default { initializeApp, auth };
        `;
      }
    }
  };
}

export default defineConfig({
  plugins: [
    // Serve clean.html instead of index.html
    serveCleanHtmlPlugin(),
    // Block Firebase imports
    blockFirebasePlugin(),
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    }
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});