
import { createClient } from '@sanity/client';

// Create Sanity client with hardcoded config for development
export const client = createClient({
  projectId: '5enbinz3',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: process.env.NODE_ENV === 'production' 
    ? import.meta.env.VITE_SANITY_TOKEN 
    : 'sklhlPEHDNeyktyXttfyrF9Ex7KH0UtkZm6rIRNbfaUNVwsWOGhNZiwdKdtpTZQ0GVZFrzu8vBXAZRff20R7Smj96wOICuk7A68KrY5aKn5AIKvD76XmbRwGxW1NeymEgnYyorF5XOkwMkwlL86RDWQSzKXc6T2izNYtecSKio3sYzWWQh21',
  useCdn: false
});

export default client;
