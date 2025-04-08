
import { createClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || '5enbinz3';
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01';
const token = import.meta.env.VITE_SANITY_TOKEN;

if (!projectId) {
  throw new Error('Sanity Project ID is required');
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token
});
