
import { createClient } from '@sanity/client';

const config = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: import.meta.env.NODE_ENV === 'production'
};

// Validate required configuration
if (!config.projectId) {
  throw new Error('VITE_SANITY_PROJECT_ID environment variable is required');
}

if (!config.dataset) {
  throw new Error('VITE_SANITY_DATASET environment variable is required');
}

export const client = createClient(config);
