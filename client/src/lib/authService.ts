
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from './queryClient';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(email: string, password: string): Promise<LoginResponse> {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
