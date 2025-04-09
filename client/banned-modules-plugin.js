/**
 * Vite plugin to completely prevent loading of problematic modules
 * This helps eliminate initialization errors from libraries we're not actively using
 */
export default function bannedModulesPlugin() {
  const bannedModules = ['@sanity/client', 'firebase', 'firebase/app', 'firebase/auth'];
  
  return {
    name: 'banned-modules-plugin',
    
    resolveId(id) {
      if (bannedModules.includes(id)) {
        // Return a virtual module ID that we'll handle
        return `\0banned:${id}`;
      }
      return null;
    },
    
    load(id) {
      if (id.startsWith('\0banned:')) {
        const originalId = id.slice(8); // Remove '\0banned:' prefix
        console.log(`🚫 Prevented loading of problematic module: ${originalId}`);
        
        // Return a mock module that exports harmless placeholders
        return `
          console.warn('Module "${originalId}" has been blocked by banned-modules-plugin');
          export default {};
          export const createClient = () => ({});
          export const initializeApp = () => ({});
          export const getAuth = () => ({});
        `;
      }
      return null;
    }
  };
}