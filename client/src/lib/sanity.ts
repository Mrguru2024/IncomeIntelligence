
import { createClient } from '@sanity/client';

const config = {
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: 'sklhlPEHDNeyktyXttfyrF9Ex7KH0UtkZm6rIRNbfaUNVwsWOGhNZiwdKdtpTZQ0GVZFrzu8vBXAZRff20R7Smj96wOICuk7A68KrY5aKn5AIKvD76XmbRwGxW1NeymEgnYyorF5XOkwMkwlL86RDWQSzKXc6T2izNYtecSKio3sYzWWQh21',
  useCdn: true,
};

// Validate config before creating client
if (!config.projectId) {
  throw new Error('Sanity projectId is required');
}

export const client = createClient(config);

// Export config for reuse if needed
export const sanityConfig = config;
