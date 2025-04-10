/**
 * COMPLETE FIREBASE MOCK MODULE
 * 
 * This provides a fully compatible Firebase API using the window.firebase
 * global object that was initialized in index.html
 */

console.log("Using mocked Firebase implementation with valid projectId");

// Get the Firebase implementation from window
const firebase = (window as any).firebase;

// Check if the global Firebase mock was initialized
if (!firebase) {
  throw new Error('Firebase global mock is not initialized in window.firebase');
}

// Use the app that was pre-initialized in index.html
const firebaseApp = firebase.apps[0] || firebase.initializeApp();

if (!firebaseApp.options.projectId) {
  throw new Error('Firebase app is missing projectId');
}

console.log("Firebase mock available with app:", firebaseApp.name, "projectId:", firebaseApp.options.projectId);

// Re-export the Firebase functions and objects
export function initializeApp(config?: any) {
  // Just return the pre-initialized app or initialize with the given config
  return config ? firebase.initializeApp(config) : firebaseApp;
}

export function getAuth() {
  // Return the global auth object
  return firebase.auth;
}

export function getFirestore() {
  // Return an empty object - we don't need Firestore functionality
  return {};
}

// Direct exports for commonly imported objects
export const app = firebaseApp;
export const auth = firebase.auth;
export const db = getFirestore();

// Auth related exports
export const GoogleAuthProvider = firebase.GoogleAuthProvider;
export const signInWithRedirect = firebase.signInWithRedirect || (() => Promise.resolve());
export const getRedirectResult = firebase.getRedirectResult || (() => Promise.resolve(null));

// Persistence types for auth
export const browserLocalPersistence = 'LOCAL';
export const browserSessionPersistence = 'SESSION';

// Default export for 'import firebase from "firebase/app"'
export default {
  initializeApp,
  app: firebaseApp,
  auth,
  getAuth,
  getFirestore,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  browserLocalPersistence,
  browserSessionPersistence
};