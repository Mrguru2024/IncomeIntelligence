
import { createClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET;
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION;
const token = import.meta.env.VITE_SANITY_TOKEN;

// Debug logging
console.log('Sanity Config:', {
  projectId,
  dataset,
  apiVersion,
  hasToken: !!token
});

if (!projectId || !dataset) {
  console.error('Required Sanity configuration missing:', {
    projectId: !!projectId,
    dataset: !!dataset
  });
}

export const client = createClient({
  projectId: projectId || '5enbinz3',
  dataset: dataset || 'production',
  apiVersion: apiVersion || '2024-01-01',
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
