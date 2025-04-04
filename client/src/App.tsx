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
import Sidebar from "@/components/Sidebar";
import VoiceCommandWidget from "@/components/VoiceCommandWidget";
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
      <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden">
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex-1 flex flex-col w-full max-w-[100vw]">
          <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-[100] w-full">
            <h1 className="text-xl font-semibold text-gray-800">40/30/30</h1>
            <button 
              className="text-gray-600 hover:text-gray-900 p-3 rounded-md bg-gray-100 flex items-center justify-center cursor-pointer active:bg-gray-200 touch-manipulation relative z-[300]"
              onClick={() => {
                console.log("Hamburger menu clicked");
                setMobileMenuOpen(true);
              }}
              type="button"
              style={{ touchAction: "manipulation" }}
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </header>
          <main className="flex-1 w-full overflow-x-hidden max-w-[100vw]">
            <Router />
          </main>
        </div>
        <VoiceCommandWidget />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
