
// Simple auth service without Firebase
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(null);
    return () => {};
  },
  signOut: async () => Promise.resolve(),
  signInWithEmailAndPassword: async () => Promise.resolve({ user: null }),
  createUserWithEmailAndPassword: async () => Promise.resolve({ user: null }),
};
