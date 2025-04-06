import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  OAuthProvider,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Set persistence
setPersistence(auth, browserLocalPersistence);

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Configure Google provider
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');

// Configure Github provider
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

//This part remains from original code, as it's not directly related to initialization or provider setup.
const analytics = process.env.NODE_ENV === 'production' ? getAnalytics(app) : null;
auth.useDeviceLanguage();
auth.settings.appVerificationDisabledForTesting = process.env.NODE_ENV === 'development';

// Configure auth state persistence (from original code)
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in');
  }
});


export { 
  app,
  auth,
  googleProvider,
  githubProvider,
  appleProvider,
  analytics
};