/**
 * Google Sign-In API initialization and utilities
 */

declare global {
  interface Window {
    gapi: any;
  }
}

// Initialize Google Sign-In API
export const initGoogleSignIn = () => {
  return new Promise<void>((resolve, reject) => {
    // Check if script is already loaded
    if (
      document.querySelector(
        'script[src="https://apis.google.com/js/platform.js"]'
      )
    ) {
      if (window.gapi && window.gapi.auth2) {
        resolve();
        return;
      }
    }

    // Load the Google Sign-In API script
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/platform.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.gapi) {
        reject(new Error("Google API failed to load"));
        return;
      }

      window.gapi.load("auth2", () => {
        if (!window.gapi.auth2) {
          reject(new Error("Google Auth2 failed to load"));
          return;
        }

        window.gapi.auth2
          .init({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: "profile email",
          })
          .then(() => {
            resolve();
          })
          .catch((error: Error) => {
            reject(error);
          });
      });
    };
    script.onerror = (error) => {
      reject(new Error("Failed to load Google Sign-In script"));
    };
    document.head.appendChild(script);
  });
};

// Initialize Google Sign-In on app load
export const initializeGoogleAuth = async () => {
  try {
    await initGoogleSignIn();
    console.log("Google Sign-In API initialized successfully");
  } catch (error) {
    console.error("Error initializing Google Sign-In API:", error);
    // Don't throw the error to prevent app crash
  }
};
