import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnIly7WixD5bJqPKUms7HHqD41pQOei94",
  authDomain: "stackr-19160.firebaseapp.com",
  projectId: "stackr-19160",
  storageBucket: "stackr-19160.firebasestorage.app",
  messagingSenderId: "887839576217",
  appId: "1:887839576217:web:37d47847b89cd4687d2808",
  measurementId: "G-DZ87C6BM55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

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