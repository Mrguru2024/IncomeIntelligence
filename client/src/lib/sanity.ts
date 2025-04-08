
import { createClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET;
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION;

if (!projectId) {
  console.error('Sanity Project ID is missing. Check your environment variables.');
}

const client = createClient({
  projectId: projectId || '5enbinz3',
  dataset: dataset || 'production',
  apiVersion: apiVersion || '2023-05-03',
  useCdn: true,
  perspective: 'published',
  ignoreBrowserTokenWarning: true
});

export default client;
