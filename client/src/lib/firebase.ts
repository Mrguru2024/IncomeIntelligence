
// Mock Firebase implementation
// This is a stub that allows the application to compile without Firebase credentials
// In a production environment, you would use the actual Firebase SDK

console.log("Using mock Firebase service");

// Mock auth object
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: null) => void) => {
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
    throw new Error("Firebase authentication is disabled");
  }
};

// Mock GoogleAuthProvider
class GoogleAuthProvider {
  addScope() { return this; }
  setCustomParameters() { return this; }
}

// Mock functions
const signInWithPopup = async () => {
  throw new Error("Social login is currently disabled");
};

const getRedirectResult = async () => {
  return null;
};

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, getRedirectResult };
