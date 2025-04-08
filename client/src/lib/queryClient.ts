import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
};