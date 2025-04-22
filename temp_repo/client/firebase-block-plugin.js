/**
 * Vite plugin to prevent Firebase modules from being imported
 */
export default function blockFirebasePlugin() {
  const blockedModules = [
    'firebase',
    'firebase/app',
    'firebase/auth',
    'firebase/firestore',
    'firebase/analytics',
    '@firebase/app',
    '@firebase/auth',
    '@firebase/firestore',
    '@firebase/analytics',
    'sanity'
  ];
  
  const emptyModuleContent = `
    export default {};
    export const getAuth = () => null;
    export const signInWithEmailAndPassword = () => null;
    export const createUserWithEmailAndPassword = () => null;
    export const initializeApp = () => ({});
    export const onAuthStateChanged = () => () => {};
    export const signOut = () => Promise.resolve();
    export const collection = () => ({});
    export const doc = () => ({});
    export const getDoc = () => Promise.resolve({ exists: () => false, data: () => ({}) });
    export const getDocs = () => Promise.resolve({ docs: [] });
    export const addDoc = () => Promise.resolve({});
    export const updateDoc = () => Promise.resolve({});
    export const deleteDoc = () => Promise.resolve({});
    export const onSnapshot = () => () => {};
    export const query = () => ({});
    export const where = () => ({});
    export const orderBy = () => ({});
    export const limit = () => ({});
    export const startAfter = () => ({});
    export const endBefore = () => ({});
    export const serverTimestamp = () => new Date();
    export const Timestamp = { fromDate: (date) => date, now: () => new Date() };
    export const getStorage = () => ({});
    export const ref = () => ({});
    export const uploadBytes = () => Promise.resolve({});
    export const getDownloadURL = () => Promise.resolve('');
    export const deleteObject = () => Promise.resolve({});
    export const setPersistence = () => Promise.resolve({});
    export const browserLocalPersistence = 'local';
    export const browserSessionPersistence = 'session';
    export const inMemoryPersistence = 'none';
    export const GoogleAuthProvider = class {};
    export const GithubAuthProvider = class {};
    export const FacebookAuthProvider = class {};
    export const TwitterAuthProvider = class {};
    export const OAuthProvider = class {};
    export const PhoneAuthProvider = class {};
    export const RecaptchaVerifier = class {};
    export const EmailAuthProvider = class {};
    export const linkWithPopup = () => Promise.resolve({});
    export const linkWithRedirect = () => Promise.resolve({});
    export const unlink = () => Promise.resolve({});
    export const reauthenticateWithPopup = () => Promise.resolve({});
    export const reauthenticateWithRedirect = () => Promise.resolve({});
    export const sendEmailVerification = () => Promise.resolve({});
    export const sendPasswordResetEmail = () => Promise.resolve({});
    export const verifyPasswordResetCode = () => Promise.resolve({});
    export const confirmPasswordReset = () => Promise.resolve({});
    export const applyActionCode = () => Promise.resolve({});
    export const checkActionCode = () => Promise.resolve({});
  `;

  return {
    name: 'block-firebase-plugin',
    
    resolveId(id) {
      // If this is a blocked module, return a virtual module ID
      if (blockedModules.some(blocked => id === blocked || id.startsWith(blocked + '/'))) {
        console.log(`[block-firebase-plugin] Blocking import of ${id}`);
        return `\0virtual:${id}`;
      }
      return null;
    },
    
    load(id) {
      // If this is one of our virtual modules, return empty module content
      if (id.startsWith('\0virtual:')) {
        console.log(`[block-firebase-plugin] Providing mock for ${id}`);
        return emptyModuleContent;
      }
      return null;
    },
    
    transform(code, id) {
      // Look for dynamic imports of blocked modules and replace them with empty objects
      if (blockedModules.some(blocked => id.includes(blocked))) {
        console.log(`[block-firebase-plugin] Transforming code in ${id} that imports Firebase`);
        
        let modifiedCode = code;
        
        // Replace import statements
        for (const blocked of blockedModules) {
          // Replace static imports
          const staticImportRegex = new RegExp(`import\\s+(?:\\*\\s+as\\s+\\w+|\\{[^}]*\\}|\\w+)\\s+from\\s+['"]${blocked}(?:/[^'"]*)?['"]`, 'g');
          modifiedCode = modifiedCode.replace(staticImportRegex, '// Blocked import');
          
          // Replace dynamic imports
          const dynamicImportRegex = new RegExp(`import\\(['"]${blocked}(?:/[^'"]*)?['"]\\)`, 'g');
          modifiedCode = modifiedCode.replace(dynamicImportRegex, 'Promise.resolve({})');
          
          // Replace require statements
          const requireRegex = new RegExp(`require\\(['"]${blocked}(?:/[^'"]*)?['"]\\)`, 'g');
          modifiedCode = modifiedCode.replace(requireRegex, '{}');
        }
        
        if (modifiedCode !== code) {
          return { code: modifiedCode, map: null };
        }
      }
      return null;
    }
  };
}