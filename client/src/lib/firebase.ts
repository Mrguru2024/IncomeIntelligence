
// Simple authentication module without Firebase dependencies
interface User {
  id: string;
  email: string | null;
}

// Simple local auth state management
let currentUser: User | null = null;
const authStateListeners = new Set<(user: User | null) => void>();

const auth = {
  currentUser,
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    authStateListeners.add(callback);
    callback(currentUser);
    return () => {
      authStateListeners.delete(callback);
    };
  },
  getIdToken: () => Promise.resolve(null),
  signIn: (user: User) => {
    currentUser = user;
    authStateListeners.forEach(listener => listener(currentUser));
  },
  signOut: () => {
    currentUser = null;
    authStateListeners.forEach(listener => listener(null));
  }
};

export { auth };
