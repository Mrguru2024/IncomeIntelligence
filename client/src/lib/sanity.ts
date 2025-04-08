
import { createClient } from '@sanity/client';

// Create Sanity client with hardcoded configuration for development
const client = createClient({
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true,
  perspective: 'published',
  ignoreBrowserTokenWarning: true
});

export default client;
