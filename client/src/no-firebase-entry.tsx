import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/hooks/useTheme';
import './index.css';

// Import base components without Firebase
import { Route, Switch } from 'wouter';
import NotFound from '@/pages/not-found';
import AuthPage from '@/pages/auth-page';

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

// Simple Firebase-free application
function NoFirebaseApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <Route path="/" component={() => (
              <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
                <h1 className="text-4xl font-bold mb-6">Stackr Finance</h1>
                <p className="text-xl mb-6">Your financial management platform</p>
                <a 
                  href="/auth" 
                  className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Login or Register
                </a>
              </div>
            )} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Ensure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("ERROR: Root element #root not found in the DOM!");
} else {
  console.log("DOM: Root element found, rendering minimal React application");
  
  // Wrap in try/catch to display any rendering errors
  try {
    // Create React root and render the app directly
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <NoFirebaseApp />
      </React.StrictMode>
    );
    console.log("RENDER: No-Firebase app rendered successfully");
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