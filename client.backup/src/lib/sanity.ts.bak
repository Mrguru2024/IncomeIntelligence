
/**
 * Direct import of our mock Sanity client
 * 
 * We don't use the real '@sanity/client' at all to avoid configuration errors
 * Instead, we use our fully mocked implementation that includes sample data
 */
import { createClient, type MockClient } from './mocks/sanity-client';

// Simple configuration - no project ID needed for our mock client
const sanityConfig = {
  // Empty configuration - our mock doesn't need these values
  projectId: 'mock-project-id',
  dataset: 'mock-dataset',
  apiVersion: '2024-01-01',
  useCdn: true,
};

// Create and export the client
export const client: MockClient = createClient(sanityConfig);
export { sanityConfig };
