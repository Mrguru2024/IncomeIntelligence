import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/ThemeProvider';
import './index.css';

// Import App component with custom Auth provider (no Firebase)
import App from './App';

// No Firebase setup needed - we're using our own auth system
console.log("STARTUP: Using custom authentication system");
// Clean up any potential Firebase leftovers
if (typeof window !== 'undefined') {
  // Remove any previous storage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('firebase')) {
      localStorage.removeItem(key);
    }
  }
}

// Add enhanced debugging
console.log("STARTUP: Application initialization beginning");

// Log that we're using Firebase-free version
console.log("STARTUP: Using Firebase-free version of Stackzen");

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