
import { createClient } from '@sanity/client';

// Explicitly set the projectId and other configuration values
export const client = createClient({
  projectId: '5enbinz3', // Your Sanity project ID
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: 'sklhlPEHDNeyktyXttfyrF9Ex7KH0UtkZm6rIRNbfaUNVwsWOGhNZiwdKdtpTZQ0GVZFrzu8vBXAZRff20R7Smj96wOICuk7A68KrY5aKn5AIKvD76XmbRwGxW1NeymEgnYyorF5XOkwMkwlL86RDWQSzKXc6T2izNYtecSKio3sYzWWQh21',
  useCdn: true,
});
