import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";

// A minimal app component for testing
function CleanApp() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simple initialization effect
  useEffect(() => {
    console.log("Clean App initializing...");
    
    // Simulate loading process
    const timer = setTimeout(() => {
      setInitialized(true);
      setLoading(false);
      console.log("Clean App initialized successfully");
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
          <h1 className="text-xl font-semibold">
            Loading Stackr Finance...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6">Stackr Finance</h1>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Stackr</h2>
        <p className="mb-4">Your financial tracker for service providers.</p>
        <div className="space-y-4">
          <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Login
          </button>
          <button className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default CleanApp;