
// Import directly from our mock module
// This is a safer approach than trying to use the real Sanity client 
// directly since the mock is designed to work without configuration
import { createClient } from './mocks/sanity-client';

// Safe Sanity config with hard-coded values
// We're using the actual values from the .env file
const sanityConfig = {
  projectId: '5enbinz3',  // Hardcoded from .env to ensure it's always available
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: true,
};

// Log Sanity config state
console.log('Using Sanity client with hardcoded project ID');

// Create and export the client
export const client = createClient(sanityConfig);
export { sanityConfig };
