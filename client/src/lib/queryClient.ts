import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
    } catch (e) {
      if (e instanceof Error) throw e;
      const text = await res.text() || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
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

/**
 * Makes an API request with proper authentication
 * @param method HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param endpoint API endpoint path (e.g. '/api/user')
 * @param data Optional request body
 * @returns Response object
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any,
  customHeaders?: Record<string, string>
): Promise<Response> {
  // Get token from localStorage if available
  const token = getAuthToken();
  
  // Create headers with auth token if available
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Prepare request options
  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  // Add body for non-GET requests if data is provided
  if (method !== 'GET' && data !== undefined) {
    options.body = JSON.stringify(data);
  }

  // Make the request
  return fetch(endpoint, options);
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
