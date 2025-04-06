
// Simple authentication module
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(null);
    return () => {};
  }
};

export { auth };
