
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  browserLocalPersistence,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

import { getDataConnect } from "firebase/data-connect";
import { connectorConfig } from "@firebasegen/default-connector";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "stackr-19160";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Data Connect
const dataConnect = getDataConnect({
  ...connectorConfig,
  projectId
});

// Validate config before initialization
if (!firebaseConfig.projectId) {
  throw new Error('Firebase projectId is missing from configuration');
}

// Initialize Firebase only once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.profile");
googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");

const githubProvider = new GithubAuthProvider();
githubProvider.addScope("read:user");
githubProvider.addScope("user:email");

const appleProvider = new OAuthProvider("apple.com");

// Configure persistence
auth
  .setPersistence(browserLocalPersistence)
  .then(() => console.log("Firebase persistence set"))
  .catch((error) => console.error("Firebase persistence error:", error));

// Configure language
auth.useDeviceLanguage();

export { app, auth, googleProvider, githubProvider, appleProvider };
