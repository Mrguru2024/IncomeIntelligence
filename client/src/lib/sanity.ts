
import { createClient } from '@sanity/client';

const config = {
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: 'sklhlPEHDNeyktyXttfyrF9Ex7KH0UtkZm6rIRNbfaUNVwsWOGhNZiwdKdtpTZQ0GVZFrzu8vBXAZRff20R7Smj96wOICuk7A68KrY5aKn5AIKvD76XmbRwGxW1NeymEgnYyorF5XOkwMkwlL86RDWQSzKXc6T2izNYtecSKio3sYzWWQh21',
  useCdn: true,
};

let client;
try {
  if (!config.projectId) {
    throw new Error('Sanity projectId is required');
  }
  client = createClient(config);
} catch (error) {
  console.error('Failed to initialize Sanity client:', error);
  client = null;
}

export { client };
export const sanityConfig = config;

// Helper function to check if client is initialized
export const getSanityClient = () => {
  if (!client) {
    throw new Error('Sanity client not initialized');
  }
  return client;
};
