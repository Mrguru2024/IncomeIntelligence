import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import IncomeHistory from "@/pages/IncomeHistory";
import BankConnections from "@/pages/BankConnections";
import Goals from "@/pages/Goals";
import Settings from "@/pages/Settings";
import BudgetPlanner from "@/pages/BudgetPlanner";
import VoiceCommands from "@/pages/VoiceCommands";
import Expenses from "@/pages/Expenses";
import FinancialAdvice from "@/pages/FinancialAdvice";
import Profile from "@/pages/Profile";
import Reminders from "@/pages/Reminders";
import AuthPage from "@/pages/auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import TwoFactorAuthPage from "@/pages/TwoFactorAuthPage";
import SubscribePage from "@/pages/subscribe-page";
import SubscriptionPage from "@/pages/subscription-page";
import CheckoutPage from "@/pages/checkout-page";
import CheckoutSuccessPage from "@/pages/checkout-success";
import IncomeHub from "@/pages/IncomeHub";
import PricingPage from "@/pages/PricingPage";
import StackrGigs from "@/pages/income/StackrGigs";
import Sidebar from "@/components/Sidebar";
import VoiceCommandWidget from "@/components/VoiceCommandWidget";
import AppTutorial from "@/components/AppTutorial";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/hooks/useTheme";
import { useState } from "react";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  const [location] = useLocation();

  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/income-history" component={IncomeHistory} />
      <ProtectedRoute path="/expenses" component={Expenses} />
      <ProtectedRoute path="/bank-connections" component={BankConnections} />
      <ProtectedRoute path="/goals" component={Goals} />
      <ProtectedRoute path="/budget-planner" component={BudgetPlanner} />
      <ProtectedRoute path="/financial-advice" component={FinancialAdvice} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/reminders" component={Reminders} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/security" component={TwoFactorAuthPage} />
      <ProtectedRoute
        path="/voice-commands"
        component={() => <VoiceCommands />}
      />
      <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      <ProtectedRoute path="/subscribe" component={SubscribePage} />
      <ProtectedRoute path="/subscription" component={SubscriptionPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute
        path="/checkout/success"
        component={CheckoutSuccessPage}
      />
      <ProtectedRoute path="/income-hub" component={IncomeHub} />
      <ProtectedRoute path="/pricing" component={PricingPage} />
      <ProtectedRoute path="/income-hub/gigs" component={StackrGigs} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const isAuthPage = location === "/auth";
  const isOnboardingPage = location === "/onboarding";
  const isFullScreenPage = isAuthPage || isOnboardingPage;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="3" y1="12" x2="21" y2="12"></line>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                      </div>
                    </button>
                  </div>
                </header>
                <main className="flex-1 w-full overflow-x-hidden max-w-[100vw]">
                  <Router />
                </main>
              </div>
              <VoiceCommandWidget />
              <AppTutorial />
            </div>
          )}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
