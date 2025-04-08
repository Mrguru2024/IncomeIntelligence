import { createClient } from '@sanity/client';

// Log environment variables for debugging.  Note that the structure is slightly altered due to the edited code's approach.
console.log('Sanity Environment Variables:', {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  token: import.meta.env.VITE_SANITY_TOKEN ? '[PRESENT]' : '[MISSING]'
});

// Ensure environment variables are properly typed
const sanityConfig = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '5enbinz3',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: true,
  perspective: 'published'
};

// Debug log
console.log('Sanity Config:', {
  ...sanityConfig,
  token: sanityConfig.token ? '[PRESENT]' : '[MISSING]'
});

// Create client with direct config object
export const client = createClient(sanityConfig);