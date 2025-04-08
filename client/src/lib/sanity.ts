
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'stackr-19160',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-02-25',
});

export default client;
