/**
 * COMPLETELY MOCKED FIREBASE IMPLEMENTATION
 * This file doesn't even try to mock Firebase functionality,
 * it just exports empty objects to satisfy imports.
 */

// Log when loaded
console.log('[Dummy Firebase] Loaded ultra-minimal dummy Firebase - no functionality');

// Basic mock objects with no functionality
export const app = { name: 'dummy', options: { projectId: 'dummy-project' } };
export const auth = { currentUser: null };
export const db = {};

// Basic empty functions
export const initializeApp = () => app;
export const getAuth = () => auth;
export const getFirestore = () => db;
export const setPersistence = () => Promise.resolve();
export const browserLocalPersistence = 'dummy-local';
export const browserSessionPersistence = 'dummy-session';
export const GoogleAuthProvider = { PROVIDER_ID: 'google.com' };
export const signInWithRedirect = () => Promise.resolve();
export const getRedirectResult = () => Promise.resolve(null);
export const signOut = () => Promise.resolve();
export const onAuthStateChanged = () => () => {};

// Default export
export default {
  app, auth, db,
  initializeApp, getAuth, getFirestore,
  setPersistence, browserLocalPersistence, browserSessionPersistence,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut
};