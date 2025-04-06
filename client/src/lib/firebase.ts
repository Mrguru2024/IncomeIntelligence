
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  OAuthProvider,
  browserLocalPersistence
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

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
let analytics;
let googleProvider;
let githubProvider;
let appleProvider;

try {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
      
      // Initialize auth first with retries
      auth = getAuth(app);
      auth.useDeviceLanguage();
      
      // Configure auth settings
      auth.settings.appVerificationDisabledForTesting = process.env.NODE_ENV === 'development';
      
      // Set persistence with retry
      const setPersistenceWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            await auth.setPersistence(browserLocalPersistence);
            console.log('Firebase persistence set');
            break;
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      };
      
      setPersistenceWithRetry().catch(error => {
        console.error('Firebase persistence error after retries:', error);
      });
      
      // Initialize analytics only in production
      if (process.env.NODE_ENV === 'production') {
        try {
          analytics = getAnalytics(app);
          console.log('Firebase Analytics initialized');
        } catch (error) {
          console.log('Analytics initialization skipped');
        }
      }
    } else {
      app = getApps()[0];
      auth = getAuth(app);
      
      if (process.env.NODE_ENV === 'production') {
        try {
          analytics = getAnalytics(app);
        } catch (error) {
          console.log('Analytics initialization skipped');
        }
      }
    }

    // Configure auth state persistence
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User is signed in');
      }
    });

  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }

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

export { auth, googleProvider, githubProvider, appleProvider, analytics };
export default app;
