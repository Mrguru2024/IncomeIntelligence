
import { createClient } from '@sanity/client';

// Ensure environment variables are properly loaded
const projectId = process.env.NODE_ENV === 'production' 
  ? '5enbinz3'  // Production fallback
  : import.meta.env.VITE_SANITY_PROJECT_ID || '5enbinz3';

const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01';
const token = import.meta.env.VITE_SANITY_TOKEN;

// Debug logging
console.log('Sanity Config:', {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token,
  env: import.meta.env.MODE
});

// Create client with strict validation
if (!projectId) {
  throw new Error('Sanity projectId is required');
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  ignoreBrowserTokenWarning: true
});

// Export config for testing
export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token
};
