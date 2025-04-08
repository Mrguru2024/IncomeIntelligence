
import { createClient } from '@sanity/client';

// Ensure environment variables are properly loaded
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET;
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION;
const token = import.meta.env.VITE_SANITY_TOKEN;

// Debug logging
console.log('Sanity Config:', {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token,
  env: import.meta.env.MODE
});

if (!projectId) {
  throw new Error('VITE_SANITY_PROJECT_ID is required - please check your environment variables');
}

export const client = createClient({
  projectId,
  dataset: dataset || 'production',
  apiVersion: apiVersion || '2024-01-01',
  useCdn: false,
  token,
  ignoreBrowserTokenWarning: true
});

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token
};
