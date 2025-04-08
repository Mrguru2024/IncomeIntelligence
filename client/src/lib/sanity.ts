
import { createClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET;
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION;
const token = import.meta.env.VITE_SANITY_TOKEN;

if (!projectId) {
  console.error('Sanity Project ID is missing');
}

export const client = createClient({
  projectId: projectId || '5enbinz3',
  dataset: dataset || 'production',
  apiVersion: apiVersion || '2023-05-03',
  token: token,
  useCdn: true,
  perspective: 'published',
  ignoreBrowserTokenWarning: true
});
