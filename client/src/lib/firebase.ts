// Mock Firebase implementation to avoid errors
// This allows the app to work without Firebase keys
console.log("Using mock Firebase service");

// Create mock auth object that doesn't rely on Firebase initialization
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(null);
    return () => {};
  },
  signInWithEmailAndPassword: async () => {
    throw new Error("Firebase authentication is disabled");
  },
  createUserWithEmailAndPassword: async () => {
    throw new Error("Firebase authentication is disabled");
  },
  signOut: async () => {
    console.log("Mock signOut called");
    return Promise.resolve();
  }
};

// Mock analytics object
const analytics = {
  logEvent: () => {},
  setCurrentScreen: () => {},
  setUserId: () => {}
};

// For compatibility with other parts of the app
// Custom implementations since we don't want to import from firebase/auth

// Simple GoogleAuthProvider implementation
class GoogleAuthProvider {
  addScope() { return this; }
  setCustomParameters() { return this; }
}

// Mock Firebase auth methods
const signInWithPopup = async () => {
  throw new Error("Social login is currently disabled");
};

const getRedirectResult = async () => {
  return { user: null };
};

const googleProvider = new GoogleAuthProvider();

export { auth, analytics, googleProvider, signInWithPopup, getRedirectResult };