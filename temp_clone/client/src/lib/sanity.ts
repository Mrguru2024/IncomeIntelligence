/*
 * COMPLETE SANITY CLIENT REPLACEMENT
 * 
 * This is a proper mock implementation that provides all the necessary
 * interfaces to prevent the "Configuration must contain projectId" error
 * and other dependency issues.
 */

console.log("Loading mock Sanity client implementation");

// REQUIRED: This config MUST have projectId to avoid the specific error
export const config = {
  projectId: 'mock-project-id',
  dataset: 'production',
  apiVersion: '2023-11-01',
  useCdn: true
};

// Sample mock data for different content types
const MOCK_CONTENT = {
  gigs: [
    {
      _id: 'gig1',
      _type: 'gig',
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
      _type: 'gig',
      title: 'Content Creation for Blog',
      description: 'Write 5 SEO-optimized articles about financial management',
      amount: 250,
      estimatedHours: 10,
      location: 'Remote',
      skills: ['Content Writing', 'SEO', 'Research'],
      createdAt: '2023-11-16T09:15:00Z'
    }
  ],
  products: [
    {
      _id: 'product1',
      _type: 'product',
      name: 'Financial Planning Template',
      description: 'Comprehensive Excel template for tracking expenses',
      price: 29.99
    }
  ]
};

// Client implementation with detailed mock support
class SanityClient {
  config: typeof config;
  
  constructor(cfg = config) {
    this.config = { ...config, ...cfg };
    console.log(`[Mock Sanity] Initialized with projectId: ${this.config.projectId}`);
  }
  
  // Main query method
  async fetch(query: string, params?: Record<string, any>): Promise<any[]> {
    console.log(`[Mock Sanity] Query: ${query}`, params);
    
    // Super simple query parser to return appropriate mock data
    if (query.includes('*[_type == "gig"]')) {
      return MOCK_CONTENT.gigs;
    }
    
    if (query.includes('*[_type == "product"]')) {
      return MOCK_CONTENT.products;
    }
    
    return [];
  }
  
  // Document operations
  async getDocument(id: string): Promise<any | null> {
    // Search all content types for matching document
    for (const key of Object.keys(MOCK_CONTENT)) {
      const collection = MOCK_CONTENT[key as keyof typeof MOCK_CONTENT];
      const doc = collection.find((item: any) => item._id === id);
      if (doc) return doc;
    }
    return null;
  }
  
  async create(document: any): Promise<any> {
    const id = `mock-${Math.random().toString(36).substring(2, 9)}`;
    return { _id: id, _type: document._type || 'unknown' };
  }
  
  async createOrReplace(document: any): Promise<any> {
    return this.create(document);
  }
  
  // Document patching
  patch(id: string) {
    return {
      set: (data: any) => ({
        commit: async (): Promise<any> => ({ _id: id, ...data })
      }),
      unset: (keys: string[]) => ({
        commit: async (): Promise<any> => ({ _id: id })
      }),
      commit: async (): Promise<any> => ({ _id: id })
    };
  }
  
  async delete(id: string): Promise<any> {
    return { _id: id, _type: 'deleted' };
  }
  
  // Asset handling
  assets = {
    upload: async (type: string, file: any): Promise<any> => ({
      _id: `mock-asset-${Math.random().toString(36).substring(2, 9)}`,
      url: `https://example.com/mock-asset-${Date.now()}.jpg`
    })
  };
}

// Create the default client instance
export const client = new SanityClient();

// Function to create a new client (matches Sanity's API)
export function createClient(config: any = {}) {
  return new SanityClient(config);
}

// Export other commonly used functions and objects
export const sanityConfig = config;
export default client;

// Add to window to ensure it's available globally (helps with some import scenarios)
if (typeof window !== 'undefined') {
  (window as any).sanityClient = client;
  (window as any).sanityConfig = config;
}