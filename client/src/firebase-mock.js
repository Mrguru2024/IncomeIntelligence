/**
 * Comprehensive Firebase mock to intercept any Firebase imports in the application
 */

console.log('Firebase mock loaded and initialized');

// Create a mock Firebase app with a projectId
const firebaseAppMock = {
  projectId: "stackr-finance-mock",
  name: "stackr-finance",
  options: {
    apiKey: "mock-api-key",
    authDomain: "stackr-finance-mock.firebaseapp.com",
    projectId: "stackr-finance-mock",
    storageBucket: "stackr-finance-mock.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:0000000000000000000000",
    measurementId: "G-00000000"
  }
};

// Mock auth state
let currentUserMock = null;
const authStateListeners = [];

// Auth mock
const authMock = {
  currentUser: null,
  
  onAuthStateChanged(callback) {
    console.log('Firebase persistence set');
    
    // Execute callback immediately with current user
    if (callback) {
      callback(currentUserMock);
      
      // Add to listeners array
      authStateListeners.push(callback);
    }
    
    // Return unsubscribe function
    return () => {
      const index = authStateListeners.indexOf(callback);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
    };
  },
  
  signInWithEmailAndPassword() {
    console.log('Firebase mock: signInWithEmailAndPassword called');
    return Promise.reject(new Error("Firebase authentication not available"));
  },
  
  createUserWithEmailAndPassword() {
    console.log('Firebase mock: createUserWithEmailAndPassword called');
    return Promise.reject(new Error("Firebase authentication not available"));
  },
  
  signOut() {
    console.log('Firebase mock: signOut called');
    currentUserMock = null;
    
    // Notify listeners
    authStateListeners.forEach(callback => callback(null));
    
    return Promise.resolve();
  },
  
  setPersistence() {
    console.log('Firebase mock: setPersistence called');
    return Promise.resolve();
  },
  
  // Add any other auth methods that might be needed
  sendPasswordResetEmail() {
    return Promise.resolve();
  },
  
  confirmPasswordReset() {
    return Promise.resolve();
  }
};

// Main Firebase module mock
const firebaseMock = {
  // Firebase app initialization
  initializeApp(config) {
    console.log('Firebase mock: initializeApp called', config);
    return firebaseAppMock;
  },
  
  // Auth function
  auth() {
    return authMock;
  },
  
  // Add any other Firebase modules/functions that might be needed
  firestore() {
    return {};
  },
  
  analytics() {
    return {};
  }
};

// Make sure the app is available globally
window.firebaseApp = firebaseAppMock;
window.firebaseAuth = authMock;

// Export default and named exports to handle all import patterns
export default firebaseMock;
export const initializeApp = firebaseMock.initializeApp;
export const auth = firebaseMock.auth;
export const firestore = firebaseMock.firestore;
export const analytics = firebaseMock.analytics;

// Export specific auth methods for named imports
export const getAuth = () => authMock;
export const signInWithEmailAndPassword = authMock.signInWithEmailAndPassword;
export const createUserWithEmailAndPassword = authMock.createUserWithEmailAndPassword;
export const signOut = authMock.signOut;
export const onAuthStateChanged = authMock.onAuthStateChanged;
export const setPersistence = authMock.setPersistence;
export const sendPasswordResetEmail = authMock.sendPasswordResetEmail;
export const confirmPasswordReset = authMock.confirmPasswordReset;

// For modules that use .default property
initializeApp.default = initializeApp;
auth.default = auth;

// Auth constants
export const browserSessionPersistence = "BROWSER_SESSION";
export const browserLocalPersistence = "BROWSER_LOCAL";
export const inMemoryPersistence = "NONE";