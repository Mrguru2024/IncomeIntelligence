/**
 * Custom Authentication Service
 * 
 * A Firebase-free authentication service that handles user authentication
 * using our own backend API and JWT tokens.
 */

import { apiRequest } from './queryClient';

export interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  subscriptionStatus?: 'free' | 'basic' | 'pro' | 'lifetime';
  subscriptionTier?: string;
  subscriptionPlanId?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt?: string;
  updatedAt?: string;
  profileImageUrl?: string;
  googleId?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface GoogleCredentials {
  token: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthChangeListener {
  (user: User | null): void;
}

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;
  private listeners: AuthChangeListener[] = [];
  
  constructor() {
    // Check for existing auth session on init
    this.checkAuthStatus();
  }

  /**
   * Check if user is already authenticated from previous session
   */
  private async checkAuthStatus(): Promise<void> {
    try {
      const response = await apiRequest('GET', '/api/user');
      if (response.ok) {
        const user = await response.json();
        this.setCurrentUser(user);
      } else {
        this.setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      this.setCurrentUser(null);
    }
  }

  /**
   * Update current user and notify listeners
   */
  private setCurrentUser(user: User | null): void {
    this.currentUser = user;
    // Notify all listeners about the auth state change
    this.listeners.forEach(listener => listener(user));
  }

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await apiRequest('POST', '/api/register', credentials);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const user = await response.json();
      this.setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Log in an existing user
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiRequest('POST', '/api/login', credentials);
      
      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }
      
      const user = await response.json();
      this.setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Log in or register with Google
   */
  async loginWithGoogle(credentials: GoogleCredentials): Promise<User> {
    try {
      const response = await apiRequest('POST', '/api/auth/google', credentials);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Google authentication failed');
      }
      
      const user = await response.json();
      this.setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      await apiRequest('POST', '/api/logout');
      this.setCurrentUser(null);
      this.token = null;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  /**
   * Subscribe to authentication state changes
   * Returns an unsubscribe function
   */
  onAuthStateChanged(listener: AuthChangeListener): () => void {
    this.listeners.push(listener);
    
    // Call immediately with current state
    listener(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }
    
    try {
      const response = await apiRequest('PATCH', `/api/user/${this.currentUser.id}`, updates);
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedUser = await response.json();
      this.setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }
    
    try {
      const response = await apiRequest('POST', '/api/change-password', {
        currentPassword,
        newPassword
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await apiRequest('POST', '/api/request-password-reset', { email });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request password reset');
      }
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await apiRequest('POST', '/api/reset-password', {
        token,
        newPassword
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }
    } catch (error) {
      throw error;
    }
  }
}

// Create a singleton instance of the auth service
const authService = new AuthService();

export default authService;