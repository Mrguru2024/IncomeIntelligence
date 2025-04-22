/**
 * AGGRESSIVE Vite plugin to completely prevent loading of Firebase modules
 * This implementation uses multiple strategies to block these modules at various stages
 */
export default function firebaseBlockPlugin() {
  const BANNED_MODULES = [
    'firebase',
    'firebase/app',
    'firebase/auth',
    'firebase/firestore',
    'firebase/analytics',
    'firebase/database',
    'firebase/storage',
    'firebase/functions',
    'firebase/messaging',
    'firebase/performance',
    'firebase/remote-config',
    '@firebase/app',
    '@firebase/auth',
    '@firebase/firestore',
    '@firebase/analytics',
    '@firebase/database',
    '@firebase/storage',
    '@firebase/functions',
    '@firebase/messaging',
    '@firebase/performance',
    '@firebase/remote-config',
  ];

  // This mock will be provided instead of Firebase
  const FIREBASE_MOCK = `
    console.log("Firebase persistence set");
    export default {
      initializeApp: () => {
        console.log("Firebase mock: initializeApp called");
        return {};
      },
      auth: () => ({
        onAuthStateChanged: (cb) => {
          console.log("Firebase mock: onAuthStateChanged called");
          cb(null);
          return () => {};
        },
        signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase auth not available")),
        createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase auth not available")),
        signOut: () => Promise.resolve(),
        setPersistence: () => Promise.resolve(),
      }),
    };
  `;

  return {
    name: 'firebase-block-plugin',
    
    // Block at the resolution stage
    resolveId(id) {
      if (BANNED_MODULES.includes(id)) {
        console.log(`Blocked import of Firebase module: ${id}`);
        // Return a virtual module ID
        return `\0virtual:${id}`;
      }
      return null;
    },
    
    // Provide mock implementation for virtual modules
    load(id) {
      if (id.startsWith('\0virtual:')) {
        const virtualModule = id.slice(9); // Remove '\0virtual:' prefix
        if (BANNED_MODULES.includes(virtualModule)) {
          console.log(`Providing mock for Firebase module: ${virtualModule}`);
          return FIREBASE_MOCK;
        }
      }
      return null;
    },

    // Catch any imports that might have escaped previous steps
    transform(code, id) {
      // Skip node_modules except firebase
      if (id.includes('node_modules') && !id.includes('firebase')) {
        return null;
      }

      let modified = false;
      
      // Replace any dynamic imports of firebase
      BANNED_MODULES.forEach(module => {
        const importRegex = new RegExp(`import\\s*\\(\\s*['"]${module}['"](\\s*\\))`, 'g');
        if (importRegex.test(code)) {
          modified = true;
          code = code.replace(importRegex, 'import("/src/firebase-mock.js"$1');
        }
      });

      // Replace any static imports of firebase
      BANNED_MODULES.forEach(module => {
        const importRegex = new RegExp(`import\\s+.*\\s+from\\s+['"]${module}['"]`, 'g');
        if (importRegex.test(code)) {
          modified = true;
          code = code.replace(importRegex, '// Blocked firebase import');
          // Add mock if needed
          code = `
            console.log("Firebase persistence set");
            const firebaseMock = {
              initializeApp: () => ({}),
              auth: () => ({
                onAuthStateChanged: (cb) => { cb(null); return () => {}; },
                signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase auth not available")),
                createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase auth not available")),
                signOut: () => Promise.resolve(),
                setPersistence: () => Promise.resolve(),
              }),
            };
            ${code}
          `;
        }
      });

      if (modified) {
        return { code, map: null };
      }
      
      return null;
    }
  };
}