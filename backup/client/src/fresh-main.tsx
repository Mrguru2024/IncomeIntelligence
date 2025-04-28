import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/use-fresh-auth';
import { Toaster } from '@/components/ui/toaster';
import './index.css';

// Import our fresh app component
import FreshApp from './FreshApp';

console.log('[FRESH] Starting Stackr Finance without Firebase dependencies');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FreshApp />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);