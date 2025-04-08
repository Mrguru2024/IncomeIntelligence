
import { createClient } from '@sanity/client';

const config = {
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true,
  perspective: 'published'
};

export const client = createClient(config);
