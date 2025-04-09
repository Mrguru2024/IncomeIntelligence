
// Firebase has been replaced by our custom JWT authentication system
// This file is kept as a stub for compatibility with any legacy code

/**
 * Comprehensive mock Firebase implementation
 * This provides stub implementations for all commonly used Firebase methods
 * to prevent errors in code that still expects Firebase objects
 */

// Mock Firebase initialization
const defaultApp = {
  name: '[DEFAULT]',
  options: {
    apiKey: 'mock-api-key',
    authDomain: 'mock-auth-domain',
    projectId: 'mock-project-id',
    storageBucket: 'mock-storage-bucket',
    messagingSenderId: 'mock-sender-id',
    appId: 'mock-app-id'
  }
};

// Mock Firebase Auth
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    // Return unsubscribe function
    return () => {};
  },
  signInWithEmailAndPassword: async () => ({ user: null }),
  createUserWithEmailAndPassword: async () => ({ user: null }),
  signOut: async () => {},
  sendPasswordResetEmail: async () => {},
  setPersistence: async () => {}
};

// Mock Firestore
const db = {
  collection: () => ({
    doc: () => ({
      get: async () => ({
        exists: false,
        data: () => null,
        id: 'mock-id'
      }),
      set: async () => {},
      update: async () => {},
      delete: async () => {}
    }),
    add: async () => ({ id: 'mock-id' }),
    where: () => ({
      get: async () => ({
        empty: true,
        docs: [],
        forEach: () => {}
      }),
      orderBy: () => ({
        limit: () => ({
          get: async () => ({
            empty: true,
            docs: [],
            forEach: () => {}
          })
        })
      })
    }),
    orderBy: () => ({
      limit: () => ({
        get: async () => ({
          empty: true,
          docs: [],
          forEach: () => {}
        })
      })
    })
  })
};

// Mock Analytics
const analytics = {
  logEvent: () => {}
};

// Mock Firebase Performance
const performance = {
  trace: () => ({
    start: () => {},
    stop: () => {}
  })
};

// Export mock objects for compatibility
export {
  defaultApp as app,
  auth,
  db,
  analytics,
  performance
};

// Export initialization function
export const initializeApp = () => defaultApp;
export const getAuth = () => auth;
export const getFirestore = () => db;
export const getAnalytics = () => analytics;
export const getPerformance = () => performance;
