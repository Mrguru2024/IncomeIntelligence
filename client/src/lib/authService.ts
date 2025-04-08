
import { apiRequest } from './queryClient';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  return response;
}

export async function registerUser(email: string, password: string): Promise<LoginResponse> {
  const response = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: { email, password }
  });
  return response;
}

export async function getCurrentUser() {
  return apiRequest('/api/auth/user');
}
