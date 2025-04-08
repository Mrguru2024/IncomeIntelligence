
import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getCurrentUser } from "@/lib/authService";

interface User {
  id: number;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await getCurrentUser();
          setUser(user);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginUser(email, password);
    if (response.token) {
      localStorage.setItem('token', response.token);
      setUser(response.user);
    }
  };

  const register = async (email: string, password: string) => {
    const response = await registerUser(email, password);
    if (response.token) {
      localStorage.setItem('token', response.token);
      setUser(response.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
