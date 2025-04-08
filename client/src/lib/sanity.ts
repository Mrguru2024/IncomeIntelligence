
import { createClient } from '@sanity/client';

// Debug logging to verify environment variables
console.log('Sanity Config Debug:', {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  token: import.meta.env.VITE_SANITY_TOKEN?.substring(0, 8) + '...'
});

const sanityProjectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const sanityDataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const sanityApiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03';
const sanityToken = import.meta.env.VITE_SANITY_TOKEN;

if (!sanityProjectId) {
  throw new Error('Missing VITE_SANITY_PROJECT_ID – check .env or Secrets tab.');
}

export const client = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  token: sanityToken,
  useCdn: true,
  perspective: 'published',
});
