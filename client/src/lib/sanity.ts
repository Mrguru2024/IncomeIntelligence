
import { createClient } from '@sanity/client';

// Ensure environment variables are properly loaded
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || '5enbinz3';
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01';
const token = import.meta.env.VITE_SANITY_TOKEN;

// Debug logging
console.log('Sanity Config Debug:', {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token
});

// Create client with fallback values
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  ignoreBrowserTokenWarning: true
});

// Export config for testing
export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token
};
