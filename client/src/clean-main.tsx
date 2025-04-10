import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Absolute minimal entry point with no dependencies
console.log('Super clean main entry point loaded - no extra dependencies');

// Import just our minimal clean component
import CleanApp from './CleanApp';

// Render directly without any providers or extra dependencies
const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <CleanApp />
      </React.StrictMode>
    );
    console.log("Clean App rendered successfully");
  } catch (error) {
    console.error("Error rendering app:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: system-ui, sans-serif;">
        <h2>Application Error</h2>
        <p>Sorry, something went wrong while loading the application.</p>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
}