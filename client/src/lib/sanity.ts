
import { createClient } from '@sanity/client';

// Debug log to check environment variable
console.log('Sanity Project ID:', import.meta.env.VITE_SANITY_PROJECT_ID);

// Create Sanity client using environment variable
const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '5enbinz3', // Fallback for safety
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true,
  perspective: 'published',
  ignoreBrowserTokenWarning: true
});

export default client;
