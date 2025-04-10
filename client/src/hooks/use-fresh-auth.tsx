import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define user type
export interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  token?: string;
  subscriptionTier?: string;
  subscriptionActive?: boolean;
}

// Login and register data types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  email: string;
  firstName?: string;
  lastName?: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  registerMutation: UseMutationResult<User, Error, RegisterCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  // Query to get current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ['/api/user'],
    queryFn: getQueryFn<User | null>({ on401: 'returnNull' }),
  });

  // Save token to localStorage when user changes
  useEffect(() => {
    if (user && user.token) {
      localStorage.setItem('token', user.token);
    }
  }, [user]);

  // Login mutation
  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest('POST', '/api/login', credentials);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      return await res.json();
    },
    onSuccess: (userData: User) => {
      // Save user data to query cache
      queryClient.setQueryData(['/api/user'], userData);
      
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation<User, Error, RegisterCredentials>({
    mutationFn: async (credentials: RegisterCredentials) => {
      const res = await apiRequest('POST', '/api/register', credentials);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      return await res.json();
    },
    onSuccess: (userData: User) => {
      // Save user data to query cache
      queryClient.setQueryData(['/api/user'], userData);
      
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
      
      toast({
        title: 'Registration successful',
        description: `Welcome to Stackr, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/logout');
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Logout failed');
      }
      
      // Clear token from localStorage
      localStorage.removeItem('token');
    },
    onSuccess: () => {
      // Clear user data from query cache
      queryClient.setQueryData(['/api/user'], null);
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useFreshAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useFreshAuth must be used within an AuthProvider');
  }
  
  return context;
};