import React from 'react';
import { createRoot } from 'react-dom/client';
import SimpleApp from './SimpleApp';

console.log('Loading minimal React app');

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <SimpleApp />
    </React.StrictMode>
  );
  console.log('Simple app rendered');
} else {
  console.error('Root element not found');
}