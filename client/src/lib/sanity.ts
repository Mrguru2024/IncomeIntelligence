
import { createClient } from '@sanity/client';

const config = {
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Set to false for development
  ignoreBrowserTokenWarning: true // Suppress token warnings
};

export const client = createClient(config);
