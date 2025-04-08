
import { createClient } from '@sanity/client';

if (!import.meta.env.VITE_SANITY_PROJECT_ID && process.env.NODE_ENV === 'development') {
  console.warn('VITE_SANITY_PROJECT_ID is not defined');
}

export const client = createClient({
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: true,
});
