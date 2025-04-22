/**
 * Fully self-contained Mock Sanity Client
 * This implements a mock client without importing anything from '@sanity/client'
 */

// Define mock client interface
export interface MockClient {
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

// Sample mock data for specific pages
const MOCK_GIGS = [
  {
    _id: 'gig1',
    title: 'Website Redesign',
    description: 'Create a modern, responsive website for a service business',
    amount: 750,
    estimatedHours: 20,
    location: 'Remote',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    createdAt: '2023-11-15T14:30:00Z'
  },
  {
    _id: 'gig2',
    title: 'Content Creation for Blog',
    description: 'Write 5 SEO-optimized articles about financial management',
    amount: 250,
    estimatedHours: 10,
    location: 'Remote',
    skills: ['Content Writing', 'SEO', 'Research'],
    createdAt: '2023-11-16T09:15:00Z'
  },
  {
    _id: 'gig3',
    title: 'Logo Design for New Business',
    description: 'Create a professional logo for an accounting firm',
    amount: 350,
    estimatedHours: 8,
    location: 'Remote',
    skills: ['Graphic Design', 'Illustrator', 'Branding'],
    createdAt: '2023-11-17T11:00:00Z'
  }
];

// Create mock client with better data
const createMockClient = (): MockClient => ({
  fetch: async <T = any>(query: string): Promise<T[]> => {
    console.log('Mock Sanity fetch with query:', query);
    
    // Return appropriate mock data based on the query
    if (query.includes('*[_type == "gig"]')) {
      return MOCK_GIGS as unknown as T[];
    }
    
    // Default empty response
    return [] as T[];
  },
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

// Configuration interface (kept for compatibility)
export interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion?: string;
  token?: string;
  useCdn?: boolean;
}

// Export createClient function that always returns the mock
export const createClient = (_config: SanityConfig): MockClient => {
  console.log('Using fully isolated mock Sanity client - no external dependencies');
  return createMockClient();
};

// Export a default client instance for direct imports
export default createMockClient();