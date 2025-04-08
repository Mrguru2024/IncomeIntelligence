
import { createClient } from '@sanity/client';

// First check Vite env variables, then fallback to process.env
const projectId = process.env.VITE_SANITY_PROJECT_ID || '5enbinz3';
const dataset = process.env.VITE_SANITY_DATASET || 'production';
const apiVersion = process.env.VITE_SANITY_API_VERSION || '2023-05-03';
const token = process.env.VITE_SANITY_TOKEN || 'sklhlPEHDNeyktyXttfyrF9Ex7KH0UtkZm6rIRNbfaUNVwsWOGhNZiwdKdtpTZQ0GVZFrzu8vBXAZRff20R7Smj96wOICuk7A68KrY5aKn5AIKvD76XmbRwGxW1NeymEgnYyorF5XOkwMkwlL86RDWQSzKXc6T2izNYtecSKio3sYzWWQh21';

// Log environment variables in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Sanity Config:', { projectId, dataset, apiVersion });
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: process.env.NODE_ENV === 'production',
});
