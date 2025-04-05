import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper function to get auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Helper function to set auth token in localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

// Helper function to remove auth token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

export async function apiRequest(
  url: string,
  options: {
    method: string;
    body?: string | object;
    headers?: Record<string, string>;
  } = { method: 'GET' }
): Promise<any> {
  // Get token from localStorage if available
  const token = getAuthToken();
  
  // Create headers with auth token if available
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Convert body to JSON string if it's an object
  const body = typeof options.body === 'object' 
    ? JSON.stringify(options.body) 
    : options.body;

  // Make the request with proper headers
  const res = await fetch(url, {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get token from localStorage if available
    const token = getAuthToken();
    
    // Create headers with auth token if available
    const headers: Record<string, string> = {};
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      // Clear token if unauthorized
      if (token) removeAuthToken();
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
