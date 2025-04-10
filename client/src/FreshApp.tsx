import React from 'react';
import { Switch, Route } from 'wouter';
import { useFreshAuth } from '@/hooks/use-fresh-auth';
import HomePage from '@/pages/Dashboard';
import AuthPage from '@/pages/fresh-auth-page';
import ProtectedRoute from '@/lib/fresh-protected-route';
import NotFound from '@/pages/not-found';

const FreshApp: React.FC = () => {
  const { isLoading } = useFreshAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/dashboard" component={HomePage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
};

export default FreshApp;