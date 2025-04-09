import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      // Mock external dependencies with internal implementations
      '@sanity/client': path.resolve(__dirname, './src/lib/mocks/sanity-client.ts'),
      'firebase/app': path.resolve(__dirname, './src/lib/firebase.ts'),
      'firebase/auth': path.resolve(__dirname, './src/lib/firebase.ts'),
      'firebase/firestore': path.resolve(__dirname, './src/lib/firebase.ts')
    }
  }
});