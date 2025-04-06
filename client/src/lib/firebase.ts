
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

// Initialize Firebase with retry mechanism and network check
const initializeFirebaseWithRetry = async (retries = 3, delay = 1000) => {
  try {
    // Check network connectivity first
    const networkTest = await fetch('https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=' + firebaseConfig.apiKey, {
      method: 'OPTIONS'
    }).catch(() => null);

    if (!networkTest) {
      throw new Error('Network connectivity issue detected');
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    await auth.setPersistence(browserLocalPersistence);
    auth.useDeviceLanguage();
    
    // Configure providers after auth initialization
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      auth_type: 'reauthenticate'
    });
    
    const githubProvider = new GithubAuthProvider();
    const appleProvider = new OAuthProvider('apple.com');

    return { app, auth, googleProvider, githubProvider, appleProvider };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    if (retries > 0) {
      console.log(`Retrying Firebase initialization in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return initializeFirebaseWithRetry(retries - 1, delay * 1.5);
    }
    throw error;
  }
};

const { app, auth, googleProvider, githubProvider, appleProvider } = await initializeFirebaseWithRetry();

// Configure Google provider with custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: 'user@example.com'
});

// Add scopes for additional permissions
googleProvider.addScope('profile');
googleProvider.addScope('email');

githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

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

export { auth, googleProvider, githubProvider, appleProvider };
export default app;
