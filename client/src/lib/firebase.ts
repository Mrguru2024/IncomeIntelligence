
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Create a mock firebase configuration since we don't have the real credentials
const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "mock-domain.firebaseapp.com",
  projectId: "mock-project-id",
  storageBucket: "mock-storage-bucket",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};

console.log("Using mock Firebase configuration");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Export additional functions for compatibility
import { signInWithPopup, getRedirectResult } from "firebase/auth";
export { auth, googleProvider, signInWithPopup, getRedirectResult };
