
    // Super minimal mock providing only what is absolutely needed
    console.log('Mock dependency loaded');
    
    // For Firebase
    export const initializeApp = (config) => {
      console.log('Mock initializeApp called');
      return {
        projectId: 'mock-project-id'
      };
    };
    
    // For Firebase Auth
    export const getAuth = () => ({ 
      currentUser: null,
      onAuthStateChanged: (callback) => {
        setTimeout(() => callback(null), 0);
        return () => {};
      }
    });
    
    // For Sanity
    export const createClient = (config) => ({
      fetch: () => Promise.resolve([]),
      getDocument: () => Promise.resolve(null),
      create: () => Promise.resolve({ _id: 'mock-id' }),
      patch: () => ({ commit: () => Promise.resolve({}) })
    });
    
    // Default export catches import * scenarios
    export default {
      projectId: 'mock-project-id',
      initializeApp,
      getAuth,
      createClient
    };
  