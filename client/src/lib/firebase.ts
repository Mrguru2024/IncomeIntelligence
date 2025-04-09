/*
 * FIREBASE REPLACEMENT
 * This is a completely empty module that replaces Firebase
 * to ensure no Firebase code is ever loaded
 */

export const app = {};
export const auth = {
  currentUser: null,
  onAuthStateChanged: () => () => {},
  signInWithEmailAndPassword: async () => ({}),
  createUserWithEmailAndPassword: async () => ({}),
  signOut: async () => {},
  sendPasswordResetEmail: async () => {},
  setPersistence: async () => {}
};
export const db = {};
export const analytics = {};
export const performance = {};

// Export initialization function
export const initializeApp = () => ({});
export const getAuth = () => ({});
export const getFirestore = () => ({});
export const getAnalytics = () => ({});
export const getPerformance = () => ({});