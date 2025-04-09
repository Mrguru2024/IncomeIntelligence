import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
// We'll create our own queryClient instance
import { AuthProvider } from '@/hooks/use-auth';
import './index.css';

// Import the clean app components (with no Firebase dependencies)
import CleanApp from './CleanApp';

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

// No need to set up the query client as it's already configured

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CleanApp />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);