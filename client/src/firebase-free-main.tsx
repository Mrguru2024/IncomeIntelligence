import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Simple mock of the firebase object to prevent errors
const mockFirebase = {
  initializeApp: () => ({
    name: 'mock-firebase-app',
    options: { 
      projectId: 'stackr-finance-mock',
      apiKey: 'mock-api-key',
      authDomain: 'mock-auth-domain'
    },
    automaticDataCollectionEnabled: false
  }),
  apps: [{ 
    name: 'mock-firebase-app',
    options: { 
      projectId: 'stackr-finance-mock',
      apiKey: 'mock-api-key',
      authDomain: 'mock-auth-domain'
    }
  }],
  setPersistence: () => Promise.resolve(),
  auth: () => ({
    signInWithEmailAndPassword: () => Promise.resolve({ user: null }),
    createUserWithEmailAndPassword: () => Promise.resolve({ user: null }),
    signOut: () => Promise.resolve(),
    onAuthStateChanged: (callback: (user: null) => void) => {
      callback(null);
      return () => {};
    },
    currentUser: null
  })
};

// Mock the firebase module globally
(window as any).firebase = mockFirebase;

// Create react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Render app
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

console.log("[firebase-free-main] Application started with mocked Firebase");