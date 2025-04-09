/*
 * SANITY CLIENT REPLACEMENT
 * This is a clean replacement with no references to @sanity/client
 */

import { mockClient } from './mocks/sanity-client';

// Direct export of the mock client
export const client = mockClient;

// Empty config for compatibility
export const sanityConfig = {
  projectId: 'mock-project-id',
  dataset: 'mock-dataset',
  apiVersion: '2024-01-01',
  useCdn: true
};