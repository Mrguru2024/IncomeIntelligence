
import { createClient } from '@sanity/client';

// Log environment variables for debugging
console.log('Sanity Project ID:', import.meta.env.VITE_SANITY_PROJECT_ID);

// Create Sanity client with environment variables
export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: false
});

export default client;
