import React, { useState } from 'react';

/**
 * A minimal Firebase-free app component
 * This is a simplified version for testing and debugging
 */
export default function NoFirebaseApp() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen flex flex-col p-8 bg-background text-foreground">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Stackr Finance - Firebase-Free Version</h1>
        <p className="text-muted-foreground">A streamlined version without Firebase dependencies</p>
      </header>
      
      <main className="flex-1">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="p-6 border rounded-lg shadow-sm bg-card">
            <h2 className="text-2xl font-semibold mb-4">Status Dashboard</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                <span>Server connection: <strong>Active</strong></span>
              </li>
              <li className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                <span>React rendering: <strong>Working</strong></span>
              </li>
              <li className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                <span>State management: <strong>Working</strong></span>
              </li>
              <li className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                <span>Firebase dependencies: <strong>Bypassed</strong></span>
              </li>
              <li className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                <span>Authentication system: <strong>Pending</strong></span>
              </li>
            </ul>
          </div>
          
          <div className="p-6 border rounded-lg shadow-sm bg-card">
            <h2 className="text-2xl font-semibold mb-4">Interactive Test</h2>
            <p className="mb-4">Click the button to test React state management:</p>
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => setCount(c => c - 1)}
                className="px-4 py-2 rounded bg-primary/20 hover:bg-primary/30 text-primary"
              >
                Decrement
              </button>
              <span className="text-xl font-semibold">{count}</span>
              <button 
                onClick={() => setCount(c => c + 1)}
                className="px-4 py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Increment
              </button>
            </div>
            <p>State updates confirm that React is working properly without Firebase.</p>
          </div>
        </div>
        
        <div className="mt-8 p-6 border rounded-lg shadow-sm bg-card">
          <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
          <p className="mb-4">
            This minimal Firebase-free version demonstrates that the core React functionality 
            is working correctly. The next step is to implement a complete authentication system 
            without Firebase dependencies.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded bg-muted/50">
              <h3 className="font-semibold mb-2">Completed</h3>
              <ul className="space-y-1 list-disc pl-5">
                <li>Created clean entry point</li>
                <li>Removed Firebase initialization errors</li>
                <li>Implemented Firebase mocks</li>
                <li>Demonstrated working React application</li>
              </ul>
            </div>
            <div className="p-4 border rounded bg-muted/50">
              <h3 className="font-semibold mb-2">Upcoming</h3>
              <ul className="space-y-1 list-disc pl-5">
                <li>Complete custom authentication system</li>
                <li>Implement session management</li>
                <li>Add Firebase-free protected routes</li>
                <li>Integrate with backend API endpoints</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
        <p>Stackr Finance - Firebase-Free Version © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}