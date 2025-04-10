import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import './index.css';

// Import our completely Firebase-free App component
import FirebaseFreeApp from './firebase-free-app';

// Add enhanced debugging
console.log("[CLEAN] Loading completely Firebase-free application");

// Get the root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("ERROR: Root element #root not found in the DOM!");
} else {
  console.log("DOM: Root element found, rendering React application");
  
  // Create React root and render the app with all providers
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <FirebaseFreeApp />
      </QueryClientProvider>
    </React.StrictMode>
  );
  
  console.log("[CLEAN] Firebase-free application rendered successfully");
}