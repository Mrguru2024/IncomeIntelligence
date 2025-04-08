
import { createClient } from '@sanity/client';

// Validate environment variables
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET;
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION;
const token = import.meta.env.VITE_SANITY_TOKEN;

// Debug log to verify values
console.log('Sanity Environment Variables:', {
  projectId,
  dataset,
  apiVersion,
  token: token ? 'Present' : 'Missing'
});

if (!projectId || !dataset || !apiVersion || !token) {
  console.error('Sanity Configuration Error:', {
    hasProjectId: !!projectId,
    hasDataset: !!dataset,
    hasApiVersion: !!apiVersion,
    hasToken: !!token,
  });
  throw new Error('Missing required Sanity configuration. Check environment variables.');
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  ignoreBrowserTokenWarning: true
});

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token
};
