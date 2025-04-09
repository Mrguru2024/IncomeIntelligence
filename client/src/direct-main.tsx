import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import "./index.css";

console.log("STACKR: Starting clean application build with no external dependencies");

// Temporary home page component
function HomePage() {
  return (
    <div className="min-h-screen p-8 flex flex-col">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-blue-600">Stackr</h1>
        <p className="text-lg text-gray-600">Your Personal Finance Manager</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Income Tracker</h2>
          <p className="text-gray-600 mb-4">Track and manage your income with our 40/30/30 split system.</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            View Income
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Budget Planner</h2>
          <p className="text-gray-600 mb-4">Plan your expenses and stay on track with financial goals.</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            View Budget
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Financial Advice</h2>
          <p className="text-gray-600 mb-4">Get AI-powered insights to improve your financial health.</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Get Advice
          </button>
        </div>
      </div>
    </div>
  );
}

// Clean authentication page
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create an account"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Or " : "Already have an account? "}
            <button 
              className="font-medium text-blue-600 hover:text-blue-500"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "create a new account" : "sign in"}
            </button>
          </p>
        </div>
        
        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLogin ? "Sign in" : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Simple not found page
function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl mt-4">Page not found</p>
      <a href="/" className="mt-8 text-blue-600 hover:underline">
        Return to homepage
      </a>
    </div>
  );
}

// Clean router without any problematic imports
function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

// Clean minimal app with no problematic dependencies
function CleanApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

// Render the app with proper error handling
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <CleanApp />
      </StrictMode>
    );
    console.log("STACKR: Application rendered successfully!");
  } catch (error) {
    console.error("Error rendering application:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; text-align: center;">
        <h1 style="color: #4338ca; font-size: 2rem;">Stackr</h1>
        <h2 style="color: #ef4444; margin: 1rem 0;">Application Error</h2>
        <div style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p>Sorry, we encountered an error while loading the application.</p>
          <pre style="background: #f5f5f5; padding: 16px; text-align: left; margin-top: 20px; border-radius: 4px; overflow: auto;">${
            error instanceof Error ? error.message : String(error)
          }</pre>
        </div>
      </div>
    `;
  }
}