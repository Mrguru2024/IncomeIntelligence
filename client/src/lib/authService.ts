import {
  signInWithPopup,
  signOut,
  signInWithRedirect,
  getRedirectResult,
  UserCredential,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  githubProvider,
  appleProvider,
} from "./firebase";

export type SocialAuthProvider = "google" | "github" | "apple";

// Function to handle social sign-in with popup
export const signInWithSocial = async (
  provider: SocialAuthProvider,
): Promise<UserCredential> => {
  try {
    let authProvider;

    switch (provider) {
      case "google":
        authProvider = googleProvider;
        break;
      case "github":
        authProvider = githubProvider;
        break;
      case "apple":
        authProvider = appleProvider;
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const result = await signInWithPopup(auth, authProvider);

    // This gives you access token for the provider
    // const credential = provider === 'google'
    //   ? GoogleAuthProvider.credentialFromResult(result)
    //   : provider === 'github'
    //     ? GithubAuthProvider.credentialFromResult(result)
    //     : OAuthProvider.credentialFromResult(result);

    // if (credential) {
    //   const token = credential.accessToken;
    //   // Use token for API calls to the provider if needed
    // }

    // Communicate with our backend to create/update user
    await sendAuthToBackend(result);

    return result;
  } catch (error: any) {
    console.error(`Error signing in with ${provider}:`, error);
    throw error;
  }
};

// Alternative method using redirect flow (better for mobile)
export const signInWithSocialRedirect = async (
  provider: SocialAuthProvider,
): Promise<void> => {
  try {
    let authProvider;

    switch (provider) {
      case "google":
        authProvider = googleProvider;
        break;
      case "github":
        authProvider = githubProvider;
        break;
      case "apple":
        authProvider = appleProvider;
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    await signInWithRedirect(auth, authProvider);
  } catch (error: any) {
    console.error(`Error redirecting to ${provider}:`, error);
    throw error;
  }
};

// Function to handle the redirect result
export const handleRedirectResult =
  async (): Promise<UserCredential | null> => {
    try {
      const result = await getRedirectResult(auth);

      if (result) {
        // User signed in
        await sendAuthToBackend(result);
        return result;
      }

      return null;
    } catch (error) {
      console.error("Error handling redirect:", error);
      throw error;
    }
  };

// Helper function to send the authentication data to our backend
const sendAuthToBackend = async (
  credentials: UserCredential,
): Promise<void> => {
  try {
    // Get the ID token
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
      throw new Error(data.message || "Failed to authenticate with backend");
    }

    return data;
  } catch (error) {
    console.error("Error sending authentication to backend:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    // Also sign out from our backend
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
