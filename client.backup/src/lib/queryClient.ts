import { QueryClient, QueryKey, QueryFunction } from "@tanstack/react-query";

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

type QueryFnContext = {
  queryKey: QueryKey;
  signal: AbortSignal;
  meta: Record<string, unknown> | undefined;
};

export const getQueryFn = <TData = unknown>(options: QueryFnOptions = { on401: 'throw' }): QueryFunction<TData, QueryKey> => {
  return async ({ queryKey, signal }: QueryFnContext): Promise<TData> => {
    const [endpoint] = queryKey as string[];
    
    try {
      const response = await apiRequest('GET', endpoint);
      
      if (!response.ok) {
        if (response.status === 401 && options.on401 === 'returnNull') {
          return null as unknown as TData;
        }
        throw new Error(`Failed to fetch data from ${endpoint}`);
      }
      
      return await response.json() as TData;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  };
};