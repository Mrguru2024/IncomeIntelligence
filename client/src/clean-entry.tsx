import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import './index.css';

// Import the clean app components
import CleanApp from './CleanApp';

console.log("CLEAN-ENTRY: Starting clean application entry point with NO Firebase dependencies");

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
    // Create React root and render the app
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CleanApp />
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log("RENDER: Clean app rendered successfully");
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