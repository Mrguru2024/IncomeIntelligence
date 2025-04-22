import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { Route, Switch } from 'wouter';
import { ThemeProvider } from '@/hooks/useTheme';
import './index.css';

// Import only necessary components
import NotFound from '@/pages/not-found';

// Simple App that doesn't depend on Firebase
function App() {
  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/" component={CleanHomePage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </div>
  );
}

// Clean homepage component
function CleanHomePage() {
  const [apiStatus, setApiStatus] = React.useState({
    loading: true,
    online: false
  });

  React.useEffect(() => {
    // Check if API is responsive
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/status');
        setApiStatus({
          loading: false,
          online: response.ok
        });
      } catch (error) {
        setApiStatus({
          loading: false,
          online: false
        });
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 text-primary">Stackr Finance</h1>
        <p className="text-xl text-muted-foreground">Service Provider Financial Management</p>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Stackr Finance</h2>
        <p className="mb-4">
          The Firebase-free version of our personal finance platform for service providers.
          Built for tracking income, managing your 40/30/30 split, and achieving your financial goals.
        </p>
        
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-3 h-3 rounded-full ${apiStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{apiStatus.loading ? 'Checking API status...' : apiStatus.online ? 'API is online' : 'API is offline'}</span>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Key Features</h3>
            <ul className="space-y-1">
              <li>• 40/30/30 Income Split Management</li>
              <li>• Budget Planning &amp; Tracking</li>
              <li>• Goal Setting &amp; Monitoring</li>
              <li>• Financial Health Dashboard</li>
              <li>• AI-Powered Financial Insights</li>
            </ul>
          </div>
          
          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Coming Soon</h3>
            <ul className="space-y-1">
              <li>• Plaid Bank Integrations</li>
              <li>• Gig Income Tracking</li>
              <li>• Affiliate Program Hub</li>
              <li>• Invoice Generator</li>
              <li>• Professional Services Marketplace</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Log In
          </button>
          <button className="px-4 py-2 bg-primary/10 text-primary rounded-md">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

// Mount the app
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
  console.log("FIREBASE-FREE: App mounted successfully");
} else {
  console.error("Root element not found");
}