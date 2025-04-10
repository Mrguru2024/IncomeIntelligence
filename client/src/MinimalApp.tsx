import React from 'react';
import { Switch, Route } from 'wouter';
import NotFound from '@/pages/not-found';
import AuthPage from '@/pages/fresh-auth-page';

const MinimalApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
};

// A very simple HomePage component just to test rendering
const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">Stackr Finance</h1>
      <p className="text-xl mb-8 text-center">
        The smarter way to track your income and expenses
      </p>
      <a 
        href="/auth" 
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Go to Login
      </a>
    </div>
  )
};

export default MinimalApp;