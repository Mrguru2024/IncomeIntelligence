/**
 * Authentication Service
 * 
 * This service replaces Firebase Authentication with a direct JWT-based authentication
 * system that works with our backend authentication routes.
 */

// Types
export interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  token?: string;
  subscriptionStatus?: 'free' | 'basic' | 'pro';
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Auth state management
interface AuthState {
  currentUser: User | null;
  listeners: ((user: User | null) => void)[];
}

const authState: AuthState = {
  currentUser: null,
  listeners: [],
};

// Initialize auth state from local storage on load
const initializeAuth = () => {
  console.log('[AUTH] Initializing auth service');
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData) as User;
      authState.currentUser = user;
      console.log('[AUTH] User loaded from local storage');
    } catch (error) {
      console.error('[AUTH] Error parsing user data from local storage', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

// Initialize on import
initializeAuth();

// Auth service functions
export const authService = {
  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(errorData.message || 'Registration failed');
    }
    
    const userData = await response.json() as User;
    
    // Store auth data
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      authState.currentUser = userData;
      authState.listeners.forEach(listener => listener(userData));
    }
    
    return userData;
  },
  
  /**
   * Login an existing user
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(errorData.message || 'Login failed');
    }
    
    const userData = await response.json() as User;
    
    // Store auth data
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      authState.currentUser = userData;
      authState.listeners.forEach(listener => listener(userData));
    }
    
    return userData;
  },
  
  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('[AUTH] Error during logout', error);
    } finally {
      // Clear local storage and state regardless of logout API success
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      authState.currentUser = null;
      authState.listeners.forEach(listener => listener(null));
    }
  },
  
  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    return authState.currentUser;
  },
  
  /**
   * Subscribe to auth state changes
   * Returns unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    authState.listeners.push(callback);
    
    // Call immediately with current state
    callback(authState.currentUser);
    
    // Return unsubscribe function
    return () => {
      authState.listeners = authState.listeners.filter(listener => listener !== callback);
    };
  },
  
  /**
   * Check if the user is logged in
   */
  isLoggedIn(): boolean {
    return !!authState.currentUser;
  },
  
  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },
  
  /**
   * Set persistence (mock function for Firebase compatibility)
   */
  setPersistence(): Promise<void> {
    console.log('[AUTH] Auth persistence set to local');
    return Promise.resolve();
  },
};

// Firebase compatibility layer - export functions that match Firebase API
export const getAuth = () => {
  console.log('[AUTH-COMPAT] GetAuth called');
  
  return {
    currentUser: authState.currentUser,
    onAuthStateChanged: authService.onAuthStateChanged,
    signInWithEmailAndPassword: (email: string, password: string) => {
      return authService.login({ username: email, password });
    },
    createUserWithEmailAndPassword: (email: string, password: string) => {
      return authService.register({ 
        username: email.split('@')[0], 
        email, 
        password 
      });
    },
    signOut: authService.logout,
    setPersistence: () => Promise.resolve(),
  };
};

// Default export for module compatibility
export default authService;