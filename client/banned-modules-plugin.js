/**
 * AGGRESSIVE Vite plugin to completely prevent loading of Firebase and Sanity modules
 * This implementation uses multiple strategies to block these modules at various stages
 */
export default function bannedModulesPlugin() {
  // Path to our mock module
  const mockedContent = `
    // Mock replacement for banned modules
    console.log('[MOCK] Using mock module instead of banned dependency');
    
    // Mock necessary exports
    export const initializeApp = () => ({ 
      name: 'mock-app',
      options: { projectId: 'mock-project' } 
    });
    export const getAuth = () => ({
      currentUser: null,
      onAuthStateChanged: (cb) => { 
        setTimeout(() => cb(null), 0); 
        return () => {};
      },
      signOut: () => Promise.resolve(),
      setPersistence: () => Promise.resolve(),
      createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
      signInWithEmailAndPassword: () => Promise.resolve({ user: null })
    });
    export const getFirestore = () => ({});
    export const auth = { currentUser: null };
    export const db = {};
    export const app = { name: 'mock-app' };
    export const browserLocalPersistence = 'mock';
    export const GoogleAuthProvider = { PROVIDER_ID: 'google.com' };
    export const signInWithRedirect = () => Promise.resolve();
    export const getRedirectResult = () => Promise.resolve(null);
    
    // Default export
    export default { 
      initializeApp, getAuth, getFirestore, auth, db, app,
      browserLocalPersistence, GoogleAuthProvider
    };
  `;

  return {
    name: 'banned-modules-plugin',
    enforce: 'pre',
    
    resolveId(id, importer) {
      // Check if the module ID contains any banned keywords
      const isBanned = 
        id.includes('firebase') || 
        id.includes('@firebase') || 
        id.includes('sanity') || 
        id.includes('@sanity');
      
      if (isBanned) {
        console.log(`[BANNED] Intercepted import of '${id}' from '${importer || 'unknown'}'`);
        // Return a virtual module ID that we'll handle in the load hook
        return `\0banned:${id}`;
      }
      
      return null;
    },
    
    load(id) {
      // Handle our virtual banned module IDs
      if (id.startsWith('\0banned:')) {
        console.log(`[BANNED] Providing mock implementation for: ${id.slice(8)}`);
        return mockedContent;
      }
      
      return null;
    },
    
    transform(code, id) {
      // As a final safety measure, transform any import statements that might have slipped through
      if (
        (code.includes('firebase') || code.includes('sanity')) &&
        (code.includes('import') || code.includes('require'))
      ) {
        console.log(`[BANNED] Sanitizing code in ${id}`);
        
        // Very aggressive replacement of import statements
        let newCode = code;
        
        // Replace dynamic imports
        newCode = newCode.replace(
          /import\s*\(\s*["'].*?(firebase|sanity).*?["']\s*\)/g,
          `Promise.resolve({})`
        );
        
        // Replace static imports
        newCode = newCode.replace(
          /import\s+(?:(?:\* as )?[^;]*?|\{[^}]*?\})\s+from\s+["'].*?(firebase|sanity).*?["'];?/g,
          `// BANNED IMPORT REMOVED`
        );
        
        // Replace require calls
        newCode = newCode.replace(
          /(?:const|let|var)\s+(?:\w+|\{[^}]*?\})\s+=\s+require\s*\(\s*["'].*?(firebase|sanity).*?["']\s*\);?/g,
          `// BANNED REQUIRE REMOVED`
        );
        
        if (newCode !== code) {
          console.log(`[BANNED] Modified imports in ${id}`);
          return { code: newCode };
        }
      }
      
      return null;
    }
  };
}