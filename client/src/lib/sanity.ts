import { createClient } from '@sanity/client';

if (!import.meta.env.VITE_SANITY_PROJECT_ID) {
  throw new Error('VITE_SANITY_PROJECT_ID is required');
}

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: false,
  perspective: 'published'
});

export default client;