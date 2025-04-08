
import { createClient } from '@sanity/client';

// Debug logging to verify environment variables
console.log("Loaded Sanity ENV Vars:", {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  version: import.meta.env.VITE_SANITY_API_VERSION
});

const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '5enbinz3',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03',
  token: import.meta.env.VITE_SANITY_TOKEN || '',
  useCdn: true,
  perspective: 'published',
  ignoreBrowserTokenWarning: true
});

export default client;
