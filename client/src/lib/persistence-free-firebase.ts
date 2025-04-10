/**
 * PERSISTENCE-FREE FIREBASE IMPLEMENTATION
 * This mock implementation specifically addresses the issue with
 * setPersistence and provides static configuration with projectId.
 */

// Log when this mock is loaded for debugging with timestamp
console.log('[PERSISTENCE-FREE] Loading persistence-free Firebase mock at', new Date().toISOString());

// Create a stack trace to identify caller
console.log('[PERSISTENCE-FREE] Stack trace:', new Error().stack);

// Static app with valid projectId that won't change
export const app = {
  name: '[DEFAULT]',
  options: {
    projectId: 'persistence-free-firebase',
    apiKey: 'mock-api-key'
  },
  projectId: 'persistence-free-firebase'
};

// Static auth with no setPersistence functionality
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    if (callback) setTimeout(() => callback(null), 0);
    return () => {};
  },
  signOut: () => Promise.resolve(),
  // Completely remove setPersistence to avoid the error
  signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
  createUserWithEmailAndPassword: () => Promise.resolve({ user: null })
};

// Static db object
export const db = {};

// Firebase auth constants
export const browserLocalPersistence = 'local';
export const browserSessionPersistence = 'session';

// Basic functions with enhanced debugging
export function initializeApp(config?: any) {
  console.log('[PERSISTENCE-FREE] initializeApp called with config:', config);
  console.log('[PERSISTENCE-FREE] initializeApp caller stack:', new Error().stack);
  
  // Always return our mock app regardless of the config passed
  return app;
}

export function getAuth() {
  return auth;
}

export function getFirestore() {
  return db;
}

// Auth provider
export const GoogleAuthProvider = {
  PROVIDER_ID: 'google.com',
  credentialFromResult: () => null,
  credentialFromError: () => null
};

export const signInWithRedirect = () => Promise.resolve();
export const getRedirectResult = () => Promise.resolve(null);

// Default export for compatibility
export default {
  initializeApp,
  app,
  auth,
  getAuth,
  getFirestore,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  browserLocalPersistence,
  browserSessionPersistence
};