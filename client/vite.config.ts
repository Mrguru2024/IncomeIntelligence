import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import bannedModulesPlugin from "./banned-modules-plugin";

export default defineConfig({
  plugins: [
    react(),
    bannedModulesPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@assets': path.resolve(__dirname, '../attached_assets'),
      // Complete blocking of problematic modules
      '@sanity/client': path.resolve(__dirname, './src/lib/mocks/sanity-client.ts'),
      'firebase/app': path.resolve(__dirname, './src/lib/firebase.ts'),
      'firebase/auth': path.resolve(__dirname, './src/lib/firebase.ts'),
      'firebase/firestore': path.resolve(__dirname, './src/lib/firebase.ts'),
      // Block any direct imports of these packages
      'firebase': path.resolve(__dirname, './src/lib/firebase.ts'),
      'sanity': path.resolve(__dirname, './src/lib/mocks/sanity-client.ts')
    }
  },
  // Define empty environment variables to prevent errors
  define: {
    'import.meta.env.VITE_SANITY_PROJECT_ID': JSON.stringify('mock-id'),
    'import.meta.env.VITE_SANITY_DATASET': JSON.stringify('mock-dataset'),
    'import.meta.env.VITE_SANITY_API_VERSION': JSON.stringify('2024-01-01'),
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify('mock-key'),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify('mock-domain'),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify('mock-project')
  }
});