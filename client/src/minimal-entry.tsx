import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Route, Switch } from 'wouter';
import { Button } from '@/components/ui/button';
import { CircleDollarSign, CheckCircle, ArrowRightCircle } from 'lucide-react';
import './index.css';

// Configure the query client for API requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Basic minimal app with no Firebase or auth dependencies
function MinimalApp() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Switch>
        <Route path="/">
          <LandingPage />
        </Route>
        <Route path="*">
          <NotFoundPage />
        </Route>
      </Switch>
      <Toaster />
    </div>
  );
}

// Landing page component
function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Stackr</span>
          </div>
          <nav className="flex items-center gap-4">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
            <Button variant="outline" asChild>
              <a href="/auth" className="font-medium">Log In</a>
            </Button>
            <Button asChild>
              <a href="/auth?tab=register" className="font-medium">Sign Up</a>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container flex flex-col items-center text-center">
          <div className="mb-6 inline-block rounded-full bg-muted px-3 py-1 text-sm">
            Financial tracking reimagined
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Take control of your <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">finances</span>
          </h1>
          <p className="max-w-[42rem] text-muted-foreground text-xl mb-12">
            Stackr helps service providers track income, manage budgets, and reach financial goals with smart insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <a href="/auth?tab=register">Get Started</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="40/30/30 Income Split" 
              description="Automatically split your income for Needs, Investments, and Savings with customizable ratios."
            />
            <FeatureCard 
              title="Financial Insights" 
              description="Get AI-powered advice based on your spending patterns and income history."
            />
            <FeatureCard 
              title="Multiple Income Streams" 
              description="Track and manage all your revenue sources in one place with detailed analytics."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-20">
        <div className="container flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="max-w-[42rem] text-muted-foreground text-xl mb-12">
            Join thousands of service providers who use Stackr to manage their finances.
          </p>
          <Button size="lg" asChild>
            <a href="/auth?tab=register">Create an Account</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-auto">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <CircleDollarSign className="h-5 w-5 text-primary" />
            <span className="font-medium">Stackr Finance</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Stackr. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Feature card component
function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-background rounded-lg border border-border/40 p-6">
      <div className="mb-4 rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
        <CheckCircle className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

// 404 page component
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild>
        <a href="/" className="flex items-center gap-2">
          <ArrowRightCircle className="h-4 w-4" />
          Back to Home
        </a>
      </Button>
    </div>
  );
}

// Ensure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("ERROR: Root element #root not found in the DOM!");
} else {
  console.log("DOM: Root element found, rendering minimal React application");
  
  // Wrap in try/catch to display any rendering errors
  try {
    // Create React root and render the app
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <MinimalApp />
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log("RENDER: Minimal app rendered successfully");
  } catch (error) {
    console.error("CRITICAL ERROR rendering app:", error);
    
    // Display a fallback error message in the DOM
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: system-ui, sans-serif;">
        <h2>Application Error</h2>
        <p>Sorry, something went wrong while loading the application.</p>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
}