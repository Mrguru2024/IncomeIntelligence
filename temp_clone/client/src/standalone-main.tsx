import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import './index.css';

// ULTRA-MINIMAL APP WITH NO IMPORTS AT ALL
function StandaloneApp() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center">
          <h1 className="text-2xl font-bold">Stackr Finance</h1>
        </div>
      </header>
      
      <main className="flex-1 container py-10">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Simplified App</h2>
          <p className="text-xl text-muted-foreground">
            All Firebase dependencies have been removed.
          </p>
        </div>
      </main>
    </div>
  );
}

// Debugging log
console.log("STANDALONE: Starting completely independent entry point");

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
          <StandaloneApp />
          <Toaster />
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log("RENDER: Standalone app rendered successfully");
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