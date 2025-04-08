
import { createClient } from '@sanity/client';

// For debugging
console.log('Sanity Config:', {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  token: import.meta.env.VITE_SANITY_TOKEN ? 'Present' : 'Missing'
});

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || '5enbinz3';

if (!projectId) {
  throw new Error('Sanity Project ID is required');
}

export const client = createClient({
  projectId,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: true
});
