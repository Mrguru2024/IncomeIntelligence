
import { createClient } from '@sanity/client';

// Ensure environment variables are properly loaded
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET;
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION;
const token = import.meta.env.VITE_SANITY_TOKEN;

// Validate required configuration
if (!projectId) {
  throw new Error('VITE_SANITY_PROJECT_ID is not defined');
}

if (!dataset) {
  throw new Error('VITE_SANITY_DATASET is not defined');
}

// Create client with validated config
export const client = createClient({
  projectId,
  dataset,
  apiVersion: apiVersion || '2023-05-03',
  token,
  useCdn: true,
});
