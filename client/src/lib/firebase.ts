import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  OAuthProvider,
  browserLocalPersistence
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCnIly7WixD5bJqPKUms7HHqD41pQOei94",
  authDomain: "stackr-19160.firebaseapp.com",
  projectId: "stackr-19160",
  storageBucket: "stackr-19160.firebasestorage.app",
  messagingSenderId: "887839576217",
  appId: "1:887839576217:web:37d47847b89cd4687d2808",
  measurementId: "G-DZ87C6BM55"
};

let app;
let auth;
let googleProvider;
let githubProvider;
let appleProvider;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);

  googleProvider = new GoogleAuthProvider();
  githubProvider = new GithubAuthProvider();
  appleProvider = new OAuthProvider('apple.com');
} else {
  app = getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  githubProvider = new GithubAuthProvider();
  appleProvider = new OAuthProvider('apple.com');
}

export { auth, googleProvider, githubProvider, appleProvider };
export default app;