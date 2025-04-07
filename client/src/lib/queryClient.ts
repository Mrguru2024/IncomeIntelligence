import { QueryClient } from "@tanstack/react-query";

// Helper to throw error if response is not ok
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

// Remove auth token from localStorage
function removeAuthToken(): void {
  localStorage.removeItem("auth_token");
}

// Make API request with authentication
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

// Create query function
export const getQueryFn =
  ({ on401: unauthorizedBehavior }: { on401: "throw" | "returnNull" }) =>
  async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(queryKey[0], {
        headers,
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        if (token) removeAuthToken();
        return null;
      }

      await throwIfResNotOk(res);
      return res.json();
    } catch (error) {
      console.error("Error in getQueryFn:", error);
      throw error;
    }
  };

// Create and export the query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});