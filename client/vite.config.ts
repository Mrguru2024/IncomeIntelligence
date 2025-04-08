import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  build: {
    rollupOptions: {
      external: [
        'firebase',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/analytics',
        '@firebase/app',
        '@firebase/auth',
        '@firebase/firestore',
        '@firebase/analytics'
      ]
    }
  }
});