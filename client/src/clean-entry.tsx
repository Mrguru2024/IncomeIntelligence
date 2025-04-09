import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/use-auth";

// Basic fallback app component
function CleanApp() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-3xl font-bold text-center">Stackr</h1>
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded-md"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-md"
            >
              Sign In
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            <p>
              Don't have an account?{" "}
              <a href="#" className="text-primary hover:underline">
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Clean rendering without any problematic libraries
console.log("CLEAN-ENTRY: Starting application with no external dependencies");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("ROOT: Element not found");
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <CleanApp />
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </StrictMode>
    );
    console.log("CLEAN-ENTRY: Rendered successfully");
  } catch (error) {
    console.error("CLEAN-ENTRY ERROR:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: system-ui;">
        <h2 style="color: red;">Application Error</h2>
        <p>We encountered an error while loading the application.</p>
        <pre style="background: #f5f5f5; padding: 10px; overflow: auto; margin-top: 10px;">${
          error instanceof Error ? error.message : String(error)
        }</pre>
      </div>
    `;
  }
}