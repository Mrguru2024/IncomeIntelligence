import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types
interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

// Create context
export const CleanAuthContext = createContext<AuthContextType | null>(null);

// Provider
export function CleanAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/user', {
          credentials: 'include',
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        
        return await res.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    // Only start fetching when initialized
    enabled: isInitialized,
    initialData: null, // Provide initial data to prevent undefined
  });

  // Initialize provider
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/auth/user'], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/auth/user'], user);
      toast({
        title: "Registration successful",
        description: `Welcome to Stackr, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Logout failed');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <CleanAuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </CleanAuthContext.Provider>
  );
}

// Hook to use auth context
export function useCleanAuth() {
  const context = useContext(CleanAuthContext);
  if (!context) {
    throw new Error("useCleanAuth must be used within a CleanAuthProvider");
  }
  return context;
}