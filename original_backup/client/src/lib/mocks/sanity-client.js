/**
 * Mock Sanity Client
 * This provides a replacement for @sanity/client's createClient function
 * to prevent errors when the real Sanity client is not configured
 */

// Create mock client object with methods that return safe defaults
const createMockClient = () => ({
  fetch: async () => [],
  getDocument: async () => null,
  create: async () => ({ _id: 'mock-id' }),
  createOrReplace: async () => ({ _id: 'mock-id' }),
  patch: () => ({
    set: () => ({ commit: async () => ({ _id: 'mock-id' }) }),
    unset: () => ({ commit: async () => ({ _id: 'mock-id' }) }),
    commit: async () => ({ _id: 'mock-id' })
  }),
  delete: async () => ({ _id: 'mock-id' }),
  assets: {
    upload: async () => ({ url: 'https://example.com/mock-asset.jpg' })
  }
});

// Export createClient function that always returns the mock
export const createClient = (config) => {
  console.log('Using mock Sanity client');
  return createMockClient();
};

// Export a default client instance for direct imports
export default createMockClient();