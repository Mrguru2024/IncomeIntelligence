
import { createClient } from '@sanity/client';

const config = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '5enbinz3',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: true,
  perspective: 'published'
};

export const client = createClient(config);
