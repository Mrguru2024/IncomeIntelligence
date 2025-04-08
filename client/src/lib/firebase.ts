
// Simple auth service without external dependencies
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(null);
    return () => {};
  },
  signOut: async () => {},
  signInWithEmailAndPassword: async () => ({ user: null }),
  createUserWithEmailAndPassword: async () => ({ user: null }),
};
