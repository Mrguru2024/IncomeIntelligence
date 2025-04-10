/**
 * NO FIREBASE MODULE
 * 
 * This file replaces the Firebase module with empty implementations
 * to prevent any Firebase code from being executed.
 */

// Add a stack trace to see who's importing this
console.log("Firebase module has been completely disabled");
try {
  throw new Error('DEBUGGING: Tracing Firebase import stack');
} catch (e: any) {
  console.log('Firebase import stack:', e.stack);
}

// No configs or global variables
const DISABLED_MESSAGE = 'Firebase is disabled in this application, using custom JWT auth instead';

// Skip all global window initialization attempts

// Create a minimal static app instance with valid projectId
const staticApp = { 
  options: { 
    projectId: "mock-project-id",
    apiKey: "mock-api-key" 
  }, 
  name: "[DEFAULT]" 
};

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