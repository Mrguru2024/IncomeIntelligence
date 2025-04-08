import { useToast } from '@/hooks/use-toast';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

export async function registerUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return response.json();
}

// Helper function to send the authentication data to our backend
const sendAuthToBackend = async (
  credentials: { user: { getIdToken: () => Promise<string>; uid: string; email?: string; displayName?: string; photoURL?: string }; providerId: string },
): Promise<void> => {
  try {
    // Get the ID token (adapting to the new structure)
    const idToken = await credentials.user.getIdToken();

    // Send to our backend
    const response = await fetch("/api/auth/social-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        idToken,
        provider: credentials.providerId,
        uid: credentials.user.uid,
        email: credentials.user.email,
        displayName: credentials.user.displayName,
        photoURL: credentials.user.photoURL,
      }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Auth error:', data);
      throw new Error(data.message || "Failed to authenticate with backend");
    }

    return data;
  } catch (error) {
    console.error("Error sending authentication to backend:", error);
    throw error;
  }
};