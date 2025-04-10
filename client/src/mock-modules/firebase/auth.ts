/**
 * Complete mock for firebase/auth
 */

console.log('[FIREBASE-MOCK] Loading firebase/auth mock');

// Mock auth functions and state
const mockAuthState = {
  currentUser: null,
  listeners: [] as ((user: any) => void)[],
};

// Mock auth provider
export const mockAuth = {
  signInWithEmailAndPassword: (email: string, password: string) => {
    console.log('[FIREBASE-MOCK] Mock sign in:', email);
    return Promise.resolve({ 
      user: { 
        uid: '123mock', 
        email, 
        displayName: email.split('@')[0] 
      } 
    });
  },
  createUserWithEmailAndPassword: (email: string, password: string) => {
    console.log('[FIREBASE-MOCK] Mock create user:', email);
    return Promise.resolve({ 
      user: { 
        uid: '123mock', 
        email, 
        displayName: email.split('@')[0] 
      } 
    });
  },
  signOut: () => {
    console.log('[FIREBASE-MOCK] Mock sign out');
    mockAuthState.currentUser = null;
    mockAuthState.listeners.forEach(listener => listener(null));
    return Promise.resolve();
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    console.log('[FIREBASE-MOCK] Adding auth state listener');
    mockAuthState.listeners.push(callback);
    // Call once immediately with current state
    callback(mockAuthState.currentUser);
    // Return unsubscribe function
    return () => {
      mockAuthState.listeners = mockAuthState.listeners.filter(l => l !== callback);
    };
  },
  setPersistence: () => {
    console.log('[FIREBASE-MOCK] Firebase persistence set');
    return Promise.resolve();
  },
  get currentUser() {
    return mockAuthState.currentUser;
  }
};

// Main exported functions for auth
export function getAuth() {
  console.log('[FIREBASE-MOCK] getAuth called from firebase/auth');
  return mockAuth;
}

// Auth related exports
export class GoogleAuthProvider {
  static credential() { return {}; }
  static PROVIDER_ID = 'google.com';
}

export function signInWithRedirect() {
  console.log('[FIREBASE-MOCK] SignInWithRedirect called from firebase/auth');
  return Promise.resolve();
}

export function getRedirectResult() {
  console.log('[FIREBASE-MOCK] GetRedirectResult called from firebase/auth');
  return Promise.resolve(null);
}

// Persistence types for auth
export const browserLocalPersistence = 'LOCAL';
export const browserSessionPersistence = 'SESSION';
export function setPersistence() {
  console.log('[FIREBASE-MOCK] setPersistence called from firebase/auth');
  return Promise.resolve();
}

// Default export
export default {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence
};