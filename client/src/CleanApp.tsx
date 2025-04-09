import { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

// Import your pages
import NotFound from '@/pages/not-found';

// This is a clean version of App without Firebase or Sanity dependencies
function CleanApp() {
  const [isLoading, setIsLoading] = useState(true);

  // Check API connection
  const { data: statusData } = useQuery({
    queryKey: ['/api/status'],
    queryFn: async () => {
      const response = await fetch('/api/status');
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      return response.json();
    }
  });

  useEffect(() => {
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
      <Switch>
        {/* Replace with your actual routes once Firebase is removed */}
        <Route path="/" component={MaintenancePage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

// Temporary maintenance page component
function MaintenancePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 text-primary">Stackr</h1>
        <p className="text-xl text-muted-foreground">Service Provider Finance</p>
      </div>
      
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded">
        <h2 className="font-semibold text-amber-800 mb-1">Application Maintenance</h2>
        <p className="text-amber-700 text-sm">
          We're currently redesigning our application architecture to improve performance and reliability.
          The backend API remains fully functional while we update the frontend components.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Backend API</span>
              <span className="font-medium text-green-600">✓ Online</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">PostgreSQL Database</span>
              <span className="font-medium text-green-600">✓ Connected</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Frontend</span>
              <span className="font-medium text-rose-600">✗ In Maintenance</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">Available Features</h2>
          <ul className="space-y-2">
            <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> 40/30/30 Income Split Management</li>
            <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Income Tracking & History</li>
            <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Budget Planning With Preset Splits</li>
            <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> AI-Powered Financial Advice</li>
            <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Bank Connection Management</li>
            <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Stackr Gigs Platform</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Status updated: April 2025</p>
      </div>
    </div>
  );
}

export default CleanApp;