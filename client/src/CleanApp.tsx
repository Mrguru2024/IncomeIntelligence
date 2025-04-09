import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

// Import clean pages (no Firebase dependencies)
import AuthPage from '@/pages/auth-page';
import Dashboard from '@/pages/Dashboard';
import IncomeHub from '@/pages/IncomeHub';
import BudgetPlanner from '@/pages/BudgetPlanner';
import Goals from '@/pages/Goals';
import FinancialAdvice from '@/pages/FinancialAdvice';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/not-found';
import { Loader2 } from 'lucide-react';

// Import clean layout components
import { MainLayout } from '@/components/layouts/main-layout';
import { ProtectedRoute } from '@/lib/protected-route';

export default function CleanApp() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-xl">Loading Stackr Finance...</span>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth">
        {user ? <Dashboard /> : <AuthPage />}
      </Route>

      {/* Protected routes */}
      <ProtectedRoute 
        path="/"
        component={() => (
          <MainLayout>
            <Dashboard />
          </MainLayout>
        )}
      />
      
      <ProtectedRoute 
        path="/income"
        component={() => (
          <MainLayout>
            <IncomeHub />
          </MainLayout>
        )}
      />
      
      <ProtectedRoute 
        path="/budget"
        component={() => (
          <MainLayout>
            <BudgetPlanner />
          </MainLayout>
        )}
      />
      
      <ProtectedRoute 
        path="/goals"
        component={() => (
          <MainLayout>
            <Goals />
          </MainLayout>
        )}
      />
      
      <ProtectedRoute 
        path="/advice"
        component={() => (
          <MainLayout>
            <FinancialAdvice />
          </MainLayout>
        )}
      />
      
      <ProtectedRoute 
        path="/settings"
        component={() => (
          <MainLayout>
            <Settings />
          </MainLayout>
        )}
      />

      {/* 404 route */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}