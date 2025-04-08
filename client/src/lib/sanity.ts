import { createClient } from '@sanity/client';

// Get environment variables with fallbacks
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || '5enbinz3';
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03';
const token = import.meta.env.VITE_SANITY_TOKEN;

// Debug log for troubleshooting
console.log('Sanity Config (Actual Values):', {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token
});

const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: true,
};

export const client = createClient(sanityConfig);

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token
};