
import { createClient } from '@sanity/client';

if (!import.meta.env.VITE_SANITY_PROJECT_ID) {
  console.error('Missing Sanity Project ID');
}

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: true
});
