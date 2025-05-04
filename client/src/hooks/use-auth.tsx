import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import authService, { User } from "@/lib/authService";

interface GoogleCredentials {
  token: string;
  email: string;
  name: string;
  picture?: string;
  provider: "google";
}

type LoginCredentials =
  | { username: string; password: string; provider?: never }
  | GoogleCredentials;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<
    User,
    Error,
    { username: string; email: string; password: string }
  >;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize auth state from the auth service
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      return authService.loginWithGoogle();
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Success",
        description: "Successfully logged in with Google",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log in with Google",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: {
      username: string;
      email: string;
      password: string;
    }) => {
      return authService.register(credentials);
    },
    onSuccess: (registeredUser: User) => {
      setUser(registeredUser);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: Error) => {
      setError(error);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return authService.logout();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.clear();
      toast({
        title: "Logout Successful",
        description: "You have been logged out.",
      });
    },
    onError: (error: Error) => {
      setError(error);
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
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
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
