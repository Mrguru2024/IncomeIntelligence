import { Switch, Route } from "wouter";
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
import Sidebar from "@/components/Sidebar";
import VoiceCommandWidget from "@/components/VoiceCommandWidget";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/hooks/useTheme";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/income-history" component={IncomeHistory} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/bank-connections" component={BankConnections} />
      <Route path="/goals" component={Goals} />
      <Route path="/budget-planner" component={BudgetPlanner} />
      <Route path="/financial-advice" component={FinancialAdvice} />
      <Route path="/profile" component={Profile} />
      <Route path="/reminders" component={Reminders} />
      <Route path="/settings" component={Settings} />
      <Route path="/voice-commands" component={VoiceCommands} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden">
          <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
          <div className="flex-1 flex flex-col w-full max-w-[100vw]">
            <header className="lg:hidden bg-card-background border-b border-border p-4 flex items-center justify-between sticky top-0 z-[100] w-full">
              <h1 className="text-xl font-semibold text-foreground">40/30/30</h1>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <button 
                  className="text-foreground hover:bg-accent active:bg-muted p-2 rounded-md bg-muted-background flex items-center justify-center cursor-pointer relative z-[300] transition-colors duration-200"
                  onClick={() => {
                    console.log("Hamburger menu clicked");
                    setMobileMenuOpen(true);
                  }}
                  type="button"
                  style={{ 
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent" // Remove tap highlight on mobile
                  }}
                  aria-label="Open menu"
                >
                  <div className="p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        </div>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
