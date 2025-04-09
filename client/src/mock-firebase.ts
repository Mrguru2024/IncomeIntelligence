/**
 * Mock Firebase Implementation
 * 
 * This file provides mock implementations of Firebase authentication functions
 * to allow the app to work without actual Firebase dependencies.
 */

// Mock Firebase Auth User
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Mock Auth State
let currentUser: User | null = null;
const authStateListeners: ((user: User | null) => void)[] = [];

// Mock Firebase Auth
export const auth = {
  currentUser: null as User | null,
  
  // Sign in with email and password
  signInWithEmailAndPassword: async (email: string, password: string) => {
    // In a real implementation, this would verify credentials with Firebase
    // For mock purposes, we'll accept any non-empty credentials
    if (!email || !password) {
      throw new Error('Invalid credentials');
    }
    
    // Create a mock user
    currentUser = {
      uid: 'mock-user-id-123',
      email,
      displayName: email.split('@')[0],
      photoURL: null,
      emailVerified: true
    };
    
    // Update auth state and notify listeners
    auth.currentUser = currentUser;
    authStateListeners.forEach(listener => listener(currentUser));
    
    return { user: currentUser };
  },
  
  // Create user with email and password
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    // In a real implementation, this would create a new user in Firebase
    // For mock purposes, we'll accept any non-empty credentials
    if (!email || !password || password.length < 6) {
      throw new Error('Invalid credentials. Password must be at least 6 characters.');
    }
    
    // Create a mock user
    currentUser = {
      uid: 'mock-user-id-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      photoURL: null,
      emailVerified: false
    };
    
    // Update auth state and notify listeners
    auth.currentUser = currentUser;
    authStateListeners.forEach(listener => listener(currentUser));
    
    return { user: currentUser };
  },
  
  // Sign out
  signOut: async () => {
    currentUser = null;
    auth.currentUser = null;
    authStateListeners.forEach(listener => listener(null));
  },
  
  // Listen for auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    authStateListeners.push(callback);
    // Immediately call with current state
    callback(currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = authStateListeners.indexOf(callback);
      if (index !== -1) {
        authStateListeners.splice(index, 1);
      }
    };
  }
};

// Mock Firestore
export const firestore = {
  collection: (collectionName: string) => ({
    doc: (docId: string) => ({
      get: async () => ({
        exists: false,
        data: () => null,
        id: docId
      }),
      set: async (data: any) => {
        console.log(`[Mock Firestore] Setting doc ${collectionName}/${docId}:`, data);
      },
      update: async (data: any) => {
        console.log(`[Mock Firestore] Updating doc ${collectionName}/${docId}:`, data);
      },
      delete: async () => {
        console.log(`[Mock Firestore] Deleting doc ${collectionName}/${docId}`);
      }
    }),
    add: async (data: any) => {
      const mockId = `mock-id-${Date.now()}`;
      console.log(`[Mock Firestore] Adding doc to ${collectionName} with ID ${mockId}:`, data);
      return { id: mockId };
    },
    where: () => ({
      get: async () => ({
        empty: true,
        docs: [],
        forEach: () => {}
      })
    })
  })
};

// Export mock Firebase app
export const app = {
  name: '[DEFAULT]',
  options: {},
  automaticDataCollectionEnabled: false
};

console.log('[Mock Firebase] Initialized');

export default { 
  auth, 
  firestore,
  app 
};