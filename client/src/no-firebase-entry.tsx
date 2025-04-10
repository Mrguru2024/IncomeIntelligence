import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import './index.css';

// Import our minimal Firebase-free app component
import NoFirebaseApp from './no-firebase-app';

console.log("[NO-FIREBASE] Loading Firebase-free application");

// Create a minimal query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Render the app to the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Error: Could not find root element");
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <NoFirebaseApp />
        <Toaster />
      </QueryClientProvider>
    </React.StrictMode>
  );
  console.log("[NO-FIREBASE] Application rendered successfully");
}