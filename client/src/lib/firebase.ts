
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Log Firebase configuration for debugging (excluding sensitive info)
console.log("Firebase configuration loaded:", {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
});

// Initialize Firebase with custom settings
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with custom settings
export const auth = getAuth(app);

// Configure auth persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Firebase persistence error:", error);
  });

// Configure auth settings
auth.settings.appVerificationDisabledForTesting = true;
auth.settings.forceRecaptcha = false;

// Add error event listener
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in');
  }
}, (error) => {
  console.error('Auth state change error:', error);
});

// Configure Google provider with custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: 'user@example.com'
});

// Configure providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Add scopes for additional permissions
googleProvider.addScope('profile');
googleProvider.addScope('email');

githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

export default app;