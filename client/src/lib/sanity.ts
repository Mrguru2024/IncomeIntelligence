
import { createClient } from '@sanity/client';

if (!import.meta.env.VITE_SANITY_PROJECT_ID) {
  console.error('Missing VITE_SANITY_PROJECT_ID in environment');
}

export const client = createClient({
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  token: import.meta.env.VITE_SANITY_TOKEN
});
