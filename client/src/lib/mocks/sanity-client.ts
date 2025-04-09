/**
 * Mock Sanity Client
 * This provides a replacement for @sanity/client's createClient function
 * to prevent errors when the real Sanity client is not configured
 */

// Define mock client interface
interface MockClient {
  fetch: <T = any>(query: string) => Promise<T[]>;
  getDocument: <T = any>(id: string) => Promise<T | null>;
  create: <T = any>(document: any) => Promise<{ _id: string } & T>;
  createOrReplace: <T = any>(document: any) => Promise<{ _id: string } & T>;
  patch: (id: string) => {
    set: (data: any) => { commit: () => Promise<{ _id: string }> };
    unset: (keys: string[]) => { commit: () => Promise<{ _id: string }> };
    commit: () => Promise<{ _id: string }>;
  };
  delete: (id: string) => Promise<{ _id: string }>;
  assets: {
    upload: (type: string, file: any) => Promise<{ url: string }>;
  };
}

// Create mock client object with methods that return safe defaults
const createMockClient = (): MockClient => ({
  fetch: async <T = any>(_query?: string): Promise<T[]> => [],
  getDocument: async <T = any>(_id: string): Promise<T | null> => null,
  create: async <T = any>(_document: any): Promise<{ _id: string } & T> => ({ _id: 'mock-id' } as { _id: string } & T),
  createOrReplace: async <T = any>(_document: any): Promise<{ _id: string } & T> => ({ _id: 'mock-id' } as { _id: string } & T),
  patch: (_id: string) => ({
    set: (_data: any) => ({ commit: async (): Promise<{ _id: string }> => ({ _id: 'mock-id' }) }),
    unset: (_keys: string[]) => ({ commit: async (): Promise<{ _id: string }> => ({ _id: 'mock-id' }) }),
    commit: async (): Promise<{ _id: string }> => ({ _id: 'mock-id' })
  }),
  delete: async (_id: string): Promise<{ _id: string }> => ({ _id: 'mock-id' }),
  assets: {
    upload: async (_type: string, _file: any): Promise<{ url: string }> => ({ url: 'https://example.com/mock-asset.jpg' })
  }
});

// Configuration interface
interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion?: string;
  token?: string;
  useCdn?: boolean;
}

// Export createClient function that always returns the mock
export const createClient = (config: SanityConfig): MockClient => {
  console.log('Using mock Sanity client');
  return createMockClient();
};

// Export a default client instance for direct imports
export default createMockClient();