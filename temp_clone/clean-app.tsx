import React from 'react';
import ReactDOM from 'react-dom/client';

// Ultra minimal app with absolutely no dependencies
function UltraMinimalApp() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1rem',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#3b82f6' }}>
        Stackr Finance
      </h1>
      <div style={{ 
        width: '100%',
        maxWidth: '24rem',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          Welcome to Stackr
        </h2>
        <p style={{ marginBottom: '1rem' }}>
          Your financial tracker for service providers.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            style={{ 
              width: '100%',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
            onClick={() => console.log('Login clicked')}
          >
            Login
          </button>
          <button 
            style={{ 
              width: '100%',
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: '#3b82f6',
              border: '1px solid #3b82f6',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
            onClick={() => console.log('Register clicked')}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

// Mount directly to the DOM
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <UltraMinimalApp />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}