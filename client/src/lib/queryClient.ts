import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
    } catch (e) {
      if (e instanceof Error) throw e;
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

// Helper function to get auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

// Helper function to set auth token in localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

// Helper function to remove auth token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem("auth_token");
}

export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any,
  customHeaders?: Record<string, string>,
): Promise<Response> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (method !== "GET" && data !== undefined) {
    options.body = JSON.stringify(data);
  }

  return fetch(endpoint, options);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        const token = getAuthToken();

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(queryKey[0] as string, {
          headers,
          credentials: "include",
          mode: 'cors'
        });

        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          if (token) removeAuthToken();
          return null;
        }

        await throwIfResNotOk(res);
        try {
          return await res.json();
        } catch (error) {
          console.error('Error parsing response:', error);
          return null;
        }
      } catch (error) {
        console.error("Error in getQueryFn:", error);
        throw error;
      }
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});