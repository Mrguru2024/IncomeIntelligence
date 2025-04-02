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
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/income-history" component={IncomeHistory} />
      <Route path="/bank-connections" component={BankConnections} />
      <Route path="/goals" component={Goals} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen">
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex-1">
          <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">40/30/30</h1>
            <button 
              className="text-gray-600 hover:text-gray-900 p-2 rounded-md bg-gray-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </header>
          <Router />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
