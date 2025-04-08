
import { createClient } from '@sanity/client';

// Create Sanity client with complete configuration
const client = createClient({
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true, // Enable CDN caching for better performance
  perspective: 'published'
});

export default client;
