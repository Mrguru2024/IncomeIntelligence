import React from 'react';
import { Route, Switch } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/lib/protected-route';

// Import pages
import NotFound from '@/pages/not-found';
import AuthPage from '@/pages/auth-page';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import BudgetPlanner from '@/pages/BudgetPlanner';
import Goals from '@/pages/Goals';
import IncomeHub from '@/pages/IncomeHub';
import Expenses from '@/pages/Expenses';
import Profile from '@/pages/Profile';
import FinancialAdvice from '@/pages/FinancialAdvice';
import PricingPage from '@/pages/PricingPage';
import CheckoutPage from '@/pages/checkout-page';
import CheckoutSuccess from '@/pages/checkout-success';

// This is a completely clean implementation that doesn't rely on Firebase at all
function CleanApp() {
  const { user, isLoading } = useAuth();
  
  // While checking authentication status, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Authentication route */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Checkout routes */}
      <Route path="/pricing" component={PricingPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/checkout-success" component={CheckoutSuccess} />

      {/* Protected routes - requires authentication */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/budget" component={BudgetPlanner} />
      <ProtectedRoute path="/goals" component={Goals} />
      <ProtectedRoute path="/income" component={IncomeHub} />
      <ProtectedRoute path="/expenses" component={Expenses} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/advice" component={FinancialAdvice} />
      
      {/* 404 route - must be last */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default CleanApp;