
import { createClient } from '@sanity/client';

// Ensure environment variables are properly loaded
const sanityConfig = {
  projectId: '5enbinz3', // Hardcoded from your .env
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: false
};

if (!sanityConfig.projectId) {
  console.error('Missing Sanity project ID');
}

export const client = createClient(sanityConfig);

export default client;
