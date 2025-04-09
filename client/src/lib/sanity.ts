
// Import directly from our mock module
// This is a safer approach than trying to use the real Sanity client 
// directly since the mock is designed to work without configuration
import { createClient } from './mocks/sanity-client';

// Get config from window.env if available, or use hardcoded fallbacks
// This ensures we'll have values even if environment variables aren't accessible
const getConfig = () => {
  // Try to use the window.env values first (set in index.html)
  if (typeof window !== 'undefined' && window.env) {
    return {
      projectId: window.env.VITE_SANITY_PROJECT_ID,
      dataset: window.env.VITE_SANITY_DATASET,
      apiVersion: window.env.VITE_SANITY_API_VERSION,
      useCdn: true,
    };
  }
  
  // Fallback to hardcoded values if window.env is not available
  return {
    projectId: '5enbinz3',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: true,
  };
};

// Get the configuration
const sanityConfig = getConfig();

// Log the configuration
console.log('Using Sanity client with config:', sanityConfig);

// Create and export the client with the configuration
export const client = createClient(sanityConfig);
export { sanityConfig };
