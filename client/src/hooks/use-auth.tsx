
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Define a User type to replace Firebase's User
interface User {
  id: number;
  username: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  subscriptionTier?: string;
  subscriptionActive?: boolean;
}

// Login parameters
interface LoginParams {
  identifier: string; // Can be username or email
  password: string;
}

// Interface for the authentication context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hooks for authentication operations
function useLoginMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: async (credentials: LoginParams) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Invalid credentials");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/user'], data);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    },
  });
}

function useRegisterMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string }) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/user'], data);
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "There was an error creating your account",
        variant: "destructive",
      });
    },
  });
}

function useLogoutMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', undefined);
      if (!res.ok) {
        throw new Error("Logout failed");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      localStorage.removeItem('token');
      setLocation('/auth');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    },
  });
}

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch current user
  const { 
    data: user,
    isLoading,
    error: fetchError
  } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            // Not authenticated
            return null;
          }
          throw new Error("Failed to fetch user data");
        }
        
        return res.json();
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err instanceof Error ? err : new Error("Unknown error occurred"));
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  // Initialize auth mutations
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  
  // Set error from fetch if it exists
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError]);
  
  // Build the context value
  const contextValue: AuthContextType = {
    user: user || null,
    isLoading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
