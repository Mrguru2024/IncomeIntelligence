
import { createClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET;
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION;
const token = import.meta.env.VITE_SANITY_TOKEN;

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: true,
};

// Debug log for troubleshooting
console.log('Sanity Config:', {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token
});

if (!projectId || !dataset || !apiVersion || !token) {
  throw new Error('Missing required Sanity configuration. Check environment variables.');
}

export const client = createClient(sanityConfig);
