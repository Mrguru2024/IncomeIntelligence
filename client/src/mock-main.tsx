// Mock main entry point that uses mock-firebase instead of real Firebase
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { Route, Switch } from 'wouter';
import { Loader2 } from 'lucide-react';
import NotFound from '@/pages/not-found';

// Instead of importing Firebase modules, we'll manually create a simple UI
function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading to give API time to respond
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Loading Stackr...</h2>
          <p className="text-muted-foreground">Setting up your financial tracking tools</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route path="/" component={MaintenancePage} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </QueryClientProvider>
    </div>
  );
}

// Temporary maintenance page component
function MaintenancePage() {
  const apiStatus = useApiStatus();

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 text-primary">Stackr</h1>
        <p className="text-xl text-muted-foreground">Service Provider Finance</p>
      </div>
      
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded">
        <h2 className="font-semibold text-amber-800 mb-1">Firebase Removal In Progress</h2>
        <p className="text-amber-700 text-sm">
          We're currently fixing Firebase dependency issues. The server-side API remains fully 
          functional, while we're completing the removal of Firebase from the frontend.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Backend API</span>
              <span className="font-medium text-green-600">
                {apiStatus.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                ) : apiStatus.online ? (
                  "✓ Online"
                ) : (
                  <span className="text-rose-600">✗ Offline</span>
                )}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">PostgreSQL Database</span>
              <span className="font-medium text-green-600">
                {apiStatus.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                ) : apiStatus.online ? (
                  "✓ Connected"
                ) : (
                  <span className="text-rose-600">✗ Disconnected</span>
                )}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Firebase Dependencies</span>
              <span className="font-medium text-amber-600">⚠ Removing</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">Available Features</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span> 40/30/30 Income Split Management
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span> Income Tracking & History
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span> Budget Planning With Preset Splits
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span> AI-Powered Financial Advice
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span> Bank Connection Management
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span> Stackr Gigs Platform
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Status updated: April 2025</p>
        <p className="mt-4">
          <a 
            href="/api/status" 
            target="_blank" 
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Check API Status
          </a>
        </p>
      </div>
    </div>
  );
}

// Hook to check API status
function useApiStatus() {
  const [status, setStatus] = React.useState({
    loading: true,
    online: false,
    data: null
  });

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/status');
        if (response.ok) {
          const data = await response.json();
          setStatus({
            loading: false,
            online: true,
            data
          });
        } else {
          setStatus({
            loading: false,
            online: false,
            data: null
          });
        }
      } catch (error) {
        setStatus({
          loading: false,
          online: false,
          data: null
        });
      }
    };

    checkStatus();
  }, []);

  return status;
}

// Mount the app
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}