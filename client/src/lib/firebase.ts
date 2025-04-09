/**
 * DIRECT FIREBASE OVERRIDE
 * 
 * This file completely overrides the Firebase module initialization with a minimal implementation
 * that prevents any errors from being thrown in consuming code.
 */

// Log a clearer message
console.log("FIREBASE_DISABLED: Firebase has been completely disabled and replaced");

// Permanent static config with projectId to prevent errors
const STATIC_CONFIG = {
  apiKey: "mock-api-key",
  appId: "mock-app-id",
  authDomain: "mock-project-id.firebaseapp.com",
  databaseURL: "https://mock-project-id.firebaseio.com",
  measurementId: "G-MOCK000000",
  messagingSenderId: "000000000000",
  projectId: "mock-project-id",
  storageBucket: "mock-project-id.appspot.com"
};

// Define types for the global Firebase config
declare global {
  interface Window {
    __FIREBASE_CONFIG__?: any;
    __FIREBASE_DEFAULTS__?: any;
    firebase?: any;
  }
}

// Global override to ensure Firebase config is always available
if (typeof window !== 'undefined') {
  // Set all possible Firebase config variables
  window.__FIREBASE_CONFIG__ = STATIC_CONFIG;
  window.__FIREBASE_DEFAULTS__ = { config: STATIC_CONFIG };
  
  // Completely override the firebase property with a non-configurable object
  Object.defineProperty(window, 'firebase', {
    value: {
      initializeApp: () => ({
        app: { options: STATIC_CONFIG },
        auth: () => ({
          onAuthStateChanged: (cb: any) => { setTimeout(() => cb(null), 0); return () => {}; },
          signOut: () => Promise.resolve(),
          setPersistence: () => Promise.resolve(),
          signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
          currentUser: null
        }),
        firestore: () => ({
          collection: () => ({
            doc: () => ({
              get: () => Promise.resolve({ exists: false, data: () => null }),
              set: () => Promise.resolve(),
              update: () => Promise.resolve()
            })
          })
        })
      }),
      auth: { GoogleAuthProvider: { credentialFromResult: () => null } }
    },
    writable: false,
    configurable: false
  });
}

// Create a static app instance that always returns the same objects
const staticApp = { options: STATIC_CONFIG, name: "[DEFAULT]" };

// Export these values for any imports
export function initializeApp() {
  return staticApp;
}

export function getAuth() {
  return {
    onAuthStateChanged: (cb: any) => { setTimeout(() => cb(null), 0); return () => {}; },
    signOut: () => Promise.resolve(),
    setPersistence: () => Promise.resolve(),
    signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
    currentUser: null
  };
}

export function getFirestore() {
  return {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false, data: () => null }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve()
      })
    })
  };
}

// Direct exports
export const app = staticApp;
export const auth = getAuth();
export const db = getFirestore();

// Auth related exports
export const GoogleAuthProvider = {
  PROVIDER_ID: 'google.com',
  credentialFromResult: () => null,
  credentialFromError: () => null
};

export const signInWithRedirect = () => Promise.resolve();
export const getRedirectResult = () => Promise.resolve(null);

// Default export to support 'import firebase from "firebase/app"'
export default { 
  initializeApp, 
  app: staticApp,
  auth: getAuth(),
  getAuth,
  getFirestore
};