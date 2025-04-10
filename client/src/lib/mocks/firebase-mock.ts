/**
 * COMPLETELY MOCKED FIREBASE IMPLEMENTATION
 * This file contains mock implementations for all Firebase modules.
 * It's designed to be a drop-in replacement for Firebase in development
 * when you want to avoid any actual Firebase calls.
 */

// Log when mock is loaded
console.log('[Firebase Mock] Loaded mock Firebase modules');

// Basic app interface
const mockApp = {
  name: '[DEFAULT]',
  options: { 
    projectId: 'mock-project-id',
    apiKey: 'mock-api-key'
  },
  automaticDataCollectionEnabled: false
};

// Mock user for auth
export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Auth state
let authStateListeners: Array<(user: MockUser | null) => void> = [];
let mockCurrentUser: MockUser | null = null;

// Mock auth implementation
export const auth = {
  currentUser: mockCurrentUser,
  
  // Auth state change listener
  onAuthStateChanged: (callback: (user: MockUser | null) => void) => {
    // Register the listener
    authStateListeners.push(callback);
    
    // Call immediately with current state
    setTimeout(() => callback(mockCurrentUser), 0);
    
    // Return unsubscribe function
    return () => {
      authStateListeners = authStateListeners.filter(listener => listener !== callback);
    };
  },
  
  // Sign out
  signOut: () => {
    mockCurrentUser = null;
    authStateListeners.forEach(listener => listener(null));
    return Promise.resolve();
  },
  
  // Persistence
  setPersistence: () => {
    console.log("Firebase persistence set");
    return Promise.resolve();
  },
  
  // Create user
  createUserWithEmailAndPassword: () => Promise.resolve({ 
    user: { uid: 'mock-user-uid' } 
  }),
  
  // Sign in
  signInWithEmailAndPassword: () => Promise.resolve({ 
    user: { uid: 'mock-user-uid' } 
  })
};

// Firebase auth persistence types
export const browserLocalPersistence = 'LOCAL';
export const browserSessionPersistence = 'SESSION';

// Mock Firestore
export const firestore = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve()
    }),
    where: () => ({
      get: () => Promise.resolve({ empty: true, docs: [] })
    }),
    add: () => Promise.resolve({ id: 'mock-doc-id' })
  })
};

// Mock functions
export const initializeApp = () => mockApp;
export const getAuth = () => auth;
export const getFirestore = () => firestore;

// Auth provider
export const GoogleAuthProvider = {
  PROVIDER_ID: 'google.com',
  credentialFromResult: () => null,
  credentialFromError: () => null
};

// Auth redirect methods
export const signInWithRedirect = () => Promise.resolve();
export const getRedirectResult = () => Promise.resolve(null);

// Default export
export default {
  initializeApp,
  app: mockApp,
  auth,
  firestore,
  getAuth,
  getFirestore,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  browserLocalPersistence,
  browserSessionPersistence
};