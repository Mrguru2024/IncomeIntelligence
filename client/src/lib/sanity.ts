
import { createClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET;
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION;
const token = import.meta.env.VITE_SANITY_TOKEN;

if (!projectId) {
  console.error('Sanity Project ID is missing from environment variables');
}

if (!dataset) {
  console.error('Sanity Dataset is missing from environment variables');
}

export const client = createClient({
  projectId: projectId || '5enbinz3',
  dataset: dataset || 'production',
  apiVersion: apiVersion || '2024-01-01',
  useCdn: false,
  token
});
