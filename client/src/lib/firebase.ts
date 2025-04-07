
// Simple authentication module without Firebase
interface User {
  id: string;
  email: string | null;
}

const auth = {
  currentUser: null as User | null,
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    callback(null);
    return () => {};
  },
  getIdToken: () => Promise.resolve(null)
};

export { auth };
