/**
 * PERSISTENCE-FREE FIREBASE IMPLEMENTATION
 * This mock implementation specifically addresses the issue with
 * setPersistence and provides static configuration with projectId.
 */

// Log when this mock is loaded for debugging
console.log('[PERSISTENCE-FREE] Loading persistence-free Firebase mock');

// Static app with valid projectId that won't change
export const app = {
  name: '[DEFAULT]',
  options: {
    projectId: 'persistence-free-firebase',
    apiKey: 'mock-api-key'
  }
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
  // Instead of mocking the function, we just don't define it
  signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
  createUserWithEmailAndPassword: () => Promise.resolve({ user: null })
};

// Static db object
export const db = {};

// Firebase auth constants
export const browserLocalPersistence = 'local';
export const browserSessionPersistence = 'session';

// Basic functions
export const initializeApp = () => app;
export const getAuth = () => auth;
export const getFirestore = () => db;

// Auth provider
export const GoogleAuthProvider = {
  PROVIDER_ID: 'google.com',
  credentialFromResult: () => null,
  credentialFromError: () => null
};

// Default export to support import * as firebase syntax
export default {
  app,
  auth,
  db,
  initializeApp,
  getAuth,
  getFirestore,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider
};