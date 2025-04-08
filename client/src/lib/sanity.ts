
import { createClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET;
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION;
const token = import.meta.env.VITE_SANITY_TOKEN;

console.log('Sanity Config:', {
  projectId,
  dataset,
  apiVersion,
  token: token ? '[PRESENT]' : '[MISSING]'
});

if (!projectId) {
  throw new Error('Missing VITE_SANITY_PROJECT_ID');
}

export const client = createClient({
  projectId,
  dataset: dataset || 'production',
  apiVersion: apiVersion || '2024-01-01',
  token,
  useCdn: true
});
