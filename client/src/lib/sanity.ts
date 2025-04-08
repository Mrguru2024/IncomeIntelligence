
import { createClient } from '@sanity/client';

// Initialize Sanity client with direct configuration
const client = createClient({
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true,
  token: 'sklhlPEHDNeyktyXttfyrF9Ex7KH0UtkZm6rIRNbfaUNVwsWOGhNZiwdKdtpTZQ0GVZFrzu8vBXAZRff20R7Smj96wOICuk7A68KrY5aKn5AIKvD76XmbRwGxW1NeymEgnYyorF5XOkwMkwlL86RDWQSzKXc6T2izNYtecSKio3sYzWWQh21'
});

export { client };
