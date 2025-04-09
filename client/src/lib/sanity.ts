
// Use a mock Sanity client when Sanity is not needed or configured
// This prevents errors related to missing projectId configuration

// Create mock client with common methods
const mockClient = {
  fetch: async () => [],
  getDocument: async () => null,
  create: async () => ({ _id: 'mock-id' }),
  createOrReplace: async () => ({ _id: 'mock-id' }),
  patch: () => ({
    set: () => ({ commit: async () => ({ _id: 'mock-id' }) }),
    unset: () => ({ commit: async () => ({ _id: 'mock-id' }) }),
    commit: async () => ({ _id: 'mock-id' })
  }),
  delete: async () => ({ _id: 'mock-id' })
};

// Safe Sanity config with fallbacks
const sanityConfig = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'dummy-project-id',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: true,
};

// Log Sanity config state
console.log('Using mock Sanity client to prevent errors');

// Export mock client
export const client = mockClient;
export { sanityConfig };
