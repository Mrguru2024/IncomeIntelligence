/*
 * DISABLED FIREBASE MODULE
 * 
 * This completely disables Firebase by returning empty mock objects
 * without any real functionality.
 */

console.log("Firebase persistence set");

const EMPTY_CONFIG = {
  apiKey: "no-api-key",
  authDomain: "disabled.example.com",
  projectId: "disabled-project-id",
  storageBucket: "disabled.example.com",
  messagingSenderId: "0",
  appId: "disabled-app-id",
  measurementId: "disabled-measurement-id"
};

// Empty mock objects
const emptyApp = {
  name: "disabled-app",
  options: EMPTY_CONFIG,
  automaticDataCollectionEnabled: false,
  delete: () => Promise.resolve()
};

const emptyAuth = {
  app: emptyApp,
  currentUser: null,
  languageCode: "en",
  settings: { appVerificationDisabledForTesting: true },
  onAuthStateChanged: (observer: any) => () => {},
  createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
  signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
  signOut: () => Promise.resolve(),
  sendPasswordResetEmail: () => Promise.resolve(),
  setPersistence: () => Promise.resolve()
};

const emptyFirestore = {
  app: emptyApp,
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, id: "disabled", data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve()
    }),
    add: () => Promise.resolve({ id: "disabled" }),
    where: () => ({ get: () => Promise.resolve({ docs: [] }) }),
    orderBy: () => ({ limit: () => ({ get: () => Promise.resolve({ docs: [] }) }) })
  }),
  batch: () => ({
    set: () => emptyFirestore,
    update: () => emptyFirestore,
    delete: () => emptyFirestore,
    commit: () => Promise.resolve()
  })
};

const emptyAnalytics = {
  app: emptyApp,
  logEvent: () => {}
};

const emptyPerformance = {
  app: emptyApp,
  trace: () => ({
    start: () => {},
    stop: () => {},
    putAttribute: () => {},
    removeAttribute: () => {},
    getAttributes: () => ({})
  })
};

// Export empty functions
export function initializeApp() {
  return emptyApp;
}

export function getAuth() {
  return emptyAuth;
}

export function getFirestore() {
  return emptyFirestore;
}

export function getAnalytics() {
  return emptyAnalytics;
}

export function getPerformance() {
  return emptyPerformance;
}

// Direct exports
export const app = emptyApp;
export const auth = emptyAuth;
export const db = emptyFirestore;
export const analytics = emptyAnalytics;
export const performance = emptyPerformance;

// Auth provider related exports
export const GoogleAuthProvider = {
  PROVIDER_ID: 'disabled',
  credentialFromResult: () => ({ accessToken: null }),
  credentialFromError: () => ({})
};

export const signInWithRedirect = () => Promise.resolve();
export const getRedirectResult = () => Promise.resolve(null);

// Export empty Firebase object
const Firebase = {
  initializeApp,
  app,
  auth,
  db,
  analytics,
  performance,
  GoogleAuthProvider
};

// Add to window to avoid undefined errors
if (typeof window !== 'undefined') {
  (window as any).firebase = Firebase;
}

export default Firebase;