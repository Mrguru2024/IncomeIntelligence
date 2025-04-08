
import { createClient } from '@sanity/client';

// Debug logging to verify environment variables
console.log("Loaded Sanity ENV Vars:", {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '5enbinz3',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  version: import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03'
});

const defaultConfig = {
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: '',
  useCdn: true,
  perspective: 'published',
  ignoreBrowserTokenWarning: true
};

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || defaultConfig.projectId,
  dataset: import.meta.env.VITE_SANITY_DATASET || defaultConfig.dataset,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || defaultConfig.apiVersion,
  token: import.meta.env.VITE_SANITY_TOKEN || defaultConfig.token,
  useCdn: defaultConfig.useCdn,
  perspective: defaultConfig.perspective,
  ignoreBrowserTokenWarning: defaultConfig.ignoreBrowserTokenWarning
});
