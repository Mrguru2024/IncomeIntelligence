import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import bannedModulesPlugin from "./banned-modules-plugin";
import fs from 'fs';

// Create a function that creates an empty module to replace problematic packages
const createEmptyModule = (moduleName) => {
  // Create a mock module path
  const mockPath = path.resolve(__dirname, './src/lib/mocks/empty-module.js');
  
  // Create the mock module if it doesn't exist
  if (!fs.existsSync(mockPath)) {
    const mockDir = path.dirname(mockPath);
    if (!fs.existsSync(mockDir)) {
      fs.mkdirSync(mockDir, { recursive: true });
    }
    
    fs.writeFileSync(mockPath, `
      console.log('Empty module loaded as replacement for banned dependency');
      export default {};
      export const createClient = () => ({});
      export const initializeApp = () => ({});
      export const getAuth = () => ({});
      export const getFirestore = () => ({});
      export const collection = () => ({});
      export const doc = () => ({});
      export const getDoc = () => Promise.resolve({});
      export const getDocs = () => Promise.resolve({});
      export const query = () => ({});
      export const where = () => ({});
      export const onSnapshot = () => () => {};
      export const onAuthStateChanged = () => () => {};
    `);
  }
  
  return mockPath;
};

// Empty module for Firebase and Sanity
const emptyModulePath = createEmptyModule('empty');

export default defineConfig({
  plugins: [
    // Run our banned-modules-plugin first to catch imports early
    bannedModulesPlugin(),
    react(),
    // Custom plugin to disable HMR for banned modules
    {
      name: 'no-hmr-for-banned',
      handleHotUpdate({ file, modules }) {
        if (file.includes('firebase') || file.includes('sanity')) {
          // Don't trigger HMR for these files
          return [];
        }
      }
    }
  ],
  optimizeDeps: {
    exclude: [
      'firebase', 
      'firebase/app', 
      'firebase/auth', 
      'firebase/firestore',
      '@firebase/app',
      '@firebase/auth',
      '@firebase/firestore',
      '@sanity/client',
      'sanity'
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@assets': path.resolve(__dirname, '../attached_assets'),
      
      // Block ALL Firebase modules
      'firebase': emptyModulePath,
      'firebase/app': emptyModulePath,
      'firebase/auth': emptyModulePath,
      'firebase/firestore': emptyModulePath,
      'firebase/storage': emptyModulePath,
      'firebase/functions': emptyModulePath,
      'firebase/analytics': emptyModulePath,
      'firebase/database': emptyModulePath,
      'firebase/performance': emptyModulePath,
      'firebase/remote-config': emptyModulePath,
      'firebase/messaging': emptyModulePath,
      '@firebase/app': emptyModulePath,
      '@firebase/auth': emptyModulePath,
      '@firebase/firestore': emptyModulePath,
      '@firebase/storage': emptyModulePath,
      '@firebase/functions': emptyModulePath,
      '@firebase/analytics': emptyModulePath,
      '@firebase/database': emptyModulePath,
      '@firebase/performance': emptyModulePath,
      '@firebase/remote-config': emptyModulePath,
      '@firebase/messaging': emptyModulePath,
      '@firebase/util': emptyModulePath,
      '@firebase/app-compat': emptyModulePath,
      '@firebase/auth-compat': emptyModulePath,
      
      // Block ALL Sanity modules
      '@sanity/client': emptyModulePath,
      '@sanity/image-url': emptyModulePath,
      '@sanity/vision': emptyModulePath,
      '@sanity/base': emptyModulePath,
      '@sanity/desk-tool': emptyModulePath,
      '@sanity/core': emptyModulePath,
      'sanity': emptyModulePath,
      'sanity/desk': emptyModulePath
    }
  },
  // Define empty environment variables to prevent errors
  define: {
    // Mock all Firebase related environment variables
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify('mock-api-key'),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify('mock-auth-domain'),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify('mock-project-id'),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify('mock-storage-bucket'),
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify('mock-messaging-sender-id'),
    'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify('mock-app-id'),
    'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify('mock-measurement-id'),
    
    // Mock all Sanity related environment variables
    'import.meta.env.VITE_SANITY_PROJECT_ID': JSON.stringify('mock-sanity-project-id'),
    'import.meta.env.VITE_SANITY_DATASET': JSON.stringify('mock-sanity-dataset'),
    'import.meta.env.VITE_SANITY_API_VERSION': JSON.stringify('mock-sanity-api-version'),
    'import.meta.env.VITE_SANITY_TOKEN': JSON.stringify('mock-sanity-token'),
    
    // Force development features to disable problematic code paths
    'import.meta.env.DEV': 'true',
    'import.meta.env.PROD': 'false',
    
    // Global flags to disable Firebase and Sanity
    'window.DISABLE_FIREBASE': 'true',
    'window.DISABLE_SANITY': 'true',
    
    // Additional global constants to help prevent issues
    'globalThis.__FIREBASE_DEFAULTS__': '{}'
  },
  build: {
    rollupOptions: {
      external: [
        'firebase',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
        'firebase/functions',
        'firebase/analytics',
        'firebase/database',
        'firebase/performance',
        'firebase/remote-config',
        'firebase/messaging',
        '@firebase/app',
        '@firebase/auth',
        '@firebase/firestore',
        '@firebase/storage',
        '@firebase/functions',
        '@firebase/analytics',
        '@firebase/database',
        '@firebase/performance',
        '@firebase/remote-config',
        '@firebase/messaging',
        '@firebase/util',
        '@firebase/app-compat',
        '@firebase/auth-compat',
        '@sanity/client',
        '@sanity/image-url',
        '@sanity/vision',
        '@sanity/base',
        '@sanity/desk-tool',
        '@sanity/core',
        'sanity',
        'sanity/desk'
      ]
    }
  }
});