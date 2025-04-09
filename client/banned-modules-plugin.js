/**
 * AGGRESSIVE Vite plugin to completely prevent loading of Firebase and Sanity modules
 * This implementation uses multiple strategies to block these modules at various stages
 */
export default function bannedModulesPlugin() {
  // Complete list of all Firebase and Sanity related modules to block
  const bannedModules = [
    // Firebase core and direct imports
    'firebase', 
    'firebase/app', 
    'firebase/auth', 
    'firebase/firestore',
    'firebase/storage',
    'firebase/functions',
    'firebase/analytics',
    'firebase/database',
    'firebase/performance',
    'firebase/remote-config',
    'firebase/messaging',
    
    // Firebase namespaced packages
    '@firebase/app',
    '@firebase/auth',
    '@firebase/firestore',
    '@firebase/storage',
    '@firebase/functions',
    '@firebase/analytics',
    '@firebase/database',
    '@firebase/performance',
    '@firebase/remote-config',
    '@firebase/messaging',
    '@firebase/util',
    '@firebase/app-compat',
    '@firebase/auth-compat',
    
    // Sanity packages
    '@sanity/client',
    '@sanity/image-url',
    '@sanity/vision',
    '@sanity/base',
    '@sanity/desk-tool',
    '@sanity/core',
    'sanity',
    'sanity/desk'
  ];
  
  // More aggressive pattern matching for partial module names
  const isBannedModule = (id) => {
    // Exact matches
    if (bannedModules.includes(id)) {
      return true;
    }
    
    // Check for firebase or sanity in the path
    if (
      id.includes('firebase') || 
      id.includes('Firebase') || 
      id.includes('sanity') || 
      id.includes('Sanity')
    ) {
      return true;
    }
    
    return false;
  };
  
  return {
    name: 'banned-modules-plugin',
    enforce: 'pre', // Run this plugin before all others
    
    // Called when resolving import specifiers
    resolveId(id, importer) {
      if (isBannedModule(id)) {
        console.log(`⛔ BLOCKED IMPORT: "${id}" imported from ${importer || 'unknown'}`);
        return `\0banned:${id}`;
      }
      return null;
    },
    
    // Called when loading modules
    load(id) {
      if (id.startsWith('\0banned:')) {
        const originalId = id.slice(8); // Remove '\0banned:' prefix
        console.log(`🚫 BANNED MODULE REPLACED: ${originalId}`);
        
        // Create a comprehensive mock that prevents any initialization
        return `
          console.log('BLOCKED: "${originalId}" module was prevented from loading by security policy');
          
          // Default export is an empty object
          const emptyFn = () => ({});
          const emptyObj = {};
          const emptyPromise = () => Promise.resolve({});
          
          // Comprehensive mocks for Firebase
          export const initializeApp = emptyFn;
          export const getApp = emptyFn;
          export const getApps = () => [];
          export const deleteApp = emptyFn;
          export const getAuth = emptyFn;
          export const createUserWithEmailAndPassword = emptyPromise;
          export const signInWithEmailAndPassword = emptyPromise;
          export const signOut = emptyPromise;
          export const onAuthStateChanged = () => emptyFn;
          export const getFirestore = emptyFn;
          export const collection = emptyFn;
          export const doc = emptyFn;
          export const getDoc = emptyPromise;
          export const getDocs = emptyPromise;
          export const setDoc = emptyPromise;
          export const updateDoc = emptyPromise;
          export const deleteDoc = emptyPromise;
          export const query = emptyFn;
          export const where = emptyFn;
          export const orderBy = emptyFn;
          export const limit = emptyFn;
          
          // Comprehensive mocks for Sanity
          export const createClient = () => ({
            fetch: () => Promise.resolve([]),
            create: () => Promise.resolve({}),
            createOrReplace: () => Promise.resolve({}),
            createIfNotExists: () => Promise.resolve({}),
            patch: () => ({ commit: () => Promise.resolve({}) }),
            delete: () => Promise.resolve({}),
            getDocument: () => Promise.resolve(null),
            listen: () => ({ unsubscribe: () => {} })
          });
          export const groq = (strings, ...keys) => strings.join('');
          export const imageUrlBuilder = () => ({ image: emptyFn, width: emptyFn, height: emptyFn, url: () => '' });
          
          // Default export as catch-all
          export default emptyObj;
        `;
      }
      return null;
    },
    
    // Transform imports in source code
    transform(code, id) {
      // Don't transform our virtual modules
      if (id.startsWith('\0banned:')) {
        return null;
      }
      
      // Look for dynamic imports of banned modules
      if (code.includes('import(') && bannedModules.some(mod => code.includes(`import('${mod}')`))) {
        console.log(`🔄 TRANSFORM: Replacing dynamic imports in ${id}`);
        
        let transformedCode = code;
        
        // Replace dynamic imports of banned modules with empty promises
        bannedModules.forEach(mod => {
          const dynamicImportPattern = new RegExp(`import\\(['"](${mod})['"]\\)`, 'g');
          transformedCode = transformedCode.replace(
            dynamicImportPattern, 
            `Promise.resolve({ default: {}, createClient: () => ({}), initializeApp: () => ({}) })`
          );
        });
        
        return {
          code: transformedCode,
          map: null
        };
      }
      
      return null;
    }
  };
}