
// Simple auth state management without Firebase
interface User {
  id: string;
  email: string | null;
  displayName?: string;
}

let currentUser: User | null = null;
const authStateListeners = new Set<(user: User | null) => void>();

export const auth = {
  currentUser,
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    authStateListeners.add(callback);
    callback(currentUser);
    return () => authStateListeners.delete(callback);
  },
  getIdToken: async () => {
    return localStorage.getItem('auth_token');
  },
  signOut: async () => {
    currentUser = null;
    localStorage.removeItem('auth_token');
    authStateListeners.forEach(listener => listener(null));
  }
};
