/*
 * SANITY CLIENT REPLACEMENT
 * This is a clean replacement with no references to @sanity/client
 */

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
export const mockClient = {
  fetch: async (query: string): Promise<any[]> => {
    console.log('Mock Sanity fetch with query:', query);
    
    // Return appropriate mock data based on the query
    if (query.includes('*[_type == "gig"]')) {
      return MOCK_GIGS;
    }
    
    // Default empty response
    return [];
  },
  getDocument: async (_id: string): Promise<any | null> => null,
  create: async (_document: any): Promise<any> => ({ _id: 'mock-id' }),
  createOrReplace: async (_document: any): Promise<any> => ({ _id: 'mock-id' }),
  patch: (_id: string) => ({
    set: (_data: any) => ({ commit: async (): Promise<any> => ({ _id: 'mock-id' }) }),
    unset: (_keys: string[]) => ({ commit: async (): Promise<any> => ({ _id: 'mock-id' }) }),
    commit: async (): Promise<any> => ({ _id: 'mock-id' })
  }),
  delete: async (_id: string): Promise<any> => ({ _id: 'mock-id' }),
  assets: {
    upload: async (_type: string, _file: any): Promise<any> => ({ url: 'https://example.com/mock-asset.jpg' })
  }
};

// Export createClient function that always returns the mock
export const createClient = (): typeof mockClient => {
  return mockClient;
};

// Export a default client instance for direct imports
export default mockClient;