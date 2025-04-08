import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Types for API requests
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Function to make API requests
export const apiRequest = async (
  method: HttpMethod,
  endpoint: string,
  data?: unknown
) => {
  const token = localStorage.getItem('token');
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
  };
  
  if (data && (method !== 'GET')) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(endpoint, options);
  
  return response;
};

// Generic query function for React Query
interface QueryFnOptions {
  on401?: 'throw' | 'returnNull';
}

export const getQueryFn = (options: QueryFnOptions = { on401: 'throw' }) => {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [endpoint] = queryKey;
    
    try {
      const response = await apiRequest('GET', endpoint);
      
      if (!response.ok) {
        if (response.status === 401 && options.on401 === 'returnNull') {
          return null;
        }
        throw new Error(`Failed to fetch data from ${endpoint}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  };
};