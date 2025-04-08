
import { createClient } from '@sanity/client';

const config = {
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  token: import.meta.env.VITE_SANITY_TOKEN
};

export const client = createClient(config);
