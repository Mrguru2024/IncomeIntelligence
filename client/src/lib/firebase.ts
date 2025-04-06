
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
  storageBucket: "stackr-19160.appspot.com",
  messagingSenderId: "887839576217",
  appId: "1:887839576217:web:37d47847b89cd4687d2808",
  measurementId: "G-DZ87C6BM55"
};

let app;
let auth;
let googleProvider;
let githubProvider;
let appleProvider;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase instance');
  }

  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence)
    .then(() => console.log('Firebase persistence set'))
    .catch(error => console.error('Firebase persistence error:', error));

  googleProvider = new GoogleAuthProvider();
  githubProvider = new GithubAuthProvider();
  appleProvider = new OAuthProvider('apple.com');

  // Configure providers
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  githubProvider.addScope('read:user');
  githubProvider.addScope('user:email');

} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { auth, googleProvider, githubProvider, appleProvider };
export default app;
