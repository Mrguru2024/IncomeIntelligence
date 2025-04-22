/**
 * AGGRESSIVE Vite plugin to completely prevent loading of Firebase and Sanity modules
 * This implementation uses multiple strategies to block these modules at various stages
 */
export default function bannedModulesPlugin() {
  // Ultra minimal completely empty response with only error throwing
  const mockedContent = `
    // No Firebase or Sanity dependencies allowed - throws error when accessed
    console.error('[BANNED MODULE] Attempted to use banned dependency - Firebase/Sanity are forbidden');
    
    // All exports throw errors
    const createError = () => { 
      throw new Error('Firebase/Sanity dependencies are banned in this application'); 
    };
    
    // Export error-throwing functions for all common Firebase methods
    export const initializeApp = createError;
    export const getAuth = createError;
    export const getFirestore = createError;
    export const setPersistence = createError;
    export const browserLocalPersistence = 'banned';
    export const signInWithEmailAndPassword = createError;
    export const createUserWithEmailAndPassword = createError;
    export const signOut = createError;
    export const onAuthStateChanged = createError;
    export const signInWithRedirect = createError;
    export const getRedirectResult = createError;
    export const GoogleAuthProvider = { new: createError };
    
    // Default export also throws
    export default new Proxy({}, {
      get() { createError(); }
    });
  `;

  return {
    name: 'banned-modules-plugin',
    enforce: "pre", // must be "pre" or "post" or undefined
    
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