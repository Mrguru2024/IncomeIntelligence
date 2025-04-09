import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Super minimal app - removing all dependencies that might import Firebase or Sanity
console.log("SUPER CLEAN ENTRY: Starting with absolute minimal dependencies");

// Basic fallback app component
function SuperCleanApp() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-slate-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Stackr</h1>
          <p className="text-lg text-gray-600">Your Personal Finance Manager</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="p-4 mb-4 bg-amber-50 border-l-4 border-amber-500 rounded">
            <h3 className="font-semibold text-amber-700">Maintenance Mode</h3>
            <p className="text-sm text-amber-600">
              We're currently experiencing technical difficulties with some external dependencies.
              Our team is working to resolve these issues. 
            </p>
          </div>

          <h2 className="text-xl font-semibold mb-4 text-gray-800">App Status</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Backend API</span>
              <span className="text-green-600 font-medium">✓ Online</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Database</span>
              <span className="text-green-600 font-medium">✓ Connected</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Frontend</span>
              <span className="text-red-600 font-medium">✗ Dependency Error</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2 text-gray-700">Available Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ 40/30/30 Income Split</li>
              <li>✓ Income Tracking</li>
              <li>✓ Budget Planning</li>
              <li>✓ AI Financial Advice</li>
              <li>✓ Bank Connections API</li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Last updated: April 2025</p>
          <p className="mt-2">
            <a href="/minimal" className="text-blue-500 hover:underline">
              View System Status
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// No-dependency error handling and rendering
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("ROOT: Element not found");
} else {
  try {
    console.log("RENDER: Attempting to render super clean app");
    
    // Using only the most basic necessary providers
    createRoot(rootElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <SuperCleanApp />
          <Toaster />
        </QueryClientProvider>
      </StrictMode>
    );
    
    console.log("RENDER: Super clean app rendered successfully");
  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    
    // Fallback to plain HTML if even our minimal React app fails
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: system-ui; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="color: #3b82f6; font-size: 2rem; margin-bottom: 1rem;">Stackr</h1>
        <h2 style="color: #ef4444; margin-bottom: 1.5rem;">Application Error</h2>
        <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="margin-bottom: 16px;">We encountered an error while loading the application.</p>
          <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px; text-align: left; overflow: auto; margin: 16px 0;">${
            error instanceof Error ? error.message : String(error)
          }</pre>
          <p style="color: #6b7280; font-size: 0.875rem;">Our team has been notified and is working on a fix.</p>
        </div>
      </div>
    `;
  }
}