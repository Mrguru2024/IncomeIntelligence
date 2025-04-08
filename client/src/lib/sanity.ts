
import { createClient } from '@sanity/client';

// Ensure we have environment variables
const requiredEnvVars = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  token: import.meta.env.VITE_SANITY_TOKEN
};

// Log environment variables for debugging
console.log('Sanity Environment Variables:', {
  ...requiredEnvVars,
  token: requiredEnvVars.token ? '[PRESENT]' : '[MISSING]'
});

// Verify required config
if (!requiredEnvVars.projectId) {
  throw new Error('Missing VITE_SANITY_PROJECT_ID environment variable');
}

// Create client with verified config
export const client = createClient({
  projectId: requiredEnvVars.projectId,
  dataset: requiredEnvVars.dataset || 'production',
  apiVersion: requiredEnvVars.apiVersion || '2023-05-03',
  token: requiredEnvVars.token,
  useCdn: true,
  perspective: 'published'
});
