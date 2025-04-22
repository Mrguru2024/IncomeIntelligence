import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Import TestApp component
import TestApp from './TestApp';

// Add enhanced debugging
console.log("STARTUP: Simple application initialization beginning");

// Clean up any localStorage
if (typeof window !== 'undefined') {
  localStorage.removeItem('firebaseLocalStorage');
}

// Ensure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("ERROR: Root element #root not found in the DOM!");
} else {
  console.log("DOM: Root element found, rendering React application");
  
  // Wrap in try/catch to display any rendering errors
  try {
    // Create React root and render the app
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <TestApp />
      </React.StrictMode>
    );
    console.log("RENDER: TestApp rendered successfully");
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