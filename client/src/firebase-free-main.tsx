import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("[FIREBASE-FREE] Loading Firebase-free main entry point");

// Initialize the application without any Firebase dependencies
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log("[FIREBASE-FREE] Application rendered successfully");