/**
 * Complete mock for firebase/app
 */

console.log('[FIREBASE-MOCK] Loading firebase/app mock');

// Create a mock Firebase app object with all required properties and methods
const mockApp = {
  name: 'stackr-mock-app',
  options: {
    projectId: 'stackr-finance-mock',
    apiKey: 'mock-api-key-123456',
    authDomain: 'mock-auth-domain.example.com'
  },
  automaticDataCollectionEnabled: false
};

// Main exported function
export function initializeApp(config?: any) {
  console.log('[FIREBASE-MOCK] InitializeApp called from firebase/app with config:', config || 'default config');
  return mockApp;
}

// Export the firebase app instance
export const app = mockApp;

// Export additional properties for compatibility
export const apps = [mockApp];

// Default export for compatibility
export default {
  initializeApp,
  app: mockApp,
  apps: [mockApp]
};