import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from 'fs';
import bannedModulesPlugin from './banned-modules-plugin.js';

// Create an extremely simplified mock module to replace Firebase and Sanity
// with just the minimal structure needed to prevent crashes
const createMockModule = () => {
  const mockPath = path.resolve(__dirname, './src/lib/mocks/dependency-mock.js');
  
  // Create the mock directory if it doesn't exist
  const mockDir = path.dirname(mockPath);
  if (!fs.existsSync(mockDir)) {
    fs.mkdirSync(mockDir, { recursive: true });
  }
  
  // Write an extremely minimal mock with just projectId
  fs.writeFileSync(mockPath, `
    // Super minimal mock providing only what is absolutely needed
    console.log('Mock dependency loaded');
    
    // For Firebase
    export const initializeApp = (config) => {
      console.log('Mock initializeApp called');
      return {
        projectId: 'mock-project-id'
      };
    };
    
    // For Firebase Auth
    export const getAuth = () => ({ 
      currentUser: null,
      onAuthStateChanged: (callback) => {
        setTimeout(() => callback(null), 0);
        return () => {};
      }
    });
    
    // For Sanity
    export const createClient = (config) => ({
      fetch: () => Promise.resolve([]),
      getDocument: () => Promise.resolve(null),
      create: () => Promise.resolve({ _id: 'mock-id' }),
      patch: () => ({ commit: () => Promise.resolve({}) })
    });
    
    // Default export catches import * scenarios
    export default {
      projectId: 'mock-project-id',
      initializeApp,
      getAuth,
      createClient
    };
  `);
  
  return mockPath;
};

const mockModulePath = createMockModule();

// Simplified Vite config without banned-modules-plugin for cleaner approach
export default defineConfig({
  plugins: [
    react(),
    // Use our aggressive banned modules plugin to block Firebase and Sanity
    bannedModulesPlugin(),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@assets': path.resolve(__dirname, '../attached_assets'),
      
      // Map all problematic modules to our mock implementations
      'firebase': path.resolve(__dirname, './src/lib/mocks/firebase-mock.ts'),
      'firebase/app': path.resolve(__dirname, './src/lib/mocks/firebase-mock.ts'),
      'firebase/auth': path.resolve(__dirname, './src/lib/mocks/firebase-mock.ts'),
      'firebase/firestore': path.resolve(__dirname, './src/lib/mocks/firebase-mock.ts'),
      '@firebase/app': path.resolve(__dirname, './src/lib/mocks/firebase-mock.ts'),
      '@firebase/auth': path.resolve(__dirname, './src/lib/mocks/firebase-mock.ts'),
      '@firebase/firestore': path.resolve(__dirname, './src/lib/mocks/firebase-mock.ts'),
      '@sanity/client': mockModulePath,
      'sanity': mockModulePath
    }
  },
  
  // Define minimal environment variables
  define: {
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify('mock-project-id'),
    'import.meta.env.VITE_SANITY_PROJECT_ID': JSON.stringify('mock-sanity-project-id'),
  }
});