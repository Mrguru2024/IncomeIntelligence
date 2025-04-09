import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import blockFirebasePlugin from "./client/firebase-block-plugin";

// Custom plugin to serve our clean.html directly
function serveCleanHtmlPlugin() {
  return {
    name: 'serve-clean-html',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/') {
          req.url = '/clean.html';
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    blockFirebasePlugin(),
    serveCleanHtmlPlugin(),
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
    outDir: path.resolve(import.meta.dirname, "dist/clean"),
    emptyOutDir: true,
  },
  // Add a global variable to indicate we're using the clean build
  define: {
    'process.env.CLEAN_BUILD': JSON.stringify(true),
    'process.env.FIREBASE_DISABLED': JSON.stringify(true),
  },
  optimizeDeps: {
    exclude: [
      'firebase', 
      'firebase-admin', 
      '@firebase/app',
      '@firebase/auth',
      '@firebase/firestore',
      '@firebase/analytics',
      'sanity'
    ]
  },
  server: {
    fs: {
      // Allow serving files from the entire workspace
      allow: ['..']
    },
  }
});