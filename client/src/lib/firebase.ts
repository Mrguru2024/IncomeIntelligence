import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  browserLocalPersistence,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCnIly7WixD5bJqPKUms7HHqD41pQOei94",
  authDomain: "stackr-19160.firebaseapp.com",
  projectID: "stackr-19160",
  storageBucket: "stackr-19160.firebasestorage.app",
  messagingSenderId: "887839576217",
  appId: "1:887839576217:web:37d47847b89cd4687d2808",
  measurementId: "G-DZ87C6BM55",
};

// Initialize Firebase only once
let app;
try {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
  app = getApps()[0];
}
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
