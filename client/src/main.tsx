import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/hooks/useTheme';
import './index.css';

// Import App component with custom Auth provider (no Firebase)
import App from './App';

// Block any potential real Firebase imports by patching global objects
// This will prevent the Firebase SDK from initializing properly
console.log("STARTUP: Setting up Firebase blocking");
if (typeof window !== 'undefined') {
  // Create a fake indexedDB that throws on any attempt to use it (for Firebase persistence)
  Object.defineProperty(window, 'indexedDB', {
    value: {
      open: () => { 
        console.log("Blocked indexedDB access attempt");
        throw new Error("indexedDB access blocked");
      }
    },
    writable: false
  });
  
  // Block the Firebase persistence key
  console.log("STARTUP: Blocking Firebase persistence");
  window.localStorage.removeItem('firebase:previous-user');
  
  // Prevent any Firebase Web initialization
  window.__FIREBASE_CONFIG__ = {
    projectId: 'stackr-app-blocked',
    disabled: true
  };
}

// Add enhanced debugging
console.log("STARTUP: Application initialization beginning");

// Log that we're using Firebase-free version
console.log("STARTUP: Using Firebase-free version of Stackr Finance");

// Configure the query client for API requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Ensure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("ERROR: Root element #root not found in the DOM!");
} else {
  console.log("DOM: Root element found, rendering React application");
  
  // Wrap in try/catch to display any rendering errors
  try {
    // Create React root and render the app with all required providers
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <App />
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log("RENDER: App rendered successfully with Firebase-free authentication");
  } catch (error) {
    console.error("CRITICAL ERROR rendering app:", error);
    
    // Display a fallback error message in the DOM
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: system-ui, sans-serif;">
        <h2>Application Error</h2>
        <p>Sorry, something went wrong while loading the application.</p>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
}