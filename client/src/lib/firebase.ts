
// Simplified auth service without Firebase dependencies
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(null);
    return () => {};
  },
  signOut: async () => Promise.resolve(),
};

export { auth };
