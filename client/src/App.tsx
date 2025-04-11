import { Switch, Route, useLocation } from "wouter";
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
import SubscriptionBenefits from "@/pages/SubscriptionBenefits";
import CheckoutPage from "@/pages/checkout-page";
import CheckoutSuccessPage from "@/pages/checkout-success";
import IncomeHub from "@/pages/IncomeHub";
import PricingPage from "@/pages/PricingPage";
import StackrGigs from "@/pages/income/StackrGigs";
import Sidebar from "@/components/Sidebar";
import VoiceCommandWidget from "@/components/VoiceCommandWidget";
import AppTutorial from "@/components/AppTutorial";
import AdminTutorial from "@/components/AdminTutorial";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "./lib/protected-route";
import { Icons } from "@/components/ui/icons";

// Firebase-free router component
function Router() {
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
      <ProtectedRoute path="/voice-commands" component={VoiceCommands} />
      <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      <ProtectedRoute path="/subscribe-page" component={SubscribePage} />
      <ProtectedRoute path="/subscription" component={SubscriptionPage} />
      <ProtectedRoute path="/subscription-benefits" component={SubscriptionBenefits} />
      <ProtectedRoute path="/checkout-page" component={CheckoutPage} />
      <ProtectedRoute path="/checkout-success" component={CheckoutSuccessPage} />
      <ProtectedRoute path="/income-hub" component={IncomeHub} />
      <ProtectedRoute path="/pricing" component={PricingPage} />
      <ProtectedRoute path="/income-hub/gigs" component={StackrGigs} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Main App component (Firebase-free)
function App() {
  const [initialized, setInitialized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simple initialization effect
  useEffect(() => {
    console.log("App initializing...");
    
    // Simulate loading process
    const timer = setTimeout(() => {
      setInitialized(true);
      setLoading(false);
      console.log("App initialized successfully");
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
          <h1 className="text-xl font-semibold text-foreground">
            Loading Stackr Finance...
          </h1>
        </div>
      </div>
    );
  }

  const [location] = useLocation();
  const isAuthPage = location === "/auth";
  const isOnboardingPage = location === "/onboarding";
  const isFullScreenPage = isAuthPage || isOnboardingPage;

  // Function to navigate to GREEN version
  const goToGreenVersion = () => {
    window.location.href = '/green';
  };

  return (
    <>
      {/* GREEN Version Banner */}
      <div className="bg-green-600 text-white text-center p-2 flex items-center justify-center cursor-pointer" onClick={goToGreenVersion}>
        <span className="mr-2 font-bold">⚠️ Firebase Issues?</span>
        <span className="hidden sm:inline">Try our 100% Firebase-free</span>
        <button className="ml-2 bg-white text-green-600 px-3 py-1 rounded-md font-bold text-sm">
          GREEN Version
        </button>
      </div>
      
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
          <AppTutorial />
          <AdminTutorial />
        </div>
      )}
    </>
  );
}

export default App;