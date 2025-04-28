import React, { useState } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { useFreshAuth } from '@/hooks/use-fresh-auth';
import HomePage from '@/pages/Dashboard';
import IncomeHistory from '@/pages/IncomeHistory';
import BankConnections from '@/pages/BankConnections';
import Goals from '@/pages/Goals';
import BudgetPlanner from '@/pages/BudgetPlanner';
import Expenses from '@/pages/Expenses';
import FinancialAdvice from '@/pages/FinancialAdvice';
import MoneyMentorPage from '@/pages/MoneyMentorPage';
import Profile from '@/pages/Profile';
import AuthPage from '@/pages/fresh-auth-page';
import ProtectedRoute from '@/lib/fresh-protected-route';
import NotFound from '@/pages/not-found';
import Sidebar from '@/components/Sidebar';
import VoiceCommandWidget from '@/components/VoiceCommandWidget';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Icons } from '@/components/ui/icons';

const FreshApp: React.FC = () => {
  const { isLoading } = useFreshAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  
  const isAuthPage = location === "/auth";
  const isFullScreenPage = isAuthPage;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Router component to isolate routing logic
  const Router = () => (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/dashboard" component={HomePage} />
      <ProtectedRoute path="/income-history" component={IncomeHistory} />
      <ProtectedRoute path="/expenses" component={Expenses} />
      <ProtectedRoute path="/bank-connections" component={BankConnections} />
      <ProtectedRoute path="/goals" component={Goals} />
      <ProtectedRoute path="/budget-planner" component={BudgetPlanner} />
      <ProtectedRoute path="/financial-advice" component={FinancialAdvice} />
      <ProtectedRoute path="/money-mentor" component={MoneyMentorPage} />
      <ProtectedRoute path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isFullScreenPage ? (
        <main className="w-full">
          <Router />
        </main>
      ) : (
        <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden">
          <Sidebar
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
          <div className="flex-1 flex flex-col w-full max-w-[100vw]">
            <header className="lg:hidden bg-card-background border-b border-border p-4 flex items-center justify-between sticky top-0 z-[100] w-full">
              <h1 className="text-xl font-semibold text-foreground">
                Stackr
              </h1>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <button
                  className="text-foreground hover:bg-accent active:bg-muted p-2 rounded-md bg-muted-background flex items-center justify-center cursor-pointer relative z-[300] transition-colors duration-200"
                  onClick={() => {
                    setMobileMenuOpen(true);
                  }}
                  type="button"
                  style={{
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent", // Remove tap highlight on mobile
                  }}
                  aria-label="Open menu"
                >
                  <div className="p-1">
                    <Icons.menu className="h-6 w-6" />
                  </div>
                </button>
              </div>
            </header>
            <main className="flex-1 w-full overflow-x-hidden max-w-[100vw]">
              <Router />
            </main>
          </div>
          <VoiceCommandWidget />
        </div>
      )}
    </div>
  );
};

export default FreshApp;