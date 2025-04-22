import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/hooks/useTheme';
import './index.css';

// Import App component with custom Auth provider (no Firebase)
import App from './App';

// Console message for debugging
console.log("STARTUP: Using completely clean Firebase-free version");

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
}