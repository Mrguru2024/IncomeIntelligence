import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Simple minimal app to test if React is working
function MinimalApp() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-card shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">Stackr Finance</h1>
        
        <div className="text-center mb-4">
          <p className="text-muted-foreground mb-4">
            Welcome to Stackr Finance - The smart way to manage your money.
          </p>
          
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-primary mb-2">Firebase Removed Successfully</h2>
            <p className="text-sm text-muted-foreground">
              The application is now running completely without Firebase dependencies.
            </p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <button 
              className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition"
              onClick={() => console.log("Login button clicked")}
            >
              Login
            </button>
            
            <button 
              className="bg-card border border-input py-2 px-4 rounded-md hover:bg-accent transition"
              onClick={() => console.log("Register button clicked")}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Render the minimal app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MinimalApp />
  </React.StrictMode>
);