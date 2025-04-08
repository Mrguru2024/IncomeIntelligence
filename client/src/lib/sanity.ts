
import { createClient } from '@sanity/client';

// Get environment variables
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET;
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION;
const token = import.meta.env.VITE_SANITY_TOKEN;

if (!projectId) {
  console.error('Sanity projectId is missing from environment variables');
}

const config = {
  projectId: projectId || '5enbinz3', // Fallback for development
  dataset: dataset || 'production',
  apiVersion: apiVersion || '2023-05-03',
  token: token || 'sklhlPEHDNeyktyXttfyrF9Ex7KH0UtkZm6rIRNbfaUNVwsWOGhNZiwdKdtpTZQ0GVZFrzu8vBXAZRff20R7Smj96wOICuk7A68KrY5aKn5AIKvD76XmbRwGxW1NeymEgnYyorF5XOkwMkwlL86RDWQSzKXc6T2izNYtecSKio3sYzWWQh21',
  useCdn: true,
};

// Initialize client with error handling
let client;
try {
  client = createClient(config);
} catch (error) {
  console.error('Failed to initialize Sanity client:', error);
  throw new Error('Sanity client initialization failed');
}

export { client };
